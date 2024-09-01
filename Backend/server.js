const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const User = require("./Models/Users");
const FormDetails = require("./Models/FormDetails");
const Emergency = require("./Models/Emergency");
const OpenAI = require('openai');
const fs = require("fs");
const multer = require('multer');

require('dotenv').config();

const app = express();

let languageCode = null;
let history = [];
let messagesHistory = [];

// Middleware
app.use(bodyParser.json());
app.use(cors());

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));

const openai = new OpenAI();

const detectLanguage = async (query) => {
  try{
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Return the ISO 639-1 alpha 2 language code only. Answer must only have 2 characters." },
        { role: "user", content: query}
      ]});
    console.log(completion.choices[0].message.content);  
    return completion.choices[0].message.content;
  }
  catch (e){
    console.error(e);
  }
};

const handleTouristQueryWithContext = async (query, languageCode) => {
  const context = history.join('|');
  let systemPrompt = `You are an insightful tourist assistant based in Sri Lanka. You must answer in ${languageCode} which is an ISO 639-1 alpha 2 language code.`;
  if (history.length > 0) {
      systemPrompt += ` No greetings required. Recent questions: ${context}.`;
  }
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt},
        { role: "user", content: query}
      ]});

      const answer = response.choices[0].message.content;
      history.push(query);
      if (history.length > 3) {
          history = history.slice(-3);
      }
      return answer;

  } catch (error) {
      console.error('Error handling query:', error);
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')  // Save files in the 'uploads' directory
  },
  filename: function (req, file, cb) {
    // Rename the file to include the timestamp (to avoid name conflicts)
    cb(null, file.originalname)
  }
});
const upload = multer({ storage: storage });

app.post('/transcribe', upload.single('audioFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream('uploads/recording.m4a'),
      model: "whisper-1",
      response_format: "text",
    });
    console.log(transcription);
    return res.status(200).json({"Result": transcription});
  } catch (error) {
  console.error('Error while transcribing:', error);
}});

// User login endpoint
app.post("/login", async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username: username });
    if (user) {
      console.log(user.id);
      res.status(200).json({ message: "Login successful", user: user.id });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error: error });
  }
});

// Getting already filled formData endpoint
app.post("/formData", async (req, res) => {
  const { userId } = req.body;
  try {
    const formData = await FormDetails.findOne({ userId: userId });
    if (!formData) {
      return res
        .status(404)
        .json({ message: "Form data not found for the given user ID" });
    }
    res.json(formData);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving form data", error: error.message });
  }
});

// Form submission endpoint
app.post("/submit-form", async (req, res) => {
  const formData = new FormDetails(req.body);
  try {
    await formData.save();
    res.status(200).json({ message: "Form data saved successfully." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error saving form data", error: error.message });
  }
});

// Form delete endpoint
app.delete("/delete-form", async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  try {
    const result = await FormDetails.findOneAndDelete({ userId: userId });
    if (!result) {
      return res
        .status(404)
        .json({ message: "Form data not found for the given user" });
    }
    res.status(200).json({ message: "Form data deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting form data", error: error.message });
  }
});

// Form edit endpoint
app.put("/edit-form", async (req, res) => {
  const { userId } = req.body;
  console.log(userId);
  try {
    const formData = await FormDetails.findOne({ userId: userId });
    if (!formData) {
      return res
        .status(404)
        .json({ message: "Form data not found for the given user ID" });
    }
    formData.name = req.body.name || formData.name;
    formData.arriveDate = req.body.arriveDate || formData.arriveDate;
    formData.district = req.body.district || formData.district;
    formData.contactNo = req.body.contactNo || formData.contactNo;
    formData.passportId = req.body.passportId || formData.passportId;
    formData.emergencyNo = req.body.emergencyNo || formData.emergencyNo;
    formData.comment = req.body.comment || formData.comment;
    formData.likesTracking =
      req.body.likesTracking !== undefined
        ? req.body.likesTracking
        : formData.likesTracking;

    await formData.save();
    res.status(200).json({ message: "Form updated successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating form data", error: error.message });
  }
});

// Emergency declaring endpoint
app.post("/emergency-declare", async (req, res) => {
  try {
    const { userId, latitude, longitude, onGoingEmergency } = req.body;
    const newEmergency = new Emergency({
      userId,
      location: { latitude, longitude },
      onGoingEmergency,
    });

    await newEmergency.save();
    console.log(newEmergency);
    res.status(201).send({
      message: "Emergency declared successfully!",
      data: newEmergency,
    });
  } catch (error) {
    res
      .status(400)
      .send({ message: "Failed to declare emergency", error: error.message });
  }
});

// Emergency message endpoint
app.put("/emergency-message", async (req, res) => {
  const { userId, message } = req.body;
  console.log(userId);

  if (!message) {
    return res.status(400).json({ message: "No message provided" });
  }

  try {
    const updatedEmergency = await Emergency.findOneAndUpdate(
      { userId: userId, onGoingEmergency: true },
      { $push: { message: message } },
      { new: true, runValidators: true }
    );

    if (!updatedEmergency) {
      return res
        .status(404)
        .json({ message: "Emergency not found for the given user ID" });
    }

    res
      .status(200)
      .json({ message: "Message added successfully", data: updatedEmergency });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to update emergency", error: error.message });
  }
});

// Cancel emergency endpoint
app.put("/emergency-cancel", async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const updatedEmergency = await Emergency.findOneAndUpdate(
      { userId: userId, onGoingEmergency: true },
      { $set: { onGoingEmergency: false } },
      { new: true }
    );

    if (!updatedEmergency) {
      return res
        .status(404)
        .json({ message: "No ongoing emergency found for this user." });
    }

    res.status(200).json({
      message: "Emergency cancelled successfully",
      data: updatedEmergency,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to cancel emergency", error: error.message });
  }
});

// Getting on going emergencies endpoint
app.get("/emergency-ongoing", async (req, res) => {
  const { lastPolledAt } = req.query;  // expecting a timestamp in the query

  try {
    const query = {
      onGoingEmergency: true,
      dateTimeDeclared: { $gt: lastPolledAt }
    };

    const emergencies = await Emergency.find({ onGoingEmergency: true })
      .populate({
        path: "userId",
        select: "username -_id",
      })
      .select("location dateTimeDeclared message -_id")
      .exec();

    const transformedEmergencies = emergencies.map((emergency) => ({
      location: emergency.location,
      dateTimeDeclared: emergency.dateTimeDeclared,
      message: emergency.message,
      username: emergency.userId.username,
    }));

    res.status(200).json(transformedEmergencies);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "An error occurred while retrieving the data",
        error: error,
      });
  }
});

// Emergency call endpoint
app.post('/emergency-call', async (req, res) => {
  const { userId } = req.body;
  try {
    const userDetails = await FormDetails.findOne({ userId: userId });
    if (!userDetails) {
      console.log("No user found with the given userId");
      return res.status(404).json("User not found");
    }
    console.log(userDetails.emergencyNo);
    res.json({ emergencyNo: userDetails.emergencyNo });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json(error);
  }
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  const userInput = req.body;
  if (!languageCode) {
      languageCode = await detectLanguage(userInput.message);
  }
  const response = await handleTouristQueryWithContext(userInput.message, languageCode);
  console.log(history.join('|'));
  console.log(response);
  if (messagesHistory.length < 2) {
    messagesHistory.push({
      text: userInput.message,
      user: { _id: 1, name: 'User' },
      createdAt: new Date()
    });

    messagesHistory.push({
      text: response,
      user: { _id: 2, name: 'Assistant' },
      createdAt: new Date()
    });
  }
  res.json({ text: response, user: { _id: 2, name: 'Assistant' } });
});

// Language-Change endpoint
app.get('/language', async (req, res) => {
  if (languageCode) {
    res.status(200).json(languageCode)
  }
  else{
    res.status(404).json({ error: "Language code not set" });
  }
})

// Endpoint to save messages
app.post('/save-messages', (req, res) => {
  if (!req.body.messages) {
    return res.status(400).json({ error: 'Missing messages in the request body' });
  }
  if (!Array.isArray(req.body.messages)) {
    return res.status(400).json({ error: 'messages must be an array' });
  }
  const isValid = req.body.messages.every(msg => msg._id && msg.text && msg.user);
  if (!isValid) {
    return res.status(400).json({ error: 'Each message must have an _id, text, and user' });
  }
  res.status(200).json({ message: 'Messages saved successfully' });
  console.log('Messages saved successfully');
});

// Endpoint to load messages
app.get('/load-messages', (req, res) => {
  if (messagesHistory.length === 0) {
    res.status(404).json({ error: "No messages found" });
    console.log(error);
  } else {
    res.status(200).json(messagesHistory.slice(0, 4));
  }
});

// Listen on a port
const PORT = process.env.PORT || 5060;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const User = require("./Models/Users");
const FormDetails = require("./Models/FormDetails");
const Emergency = require("./Models/Emergency");
const openai = require('openai-api');

require('dotenv').config();

const app = express();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openAI = new openai(OPENAI_API_KEY);
let languageCode = null;
let history = [];

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

// ChatBot
const detectLanguage = async (query) => {
  try {
      const response = await openAI.complete({
          engine: 'gpt-3.5-turbo',
          prompt: query,
          maxTokens: 2
      });
      const language = response.choices[0].text.trim();
      return language;
  } catch (error) {
      console.error('Error detecting language:', error);
  }
};

const handleTouristQueryWithContext = async (query, languageCode) => {
  const context = history.join('|');
  let systemPrompt = `You are an insightful tourist assistant based in Sri Lanka. You must answer in ${languageCode}.`;
  if (history.length > 0) {
      systemPrompt += ` No greetings required. Recent questions: ${context}.`;
  }

  try {
      const response = await openAI.complete({
          engine: 'gpt-3.5-turbo',
          prompt: `${systemPrompt}\n${query}`,
          maxTokens: 150
      });

      const answer = response.choices[0].text.trim();
      history.push(query);
      if (history.length > 3) {
          history = history.slice(-3);
      }
      return answer;
  } catch (error) {
      console.error('Error handling query:', error);
  }
};

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
  console.log('Message received:', userInput);
  if (!languageCode) {
      languageCode = await detectLanguage(userInput);
  }
  const response = await handleTouristQueryWithContext(userInput, languageCode);
  res.json({ text: response, user: { _id: 2, name: 'Server' } });
});
// app.post('/chat', (req, res) => {
//   console.log('Message received:', req.body.message); // Log the received message
//   res.json({ text: 'How can I help you?', user: { _id: 2, name: 'Server' } }); // Respond with "bye"
// });

// Listen on a port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

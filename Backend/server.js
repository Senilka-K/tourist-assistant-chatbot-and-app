const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const User = require("./Models/Users");
const FormDetails = require("./Models/FormDetails");
const Emergency = require("./Models/Emergency");

require('dotenv').config();

const app = express();

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
  try {
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

// Listen on a port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

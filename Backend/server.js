// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const FormDetail = require('./Models/FormDetails');
// const User = require('./Models/Users');

// const app = express();

// // Middleware
// app.use(bodyParser.json());
// app.use(cors());

// mongoose.connect('mongodb+srv://senilka0108:abcd4321@cluster0.r55v5qx.mongodb.net/tourist_app?retryWrites=true&w=majority&appName=Cluster0/', { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Connected to MongoDB Atlas'))
//   .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

//   // app.get('/users', async (req, res) => {
//   //   try {
//   //     const users = await User.find(); // Find all users in the database
//   //     console.log('Users found:', users);
//   //     res.json(users); // Send users as JSON response
//   //   } catch (error) {
//   //     res.status(500).json({ message: 'Error retrieving users', error: error });
//   //   }
//   // });

//   // app.post('/add-user', async (req, res) => {
//   //   try {
//   //     // Create a new user using the data in the request body
//   //     const newUser = new User(req.body);

//   //     // Save the user to the database
//   //     await newUser.save();

//   //     // Send back the created user
//   //     res.status(201).json(newUser);
//   //   } catch (error) {
//   //     res.status(500).json({ message: 'Error creating the user', error: error });
//   //   }
//   // });

// //   app.post('/check-username', async (req, res) => {
// //     const { username } = req.body; // Get the username from query parameters
// //     if (!username) {
// //         return res.status(400).json({ message: 'Username is required' });
// //     }

// //     try {
// //         const user = await User.findOne({ username: username }); // Find user by username
// //         if (user) {
// //             res.json({ exists: true, message: 'Username exists' });
// //         } else {
// //             res.json({ exists: false, message: 'Username does not exist' });
// //         }
// //     } catch (error) {
// //         res.status(500).json({ message: 'Error checking username', error: error });
// //     }
// // });

// // app.get('/form/:userId', async (req, res) => {
// //   try {
// //     const userId = req.params.userId;
// //     const formDetail = await FormDetail.findOne({ userId }).populate('userId');
// //     if (formDetail) {
// //       res.json({ filled: true, formData: formDetail });
// //     } else {
// //       res.json({ filled: false });
// //     }
// //   } catch (error) {
// //     res.status(500).send(error);
// //   }
// // });

// // // Endpoint to handle form submission
// // app.post('/form', async (req, res) => {
// //   try {
// //     const { userId, name, arriveDate, district, contactNo, passportId, emergencyNo, comment, likesTracking } = req.body;

// //     // Check if the form already exists for the user
// //     const existingForm = await FormDetail.findOne({ userId });
// //     if (existingForm) {
// //       return res.status(400).json({ message: "Form already submitted for this user." });
// //     }

// //     const newFormDetail = new FormDetail({
// //       userId,
// //       name,
// //       arriveDate,
// //       district,
// //       contactNo,
// //       passportId,
// //       emergencyNo,
// //       comment,
// //       likesTracking
// //     });

// //     await newFormDetail.save();
// //     res.status(201).json({ message: "Form submitted successfully!", formData: newFormDetail });
// //   } catch (error) {
// //     res.status(500).send(error);
// //   }
// // });

// // app.post('/form-details', async (req, res) => {
// //   const { username } = req.body; // Extract username from the request body

// //   if (!username) {
// //     return res.status(400).json({ message: 'Username is required' });
// //   }

// //   try {
// //     // Check if the user exists
// //     const user = await User.findOne({ username: username });
// //     if (!user) {
// //       return res.status(404).json({ message: 'User not found' }); // Return an error if no user is found
// //     }

// //     // Check if form details for this user already exist
// //     const existingFormDetails = await FormDetail.findOne({ userId: user._id });
// //     if (existingFormDetails) {
// //       return res.status(200).json({
// //         message: 'Form details already submitted',
// //         data: existingFormDetails
// //       }); // Return existing form details if found
// //     }

// //     // If no existing form details, create new form details
// //     const formDetails = new FormDetail({
// //       ...req.body,
// //       userId: user._id // Save the user's ID with the form details
// //     });

// //     await formDetails.save();
// //     res.status(201).json({ message: 'Form details saved successfully', data: formDetails });
// //   } catch (error) {
// //     res.status(400).json({ message: 'Failed to save form details', error: error });
// //   }
// // });

// // Listen on a port
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const User = require("./Models/Users");
const FormDetails = require("./Models/FormDetails");
const Emergency = require("./Models/Emergency");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

mongoose
  .connect(
    "mongodb+srv://senilka0108:abcd4321@cluster0.r55v5qx.mongodb.net/tourist_app?retryWrites=true&w=majority&appName=Cluster0/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));

// Add User endpont
app.post("/add-user", async (req, res) => {
  try {
    // Create a new user using the data in the request body
    const newUser = new User(req.body);

    // Save the user to the database
    await newUser.save();

    // Send back the created user
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Error creating the user", error: error });
  }
});

// Check username endpoint
  app.post('/check-username', async (req, res) => {
    const { username } = req.body; // Get the username from query parameters
    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    try {
        const user = await User.findOne({ username: username }); // Find user by username
        if (user) {
            res.json({ exists: true, message: 'Username exists' });
        } else {
            res.json({ exists: false, message: 'Username does not exist' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error checking username', error: error });
    }
});

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

// Already filled formData getting endpoint
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

// Form submition endpoint
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

//Form edit endpoint
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
    res
      .status(201)
      .send({
        message: "Emergency declared successfully!",
        data: newEmergency,
      });
  } catch (error) {
    res
      .status(400)
      .send({ message: "Failed to declare emergency", error: error.message });
  }
});

// Emergency massage endpoint
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

    res
      .status(200)
      .json({
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

// On going emergencies getting endpoint
app.get('/emergency-ongoing', async (req, res) => {
  try {
    const emergencies = await Emergency.find({ onGoingEmergency: true })
      .populate({
        path: 'userId',        
        select: 'username -_id'
      })
      .select('location dateTimeDeclared message -_id')
      .exec();

    const transformedEmergencies = emergencies.map(emergency => ({
      location: emergency.location,
      dateTimeDeclared: emergency.dateTimeDeclared,
      message: emergency.message,
      username: emergency.userId.username
    }));

    res.status(200).json(transformedEmergencies);
  } catch (error) {
    res.status(500).json({ message: "An error occurred while retrieving the data", error: error });
  }
});

// app.get('/emergency-ongoing', async (req, res) => {
//   try {
//     const emergencies = await Emergency.find({ onGoingEmergency: true })
//       .select('userId location dateTimeDeclared message -_id')
//       .exec();

//     res.status(200).json(emergencies);
//   } catch (error) {
//     res.status(500).json({ message: "An error occurred while retrieving the data", error: error });
//   }
// });

// // Delete emergency endpoint
// app.delete('/emergency-delete', async (req, res) => {
//   const { userId } = req.body;
//   if (!userId) {
//     return res.status(400).json({ message: 'User ID is required' });
//   }
//   try {
//     const result = await Emergency.findOneAndDelete({ userId: userId });
//     if (!result) {
//       return res.status(404).json({ message: 'Emergency not found for the given user' });
//     }
//     res.status(200).json({ message: 'Emergency deleted successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error deleting Emergency', error: error.message });
//   }
// });

// Listen on a port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

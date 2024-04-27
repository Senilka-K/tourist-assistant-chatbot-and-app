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

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./Models/Users');
const FormDetails = require('./Models/FormDetails')

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb+srv://senilka0108:abcd4321@cluster0.r55v5qx.mongodb.net/tourist_app?retryWrites=true&w=majority&appName=Cluster0/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

// User login endpoint
app.post('/login', async (req, res) => {
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

app.get('/formData', async (req, res) => {
  const { userId } = req.body; 
  try {
    const formData = await FormDetails.findOne({ userId: userId });
    if (!formData) {
      return res.status(404).json({ message: 'Form data not found for the given user ID' });
    }
    res.json(formData);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving form data', error: error.message });
  }
});

app.post('/submit-form', async (req, res) => {
  const formData = new FormDetails(req.body);
  try {
    await formData.save();
    res.status(200).json({ message: 'Form data received successfully.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error saving form data', error: error.message });
  }
});

// Listen on a port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


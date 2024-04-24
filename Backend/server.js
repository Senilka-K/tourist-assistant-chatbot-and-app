// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();

// // Middleware
// app.use(bodyParser.json());
// app.use(cors());

// // MongoDB connection
// mongoose.connect('mongodb+srv://senilka0108:abcd4321@cluster0.r55v5qx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

// // Listen on a port
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();

// // Middleware
// app.use(bodyParser.json());
// app.use(cors());

// // MongoDB connection
// mongoose.connect('mongodb+srv://senilka0108:abcd4321@cluster0.r55v5qx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

// // Define User Schema
// const userSchema = new mongoose.Schema({
//     username: { type: String, required: true },
// });

// // Create User Model
// // If your collection name is something different, specify it as the third argument
// const User = mongoose.model('User', userSchema, 'users');

// // Login Endpoint
// app.post('/login', async (req, res) => {
//     const { username } = req.body;

//     try {
//         const user = await User.findOne({ username });
//         if (user) {
//             res.status(200).json({ message: `${username} logged in successfully` });
//         } else {
//             res.status(404).json({ message: 'User does not exist' });
//         }
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });

// // Listen on a port
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const FormDetail = require('./FormDetails');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb+srv://senilka0108:abcd4321@cluster0.r55v5qx.mongodb.net/tourist_app?retryWrites=true&w=majority&appName=Cluster0/', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

  // const users = new mongoose.Schema({
  //   name: String,
  //   email: String,
  //   age: Number
  // });
  
  // const User = mongoose.model('User', users);
  
  const UserSchema = new mongoose.Schema({
    username: String,
  });
  
  const User = mongoose.model('User', UserSchema, 'users');
  
  app.get('/users', async (req, res) => {
    try {
      const users = await User.find(); // Find all users in the database
      console.log('Users found:', users);
      res.json(users); // Send users as JSON response
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving users', error: error });
    }
  });

  app.post('/add-user', async (req, res) => {
    try {
      // Create a new user using the data in the request body
      const newUser = new User(req.body);
  
      // Save the user to the database
      await newUser.save();
  
      // Send back the created user
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ message: 'Error creating the user', error: error });
    }
  });

  app.get('/check-username', async (req, res) => {
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

app.post('/form-details', async (req, res) => {
  const { username } = req.body; // Extract username from the request body

  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    // First check if the user exists
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); // Return an error if no user is found
    }

    // If user exists, attach user ID to the form details and save
    const formDetails = new FormDetail({
      ...req.body,
      userId: user._id // Assuming you want to save the user's ID with the form details
    });

    await formDetails.save();
    res.status(201).json({ message: 'Form details saved successfully', data: formDetails });
  } catch (error) {
    res.status(400).json({ message: 'Failed to save form details', error: error });
  }
});


// Listen on a port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/nutrilink', { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  email: String,
  password: String,
}));

// Sign up route
app.post('/api/signup', async (req, res) => {
    try {
      const { username, email, password } = req.body;
  
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists with this email.' });
      }
  
      const user = new User({ username, email, password });
      await user.save();
  
      res.json({ success: true, message: 'User signed up successfully!' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found.' });
      }
  
      // Assuming you're storing passwords in plaintext, this check might need to be hashed
      if (user.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid password.' });
      }
  
      res.json({ success: true, message: 'Login successful!' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  


app.listen(5000, () => console.log('Server started at http://localhost:5000'));

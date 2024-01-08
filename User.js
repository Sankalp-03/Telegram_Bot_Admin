// User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  username: String,
  firstName: String,
  lastName: String,
  // Add other fields as needed
});

const User = mongoose.model('User', userSchema);

module.exports = User;

// db.js
const mongoose = require('mongoose');

// Replace `YOUR_MONGODB_URI` with your MongoDB connection string
const uri = 'mongodb+srv://sankalpdwiv49:minor123@cluster0.lrprjjv.mongodb.net/TeleGram_Bot?retryWrites=true&w=majority';

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB!');
});

module.exports = db;

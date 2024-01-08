// Require necessary modules
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();
const db = require('./db'); // Path to db.js
const User = require('./User'); // Path to User.js
app.set('view engine', 'ejs');
app.use(express.static('public'));
dotenv.config();
const BASE_PORT = process.env.BASE_PORT;
const BASE_URL = process.env.BASE_URL;
app.use(session({
    secret: 'sankalp', // Replace with your own secret key for session encryption
    resave: false,
    saveUninitialized: false
  }));
  
  passport.use(new GoogleStrategy({
    clientID: '648173678311-8sg2rk9d3k48tf9j7fupicermd8fgluq.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: `${BASE_URL}/auth/google/callback`
  },
  (accessToken, refreshToken, profile, done) => {
    if (profile.emails && profile.emails[0].value === 'sankalpdwiv49@gmail.com') {
      return done(null, profile);
    } else {
      return done(null, false, { message: 'You are not an admin.' });
    }
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
  
  // Redirect to Google's authentication page
  app.get('/', (req, res) => {
    res.render('index'); // Render the index.ejs file
  });
  
  // Redirect to Google's authentication page when login button is clicked
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  
  // Google OAuth callback route
  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/not-admin' }),
    (req, res) => {
      // Successful authentication, redirect to appropriate route based on user's status
      if (req.user) {
        res.redirect('/users');
      } else {
        res.redirect('/not-admin');
      }
    });
  
  // Route for non-admin users
  app.get('/not-admin', (req, res) => {
    // res.send('You are not an admin, hence cannot access the admin panel.');
    res.render('not-admin');
});
// Route for fetching and displaying users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.render('users', { users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Error fetching users');
  }
});
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Route for deleting a user
app.delete('/users/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const deletedUser = await User.findOneAndDelete({ userId });
    if (deletedUser) {
      console.log('User deleted:', deletedUser);
      res.redirect('/users'); // Redirect back to the user list page
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).send('Error deleting user');
  }
});
app.get('/bot-settings', (req, res) => {
    // Render the bot settings form here
    res.render('bot-settings');
  });
  
app.post('/bot-settings', async (req, res) => {
    // Retrieve and update bot API keys
    const { apiKey } = req.body; // Assuming you have a form field with the name 'apiKey'
  
    try {
      // Update the bot settings in the database
      // Example: Update the apiKey field in the settings collection
      // Replace this with your actual database update logic
      // await Settings.updateOne({}, { $set: { apiKey } });
  
      // Redirect back to bot settings with success message
      res.redirect('/bot-settings');
    } catch (err) {
      console.error('Error updating bot settings:', err);
      res.status(500).send('Error updating bot settings');
    }
});
// Start the Express server
const server = app.listen(BASE_PORT, () => {
  console.log(`Server is running on port ${BASE_PORT}`);
});
// Telegram Bot token
const token = '6776721493:AAEAUkFG8Xvbl-DZuH_T3sOZqtLq62_8vlA'; // Replace with your bot token
const bot = new TelegramBot(token, { polling: true });

// Handle incoming messages
bot.on('message', async (message) => {
    const { chat, from } = message;
  
    try {
      let user = await User.findOne({ userId: from.id.toString() });
  
      if (!user) {
        // If user doesn't exist, create a new user
        user = new User({
          userId: from.id.toString(),
          username: from.username,
          firstName: from.first_name,
          lastName: from.last_name,
          // Add other fields as needed
        });
  
        // Save the new user to the database
        const savedUser = await user.save();
        console.log('New user saved:', savedUser);
      } else {
        console.log('User already exists');
      }
    } catch (err) {
      console.error('Error handling user:', err);
    }
  
    // Your bot's message handling logic
    // bot.sendMessage(chat.id, 'Received your message!');
  });
  
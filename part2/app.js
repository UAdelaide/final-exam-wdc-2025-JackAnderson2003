const express = require('express');
const path = require('path');

const session = require('express-session'); // added session middleware 

require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));


// added middleware which allows my website to store data between differnt http requests 
app.use(session({
  secret: 'doggogoesBARKBARKBARK',  //this is used to sign in the session id cookie
   resave: false, // adds session option to avoid unnesacary saves 
   saveUninitialized: true //saves new session even if empty 
}));




// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;
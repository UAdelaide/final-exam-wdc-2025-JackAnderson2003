const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {     
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});


// Added and modified post login to store session
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(`
      SELECT user_id, username, role FROM Users
      WHERE username = ? AND password_hash = ?
    `, [username, password]); //query now checks username and password instead of email and password 

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Little bro youre either hacking or forgot your login stuff' }); //this ensures an error is sent if no user is found
    }

    
    req.session.user = rows[0]; // this stores the user in a session  

    res.json({ message: 'Yay youre logged in. Have fun with these dogs', user: rows[0] }); //this responds with user info 
  } catch (error) {
    res.status(500).json({ error: 'Unlucky champ login failed and no dogs for you' }); //error responce 
  }
});

// Ive added a logout route to handle user logout requests 
router.post('/logout', (req, res) => {
  //destroys the session data on the server 
  req.session.destroy(err => {
    if (err) {
      //logs any errors during session destruction and returns 500 error if error occurs
      console.error('Unlucky champ logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); 
    //responds to the client confirming logout success 
    return res.json({ message: 'Logged out successfully' });
  });
});


module.exports = router;
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

let db;

(async () => {
    try {
        db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'DogWalkService'
        });



        await db.execute
        (`INSERT IGNORE INTO Users (user_id, username, email, password_hash, role, created_at) VALUES
      (1, 'alice123', 'alice@example.com', 'hashed123', 'owner', '2025-06-20 10:58:00'),
      (2, 'bobwalker', 'bob@example.com', 'hashed456', 'walker', '2025-06-20 11:01:41'),
      (6, 'carol123', 'carol@example.com', 'hashed789', 'owner', '2025-06-20 11:06:27'),
      (7, 'fortnite1', 'fortnirw@example.com', 'hashed343', 'owner', '2025-06-20 11:09:22'),
      (8, 'cringe123', 'cringe@example.com', 'cringe111', 'walker', '2025-06-20 11:10:31')`);

        await db.execute
        (`INSERT IGNORE INTO Dogs (dog_id, owner_id, name, size) VALUES
      (1, 1, 'Max', 'medium'),
      (2, 6, 'Bella', 'small'),
      (3, 7, 'dug', 'large'),
      (4, 1, 'Minga', 'medium'),
      (5, 7, 'riskyreels', 'small')`);

        await db.execute
        (`INSERT IGNORE INTO WalkRequests (request_id, dog_id, requested_time, duration_minutes, location, status, created_at) VALUES
      (1, 1, '2025-06-10 08:00:00', 30, 'Parklands', 'open', '2025-06-20 11:19:07'),
      (2, 2, '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted', '2025-06-20 11:19:07'),
      (3, 5, '2025-06-11 07:00:00', 10, 'Retail Row', 'open', '2025-06-20 11:19:07'),
      (4, 4, '2025-06-11 18:00:00', 35, 'Minga Ville', 'completed', '2025-06-20 11:19:07'),
      (5, 1, '2025-06-12 10:00:00', 23, 'BrrBrr Patapim Village', 'cancelled', '2025-06-20 11:19:07')`);


    } catch (err) {
        console.error('Error', err);
    }
})();

app.get
('/', (req, res) => {
    res.send('Welcome, I hope you like doggos as much as I do lol');
});

app.get
('/api/dogs', async (req, res) => {
    try {
        const [rows] = await db.execute(`
      SELECT d.name AS dog_name, d.size, u.username AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
    `);
        res.json(rows);
    } catch {
        res.status(500).json({ error: 'RIP no dogs (failed)' });
    }
});

app.get
('/api/walkrequests/open', async (req, res) => {
    try {
        const [rows] = await db.execute(`
      SELECT wr.request_id, d.name AS dog_name, wr.requested_time, wr.duration_minutes, wr.location, u.username AS owner_username
      FROM WalkRequests wr
      JOIN Dogs d ON wr.dog_id = d.dog_id
      JOIN Users u ON d.owner_id = u.user_id
      WHERE wr.status = 'open'
    `);
        res.json(rows);
    } catch {
        res.status(500).json({ error: 'RIP no walks (Failed)' });
    }
});

app.get('/api/walkers/summary', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT u.username AS walker_username, COUNT(wr.request_id) AS completed_walks
            FROM Users u
            LEFT JOIN WalkApplications wa ON u.user_id = wa.walker_id
            LEFT JOIN WalkRequests wr ON wa.request_id = wr.request_id 
                AND wr.status = 'completed'
                AND wa.status = 'accepted'
            WHERE u.role = 'walker'
            GROUP BY u.user_id
        `);
        res.json(rows);
    } catch {
        res.status(500).json({ error: 'RIP failed to get summary' });
    }
});

app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;

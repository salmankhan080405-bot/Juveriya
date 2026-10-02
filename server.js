const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// MySQL Database Configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: Number(process.env.DB_PORT) || 3306
};

const DB_NAME = process.env.DB_NAME || 'juveriya_wedding';

let pool = null;
let isConnected = false;

// Initialize MySQL Database & Table
async function initMySQL() {
  try {
    // 1. Connect to MySQL server to ensure database exists
    const rootConn = await mysql.createConnection(DB_CONFIG);
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();

    // 2. Create connection pool to the database
    pool = mysql.createPool({
      ...DB_CONFIG,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 3. Ensure table exists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS invitations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        with_family BOOLEAN DEFAULT FALSE,
        greeting VARCHAR(255) NOT NULL,
        invite_url TEXT NOT NULL,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.query(createTableQuery);

    isConnected = true;
    console.log(`\x1b[32m✔ Connected to MySQL database "${DB_NAME}" successfully!\x1b[0m`);
  } catch (err) {
    isConnected = false;
    console.warn(`\x1b[33m⚠ MySQL connection pending: ${err.message}\x1b[0m`);
    console.warn(`\x1b[36mTip: Ensure MySQL is running via 'brew services start mysql' or 'mysql -u root'. Server will auto-reconnect.\x1b[0m`);
    // Retry connection after 5 seconds
    setTimeout(initMySQL, 5000);
  }
}

initMySQL();

// ==========================================
// REST API ENDPOINTS FOR MYSQL DATABASE
// ==========================================

// Health / Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    database: 'MySQL',
    connected: isConnected,
    databaseName: DB_NAME
  });
});

// GET all invitations
app.get('/api/invitations', async (req, res) => {
  if (!isConnected || !pool) {
    return res.status(503).json({ error: 'MySQL database not yet connected', connected: false });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM invitations ORDER BY id DESC');
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    console.error('Error fetching invitations from MySQL:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST a new invitation
app.post('/api/invitations', async (req, res) => {
  const { name, withFamily, greeting, inviteUrl, message } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  if (!isConnected || !pool) {
    return res.status(503).json({ error: 'MySQL database not connected yet', connected: false });
  }

  try {
    const query = `
      INSERT INTO invitations (name, with_family, greeting, invite_url, message)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
      name.trim(),
      Boolean(withFamily),
      greeting || (withFamily ? `${name} with Family` : name),
      inviteUrl || '',
      message || ''
    ]);

    res.status(201).json({
      success: true,
      message: 'Invitation stored in MySQL database',
      id: result.insertId,
      data: {
        id: result.insertId,
        name,
        withFamily: Boolean(withFamily),
        greeting,
        inviteUrl,
        message,
        created_at: new Date()
      }
    });
  } catch (err) {
    console.error('Error inserting invitation into MySQL:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE single invitation
app.delete('/api/invitations/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  if (!isConnected || !pool) {
    return res.status(503).json({ error: 'MySQL database not connected' });
  }

  try {
    await pool.query('DELETE FROM invitations WHERE id = ?', [id]);
    res.json({ success: true, message: `Invitation ${id} deleted from MySQL` });
  } catch (err) {
    console.error('Error deleting invitation from MySQL:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE all invitations (Clear History)
app.delete('/api/invitations', async (req, res) => {
  if (!isConnected || !pool) {
    return res.status(503).json({ error: 'MySQL database not connected' });
  }

  try {
    await pool.query('TRUNCATE TABLE invitations');
    res.json({ success: true, message: 'All invitation history cleared from MySQL' });
  } catch (err) {
    console.error('Error truncating invitations in MySQL:', err);
    res.status(500).json({ error: err.message });
  }
});

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`\n\x1b[36m✨ Juveriya Wedding Portal running at http://localhost:${PORT}/\x1b[0m`);
  console.log(`\x1b[36m👑 Admin Studio: http://localhost:${PORT}/admin.html\x1b[0m\n`);
});

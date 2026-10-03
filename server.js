const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Bypass-Tunnel-Reminder', 'bypass-tunnel-reminder']
}));
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

// Cloud Database & Gist Configuration
const CLOUD_DB_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a0fe4aa2796642';
const GIST_ID = '22bf292d93eec0311a70d48436241829';
const { exec } = require('child_process');
const fs = require('fs');

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

    const newItem = {
      id: result.insertId,
      name: name.trim(),
      withFamily: Boolean(withFamily),
      greeting: greeting || (withFamily ? `${name} with Family` : name),
      inviteUrl: inviteUrl || '',
      message: message || '',
      created_at: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Invitation stored in MySQL database',
      id: result.insertId,
      data: newItem
    });

    // Sync changes to Cloud DB and Gist
    pushMySQLToCloudAndGist().catch(e => console.warn('Background sync warning:', e.message));
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
    pushMySQLToCloudAndGist().catch(e => console.warn('Background sync warning:', e.message));
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
    pushMySQLToCloudAndGist().catch(e => console.warn('Background sync warning:', e.message));
  } catch (err) {
    console.error('Error truncating invitations in MySQL:', err);
    res.status(500).json({ error: err.message });
  }
});

// Push current MySQL table state to Cloud DB and Gist
async function pushMySQLToCloudAndGist() {
  if (!pool || !isConnected) return;
  try {
    const [rows] = await pool.query('SELECT * FROM invitations ORDER BY id DESC');
    const formatted = rows.map(r => {
      const dateObj = r.created_at ? new Date(r.created_at) : new Date();
      return {
        id: r.id,
        name: r.name,
        withFamily: Boolean(r.with_family),
        greeting: r.greeting || (r.with_family ? `${r.name} with Family` : r.name),
        inviteUrl: r.invite_url,
        message: r.message,
        date: dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: dateObj.getTime(),
        created_at: dateObj.toISOString()
      };
    });

    // 1. Update Cloud DB
    try {
      await fetch(CLOUD_DB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Juveriya Wedding Invitations',
          data: { invitations: formatted }
        }),
        signal: AbortSignal.timeout(4000)
      });
      console.log('✔ Cloud DB synchronized with MySQL');
    } catch (e) {
      console.warn('Cloud DB update error:', e.message);
    }

    // 2. Update Gist backup
    try {
      const tmpPath = path.join('/tmp', 'juveriya_invitations.json');
      fs.writeFileSync(tmpPath, JSON.stringify(formatted));
      exec(`gh gist edit ${GIST_ID} -f invitations.json ${tmpPath}`, (err) => {
        if (!err) console.log('✔ Gist synchronized with MySQL');
      });
    } catch (e) {
      console.warn('Gist sync error:', e.message);
    }
  } catch (e) {
    console.warn('Error pushing MySQL state to cloud:', e.message);
  }
}

// Bidirectional Sync: Pull from Cloud DB and Push any missing MySQL records
async function syncWithCloudDB() {
  if (!pool || !isConnected) return;
  try {
    let cloudInvitations = [];
    try {
      const cRes = await fetch(CLOUD_DB_URL, { signal: AbortSignal.timeout(4000) });
      if (cRes.ok) {
        const cJson = await cRes.json();
        if (cJson && cJson.data && Array.isArray(cJson.data.invitations)) {
          cloudInvitations = cJson.data.invitations;
        }
      }
    } catch (e) {
      console.warn('Cloud DB pull warning:', e.message);
    }

    // Fetch MySQL records
    const [mysqlRows] = await pool.query('SELECT * FROM invitations ORDER BY id DESC');
    const mysqlMap = new Map();
    mysqlRows.forEach(r => {
      const key = (r.name || '').trim().toLowerCase();
      if (key) mysqlMap.set(key, r);
    });

    // Check if any cloud items are missing in MySQL
    let newlyInserted = false;
    for (const cItem of cloudInvitations) {
      const key = (cItem.name || '').trim().toLowerCase();
      if (key && !mysqlMap.has(key)) {
        try {
          await pool.query(
            `INSERT INTO invitations (name, with_family, greeting, invite_url, message, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              cItem.name.trim(),
              Boolean(cItem.withFamily),
              cItem.greeting || (cItem.withFamily ? `${cItem.name} with Family` : cItem.name),
              cItem.inviteUrl || '',
              cItem.message || '',
              cItem.created_at ? new Date(cItem.created_at) : (cItem.timestamp ? new Date(cItem.timestamp) : new Date())
            ]
          );
          newlyInserted = true;
          console.log(`📥 Synced invitation from Cloud/Phone to MySQL: ${cItem.name}`);
        } catch (insertErr) {
          console.warn('Error inserting cloud item into MySQL:', insertErr.message);
        }
      }
    }

    // If new items were inserted or MySQL has items not yet in Cloud DB, update Cloud DB
    if (newlyInserted || mysqlRows.length > cloudInvitations.length) {
      await pushMySQLToCloudAndGist();
    }
  } catch (err) {
    console.warn('Bidirectional sync warning:', err.message);
  }
}

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`\n\x1b[36m✨ Juveriya Wedding Portal running at http://localhost:${PORT}/\x1b[0m`);
  console.log(`\x1b[36m👑 Admin Studio: http://localhost:${PORT}/admin.html\x1b[0m\n`);

  // Start initial sync and periodic background sync every 15 seconds
  setTimeout(syncWithCloudDB, 2000);
  setInterval(syncWithCloudDB, 15000);
});

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


const dbFile = path.join(__dirname, 'support.db');
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database.');
    
    db.run(`CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT UNIQUE,
      customer_name TEXT,
      customer_email TEXT,
      subject TEXT,
      description TEXT,
      status TEXT DEFAULT 'Open',
      priority TEXT DEFAULT 'Medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT,
      note_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(ticket_id) REFERENCES tickets(ticket_id)
    )`);
  }
});


const generateTicketId = (callback) => {
  db.get(`SELECT ticket_id FROM tickets ORDER BY id DESC LIMIT 1`, (err, row) => {
    if (err || !row) {
      callback('TKT-001');
    } else {
      const num = parseInt(row.ticket_id.split('-')[1]) + 1;
      callback(`TKT-${String(num).padStart(3, '0')}`);
    }
  });
};


app.post('/api/tickets', (req, res) => {
  const { customer_name, customer_email, subject, description, priority } = req.body;
  if (!customer_name || !customer_email || !subject || !description) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!customer_email.includes('@') || !customer_email.includes('.')) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }

  const ticketPriority = priority || 'Medium';

  generateTicketId((ticket_id) => {
    const query = `INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, status, priority) VALUES (?, ?, ?, ?, ?, 'Open', ?)`;
    db.run(query, [ticket_id, customer_name, customer_email, subject, description, ticketPriority], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ ticket_id, created_at: new Date().toISOString() });
    });
  });
});


app.get('/api/tickets', (req, res) => {
  const { status, search } = req.query;
  let query = `SELECT ticket_id, customer_name, subject, status, priority, created_at FROM tickets WHERE 1=1`;
  let params = [];

  if (status && status !== 'All') {
    query += ` AND status = ?`;
    params.push(status);
  }

  if (search) {
    query += ` AND (customer_name LIKE ? OR ticket_id LIKE ? OR customer_email LIKE ? OR description LIKE ? OR priority LIKE ?)`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }

  query += ` ORDER BY id DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});


app.get('/api/stats', (req, res) => {
  db.all(`SELECT status, COUNT(*) as count FROM tickets GROUP BY status`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    let stats = { total: 0, open: 0, in_progress: 0, closed: 0 };
    rows.forEach(row => {
      stats.total += row.count;
      if (row.status === 'Open') stats.open = row.count;
      if (row.status === 'In Progress') stats.in_progress = row.count;
      if (row.status === 'Closed') stats.closed = row.count;
    });
    res.json(stats);
  });
});


app.get('/api/tickets/:ticket_id', (req, res) => {
  const { ticket_id } = req.params;
  
  db.get(`SELECT * FROM tickets WHERE ticket_id = ?`, [ticket_id], (err, ticket) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    db.all(`SELECT note_text, created_at FROM notes WHERE ticket_id = ? ORDER BY id ASC`, [ticket_id], (err, notes) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ ...ticket, notes });
    });
  });
});


app.put('/api/tickets/:ticket_id', (req, res) => {
  const { ticket_id } = req.params;
  const { status, priority, notes } = req.body;
  const updatedAt = new Date().toISOString();

  db.run(`UPDATE tickets SET status = COALESCE(?, status), priority = COALESCE(?, priority), updated_at = ? WHERE ticket_id = ?`, 
    [status, priority, updatedAt, ticket_id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      if (notes && notes.trim() !== '') {
        db.run(`INSERT INTO notes (ticket_id, note_text) VALUES (?, ?)`, [ticket_id, notes.trim()], (noteErr) => {
          if (noteErr) return res.status(500).json({ error: noteErr.message });
          res.json({ success: true, updated_at: updatedAt });
        });
      } else {
        res.json({ success: true, updated_at: updatedAt });
      }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
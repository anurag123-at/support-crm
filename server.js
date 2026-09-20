const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize better-sqlite3 database
const dbFile = path.join(__dirname, 'support.db');
const db = new Database(dbFile);

// Enable foreign keys and create tables synchronously
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
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
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT,
    note_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(ticket_id) REFERENCES tickets(ticket_id)
  );
`);

console.log('Connected to SQLite database via better-sqlite3.');

// Helper to generate next ticket ID
const generateTicketId = () => {
  const row = db.prepare(`SELECT ticket_id FROM tickets ORDER BY id DESC LIMIT 1`).get();
  if (!row) {
    return 'TKT-001';
  }
  const num = parseInt(row.ticket_id.split('-')[1]) + 1;
  return `TKT-${String(num).padStart(3, '0')}`;
};

// Create a new ticket
app.post('/api/tickets', (req, res) => {
  try {
    const { customer_name, customer_email, subject, description, priority } = req.body;
    if (!customer_name || !customer_email || !subject || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!customer_email.includes('@') || !customer_email.includes('.')) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    const ticketPriority = priority || 'Medium';
    const ticket_id = generateTicketId();

    const stmt = db.prepare(`
      INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, status, priority) 
      VALUES (?, ?, ?, ?, ?, 'Open', ?)
    `);
    
    stmt.run(ticket_id, customer_name, customer_email, subject, description, ticketPriority);
    res.json({ ticket_id, created_at: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all tickets with filtering & search
app.get('/api/tickets', (req, res) => {
  try {
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

    const rows = db.prepare(query).all(params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get dashboard statistics
app.get('/api/stats', (req, res) => {
  try {
    const rows = db.prepare(`SELECT status, COUNT(*) as count FROM tickets GROUP BY status`).all();
    
    let stats = { total: 0, open: 0, in_progress: 0, closed: 0 };
    rows.forEach(row => {
      stats.total += row.count;
      if (row.status === 'Open') stats.open = row.count;
      if (row.status === 'In Progress') stats.in_progress = row.count;
      if (row.status === 'Closed') stats.closed = row.count;
    });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single ticket details and notes history
app.get('/api/tickets/:ticket_id', (req, res) => {
  try {
    const { ticket_id } = req.params;
    
    const ticket = db.prepare(`SELECT * FROM tickets WHERE ticket_id = ?`).get(ticket_id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const notes = db.prepare(`SELECT note_text, created_at FROM notes WHERE ticket_id = ? ORDER BY id ASC`).all(ticket_id);
    
    res.json({ ...ticket, notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update ticket status, priority, and add notes
app.put('/api/tickets/:ticket_id', (req, res) => {
  try {
    const { ticket_id } = req.params;
    const { status, priority, notes } = req.body;
    const updatedAt = new Date().toISOString();

    const updateStmt = db.prepare(`
      UPDATE tickets 
      SET status = COALESCE(?, status), 
          priority = COALESCE(?, priority), 
          updated_at = ? 
      WHERE ticket_id = ?
    `);
    
    updateStmt.run(status, priority, updatedAt, ticket_id);

    if (notes && notes.trim() !== '') {
      const noteStmt = db.prepare(`INSERT INTO notes (ticket_id, note_text) VALUES (?, ?)`);
      noteStmt.run(ticket_id, notes.trim());
    }

    res.json({ success: true, updated_at: updatedAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
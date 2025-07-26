
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// SQLite database connection
const db = new sqlite3.Database('./library.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database tables
function initializeDatabase() {
  // Create books table
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      tticode TEXT UNIQUE NOT NULL,
      isbn TEXT,
      category TEXT NOT NULL,
      status TEXT DEFAULT 'Available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating books table:', err.message);
    } else {
      console.log('Books table created or already exists');
    }
  });

  // Create members table
  db.run(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      member_id TEXT UNIQUE NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating members table:', err.message);
    } else {
      console.log('Members table created or already exists');
    }
  });

  // Create transactions table
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_title TEXT NOT NULL,
      member_name TEXT NOT NULL,
      checkout_date DATE NOT NULL,
      due_date DATE NOT NULL,
      status TEXT DEFAULT 'Checked Out',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating transactions table:', err.message);
    } else {
      console.log('Transactions table created or already exists');
    }
  });
}

// Books API routes
app.get('/api/books', (req, res) => {
  db.all('SELECT * FROM books ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Error fetching books:', err.message);
      res.status(500).json({ error: 'Failed to fetch books' });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/books', (req, res) => {
  const { title, author, ttiCode, isbn, category } = req.body;
  db.run(
    'INSERT INTO books (title, author, tticode, isbn, category) VALUES (?, ?, ?, ?, ?)',
    [title, author, ttiCode, isbn || null, category],
    function(err) {
      if (err) {
        console.error('Error adding book:', err.message);
        res.status(500).json({ error: 'Failed to add book' });
      } else {
        // Get the inserted book
        db.get('SELECT * FROM books WHERE id = ?', [this.lastID], (err, row) => {
          if (err) {
            console.error('Error fetching inserted book:', err.message);
            res.status(500).json({ error: 'Failed to fetch inserted book' });
          } else {
            res.json(row);
          }
        });
      }
    }
  );
});

app.delete('/api/books/:id', (req, res) => {
  db.run('DELETE FROM books WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      console.error('Error deleting book:', err.message);
      res.status(500).json({ error: 'Failed to delete book' });
    } else {
      res.json({ success: true });
    }
  });
});

// Members API routes
app.get('/api/members', (req, res) => {
  db.all('SELECT * FROM members ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Error fetching members:', err.message);
      res.status(500).json({ error: 'Failed to fetch members' });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/members', (req, res) => {
  const { name, memberId, phone } = req.body;
  db.run(
    'INSERT INTO members (name, member_id, phone) VALUES (?, ?, ?)',
    [name, memberId, phone],
    function(err) {
      if (err) {
        console.error('Error adding member:', err.message);
        res.status(500).json({ error: 'Failed to add member' });
      } else {
        // Get the inserted member
        db.get('SELECT * FROM members WHERE id = ?', [this.lastID], (err, row) => {
          if (err) {
            console.error('Error fetching inserted member:', err.message);
            res.status(500).json({ error: 'Failed to fetch inserted member' });
          } else {
            res.json(row);
          }
        });
      }
    }
  );
});

// Transactions API routes
app.get('/api/transactions', (req, res) => {
  db.all('SELECT * FROM transactions ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Error fetching transactions:', err.message);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/transactions', (req, res) => {
  const { bookTitle, memberName, checkoutDate, dueDate } = req.body;
  db.run(
    'INSERT INTO transactions (book_title, member_name, checkout_date, due_date) VALUES (?, ?, ?, ?)',
    [bookTitle, memberName, checkoutDate, dueDate],
    function(err) {
      if (err) {
        console.error('Error adding transaction:', err.message);
        res.status(500).json({ error: 'Failed to add transaction' });
      } else {
        // Get the inserted transaction
        db.get('SELECT * FROM transactions WHERE id = ?', [this.lastID], (err, row) => {
          if (err) {
            console.error('Error fetching inserted transaction:', err.message);
            res.status(500).json({ error: 'Failed to fetch inserted transaction' });
          } else {
            res.json(row);
          }
        });
      }
    }
  );
});

app.delete('/api/transactions', (req, res) => {
  db.run('DELETE FROM transactions', (err) => {
    if (err) {
      console.error('Error clearing transactions:', err.message);
      res.status(500).json({ error: 'Failed to clear transactions' });
    } else {
      res.json({ success: true });
    }
  });
});

// Get overdue members (books not returned after 14 days)
app.get('/api/overdue-members', (req, res) => {
  const query = `
    SELECT 
      t.member_name,
      t.book_title,
      t.due_date,
      m.phone,
      julianday('now') - julianday(t.due_date) as days_overdue
    FROM transactions t
    LEFT JOIN members m ON t.member_name = m.name
    WHERE t.status = 'Checked Out' 
    AND julianday('now') - julianday(t.due_date) > 14
    ORDER BY days_overdue DESC
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Error fetching overdue members:', err.message);
      res.status(500).json({ error: 'Failed to fetch overdue members' });
    } else {
      res.json(rows);
    }
  });
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize database and start server
initializeDatabase();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

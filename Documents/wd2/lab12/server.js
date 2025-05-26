// server.js - Main server file
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Priscille_2002', // Replace with your MySQL password
  database: 'books_db'
});

// Connect to database
db.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
  
  // Create database if it doesn't exist
  db.query(`CREATE DATABASE IF NOT EXISTS books_db`, (err) => {
    if (err) console.error('Error creating database:', err);
    
    // Create books table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        publish_year INT,
        genre VARCHAR(100),
        price DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    db.query(createTableQuery, (err) => {
      if (err) console.error('Error creating table:', err);
      
      // Insert sample data if table is empty
      db.query('SELECT COUNT(*) as count FROM books', (err, results) => {
        if (err) console.error('Error checking table:', err);
        
        if (results[0].count === 0) {
          const sampleBooks = [
            { title: 'To Kill a Mockingbird', author: 'Harper Lee', publish_year: 1960, genre: 'Fiction', price: 12.99 },
            { title: '1984', author: 'George Orwell', publish_year: 1949, genre: 'Dystopian', price: 10.99 },
            { title: 'Pride and Prejudice', author: 'Jane Austen', publish_year: 1813, genre: 'Romance', price: 9.99 },
            { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', publish_year: 1925, genre: 'Classic', price: 11.99 },
            { title: 'The Hobbit', author: 'J.R.R. Tolkien', publish_year: 1937, genre: 'Fantasy', price: 14.99 }
          ];
          
          sampleBooks.forEach(book => {
            db.query('INSERT INTO books SET ?', book, (err) => {
              if (err) console.error('Error inserting sample data:', err);
            });
          });
          
          console.log('Sample data inserted');
        }
      });
    });
  });
});

// API Routes

// Get all books
// GET /api/books
// Query parameters: genre, author, min_year, max_year
app.get('/api/books', (req, res) => {
  let query = 'SELECT * FROM books WHERE 1=1';
  const params = [];
  
  // Filter by genre
  if (req.query.genre) {
    query += ' AND genre = ?';
    params.push(req.query.genre);
  }
  
  // Filter by author
  if (req.query.author) {
    query += ' AND author LIKE ?';
    params.push(`%${req.query.author}%`);
  }
  
  // Filter by min publish year
  if (req.query.min_year) {
    query += ' AND publish_year >= ?';
    params.push(parseInt(req.query.min_year));
  }
  
  // Filter by max publish year
  if (req.query.max_year) {
    query += ' AND publish_year <= ?';
    params.push(parseInt(req.query.max_year));
  }
  
  // Sort by price
  if (req.query.sort_by === 'price') {
    query += ' ORDER BY price';
    if (req.query.order === 'desc') {
      query += ' DESC';
    } else {
      query += ' ASC';
    }
  }
  
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching books:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get a specific book by ID
// GET /api/books/:id
app.get('/api/books/:id', (req, res) => {
  const bookId = req.params.id;
  
  db.query('SELECT * FROM books WHERE id = ?', [bookId], (err, results) => {
    if (err) {
      console.error('Error fetching book:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json(results[0]);
  });
});

// Create a new book
// POST /api/books
app.post('/api/books', (req, res) => {
  const { title, author, publish_year, genre, price } = req.body;
  
  // Validate required fields
  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }
  
  const newBook = {
    title,
    author,
    publish_year: publish_year || null,
    genre: genre || null,
    price: price || null
  };
  
  db.query('INSERT INTO books SET ?', newBook, (err, result) => {
    if (err) {
      console.error('Error creating book:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    newBook.id = result.insertId;
    res.status(201).json(newBook);
  });
});

// Update a book
// PUT /api/books/:id
app.put('/api/books/:id', (req, res) => {
  const bookId = req.params.id;
  const { title, author, publish_year, genre, price } = req.body;
  
  // Validate required fields
  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }
  
  const updatedBook = {
    title,
    author,
    publish_year: publish_year || null,
    genre: genre || null,
    price: price || null
  };
  
  db.query('UPDATE books SET ? WHERE id = ?', [updatedBook, bookId], (err, result) => {
    if (err) {
      console.error('Error updating book:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json({ id: bookId, ...updatedBook });
  });
});

// Delete a book
// DELETE /api/books/:id
app.delete('/api/books/:id', (req, res) => {
  const bookId = req.params.id;
  
  db.query('DELETE FROM books WHERE id = ?', [bookId], (err, result) => {
    if (err) {
      console.error('Error deleting book:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json({ message: 'Book deleted successfully' });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
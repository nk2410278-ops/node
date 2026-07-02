/**
 * ============================================
 * COMPLETE BOOK API - ALL IN ONE FILE
 * ============================================
 * This file contains the entire REST API for
 * managing books with all features.
 * 
 * Save as: server.js
 * ============================================
 */

// ====================== IMPORTS ======================
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// ====================== CONFIGURATION ======================
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'books.json');

// ====================== MIDDLEWARE ======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====================== DATA LAYER ======================

// Initialize data file with sample books
const initializeData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const sampleBooks = [
      { 
        id: 1, 
        title: "The Great Gatsby", 
        author: "F. Scott Fitzgerald", 
        isbn: "978-0743273565", 
        publishedYear: 1925, 
        genre: "Fiction", 
        available: true 
      },
      { 
        id: 2, 
        title: "To Kill a Mockingbird", 
        author: "Harper Lee", 
        isbn: "978-0446310789", 
        publishedYear: 1960, 
        genre: "Fiction", 
        available: true 
      },
      { 
        id: 3, 
        title: "1984", 
        author: "George Orwell", 
        isbn: "978-0451524935", 
        publishedYear: 1949, 
        genre: "Dystopian", 
        available: true 
      },
      { 
        id: 4, 
        title: "Pride and Prejudice", 
        author: "Jane Austen", 
        isbn: "978-0141439518", 
        publishedYear: 1813, 
        genre: "Romance", 
        available: true 
      },
      { 
        id: 5, 
        title: "The Catcher in the Rye", 
        author: "J.D. Salinger", 
        isbn: "978-0316769488", 
        publishedYear: 1951, 
        genre: "Fiction", 
        available: false 
      }
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(sampleBooks, null, 2));
    console.log('📚 Sample books data initialized');
  }
};

// Read all books from file
const readBooks = () => {
  try {
    initializeData();
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading books:', error);
    return [];
  }
};

// Write books to file
const writeBooks = (books) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing books:', error);
    return false;
  }
};

// ====================== VALIDATION FUNCTIONS ======================

const validateBookData = (bookData, isPartial = false) => {
  const errors = [];
  const { title, author, isbn, publishedYear, available, genre } = bookData;

  // Title validation
  if (title !== undefined) {
    if (!isPartial && (!title || title.trim() === '')) {
      errors.push('Title is required');
    } else if (title !== undefined && title.trim() === '') {
      errors.push('Title cannot be empty');
    }
  } else if (!isPartial) {
    errors.push('Title is required');
  }

  // Author validation
  if (author !== undefined) {
    if (!isPartial && (!author || author.trim() === '')) {
      errors.push('Author is required');
    } else if (author !== undefined && author.trim() === '') {
      errors.push('Author cannot be empty');
    }
  } else if (!isPartial) {
    errors.push('Author is required');
  }

  // ISBN validation
  if (isbn !== undefined) {
    const cleanIsbn = isbn.replace(/-/g, '');
    if (!isPartial && !isbn) {
      errors.push('ISBN is required');
    } else if (isbn && !/^\d{13}$/.test(cleanIsbn)) {
      errors.push('ISBN must be 13 digits (can include hyphens)');
    }
  } else if (!isPartial) {
    errors.push('ISBN is required');
  }

  // Published year validation
  if (publishedYear !== undefined) {
    const year = parseInt(publishedYear);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1000 || year > currentYear) {
      errors.push(`Published year must be between 1000 and ${currentYear}`);
    }
  }

  // Available validation
  if (available !== undefined && typeof available !== 'boolean') {
    errors.push('Available must be a boolean value (true/false)');
  }

  // Genre validation
  if (genre !== undefined && genre.trim() === '') {
    errors.push('Genre cannot be empty if provided');
  }

  return errors;
};

// ====================== MIDDLEWARE ======================

// Validation middleware for full book
const validateFullBook = (req, res, next) => {
  const errors = validateBookData(req.body, false);
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors
    });
  }
  next();
};

// Validation middleware for partial update
const validatePartialBook = (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No fields to update',
      message: 'Please provide at least one field to update'
    });
  }
  const errors = validateBookData(req.body, true);
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors
    });
  }
  next();
};

// Check if book exists middleware
const checkBookExists = (req, res, next) => {
  const id = parseInt(req.params.id);
  const books = readBooks();
  const book = books.find(b => b.id === id);
  if (!book) {
    return res.status(404).json({
      success: false,
      error: 'Book not found',
      message: `No book found with ID ${id}`
    });
  }
  req.book = book;
  req.bookIndex = books.indexOf(book);
  next();
};

// ====================== CONTROLLER FUNCTIONS ======================

// Get all books with optional search
const getAllBooks = (req, res) => {
  try {
    const { search, genre, author, available } = req.query;
    let books = readBooks();

    // Apply filters
    if (search) {
      const searchTerm = search.toLowerCase();
      books = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        (book.genre && book.genre.toLowerCase().includes(searchTerm)) ||
        book.isbn.includes(search)
      );
    }

    if (genre) {
      books = books.filter(book => 
        book.genre && book.genre.toLowerCase() === genre.toLowerCase()
      );
    }

    if (author) {
      books = books.filter(book => 
        book.author.toLowerCase().includes(author.toLowerCase())
      );
    }

    if (available !== undefined) {
      const isAvailable = available === 'true';
      books = books.filter(book => book.available === isAvailable);
    }

    res.status(200).json({
      success: true,
      count: books.length,
      filters: { search, genre, author, available },
      data: books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch books',
      message: error.message
    });
  }
};

// Get a single book by ID
const getBookById = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const books = readBooks();
    const book = books.find(b => b.id === id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found',
        message: `No book found with ID ${id}`
      });
    }

    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch book',
      message: error.message
    });
  }
};

// Create a new book
const createBook = (req, res) => {
  try {
    const { title, author, isbn, publishedYear, genre, available } = req.body;
    const books = readBooks();

    // Check for duplicate ISBN
    if (books.some(b => b.isbn === isbn)) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate ISBN',
        message: 'A book with this ISBN already exists'
      });
    }

    const newBook = {
      id: books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1,
      title: title.trim(),
      author: author.trim(),
      isbn: isbn,
      publishedYear: publishedYear || null,
      genre: genre || 'General',
      available: available !== undefined ? available : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    books.push(newBook);
    writeBooks(books);

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: newBook
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create book',
      message: error.message
    });
  }
};

// Full update of a book
const updateBook = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, author, isbn, publishedYear, genre, available } = req.body;
    const books = readBooks();
    const index = books.findIndex(b => b.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Book not found',
        message: `No book found with ID ${id}`
      });
    }

    // Check for duplicate ISBN (excluding current book)
    if (books.some(b => b.isbn === isbn && b.id !== id)) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate ISBN',
        message: 'A book with this ISBN already exists'
      });
    }

    books[index] = {
      ...books[index],
      title: title.trim(),
      author: author.trim(),
      isbn: isbn,
      publishedYear: publishedYear || null,
      genre: genre || 'General',
      available: available !== undefined ? available : true,
      updatedAt: new Date().toISOString()
    };

    writeBooks(books);

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: books[index]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update book',
      message: error.message
    });
  }
};

// Partial update of a book
const partialUpdateBook = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const books = readBooks();
    const index = books.findIndex(b => b.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Book not found',
        message: `No book found with ID ${id}`
      });
    }

    // Check for duplicate ISBN if updating ISBN
    if (updates.isbn) {
      if (books.some(b => b.isbn === updates.isbn && b.id !== id)) {
        return res.status(400).json({
          success: false,
          error: 'Duplicate ISBN',
          message: 'A book with this ISBN already exists'
        });
      }
    }

    // Apply updates
    books[index] = {
      ...books[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    writeBooks(books);

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: books[index]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update book',
      message: error.message
    });
  }
};

// Delete a book
const deleteBook = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const books = readBooks();
    const filteredBooks = books.filter(b => b.id !== id);

    if (filteredBooks.length === books.length) {
      return res.status(404).json({
        success: false,
        error: 'Book not found',
        message: `No book found with ID ${id}`
      });
    }

    writeBooks(filteredBooks);

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
      data: { id, deleted: true }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete book',
      message: error.message
    });
  }
};

// Get books statistics
const getBookStats = (req, res) => {
  try {
    const books = readBooks();
    const stats = {
      totalBooks: books.length,
      availableBooks: books.filter(b => b.available).length,
      unavailableBooks: books.filter(b => !b.available).length,
      genres: {},
      authors: {},
      decadeDistribution: {},
      averagePublishedYear: 0
    };

    let totalYear = 0;
    let yearCount = 0;

    books.forEach(book => {
      // Genre stats
      if (book.genre) {
        stats.genres[book.genre] = (stats.genres[book.genre] || 0) + 1;
      }
      
      // Author stats
      stats.authors[book.author] = (stats.authors[book.author] || 0) + 1;
      
      // Decade distribution
      if (book.publishedYear) {
        const decade = Math.floor(book.publishedYear / 10) * 10;
        const decadeKey = `${decade}s`;
        stats.decadeDistribution[decadeKey] = (stats.decadeDistribution[decadeKey] || 0) + 1;
        totalYear += book.publishedYear;
        yearCount++;
      }
    });

    stats.averagePublishedYear = yearCount > 0 ? Math.round(totalYear / yearCount) : 0;

    // Get most popular genre
    const mostPopularGenre = Object.entries(stats.genres)
      .sort((a, b) => b[1] - a[1])[0];
    if (mostPopularGenre) {
      stats.mostPopularGenre = mostPopularGenre[0];
    }

    // Get most prolific author
    const mostProlificAuthor = Object.entries(stats.authors)
      .sort((a, b) => b[1] - a[1])[0];
    if (mostProlificAuthor) {
      stats.mostProlificAuthor = mostProlificAuthor[0];
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
      message: error.message
    });
  }
};

// Bulk create books
const bulkCreateBooks = (req, res) => {
  try {
    const { books: newBooks } = req.body;
    
    if (!Array.isArray(newBooks) || newBooks.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        message: 'Please provide an array of books'
      });
    }

    if (newBooks.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Too many books',
        message: 'Maximum 100 books per bulk request'
      });
    }

    const existingBooks = readBooks();
    const createdBooks = [];
    const errors = [];

    newBooks.forEach((book, index) => {
      const { title, author, isbn, publishedYear, genre, available } = book;
      
      // Validate required fields
      const validationErrors = validateBookData(book, false);
      if (validationErrors.length > 0) {
        errors.push(`Book at index ${index}: ${validationErrors.join(', ')}`);
        return;
      }

      // Check for duplicate ISBN
      if (existingBooks.some(b => b.isbn === isbn) || 
          createdBooks.some(b => b.isbn === isbn)) {
        errors.push(`Book at index ${index}: Duplicate ISBN '${isbn}'`);
        return;
      }

      const newBook = {
        id: existingBooks.length > 0 
          ? Math.max(...existingBooks.map(b => b.id), ...createdBooks.map(b => b.id), 0) + createdBooks.length + 1
          : createdBooks.length + 1,
        title: title.trim(),
        author: author.trim(),
        isbn: isbn,
        publishedYear: publishedYear || null,
        genre: genre || 'General',
        available: available !== undefined ? available : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      createdBooks.push(newBook);
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Bulk creation failed',
        errors: errors,
        created: createdBooks.length
      });
    }

    existingBooks.push(...createdBooks);
    writeBooks(existingBooks);

    res.status(201).json({
      success: true,
      message: `${createdBooks.length} books created successfully`,
      count: createdBooks.length,
      data: createdBooks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create books',
      message: error.message
    });
  }
};

// Get books by genre
const getBooksByGenre = (req, res) => {
  try {
    const genre = req.params.genre;
    const books = readBooks();
    const filteredBooks = books.filter(book => 
      book.genre && book.genre.toLowerCase() === genre.toLowerCase()
    );

    res.status(200).json({
      success: true,
      genre: genre,
      count: filteredBooks.length,
      data: filteredBooks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch books by genre',
      message: error.message
    });
  }
};

// Get all genres
const getAllGenres = (req, res) => {
  try {
    const books = readBooks();
    const genres = [...new Set(books.map(b => b.genre).filter(g => g))];
    
    res.status(200).json({
      success: true,
      count: genres.length,
      data: genres.sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch genres',
      message: error.message
    });
  }
};

// ====================== ROUTES ======================

// Home route with API documentation
app.get('/', (req, res) => {
  res.json({
    name: '📚 Complete Book Management API',
    version: '2.0.0',
    description: 'Full-featured REST API for managing book collections',
    endpoints: {
      'GET /': '📖 API Documentation',
      'GET /api/books': '📚 Get all books (supports ?search=query, ?genre=genre, ?author=author, ?available=true/false)',
      'GET /api/books/:id': '🔍 Get a book by ID',
      'GET /api/books/stats': '📊 Get statistics about books',
      'GET /api/books/genres': '🎭 Get all genres',
      'GET /api/books/genre/:genre': '📚 Get books by genre',
      'POST /api/books': '➕ Create a new book',
      'POST /api/books/bulk': '📦 Create multiple books at once',
      'PUT /api/books/:id': '✏️ Full update of a book',
      'PATCH /api/books/:id': '🔄 Partial update of a book',
      'DELETE /api/books/:id': '🗑️ Delete a book'
    },
    sampleBook: {
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      isbn: "978-0547928227",
      publishedYear: 1937,
      genre: "Fantasy",
      available: true
    },
    filters: {
      search: 'Search in title, author, genre, and ISBN',
      genre: 'Filter by genre (case insensitive)',
      author: 'Filter by author (partial match)',
      available: 'Filter by availability (true/false)'
    },
    timestamp: new Date().toISOString(),
    documentation: 'https://github.com/yourusername/book-api'
  });
});

// Book routes
app.get('/api/books', getAllBooks);
app.get('/api/books/stats', getBookStats);
app.get('/api/books/genres', getAllGenres);
app.get('/api/books/genre/:genre', getBooksByGenre);
app.get('/api/books/:id', getBookById);
app.post('/api/books', validateFullBook, createBook);
app.post('/api/books/bulk', bulkCreateBooks);
app.put('/api/books/:id', validateFullBook, updateBook);
app.patch('/api/books/:id', validatePartialBook, partialUpdateBook);
app.delete('/api/books/:id', deleteBook);

// ====================== ERROR HANDLING ======================

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.url}`,
    availableRoutes: [
      'GET /',
      'GET /api/books',
      'GET /api/books/:id',
      'GET /api/books/stats',
      'GET /api/books/genres',
      'GET /api/books/genre/:genre',
      'POST /api/books',
      'POST /api/books/bulk',
      'PUT /api/books/:id',
      'PATCH /api/books/:id',
      'DELETE /api/books/:id'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ====================== START SERVER ======================

// Initialize data
initializeData();

app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║     📚 COMPLETE BOOK API SERVER STARTED            ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`\n🚀 Server running at: http://localhost:${PORT}`);
  console.log(`📊 Data file: ${DATA_FILE}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📋 Available Routes:`);
  console.log(`   GET    /                           - API Documentation`);
  console.log(`   GET    /api/books                  - Get all books (with filters)`);
  console.log(`   GET    /api/books/:id              - Get book by ID`);
  console.log(`   GET    /api/books/stats            - Get statistics`);
  console.log(`   GET    /api/books/genres           - Get all genres`);
  console.log(`   GET    /api/books/genre/:genre     - Get books by genre`);
  console.log(`   POST   /api/books                  - Create a book`);
  console.log(`   POST   /api/books/bulk             - Bulk create books`);
  console.log(`   PUT    /api/books/:id              - Full update`);
  console.log(`   PATCH  /api/books/:id              - Partial update`);
  console.log(`   DELETE /api/books/:id              - Delete a book`);
  console.log(`\n📖 Try it now: http://localhost:${PORT}`);
  console.log('\n═══════════════════════════════════════════════════════\n');
});

// ====================== EXPORT FOR TESTING ======================
module.exports = app;
# 📚 Complete Book Management API

A full-featured REST API built with **Node.js** and **Express.js** for managing a collection of books. This API supports CRUD operations, filtering, bulk operations, and advanced statistics — all in a single file.

---

## 🚀 Features

* 📖 Get all books with search & filters
* 🔍 Get a single book by ID
* ➕ Create a new book
* ✏️ Update book (full & partial)
* 🗑️ Delete a book
* 📊 Get book statistics
* 📦 Bulk create books
* 🎭 Filter books by genre
* ✅ Data validation & error handling
* 💾 File-based storage using JSON

---

## 🛠️ Tech Stack

* **Node.js**
* **Express.js**
* **CORS**
* **File System (fs module)**

---

## 📂 Project Structure

```
project/
│
├── server.js        # Main API file
├── books.json       # Data storage file (auto-created)
└── README.md        # Project documentation
```

---

## ⚙️ Installation & Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/book-api.git
cd book-api
```

2. Install dependencies:

```bash
npm install express cors
```

3. Run the server:

```bash
node server.js
```

4. Open in browser:

```
http://localhost:3000
```

---

## 📡 API Endpoints

### 📖 General

| Method | Endpoint | Description       |
| ------ | -------- | ----------------- |
| GET    | `/`      | API documentation |

---

### 📚 Books

| Method | Endpoint         | Description                  |
| ------ | ---------------- | ---------------------------- |
| GET    | `/api/books`     | Get all books (with filters) |
| GET    | `/api/books/:id` | Get book by ID               |
| POST   | `/api/books`     | Create a new book            |
| PUT    | `/api/books/:id` | Full update                  |
| PATCH  | `/api/books/:id` | Partial update               |
| DELETE | `/api/books/:id` | Delete a book                |

---

### 📊 Extra Features

| Method | Endpoint                  | Description        |
| ------ | ------------------------- | ------------------ |
| GET    | `/api/books/stats`        | Get statistics     |
| GET    | `/api/books/genres`       | Get all genres     |
| GET    | `/api/books/genre/:genre` | Get books by genre |
| POST   | `/api/books/bulk`         | Bulk create books  |

---

## 🔍 Query Parameters (Filters)

You can filter books using:

```
/api/books?search=harry
/api/books?genre=fiction
/api/books?author=rowling
/api/books?available=true
```

---

## 🧪 Sample Book JSON

```json
{
  "title": "The Hobbit",
  "author": "J.R.R. Tolkien",
  "isbn": "978-0547928227",
  "publishedYear": 1937,
  "genre": "Fantasy",
  "available": true
}
```

---

## 📊 Statistics Example

The `/api/books/stats` endpoint provides:

* Total books
* Available / unavailable books
* Genre distribution
* Author distribution
* Decade-wise data
* Average published year

---

## ⚠️ Validation Rules

* Title & Author → Required
* ISBN → Must be 13 digits
* Published Year → Between 1000 and current year
* Available → Boolean (true/false)

---

## 🧠 How It Works

* Data is stored in a **JSON file (books.json)**
* File is automatically created with sample data
* All operations read/write from this file
* Middleware handles validation and errors

---

## ❌ Error Handling

The API returns proper error responses for:

* Invalid input data
* Duplicate ISBN
* Book not found
* Server errors

---

## 📌 Future Improvements

* Database integration (MongoDB / MySQL)
* Authentication & Authorization
* Pagination
* Swagger API documentation
* Deployment (Render / Railway / AWS)

---

## 👨‍💻 Author

**Naveen M**
Aspiring IT Professional | Backend Developer

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!

---

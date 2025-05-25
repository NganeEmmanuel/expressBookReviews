const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const axios = require('axios');


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Simulate API call for all books
function getAllBooks() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(books);
    }, 500);
  });
}

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
    const data = await getAllBooks();
    res.status(200).send(JSON.stringify(data, null, 4));
  } catch (err) {
    res.status(500).json({ message: "Error fetching books" });
  }
});

// Get book details based on ISBN
function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  });
}

public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const book = await getBookByISBN(isbn);
    res.status(200).json(book);
  } catch (err) {
    res.status(404).json({ message: err });
  }
});
  
// Get book details based on author
function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    const booksByAuthor = [];

    for (let isbn in books) {
      if (books[isbn].author === author) {
        booksByAuthor.push(books[isbn]);
      }
    }

    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      reject("No books found for the given author");
    }
  });
}

public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const data = await getBooksByAuthor(author);
    res.status(200).json(data);
  } catch (err) {
    res.status(404).json({ message: err });
  }
});


// Get all books based on title
function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    const booksByTitle = [];

    for (let isbn in books) {
      if (books[isbn].title === title) {
        booksByTitle.push(books[isbn]);
      }
    }

    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    } else {
      reject("No books found for the given title");
    }
  });
}

public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const data = await getBooksByTitle(title);
    res.status(200).json(data);
  } catch (err) {
    res.status(404).json({ message: err });
  }
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.status(200).json(book.reviews);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;

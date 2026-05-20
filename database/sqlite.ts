import * as SQLite from 'expo-sqlite';

export const getDb = async () => {
  return await SQLite.openDatabaseAsync('booktracker.db');
};

export const initDb = async () => {
  try {
    const db = await getDb();
    
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS books_wishlist (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        authors TEXT,
        thumbnail TEXT
      );
      CREATE TABLE IF NOT EXISTS books_reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bookId TEXT NOT NULL,
        title TEXT NOT NULL,
        rating INTEGER NOT NULL,
        reviewText TEXT,
        imageUri TEXT,
        locationLat REAL,
        locationLng REAL,
        date TEXT NOT NULL
      );
    `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database", error);
  }
};

export const addToWishlist = async (id: string, title: string, authors: string, thumbnail: string) => {
  const db = await getDb();
  await db.runAsync('INSERT OR REPLACE INTO books_wishlist (id, title, authors, thumbnail) VALUES (?, ?, ?, ?)', id, title, authors, thumbnail);
};

export const removeFromWishlist = async (id: string) => {
  const db = await getDb();
  await db.runAsync('DELETE FROM books_wishlist WHERE id = ?', id);
};

export const getWishlist = async () => {
  const db = await getDb();
  return await db.getAllAsync('SELECT * FROM books_wishlist');
};

export const addReview = async (bookId: string, title: string, rating: number, reviewText: string, imageUri: string, locationLat: number, locationLng: number) => {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO books_reviews (bookId, title, rating, reviewText, imageUri, locationLat, locationLng, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
    bookId, title, rating, reviewText, imageUri, locationLat, locationLng, new Date().toISOString()
  );
};

export const getReviews = async () => {
  const db = await getDb();
  return await db.getAllAsync('SELECT * FROM books_reviews ORDER BY id DESC');
};

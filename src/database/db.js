import * as SQLite from "expo-sqlite";

let db;

export const initDatabase = async () => {
  db = await SQLite.openDatabaseAsync("securevault.db");

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      login_attempts INTEGER DEFAULT 0,
      locked_until INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS password_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      website_or_app TEXT,
      encrypted_password TEXT NOT NULL,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  return db;
};



export const createUser = async (username, passwordHash) => {
  const result = await db.runAsync(
    `INSERT INTO users (username, password_hash, created_at)
     VALUES (?, ?, ?)`,
    [username, passwordHash, Date.now()]
  );
  return result.lastInsertRowId;
};

export const getUserByUsername = async (username) => {
  return await db.getFirstAsync(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );
};


export const incrementLoginAttempts = async (username) => {
  await db.runAsync(
    `UPDATE users SET login_attempts = login_attempts + 1 WHERE username = ?`,
    [username]
  );
};

export const lockAccount = async (username) => {
  const lockedUntil = Date.now() + 15 * 60 * 1000; // 15 menit
  await db.runAsync(
    `UPDATE users SET locked_until = ?, login_attempts = 0 WHERE username = ?`,
    [lockedUntil, username]
  );
};

export const resetLoginAttempts = async (username) => {
  await db.runAsync(
    `UPDATE users SET login_attempts = 0, locked_until = 0 WHERE username = ?`,
    [username]
  );
};



export const createNote = async (userId, title, websiteOrApp, encryptedPassword, notes) => {
  const now = Date.now();
  const result = await db.runAsync(
    `INSERT INTO password_notes 
     (user_id, title, website_or_app, encrypted_password, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, title, websiteOrApp, encryptedPassword, notes, now, now]
  );
  return result.lastInsertRowId;
};

export const getNotesByUser = async (userId) => {
  return await db.getAllAsync(
    `SELECT * FROM password_notes WHERE user_id = ? ORDER BY updated_at DESC`,
    [userId]
  );
};

export const getNoteById = async (id, userId) => {
  return await db.getFirstAsync(
    `SELECT * FROM password_notes WHERE id = ? AND user_id = ?`,
    [id, userId]
  );
};

export const updateNote = async (id, userId, title, websiteOrApp, encryptedPassword, notes) => {
  await db.runAsync(
    `UPDATE password_notes 
     SET title = ?, website_or_app = ?, encrypted_password = ?, notes = ?, updated_at = ?
     WHERE id = ? AND user_id = ?`,
    [title, websiteOrApp, encryptedPassword, notes, Date.now(), id, userId]
  );
};

export const deleteNote = async (id, userId) => {
  await db.runAsync(
    `DELETE FROM password_notes WHERE id = ? AND user_id = ?`,
    [id, userId]
  );
};
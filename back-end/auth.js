import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err.message);
    } else {
        console.log('Connecté à la base de données SQLite :', dbPath);
        console.log("Utilisation de la database ici :", dbPath);
    }
    });

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user'
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            score DECIMAL,
            date_taken DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `);
});

export async function addNewUser(username, password) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        db.run(sql, [username, password, 'user'], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

export async function getPassword(username) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, password, role FROM users WHERE username = ?';
        db.get(sql, [username], (err, row) => {
            if (err) return reject(err);
            if (!row) return reject("User doesn't exist");
            resolve({ id: row.id, password: row.password, role: row.role });
        });
    });
}

export async function getUsers() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, username, role FROM users';
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

export async function updateUser(user_id, username, password) {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE users SET username = ?, password = ? WHERE id = ?';
        db.run(sql, [username, password, user_id], function(err) {
            if (err) reject(err);
            else resolve(true);
        });
    });
}

export async function deleteUser(user_id) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM users WHERE id = ?';
        db.run(sql, [user_id], function(err) {
            if (err) reject(err);
            else resolve(true);
        });
    });
}

export async function addNewScore(user_id, score) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO scores (user_id, score) VALUES (?, ?)';
        db.run(sql, [user_id, score], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

export async function getScoresFromID(user_id) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, score, date_taken FROM scores WHERE user_id = ? ORDER BY date_taken DESC';
        db.all(sql, [user_id], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

export function createAdminIfNotExists() {
    const username = 'admin';
    const password = 'admin';
    const hashed = crypto.createHash('sha256').update(password).digest('hex');
    db.get('SELECT 1 FROM users WHERE username = ?', [username], (err, row) => {
        if (!err && !row) {
            db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashed, 'admin']);
        }
    });
}

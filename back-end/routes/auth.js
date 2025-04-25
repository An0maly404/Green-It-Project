import sqlite3 from 'sqlite3'
// import fs from 'fs'

const db = new sqlite3.Database('../users.db', (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err.message);
    } else {
        console.log('Connecté à la base de données SQLite.');
    }
});

// Création de la table users
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        );`
    );

    db.run(`
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            score DECIMAL,
            date_taken DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );`
    );
});

export async function addNewUser(username, password) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';

        db.run(sql, [username, password], function (err) {
            if (err) {
                console.error('Error inserting user:', err.message);
                reject(err);
                return;
            }

            // this.lastID contains the ID of the newly inserted row
            console.log(`User added with ID: ${this.lastID}`);
            resolve(this.lastID);
        });
    });
}

export async function getPassword(username) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, password FROM users WHERE username = ?';

        db.get(sql, [username], (err, row) => {
            if (err) {
                console.error('Database error:', err.message);
                reject(err);
                return;
            }

            if (!row) {
                // No user found with this username
                reject("User doesn't exist");
                return;
            }

            // Return the user ID and password
            resolve({
                id: row.id,
                password: row.password
            });
        });
    });
}

export async function addNewScore(userid, score) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO scores (user_id, score) VALUES (?, ?)';

        db.run(sql, [userid, score], function (err) {
            if (err) {
                console.error('Error inserting score:', err.message);
                reject(err);
                return;
            }

            // this.lastID contains the ID of the newly inserted row
            console.log(`Score added with ID: ${this.lastID}`);
            resolve(this.lastID);
        });
    });
}
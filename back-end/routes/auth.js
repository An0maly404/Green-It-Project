import sqlite3 from 'sqlite3'

// const db = new sqlite3.Database('../users.db', (err) => {
//     if (err) {
//         console.error('Erreur de connexion à la base de données:', err.message);
//     } else {
//         console.log('Connecté à la base de données SQLite.');
//     }
// });

// Création de la table users
// db.serialize(() => {
//     db.run(`
//     CREATE TABLE users (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         username TEXT NOT NULL UNIQUE,
//         password TEXT NOT NULL
//     );

//     CREATE TABLE scores (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         user_id INTEGER,
//         score INTEGER,
//         date_taken DATETIME DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (user_id) REFERENCES users(id)
//     );
//   `);
// });


export async function addNewUser(username, password) {
    return 1
}

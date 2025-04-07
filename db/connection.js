const mysql = require('mysql2');
const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

conn.connect((error) => {
    if (error) {
        console.log('Error connecting to database', error.code);
        return;
    }
    console.log('Connected to database successfully');
});

module.exports = conn;



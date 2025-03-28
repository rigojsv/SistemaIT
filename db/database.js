const mysql = require('mysql2/promise');

const conn = mysql.createconnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

conn.connect((err) => {
  if (err){
    console.log('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database!');
});

module.exports = conn;
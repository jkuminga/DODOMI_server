var mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host  : process.env.DB_HOST,
    port  : process.env.DB_PORT,
    user  : 'root',
    password    : process.env.DB_PASSWORD,
    database    : process.env.DB_DATABASE
});

db.connect();

module.exports = db;
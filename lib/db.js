var mysql = require('mysql');
require('dotenv').config();

const db = mysql.createConnection({
    host  : 'localhost',
    user  : 'root',
    password    : process.env.DB_PASSWORD,
    database    : 'mydb',
});

db.connect();

module.exports = db;
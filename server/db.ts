const mysql = require("mysql2");

mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'monthify_db'
}).promise();


const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });

const mysql = require("mysql2");
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
}).promise();

async function getUsers() {
    try {
        const [rows] = await pool.query("SELECT * FROM users");
        console.log(rows);
        return rows;
    } catch (error) {
        console.error("Error querying the database:", error);
    } finally {
        pool.end();
    }
}

async function getUser(id: number) {
    try {
        const [rows] = await pool.query(`
        SELECT *
        FROM users
        WHERE id = ?
        `, [id]);
        console.log(rows[0]);
        return rows[0];
    } catch (error) {
        console.error("Error querying the database:", error);
    } finally {
        pool.end();
    }
}

getUser(1);
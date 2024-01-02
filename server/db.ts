import dotenv from "dotenv";
dotenv.config({ path: "../config.env" });

import mysql, { RowDataPacket } from "mysql2";
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
}).promise();

export async function createUser(spotify_username: string, refresh_token: string) {
    try {
        await pool.query(`
        INSERT INTO users (spotify_username, refresh_token)
        VALUES (?, ?)
        `, [spotify_username, refresh_token]);
        console.log(`User with username ${spotify_username} successfully added to database.`)
    } catch (error) {
        console.error("Error inserting user into database:", error);
    }
}

export async function getUsers() {
    try {
        const [rows] = await pool.query("SELECT * FROM users");
        console.log(rows);
        return rows;
    } catch (error) {
        console.error("Error getting users from database:", error);
    } 
}

export async function getUserById(id: number) {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT *
        FROM users
        WHERE id = ?
        `, [id]);
        console.log(rows[0]);
        return rows[0];
    } catch (error) {
        console.error("Error getting user from database:", error);
    }
}

export async function deleteUser(id: number) {
    try {
        await pool.query(`
        DELETE FROM users
        WHERE id = ?
        `, [id]);
        console.log(`User with id ${id} deleted successfully.`)
    } catch (error) {
        console.error(`Error deleting user with id ${id} from database:`, error);
    } 
}


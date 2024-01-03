import dotenv from "dotenv";
dotenv.config({ path: "../config.env" });

import mysql, { RowDataPacket } from "mysql2";
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
}).promise();

export async function createUser(spotify_display_name: string, spotify_id: string, refresh_token: string) {
    try {
        await pool.query(`
        INSERT INTO users (spotify_display_name, spotify_id, refresh_token)
        VALUES (?, ?, ?)
        `, [spotify_display_name, spotify_id, refresh_token]);
        console.log(`User ${spotify_display_name} successfully added to database.`)
    } catch (error) {
        console.error("Error inserting user into database:", error);
    }
}

export async function getUsers() {
    try {
        const [rows] = await pool.query("SELECT * FROM users");
        return rows as RowDataPacket[];
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
        return rows[0];
    } catch (error) {
        console.error("Error getting user from database:", error);
    }
}

export async function deleteUser(sptoify_id: string) {
    try {
        await pool.query(`
        DELETE FROM users
        WHERE spotify_id = ?
        `, [sptoify_id]);
        console.log(`User with username ${sptoify_id} deleted successfully.`)
    } catch (error) {
        console.error(`Error deleting user with username ${sptoify_id} from database:`, error);
    } 
}


import dotenv from "dotenv";
dotenv.config({ path: "../config.env" });

import mysql, { RowDataPacket } from "mysql2";
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
}).promise();

// USERS TABLE

export async function createUser(spotify_display_name: string, spotify_user_id: string, refresh_token: string) {
    try {
        await pool.query(`
        INSERT INTO users (spotify_display_name, spotify_user_id, refresh_token)
        VALUES (?, ?, ?)
        `, [spotify_display_name, spotify_user_id, refresh_token]);
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

export async function deleteUser(spotify_user_id: string) {
    try {
        await pool.query(`
        DELETE FROM users
        WHERE spotify_user_id = ?
        `, [spotify_user_id]);
        console.log(`User with username ${spotify_user_id} deleted successfully.`)
    } catch (error) {
        console.error(`Error deleting user with username ${spotify_user_id} from database:`, error);
    } 
}

// MONTH TABLE

export async function updateMonth(current_month: number) {
    try {
        await pool.query(`
        UPDATE month SET current_month = ?
        `, [current_month]);
        console.log(`Current month value updated to ${current_month} in database.`)
    } catch (error) {
        console.error("Error updating current month value in database:", error);
    }
}

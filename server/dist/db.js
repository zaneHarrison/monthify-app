import dotenv from 'dotenv';
dotenv.config({ path: '../config.env' });
import mysql from 'mysql2';
const pool = mysql
    .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
})
    .promise();
// USERS TABLE
// Add a new user
export async function createUser(spotify_display_name, spotify_user_id, refresh_token) {
    try {
        await pool.query(`
        INSERT INTO users (spotify_display_name, spotify_user_id, refresh_token)
        VALUES (?, ?, ?)
        `, [spotify_display_name, spotify_user_id, refresh_token]);
        console.log(`User ${spotify_display_name} successfully added to database`);
    }
    catch (error) {
        console.error('Error inserting user into database:', error);
        throw error;
    }
}
// Retrieve a list of all users
export async function getUsers() {
    try {
        const [rows] = await pool.query('SELECT * FROM users');
        return rows;
    }
    catch (error) {
        console.error('Error getting users from database:', error);
        return [];
    }
}
// Retrieve a user from their id
export async function getUserById(spotify_user_id) {
    try {
        const [rows] = await pool.query(`
        SELECT *
        FROM users
        WHERE spotify_user_id = ?
        `, [spotify_user_id]);
        return rows[0];
    }
    catch (error) {
        console.error('Error getting user from database:', error);
    }
}
// Delete a user from their id
export async function deleteUser(spotify_user_id) {
    try {
        await pool.query(`
        DELETE FROM users
        WHERE spotify_user_id = ?
        `, [spotify_user_id]);
        console.log(`User with username ${spotify_user_id} deleted successfully`);
    }
    catch (error) {
        console.error(`Error deleting user with username ${spotify_user_id} from database:`, error);
    }
}
// Update a user's monthly_playlist_id value
export async function updateUsersMonthlyPlaylistId(spotify_user_id, monthly_playlist_id) {
    try {
        await pool.query(`
        UPDATE users
        SET monthly_playlist_id = ?
        WHERE spotify_user_id = ?;
        `, [monthly_playlist_id, spotify_user_id]);
        console.log(`Successfully updated monthly_playlist_id value for user with username ${spotify_user_id}`);
    }
    catch (error) {
        console.error(`Error updating monthly_playlist_id value for user with username ${spotify_user_id}:`, error);
    }
}
// Update a user's monthly_playlist_id value
export async function updateMonthify30Id(spotify_user_id, monthify_30_id) {
    try {
        await pool.query(`
        UPDATE users
        SET monthify_30_id = ?
        WHERE spotify_user_id = ?;
        `, [monthify_30_id, spotify_user_id]);
        console.log(`Successfully updated monthify_30_id value for user with username ${spotify_user_id}`);
    }
    catch (error) {
        console.error(`Error updating monthify_30_id value for user with username ${spotify_user_id}:`, error);
    }
}
// MONTH TABLE
// Update the last month value stored in database
export async function updateLastMonth(last_month) {
    try {
        await pool.query(`
        UPDATE month SET last_month = ?
        `, [last_month]);
        console.log(`Current month value updated to ${last_month} in database`);
    }
    catch (error) {
        console.error('Error updating current month value in database:', error);
    }
}
// Get the last month value stored in database
export async function getLastMonth() {
    try {
        const [rows] = await pool.query('SELECT last_month FROM month');
        return rows[0].last_month;
    }
    catch (error) {
        console.error('Error getting value of last month from database:', error);
    }
}

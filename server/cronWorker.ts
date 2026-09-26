import { getUsers } from './db.js'
import axios from 'axios'
import querystring from 'querystring'
import dotenv from 'dotenv'
import { updateMonthifyPlaylists } from './utils/playlistLogic.js'

// Enable the use of environment variables
dotenv.config({ path: '../config.env' })

// Access environment variables stored in .env file
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

// Define the task
export async function runTask() {
    // Shared "now" for this run, in UTC, passed to each user's playlist update
    const now = new Date()
    const current_year = now.getUTCFullYear()
    const current_month = now.getUTCMonth()

    // Iterate over each user in the database
    const users = await getUsers()
    await Promise.all(
        users
            .filter((user) => user.spotify_display_name === 'zane.harrison')
            .map(async (user) => {
                try {
                    const accessTokenResponse = await axios({
                        method: 'post',
                        url: 'https://accounts.spotify.com/api/token',
                        data: querystring.stringify({
                            grant_type: 'refresh_token',
                            refresh_token: user.refresh_token,
                        }),
                        headers: {
                            'content-type': 'application/x-www-form-urlencoded',
                            Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
                        },
                    })
                    const access_token = accessTokenResponse.data.access_token

                    // Use access token to update their Monthify playlists
                    try {
                        await updateMonthifyPlaylists(
                            user.spotify_user_id,
                            access_token,
                            current_year,
                            current_month
                        )
                    } catch (error) {
                        console.error(
                            `Error updating playlists for user with display name '${user.spotify_display_name}':`,
                            error
                        )
                    }
                } catch (error) {
                    console.error(
                        `Error retrieving access token for user with display name '${user.spotify_display_name}':`,
                        error
                    )
                }
            })
    )
}

// Run the task
// runTask()

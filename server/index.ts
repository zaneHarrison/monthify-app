import express, { Express } from 'express'
import dotenv from 'dotenv'
import querystring from 'querystring'
import axios from 'axios'
import { AxiosError, AxiosResponse } from 'axios'
import cookieParser from 'cookie-parser'
import { getLastMonth, getUsers, updateLastMonth } from './db.js'
import { ToadScheduler, SimpleIntervalJob, Task } from 'toad-scheduler'
import { updateMonthifyPlaylists } from './utils/playlistLogic.js'
import { RowDataPacket } from 'mysql2'
import { createServerRoutes } from './routes/index.js'

// Enable the use of environment variables
dotenv.config({ path: '../config.env' })

// Access environment variables stored in .env file
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

// Create app, assign backend port
const app: Express = express()
const port = parseInt(process.env.SERVER_PORT || '', 10)

// Add cookieParser middleware to application
app.use(cookieParser())

// Bring in server routes defined in "routes" directory
createServerRoutes(app)

// Bind application to port
app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})

// CODE FOR SCHEDULED TASK

// Scheduler for task
const scheduler = new ToadScheduler()

// Define scheduled task to run
const task = new Task('test-task', async () => {
    // Check if it's a new month
    const lastMonth = await getLastMonth()
    const currentMonth = new Date().getMonth()
    const is_new_month = lastMonth !== currentMonth
    // If it's a new month, update last month in database
    if (is_new_month) {
        await updateLastMonth(currentMonth)
    }

    // Iterate over each user in the database
    getUsers().then((response: RowDataPacket[]) => {
        response.forEach((user) => {
            if (user.spotify_display_name === 'zane.harrison') {
                // Get user information
                const spotify_id = user.spotify_user_id
                const refresh_token = user.refresh_token

                // Use user's refresh token to retrieve access token
                axios({
                    method: 'post',
                    url: 'https://accounts.spotify.com/api/token',
                    data: querystring.stringify({
                        grant_type: 'refresh_token',
                        refresh_token: refresh_token,
                    }),
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
                    },
                })
                    .then((response: AxiosResponse) => {
                        const access_token = response.data.access_token
                        // Use access token to update their Monthify playlists
                        updateMonthifyPlaylists(
                            spotify_id,
                            access_token,
                            is_new_month
                        )
                    })
                    .catch((error: AxiosError) => {
                        console.log(error)
                    })
            }
        })
    })
})

// Define and add scheduled job
const job = new SimpleIntervalJob({ seconds: 5 }, task)
scheduler.addSimpleIntervalJob(job)

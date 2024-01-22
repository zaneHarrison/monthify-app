import express, { Express } from 'express'
import dotenv from 'dotenv'
import querystring from 'querystring'
import axios from 'axios'
import { AxiosError, AxiosResponse } from 'axios'
import cookieParser from 'cookie-parser'
import { getLastMonth, getUsers } from './db.js'
import { ToadScheduler, SimpleIntervalJob, Task } from 'toad-scheduler'
import {
    getLikedSongs,
    getPlaylists,
    getTracksFromPlaylist,
    updatePlaylists,
} from './utils/playlistLogic.js'
import { RowDataPacket } from 'mysql2'
import { createServerRoutes } from './routes/index.js'
import { access } from 'fs'

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
    console.log('TASK STARTING')
    // Get all users from database
    getUsers().then((response: RowDataPacket[]) => {
        response.forEach((user) => {
            const spotify_id = user.spotify_user_id
            const refresh_token = user.refresh_token
            // Use user's refresh token to get access token
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
                    // getPlaylists(spotify_id, access_token)
                    // getTracksFromPlaylist(
                    //     access_token,
                    //     '0bYGcx0QW3w2RKYxdCF1AL'
                    // )
                    //updatePlaylists(spotify_id, access_token)
                    getLikedSongs(access_token)
                })
                .catch((error: AxiosError) => {
                    console.log(error)
                })
        })
    })
})

const job = new SimpleIntervalJob({ seconds: 5 }, task)
scheduler.addSimpleIntervalJob(job)

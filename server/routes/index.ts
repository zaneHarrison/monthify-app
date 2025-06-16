import { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import { generateRandomString } from '../utils/helperFunctions.js'
import querystring from 'querystring'
import axios from 'axios'
import { AxiosError, AxiosResponse } from 'axios'
import { createUser, getUserById, deleteUser } from '../db.js'
import {
    createMonthify30Playlist,
    createMonthlyPlaylist,
} from '../utils/playlistLogic.js'

// Enable the use of environment variables
dotenv.config({ path: '../config.env' })

// Access environment variables stored in .env file
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const CLIENT_BASE_URL = process.env.CLIENT_BASE_URL

// Expose backend routes
export function createServerRoutes(app: Express) {
    // Use variable to track state
    const stateKey = 'spotify_auth_state'

    // Route for user sign up
    app.get('/login', (req: Request, res: Response) => {
        // Generate state value and store in cookie
        const state = generateRandomString(16)
        res.cookie(stateKey, state)

        // Define authorized access levels for application
        const scope =
            'playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public user-read-private user-read-email user-library-read ugc-image-upload'

        // Build query string
        const queryParams: string = querystring.stringify({
            client_id: CLIENT_ID,
            response_type: 'code',
            redirect_uri: `${CLIENT_BASE_URL}/callback`,
            state: req.query.optOut ? 'optOut' : state,
            scope: scope,
            show_dialog: true,
        })

        // Request authorization
        console.log('Prompting user to authorize access to Spotify account')
        res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`)
    })

    // Callback route logic
    app.get('/callback', async (req: Request, res: Response) => {
        try {
            // Check state equality
            const state = (req.query.state as string) || null
            if (state !== 'optOut' && state !== req.cookies[stateKey]) {
                console.log(
                    'States do not match. Ending authorization flow and redirecting user to error page'
                )
                res.redirect(`${CLIENT_BASE_URL}/error`)
                return
            }

            // Redirect user to homepage if they deny authorization
            const error = (req.query.error as string) || undefined
            if (error) {
                console.log(
                    'Authorization denied. Redirecting user to homepage'
                )
                res.redirect(`${CLIENT_BASE_URL}`)
                return
            }

            // Extract authorization code parameter
            const authCode = (req.query.code as string) || null

            // Request access token using authorization code parameter value
            console.log('Retrieving access and refresh tokens')
            const tokenResponse = await axios({
                method: 'post',
                url: 'https://accounts.spotify.com/api/token',
                data: querystring.stringify({
                    grant_type: 'authorization_code',
                    code: authCode,
                    redirect_uri: `${CLIENT_BASE_URL}/callback`,
                }),
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
                },
            })
            if (tokenResponse.status !== 200) {
                res.send(tokenResponse)
                return
            }
            const { refresh_token, access_token, token_type } =
                tokenResponse.data

            // Fetch current user's information
            console.log('Fetching user spotify profile data')
            const spotifyProfileResponse = await axios.get(
                'https://api.spotify.com/v1/me',
                {
                    headers: {
                        Authorization: `${token_type} ${access_token}`,
                    },
                }
            )
            const spotify_display_name =
                spotifyProfileResponse.data.display_name
            const spotify_user_id = spotifyProfileResponse.data.id

            // Delete user from database if they are opting out
            if (state === 'optOut') {
                console.log(
                    `User has chosen to opt-out, deleting user ${spotify_user_id} from database`
                )
                deleteUser(spotify_user_id)
                res.redirect(`${CLIENT_BASE_URL}/opt-out-confirmation`)
                return
            }

            // Otherwise they're signing up so add user to database
            // Check if they're already in the database
            const existingUser = await getUserById(spotify_user_id)
            if (existingUser) {
                console.log('User already signed up, terminating sign up')
            } else {
                // User isn't already in the database, so add them
                console.log(
                    'User does not already exist in database, continuing with sign up'
                )
                // Add user to the database
                console.log(`Adding user ${spotify_user_id} to database`)
                await createUser(
                    spotify_display_name,
                    spotify_user_id,
                    refresh_token
                )
                // Create playlists for user signing up
                console.log(
                    `Creating current month's playlist for user ${spotify_user_id}`
                )
                createMonthlyPlaylist(spotify_user_id, access_token)
                console.log(
                    `Creating Monthify 30 playlist for user ${spotify_user_id}`
                )
                createMonthify30Playlist(spotify_user_id, access_token)
            }
            // Redirect user to signed up confirmation page
            res.redirect(`${CLIENT_BASE_URL}/sign-up`)
        } catch (error) {
            console.error('Error in /callback route:', error)
            res.send(error)
        }
    })

    // Refresh token route
    app.get('/refresh_token', async (req: Request, res: Response) => {
        const refresh_token: string | undefined =
            typeof req.query.refresh_token === 'string'
                ? req.query.refresh_token
                : undefined

        console.log('Retrieving new access token')
        try {
            const refreshTokenResponse = await axios({
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
            res.send(refreshTokenResponse.data)
        } catch (error) {
            console.log('Error retrieving a new access token')
            res.send(error)
        }
    })
}

import express, { Express, Request, Response, query } from "express";
import dotenv from "dotenv";
import { generateRandomString } from "./utils/helperFunctions.js";
import querystring from "querystring";
import axios from "axios";
import { AxiosError, AxiosResponse } from "axios";
import cookieParser from 'cookie-parser';
import { createUser, getUsers, getUserById, deleteUser } from "./db.js";
import { ToadScheduler, SimpleIntervalJob, Task } from "toad-scheduler";

// Enable the use of environment variables
dotenv.config({ path: "../config.env" });

// Access environment variables stored in .env file
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const CLIENT_BASE_URL = process.env.CLIENT_BASE_URL;
const SERVER_BASE_URL = process.env.SERVER_BASE_URL;

// Create app, assign backend port
const app: Express = express();
const port = parseInt(process.env.SERVER_PORT || "", 10);

// Use variable to track state
const stateKey = 'spotify_auth_state';

// Scheduler for hourly task
const scheduler = new ToadScheduler();

// Add cookieParser middleware to application
app.use(cookieParser());

// Bind application to port
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// Login route logic
app.get("/login", (req: Request, res: Response) => {
  // Generate state value and store in cookie
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  // Define authorized access levels for application
  const scope = 'playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public user-read-private user-read-email';

  // Build query string
  const queryParams: string = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    state: state,
    scope: scope,
    show_dialog: true
  });

  // Request authorization
  console.log("Prompting user to authorize access to Spotify account");
  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});


// Callback route logic
app.get('/callback', (req: Request, res: Response) => {
  // Check state equality
  const state = req.query.state as string || null;
  if (state !== req.cookies[stateKey]) {
    console.log("States do not match. Ending authorization flow and redirecting user to error page.");
    res.redirect(`${CLIENT_BASE_URL}/error`);
    return;
  }

  // Redirect user to homepage if they deny authorization
  const error = req.query.error as string || undefined;
  if (error) {
    console.log("Authorization denied. Redirecting user to homepage.")
    res.redirect(`${CLIENT_BASE_URL}`);
    return;
  }
  
  // Extract code parameter
  const code = req.query.code as string || null;

  // Request access token using code parameter value
  console.log("Retrieving access and refresh tokens");
  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
  })
    .then((response: AxiosResponse) => {
      if (response.status === 200) {

        const { refresh_token, access_token, token_type } = response.data;

        axios.get('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `${token_type} ${access_token}`
          }
        })
          .then(response => {
            const spotify_display_name = response.data.display_name;
            const spotify_id = response.data.id;
            createUser(spotify_display_name, spotify_id, refresh_token);
            res.redirect(`${CLIENT_BASE_URL}/signed-up`);
          })
          .catch(error => {
            res.send(error);
          });

        // const { refresh_token } = response.data;

        // axios.get(`${SERVER_BASE_URL}/refresh_token?refresh_token=${refresh_token}`)
        //   .then((response: AxiosResponse) => {
        //     res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);
        //   })
        //   .catch((error: AxiosError) => {
        //     res.send(error);
        //   });

      } else {
        res.send(response);
      }
    })
    .catch((error: AxiosError) => {
      res.send(error);
    });
});

// Refresh token route
app.get('/refresh_token', (req: Request, res: Response) => {
 
  const refresh_token: string | undefined = typeof req.query.refresh_token === 'string' ? req.query.refresh_token : undefined;

  console.log("Retrieving new access token");
  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
  })
    .then((response: AxiosResponse) => {
      res.send(response.data);
    }) 
    .catch((error: AxiosError) => {
      res.send(error);
    });
});

//*****************************************************************//
//                                                                 //
//                           TASK  LOGIC                           //
//                                                                 //
////***************************************************************//

const task = new Task('test-task', async () => {
  const users = await getUsers();
  users?.forEach(user => {
    const spotify_display_name = user.spotify_display_name;
    const spotify_id = user.spotify_id;
    const refresh_token = user.refresh_token;
    
    
  });
  // For each user
    // Use refresh token to get access token
    // Use access token to get list of their playlists
    // For each playlist
      // 

});
const job = new SimpleIntervalJob({seconds: 5, }, task);
scheduler.addSimpleIntervalJob(job);

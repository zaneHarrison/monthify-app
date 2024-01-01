import express, { Express, Request, Response, query } from "express";
import dotenv from "dotenv";
import { generateRandomString } from "./utils/helperFunctions.js";
import querystring from "querystring";
import axios from "axios";
import { AxiosError, AxiosResponse } from "axios";
import cookieParser from 'cookie-parser';
import { createUser, getUsers, getUserById, deleteUser } from "./db.js";

dotenv.config({ path: "../config.env" });

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const CLIENT_BASE_URL = process.env.CLIENT_BASE_URL;

const app: Express = express();
const port = parseInt(process.env.SERVER_PORT || "", 10);

const stateKey = 'spotify_auth_state';

app.use(cookieParser());

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

app.get("/login", (req: Request, res: Response) => {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  const scope = 'user-read-private user-read-email';

  const queryParams: string = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    state: state,
    scope: scope,
    show_dialog: true
  });

  console.log("Prompting user to authorize access to Spotify account");
  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

app.get('/callback', (req: Request, res: Response) => {
  const state = req.query.state as string || null;
  if (state !== req.cookies[stateKey]) {
    console.log("States do not match. Ending authorization flow and redirecting user to error page.");
    res.redirect(`${CLIENT_BASE_URL}/error`);
    return;
  }
  
  const code = req.query.code as string || null;

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

        const { refresh_token } = response.data;

        axios.get(`http://localhost:3000/refresh_token?refresh_token=${refresh_token}`)
          .then((response: AxiosResponse) => {
            res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);
          })
          .catch((error: AxiosError) => {
            res.send(error);
          });

      } else {
        res.send(response);
      }
    })
    .catch((error: AxiosError) => {
      res.send(error);
    });
});

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


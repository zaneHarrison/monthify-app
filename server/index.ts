import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { generateRandomString } from "./utils/helperFunctions";

dotenv.config({ path: "../config.env" });

const querystring = require('querystring');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const app: Express = express();
const port = parseInt(process.env.SERVER_PORT || "", 10);

app.get("/api", (req: Request, res: Response) => {
  res.json({ users: ["Tabitha", "is", "fart"] });
});

const stateKey = 'spotify_auth_state';

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
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

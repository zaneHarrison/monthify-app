import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config({ path: "../config.env" });

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const app: Express = express();
const port = parseInt(process.env.SERVER_PORT || "", 10);

app.get("/api", (req: Request, res: Response) => {
  res.json({ users: ["Tabitha", "is", "fart"] });
});

app.get("/login", (req: Request, res: Response) => {
  res.redirect(`https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}`);
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

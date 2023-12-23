import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config({ path: "../config.env" });

const app: Express = express();
const port = parseInt(process.env.SERVER_PORT || "", 10);

app.get("/api", (req: Request, res: Response) => {
  res.json({ users: ["Tabitha", "is", "fart"] });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

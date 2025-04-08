import express, { Express } from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { createServerRoutes } from './routes/index.js'

// Enable the use of environment variables
dotenv.config({ path: '../config.env' })

// Access environment variable stored in .env file
const SERVER_PORT = process.env.SERVER_PORT

// Create app, assign backend port
const app: Express = express()
const port = parseInt(SERVER_PORT || '', 10)

// Add cookieParser middleware to application
app.use(cookieParser())

// Bring in server routes defined in "routes" directory
createServerRoutes(app)

// Bind application to port
app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})

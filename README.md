# Monthify

Monthify is a web application that uses Spotify's API to automatically create playlists each month based on a user's Spotify listening activity for that month.
<br></br>

## What Monthify Does

Monthify uses each users' Liked Songs information to automatically create monthly playlists for them. Monthify creates two types of playlists: monthly playlists, and a "Monthify 30" playlist. 

Monthly playlists are titled "[current month] [current year]" and are created at the start of each month. As a user adds tracks to their Liked Songs during a particular month, the corresponding monthly playlist will be automatically updated to reflect these additions. If a user removes tracks from their Liked Songs, these changes will also be reflected in the monthly playlist. At the start of a new month, the previous monthly playlist will stop being updated and a new monthly playlist representing the new month will be created.

The "Monthify 30" playlist operates similarly to the monthly playlists, although this is a single playlist that will continue to be updated as long as a user is signed up with Monthify. Instead of including the tracks that a user has added to their Liked Songs during a particular month, it will do this for any tracks that a user had added within the past 30 days. Thus, it is meant to provide a snapshot of a user's newly liked songs for the past month at any given point in time. 

Both the monthly playlists and the "Monthify 30" playlist will update multiple times per day in order to accurately reflect a user's listening activity.
<br></br>

## How To Use Monthify

To use Monthify, simply sign up via the website. You will be prompted to sign in with Spotify and to authorize access to your Spotify account. This enables Monthify to access your Spotify data and to make changes to your account (this is required for the playlist creation functionality). 

Once signed up, you don't need to do anything else! Monthify will work behind the scenes to create and update your monthly playlists. 

You can opt-out of Monthify at any time through the website. Opting-out will not delete any playlists that Monthify has created within your Spotify account. Rather, it will stop your playlists from being updated and will prevent Monthify from creating any new playlists within your account.
<br></br>

## Technical Details 

Monthify consists of a backend Node.js server running Express as well as a MySQL database which is used to store user information. The frontend is built with Next.js.

At a high level, the application works by storing user information in the database when they sign up via the website. The Node backend then repeatedly executes a block of code according to a defined schedule which handles updating each users' playlists.
<br></br>

### Codebase Overview

Monthify is an open-source project, and you can view all of the source code in this GitHub repository.

The top-level "client" directory contains the code relating to the Next.js frontend, and the "server" directory contains the backend code. The "example.env" file at the same level is a copy of the "config.env" file which stores environment variables used within the code. The "config.env" file is not tracked by Git as it contains sensitive information, and the "example.env" file has an identical structure in an attempt to demonstrate the purpose/use of the "config.env" file.

Within the "server" directory, the "index.ts" file creates the Express application and binds the application to a port defined in the .env file. This file also imports the server routes created in an "index.ts" file within a "routes" directory and defines a scheduled task which will be run in order to update the users' playlists. 

As previously mentioned, the "routes" directory contains an "index.ts" file which defines the server routes. These include a /login, /callback, and /refresh_token route.

The "utils" directory contains a "playlistLogic.ts" file which includes the logic for creating and updating the users' playlists. Code within this file is called from the scheduled task in the "index.ts" server file. 

A "db.ts" file serves as the database connection and includes the logic for creating and updating user information in the database.

The MySQL database contains two tables, "users" and "month". The "users" table stores user information, and the "month" table simply stores the last recorded month so as to allow the application to know whether a new month has begun.
<br></br>

## Final Thoughts

Monthify is the first full-stack web application that I've developed on my own, and I should mention that I am by no means an expert in any of the technologies used to create this project. As I embarked on this project, my mindset was to learn anything that I needed to learn as I developed, and that's exactly what I did. After finishing the project, I feel as though I've gained a much deeper understanding of the technologies and concepts that I did work with, and I feel that I've become a much better programmer as a result. 

When starting programming projects, it's important to realize that you do not need to know how to do what you want to do when you start. Getting stuck, trying things out, and doing research to get unstuck is how you learn. Similarly, learning through acquiring new coding skills, watching YouTube videos, and reading about programming concepts is definitely a necessary component of improving as a developer, but at a certain point you need to dive into a project and try to build something. Embracing this mindset has significantly contributed to my growth as a developer.
<br></br>

## Helpful Resources

Here is a short list of resources that I found useful when working on this project:
* https://www.newline.co/courses/build-a-spotify-connected-app/implementing-the-authorization-code-flow
* https://www.youtube.com/watch?v=Hej48pi_lOc 
* https://developer.spotify.com/documentation/web-api 
<br></br>
<br></br>

Monthify is a personal project created by Zane Harrison.
<br></br>
<br></br>
<p align="center">
  <img width="463" height="646" src="https://github.com/zaneHarrison/monthify-app/assets/98977195/60bf25a4-40dc-4583-b3b1-77e1f2266502">
</p>

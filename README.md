# Monthify

Monthify is a web application that uses Spotify's API to automatically create playlists each month based on a user's Spotify listening activity.
<br></br>

## What Monthify Does

Monthify uses a users' Liked Songs data to automatically create monthly playlists. Monthify creates two types of playlists: monthly playlists, and a "Monthify 30" playlist. 

Monthly playlists are titled "[current month] [current year]" and are created at the start of each month. As a user adds tracks to their Liked Songs during a particular month, the corresponding monthly playlist is automatically updated to reflect these additions. If a user removes tracks from their Liked Songs, these changes are also reflected in the monthly playlist. At the start of a new month, the previous monthly playlist stops being updated and a new monthly playlist representing the new month is created.

The "Monthify 30" playlist operates similarly to the monthly playlists. The primary difference is that "Monthify 30" is a single playlist that is continuously updated as long as a user is signed up with Monthify. Instead of including the tracks that a user has added to their Liked Songs during a particular month, it includes any tracks that a user had added within the past 30 days. It is meant to provide a snapshot of a user's  Liked Songs for the past month at any given point in time. 

Both the monthly playlists and the "Monthify 30" playlist update multiple times per day in order to accurately reflect a user's listening activity.
<br></br>

## How To Use Monthify

To use Monthify, simply sign up via the website. You will be prompted to sign in with Spotify and to authorize access to your Spotify account. This enables Monthify to access your Spotify data and to make changes to your account (which is required for the playlist creation functionality). 

Once signed up, you don't need to do anything else! Monthify will work behind the scenes to create and update your monthly playlists. 

You can opt-out of Monthify at any time through the website. Opting-out will not delete any playlists that Monthify has created within your Spotify account. Rather, it will stop your playlists from being updated and will prevent Monthify from creating any new playlists in your account.
<br></br>

## Technical Details 

Monthify consists of a backend Node.js server running Express as well as a MySQL database which is used to store user information. The frontend is built with Next.js.

At a high level, the application works by storing user information in the database when they sign up via the website. According to a defined schedule, the Node.js backend repeatedly executes a block of code which loops through the users in the database and handles updating each users' playlists.
<br></br>

### Codebase Overview

Monthify is an open-source project, and you can view the source code in this GitHub repository.

The top-level "client" directory contains the code related to the Next.js frontend, and the "server" directory contains the backend code. The "example.env" file at the same level is a copy of the "config.env" file which stores environment variables used within the code. The "config.env" file is not tracked by Git as it contains sensitive information, and the "example.env" file has an identical structure in an attempt to demonstrate the purpose and use of the "config.env" file.

Within the "server" directory, the "index.ts" file creates the Express application and binds the application to a port defined in the .env file. This file also imports the server routes created in an "index.ts" file within a "routes" directory and defines a scheduled task which will be run in order to update the users' playlists. 

As previously mentioned, the "routes" directory contains an "index.ts" file which defines the server routes. These include a /login, /callback, and /refresh_token route.

The "utils" directory contains a "playlistLogic.ts" file which includes the logic for creating and updating the users' playlists. Code within this file is called from the scheduled task in the "index.ts" server file. 

A "db.ts" file serves as the database connection file and includes the logic for creating and updating user information in the database.

The MySQL database contains two tables, "users" and "month". The "users" table stores user information, and the "month" table simply stores the last recorded month so as to allow the application to know whether a new month has begun.
<br></br>

## Final Thoughts

Monthify is the first full-stack web application that I've developed on my own, and I think it's important to mention that I am by no means an expert in any of the technologies used to create this project. As I worked on this project, my mindset was to learn any skill/technology that I needed to learn in order to complete the project, and that's what I attempted to do. After completing the project, I feel as though I've gained a deeper understanding of the technologies and concepts that I did work with and feel that I've become a better programmer as a result. 

When starting programming projects, it's important to realize that you do not need to know how to do what you want to do when you begin. Getting stuck, trying things out, and looking things up to help you get un-stuck is how you learn. Similarly, learning through coding classes, watching YouTube videos, and reading about programming concepts is a necessary component of improving as a developer, but there comes a point when the best way to improve is to just dive into a project and attempt to build something. Embracing this mindset has significantly contributed to my growth as a developer.
<br></br>

## Helpful Resources

Here is a short list of resources that I found useful while working on this project:
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

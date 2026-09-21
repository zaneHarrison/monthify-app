# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Monthify creates monthly Spotify playlists (plus a rolling "Monthify 30" playlist) from a user's Liked Songs. It has a Next.js client (`client/`), an Express + TypeScript server (`server/`), and a MySQL database. See the README for product behavior.

## Commands

Run these from inside `client/` or `server/`, since both load `../config.env` relative to the working directory (copy `example.env` to create it).

- Client: `npm run dev`, `npm run build`, `npm run lint`
- Server: `npm run dev` (runs the `.ts` files), `npm run build` (`tsc` into `dist/`)
- `npm start` in `server/` runs the compiled `dist/index.js`, so it ignores `.ts` edits until you rebuild. `dist/` is committed to git.
- There is no test suite.

## Architecture

- The client is stateless UI. `client/next.config.js` proxies `/sign-up`, `/opt-out` and `/callback` to the server, which redirects back to client pages after the Spotify OAuth flow (`server/routes/index.ts`).
- `server/cronWorker.ts` (`runTask`) refreshes each user's Spotify token and calls `updateMonthifyPlaylists` in `server/utils/playlistLogic.ts`, which rewrites both playlists from the user's Liked Songs. There is currently no scheduler.
- All database access is in `server/db.ts`. The schema isn't in the repo: `users` and `month` tables.

## Spotify data safety

Never overwrite, add to, remove from, or otherwise edit a user's Liked Songs. Access to them is strictly read-only, with no exceptions, so no `PUT` or `DELETE` calls against `/me/tracks`.

## Code conventions

Add comments in the code when necessary, but keep them brief. Avoid multi-sentence comments within the code.

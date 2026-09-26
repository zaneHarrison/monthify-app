import axios from 'axios'
import { AxiosError, AxiosResponse } from 'axios'
import {
    updateUsersMonthlyPlaylist,
    updateMonthify30Id,
    getUserById,
} from '../db.js'
import fs from 'fs'

// Define Spotify track interface
interface SpotifyTrack {
    added_at: string
    track: {
        album: any[]
        artists: any[]
        available_markets: any[]
        disc_number: number
        duration_ms: number
        explicit: boolean
        external_ids: any
        external_urls: any
        href: string
        id: string
        is_local: boolean
        name: string
        popularity: number
        preview_url: string
        track_number: number
        type: string
        uri: string
    }
}

// Define Track interface
interface Track {
    added_at: string
    added_by: { id: string }
    track: {
        id: string
        name: string
        uri: string
    }
}

// API call to create the monthly playlist for a particular user
export async function createMonthlyPlaylist(
    spotify_user_id: string,
    access_token: string,
    current_year: number,
    current_month: number
) {
    // Construct playlist name
    const month_name = new Date(
        Date.UTC(current_year, current_month)
    ).toLocaleString('default', { month: 'long', timeZone: 'UTC' })
    const playlist_name = `${month_name} ${current_year}`

    try {
        // Create playlist via API call
        const createMonthlyPlaylistResponse = await axios.post(
            `https://api.spotify.com/v1/users/${spotify_user_id}/playlists`,
            {
                name: playlist_name,
                description: `An automatically generated collection of tracks you've liked in ${month_name} of ${current_year}`,
                public: false,
            },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
            }
        )
        console.log(
            `Successfully created '${playlist_name}' playlist for user ${spotify_user_id}`
        )
        // Store playlist ID, along with the year/month it was created for
        const monthly_playlist_id = createMonthlyPlaylistResponse.data.id
        await updateUsersMonthlyPlaylist(
            spotify_user_id,
            monthly_playlist_id,
            current_year,
            current_month
        )

        return monthly_playlist_id
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('API error:', error.response?.data || error.message)
        } else {
            console.error('Unexpected error:', error)
        }
        throw error
    }
}

// API call to create the Monthify 30 playlist for a particular user
export async function createMonthify30Playlist(
    spotify_user_id: string,
    access_token: string
) {
    try {
        const createMonthify30PlaylistResponse = await axios.post(
            `https://api.spotify.com/v1/users/${spotify_user_id}/playlists`,
            {
                name: 'Monthify 30',
                description:
                    "An automatically generated collection of tracks you've liked in the past 30 days",
                public: false,
            },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
            }
        )
        console.log(
            `Successfully created 'Monthify 30' playlist for user ${spotify_user_id}`
        )
        // Store playlist ID in database
        const monthify_30_id = createMonthify30PlaylistResponse.data.id
        await updateMonthify30Id(spotify_user_id, monthify_30_id)

        // Add playlist image for Monthify 30 playlist
        const base64Encoding = fs.readFileSync(
            './public/monthify30CoverImage.txt',
            'utf-8'
        )
        updatePlaylistImage(base64Encoding, monthify_30_id, access_token)

        return monthify_30_id
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('API error:', error.response?.data || error.message)
        } else {
            console.error('Unexpected error:', error)
        }
    }
}

export async function updatePlaylistImage(
    base64Encoding: string,
    playlist_id: string,
    access_token: string
) {
    try {
        // API call to upload playlist image
        await axios.put(
            `https://api.spotify.com/v1/playlists/${playlist_id}/images`,
            base64Encoding,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    'Content-Type': 'image/jpeg',
                },
            }
        )
        console.log(`Successfully set Monthify 30 playlist image`)
    } catch (error: any) {
        // Retry image update in the case of a 503 error
        if (error.response && error.response.status === 503) {
            // Wait 1 second
            await new Promise((resolve) => setTimeout(resolve, 1000))
            // Retry image update
            await updatePlaylistImage(base64Encoding, playlist_id, access_token)
        }
        console.log(`Error setting Monthify 30 playlist image: ${error}`)
    }
}

// THIS FUNCTION IS CURRENTLY UNUSED. MONTHIFY IS ONLY CONSIDERING TRACKS FROM EACH USERS' LIKED SONGS RATHER THAN FROM EACH OF THEIR PLAYLISTS
// Function to generate a list of playlists for a particular user
export async function getPlaylists(
    spotify_user_id: string,
    access_token: string
) {
    // Get name of monthly playlist
    const current_date = new Date()
    const current_month = current_date.toLocaleString('default', {
        month: 'long',
    })
    const current_year = current_date.getFullYear()
    const montly_playlist_name = `${current_month} ${current_year}`

    // Array to hold playlist ids
    let playlistIds: string[] = []

    // API endpoint for each request, updated with each response
    let next: string | null =
        `https://api.spotify.com/v1/users/${spotify_user_id}/playlists?limit=50`

    // Request 50 playlists at a time
    while (next) {
        const response: AxiosResponse = await axios.get(`${next}`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })
        // Logic to playlists to array
        const playlists = response.data.items

        playlists.forEach((playlist: any) => {
            // Only add non-collaborative playlists owned by the user, and skip monthly playlist
            if (
                playlist.collaborative === false &&
                playlist.name !== montly_playlist_name &&
                playlist.name !== 'Monthify 30' &&
                playlist.owner.id === spotify_user_id
            ) {
                playlistIds.push(playlist.id)
            }
        })

        // Reasign variable to fetch next set of 50 playlists
        next = response.data.next
    }
    return playlistIds
}

// Function to check if a date is more than X days ago
function isMoreThanXDaysAgo(dateString: string, numDays: number): boolean {
    // Compare dates
    const dateToCheck = new Date(dateString)
    const currentDate = new Date()
    // Get time difference in seconds
    const timeDifference = currentDate.getTime() - dateToCheck.getTime()
    const daysDifference = timeDifference / (1000 * 60 * 60 * 24)
    return daysDifference > numDays
}

// THIS FUNCTION IS CURRENTLY UNUSED. MONTHIFY IS ONLY CONSIDERING TRACKS FROM EACH USERS' LIKED SONGS RATHER THAN FROM EACH OF THEIR PLAYLISTS
// Function to get tracks from a playlist
export async function getTracksFromPlaylist(
    access_token: string,
    playlist_id: string
): Promise<Set<Track>> {
    // Set to store playlist tracks
    let tracks: Set<Track> = new Set()

    // API endpoint for each request, updated with each response
    let next: string | null =
        `https://api.spotify.com/v1/playlists/${playlist_id}/tracks?limit=50&fields=next,items(added_at,added_by.id,track(name,id,uri))`

    // Request 50 songs from playlist at a time
    while (next) {
        const response: AxiosResponse = await axios.get(`${next}`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })
        // Add tracks to set
        tracks = new Set([...tracks, ...response.data.items])

        // Stop looping if the last track of the current batch was added more than 31 days ago
        const tracksResponse = response.data.items
        const lastTrack = tracksResponse[tracksResponse.length - 1]
        if (lastTrack === undefined) break
        // Assign added_at old value if null
        const lastTrackAddedAt =
            lastTrack.added_at !== null
                ? lastTrack.added_at
                : '2000-01-01T00:00:00Z'
        if (isMoreThanXDaysAgo(lastTrackAddedAt, 31)) {
            break
        }

        // Reassign endpoint
        next = response.data.next
    }

    // Return set of tracks
    return tracks
}

// Function to check whether two dates have the same month and year
function haveSameMonthAndYear(
    dateString1: string,
    dateString2: string
): boolean {
    const date1 = new Date(dateString1)
    const date2 = new Date(dateString2)

    const year1 = date1.getUTCFullYear()
    const month1 = date1.getUTCMonth()

    const year2 = date2.getUTCFullYear()
    const month2 = date2.getUTCMonth()

    return year1 === year2 && month1 === month2
}

// Function to get a list of potential tracks for monthly and Monthify 30 playlists
async function getPotentialTracks(
    spotify_user_id: string,
    access_token: string
) {
    // Get user's information
    const user = await getUserById(spotify_user_id)
    if (user) {
        // Create set of potential tracks to add
        let tracks: Set<Track> = new Set()

        // Add user's liked songs to set of potential tracks to add
        const likedSongs = await getLikedSongs(access_token, spotify_user_id)
        tracks = new Set([...tracks, ...likedSongs])

        return tracks
    }
    return new Set<Track>()
}

// Function to update user's Monthify playlists
export async function updateMonthifyPlaylists(
    spotify_user_id: string,
    access_token: string,
    current_year: number,
    current_month: number
) {
    const user = await getUserById(spotify_user_id)
    if (!user) return

    const needs_new_monthly_playlist =
        user.monthly_playlist_year !== current_year ||
        user.monthly_playlist_month !== current_month

    let monthly_playlist_id = user.monthly_playlist_id
    // Tracks if creation was needed but failed to prevent overwriting the stale playlist with this month's tracks
    let skip_monthly_update = false

    if (needs_new_monthly_playlist) {
        console.log(
            `New month has begun, creating new monthly playlist for user ${spotify_user_id}`
        )
        try {
            monthly_playlist_id = await createMonthlyPlaylist(
                spotify_user_id,
                access_token,
                current_year,
                current_month
            )
        } catch {
            console.error(
                `Failed to create monthly playlist for user ${spotify_user_id}, will retry next run`
            )
            skip_monthly_update = true
        }
    }

    // Get potential songs for montly playlist and Monthify 30 playlist
    const potentialTracks: Set<Track> = await getPotentialTracks(
        spotify_user_id,
        access_token
    )

    // Set to hold monthly playlist tracks
    const monthly_playlist_tracks_set: Set<string> = new Set()
    // Set to hold Monthify 30 tracks
    const monthify_30_tracks_set: Set<string> = new Set()

    const current_date = new Date(
        Date.UTC(current_year, current_month)
    ).toISOString()

    // Populate monthly playlist and Monthify 30 playlist
    potentialTracks.forEach((track: Track) => {
        // Get track's date added, set to old value if null
        const date_added: string =
            track.added_at !== null ? track.added_at : '2000-01-01T00:00:00Z'

        // Add track to monthly playlist set
        if (haveSameMonthAndYear(current_date, date_added)) {
            monthly_playlist_tracks_set.add(track.track.uri)
        }
        // Add track to Monthify 30 set
        if (!isMoreThanXDaysAgo(date_added, 30)) {
            monthify_30_tracks_set.add(track.track.uri)
        }
    })

    // Convert sets to lists
    const monthly_playlist_tracks = Array.from(monthly_playlist_tracks_set)
    const monthify_30_tracks = Array.from(monthify_30_tracks_set)

    // Update monthly playlist, unless creating a new one failed above
    if (!skip_monthly_update) {
        try {
            await updateSpotifyPlaylist(
                access_token,
                monthly_playlist_id,
                monthly_playlist_tracks
            )
            console.log(
                `Successfully updated monthly playlist for user: ${user.spotify_display_name}`
            )
        } catch {
            console.error(
                `Failed to update monthly playlist for user: ${user.spotify_display_name}`
            )
        }
    }
    // Update Monthify 30 playlist
    try {
        await updateSpotifyPlaylist(
            access_token,
            user.monthify_30_id,
            monthify_30_tracks
        )
        console.log(
            `Successfully updated Monthify 30 playlist for user: ${user.spotify_display_name}`
        )
    } catch {
        console.error(
            `Failed to update Monthify 30 playlist for user: ${user.spotify_display_name}`
        )
    }
}

// Function to get a user's liked songs
export async function getLikedSongs(
    access_token: string,
    spotify_user_id: string
) {
    // Create set to hold tracks
    let tracks: Set<Track> = new Set()

    // Dynamic API endpoint
    let next: string | null =
        `https://api.spotify.com/v1/me/tracks?offset=0&limit=50`

    // Get 50 songs at a time
    while (next) {
        const response: AxiosResponse = await axios.get(`${next}`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })

        // Convert response tracks to form of Track interface
        let responseTracks: Set<Track> = new Set()
        response.data.items.forEach((track: SpotifyTrack) => {
            // Get track's date added, set to old value if null
            const track_added_at =
                track.added_at !== null
                    ? track.added_at
                    : '2000-01-01T00:00:00Z'
            // Convert SpotifyTrack object to Track object
            const transformedTrack: Track = {
                added_at: track_added_at,
                added_by: { id: spotify_user_id },
                track: {
                    id: track.track.id,
                    name: track.track.name,
                    uri: track.track.uri,
                },
            }
            // Add track to running set
            responseTracks.add(transformedTrack)
        })

        // Add tracks to set
        tracks = new Set([...tracks, ...responseTracks])

        // Stop looping if the last track of the current batch was added more than 31 days ago
        const tracksResponse = response.data.items
        const lastTrack = tracksResponse[tracksResponse.length - 1]
        if (lastTrack === undefined) break
        // Get track's date added, set to old value if null
        const lastTrackAddedAt =
            lastTrack.added_at !== null
                ? lastTrack.added_at
                : '2000-01-01T00:00:00Z'

        // Break if last track of current batch was added more than 31 days ago
        if (isMoreThanXDaysAgo(lastTrackAddedAt, 31)) {
            break
        }

        // Reassign endpoint
        next = response.data.next
    }
    return tracks
}

// Spotify accepts at most 100 items per request to the playlist items endpoints
const MAX_ITEMS_PER_REQUEST = 100

// Function to update the contents of a playlist
export async function updateSpotifyPlaylist(
    access_token: string,
    playlist_id: string,
    trackUris: string[]
) {
    // Define request endpoint
    const endpoint: string = `https://api.spotify.com/v1/playlists/${playlist_id}/items`
    const config = {
        headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
        },
    }

    // API calls to update playlist
    try {
        // Replace playlist contents with the first batch of tracks
        await axios.put(
            endpoint,
            { uris: trackUris.slice(0, MAX_ITEMS_PER_REQUEST) },
            config
        )
        // Append any remaining tracks, one batch at a time to preserve order
        for (
            let i = MAX_ITEMS_PER_REQUEST;
            i < trackUris.length;
            i += MAX_ITEMS_PER_REQUEST
        ) {
            await axios.post(
                endpoint,
                { uris: trackUris.slice(i, i + MAX_ITEMS_PER_REQUEST) },
                config
            )
        }
    } catch (error) {
        console.log(`Error updating playlist: ${error}`)
        throw error
    }
}

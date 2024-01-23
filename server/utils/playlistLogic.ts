import axios from 'axios'
import { AxiosError, AxiosResponse } from 'axios'
import {
    updateUsersMonthlyPlaylistId,
    updateMonthify30Id,
    getLastMonth,
    updateLastMonth,
    getUserById,
} from '../db.js'

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
    access_token: string
) {
    // Get current date
    const current_date = new Date()
    // Construct playlist name
    const current_month = current_date.toLocaleString('default', {
        month: 'long',
    })
    const current_year = current_date.getFullYear()
    const playlist_name = `${current_month} ${current_year}`
    // Create playlist via API call
    axios
        .post(
            `https://api.spotify.com/v1/users/${spotify_user_id}/playlists`,
            {
                name: playlist_name,
                description: `An automatically generated collection of tracks you've added to your playlists in ${current_month} of ${current_year}.`,
                public: false,
            },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
            }
        )
        .then((response: AxiosResponse) => {
            console.log(
                `Successfully created '${playlist_name}' playlist for user ${spotify_user_id}`
            )
            // Store playlist ID in database
            const monthly_playlist_id = response.data.id
            updateUsersMonthlyPlaylistId(spotify_user_id, monthly_playlist_id)
            console.log(
                `Successfully updated monthly_playlist_id value for user with username ${spotify_user_id}`
            )
            return response.data.id
        })
        .catch((error: AxiosError) => {
            console.log(`Error: ${error}`)
        })
    return
}

// API call to create the Monthify 30 playlist for a particular user
export async function createMonthify30Playlist(
    spotify_user_id: string,
    access_token: string
) {
    // Create playlist via API call
    axios
        .post(
            `https://api.spotify.com/v1/users/${spotify_user_id}/playlists`,
            {
                name: 'Monthify 30',
                description:
                    'An automatically curated playlist of your tracks from the past 30 days.',
                public: false,
            },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
            }
        )
        .then((response: AxiosResponse) => {
            console.log(
                `Successfully created 'Monthify 30' playlist for user ${spotify_user_id}`
            )
            // Store playlist ID in database
            const monthify_30_id = response.data.id
            updateMonthify30Id(spotify_user_id, monthify_30_id)
            console.log(
                `Successfully updated monthly_30_id value for user with username ${spotify_user_id}`
            )
            return response.data.id
        })
        .catch((error: AxiosError) => {
            console.log(`Error: ${error}`)
        })
    return
}

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
    const dateToCheck = new Date(dateString)
    const currentDate = new Date()
    const timeDifference = currentDate.getTime() - dateToCheck.getTime()
    const daysDifference = timeDifference / (1000 * 60 * 60 * 24)
    return daysDifference > numDays
}

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
        if (isMoreThanXDaysAgo(lastTrack.added_at, 31)) {
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

// Function to get a list of tracks for monthly playlist
async function getMonthlyPlaylistTracks(
    spotify_user_id: string,
    access_token: string
) {
    // Get user's information
    const user = await getUserById(spotify_user_id)
    if (user) {
        // Create set of tracks for monthly playlist
        let monthly_playlist_tracks: Set<string> = new Set()
        // Get list of user's playlists
        const playlists: string[] = await getPlaylists(
            spotify_user_id,
            access_token
        )
        // Create set of potential tracks to add
        let tracks: Set<Track> = new Set()
        // Populate set of potential tracks to add using playlists
        for (const playlist_id of playlists) {
            const playlistTracks = await getTracksFromPlaylist(
                access_token,
                playlist_id
            )
            tracks = new Set([...tracks, ...playlistTracks])
        }
        // Add user's liked songs to set of potential tracks to add
        const likedSongs = await getLikedSongs(access_token, spotify_user_id)
        tracks = new Set([...tracks, ...likedSongs])

        // Retrieve user's playlist id
        const monthly_playlist_id = user.monthly_playlist_id

        // Populate monthly playlist and Monthify 30 playlist
        tracks.forEach((track: Track) => {
            const current_date = new Date().toISOString()
            //console.log('Current date: ' + current_date)
            const date_added: string = track.added_at
            //console.log('Song added date: ' + date_added)
            if (haveSameMonthAndYear(current_date, date_added)) {
                monthly_playlist_tracks.add(track.track.name)
            }
        })
        console.log(monthly_playlist_tracks)
    }
}

async function getMonthify30Tracks() {}

// Function to update user's monthly playlist
export async function updatePlaylists(
    spotify_user_id: string,
    access_token: string
) {
    // First check if it's a new month
    const lastMonth = await getLastMonth()
    const currentMonth = new Date().getMonth()
    // If it's a new month
    if (lastMonth !== currentMonth) {
        // Update last month in database
        await updateLastMonth(currentMonth)
        // Create new monthly playlist for user
        await createMonthlyPlaylist(spotify_user_id, access_token)
    }
    getMonthlyPlaylistTracks(spotify_user_id, access_token)
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
            const transformedTrack: Track = {
                added_at: track.added_at,
                added_by: { id: spotify_user_id },
                track: {
                    id: track.track.id,
                    name: track.track.name,
                    uri: track.track.uri,
                },
            }
            responseTracks.add(transformedTrack)
        })

        // Add tracks to set
        tracks = new Set([...tracks, ...responseTracks])

        // Stop looping if the last track of the current batch was added more than 31 days ago
        const tracksResponse = response.data.items
        const lastTrack = tracksResponse[tracksResponse.length - 1]
        if (isMoreThanXDaysAgo(lastTrack.added_at, 31)) {
            break
        }

        // Reassign endpoint
        next = response.data.next
    }
    return tracks
}

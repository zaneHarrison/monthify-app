import axios from "axios";
import { AxiosError, AxiosResponse } from "axios";
import { updateUsersMonthlyPlaylistId, updateMonthify30Id } from "../db.js";

// API call to return list of playlists for a particular user
export async function getPlaylists(spotify_user_id: string, access_token: string) {
    axios.get(`https://api.spotify.com/v1/users/${spotify_user_id}/playlists?limit=1`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    })
        .then((response: AxiosResponse) => {
            console.log("Playlists retrieved.");
        })
    return;
}

// API call to create the monthly playlist for a particular user
export async function createMonthlyPlaylist(spotify_user_id: string, access_token: string, current_date: Date) {
  // Construct playlist name
  const current_month = current_date.toLocaleString('default', { month: 'long' });
  const current_year = current_date.getFullYear();
  const playlist_name = `${current_month} ${current_year}`;
  // Create playlist via API call
  axios.post(`https://api.spotify.com/v1/users/${spotify_user_id}/playlists`, 
      {
        "name": playlist_name,
        "description": "An automatically generated collection of tracks you've added to playlists this month.",
        "public": false
      },
      {
        headers: {
          "Authorization": `Bearer ${access_token}`,
          "Content-Type": "application/json"
        }
      })
        .then((response: AxiosResponse) => {
          console.log(`Successfully created '${playlist_name}' playlist for user ${spotify_user_id}`);
          // Store playlist ID in database
          const monthly_playlist_id = response.data.id;
          updateUsersMonthlyPlaylistId(spotify_user_id, monthly_playlist_id);
          console.log(`Successfully updated monthly_playlist_id value for user with username ${spotify_user_id}`);
          return (response.data.id);
        })
        .catch((error: AxiosError) => {
          console.log(`Error: ${error}`)
        });
  return;
}

// API call to create the Monthify 30 playlist for a particular user
export async function createMonthify30Playlist(spotify_user_id: string, access_token: string) {
    // Create playlist via API call
    axios.post(`https://api.spotify.com/v1/users/${spotify_user_id}/playlists`, 
        {
          "name": "Monthify 30",
          "description": "An automatically curated playlist of your tracks from the past 30 days.",
          "public": false
        },
        {
          headers: {
            "Authorization": `Bearer ${access_token}`,
            "Content-Type": "application/json"
          }
        })
          .then((response: AxiosResponse) => {
            console.log(`Successfully created 'Monthify 30' playlist for user ${spotify_user_id}`);
            // Store playlist ID in database
            const monthify_30_id = response.data.id;
            updateMonthify30Id(spotify_user_id, monthify_30_id);
            console.log(`Successfully updated monthly_30_id value for user with username ${spotify_user_id}`);  
            return (response.data.id);
          })
          .catch((error: AxiosError) => {
            console.log(`Error: ${error}`)
          });
    return;
}
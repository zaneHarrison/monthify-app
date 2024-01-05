import axios from "axios";
import { AxiosError, AxiosResponse } from "axios";

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

export async function createMonthify30Playlist(spotify_user_id: string, access_token: string) {
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
            console.log(`Successfully created 'Monthify 30' playlist for user ${spotify_user_id}`)
          })
          .catch((error: AxiosError) => {
            console.log(`Error: ${error}`)
          });
    return;
}

export async function createMonthlyPlaylist(spotify_user_id: string, access_token: string, current_date: Date) {
    const current_month = current_date.toLocaleString('default', { month: 'long' });
    const current_year = current_date.getFullYear();
    const playlist_name = `${current_month}, ${current_year}`;
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
            console.log(`Successfully created '${playlist_name}' playlist for user ${spotify_user_id}`)
          })
          .catch((error: AxiosError) => {
            console.log(`Error: ${error}`)
          });
    return;
}
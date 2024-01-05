import axios from "axios";
import { AxiosError, AxiosResponse } from "axios";


export async function getPlaylists(spotify_id: string, access_token: string) {
    axios.get(`https://api.spotify.com/v1/users/${spotify_id}/playlists?limit=1`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    })
        .then((response: AxiosResponse) => {
            console.log("Playlists retrieved.");
        })
    return;
}
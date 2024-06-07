import type { Component } from "solid-js";

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SITE_URL = import.meta.env.VITE_SITE_URL;
const SCOPE = "playlist-read-private user-library-read";

const Welcome: Component = () => {
  let loginWithSpotify = () => {
    var url = "https://accounts.spotify.com/authorize";
    url += "?response_type=token";
    url += "&client_id=" + encodeURIComponent(SPOTIFY_CLIENT_ID);
    url += "&scope=" + encodeURIComponent(SCOPE);
    url += "&redirect_uri=" + encodeURIComponent(SITE_URL);

    window.location.replace(url);
  };

  return (
    <>
      <h1>Spotify by Geography</h1>
      <h2>How geographically diverse is your Spotify account?</h2>
      <button onclick={loginWithSpotify}>Login with Spotify</button>
    </>
  );
};

export default Welcome;

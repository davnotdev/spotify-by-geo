import { Match, Show, Switch, createResource, type Component } from "solid-js";
import { getPlaylistArtists } from "./lib/spotify";

interface Props {
  token: string;
}

const Content: Component<Props> = ({ token }) => {
  let [playlistArtistsRes] = createResource(async () => {
    return await getPlaylistArtists(token);
  });

  return (
    <>
      <div>Ready?</div>
      <Show when={playlistArtistsRes.loading}>
        <p>Loading...</p>
      </Show>
      <Switch>
        <Match when={playlistArtistsRes.error}>
          <span>Error: {playlistArtistsRes.error}</span>
        </Match>
        <Match when={playlistArtistsRes()}>
          <div>Data: {JSON.stringify(playlistArtistsRes())}</div>
        </Match>
      </Switch>
      <div>{playlistArtistsRes.state}</div>
    </>
  );
};

export default Content;

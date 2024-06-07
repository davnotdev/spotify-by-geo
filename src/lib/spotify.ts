export interface ArtistImage {
  url: string;
  width: number;
  height: number;
}

export interface Artist {
  name: string;
  id: string;
  popularity: number;
  genres: string[];
  images: ArtistImage[];
}

export async function getPlaylistArtists(token: string): Promise<Artist[]> {
  let playlists: any[] = [];

  let prevPlaylistTotal = 1;
  for (let i = 0; prevPlaylistTotal != 0; i++) {
    let playlistsData: any = await getFetchPartial(
      `/me/playlists?limit=50&offset=${i * 50}`,
      token,
    );
    playlists = [...playlists, ...playlistsData.items];
    prevPlaylistTotal = playlistsData.items.length;
  }

  let tracks: any[] = [];
  for (let i = 0; i < playlists.length; i++) {
    let tracksData: any = await getFetch(
      (playlists[i].tracks as any).href,
      token,
    );
    tracks = [
      ...tracks,
      ...tracksData.items
        .filter((track: any) => track.track && track.track.type == "track")
        .map((track: any) => track.track),
    ];
  }

  let prevSavedTotal = 1;
  for (let i = 0; prevSavedTotal != 0; i++) {
    let savedData: any = await getFetchPartial(
      `/me/tracks?limit=50&offset=${i * 50}`,
      token,
    );
    tracks = [
      ...tracks,
      ...savedData.items
        .filter((track: any) => track.track && track.track.type == "track")
        .map((track: any) => track.track),
    ];
    prevSavedTotal = savedData.items.length;
  }

  let artistsAll: any[] = [];
  for (let i = 0; i < tracks.length; i++) {
    let track = tracks[i];
    artistsAll = [
      ...artistsAll,
      ...track.artists.map((artist: any) => artist.id),
    ];
  }
  const artistsDedup = [...new Set(artistsAll)];

  let artists: Artist[] = [];

  const IDS_PER_REQ = 50;
  for (let i = 0; i < Math.ceil(artistsDedup.length / IDS_PER_REQ); i++) {
    let artistIdBatch: string = artistsDedup
      .slice(i * IDS_PER_REQ, (i + 1) * IDS_PER_REQ)
      .reduce((acc, id) => acc + id.toString() + ",", "");
    let artistIdQuery = artistIdBatch.substring(0, artistIdBatch.length - 1);
    let artistsData: any = await getFetchPartial(
      `/artists?ids=${encodeURIComponent(artistIdQuery)}`,
      token,
    );
    artists = [
      ...artists,
      ...artistsData.artists.map((artist: any) => {
        return {
          name: artist.name,
          id: artist.id,
          popularity: artist.popularity,
          genres: artist.genres,
          images: artist.images,
        };
      }),
    ];
  }

  return artists;
}

async function getFetch(url: string, token: string): Promise<Object> {
  let res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
}

async function getFetchPartial(
  endpoint: string,
  token: string,
): Promise<Object> {
  return await getFetch(`https://api.spotify.com/v1${endpoint}`, token);
}

import { Artist } from "./spotify";

export interface ArtistInfo {
  name: string;
  area: string | null;
  disambiguation: string | null;
  needs_disambiguation: boolean;
}

export async function getArtistsInfo(artists: Artist[]): Promise<ArtistInfo[]> {
  let headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent":
      "spotify-by-geo/0.1.0 (https://github.com/davnotdev/spotify-by-geo)",
  });
  let artistInfos: ArtistInfo[] = [];

  const ARTISTS_PER_REQ = 100;
  for (let i = 0; i < Math.ceil(artists.length / ARTISTS_PER_REQ); i++) {
    let multiQuery = ":(";
    for (let j = 0; j < ARTISTS_PER_REQ && i * 50 + j < artists.length; j++) {
      multiQuery += `"${artists[i * 50 + j].name}" OR `;
    }
    let finalQuery =
      multiQuery.substring(0, multiQuery.length - 4) + ")&fmt=json&limit=100";

    let res = await fetch(
      `https://musicbrainz.org/ws/2/artist?query=artist${finalQuery}`,
      {
        headers: headers,
      },
    );

    let ratelimit_timer = new Promise((resolve) => setTimeout(resolve, 1000));

    let data: any = await res.json();
    let artistsData: any = data.artists;
    for (let i = 0; i < artistsData.length; i++) {
      let data = artistsData[i];
      if (
        data &&
        artists.filter((artist) => isMatch(artist.name, data.name)).length >= 1
      ) {
        let area = null;
        let disambiguation = null;

        if (data.area) {
          area = data.area.name;
        }

        if (data.disambiguation) {
          disambiguation = data.disambiguation;
        }

        artistInfos = [
          ...artistInfos,
          {
            name: data.name,
            area,
            disambiguation,
            needs_disambiguation: false,
          },
        ];
      }
    }

    for (let i = 0; i < artistInfos.length; i++) {
      artistInfos[i].needs_disambiguation =
        artistsData.filter(
          (artist: any) => artist && isMatch(artist.name, artistInfos[i].name),
        ).length > 1;
    }

    await ratelimit_timer;
  }
  return artistInfos;
}

function normalizeName(name: string): string {
  let normalized = name.normalize("NFKD");
  normalized = normalized.replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ");
  return normalized.toLowerCase();
}

function isMatch(name1: string, name2: string): boolean {
  const normName1 = normalizeName(name1);
  const normName2 = normalizeName(name2);
  return normName1 === normName2;
}

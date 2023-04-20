interface SpotifyTrack {
  artists: string[];
  duration: number;
  explicit: boolean;
  id: string;
  image: string;
  name: string;
  url: string;
}

interface SpotifyPlaylistTrack extends SpotifyTrack {
  addedAt: string;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  tracks: SpotifyPlaylistTrack[];
  url: string;
}

class SpotifyAPI {
  private static toSpotifyTrack(data): SpotifyTrack {
    return {
      artists: data.artists.filter(artist => artist.type === 'artist').map(artist => artist.name),
      duration: data.duration,
      explicit: data.explicit,
      id: data.id,
      image: data.album.images[0]?.url,
      name: data.name,
      url: data.external_urls.spotify,
    };
  }

  private static toSpotifyPlaylistTrack(data): SpotifyPlaylistTrack {
    return {
      ...SpotifyAPI.toSpotifyTrack(data.track),
      addedAt: data.added_at,
    };
  }

  private static toSpotifyPlaylist(data): SpotifyPlaylist {
    return {
      id: data.id,
      name: data.name,
      tracks: data.tracks.items.map(SpotifyAPI.toSpotifyPlaylistTrack),
      url: data.external_urls.spotify,
    };
  }

  public static async getAccessToken(): Promise<string> {
    const body = new URLSearchParams();
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', process.env.SPOTIFY_REFRESH_TOKEN as string);
    const response = await fetch('https://accounts.spotify.com/api/token', {
      body: body,
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });
    const responseJson = await response.json();
    return responseJson.access_token;
  }

  public static async getPlaylist(accessToken: string, playlistId: string): Promise<SpotifyPlaylist> {
    const url = new URL('https://api.spotify.com/v1/playlists/' + playlistId);
    url.searchParams.set('market', 'CA');
    const response = await fetch(url, {
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    const responseJson = await response.json();
    return SpotifyAPI.toSpotifyPlaylist(responseJson);
  }

  public static async searchForItem(accessToken: string, query: string): Promise<SpotifyTrack[]> {
    const url = new URL('https://api.spotify.com/v1/search');
    url.searchParams.set('limit', '10');
    url.searchParams.set('market', 'CA');
    url.searchParams.set('offset', '0');
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'track');
    const response = await fetch(url, {
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    const responseJson = await response.json();
    return responseJson.tracks.items.map(SpotifyAPI.toSpotifyTrack);
  }
}

export default SpotifyAPI;

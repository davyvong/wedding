export interface SpotifyTrack {
  artists: string[];
  duration: number;
  explicit: boolean;
  href: string;
  id: string;
  image: string;
  name: string;
  uri: string;
}

export interface SpotifyPlaylistTrack extends SpotifyTrack {
  addedAt: string;
}

export interface SpotifyPlaylist {
  href: string;
  id: string;
  name: string;
  tracks: SpotifyPlaylistTrack[];
  uri: string;
}

class SpotifyAPI {
  private static toSpotifyTrack(data): SpotifyTrack {
    return {
      artists: data.artists.filter(artist => artist.type === 'artist').map(artist => artist.name),
      duration: data.duration,
      explicit: data.explicit,
      href: data.external_urls.spotify,
      id: data.id,
      image: data.album.images[0]?.url,
      name: data.name,
      uri: data.uri,
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
      href: data.external_urls.spotify,
      id: data.id,
      name: data.name,
      tracks: data.tracks.items.map(SpotifyAPI.toSpotifyPlaylistTrack),
      uri: data.uri,
    };
  }

  public static async getAccessToken(): Promise<string> {
    const body = new URLSearchParams();
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', process.env.SPOTIFY_REFRESH_TOKEN);
    const response = await fetch('https://accounts.spotify.com/api/token', {
      body,
      cache: 'no-store',
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
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    const responseJson = await response.json();
    return SpotifyAPI.toSpotifyPlaylist(responseJson);
  }

  public static async addToPlaylist(accessToken: string, playlistId: string, uris: string[]): Promise<void> {
    const url = new URL(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`);
    await fetch(url, {
      body: JSON.stringify({ uris }),
      cache: 'no-store',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  }

  public static async removeFromPlaylist(accessToken: string, playlistId: string, uris: string[]): Promise<void> {
    const url = new URL(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`);
    await fetch(url, {
      body: JSON.stringify({
        tracks: uris.map(uri => ({ uri })),
      }),
      cache: 'no-store',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
    });
  }

  public static async searchForTrack(accessToken: string, query: string): Promise<SpotifyTrack[]> {
    const url = new URL('https://api.spotify.com/v1/search');
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'track');
    const response = await fetch(url, {
      cache: 'no-store',
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

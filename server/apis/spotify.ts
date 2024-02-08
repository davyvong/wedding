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

  public static getAuthorizationURL(): string {
    const url = new URL('https://accounts.spotify.com/authorize?response_type=code');
    url.searchParams.set('client_id', process.env.SPOTIFY_CLIENT_ID);
    url.searchParams.set('redirect_uri', process.env.SPOTIFY_REDIRECT_URI);
    url.searchParams.set('scope', 'playlist-modify-public playlist-modify-private');
    return url.href;
  }

  public static async getRefreshToken(authorizationCode: string): Promise<string> {
    const body = new URLSearchParams();
    body.set('code', authorizationCode);
    body.set('grant_type', 'authorization_code');
    body.set('redirect_uri', process.env.SPOTIFY_REDIRECT_URI);
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
    return responseJson.refresh_token;
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
    const tracks = new Map<string, SpotifyPlaylistTrack>();
    for (const item of responseJson.tracks.items) {
      const track = SpotifyAPI.toSpotifyPlaylistTrack(item);
      tracks.set(track.uri, track);
    }
    let next = responseJson.tracks.next;
    while (next) {
      const nextTracks = await this.getNextTracksInPlaylist(accessToken, next);
      for (const track of nextTracks.tracks) {
        tracks.set(track.uri, track);
      }
      next = nextTracks.next;
    }
    return {
      ...SpotifyAPI.toSpotifyPlaylist(responseJson),
      tracks: Array.from(tracks.values()),
    };
  }

  public static async getNextTracksInPlaylist(
    accessToken: string,
    next: null | string,
  ): Promise<{
    next: null | string;
    tracks: SpotifyPlaylistTrack[];
  }> {
    if (!next) {
      return {
        next: null,
        tracks: [],
      };
    }
    const response = await fetch(next, {
      cache: 'no-store',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    const responseJson = await response.json();
    return {
      next: responseJson.next,
      tracks: responseJson.items.map(SpotifyAPI.toSpotifyPlaylistTrack),
    };
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

  public static async getDuplicateTracksInPlaylist(
    accessToken: string,
    playlistId: string,
  ): Promise<SpotifyPlaylistTrack[]> {
    const tracks = new Map<string, SpotifyPlaylistTrack>();
    const duplicateTracks = new Set<string>();
    const url = new URL('https://api.spotify.com/v1/playlists/' + playlistId + '/tracks');
    let next: null | string = url.href;
    while (next) {
      const nextTracks = await this.getNextTracksInPlaylist(accessToken, next);
      for (const track of nextTracks.tracks) {
        if (tracks.has(track.uri)) {
          duplicateTracks.add(track.uri);
        }
        tracks.set(track.uri, track);
      }
      next = nextTracks.next;
    }
    return Array.from(tracks.values()).filter((track: SpotifyPlaylistTrack): boolean => {
      return duplicateTracks.has(track.uri);
    });
  }

  public static async getTrack(accessToken: string, trackId: string): Promise<SpotifyTrack> {
    const url = new URL('https://api.spotify.com/v1/tracks/' + trackId);
    const response = await fetch(url.href, {
      cache: 'no-store',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    const responseJson = await response.json();
    return SpotifyAPI.toSpotifyTrack(responseJson);
  }

  public static async getSeveralTracks(accessToken: string, trackIds: string[]): Promise<SpotifyTrack[]> {
    const url = new URL('https://api.spotify.com/v1/tracks');
    url.searchParams.set('ids', trackIds.join(','));
    const response = await fetch(url.href, {
      cache: 'no-store',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    const responseJson = await response.json();
    return responseJson.tracks.map(SpotifyAPI.toSpotifyTrack);
  }
}

export default SpotifyAPI;

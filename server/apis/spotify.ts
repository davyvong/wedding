interface SpotifyTrack {
  artists: string[];
  duration: number;
  explicit: boolean;
  id: string;
  image: string;
  name: string;
  url: string;
}

class SpotifyAPI {
  static async getAccessToken(): Promise<string> {
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

  static async searchForItem(accessToken: string, query: string): Promise<SpotifyTrack[]> {
    const url = new URL('https://api.spotify.com/v1/search');
    url.searchParams.set('limit', '10');
    url.searchParams.set('market', 'US');
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
    return responseJson.tracks.items.map(item => ({
      artists: item.artists.filter(artist => artist.type === 'artist').map(artist => artist.name),
      duration: item.duration,
      explicit: item.explicit,
      id: item.id,
      image: item.album.images[0]?.url,
      name: item.name,
      url: item.href,
    }));
  }
}

export default SpotifyAPI;

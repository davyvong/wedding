import { NextRequest, NextResponse } from 'next/server';
import SpotifyAPI, { SpotifyTrack } from 'server/apis/spotify';
import Authenticator from 'server/authenticator';
import ServerError from 'server/error';
import MySQLQueries from 'server/queries/mysql';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const token = await Authenticator.verifyToken(request.cookies);
    if (!token) {
      return ServerError.Unauthorized();
    }
    const songRequests = await MySQLQueries.findSongRequestsFromGuestId(token.guestId);
    console.log(`[GET] /api/songs/[id] songRequestsFound=${songRequests ? songRequests.length : 0}`);
    if (!songRequests) {
      return ServerError.InternalServerError();
    }
    if (songRequests.length === 0) {
      return NextResponse.json([], { status: 200 });
    }
    const accessToken = await SpotifyAPI.getAccessToken();
    const chunkedRequests: Promise<SpotifyTrack[]>[] = [];
    for (let i = 0; i < songRequests.length; i += 50) {
      const chunkedSongRequests = songRequests.slice(i, i + 50);
      chunkedRequests.push(SpotifyAPI.getSeveralTracks(accessToken, chunkedSongRequests));
    }
    const tracks = (await Promise.all(chunkedRequests)).flat();
    return NextResponse.json(tracks, { status: 200 });
  } catch (error: unknown) {
    return ServerError.handleError(error);
  }
};

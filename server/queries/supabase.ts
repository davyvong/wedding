import { VerifiedGuestTokenPayload } from 'server/authenticator';
import SupabaseClientFactory from 'server/clients/supabase';
import Guest, { GuestSupabaseData } from 'server/models/guest';
import Response, { ResponseData, ResponseSupabaseData } from 'server/models/response';
import { ScavengerTokenSupabaseData } from 'server/models/scavenger-token';
import { SongRequestSupabaseData } from 'server/models/song-request';

class SupabaseQueries {
  public static async findGuestFromId(id: string): Promise<Guest | null> {
    try {
      if (!id) {
        return null;
      }
      const { data, error } = await SupabaseClientFactory.getInstance()
        .from('wedding_guests')
        .select()
        .eq('id', id)
        .eq('is_deleted', false)
        .limit(1)
        .returns<GuestSupabaseData[]>();
      if (error) {
        return null;
      }
      return Guest.fromSupabase(data[0]);
    } catch {
      return null;
    }
  }

  public static async findGuestFromEmail(email: string): Promise<Guest | null> {
    try {
      if (!email) {
        return null;
      }
      const { data, error } = await SupabaseClientFactory.getInstance()
        .from('wedding_guests')
        .select()
        .eq('email', email)
        .eq('is_deleted', false)
        .limit(1)
        .returns<GuestSupabaseData[]>();
      if (error) {
        return null;
      }
      return Guest.fromSupabase(data[0]);
    } catch {
      return null;
    }
  }

  public static async findGuestGroupFromGuestId(guestId: string): Promise<string | null> {
    try {
      if (!guestId) {
        return null;
      }
      const { data, error } = await SupabaseClientFactory.getInstance()
        .from('wedding_guests')
        .select('guest_group_id')
        .eq('id', guestId)
        .returns<{ guest_group_id }[]>();
      if (error) {
        return null;
      }
      return data[0].guest_group_id;
    } catch {
      return null;
    }
  }

  public static async findRSVPFromGuestId(guestId: string): Promise<{ guests: Guest[]; responses: Response[] } | null> {
    try {
      if (!guestId) {
        return null;
      }
      const guestGroupId = await SupabaseQueries.findGuestGroupFromGuestId(guestId);
      const query = SupabaseClientFactory.getInstance()
        .from('wedding_guests')
        .select('*, response:public_wedding_responses_guest_id_fkey(*)');
      if (guestGroupId) {
        query.or(`id.eq.${guestId}, guest_group_id.eq.${guestGroupId}`);
      } else {
        query.eq('id', guestId);
      }
      const { data, error } = await query;
      if (error) {
        return null;
      }
      return {
        guests: data.map((row): Guest => {
          return Guest.fromSupabase(row);
        }),
        responses: data
          .filter((row): boolean => !!row.response)
          .map((row): Response => {
            return Response.fromSupabase({
              attendance: row.response.attendance,
              dietary_restrictions: row.response.dietary_restrictions,
              entree: row.response.entree,
              guest_id: row.id,
              id: row.response.id,
              mailing_address: row.response.mailing_address,
              message: row.response.message,
            });
          }),
      };
    } catch {
      return null;
    }
  }

  public static async insertResponse(
    token: VerifiedGuestTokenPayload,
    guestId: string,
    data: Omit<ResponseData, 'guest' | 'id'>,
  ): Promise<Response | null> {
    try {
      if (!guestId || !data) {
        return null;
      }
      const results = await SupabaseClientFactory.getInstance()
        .from('wedding_responses')
        .insert({
          attendance: data.attendance,
          created_by: token.guestId,
          dietary_restrictions: (data.attendance && data.dietaryRestrictions) || null,
          entree: (data.attendance && data.entree) || null,
          guest_id: guestId,
          mailing_address: data.mailingAddress || null,
          message: data.message,
          modified_by: token.guestId,
        })
        .select()
        .returns<ResponseSupabaseData[]>();
      if (results.error) {
        return null;
      }
      return Response.fromSupabase(results.data[0]);
    } catch {
      return null;
    }
  }

  public static async updateResponse(
    token: VerifiedGuestTokenPayload,
    guestId: string,
    data: Omit<ResponseData, 'guest' | 'id'>,
  ): Promise<Response | null> {
    try {
      if (!guestId || !data) {
        return null;
      }
      const results = await SupabaseClientFactory.getInstance()
        .from('wedding_responses')
        .update({
          attendance: data.attendance,
          dietary_restrictions: (data.attendance && data.dietaryRestrictions) || null,
          entree: (data.attendance && data.entree) || null,
          guest_id: guestId,
          mailing_address: data.mailingAddress || null,
          message: data.message,
          modified_by: token.guestId,
        })
        .eq('guest_id', guestId)
        .select()
        .returns<ResponseSupabaseData[]>();
      if (results.error) {
        return null;
      }
      return Response.fromSupabase(results.data[0]);
    } catch {
      return null;
    }
  }

  public static async upsertResponse(
    token: VerifiedGuestTokenPayload,
    guestId: string,
    data: Omit<ResponseData, 'guest' | 'id'>,
  ): Promise<Response | null> {
    try {
      if (!guestId || !data) {
        return null;
      }
      const updatedResponse = await SupabaseQueries.updateResponse(token, guestId, data);
      if (updatedResponse) {
        return updatedResponse;
      }
      return SupabaseQueries.insertResponse(token, guestId, data);
    } catch {
      return null;
    }
  }

  public static async findGuestGroupFromGuestIds(guestIds: string[]): Promise<boolean> {
    try {
      if (!guestIds) {
        return false;
      }
      const { data, error } = await SupabaseClientFactory.getInstance()
        .from('wedding_guests')
        .select()
        .in('id', guestIds)
        .returns<GuestSupabaseData[]>();
      if (error || !data) {
        return false;
      }
      if (data.length < guestIds.length) {
        return false;
      }
      return data.every((row: GuestSupabaseData, index: number, rows: GuestSupabaseData[]): boolean => {
        if (index === 0) {
          return true;
        }
        if (row.guest_group_id === null) {
          return false;
        }
        return row.guest_group_id === rows[index - 1].guest_group_id;
      });
    } catch {
      return false;
    }
  }

  public static async findGuestList(): Promise<{ guests: Guest[]; id: string; responses: Response[] }[]> {
    try {
      const { data, error } = await SupabaseClientFactory.getInstance()
        .from('wedding_guests')
        .select('*, response:public_wedding_responses_guest_id_fkey(*)')
        .eq('is_deleted', false)
        .returns<({ response: ResponseSupabaseData } & GuestSupabaseData)[]>();
      if (error) {
        return [];
      }
      if (!data) {
        return [];
      }
      const guestGroups = new Map<string | null, ({ response: ResponseSupabaseData } & GuestSupabaseData)[]>();
      for (const row of data) {
        guestGroups.set(row.guest_group_id, [...(guestGroups.get(row.guest_group_id) || []), row]);
      }
      const guestList: { guests: Guest[]; id: string; responses: Response[] }[] = [];
      for (const guestGroup of Array.from(guestGroups.values())) {
        guestList.push({
          guests: guestGroup.map((row): Guest => {
            return Guest.fromSupabase(row);
          }),
          id: guestGroup[0].guest_group_id || '',
          responses: guestGroup
            .filter((row): boolean => !!row.response)
            .map((row): Response => {
              return Response.fromSupabase(row.response);
            }),
        });
      }
      return guestList;
    } catch {
      return [];
    }
  }

  public static async findSongRequestsFromGuestId(guestId: string): Promise<string[] | null> {
    try {
      if (!guestId) {
        return null;
      }
      const { data, error } = await SupabaseClientFactory.getInstance()
        .from('wedding_song_requests')
        .select()
        .eq('guest_id', guestId)
        .returns<SongRequestSupabaseData[]>();
      if (error) {
        return null;
      }
      if (!data) {
        return [];
      }
      return data.map((row: SongRequestSupabaseData): string => row.spotify_track_id);
    } catch {
      return null;
    }
  }

  public static async insertSongRequest(
    token: VerifiedGuestTokenPayload,
    guestId: string,
    spotifyTrackId: string,
  ): Promise<boolean> {
    try {
      if (!spotifyTrackId) {
        return false;
      }
      const { count, error } = await SupabaseClientFactory.getInstance().from('wedding_song_requests').insert(
        {
          created_by: token.guestId,
          guest_id: guestId,
          spotify_track_id: spotifyTrackId,
        },
        { count: 'exact' },
      );
      if (error || !count) {
        return false;
      }
      return count > 0;
    } catch {
      return false;
    }
  }

  public static async deleteSongRequest(guestId: string, spotifyTrackId: string): Promise<boolean> {
    try {
      if (!guestId || !spotifyTrackId) {
        return false;
      }
      const { count, error } = await SupabaseClientFactory.getInstance()
        .from('wedding_song_requests')
        .delete()
        .eq('guest_id', guestId)
        .eq('spotify_track_id', spotifyTrackId);
      if (error || !count) {
        return false;
      }
      return count > 0;
    } catch {
      return false;
    }
  }

  public static async findSongRequests(): Promise<string[] | null> {
    try {
      const { data, error } = await SupabaseClientFactory.getInstance().from('wedding_song_requests').select();
      if (error) {
        return null;
      }
      if (!data) {
        return [];
      }
      const trackIds = data.map((row: SongRequestSupabaseData): string => row.spotify_track_id);
      const frequencyMap = new Map<string, number>();
      for (const trackId of trackIds) {
        if (frequencyMap.has(trackId)) {
          frequencyMap.set(trackId, (frequencyMap.get(trackId) as number) + 1);
        } else {
          frequencyMap.set(trackId, 1);
        }
      }
      return Array.from(frequencyMap.keys()).sort((trackA: string, trackB: string): number => {
        return (frequencyMap.get(trackA) as number) - (frequencyMap.get(trackB) as number);
      });
    } catch {
      return null;
    }
  }

  public static async updateGuestSubscription(guestId: string, isSubscribed: boolean): Promise<boolean> {
    try {
      if (!guestId) {
        return false;
      }
      const { data, error } = await SupabaseClientFactory.getInstance()
        .from('wedding_guests')
        .update({ is_subscribed: isSubscribed })
        .eq('id', guestId)
        .select();
      if (error) {
        return false;
      }
      return data[0].is_subscribed;
    } catch {
      return false;
    }
  }

  public static async findScavengerHuntToken(username: string): Promise<ScavengerTokenSupabaseData | null> {
    try {
      if (!username) {
        return null;
      }
      const { data, error } = await SupabaseClientFactory.getInstance()
        .from('wedding_scavenger_tokens')
        .select()
        .eq('username', username)
        .limit(1)
        .returns<ScavengerTokenSupabaseData[]>();
      if (error || !data) {
        return null;
      }
      return data[0];
    } catch {
      return null;
    }
  }

  public static async insertScavengerHuntToken(
    username: string,
    recoveryEmail: string | null,
  ): Promise<ScavengerTokenSupabaseData | null> {
    try {
      if (!username) {
        return null;
      }
      const { data, error } = await SupabaseClientFactory.getInstance()
        .from('wedding_scavenger_tokens')
        .insert({
          recovery_email: recoveryEmail || null,
          username,
        })
        .select()
        .returns<ScavengerTokenSupabaseData[]>();
      if (error) {
        return null;
      }
      return data[0];
    } catch {
      return null;
    }
  }
}

export default SupabaseQueries;

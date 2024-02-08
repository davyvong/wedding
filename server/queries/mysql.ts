import ObjectID from 'bson-objectid';
import { GuestTokenPayload } from 'server/authenticator';
import MySQLClientFactory from 'server/clients/mysql';
import Guest, { GuestRowData } from 'server/models/guest';
import Response, { ResponseData, ResponseRowData } from 'server/models/response';
import { SongRequestRowData } from 'server/models/song-request';

class MySQLQueries {
  public static async findGuestFromId(id: string): Promise<Guest | null> {
    if (!id) {
      return null;
    }
    try {
      const connection = await MySQLClientFactory.getInstance();
      const query = `
        select *
        from wedding_guests
        where public_id = :publicId
        limit 1
      `;
      const results = await connection.execute<GuestRowData>(query, { publicId: id });
      if (results.rows.length === 0) {
        return null;
      }
      return Guest.fromRow(results.rows[0]);
    } catch {
      return null;
    }
  }

  public static async findGuestFromEmail(email: string): Promise<Guest | null> {
    if (!email) {
      return null;
    }
    try {
      const connection = await MySQLClientFactory.getInstance();
      const query = `
        select *
        from wedding_guests
        where email = :email
        limit 1
      `;
      const results = await connection.execute<GuestRowData>(query, { email });
      if (results.rows.length === 0) {
        return null;
      }
      return Guest.fromRow(results.rows[0]);
    } catch {
      return null;
    }
  }

  public static async findRSVPFromGuestId(guestId: string): Promise<{ guests: Guest[]; responses: Response[] } | null> {
    if (!guestId) {
      return null;
    }
    try {
      const connection = await MySQLClientFactory.getInstance();
      const query = `
        select
          wedding_guests.email as guest_email,
          wedding_guests.is_admin as guest_is_admin,
          wedding_guests.name as guest_name,
          wedding_guests.public_id as guest_public_id,
          wedding_responses.attendance as response_attendance,
          wedding_responses.dietary_restrictions as response_dietary_restrictions,
          wedding_responses.entree as response_entree,
          wedding_responses.mailing_address as response_mailing_address,
          wedding_responses.message as response_message,
          wedding_responses.public_id as response_public_id
        from wedding_guests
        left join wedding_responses on wedding_responses.guest_id = wedding_guests.id
        where guest_group_id = (
          select guest_group_id
          from wedding_guests
          where public_id = :guestId
          limit 1
        ) or wedding_guests.public_id = :guestId
      `;
      const results = await connection.execute<{
        guest_email: string;
        guest_is_admin: number;
        guest_name: string;
        guest_public_id: string;
        response_attendance: number;
        response_dietary_restrictions: string;
        response_entree: string;
        response_mailing_address: string;
        response_message: string;
        response_public_id: string;
      }>(query, { guestId });
      if (results.rows.length === 0) {
        return null;
      }
      return {
        guests: results.rows.map((row): Guest => {
          return Guest.fromRow({
            email: row.guest_email,
            is_admin: row.guest_is_admin,
            guest_group_id: null,
            name: row.guest_name,
            public_id: row.guest_public_id,
          });
        }),
        responses: results.rows
          .filter((row): boolean => !!row.response_public_id)
          .map((row): Response => {
            return Response.fromRow({
              attendance: row.response_attendance,
              dietary_restrictions: row.response_dietary_restrictions,
              entree: row.response_entree,
              guest_id: row.guest_public_id,
              mailing_address: row.response_mailing_address,
              message: row.response_message,
              public_id: row.response_public_id,
            });
          }),
      };
    } catch {
      return null;
    }
  }

  public static async insertResponse(
    token: GuestTokenPayload,
    guestId: string,
    data: Omit<ResponseData, 'guest' | 'id'>,
  ): Promise<boolean> {
    if (!guestId || !data) {
      return false;
    }
    try {
      const connection = await MySQLClientFactory.getInstance();
      const query = `
        insert into wedding_responses (
          public_id,
          guest_id,
          attendance,
          dietary_restrictions,
          entree,
          mailing_address,
          message,
          created_by,
          modified_by
        )
        values (
          :publicId,
          (
            select id
            from wedding_guests
            where public_id = :guestId
            limit 1
          ),
          :attendance,
          :dietaryRestrictions,
          :entree,
          :mailingAddress,
          :message,
          (
            select id
            from wedding_guests
            where public_id = :tokenGuestId
            limit 1
          ),
          (
            select id
            from wedding_guests
            where public_id = :tokenGuestId
            limit 1
          )
        )
      `;
      const results = await connection.execute<ResponseRowData>(query, {
        attendance: data.attendance,
        dietaryRestrictions: (data.attendance && data.dietaryRestrictions) || null,
        entree: (data.attendance && data.entree) || null,
        guestId,
        publicId: ObjectID().toHexString(),
        mailingAddress: data.mailingAddress || null,
        message: data.message,
        tokenGuestId: token.guestId,
      });
      return results.rowsAffected > 0;
    } catch {
      return false;
    }
  }

  public static async updateResponse(
    token: GuestTokenPayload,
    guestId: string,
    data: Omit<ResponseData, 'guest' | 'id'>,
  ): Promise<boolean> {
    if (!guestId || !data) {
      return false;
    }
    try {
      const connection = await MySQLClientFactory.getInstance();
      const query = `
        update wedding_responses
        set
          attendance = :attendance,
          dietary_restrictions = :dietaryRestrictions,
          entree = :entree,
          mailing_address = :mailingAddress,
          message = :message,
          modified_at = current_timestamp(),
          modified_by = (
            select id
            from wedding_guests
            where public_id = :tokenGuestId
            limit 1
          )
        where guest_id = (
          select id
          from wedding_guests
          where public_id = :guestId
          limit 1
        )
      `;
      const results = await connection.execute<ResponseRowData>(query, {
        attendance: data.attendance,
        dietaryRestrictions: (data.attendance && data.dietaryRestrictions) || null,
        entree: (data.attendance && data.entree) || null,
        guestId,
        mailingAddress: data.mailingAddress || null,
        message: data.message,
        tokenGuestId: token.guestId,
      });
      return results.rowsAffected > 0;
    } catch {
      return false;
    }
  }

  public static async findResponseFromGuestId(guestId: string): Promise<Response | null> {
    if (!guestId) {
      return null;
    }
    try {
      const connection = await MySQLClientFactory.getInstance();
      const query = `
        select *
        from wedding_responses
        where guest_id = (
          select id
          from wedding_guests
          where public_id = :guestId
          limit 1
        )
        limit 1
      `;
      const results = await connection.execute<ResponseRowData>(query, { guestId });
      if (results.rows.length === 0) {
        return null;
      }
      return Response.fromRow({
        ...results.rows[0],
        guest_id: guestId,
      });
    } catch {
      return null;
    }
  }

  public static async upsertResponse(
    token: GuestTokenPayload,
    guestId: string,
    data: Omit<ResponseData, 'guest' | 'id'>,
  ): Promise<Response | null> {
    if (!guestId || !data) {
      return null;
    }
    try {
      if (!(await MySQLQueries.updateResponse(token, guestId, data))) {
        await MySQLQueries.insertResponse(token, guestId, data);
      }
      return MySQLQueries.findResponseFromGuestId(guestId);
    } catch {
      return null;
    }
  }

  public static async findGuestGroupFromGuestIds(guestIds: string[]): Promise<boolean> {
    if (!guestIds) {
      return false;
    }
    try {
      const connection = await MySQLClientFactory.getInstance();
      const query = `
        select *
        from wedding_guests
        where public_id in (:guestIds)
      `;
      const results = await connection.execute<GuestRowData>(query, { guestIds });
      if (results.rows.length < guestIds.length) {
        return false;
      }
      return results.rows.every((row: GuestRowData, index: number, rows: GuestRowData[]): boolean => {
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
    const connection = await MySQLClientFactory.getInstance();
    const query = `
      select
        wedding_guests.email as guest_email,
        wedding_guests.is_admin as guest_is_admin,
        wedding_guests.name as guest_name,
        wedding_guests.public_id as guest_public_id,
        wedding_responses.attendance as response_attendance,
        wedding_responses.dietary_restrictions as response_dietary_restrictions,
        wedding_responses.entree as response_entree,
        wedding_responses.mailing_address as response_mailing_address,
        wedding_responses.message as response_message,
        wedding_responses.public_id as response_public_id,
        wedding_guest_groups.public_id as guest_group_public_id
      from wedding_guests
      left join wedding_responses on wedding_responses.guest_id = wedding_guests.id
      left join wedding_guest_groups on wedding_guest_groups.id = wedding_guests.guest_group_id
    `;
    const results = await connection.execute<{
      guest_email: string;
      guest_group_public_id: string | null;
      guest_is_admin: number;
      guest_name: string;
      guest_public_id: string;
      response_attendance: number;
      response_dietary_restrictions: string;
      response_entree: string;
      response_mailing_address: string;
      response_message: string;
      response_public_id: string;
    }>(query);
    const guestGroups = new Map<
      string | null,
      {
        guest_email: string;
        guest_group_public_id: string | null;
        guest_is_admin: number;
        guest_name: string;
        guest_public_id: string;
        response_attendance: number;
        response_dietary_restrictions: string;
        response_entree: string;
        response_mailing_address: string;
        response_message: string;
        response_public_id: string;
      }[]
    >();
    for (const row of results.rows) {
      guestGroups.set(row.guest_group_public_id, [...(guestGroups.get(row.guest_group_public_id) || []), row]);
    }
    const guestList: { guests: Guest[]; id: string; responses: Response[] }[] = [];
    for (const guestGroup of Array.from(guestGroups.values())) {
      guestList.push({
        guests: guestGroup.map((row): Guest => {
          return Guest.fromRow({
            email: row.guest_email,
            guest_group_id: null,
            is_admin: row.guest_is_admin,
            name: row.guest_name,
            public_id: row.guest_public_id,
          });
        }),
        id: guestGroup[0].guest_group_public_id || '',
        responses: guestGroup
          .filter((row): boolean => !!row.response_public_id)
          .map((row): Response => {
            return Response.fromRow({
              attendance: row.response_attendance,
              dietary_restrictions: row.response_dietary_restrictions,
              entree: row.response_entree,
              guest_id: row.guest_public_id,
              mailing_address: row.response_mailing_address,
              message: row.response_message,
              public_id: row.response_public_id,
            });
          }),
      });
    }
    return guestList;
  }

  public static async findSongRequestsFromGuestId(guestId: string): Promise<string[] | null> {
    if (!guestId) {
      return null;
    }
    try {
      const connection = await MySQLClientFactory.getInstance();
      const query = `
        select *
        from wedding_song_requests
        where guest_id = (
          select id
          from wedding_guests
          where public_id = :guestId
          limit 1
        )
      `;
      const results = await connection.execute<SongRequestRowData>(query, {
        guestId,
      });
      return results.rows.map((row: SongRequestRowData): string => row.spotify_track_id);
    } catch {
      return null;
    }
  }

  public static async insertSongRequest(
    token: GuestTokenPayload,
    guestId: string,
    spotifyTrackId: string,
  ): Promise<boolean> {
    if (!spotifyTrackId) {
      return false;
    }
    try {
      const connection = await MySQLClientFactory.getInstance();
      const query = `
        insert into wedding_song_requests (
          public_id,
          guest_id,
          spotify_track_id,
          created_by
        )
        values (
          :publicId,
          (
            select id
            from wedding_guests
            where public_id = :guestId
            limit 1
          ),
          :spotifyTrackId,
          (
            select id
            from wedding_guests
            where public_id = :tokenGuestId
            limit 1
          )
        )
      `;
      const results = await connection.execute<SongRequestRowData>(query, {
        guestId,
        publicId: ObjectID().toHexString(),
        spotifyTrackId,
        tokenGuestId: token.guestId,
      });
      return results.rowsAffected > 0;
    } catch {
      return false;
    }
  }

  public static async deleteSongRequest(guestId: string, spotifyTrackId: string): Promise<boolean> {
    if (!guestId || !spotifyTrackId) {
      return false;
    }
    try {
      const connection = await MySQLClientFactory.getInstance();
      const query = `
        delete from wedding_song_requests
        where guest_id = (
          select id
          from wedding_guests
          where public_id = :guestId
          limit 1
        )
        and spotify_track_id = :spotifyTrackId
      `;
      const results = await connection.execute<SongRequestRowData>(query, {
        guestId,
        spotifyTrackId,
      });
      return results.rowsAffected > 0;
    } catch {
      return false;
    }
  }
}

export default MySQLQueries;

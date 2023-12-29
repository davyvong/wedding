import ObjectID from 'bson-objectid';
import MySQLClientFactory from 'server/clients/mysql';
import Guest, { GuestRowData } from 'server/models/guest';
import Response, { ResponseData, ResponseRowData } from 'server/models/response';

class MySQLQueries {
  public static async findGuestFromId(id: string): Promise<Guest | null> {
    if (!id) {
      return null;
    }
    try {
      const connection = await MySQLClientFactory.getInstance();
      const query = `
        SELECT *
        FROM wedding_guests
        WHERE public_id = :publicId
        LIMIT 1
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
        SELECT *
        FROM wedding_guests
        WHERE email = :email
        LIMIT 1
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
        SELECT
          wedding_guests.email as guest_email,
          wedding_guests.name as guest_name,
          wedding_guests.public_id as guest_public_id,
          wedding_responses.attendance as response_attendance,
          wedding_responses.dietary_restrictions as response_dietary_restrictions,
          wedding_responses.entree as response_entree,
          wedding_responses.mailing_address as response_mailing_address,
          wedding_responses.message as response_message,
          wedding_responses.public_id as response_public_id
        FROM wedding_guests
        LEFT JOIN wedding_responses ON wedding_responses.guest_id = wedding_guests.id
        WHERE guest_group_id = (
          SELECT guest_group_id
          FROM wedding_guests
          WHERE public_id = :guestId
          LIMIT 1
        )
      `;
      const results = await connection.execute<{
        guest_email: string;
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
            guest_group_id: null,
            name: row.guest_name,
            public_id: row.guest_public_id,
          });
        }),
        responses: results.rows.map((row): Response => {
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

  public static async insertResponse(guestId: string, data: Omit<ResponseData, 'guest' | 'id'>): Promise<boolean> {
    if (!guestId || !data) {
      return false;
    }
    try {
      const connection = await MySQLClientFactory.getInstance();
      const query = `
        INSERT INTO wedding_responses (
          public_id,
          guest_id,
          attendance,
          dietary_restrictions,
          entree,
          mailing_address,
          message,
        )
        VALUES (
          :publicId,
          :guestId,
          :attendance,
          :dietaryRestrictions,
          :entree,
          :mailingAddress,
          :message,
        )
      `;
      const results = await connection.execute<ResponseRowData>(query, {
        attendance: data.attendance,
        dietaryRestrictions: data.dietaryRestrictions || null,
        entree: data.entree,
        guestId,
        publicId: ObjectID().toHexString(),
        mailingAddress: data.mailingAddress || null,
        message: data.message,
      });
      return results.rowsAffected > 0;
    } catch {
      return false;
    }
  }

  public static async updateResponse(guestId: string, data: Omit<ResponseData, 'guest' | 'id'>): Promise<boolean> {
    if (!guestId || !data) {
      return false;
    }
    try {
      const connection = await MySQLClientFactory.getInstance();
      const query = `
        UPDATE wedding_responses
        SET
          attendance = :attendance,
          dietary_restrictions = :dietaryRestrictions,
          entree = :entree,
          mailing_address = :mailingAddress,
          message = :message
        WHERE guest_id = (
          SELECT id
          FROM wedding_guests
          WHERE public_id = :guestId
          LIMIT 1
        )
      `;
      const results = await connection.execute<ResponseRowData>(query, {
        attendance: data.attendance,
        dietaryRestrictions: data.dietaryRestrictions || null,
        entree: data.entree,
        guestId,
        mailingAddress: data.mailingAddress || null,
        message: data.message,
      });
      return results.rowsAffected > 0;
    } catch {
      return false;
    }
  }

  public static async findAndUpdateResponse(
    guestId: string,
    data: Omit<ResponseData, 'guest' | 'id'>,
  ): Promise<Response | null> {
    if (!guestId || !data) {
      return null;
    }
    try {
      if (!(await MySQLQueries.updateResponse(guestId, data))) {
        await MySQLQueries.insertResponse(guestId, data);
      }
      const connection = await MySQLClientFactory.getInstance();
      const query = `
        SELECT *
        FROM wedding_responses
        WHERE guest_id = (
          SELECT id
          FROM wedding_guests
          WHERE public_id = :guestId
          LIMIT 1
        )
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

  public static async findResponseFromGuestId(guestId: string): Promise<Response | null> {
    if (!guestId) {
      return null;
    }
    try {
      const connection = await MySQLClientFactory.getInstance();
      const query = `
        SELECT *
        FROM wedding_responses
        WHERE guest_id = (
          SELECT *
          FROM wedding_guests
          WHERE public_id = :guestId
          LIMIT 1
        )
        LIMIT 1
      `;
      const results = await connection.execute<ResponseRowData>(query, { guestId });
      if (results.rows.length === 0) {
        return null;
      }
      return Response.fromRow(results.rows[0]);
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
        SELECT *
        FROM wedding_guests
        WHERE public_id IN (:guestIds)
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
      SELECT
        wedding_guests.email as guest_email,
        wedding_guests.name as guest_name,
        wedding_guests.public_id as guest_public_id,
        wedding_responses.attendance as response_attendance,
        wedding_responses.dietary_restrictions as response_dietary_restrictions,
        wedding_responses.entree as response_entree,
        wedding_responses.mailing_address as response_mailing_address,
        wedding_responses.message as response_message,
        wedding_responses.public_id as response_public_id,
        wedding_guest_groups.public_id as guest_group_public_id
      FROM wedding_guests
      LEFT JOIN wedding_responses ON wedding_responses.guest_id = wedding_guests.id
      LEFT JOIN wedding_guest_groups ON wedding_guest_groups.id = wedding_guests.guest_group_id
    `;
    const results = await connection.execute<{
      guest_email: string;
      guest_group_public_id: string | null;
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
            name: row.guest_name,
            public_id: row.guest_public_id,
          });
        }),
        id: guestGroup[0].guest_group_public_id || '',
        responses: guestGroup
          .filter((row): boolean => row.response_public_id !== null)
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
}

export default MySQLQueries;

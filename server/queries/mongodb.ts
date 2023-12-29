import { Document, ObjectId } from 'mongodb';
import MongoDBClientFactory from 'server/clients/mongodb';
import Guest, { GuestData } from 'server/models/guest';
import GuestGroup, { GuestGroupData } from 'server/models/guest-group';
import Response, { ResponseData } from 'server/models/response';

class MongoDBQueries {
  public static async findGuestFromId(id: string): Promise<Guest | null> {
    const db = await MongoDBClientFactory.getInstance();
    const doc = await db.collection('guests').findOne({ _id: new ObjectId(id) });
    if (!doc) {
      return null;
    }
    return Guest.fromDocument(doc);
  }

  public static async findGuestFromEmail(email: string): Promise<Guest | null> {
    const db = await MongoDBClientFactory.getInstance();
    const doc = await db.collection('guests').findOne({ email });
    if (!doc) {
      return null;
    }
    return Guest.fromDocument(doc);
  }

  public static async findRSVPFromGuestId(
    id: string,
  ): Promise<{ guests: GuestData[]; responses: ResponseData[] } | null> {
    const db = await MongoDBClientFactory.getInstance();
    const aggregation = await db
      .collection('guestGroups')
      .aggregate([
        {
          $match: {
            guests: new ObjectId(id),
          },
        },
        {
          $limit: 1,
        },
        {
          $lookup: {
            as: 'guestsLookup',
            foreignField: '_id',
            from: 'guests',
            localField: 'guests',
          },
        },
        {
          $lookup: {
            as: 'responsesLookup',
            foreignField: 'guest',
            from: 'responses',
            localField: 'guests',
          },
        },
      ])
      .toArray();
    if (aggregation.length > 0) {
      const [inviteDoc] = aggregation;
      return {
        guests: inviteDoc.guestsLookup.map((guestDoc: Document): GuestData => {
          return Guest.fromDocument(guestDoc).toPlainObject();
        }),
        responses: inviteDoc.responsesLookup.map((responseDoc: Document): ResponseData => {
          return Response.fromDocument(responseDoc).toPlainObject();
        }),
      };
    }
    const guest = await MongoDBQueries.findGuestFromId(id);
    if (guest) {
      const response = await MongoDBQueries.findResponseFromGuestId(id);
      return {
        guests: [guest],
        responses: response ? [response] : [],
      };
    }
    return null;
  }

  public static async findAndUpdateResponse(
    guestId: string,
    data: Partial<ResponseData>,
  ): Promise<ResponseData | null> {
    const db = await MongoDBClientFactory.getInstance();
    const doc = await db.collection('responses').findOneAndUpdate(
      { guest: new ObjectId(guestId) },
      {
        $set: data,
        $setOnInsert: { guest: new ObjectId(guestId) },
      },
      { returnDocument: 'after', upsert: true },
    );
    if (!doc) {
      return null;
    }
    return Response.fromDocument(doc);
  }

  public static async findResponseFromGuestId(guestId: string): Promise<Response | null> {
    const db = await MongoDBClientFactory.getInstance();
    const doc = await db.collection('responses').findOne({ guest: new ObjectId(guestId) });
    if (!doc) {
      return null;
    }
    return Response.fromDocument(doc);
  }

  public static async findGuestGroupFromGuestIds(guestIds: string[]): Promise<GuestGroup | null> {
    const db = await MongoDBClientFactory.getInstance();
    const doc = await db.collection('guestGroups').findOne({
      guests: {
        $all: guestIds.map((guestId: string) => new ObjectId(guestId)),
      },
    });
    if (!doc) {
      return null;
    }
    return GuestGroup.fromDocument(doc);
  }

  public static async findGuestList(): Promise<{ guests: GuestData[]; id: string; responses: ResponseData[] }[]> {
    const db = await MongoDBClientFactory.getInstance();
    const [guestDocs, guestGroupDocs, responseDocs] = await Promise.all([
      db.collection('guests').find().toArray(),
      db.collection('guestGroups').find().toArray(),
      db.collection('responses').find().toArray(),
    ]);
    const guests = new Map<string, GuestData>();
    for (const guestDoc of guestDocs) {
      const guestData = Guest.fromDocument(guestDoc).toPlainObject();
      guests.set(guestData.id, guestData);
    }
    const guestGroups = new Set<GuestGroupData>();
    for (const guestGroupDoc of guestGroupDocs) {
      const guestGroupData = GuestGroup.fromDocument(guestGroupDoc).toPlainObject();
      guestGroups.add(guestGroupData);
    }
    const responses = new Map<string, ResponseData>();
    for (const responseDoc of responseDocs) {
      const responseData = Response.fromDocument(responseDoc).toPlainObject();
      responses.set(responseData.guest, responseData);
    }
    const guestList: { guests: GuestData[]; id: string; responses: ResponseData[] }[] = [];
    for (const guestGroup of guestGroups) {
      const guestsInGroup = guestGroup.guests
        .map((guestId: string): GuestData | undefined => {
          const guestData = guests.get(guestId);
          guests.delete(guestId);
          return guestData;
        })
        .filter((guestData: GuestData | undefined): boolean => !!guestData) as GuestData[];
      const responsesInGroup = guestsInGroup
        .map((guestData: GuestData): ResponseData | undefined => {
          const responseData = responses.get(guestData.id);
          responses.delete(guestData.id);
          return responseData;
        })
        .filter((responseData: ResponseData | undefined): boolean => !!responseData) as ResponseData[];
      guestList.push({
        guests: guestsInGroup,
        id: guestGroup.id,
        responses: responsesInGroup,
      });
    }
    guestList.push({
      guests: Array.from(guests.values()),
      id: '',
      responses: Array.from(responses.values()),
    });
    return guestList;
  }
}

export default MongoDBQueries;

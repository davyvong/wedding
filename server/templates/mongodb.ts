import { Document, ObjectId } from 'mongodb';
import MongoDBClientFactory from 'server/clients/mongodb';
import MDBGuest, { MDBGuestData } from 'server/models/guest';
import MDBGuestGroup, { MDBGuestGroupData } from 'server/models/guest-group';
import MDBResponse, { MDBResponseData } from 'server/models/response';

class MongoDBQueryTemplate {
  public static async findGuestFromId(id: string): Promise<MDBGuest | null> {
    const db = await MongoDBClientFactory.getInstance();
    const doc = await db.collection('guests').findOne({ _id: new ObjectId(id) });
    if (!doc) {
      return null;
    }
    return MDBGuest.fromDocument(doc);
  }

  public static async findGuestFromEmail(email: string): Promise<MDBGuest | null> {
    const db = await MongoDBClientFactory.getInstance();
    const doc = await db.collection('guests').findOne({ email });
    if (!doc) {
      return null;
    }
    return MDBGuest.fromDocument(doc);
  }

  public static async findRSVPFromGuestId(
    id: string,
  ): Promise<{ guests: MDBGuestData[]; responses: MDBResponseData[] } | null> {
    const db = await MongoDBClientFactory.getInstance();
    const aggregation = await db
      .collection('guestGroups')
      .aggregate([
        {
          $limit: 1,
        },
        {
          $match: {
            guests: new ObjectId(id),
          },
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
        guests: inviteDoc.guestsLookup.map((guestDoc: Document): MDBGuestData => {
          return MDBGuest.fromDocument(guestDoc).toPlainObject();
        }),
        responses: inviteDoc.responsesLookup.map((responseDoc: Document): MDBResponseData => {
          return MDBResponse.fromDocument(responseDoc).toPlainObject();
        }),
      };
    }
    const guest = await MongoDBQueryTemplate.findGuestFromId(id);
    if (guest) {
      const response = await MongoDBQueryTemplate.findResponseFromGuestId(id);
      return {
        guests: [guest],
        responses: response ? [response] : [],
      };
    }
    return null;
  }

  public static async findAndUpdateResponse(
    guestId: string,
    data: Partial<MDBResponseData>,
  ): Promise<MDBResponseData | null> {
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
    return MDBResponse.fromDocument(doc);
  }

  public static async findResponseFromGuestId(guestId: string): Promise<MDBResponse | null> {
    const db = await MongoDBClientFactory.getInstance();
    const doc = await db.collection('responses').findOne({ guest: new ObjectId(guestId) });
    if (!doc) {
      return null;
    }
    return MDBResponse.fromDocument(doc);
  }

  public static async findGuestGroupFromGuestIds(guestIds: string[]): Promise<MDBGuestGroup | null> {
    const db = await MongoDBClientFactory.getInstance();
    const doc = await db.collection('guestGroups').findOne({
      guests: {
        $all: guestIds.map((guestId: string) => new ObjectId(guestId)),
      },
    });
    if (!doc) {
      return null;
    }
    return MDBGuestGroup.fromDocument(doc);
  }

  public static async findGuestList(): Promise<{ guests: MDBGuestData[]; id: string; responses: MDBResponseData[] }[]> {
    const db = await MongoDBClientFactory.getInstance();
    const [guestDocs, guestGroupDocs, responseDocs] = await Promise.all([
      db.collection('guests').find().toArray(),
      db.collection('guestGroups').find().toArray(),
      db.collection('responses').find().toArray(),
    ]);
    const guests = new Map<string, MDBGuestData>();
    for (const guestDoc of guestDocs) {
      const guestData = MDBGuest.fromDocument(guestDoc).toPlainObject();
      guests.set(guestData.id, guestData);
    }
    const guestGroups = new Set<MDBGuestGroupData>();
    for (const guestGroupDoc of guestGroupDocs) {
      const guestGroupData = MDBGuestGroup.fromDocument(guestGroupDoc).toPlainObject();
      guestGroups.add(guestGroupData);
    }
    const responses = new Map<string, MDBResponseData>();
    for (const responseDoc of responseDocs) {
      const responseData = MDBResponse.fromDocument(responseDoc).toPlainObject();
      responses.set(responseData.guest, responseData);
    }
    const guestList: { guests: MDBGuestData[]; id: string; responses: MDBResponseData[] }[] = [];
    for (const guestGroup of guestGroups) {
      const guestsInGroup = guestGroup.guests
        .map((guestId: string): MDBGuestData | undefined => {
          const guestData = guests.get(guestId);
          guests.delete(guestId);
          return guestData;
        })
        .filter((guestData: MDBGuestData | undefined): boolean => !!guestData) as MDBGuestData[];
      const responsesInGroup = guestsInGroup
        .map((guestData: MDBGuestData): MDBResponseData | undefined => {
          const responseData = responses.get(guestData.id);
          responses.delete(guestData.id);
          return responseData;
        })
        .filter((responseData: MDBResponseData | undefined): boolean => !!responseData) as MDBResponseData[];
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

export default MongoDBQueryTemplate;

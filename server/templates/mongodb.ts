import { Document, ObjectId } from 'mongodb';
import MongoDBClientFactory from 'server/clients/mongodb';
import MDBGuest, { MDBGuestData } from 'server/models/guest';
import MDBGuestGroup from 'server/models/guest-group';
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

  public static async findAllGuestGroups(): Promise<{ guests: MDBGuestData[]; id?: string }[]> {
    const db = await MongoDBClientFactory.getInstance();
    const aggregation = await db
      .collection('guestGroups')
      .aggregate([
        {
          $lookup: {
            as: 'guestsLookup',
            foreignField: '_id',
            from: 'guests',
            localField: 'guests',
          },
        },
      ])
      .toArray();
    const guestList: ObjectId[] = [];
    const guestGroups = aggregation.reduce<{ guests: MDBGuestData[]; id?: string }[]>(
      (accumulatedGuestGroups, guestGroup) => {
        const guests = guestGroup.guestsLookup.map((guestDoc: Document): MDBGuestData => {
          return MDBGuest.fromDocument(guestDoc).toPlainObject();
        });
        guestList.push(...guests.map((guest: MDBGuestData): ObjectId => new ObjectId(guest.id)));
        accumulatedGuestGroups.push({ id: guestGroup._id.toString(), guests });
        return accumulatedGuestGroups;
      },
      [],
    );
    const individualGuests = await db
      .collection('guests')
      .find({ _id: { $nin: guestList } })
      .toArray();
    guestGroups.push({
      guests: individualGuests.map((guestDoc: Document): MDBGuestData => {
        return MDBGuest.fromDocument(guestDoc).toPlainObject();
      }),
    });
    return guestGroups;
  }
}

export default MongoDBQueryTemplate;

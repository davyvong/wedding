import { Document, ObjectId } from 'mongodb';
import MongoDBClientFactory from 'server/clients/mongodb';
import MDBGuest, { MDBGuestData } from 'server/models/guest';
import MDBInvite, { MDBInviteData } from 'server/models/invite';
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
  ): Promise<{ guests: MDBGuestData[]; invite: MDBInviteData; responses: MDBResponseData[] } | null> {
    const db = await MongoDBClientFactory.getInstance();
    const aggregation = await db
      .collection('invites')
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
    if (aggregation.length === 0) {
      return null;
    }
    const [inviteDoc] = aggregation;
    return {
      guests: inviteDoc.guestsLookup.map((guestDoc: Document): MDBGuestData => {
        return MDBGuest.fromDocument(guestDoc).toPlainObject();
      }),
      invite: MDBInvite.fromDocument(inviteDoc).toPlainObject(),
      responses: inviteDoc.responsesLookup.map((responseDoc: Document): MDBResponseData => {
        return MDBResponse.fromDocument(responseDoc).toPlainObject();
      }),
    };
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
    if (!doc.value) {
      return null;
    }
    return MDBResponse.fromDocument(doc.value);
  }
}

export default MongoDBQueryTemplate;

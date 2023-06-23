import RSVPGuestList from 'components/rsvp-guest-list';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';
import GuestAuthenticator from 'server/authenticator';
import MongoDBClientFactory from 'server/clients/mongodb';
import MDBGuest from 'server/models/guest';
import MDBInvite from 'server/models/invite';
import MDBResponse from 'server/models/response';

const Page = async (): Promise<JSX.Element> => {
  const token = await GuestAuthenticator.verifyTokenOrRedirect(cookies());

  const db = await MongoDBClientFactory.getInstance();
  const aggregation = await db
    .collection('invites')
    .aggregate([
      {
        $limit: 1,
      },
      {
        $match: {
          guests: new ObjectId(token.id),
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
          localField: 'guests._id',
        },
      },
    ])
    .toArray();

  const [doc] = aggregation;

  const data = {
    guests: doc.guestsLookup.map((guestDoc: Document) => {
      return MDBGuest.fromDocument(guestDoc).toPlainObject();
    }),
    invite: MDBInvite.fromDocument(doc).toPlainObject(),
    responses: doc.responsesLookup.map((responseDoc: Document) => {
      return MDBResponse.fromDocument(responseDoc).toPlainObject();
    }),
  };

  return <RSVPGuestList {...data} token={token} />;
};

export default Page;

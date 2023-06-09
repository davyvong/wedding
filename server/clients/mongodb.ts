import { MongoClient } from 'mongodb';
import type { Db } from 'mongodb';

interface Guest {
  email: string;
  id: string;
  name: string;
}

interface Invite {
  guests: Guest[];
  id: string;
}

interface Response {
  guest: Guest;
  id: string;
}

class MongoDBClientFactory {
  private static uri = process.env.MONGODB_URI;
  private static database = MongoDBClientFactory.uri.split('/').at(-1);
  private static instance: MongoClient;

  public static async getInstance(): Promise<Db> {
    if (!MongoDBClientFactory.instance) {
      MongoDBClientFactory.instance = new MongoClient(MongoDBClientFactory.uri);
      await MongoDBClientFactory.instance.connect();
    }
    return MongoDBClientFactory.instance.db(MongoDBClientFactory.database);
  }

  public static toGuest(doc): Guest {
    return {
      email: doc.email,
      id: doc._id,
      name: doc.name,
    };
  }

  public static toInvite(doc): Invite {
    return {
      guests: doc.guests,
      id: doc._id,
    };
  }

  public static toResponse(doc): Response {
    return {
      guest: doc.guest,
      id: doc._id,
    };
  }
}

export default MongoDBClientFactory;

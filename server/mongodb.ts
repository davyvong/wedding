import { MongoClient } from 'mongodb';
import type { Db } from 'mongodb';

let mongoClient;

export const getMongoClient = async (): Promise<MongoClient> => {
  if (!mongoClient) {
    mongoClient = new MongoClient(process.env.MONGODB_URI as string);
    await mongoClient.connect();
  }
  return mongoClient;
};

export const getMongoDatabaseName = (): string => {
  return (process.env.MONGODB_URI as string).split('/').at(-1) as string;
};

export const getMongoDatabase = async (): Promise<Db> => {
  const databaseName = getMongoDatabaseName();
  return (await getMongoClient()).db(databaseName);
};

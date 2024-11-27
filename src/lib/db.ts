import { MongoClient, ObjectId } from 'mongodb';
import { UserProfile } from '@/types/user';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const client = await clientPromise;
    const collection = client.db().collection('users');
    return await collection.findOne({ userId }) as UserProfile | null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function getUserTransactions(userId: string) {
  try {
    const client = await clientPromise;
    const collection = client.db().collection('transactions');
    return await collection
      .find({ userId })
      .sort({ date: -1 })
      .limit(10)
      .toArray();
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export default clientPromise;
import { ObjectId } from 'mongodb';

export interface UserProfile {
  _id: ObjectId;
  userId: string;
  walletAddress: string;
  preferredCurrency: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  _id: ObjectId;
  userId: string;
  type: 'sent' | 'received';
  amount: string;
  currency: string;
  to?: string;
  from?: string;
  status: 'pending' | 'completed';
  date: Date;
  hash: string;
}
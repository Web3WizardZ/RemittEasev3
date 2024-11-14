import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { ethers } from 'ethers';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://RemittDBAdmin:RemittEase2024@cluster0.bga1x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  currency: String,
  walletAddress: { type: String, required: true, unique: true },
  walletSeed: String,
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date
});

let isConnected = false;

const connectDb = async () => {
  if (isConnected) {
    return;
  }

  try {
    if (mongoose.connections[0].readyState) {
      isConnected = true;
      return;
    }

    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export async function POST(req: Request) {
  try {
    await connectDb();
    
    const { fullName, email, currency } = await req.json();

    // Create wallet
    const wallet = ethers.Wallet.createRandom();

    // Create user
    const user = await User.create({
      name: fullName,
      email: email,
      currency: currency,
      walletAddress: wallet.address.toLowerCase(),
      walletSeed: wallet.mnemonic?.phrase,
      createdAt: new Date(),
      lastLogin: new Date()
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        walletAddress: wallet.address,
      },
      wallet: {
        address: wallet.address,
        seed: wallet.mnemonic?.phrase,
        balance: '0.00',
      }
    });

  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create user'
    }, { status: 500 });
  }
}
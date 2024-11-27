import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';
import { ethers } from 'ethers';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://RemittDBAdmin:RemittEase2024@cluster0.bga1x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, default: 'RemittEase User' },
  email: String,
  currency: { type: String, default: 'USD' },
  walletAddress: { type: String, required: true, unique: true },
  walletSeed: String,
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date
});

let isConnected = false;

const connectDb = async () => {
  if (isConnected) return;

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

async function getOrCreateUser(walletAddress: string) {
  // Find existing user
  let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

  // If user doesn't exist, create one
  if (!user) {
    console.log('Creating new user for wallet:', walletAddress);
    user = await User.create({
      walletAddress: walletAddress.toLowerCase(),
      name: `RemittEase User`, // Default name
      currency: 'USD', // Default currency
      createdAt: new Date(),
      lastLogin: new Date()
    });
  }

  return user;
}

export async function POST(req: Request) {
  try {
    await connectDb();

    const { walletAddress, secretKey } = await req.json();

    if (!walletAddress || !secretKey) {
      return NextResponse.json({
        success: false,
        error: 'Wallet address and secret key are required'
      }, { status: 400 });
    }

    // Verify the secret key first
    try {
      let wallet;
      if (secretKey.includes(' ')) {
        // For mnemonic phrases
        wallet = ethers.Wallet.fromMnemonic(secretKey);
      } else {
        // For private keys
        wallet = new ethers.Wallet(secretKey);
      }

      if (wallet.address.toLowerCase() !== walletAddress.toLowerCase()) {
        return NextResponse.json({
          success: false,
          error: 'Invalid credentials'
        }, { status: 401 });
      }

      // Get or create user
      const user = await getOrCreateUser(walletAddress);

      // Update last login
      await User.updateOne(
        { walletAddress: walletAddress.toLowerCase() },
        { $set: { lastLogin: new Date() } }
      );

      // Get wallet balance
      let balance = '0.00';
      try {
        if (!process.env.NEXT_PUBLIC_BLOCKCHAIN_PROVIDER_URL) {
          throw new Error('Blockchain provider URL not configured');
        }
        const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_BLOCKCHAIN_PROVIDER_URL);
        const rawBalance = await provider.getBalance(walletAddress);
        balance = ethers.utils.formatEther(rawBalance);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }

      // Set session cookie
      const cookieStore = await cookies();
      const sessionData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      walletAddress: user.walletAddress,
      currency: user.currency,  // Ensure this is included
      createdAt: new Date().toISOString()
};

      cookieStore.set('user_session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
      });

      // Return success response
      return NextResponse.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          walletAddress: user.walletAddress,
          currency: user.currency
        },
        wallet: {
          address: walletAddress,
          balance: balance
        }
      });

    } catch (error) {
      console.error('Wallet verification error:', error);
      return NextResponse.json({
        success: false,
        error: 'Invalid secret key'
      }, { status: 401 });
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed'
    }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('user_session');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to logout'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userSession = cookieStore.get('user_session');
  
    if (!userSession?.value) {
      return NextResponse.json({ 
        success: false,
        error: 'Not authenticated' 
      }, { status: 401 });
    }
  
    try {
      const sessionData = JSON.parse(userSession.value);
      if (!sessionData.currency) {
        throw new Error('Invalid session data');
      }
      return NextResponse.json({ success: true, session: sessionData });
    } catch {
      return NextResponse.json({
        success: false, 
        error: 'Invalid session format'
      }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get session'
    }, { status: 500 });
  }}
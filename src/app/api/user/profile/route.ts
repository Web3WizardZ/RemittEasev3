// src/app/api/user/profile/route.ts
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';

const MONGODB_URI = process.env.MONGODB_URI;

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, default: 'RemittEase User' },
  email: String,
  currency: { type: String, default: 'USD' },
  walletAddress: { type: String, required: true, unique: true },
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

    await mongoose.connect(MONGODB_URI!);
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export async function GET(request: Request) {
  try {
    // Get user information from cookies or session
    const cookieStore = await cookies();
    const userInfo = cookieStore.get('user_session')?.value;
    
    if (!userInfo) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDb();
    const userSession = JSON.parse(userInfo);
    const user = await User.findOne({ walletAddress: userSession.walletAddress });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      walletAddress: user.walletAddress,
      preferredCurrency: user.currency,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
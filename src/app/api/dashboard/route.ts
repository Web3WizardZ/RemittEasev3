import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { getUserProfile } from '@/lib/db';
import { ethers } from 'ethers';
import type { UserProfile } from '@/types/user';

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Get user session (replace with your actual session logic)
    const session = await getUserProfile("current_user_id"); // Replace with actual user ID

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user profile
    const userProfile = await db
      .collection('users')
      .findOne({ userId: session.userId }) as UserProfile | null;

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get recent transactions
    const transactions = await db
      .collection('transactions')
      .find({ userId: session.userId })
      .sort({ date: -1 })
      .limit(10)
      .toArray();

    // Get wallet balance using ethers.js
    let balance = '0';
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );
      const walletBalance = await provider.getBalance(userProfile.walletAddress);
      balance = ethers.utils.formatEther(walletBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: userProfile,
        transactions,
        balance
      }
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get the session cookie
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session');

    // TODO: In production, validate the session token and fetch user data from your database
    // For now, return test data
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'No session found' },
        { status: 401 }
      );
    }

    // Mock user data - replace with actual database query in production
    const session = {
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Test wallet
      name: 'Test User',
      email: 'test@example.com',
      currency: 'USD'
    };

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
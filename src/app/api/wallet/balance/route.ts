import { NextResponse } from 'next/server';
import { getBalance } from '@/lib/blockchain';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({
        success: false,
        error: 'Wallet address is required'
      }, { status: 400 });
    }

    const balance = await getBalance(address);

    return NextResponse.json({
      success: true,
      balance,
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch balance'
    }, { status: 500 });
  }
}
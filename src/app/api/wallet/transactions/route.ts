import { NextResponse } from 'next/server';
import { getTransactionHistory, getTransactionDetails } from '@/lib/blockchain';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    const txHash = searchParams.get('txHash');

    if (txHash) {
      const details = await getTransactionDetails(txHash);
      if (!details) {
        return NextResponse.json({
          success: false,
          error: 'Transaction not found'
        }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        transaction: details
      });
    }

    if (!address) {
      return NextResponse.json({
        success: false,
        error: 'Wallet address is required'
      }, { status: 400 });
    }

    const transactions = await getTransactionHistory(address);

    return NextResponse.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch transactions'
    }, { status: 500 });
  }
}
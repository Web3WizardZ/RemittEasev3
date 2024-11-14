import { NextResponse } from 'next/server';
import { estimateGas, sendTransaction, validateAddress } from '@/lib/blockchain';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { from, to, value, privateKey } = body;

    if (!from || !to || !value || !privateKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters'
      }, { status: 400 });
    }

    if (!validateAddress(to)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid recipient address'
      }, { status: 400 });
    }

    // First estimate the gas
    const gasEstimate = await estimateGas(from, to, value);

    // Send the transaction
    const { hash } = await sendTransaction(from, to, value, privateKey);

    return NextResponse.json({
      success: true,
      transaction: {
        hash,
        from,
        to,
        value,
        estimatedFee: gasEstimate.estimatedFee
      }
    });
  } catch (error) {
    console.error('Error sending transaction:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send transaction'
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const value = searchParams.get('value');

    if (!from || !to || !value) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters'
      }, { status: 400 });
    }

    if (!validateAddress(to)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid recipient address'
      }, { status: 400 });
    }

    const estimate = await estimateGas(from, to, value);

    return NextResponse.json({
      success: true,
      estimate
    });
  } catch (error) {
    console.error('Error estimating gas:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to estimate transaction fee'
    }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';

const RATES = {
  USD: 1,
  ZAR: 18.5,
  NGN: 1550,
  KES: 130,
  GHS: 12.5,
};

export async function GET() {
  try {
    // In production, fetch real exchange rates from an API
    return NextResponse.json({
      success: true,
      rates: RATES,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch exchange rates'
    }, { status: 500 });
  }
}
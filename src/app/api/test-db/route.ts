import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://remittease:MoeuaEdoYfGN6Y4f@cluster0.bga1x.mongodb.net/remittease?retryWrites=true&w=majority';

export async function GET() {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI);
    }
    
    return NextResponse.json({
      success: true,
      connected: mongoose.connection.readyState === 1,
      database: mongoose.connection.db.databaseName
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
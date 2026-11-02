import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET() {
  try {
    const startTime = Date.now();
    const { client, error } = await connectToDatabase();
    const duration = `${Date.now() - startTime}ms`;

    if (!client) {
      return NextResponse.json(
        { 
          success: false, 
          error: error || 'Database connection unavailable',
          duration 
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      duration
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || 'Database connection failed'
      },
      { status: 500 }
    );
  }
}

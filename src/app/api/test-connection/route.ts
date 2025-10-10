import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET() {
  try {
    console.log('Testing database connection...');
    const startTime = Date.now();
    
    await connectToDatabase();
    
    const endTime = Date.now();
    console.log(`Database connection successful in ${endTime - startTime}ms`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      duration: `${endTime - startTime}ms`
    });
  } catch (error: any) {
    console.error('Database connection failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      },
      { status: 500 }
    );
  }
}
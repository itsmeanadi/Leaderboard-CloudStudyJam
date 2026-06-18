import { NextResponse } from 'next/server';
import { connectToDatabase, initializeDatabase } from '@/lib/db';

export async function GET() {
  try {
    console.log('Initializing database...');
    await connectToDatabase();
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    return NextResponse.json({ 
      message: 'Database initialized successfully' 
    });
  } catch (error: any) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
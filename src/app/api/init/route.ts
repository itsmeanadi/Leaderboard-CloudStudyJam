import { NextResponse } from 'next/server';
import { connectToDatabase, initializeDatabase } from '@/lib/db';

// GET /api/init - Initialize the database
export async function GET() {
  try {
    console.log('Initializing database...');
    await connectToDatabase();
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    return NextResponse.json({ 
      message: 'Database initialized successfully' 
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
}
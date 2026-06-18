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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === 'login') {
      const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'password123';
      if (body.password === validPassword) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';
import { createSessionToken, verifyAdminAuth, getSessionCookieName } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const result = await initializeDatabase();
    const isAdmin = verifyAdminAuth(request);
    
    return NextResponse.json({ 
      success: true, 
      message: result.message,
      isAdmin 
    });
  } catch (error: any) {
    console.error('Error in GET /api/init:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to initialize database' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, password } = body;

    if (action === 'login') {
      const serverPassword = process.env.ADMIN_PASSWORD;

      if (!serverPassword) {
        console.error('ADMIN_PASSWORD environment variable is not configured');
        return NextResponse.json(
          { error: 'Server authentication is not configured. Please set ADMIN_PASSWORD in environment variables.' },
          { status: 500 }
        );
      }

      if (typeof password === 'string' && password === serverPassword) {
        const token = createSessionToken();
        const response = NextResponse.json({ success: true, isAdmin: true });
        
        response.cookies.set({
          name: getSessionCookieName(),
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 24 * 60 * 60, // 24 hours
        });

        return response;
      }

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (action === 'logout') {
      const response = NextResponse.json({ success: true, isAdmin: false });
      response.cookies.delete(getSessionCookieName());
      return response;
    }

    if (action === 'verify') {
      const isAdmin = verifyAdminAuth(request);
      return NextResponse.json({ success: true, isAdmin });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Server error handling request' }, { status: 500 });
  }
}

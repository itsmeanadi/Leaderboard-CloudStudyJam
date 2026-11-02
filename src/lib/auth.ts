import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'admin_session';

function getSecretKey(): string {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return process.env.SESSION_SECRET || 'gdgoc-fallback-secret-studyjam-2026';
  }
  return adminPassword;
}

export function createSessionToken(): string {
  const payload = {
    role: 'admin',
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  const payloadStr = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadStr, 'utf8').toString('base64url');
  
  const hmac = crypto.createHmac('sha256', getSecretKey());
  hmac.update(payloadBase64);
  const signature = hmac.digest('base64url');
  
  return `${payloadBase64}.${signature}`;
}

export function verifySessionToken(token: string): boolean {
  try {
    if (!token || typeof token !== 'string' || !token.includes('.')) return false;
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payloadBase64, signature] = parts;
    if (!payloadBase64 || !signature) return false;

    const hmac = crypto.createHmac('sha256', getSecretKey());
    hmac.update(payloadBase64);
    const expectedSignature = hmac.digest('base64url');

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return false;
    }

    const payloadStr = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadStr);

    if (payload.role !== 'admin') return false;
    if (typeof payload.expiresAt !== 'number' || payload.expiresAt < Date.now()) return false;

    return true;
  } catch {
    return false;
  }
}

export function verifyAdminAuth(request: Request): boolean {
  // 1. Check Authorization header (Bearer token or Bearer ADMIN_PASSWORD)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD) {
      return true;
    }
    if (verifySessionToken(token)) {
      return true;
    }
  }

  // 2. Check admin_session cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const cookieList = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookieList) {
    if (cookie.startsWith(`${SESSION_COOKIE_NAME}=`)) {
      const token = cookie.substring(SESSION_COOKIE_NAME.length + 1).trim();
      if (verifySessionToken(token)) {
        return true;
      }
    }
  }

  return false;
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME;
}


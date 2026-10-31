import {SignJWT, jwtVerify} from 'jose';

// Kept free of next/headers and the database so proxy.ts can use it.

export const sessionCookieName = 'tr_session';
export const sessionMaxAgeSeconds = 7 * 24 * 60 * 60;

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? '';

  if (secret.length < 32) {
    throw new Error('AUTH_SECRET ontbreekt of is korter dan 32 tekens');
  }

  return new TextEncoder().encode(secret);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: sessionMaxAgeSeconds,
  };
}

export async function createSessionCookie(user: {id: string; email: string}): Promise<string> {
  return new SignJWT({email: user.email})
    .setProtectedHeader({alg: 'HS256'})
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${sessionMaxAgeSeconds}s`)
    .sign(getSecret());
}

/** Verifies signature and expiry only. Throws when AUTH_SECRET is misconfigured. */
export async function readSession(cookieValue: string | undefined): Promise<{userId: string; email: string} | undefined> {
  const secret = getSecret();

  if (!cookieValue) {
    return undefined;
  }

  try {
    const {payload} = await jwtVerify(cookieValue, secret, {algorithms: ['HS256']});

    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
      return undefined;
    }

    return {userId: payload.sub, email: payload.email};
  } catch {
    return undefined;
  }
}

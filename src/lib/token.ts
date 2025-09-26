import crypto from "crypto";

const DEFAULT_SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";

function base64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export type JWTPayload = {
  sub: string;
  email: string;
  name?: string;
  iat: number;
  exp: number; // seconds since epoch
};

export function signToken(payload: Omit<JWTPayload, "iat" | "exp">, opts?: { expiresInSec?: number; secret?: string }) {
  const header = { alg: "HS256", typ: "JWT" };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + (opts?.expiresInSec ?? 60 * 60 * 24 * 7);
  const fullPayload: JWTPayload = { ...payload, iat, exp } as JWTPayload;
  const secret = opts?.secret || DEFAULT_SECRET;

  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(fullPayload));
  const data = `${headerB64}.${payloadB64}`;
  const signature = crypto.createHmac("sha256", secret).update(data).digest();
  const sigB64 = base64url(signature);
  return `${data}.${sigB64}`;
}

export function verifyToken(token: string, secret: string = DEFAULT_SECRET): JWTPayload | null {
  try {
    const [headerB64, payloadB64, sig] = token.split(".");
    if (!headerB64 || !payloadB64 || !sig) return null;
    const data = `${headerB64}.${payloadB64}`;
    const expected = base64url(crypto.createHmac("sha256", secret).update(data).digest());
    if (expected !== sig) return null;
    const payload: JWTPayload = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf8"));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
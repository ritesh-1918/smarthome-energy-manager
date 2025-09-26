import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/token";

const globalAny = global as any;
if (!globalAny.__DEMO_USERS__) {
  globalAny.__DEMO_USERS__ = new Map<string, { id: string; email: string; name?: string; passwordHash: string }>();
}
const users: Map<string, { id: string; email: string; name?: string; passwordHash: string }> = globalAny.__DEMO_USERS__;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  let token = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
  if (!token) {
    const cookie = req.cookies.get("token");
    token = cookie?.value;
  }
  if (!token) return NextResponse.json({ user: null }, { status: 200 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ user: null }, { status: 200 });
  const user = users.get(payload.sub);
  if (!user) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
}
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/token";

const globalAny = global as any;
if (!globalAny.__DEMO_USERS__) {
  globalAny.__DEMO_USERS__ = new Map<string, { id: string; email: string; name?: string; passwordHash: string }>();
}
const users: Map<string, { id: string; email: string; name?: string; passwordHash: string }> = globalAny.__DEMO_USERS__;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.email || !body.password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  const email = String(body.email).toLowerCase();
  const found = [...users.values()].find((u) => u.email === email);
  if (!found) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const ok = await bcrypt.compare(String(body.password), found.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const token = signToken({ sub: found.id, email: found.email, name: found.name });
  const res = NextResponse.json({ user: { id: found.id, email: found.email, name: found.name }, token });
  res.headers.set("Set-Cookie", `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`);
  return res;
}
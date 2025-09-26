import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/token";

// naive in-memory store for demo
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
  const name = body.name ? String(body.name) : undefined;
  if ([...users.values()].some((u) => u.email === email)) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }
  const passwordHash = await bcrypt.hash(body.password, 10);
  const id = `${Date.now()}`;
  const user = { id, email, name, passwordHash };
  users.set(id, user);

  const token = signToken({ sub: id, email, name });
  const res = NextResponse.json({ user: { id, email, name }, token });
  res.headers.set("Set-Cookie", `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`);
  return res;
}
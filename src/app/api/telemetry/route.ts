import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { energyReadings } from "@/db/schema";
import { eq, gte, and, asc } from "drizzle-orm";

// Helper to extract user_id from Authorization header
function extractUserId(request: NextRequest): string | null {
  try {
    const auth = request.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) return null;
    const token = auth.slice(7);
    // Simple JWT decode without verification (as requested)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.sub || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '300'), 2000);
    const since = searchParams.get('since') ? parseInt(searchParams.get('since')!) : null;
    const deviceId = searchParams.get('deviceId') ? parseInt(searchParams.get('deviceId')!) : null;

    let query = db.select({
      ts: energyReadings.ts,
      voltage: energyReadings.voltage,
      current: energyReadings.current,
      power: energyReadings.power,
      energy: energyReadings.energy,
    }).from(energyReadings);

    // Apply filters
    const conditions = [];
    if (since !== null) {
      conditions.push(gte(energyReadings.ts, since));
    }
    if (deviceId !== null) {
      conditions.push(eq(energyReadings.deviceId, deviceId));
    }

    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    const data = await query.orderBy(asc(energyReadings.ts)).limit(limit);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET /api/telemetry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { ts, voltage, current, power, energy, deviceId } = body;

    // Validate required fields
    if (typeof voltage !== 'number' || typeof current !== 'number' || Number.isNaN(voltage) || Number.isNaN(current)) {
      return NextResponse.json({ error: "voltage and current must be valid numbers" }, { status: 400 });
    }

    // Validate ranges
    if (voltage < 0 || voltage > 1000) {
      return NextResponse.json({ error: "voltage must be between 0-1000V" }, { status: 400 });
    }
    if (current < 0 || current > 100) {
      return NextResponse.json({ error: "current must be between 0-100A" }, { status: 400 });
    }

    // Auto-compute or validate power
    const finalPower = typeof power === 'number' && !Number.isNaN(power) ? power : voltage * current;
    
    // Auto-set timestamp if not provided
    const finalTs = typeof ts === 'number' && !Number.isNaN(ts) ? ts : Date.now();
    
    // Extract user_id from auth header
    const userId = extractUserId(request);
    
    // Validate deviceId if provided
    const finalDeviceId = typeof deviceId === 'number' && !Number.isNaN(deviceId) ? deviceId : null;

    const result = await db.insert(energyReadings).values({
      ts: finalTs,
      voltage,
      current,
      power: finalPower,
      energy: typeof energy === 'number' && !Number.isNaN(energy) ? energy : null,
      deviceId: finalDeviceId,
      userId,
      createdAt: Date.now(),
    }).returning({ id: energyReadings.id });

    return NextResponse.json({ ok: true, id: result[0].id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/telemetry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
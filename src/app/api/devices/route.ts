import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { devices } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { randomBytes } from 'crypto';

// Helper function to extract user ID from Authorization header
function extractUserIdFromAuth(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.sub || null;
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    // Validate name field
    if (!name || typeof name !== 'string') {
      return NextResponse.json({
        error: "Name is required and must be a string",
        code: "INVALID_NAME"
      }, { status: 400 });
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      return NextResponse.json({
        error: "Name cannot be empty or just whitespace",
        code: "EMPTY_NAME"
      }, { status: 400 });
    }

    // Generate API key (16 bytes = 32 hex chars)
    const apiKey = randomBytes(16).toString('hex');

    // Extract user ID from Authorization header
    const userId = extractUserIdFromAuth(request);

    // Prepare device data
    const now = Date.now();
    const deviceData = {
      name: trimmedName,
      apiKey,
      userId,
      createdAt: now,
      updatedAt: now
    };

    // Insert device into database
    const newDevice = await db.insert(devices)
      .values(deviceData)
      .returning();

    if (newDevice.length === 0) {
      return NextResponse.json({
        error: "Failed to create device",
        code: "CREATE_FAILED"
      }, { status: 500 });
    }

    // Return only id and api_key for device setup
    return NextResponse.json({
      id: newDevice[0].id,
      api_key: newDevice[0].apiKey
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/devices error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // List all devices (no user filtering for security reasons)
    // Return only safe fields: id, name, created_at (exclude api_key)
    const allDevices = await db.select({
      id: devices.id,
      name: devices.name,
      created_at: devices.createdAt
    })
    .from(devices)
    .orderBy(desc(devices.createdAt));

    return NextResponse.json({
      data: allDevices
    }, { status: 200 });

  } catch (error) {
    console.error('GET /api/devices error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}
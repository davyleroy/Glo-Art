import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { env } from '@/lib/env';

// Simple liveness: process is running, we can parse env.
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'kaleido-web',
    env: env.NODE_ENV,
    time: new Date().toISOString(),
  });
}

// Readiness check: hit via /api/health/ready
export async function HEAD() {
  try {
    await db.$queryRaw`SELECT 1`;
    return new Response(null, { status: 200 });
  } catch {
    return new Response(null, { status: 503 });
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const checks: Record<string, 'ok' | 'error'> = {};
  try {
    await db.$queryRaw`SELECT 1`;
    checks.db = 'ok';
  } catch {
    checks.db = 'error';
  }
  const ok = Object.values(checks).every((v) => v === 'ok');
  return NextResponse.json({ status: ok ? 'ok' : 'degraded', checks }, { status: ok ? 200 : 503 });
}

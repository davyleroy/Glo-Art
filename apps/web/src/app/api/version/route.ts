import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'kaleido-web',
    version: process.env.npm_package_version ?? '0.0.0',
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_SHA ?? 'local',
  });
}

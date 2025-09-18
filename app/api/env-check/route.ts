// Returns true if the key is loaded on the server.
import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY });
}

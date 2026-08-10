export const prerender = false;

import { db } from '@/lib/db';
import { adminUsers } from '@/lib/schema';

export async function GET() {
  try {
    const users = await db.select().from(adminUsers);
    return new Response(JSON.stringify({
      ok: true,
      table: 'admin_users',
      rows: users.length,
      emails: users.map(u => u.email),
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({
      ok: false,
      error: e.message,
      code: e.code,
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

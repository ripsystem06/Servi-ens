import { db } from '@/lib/db';
import { businesses } from '@/lib/schema';

export const prerender = false;

export async function GET() {
  try {
    const result = await db.select().from(businesses).limit(1);
    return new Response(JSON.stringify({
      ok: true,
      db: 'connected',
      count: result.length,
      env: !!process.env.DATABASE_URL,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({
      ok: false,
      error: e.message,
      stack: e.stack?.split('\n').slice(0, 3).join('\n'),
      env: !!process.env.DATABASE_URL,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

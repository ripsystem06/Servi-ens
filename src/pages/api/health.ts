import { db } from '@/lib/db';
import { businesses } from '@/lib/schema';

export const prerender = false;

export async function GET() {
  const raw = process.env.DATABASE_URL || '(no definida)';
  // Ocultar contraseña
  const safe = raw.replace(/\/\/[^:]+:([^@]+)@/, '//***:***@');

  try {
    const result = await db.select().from(businesses).limit(1);
    return new Response(JSON.stringify({
      ok: true,
      db: 'connected',
      count: result.length,
      host: safe,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({
      ok: false,
      error: e.message,
      host: safe,
      envKeys: Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('SUPA')),
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

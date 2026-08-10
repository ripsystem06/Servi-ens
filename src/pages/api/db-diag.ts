export const prerender = false;

import { db } from '@/lib/db';
import { businesses } from '@/lib/schema';

export async function GET() {
  const results: any = {};

  // Test 1: read
  try {
    const rows = await db.select().from(businesses).limit(1);
    results.read = { ok: true, count: rows.length };
  } catch (e: any) {
    results.read = { ok: false, error: e.message };
  }

  // Test 2: insert + delete test row
  try {
    await db.insert(businesses).values({
      id: 'test-debug-001',
      slug: 'test-debug-001',
      name: 'TEST DEBUG',
      category: 'plomeria',
      zone: 'centro',
      description: 'test',
      phone: '000',
      email: '',
      address: '',
    });
    results.write = { ok: true, inserted: 'test-debug-001' };
    
    // Cleanup
    try { await db.delete(businesses).where({ id: 'test-debug-001' } as any); } catch {}
  } catch (e: any) {
    results.write = { ok: false, error: e.message, code: e.code };
  }

  return new Response(JSON.stringify(results, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

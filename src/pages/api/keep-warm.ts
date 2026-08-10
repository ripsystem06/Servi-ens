export const prerender = false;

import '@/lib/auth';
import '@/lib/db';
import '@/lib/submission';

export async function GET() {
  return new Response(JSON.stringify({ status: 'warm' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

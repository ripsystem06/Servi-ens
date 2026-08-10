export const prerender = false;

export async function POST({ request }: { request: Request }) {
  const formData = await request.formData();
  const email = formData.get('email') || '';
  const password = formData.get('password') || '';
  
  // Simple test: just echo back what was sent (no DB, no bcrypt)
  return new Response(JSON.stringify({
    ok: true,
    email,
    passwordLength: String(password).length,
    test: 'login endpoint reached server successfully',
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

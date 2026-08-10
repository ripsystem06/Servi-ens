export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { db } from '@/lib/db';
import { submissions } from '@/lib/schema';
import { csrfGuard } from '@/lib/csrf';
import { getClientIP, registroLimiter } from '@/lib/rate-limit';
import { createClient } from '@supabase/supabase-js';

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  _supabase = createClient(url, key);
  return _supabase;
}

// ── Zod schema ────────────────────────────────────────────────────────
const RegistroSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(100),
  category: z.string().min(1, 'Seleccioná una categoría').max(50),
  zone: z.string().min(1, 'Seleccioná una zona').max(50),
  phone: z.string().min(1, 'El teléfono es obligatorio').max(30),
  email: z.string().email('El correo no es válido').max(255).optional().or(z.literal('')),
  website: z.string().max(500).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(5000),
  services: z.string().min(1, 'Seleccioná al menos un servicio').max(3000),
  terms: z.literal('on', { errorMap: () => ({ message: 'Debés aceptar los Términos y Condiciones' }) }),
});

// ── POST handler ──────────────────────────────────────────────────────
export const POST: APIRoute = async ({ request, redirect }) => {
  // ── CSRF protection ────────────────────────────────────────────────
  const csrfError = csrfGuard(request);
  if (csrfError) return csrfError;

  // ── Rate limiting ──────────────────────────────────────────────────
  const ip = getClientIP(request);
  const limit = registroLimiter(ip);
  if (!limit.allowed) {
    const url = new URL('/registro', request.url);
    url.searchParams.set('error', 'Demasiados registros. Esperá una hora.');
    return Response.redirect(url, 302);
  }

  const formData = await request.formData();

  const raw = {
    name: (formData.get('name') as string || '').trim(),
    category: (formData.get('category') as string || '').trim(),
    zone: (formData.get('zone') as string || '').trim(),
    phone: (formData.get('phone') as string || '').trim(),
    email: (formData.get('email') as string || '').trim(),
    website: (formData.get('website') as string || '').trim(),
    address: (formData.get('address') as string || '').trim(),
    description: (formData.get('description') as string || '').trim(),
    services: (formData.get('services') as string || '').trim(),
    terms: (formData.get('terms') as string || '').trim(),
  };

  const parsed = RegistroSchema.safeParse(raw);

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message || 'Datos inválidos';
    const url = new URL('/registro', request.url);
    url.searchParams.set('error', firstError);
    return Response.redirect(url, 302);
  }

  const { name, category, zone, phone, email, website, address, description, services } = parsed.data;

  // ── Handle photo upload ──────────────────────────────────────────
  let photoUrl: string | null = null;
  const photoFile = formData.get('photo') as File | null;
  if (photoFile && photoFile.size > 0) {
    const s = getSupabase();
    if (s) {
      const tempSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) + '-' + Date.now().toString(36);
      const ext = photoFile.type === 'image/jpeg' ? 'jpg' : photoFile.type === 'image/png' ? 'png' : 'webp';
      const spath = `${tempSlug}.${ext}`;
      try {
        const { error } = await s.storage.from('servicios').upload(spath, photoFile, {
          cacheControl: '3600', upsert: true, contentType: photoFile.type,
        });
        if (!error) {
          const { data } = s.storage.from('servicios').getPublicUrl(spath);
          photoUrl = data.publicUrl;
        }
      } catch {}
    }
  }

  // ── Insert into DB ──────────────────────────────────────────────────
  try {
    await db.insert(submissions).values({
      name,
      category,
      zone,
      phone,
      email: email || '',
      description,
      services: services || null,
      website: website || null,
      address: address || null,
      termsAcceptedAt: new Date(),
      photoUrl: photoUrl,
      photoUrl: photoUrl,
    });
  } catch (err) {
    const url = new URL('/registro', request.url);
    url.searchParams.set('error', 'Error al guardar. Intentá de nuevo.');
    return Response.redirect(url, 302);
  }

  // ── Send email notification ─────────────────────────────────────────
  try {
    await sendAdminNotification({
      name, category, zone, phone, email: email || '', description, services: services || '',
    });
  } catch {
    // Email failed but submission was saved — silently continue
  }

  const url = new URL('/registro', request.url);
  url.searchParams.set('success', '1');
  return Response.redirect(url, 302);
};

// ── Email helper ───────────────────────────────────────────────────────
interface NotificationData {
  name: string;
  category: string;
  zone: string;
  phone: string;
  email: string;
  description: string;
  services: string;
}

async function sendAdminNotification(data: NotificationData): Promise<void> {
  const nodemailer = await import('nodemailer');

  const adminEmail = import.meta.env.ADMIN_EMAIL || 'admin@catalogoensenada.com';
  const smtpHost = import.meta.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(import.meta.env.SMTP_PORT || '587', 10);
  const smtpUser = import.meta.env.SMTP_USER;
  const smtpPass = import.meta.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    throw new Error('SMTP not configured');
  }

  const transporter = nodemailer.default.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const html = `
    <h2>Nuevo registro de servicio</h2>
    <table style="border-collapse:collapse;width:100%;max-width:500px">
      <tr><td style="padding:6px 12px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5">Nombre</td><td style="padding:6px 12px;border:1px solid #ddd">${data.name}</td></tr>
      <tr><td style="padding:6px 12px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5">Categoría</td><td style="padding:6px 12px;border:1px solid #ddd">${data.category}</td></tr>
      <tr><td style="padding:6px 12px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5">Zona</td><td style="padding:6px 12px;border:1px solid #ddd">${data.zone}</td></tr>
      <tr><td style="padding:6px 12px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5">Teléfono</td><td style="padding:6px 12px;border:1px solid #ddd">${data.phone}</td></tr>
      <tr><td style="padding:6px 12px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5">Email</td><td style="padding:6px 12px;border:1px solid #ddd">${data.email || '-'}</td></tr>
      <tr><td style="padding:6px 12px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5">Servicios</td><td style="padding:6px 12px;border:1px solid #ddd">${data.services || '-'}</td></tr>
      <tr><td style="padding:6px 12px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5">Descripción</td><td style="padding:6px 12px;border:1px solid #ddd">${data.description}</td></tr>
    </table>
    <p style="margin-top:16px;color:#666">
      Revisá este registro en el <a href="${import.meta.env.SITE_URL || 'http://localhost:4321'}/admin">panel de administración</a>.
    </p>
  `;

  await transporter.sendMail({
    from: `"Catálogo Ensenada" <${smtpUser}>`,
    to: adminEmail,
    subject: `📋 Nuevo registro: ${data.name} — ${data.category}`,
    html,
  });
}

export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { db } from '@/lib/db';
import { adInquiries } from '@/lib/schema';
import { csrfGuard } from '@/lib/csrf';
import { getClientIP, publicidadLimiter } from '@/lib/rate-limit';

const PublicidadSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(100),
  business: z.string().min(1, 'El nombre del negocio es obligatorio').max(100),
  email: z.string().email('El correo no es válido').max(255),
  phone: z.string().min(1, 'El teléfono es obligatorio').max(30),
  interest: z.string().min(1, 'Seleccioná un tipo de publicidad').max(50),
  message: z.string().max(1000).optional(),
});

export const POST: APIRoute = async ({ request, redirect }) => {
  // ── CSRF protection ────────────────────────────────────────────────
  const csrfError = csrfGuard(request);
  if (csrfError) return csrfError;

  // ── Rate limiting ──────────────────────────────────────────────────
  const ip = getClientIP(request);
  const limit = publicidadLimiter(ip);
  if (!limit.allowed) {
    const url = new URL('/publicidad', request.url);
    url.searchParams.set('error', 'Demasiadas solicitudes. Esperá una hora.');
    return Response.redirect(url, 302);
  }

  const formData = await request.formData();
  const raw = {
    name: (formData.get('name') as string || '').trim(),
    business: (formData.get('business') as string || '').trim(),
    email: (formData.get('email') as string || '').trim(),
    phone: (formData.get('phone') as string || '').trim(),
    interest: (formData.get('interest') as string || '').trim(),
    message: (formData.get('message') as string || '').trim(),
  };

  const parsed = PublicidadSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message || 'Datos inválidos';
    const url = new URL('/publicidad', request.url);
    url.searchParams.set('error', firstError);
    return Response.redirect(url, 302);
  }

  const { name, business, email, phone, interest, message } = parsed.data;

  try {
    await db.insert(adInquiries).values({
      name,
      business,
      email,
      phone,
      interest: interest as typeof adInquiries.interest.enumValues[number],
      message: message || '',
    });
  } catch {
    const url = new URL('/publicidad', request.url);
    url.searchParams.set('error', 'Error al enviar. Intentá de nuevo.');
    return Response.redirect(url, 302);
  }

  // Send email notification
  try {
    await sendAdminNotification({ name, business, email, phone, interest, message: message || '' });
  } catch { /* email failed but saved — OK */ }

  const url = new URL('/publicidad', request.url);
  url.searchParams.set('success', '1');
  return Response.redirect(url, 302);
};

interface InquiryData {
  name: string;
  business: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
}

async function sendAdminNotification(data: InquiryData): Promise<void> {
  const nodemailer = await import('nodemailer');
  const adminEmail = import.meta.env.ADMIN_EMAIL || 'admin@catalogoensenada.com';
  const smtpHost = import.meta.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(import.meta.env.SMTP_PORT || '587', 10);
  const smtpUser = import.meta.env.SMTP_USER;
  const smtpPass = import.meta.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) throw new Error('SMTP not configured');

  const transporter = nodemailer.default.createTransport({
    host: smtpHost, port: smtpPort, secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const interestLabels: Record<string, string> = {
    'banner-home': 'Banner en página principal',
    'banner-categoria': 'Banner en páginas de categoría',
    'banner-lateral': 'Banner lateral (sidebar)',
    'perfil-destacado': 'Perfil destacado en el catálogo',
    'no-se': 'Quiere más información',
  };

  await transporter.sendMail({
    from: `"Serv-Ens Publicidad" <${smtpUser}>`,
    to: adminEmail,
    subject: `📢 Nueva solicitud de publicidad: ${data.business}`,
    html: `
      <h2>Nueva solicitud de publicidad</h2>
      <table style="border-collapse:collapse;width:100%;max-width:500px">
        <tr><td style="padding:6px 12px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5">Nombre</td><td style="padding:6px 12px;border:1px solid #ddd">${data.name}</td></tr>
        <tr><td style="padding:6px 12px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5">Negocio</td><td style="padding:6px 12px;border:1px solid #ddd">${data.business}</td></tr>
        <tr><td style="padding:6px 12px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5">Email</td><td style="padding:6px 12px;border:1px solid #ddd">${data.email}</td></tr>
        <tr><td style="padding:6px 12px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5">Teléfono</td><td style="padding:6px 12px;border:1px solid #ddd">${data.phone}</td></tr>
        <tr><td style="padding:6px 12px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5">Interés</td><td style="padding:6px 12px;border:1px solid #ddd">${interestLabels[data.interest] || data.interest}</td></tr>
        <tr><td style="padding:6px 12px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5">Mensaje</td><td style="padding:6px 12px;border:1px solid #ddd">${data.message || '-'}</td></tr>
      </table>
    `,
  });
}

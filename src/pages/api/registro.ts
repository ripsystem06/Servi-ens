export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { db } from '@/lib/db';
import { submissions } from '@/lib/schema';
import Database from 'better-sqlite3';

// ── Zod schema ────────────────────────────────────────────────────────
const RegistroSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  category: z.string().min(1, 'Seleccioná una categoría'),
  zone: z.string().min(1, 'Seleccioná una zona'),
  phone: z.string().min(1, 'El teléfono es obligatorio'),
  email: z.string().email('El correo no es válido').optional().or(z.literal('')),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  services: z.string().optional(),
  terms: z.literal('on', { errorMap: () => ({ message: 'Debés aceptar los Términos y Condiciones' }) }),
});

// ── Ensure submissions table exists ───────────────────────────────────
let tableEnsured = false;
function ensureTable(): void {
  if (tableEnsured) return;
  const sqlite = new Database('data/admin.db');
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      zone TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL,
      services TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
      admin_notes TEXT,
      terms_accepted_at TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  // Add terms_accepted_at column if upgrading from older schema
  try {
    sqlite.exec(`ALTER TABLE submissions ADD COLUMN terms_accepted_at TEXT;`);
    sqlite.exec(`UPDATE submissions SET terms_accepted_at = datetime('now') WHERE terms_accepted_at IS NULL;`);
  } catch { /* column already exists — ok */ }
  sqlite.close();
  tableEnsured = true;
}

// ── POST handler ──────────────────────────────────────────────────────
export const POST: APIRoute = async ({ request, redirect }) => {
  ensureTable();

  const formData = await request.formData();

  const raw = {
    name: (formData.get('name') as string || '').trim(),
    category: (formData.get('category') as string || '').trim(),
    zone: (formData.get('zone') as string || '').trim(),
    phone: (formData.get('phone') as string || '').trim(),
    email: (formData.get('email') as string || '').trim(),
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

  const { name, category, zone, phone, email, description, services } = parsed.data;

  // ── Insert into DB ──────────────────────────────────────────────────
  try {
    db.insert(submissions).values({
      name,
      category,
      zone,
      phone,
      email: email || '',
      description,
      services: services || null,
      terms_accepted_at: new Date().toISOString(),
    }).run();
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

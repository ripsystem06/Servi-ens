export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { db } from '@/lib/db';
import { reviews } from '@/lib/schema';
import { validateReviewContent } from '@/lib/profanity';
import { csrfGuard } from '@/lib/csrf';
import { getClientIP, reviewLimiter } from '@/lib/rate-limit';

// ── Zod schema ────────────────────────────────────────────────────────
const ReviewSchema = z.object({
  business_slug: z
    .string()
    .min(1, 'Servicio no especificado')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug de servicio inválido'),
  author_name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre es demasiado largo'),
  author_surname: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido es demasiado largo'),
  rating: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(1).max(5)),
  comment: z
    .string()
    .min(1, 'Escribí un comentario')
    .max(150, 'El comentario no puede superar los 150 caracteres'),
});

// ── POST handler ──────────────────────────────────────────────────────
export const POST: APIRoute = async ({ request, redirect }) => {
  // ── CSRF protection ────────────────────────────────────────────────
  const csrfError = csrfGuard(request);
  if (csrfError) return csrfError;

  // ── Rate limiting ──────────────────────────────────────────────────
  const ip = getClientIP(request);
  const limit = reviewLimiter(ip);
  if (!limit.allowed) {
    const backUrl = new URL(request.url);
    backUrl.searchParams.set('review_error', 'Demasiadas reseñas. Esperá un minuto.');
    return Response.redirect(backUrl, 302);
  }

  const formData = await request.formData();

  const raw = {
    business_slug: (formData.get('business_slug') as string || '').trim(),
    author_name: (formData.get('author_name') as string || '').trim(),
    author_surname: (formData.get('author_surname') as string || '').trim(),
    rating: (formData.get('rating') as string || '0').trim(),
    comment: (formData.get('comment') as string || '').trim(),
  };

  // ── Validate with Zod ───────────────────────────────────────────────
  const parsed = ReviewSchema.safeParse(raw);

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message || 'Datos inválidos';
    const url = new URL(request.url);
    const slug = raw.business_slug || '';
    const backUrl = slug
      ? new URL(`/servicio/${slug}`, request.url)
      : new URL('/', request.url);
    backUrl.searchParams.set('review_error', firstError);
    return Response.redirect(backUrl, 302);
  }

  const { business_slug, author_name, author_surname, rating, comment } = parsed.data;

  // ── Profanity check ─────────────────────────────────────────────────
  const profanityResult = validateReviewContent(author_name, author_surname, comment);

  const status = profanityResult.containsProfanity ? 'rejected' : 'approved';

  // ── Insert into DB ──────────────────────────────────────────────────
  try {
    await db.insert(reviews).values({
      businessSlug: business_slug,
      authorName: author_name,
      authorSurname: author_surname,
      rating,
      comment,
      status,
    });
  } catch {
    const backUrl = new URL(`/servicio/${business_slug}`, request.url);
    backUrl.searchParams.set('review_error', 'Error al guardar tu reseña. Intentá de nuevo.');
    return Response.redirect(backUrl, 302);
  }

  // ── Redirect ────────────────────────────────────────────────────────
  if (status === 'rejected') {
    const backUrl = new URL(`/servicio/${business_slug}`, request.url);
    backUrl.searchParams.set(
      'review_error',
      'Tu comentario contiene lenguaje inapropiado y no fue publicado. Modificalo y volvé a intentarlo.',
    );
    return Response.redirect(backUrl, 302);
  }

  const backUrl = new URL(`/servicio/${business_slug}`, request.url);
  backUrl.searchParams.set('review_success', '1');
  return Response.redirect(backUrl, 302);
};

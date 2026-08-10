import { db } from './db';
import { submissions } from './schema';
import { eq, desc } from 'drizzle-orm';

export interface Submission {
  id: number;
  name: string;
  category: string;
  zone: string;
  phone: string;
  email: string;
  description: string;
  services: string | null;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes: string | null;
  termsAcceptedAt: string | null;
  businessId: string | null;
  photoUrl: string | null;
  createdAt: string;
}

/** Get all submissions ordered by newest first. */
export async function getSubmissions(): Promise<Submission[]> {
  return db
    .select()
    .from(submissions)
    .orderBy(desc(submissions.createdAt)) as Promise<Submission[]>;
}

/** Get a single submission by ID. */
export async function getSubmission(id: number): Promise<Submission | null> {
  const result = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1);
  return result[0] as Submission | null;
}

/** Count pending submissions. */
export async function countPending(): Promise<number> {
  const result = await db
    .select({ count: submissions.id })
    .from(submissions)
    .where(eq(submissions.status, 'pending'));
  return result.length;
}

/** Update submission status and optionally set admin notes and business link. */
export async function updateStatus(
  id: number,
  status: 'approved' | 'rejected',
  adminNotes?: string,
  businessId?: string,
): Promise<void> {
  const data: Record<string, unknown> = { status };
  if (adminNotes !== undefined) data.adminNotes = adminNotes || null;
  if (businessId !== undefined) data.businessId = businessId;
  await db.update(submissions).set(data).where(eq(submissions.id, id));
}

/** Get human-readable category name from slug. */
export function getCategoryLabel(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Get status badge classes. */
export function getStatusBadge(status: string): { bg: string; text: string; label: string } {
  switch (status) {
    case 'approved':
      return { bg: 'bg-success/15', text: 'text-success', label: 'Aprobado' };
    case 'rejected':
      return { bg: 'bg-error/15', text: 'text-error', label: 'Rechazado' };
    default:
      return { bg: 'bg-warning/15', text: 'text-warning', label: 'Pendiente' };
  }
}

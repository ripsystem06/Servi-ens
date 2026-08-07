import { db } from './db';
import { submissions } from './schema';
import { eq, desc, sql } from 'drizzle-orm';

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
  createdAt: string;
}

/** Get all submissions ordered by newest first. */
export function getSubmissions(): Submission[] {
  return db
    .select()
    .from(submissions)
    .orderBy(desc(submissions.createdAt))
    .all() as Submission[];
}

/** Get a single submission by ID. */
export function getSubmission(id: number): Submission | null {
  const result = db
    .select()
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1)
    .all() as Submission[];
  return result.length > 0 ? result[0] : null;
}

/** Count pending submissions. */
export function countPending(): number {
  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(submissions)
    .where(eq(submissions.status, 'pending'))
    .all();
  return result[0]?.count ?? 0;
}

/** Update submission status and optionally set admin notes. */
export function updateStatus(
  id: number,
  status: 'approved' | 'rejected',
  adminNotes?: string,
): void {
  const data: Record<string, unknown> = { status };
  if (adminNotes !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data as any).adminNotes = adminNotes || null;
  }
  db.update(submissions).set(data).where(eq(submissions.id, id)).run();
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

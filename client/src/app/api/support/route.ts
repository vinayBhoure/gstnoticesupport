import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { supportSchema } from '@/lib/schemas/support.schema';
import { SupportRequestEmail } from '@/lib/email/templates/SupportRequestEmail';
import { SupportConfirmationEmail } from '@/lib/email/templates/SupportConfirmationEmail';
import { getCurrentUser } from '@/lib/auth/session';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

type Envelope<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
  statusCode: number;
};

function envelope<T>(
  data: T | null,
  error: string | null,
  statusCode: number,
): NextResponse<Envelope<T>> {
  return NextResponse.json(
    { success: error === null, data, error, statusCode },
    { status: statusCode },
  );
}

// Reuses the Contact page's Resend flow (RULES.md — single source of truth for
// email sending), but identity comes from the session cookie, never the request
// body (RULES.md §4.6) — the client only ever supplies title + message.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return envelope(null, 'Authentication required', 401);
  }

  const limit = checkRateLimit(`support:${user.id}`);
  if (!limit.allowed) {
    return envelope(null, 'Too many requests. Please try again later.', 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return envelope(null, 'Invalid request body', 400);
  }

  const parsed = supportSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(', ');
    return envelope(null, message, 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.SUPPORT_TO_EMAIL;
  if (!apiKey || !from || !to) {
    return envelope(null, 'Email service is not configured', 500);
  }

  const { title, message } = parsed.data;
  const { name, email, phone } = user;
  const mobile = phone ?? 'Not provided';
  const resend = new Resend(apiKey);

  const requestHtml = await render(
    SupportRequestEmail({ name, email, mobile, title, message }),
  );

  const { data, error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `New Help & Support request: ${title}`,
    html: requestHtml,
  });

  if (error) {
    console.error('[support] resend send failed', { reason: error.name });
    return envelope(null, 'Could not send your message', 502);
  }

  console.info('[support] sent', { id: data?.id ?? null });

  const confirmationHtml = await render(SupportConfirmationEmail({ name, title }));
  const { error: confirmationError } = await resend.emails.send({
    from,
    to: email,
    subject: 'We’ve received your query — GST Notice Support',
    html: confirmationHtml,
  });

  if (confirmationError) {
    console.error('[support] confirmation email failed', { reason: confirmationError.name });
  }

  return envelope({ sent: true }, null, 200);
}

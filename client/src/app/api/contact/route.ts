import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { contactSchema } from '@/lib/schemas/contact.schema';
import { ContactNotificationEmail } from '@/lib/email/templates/ContactNotificationEmail';
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

export async function POST(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';
  const limit = checkRateLimit(`contact:${ip}`);
  if (!limit.allowed) {
    return envelope(null, 'Too many requests. Please try again later.', 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return envelope(null, 'Invalid request body', 400);
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(', ');
    return envelope(null, message, 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !from || !to) {
    return envelope(null, 'Email service is not configured', 500);
  }

  const { name, mobile, email, query } = parsed.data;
  const resend = new Resend(apiKey);

  const html = await render(
    ContactNotificationEmail({ name, mobile, email, query }),
  );

  const { data, error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `New contact enquiry from ${name}`,
    html,
  });

  if (error) {
    console.error('[contact] resend send failed', { reason: error.name });
    return envelope(null, 'Could not send your message', 502);
  }

  console.info('[contact] sent', { id: data?.id ?? null });
  return envelope({ sent: true }, null, 200);
}

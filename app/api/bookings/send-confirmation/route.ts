import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { requireAuth } from '@/lib/api/auth';
import { getCancellationPolicyHtml } from '@/lib/booking/policy-copy';
import { sendBookingConfirmationSchema } from '@/lib/validations/booking';
import { escapeHtml, sanitizePlainText } from '@/lib/utils/sanitize';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const user = auth.user;
  if (!user?.email) {
    return NextResponse.json(
      { error: 'No email address for user' },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body', errorCode: 'INVALID_JSON' },
      { status: 400 },
    );
  }

  const parsed = sendBookingConfirmationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.errors[0]?.message ?? 'Invalid confirmation payload',
        errorCode: 'INVALID_CONFIRMATION_PAYLOAD',
      },
      { status: 400 },
    );
  }
  const { rinkName, bookingDate, startTime, endTime, hours, total } = parsed.data;
  const safeRinkNameText = sanitizePlainText(rinkName) || 'Ice Rink';
  const safeRinkNameHtml = escapeHtml(rinkName);
  const safeBookingDate = escapeHtml(bookingDate);
  const safeStartTime = escapeHtml(startTime);
  const safeEndTime = escapeHtml(endTime);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set, skipping confirmation email');
    return NextResponse.json({ ok: true, skipped: 'no api key' });
  }

  const subject = `GoGoHockey – Booking confirmation: ${safeRinkNameText}`;
  const policyHtml = getCancellationPolicyHtml();
  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #0E4877;">Booking Confirmation</h2>
      <p>Hi,</p>
      <p>Your ice time has been reserved at <strong>${safeRinkNameHtml}</strong>.</p>
      <table style="border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px 16px 8px 0; color: #666;">Date</td><td>${safeBookingDate}</td></tr>
        <tr><td style="padding: 8px 16px 8px 0; color: #666;">Time</td><td>${safeStartTime} – ${safeEndTime}</td></tr>
        <tr><td style="padding: 8px 16px 8px 0; color: #666;">Duration</td><td>${hours} hour(s)</td></tr>
        <tr><td style="padding: 8px 16px 8px 0; color: #666;">Total</td><td>$${total.toFixed(2)}</td></tr>
      </table>
      ${policyHtml}
      <p>Thank you for using GoGoHockey!</p>
    </div>
  `;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM ?? 'GoGoHockey <onboarding@resend.dev>',
    to: [user.email],
    subject,
    html,
  });

  if (error) {
    console.error('Resend error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

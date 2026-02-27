import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { requireAuth } from '@/lib/api/auth';
import { getCancellationPolicyHtml } from '@/lib/booking/policy-copy';

type Body = {
  rinkName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  hours: number;
  total: number;
};

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

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const { rinkName, bookingDate, startTime, endTime, hours, total } = body;
  if (!rinkName || !bookingDate || !startTime || !endTime || hours == null || total == null) {
    return NextResponse.json(
      { error: 'Missing required fields: rinkName, bookingDate, startTime, endTime, hours, total' },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set, skipping confirmation email');
    return NextResponse.json({ ok: true, skipped: 'no api key' });
  }

  const subject = `GoGoHockey – Booking confirmation: ${rinkName}`;
  const policyHtml = getCancellationPolicyHtml();
  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #0E4877;">Booking Confirmation</h2>
      <p>Hi,</p>
      <p>Your ice time has been reserved at <strong>${rinkName}</strong>.</p>
      <table style="border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px 16px 8px 0; color: #666;">Date</td><td>${bookingDate}</td></tr>
        <tr><td style="padding: 8px 16px 8px 0; color: #666;">Time</td><td>${startTime} – ${endTime}</td></tr>
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

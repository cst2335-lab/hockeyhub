import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { manageRinkUpdateSchema } from '@/lib/validations/rink';
import { normalizeHttpUrl, sanitizeOptionalText } from '@/lib/utils/sanitize';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const user = auth.user!;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON', errorCode: 'INVALID_JSON' },
      { status: 400 }
    );
  }

  const parsed = manageRinkUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.errors[0]?.message ?? 'Invalid rink update payload',
        errorCode: 'INVALID_RINK_UPDATE_PAYLOAD',
      },
      { status: 400 }
    );
  }

  const {
    rinkId,
    hourly_rate: hourlyRateInput,
    booking_url: bookingUrlInput,
    amenities: amenitiesInput,
    peak_hours: peakHoursInput,
    special_notes: specialNotesInput,
  } = parsed.data;

  const parsedRate = Number(hourlyRateInput || '');
  const hourly_rate = Number.isFinite(parsedRate) && parsedRate >= 0 ? parsedRate : null;
  const bookingUrl = normalizeHttpUrl(bookingUrlInput, 1000);
  const peakHours = sanitizeOptionalText(peakHoursInput, 200);
  const specialNotes = sanitizeOptionalText(specialNotesInput, 1000);
  const amenities =
    sanitizeOptionalText(amenitiesInput, 1000)
      ?.split(',')
      .map((item) => sanitizeOptionalText(item, 80))
      .filter((item): item is string => Boolean(item)) ?? [];

  const supabase = await createClient();
  const { data: manager } = await supabase
    .from('rink_managers')
    .select('rink_id')
    .eq('user_id', user.id)
    .eq('rink_id', rinkId)
    .eq('verified', true)
    .maybeSingle();

  if (!manager) {
    return NextResponse.json(
      { error: 'Forbidden', errorCode: 'RINK_MANAGER_REQUIRED' },
      { status: 403 }
    );
  }

  const { error: updateError } = await supabase
    .from('rinks')
    .update({
      hourly_rate,
      booking_url: bookingUrl,
      amenities,
      custom_info: {
        peak_hours: peakHours,
        special_notes: specialNotes,
      },
      source: 'manager_updated',
    })
    .eq('id', rinkId);

  if (updateError) {
    console.error('Rink update API error:', updateError);
    return NextResponse.json(
      { error: 'Failed to update rink', errorCode: 'RINK_UPDATE_FAILED' },
      { status: 500 }
    );
  }

  const { error: logError } = await supabase
    .from('rink_updates_log')
    .insert({
      rink_id: rinkId,
      updated_by: user.id,
      changes: {
        hourly_rate,
        booking_url: bookingUrl,
        amenities,
        peak_hours: peakHours,
        special_notes: specialNotes,
      },
      update_type: 'manager_update',
    });

  if (logError) {
    console.warn('Rink update log insert failed:', logError);
  }

  return NextResponse.json({ ok: true });
}

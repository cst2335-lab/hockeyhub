import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { notificationActionSchema } from '@/lib/validations/notification';

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

  const parsed = notificationActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.errors[0]?.message ?? 'Invalid notification action payload',
        errorCode: 'INVALID_NOTIFICATION_ACTION',
      },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const payload = parsed.data;

  if (payload.action === 'mark_read') {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', payload.notificationId)
      .eq('user_id', user.id)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('Notification mark_read API error:', error);
      return NextResponse.json(
        { error: 'Failed to mark notification as read', errorCode: 'NOTIFICATION_UPDATE_FAILED' },
        { status: 500 }
      );
    }
    if (!data) {
      return NextResponse.json(
        { error: 'Notification not found', errorCode: 'NOTIFICATION_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  }

  if (payload.action === 'mark_all_read') {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Notification mark_all_read API error:', error);
      return NextResponse.json(
        { error: 'Failed to mark all notifications as read', errorCode: 'NOTIFICATION_UPDATE_FAILED' },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true });
  }

  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', payload.notificationId)
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Notification delete API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification', errorCode: 'NOTIFICATION_DELETE_FAILED' },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: 'Notification not found', errorCode: 'NOTIFICATION_NOT_FOUND' },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}

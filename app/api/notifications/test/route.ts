// app/api/notifications/test/route.ts
import { createServiceClient } from '@/lib/supabase/service';
import { requireAuth } from '@/lib/api/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const userId = auth.user.id;

    // 使用service client插入通知
    const serviceClient = createServiceClient();
    
    const notifications = [
      {
        user_id: userId,
        type: 'game_interest',
        title: 'Test: New Interest in Your Game!',
        message: 'John Doe has expressed interest in "Saturday Morning Hockey"',
        link: '/games/test-game-1',
        is_read: false
      },
      {
        user_id: userId,
        type: 'interest_accepted',
        title: 'Test: Your Interest Was Accepted!',
        message: 'Your interest in "Friday Night Game" has been accepted.',
        link: '/games/test-game-2',
        is_read: false
      },
      {
        user_id: userId,
        type: 'game_updated',
        title: 'Test: Game Time Changed',
        message: 'The game "Sunday Practice" has been rescheduled to 3:00 PM',
        link: '/games/test-game-3',
        is_read: true
      }
    ];

    const { data, error } = await serviceClient
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: 'Test notifications created successfully!',
      count: data?.length || 0,
      notifications: data
    });
  } catch (error) {
    console.error('Error creating test notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
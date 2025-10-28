// app/api/notifications/test/route.ts
import { createServiceClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // 从cookies获取session
    const cookieStore = await cookies();
    const supabase = createClient();
    
    // 获取session token
    const token = cookieStore.get('sb-ivrralpjkxmbgultqimc-auth-token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Please login to test notifications' },
        { status: 401 }
      );
    }

    // 解析token获取用户ID
    const tokenParts = token.value.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    const userId = payload.sub;

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
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

/**
 * 获取当前认证用户。用于 API 路由（Server-side）。
 * @returns 若未登录返回 401 Response，否则返回 { user }
 */
export async function requireAuth(): Promise<
  | { user: User; error: null }
  | { user: null; error: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  return { user, error: null };
}

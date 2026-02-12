'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

/**
 * 客户端认证状态 Hook
 * - 返回当前 user、loading、signOut
 * - 订阅 auth 状态变化（登录/登出/刷新）
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;

    const getInitial = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (mounted) {
        setUser(u ?? null);
        setLoading(false);
      }
    };

    getInitial();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
        }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  return { user, loading, signOut };
}

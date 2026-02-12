'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

export type BookingWithRink = {
  id: string;
  user_id: string;
  rink_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  hours: number;
  subtotal: number;
  platform_fee: number;
  total: number;
  status: string;
  rinks?: { name: string; address: string } | null;
};

export function useBookings() {
  const supabase = useMemo(() => createClient(), []);
  const { user, loading: authLoading } = useAuth();

  const { data: bookings = [], isLoading: queryLoading } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select(`*, rinks (name, address)`)
        .eq('user_id', user.id)
        .order('booking_date', { ascending: true });
      if (error) throw error;
      return (data ?? []) as BookingWithRink[];
    },
    enabled: !!user?.id,
  });

  const isLoading = authLoading || queryLoading;
  return { bookings, isLoading, user };
}

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestNotificationsClient() {
  const [data, setData] = useState<unknown[]>([]);

  useEffect(() => {
    async function test() {
      const supabase = createClient();
      const { data: result } = await supabase.from('notifications').select('*');
      if (result) setData(result);
    }
    test();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">GoGoHockey - Test Notifications</h1>
      <pre className="text-sm overflow-auto">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

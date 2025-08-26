'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestPage() {
  const [data, setData] = useState<any[]>([]);
  
  useEffect(() => {
    async function test() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('notifications')
        .select('*');
      
      console.log('Test result:', { data, error });
      if (data) setData(data);
    }
    test();
  }, []);

  return (
    <div className="p-8">
      <h1>Test Notifications</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
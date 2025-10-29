//app/[locale]/(auth)/register/page.tsx
import { Suspense } from 'react';
import RegisterClient from './RegisterClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterClient />
    </Suspense>
  );
}
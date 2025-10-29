//app/[locale]/login/page.tsx
import { Suspense } from 'react';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginClient />
    </Suspense>
  );
}
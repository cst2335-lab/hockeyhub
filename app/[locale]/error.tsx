'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const locale = pathname?.split('/')?.[1] || 'en';
  const withLocale = (p: string) => `/${locale}${p}`.replace(/\/{2,}/g, '/');

  useEffect(() => {
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-slate-600 mb-6">
          An unexpected error occurred. Please try again or go back to the home page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gogo-primary text-white rounded-lg hover:bg-gogo-dark transition font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href={withLocale('/')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

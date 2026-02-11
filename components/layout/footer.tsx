// components/layout/footer.tsx
'use client';

import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

export default function Footer() {
  return (
    <footer className="border-t bg-slate-50">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <Logo size="sm" showText={true} light={false} />
          <span className="hidden sm:inline text-gray-400">·</span>
          <span>© {new Date().getFullYear()} GoGoHockey</span>
          <span className="hidden md:inline">·</span>
          <Link href="https://vercel.com" className="hover:text-gray-900">Powered by Vercel</Link>
        </div>

        <nav className="flex items-center gap-4">
          <Link href="#" className="hover:text-gray-900">Privacy</Link>
          <Link href="#" className="hover:text-gray-900">Terms</Link>
          <Link href="#" className="hover:text-gray-900">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}

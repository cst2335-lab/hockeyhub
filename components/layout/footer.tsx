// components/layout/footer.tsx
'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row gap-4 items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>© {new Date().getFullYear()} HockeyHub</span>
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

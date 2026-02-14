'use client';

/**
 * Salient-style slim layout for auth pages: form card on the left,
 * right panel on lg (gradient using project colors). Layout/格局 only.
 */
export function SlimLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen shrink-0 justify-center md:px-12 lg:px-0">
      <div className="relative z-10 flex flex-1 flex-col bg-surface px-4 py-10 shadow-2xl sm:justify-center md:flex-none md:px-28">
        <main className="mx-auto w-full max-w-md sm:px-4 md:w-96 md:max-w-sm md:px-0">
          {children}
        </main>
      </div>
      <div className="hidden sm:contents lg:relative lg:block lg:flex-1">
        <div
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            background: 'linear-gradient(135deg, hsl(214, 52%, 19%) 0%, hsl(207, 79%, 26%) 50%, hsl(201, 82%, 67%) 100%)',
          }}
          aria-hidden
        />
      </div>
    </div>
  );
}

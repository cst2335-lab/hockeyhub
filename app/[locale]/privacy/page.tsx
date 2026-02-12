import Link from 'next/link';

type Props = { params: Promise<{ locale: string }> };

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const withLocale = (p: string) => `/${locale}${p}`.replace(/\/{2,}/g, '/');

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString('en-CA')}</p>
      <div className="prose prose-slate max-w-none space-y-4 text-gray-700">
        <p>
          GoGoHockey (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
        </p>
        <h2 className="text-xl font-semibold mt-6">Information We Collect</h2>
        <p>
          We collect information you provide directly, such as when you register, book a rink, or post a game.
          This may include your name, email address, phone number, and other profile details.
        </p>
        <h2 className="text-xl font-semibold mt-6">How We Use Your Information</h2>
        <p>
          We use your information to provide and improve our services, process bookings, send notifications,
          and communicate with you about the Ottawa youth hockey community.
        </p>
        <h2 className="text-xl font-semibold mt-6">Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please visit our Contact page.
        </p>
      </div>
      <Link href={withLocale('/')} className="inline-block mt-8 text-gogo-primary hover:text-gogo-dark">
        Back to Home
      </Link>
    </div>
  );
}

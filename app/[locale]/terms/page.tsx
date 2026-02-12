import Link from 'next/link';

type Props = { params: Promise<{ locale: string }> };

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  const withLocale = (p: string) => `/${locale}${p}`.replace(/\/{2,}/g, '/');

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString('en-CA')}</p>
      <div className="prose prose-slate max-w-none space-y-4 text-gray-700">
        <p>
          Welcome to GoGoHockey. By using our platform, you agree to these Terms of Service.
        </p>
        <h2 className="text-xl font-semibold mt-6">Use of Service</h2>
        <p>
          You agree to use GoGoHockey only for lawful purposes related to connecting Ottawa&apos;s youth
          hockey community. You are responsible for the accuracy of information you provide.
        </p>
        <h2 className="text-xl font-semibold mt-6">Bookings and Payments</h2>
        <p>
          Bookings made through our platform are subject to the policies of the respective ice rinks.
          Platform fees may apply as disclosed at the time of booking.
        </p>
        <h2 className="text-xl font-semibold mt-6">Contact</h2>
        <p>
          For questions about these Terms, please visit our Contact page.
        </p>
      </div>
      <Link href={withLocale('/')} className="inline-block mt-8 text-gogo-primary hover:text-gogo-dark">
        Back to Home
      </Link>
    </div>
  );
}

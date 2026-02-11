import Link from 'next/link';

type Props = { params: Promise<{ locale: string }> };

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const withLocale = (p: string) => `/${locale}${p}`.replace(/\/{2,}/g, '/');

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <div className="prose prose-slate max-w-none space-y-4 text-gray-700">
        <p>
          Have questions or feedback about GoGoHockey? We&apos;d love to hear from you.
        </p>
        <div className="bg-slate-50 rounded-lg p-6 mt-6">
          <p className="font-medium text-slate-900 mb-2">Email</p>
          <a href="mailto:contact@gogohockey.ca" className="text-blue-600 hover:text-blue-800">
            contact@gogohockey.ca
          </a>
          <p className="font-medium text-slate-900 mt-4 mb-2">Location</p>
          <p>Ottawa, Ontario, Canada</p>
        </div>
      </div>
      <Link href={withLocale('/')} className="inline-block mt-8 text-blue-600 hover:text-blue-800">
        ← Back to Home
      </Link>
    </div>
  );
}

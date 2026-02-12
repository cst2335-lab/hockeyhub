import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://gogohockey.ca');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/check-database', '/test-connection', '/test-notifications'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

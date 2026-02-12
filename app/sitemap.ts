import { MetadataRoute } from 'next';
import { locales } from '@/i18n';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://gogohockey.ca');

/** 静态路径（不含动态参数），各 locale 各一份 */
const staticPaths = ['', '/games', '/rinks', '/clubs', '/dashboard', '/privacy', '/terms', '/contact', '/login', '/register'];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of staticPaths) {
      const url = path ? `/${locale}${path}` : `/${locale}`;
      entries.push({
        url: `${baseUrl}${url}`,
        lastModified: new Date(),
        changeFrequency: path === '' ? 'daily' : 'weekly',
        priority: path === '' ? 1 : 0.8,
      });
    }
  }

  return entries;
}

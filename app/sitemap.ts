import { MetadataRoute } from 'next';
import { locales } from '@/i18n';
import { createServiceClient } from '@/lib/supabase/service';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://gogohockey.ca');

/** 静态路径（不含动态参数），各 locale 各一份 */
const staticPaths = ['', '/games', '/rinks', '/clubs', '/dashboard', '/privacy', '/terms', '/contact', '/login', '/register'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // 动态：公开比赛详情页（需 SUPABASE_SERVICE_KEY）
  if (process.env.SUPABASE_SERVICE_KEY) {
    try {
      const supabase = createServiceClient();
      const [{ data: games }, { data: rinks }] = await Promise.all([
        supabase
          .from('game_invitations')
          .select('id, updated_at')
          .limit(500),
        supabase
          .from('rinks')
          .select('id, updated_at')
          .limit(500),
      ]);
      const gameList = games ?? [];
      const rinkList = rinks ?? [];
      for (const locale of locales) {
        for (const g of gameList) {
          const lastMod = g.updated_at ? new Date(g.updated_at as string) : new Date();
          entries.push({
            url: `${baseUrl}/${locale}/games/${g.id}`,
            lastModified: lastMod,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
          });
        }

        for (const rink of rinkList) {
          const lastMod = rink.updated_at ? new Date(rink.updated_at as string) : new Date();
          entries.push({
            url: `${baseUrl}/${locale}/book/${rink.id}`,
            lastModified: lastMod,
            changeFrequency: 'weekly' as const,
            priority: 0.5,
          });
        }
      }
    } catch (e) {
      console.warn('Sitemap: could not fetch games', e);
    }
  }

  return entries;
}

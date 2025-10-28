// next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ 已加
  },
};

export default withNextIntl(nextConfig);
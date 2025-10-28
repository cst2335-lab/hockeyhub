// next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig = {
  eslint: {
<<<<<<< HEAD
    ignoreDuringBuilds: true, // 👈 加这两行
=======
    ignoreDuringBuilds: true, // ✅ 已加
>>>>>>> chore/i18n-copy-dashboard
  },
};

export default withNextIntl(nextConfig);
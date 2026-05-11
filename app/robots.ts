import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://abhyascore.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',    // Keep logged-in user area private
        '/admin/',        // Keep admin area entirely private
        '/api/',          // Prevent crawling API routes directly
        '/test-console/', // Protect live test environments
        '/test-results/', // Protect user test results
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

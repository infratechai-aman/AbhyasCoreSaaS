import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://abhyascore.com';

  // Core static marketing and informational pages (only pages that EXIST)
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/faq',
    '/login',
    '/register',
    '/forgot-password',
    '/privacy-policy',
    '/terms-and-conditions',
    '/refund-and-cancellation',
    '/help-center',
    '/blog',
    '/careers',
    '/press-kit',
    '/system-status',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Future integration: Fetch dynamic blog posts here and map them
  // const blogRoutes = await fetchBlogPosts().then(posts => posts.map(...));

  return [...staticRoutes];
}

import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://abhyascore.com';

  // Core static marketing and informational pages
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/faq',
    '/pricing', // Assuming there will be a pricing page
    '/login',
    '/register',
    '/privacy-policy',
    '/terms-and-conditions',
    '/refund-and-cancellation',
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

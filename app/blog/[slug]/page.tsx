import { Metadata } from 'next';
import { generateSeoMetadata, generateArticleSchema, generateBreadcrumbSchema } from '@/lib/seo-utils';

interface BlogPostProps {
  params: { slug: string };
}

// 1. Dynamic Metadata Generation
export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  // In a real scenario, you would fetch the post from your CMS or database
  // const post = await getPostBySlug(params.slug);
  
  const fakePost = {
    title: `Ultimate Guide to ${params.slug.replace(/-/g, ' ')}`,
    description: `Learn everything you need to know about ${params.slug} for your JEE and NEET preparation.`,
    image: '/og-image.jpg',
  };

  return generateSeoMetadata({
    title: fakePost.title,
    description: fakePost.description,
    url: `/blog/${params.slug}`,
    image: fakePost.image,
  });
}

export default function BlogPostPage({ params }: BlogPostProps) {
  // Mock data
  const post = {
    title: `Ultimate Guide to ${params.slug.replace(/-/g, ' ')}`,
    description: `Learn everything you need to know about ${params.slug} for your JEE and NEET preparation.`,
    url: `/blog/${params.slug}`,
    datePublished: new Date().toISOString(),
  };

  // 2. Structured Data (JSON-LD) for the Article
  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.description,
    url: post.url,
    datePublished: post.datePublished,
  });

  // 3. Breadcrumb Schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Blog', item: '/blog' },
    { name: post.title, item: post.url },
  ]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-24 px-6 max-w-4xl mx-auto">
      {/* Injecting JSON-LD Schemas */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <h1 className="text-4xl font-bold capitalize mb-6">{post.title}</h1>
      <p className="text-lg text-slate-600">{post.description}</p>
      
      <div className="mt-12 p-8 bg-indigo-50 rounded-2xl border border-indigo-100">
        <h2 className="text-xl font-semibold text-indigo-900 mb-2">Future CMS Integration</h2>
        <p className="text-indigo-800">
          This is a placeholder architecture for the future blog. The SEO metadata and JSON-LD schema are automatically generated perfectly based on the slug.
        </p>
      </div>
    </main>
  );
}

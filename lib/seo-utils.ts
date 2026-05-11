import { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://abhyascore.com';

type SeoProps = {
  title: string;
  description: string;
  url?: string;
  image?: string;
  noIndex?: boolean;
};

/**
 * Automatically generates consistent, highly-optimized SEO metadata for any page.
 * Supports dynamic canonical URLs, OpenGraph, Twitter Cards, and indexing directives.
 */
export function generateSeoMetadata({
  title,
  description,
  url,
  image = '/og-image.jpg',
  noIndex = false,
}: SeoProps): Metadata {
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const fullTitle = `${title} | AbhyasCore`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: fullUrl,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: 'AbhyasCore',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@abhyascore', // Replace with actual Twitter handle if available
    },
  };
}

/**
 * Helper to generate JSON-LD Breadcrumb Schema for deeper pages.
 */
export function generateBreadcrumbSchema(crumbs: { name: string; item: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${BASE_URL}${crumb.item}`,
    })),
  };
}

/**
 * Helper to generate JSON-LD Article Schema for the future blog.
 */
export function generateArticleSchema({
  title,
  description,
  url,
  datePublished,
  authorName = 'AbhyasCore Team',
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  authorName?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: `${BASE_URL}/og-image.jpg`,
    datePublished: datePublished,
    author: {
      '@type': 'Organization',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'AbhyasCore',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/favicon_white.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}${url}`,
    },
  };
}

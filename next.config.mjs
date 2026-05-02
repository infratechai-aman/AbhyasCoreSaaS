/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  },
  experimental: {
    // Bundle raw_questions XML files into Vercel serverless functions
    outputFileTracingIncludes: {
      "/api/exam/custom": ["./raw_questions/**/*.xml"],
      "/api/exam/daily-target": ["./raw_questions/**/*.xml"],
      "/api/exam/\\[chapterId\\]": ["./raw_questions/**/*.xml"],
    }
  }
};

export default nextConfig;


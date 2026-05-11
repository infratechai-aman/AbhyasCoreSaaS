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
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self' https:",
              "script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com https://www.gstatic.com https://www.googletagmanager.com https://checkout.razorpay.com https://cdn.razorpay.com https://*.googleapis.com",
              "script-src-elem 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com https://www.gstatic.com https://www.googletagmanager.com https://checkout.razorpay.com https://cdn.razorpay.com https://*.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://accounts.google.com https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://accounts.google.com https://*.googleapis.com https://securetoken.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://*.firebase.com wss://*.firebaseio.com https://api.razorpay.com https://lux.razorpay.com https://lumberjack.razorpay.com https://checkout.razorpay.com https://cdn.razorpay.com https://api.openai.com https://www.google-analytics.com https://www.googletagmanager.com",
              "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com https://checkout.razorpay.com https://api.razorpay.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
  async headers() {
    return [
      {
        // SECURITY (VULN-17): CORS protection for API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://abhyascore.com" }, // Restrict in production
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
  // SECURITY (VULN-23): Enforce global server body size limits
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;

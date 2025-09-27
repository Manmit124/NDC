export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ndc-beta.vercel.app'
  
  return new Response(`User-agent: *
Allow: /
Allow: /blog
Allow: /blog/*
Allow: /profile/*
Allow: /profiles
Allow: /qa
Allow: /resources
Allow: /chat

Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /auth/
Disallow: /dashboard/
Disallow: /profile/*/edit
Disallow: /profile/*/blogs/create
Disallow: /profile/*/blogs/*/edit

Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/blog/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1`, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}

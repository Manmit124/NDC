import { createStaticClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = createStaticClient()
  
  // Get all published blogs
  const { data: blogs } = await supabase
    .from('blogs')
    .select('slug, updated_at, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ndc-beta.vercel.app'

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Blog listing page -->
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  ${blogs?.map(blog => `
  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${blog.updated_at}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('') || ''}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
    },
  })
}

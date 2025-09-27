import { createClient, createStaticClient } from '@/utils/supabase/server'
import { BlogWithAuthor } from '@/types/database'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface BlogPageProps {
  params: {
    slug: string
  }
}

// Static generation - get all blog slugs at build time
export async function generateStaticParams() {
  const supabase = createStaticClient()
  
  const { data: blogs } = await supabase
    .from('blogs')
    .select('slug')
    .eq('published', true)

  return blogs?.map((blog) => ({
    slug: blog.slug,
  })) || []
}

// Get blog data for metadata and page
async function getBlogBySlug(slug: string): Promise<BlogWithAuthor | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('blogs')
    .select(`
      *,
      author:profiles!blogs_author_id_fkey(
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error) {
    console.error('Error fetching blog:', error)
    return null
  }

  return data
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)

  if (!blog) {
    return {
      title: 'Blog Post Not Found | NDC Nagpur',
      description: 'The requested blog post could not be found.',
    }
  }

  const title = blog.meta_title || blog.title
  const description = blog.meta_description || blog.excerpt || `Read "${blog.title}" by ${blog.author.full_name} on NDC Nagpur Developer Blog`

  return {
    title: `${title} | NDC Nagpur`,
    description,
    keywords: blog.tags?.join(', ') || 'programming, web development, tutorial',
    authors: [{ name: blog.author.full_name }],
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/blog/${blog.slug}`,
      images: blog.featured_image_url ? [
        {
          url: blog.featured_image_url,
          width: 1200,
          height: 630,
          alt: blog.title,
        }
      ] : [],
      authors: [blog.author.full_name],
      publishedTime: blog.published_at || blog.created_at,
      tags: blog.tags || [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: blog.featured_image_url ? [blog.featured_image_url] : [],
      creator: `@${blog.author.username}`,
    },
  }
}

// Format markdown content to HTML (simple implementation)
function formatContent(content: string): string {
  return content
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-10 mb-6 text-gray-900 dark:text-white">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-12 mb-8 text-gray-900 dark:text-white">$1</h1>')
    
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-6"><code class="language-$1">$2</code></pre>')
    
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">$1</code>')
    
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    
    // Italic
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Paragraphs
    .split('\n\n')
    .map(paragraph => {
      if (paragraph.trim() === '') return ''
      if (paragraph.startsWith('<h') || paragraph.startsWith('<pre') || paragraph.startsWith('<ul') || paragraph.startsWith('<ol')) {
        return paragraph
      }
      return `<p class="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">${paragraph}</p>`
    })
    .join('\n')
}

function BlogContent({ blog }: { blog: BlogWithAuthor }) {
  const formattedContent = formatContent(blog.content)

  return (
    <article className="max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-12 text-center">
        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {blog.tags.map((tag) => (
              <span 
                key={tag}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          {blog.title}
        </h1>

        {/* Excerpt */}
        {blog.excerpt && (
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            {blog.excerpt}
          </p>
        )}

        {/* Author & Meta */}
        <div className="flex items-center justify-center space-x-6 text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-3">
            {blog.author.avatar_url ? (
              <Image 
                src={blog.author.avatar_url} 
                alt={blog.author.full_name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                {blog.author.full_name.charAt(0)}
              </div>
            )}
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">
                {blog.author.full_name}
              </p>
              <Link 
                href={`/profile/${blog.author.username}`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                @{blog.author.username}
              </Link>
            </div>
          </div>
          
          <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
          
          <div className="text-sm">
            <p>{blog.read_time_minutes} min read</p>
            <p>
              {blog.published_at 
                ? formatDistanceToNow(new Date(blog.published_at), { addSuffix: true })
                : formatDistanceToNow(new Date(blog.created_at), { addSuffix: true })
              }
            </p>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {blog.featured_image_url && (
        <div className="mb-12 rounded-2xl overflow-hidden">
          <Image 
            src={blog.featured_image_url} 
            alt={blog.title}
            width={800}
            height={400}
            className="w-full h-64 md:h-96 object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div 
        className="prose prose-lg max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300"
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Enjoyed this article?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Join Nagpur&apos;s developer community and discover more great content
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-600"
            >
              📚 More Articles
            </Link>
            <Link 
              href={`/profile/${blog.author.username}`}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              👤 View Author Profile
            </Link>
          </div>
        </div>
      </footer>
    </article>
  )
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)

  if (!blog) {
    notFound()
  }

  // Add structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.excerpt || blog.title,
    "image": blog.featured_image_url || "",
    "author": {
      "@type": "Person",
      "name": blog.author.full_name,
      "url": `/profile/${blog.author.username}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "Nagpur Developer Club",
      "logo": {
        "@type": "ImageObject",
        "url": "/logo.png"
      }
    },
    "datePublished": blog.published_at || blog.created_at,
    "dateModified": blog.updated_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `/blog/${blog.slug}`
    },
    "keywords": blog.tags?.join(", ") || ""
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BlogContent blog={blog} />
    </>
  )
}

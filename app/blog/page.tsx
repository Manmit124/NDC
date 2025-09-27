import { createStaticClient } from '@/utils/supabase/server'
import { BlogWithAuthor } from '@/types/database'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Developer Blog | NDC Nagpur - Latest Programming Articles',
  description: 'Discover the latest programming tutorials, web development tips, and tech insights from Nagpur\'s developer community. Learn from local experts and grow your skills.',
  keywords: 'developer blog, programming tutorials, web development, Nagpur developers, tech articles, coding tips, software development',
  openGraph: {
    title: 'Developer Blog | NDC Nagpur',
    description: 'Latest programming articles and tutorials from Nagpur\'s developer community',
    type: 'website',
    url: '/blog',
  },
}

// Static generation - fetch blogs at build time
async function getPublishedBlogs(): Promise<BlogWithAuthor[]> {
  const supabase = createStaticClient()
  
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
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching blogs:', error)
    return []
  }

  return data || []
}

function BlogCard({ blog }: { blog: BlogWithAuthor }) {
  return (
    <article className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
      {/* Featured Image */}
      {blog.featured_image_url && (
        <div className="mb-4 rounded-xl overflow-hidden">
          <Image 
            src={blog.featured_image_url} 
            alt={blog.title}
            width={400}
            height={192}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Blog Content */}
      <div className="space-y-4">
        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {blog.tags.slice(0, 3).map((tag) => (
              <span 
                key={tag}
                className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <Link href={`/blog/${blog.slug}`}>
          <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {blog.title}
          </h2>
        </Link>

        {/* Excerpt */}
        {blog.excerpt && (
          <p className="text-muted-foreground line-clamp-3 leading-relaxed">
            {blog.excerpt}
          </p>
        )}

        {/* Author & Meta */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                {blog.author.avatar_url ? (
                  <Image 
                    src={blog.author.avatar_url} 
                    alt={blog.author.full_name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-primary font-bold text-sm">
                    {blog.author.full_name.charAt(0)}
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {blog.author.full_name}
              </p>
              <p className="text-xs text-muted-foreground">
                @{blog.author.username}
              </p>
            </div>
          </div>

          <div className="text-right text-sm text-muted-foreground">
            <p className="flex items-center gap-1">
              <span>⏱️</span>
              {blog.read_time_minutes} min read
            </p>
            <p className="flex items-center gap-1">
              <span>📅</span>
              {blog.published_at 
                ? formatDistanceToNow(new Date(blog.published_at), { addSuffix: true })
                : formatDistanceToNow(new Date(blog.created_at), { addSuffix: true })
              }
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
          <span className="text-4xl">📝</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-3xl animate-pulse"></div>
      </div>
      
      <div className="space-y-4 max-w-lg mx-auto">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          No Blog Posts Yet
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Be the first to share your knowledge with the Nagpur developer community! 
          Create your profile and start writing.
        </p>
        
        <div className="pt-6">
          <Link 
            href="/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
          >
            <span className="text-xl">🚀</span>
            Join NDC & Start Writing
          </Link>
        </div>
      </div>
    </div>
  )
}

export default async function BlogListingPage() {
  const blogs = await getPublishedBlogs()

  return (
    <div className="space-y-8">
      {/* Header - Matching NDC Theme */}
      <div className="mb-8">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">📝</span>
            </div>
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Developer Blog
              </h1>
              <p className="text-lg text-muted-foreground">
                Knowledge sharing community
              </p>
            </div>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover programming tutorials, web development tips, and tech insights 
            from Nagpur&apos;s vibrant developer community
          </p>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>{blogs.length} articles published</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">✨</span>
              <span>Community driven</span>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      {blogs.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Call to Action - Matching NDC Theme */}
      {blogs.length > 0 && (
        <div className="text-center py-16 bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl">
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-2xl">✍️</span>
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Want to Share Your Knowledge?
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Join our community and start writing about your developer journey. 
              Help others learn and grow with your experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/signup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span className="text-xl">🚀</span>
                Start Writing Today
              </Link>
              <Link 
                href="/login"
                className="inline-flex items-center gap-2 bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground px-8 py-4 rounded-xl font-medium transition-all duration-300"
              >
                <span className="text-lg">👋</span>
                Already a member? Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

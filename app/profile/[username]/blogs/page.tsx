"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { useProfile } from "@/hooks/api/useProfile";
import { useBlogsByAuthor, useDeleteBlog } from "@/hooks/api/useBlogs";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Blog } from "@/types/database";
import { useState } from "react";
import { toast } from "sonner";

function BlogAdminCard({ blog, username }: { blog: Blog; username: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteBlog = useDeleteBlog();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this blog? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteBlog.mutateAsync(blog.id);
      toast.success("Blog deleted successfully");
    } catch (error) {
      toast.error("Failed to delete blog");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Title */}
          <h3 className="text-xl font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {blog.title}
          </h3>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
              {blog.excerpt}
            </p>
          )}

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.slice(0, 3).map((tag) => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
                >
                  {tag}
                </span>
              ))}
              {blog.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">+{blog.tags.length - 3} more</span>
              )}
            </div>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              blog.published 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
            }`}>
              {blog.published ? '✅ Published' : '📝 Draft'}
            </span>
            <span className="flex items-center gap-1">
              <span>📅</span>
              {formatDistanceToNow(new Date(blog.created_at), { addSuffix: true })}
            </span>
            <span className="flex items-center gap-1">
              <span>⏱️</span>
              {blog.read_time_minutes} min read
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 ml-4">
          {blog.published && (
            <Link 
              href={`/blog/${blog.slug}`}
              className="px-4 py-2 text-primary hover:bg-primary/10 rounded-lg text-sm font-medium transition-colors text-center"
              target="_blank"
            >
              👁️ View
            </Link>
          )}
          <Link 
            href={`/profile/${username}/blogs/${blog.id}/edit`}
            className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg text-sm font-medium transition-colors text-center"
          >
            ✏️ Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-red-600 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isDeleting ? "..." : "🗑️ Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ username }: { username: string }) {
  return (
    <div className="text-center py-20 bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl">
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
          Start sharing your knowledge with the developer community! 
          Write your first blog post and help others learn.
        </p>
        
        <div className="pt-6">
          <Link 
            href={`/profile/${username}/blogs/create`}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
          >
            <span className="text-xl">✍️</span>
            Write Your First Blog
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UserBlogsPage() {
  const params = useParams();
  const username = params.username as string;
  
  const { user } = useAuth();
  const { data: profile } = useProfile(username);
  const { data: blogs, isLoading, error } = useBlogsByAuthor(profile?.id || "", true);

  // Check if this is the user's own blog admin
  const isOwnProfile = user?.id === profile?.id;

  // Redirect if not own profile (this should be handled by middleware/layout)
  if (profile && !isOwnProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">
            You can only manage your own blogs.
          </p>
          <Link
            href={`/profile/${username}`}
            className="inline-block bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            View Profile
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your blogs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Error Loading Blogs</h1>
          <p className="text-gray-600 dark:text-gray-400">
            There was an error loading your blogs. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header - Matching NDC Theme */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-3">
              <Link 
                href={`/profile/${username}`}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm inline-block"
              >
                ← Back to Profile
              </Link>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    My Blogs
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Manage your blog posts and share your knowledge with the community
                  </p>
                </div>
              </div>
            </div>
            
            <Link 
              href={`/profile/${username}/blogs/create`}
              className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              ✍️ Write New Blog
            </Link>
          </div>

          {/* Stats */}
          {blogs && blogs.length > 0 && (
            <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl p-4">
              <div className="flex gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="text-primary">📝</span>
                  <span>{blogs.length} total posts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>{blogs.filter(b => b.published).length} published</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">📋</span>
                  <span>{blogs.filter(b => !b.published).length} drafts</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Blog List */}
        {blogs && blogs.length > 0 ? (
          <div className="space-y-6">
            {blogs.map((blog) => (
              <BlogAdminCard key={blog.id} blog={blog} username={username} />
            ))}
          </div>
        ) : (
          <EmptyState username={username} />
        )}

        {/* Tips - Matching NDC Theme */}
        {blogs && blogs.length > 0 && (
          <div className="mt-12 bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                <span className="text-lg">💡</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Blog Tips
              </h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="text-primary text-lg">🎯</span>
                  <div>
                    <strong className="text-foreground">SEO Optimization:</strong> Use descriptive titles and add relevant tags to improve discoverability.
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="text-primary text-lg">💻</span>
                  <div>
                    <strong className="text-foreground">Code Blocks:</strong> Use ```language syntax for code examples in your markdown content.
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="text-primary text-lg">🖼️</span>
                  <div>
                    <strong className="text-foreground">Featured Images:</strong> Add compelling images to make your posts more engaging.
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="text-primary text-lg">📝</span>
                  <div>
                    <strong className="text-foreground">Excerpts:</strong> Write clear excerpts to help readers understand what your post is about.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

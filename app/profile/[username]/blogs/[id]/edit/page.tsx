"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { useProfile } from "@/hooks/api/useProfile";
import { useBlogById, useUpdateBlog } from "@/hooks/api/useBlogs";
import Link from "next/link";
import { toast } from "sonner";

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const blogId = params.id as string;
  
  const { user } = useAuth();
  const { data: profile } = useProfile(username);
  const { data: blog, isLoading, error } = useBlogById(blogId);
  const updateBlog = useUpdateBlog();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    featured_image_url: "",
    meta_title: "",
    meta_description: "",
    tags: "",
    published: false,
  });

  const [isPreview, setIsPreview] = useState(false);

  // Check if this is the user's own profile and blog
  const isOwnProfile = user?.id === profile?.id;
  const isOwnBlog = blog?.author_id === user?.id;

  // Populate form when blog data loads
  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title,
        excerpt: blog.excerpt || "",
        content: blog.content,
        featured_image_url: blog.featured_image_url || "",
        meta_title: blog.meta_title || "",
        meta_description: blog.meta_description || "",
        tags: blog.tags?.join(", ") || "",
        published: blog.published,
      });
    }
  }, [blog]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">
            The blog post you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href={`/profile/${username}/blogs`}
            className="inline-block bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Back to My Blogs
          </Link>
        </div>
      </div>
    );
  }

  if (!isOwnProfile || !isOwnBlog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">
            You can only edit your own blog posts.
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Content is required");
      return;
    }

    try {
      const updates = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim() || undefined,
        content: formData.content.trim(),
        featured_image_url: formData.featured_image_url.trim() || undefined,
        meta_title: formData.meta_title.trim() || undefined,
        meta_description: formData.meta_description.trim() || undefined,
        tags: formData.tags.trim() 
          ? formData.tags.split(",").map(tag => tag.trim()).filter(Boolean)
          : [],
        published: formData.published,
      };

      await updateBlog.mutateAsync({ id: blogId, updates });
      
      toast.success("Blog updated successfully!");
      router.push(`/profile/${username}/blogs`);
    } catch (error) {
      console.error("Update blog error:", error);
      toast.error("Failed to update blog. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Simple markdown preview
  const formatPreview = (content: string) => {
    return content
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-10 mb-6">$1</h1>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .split('\n\n')
      .map(p => p.trim() ? `<p class="mb-4">${p}</p>` : '')
      .join('\n');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/profile/${username}/blogs`}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm mb-2 inline-block"
          >
            ← Back to My Blogs
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Edit Blog Post
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Update your blog post and share your latest thoughts
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Basic Information</h2>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter your blog post title..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              {/* Excerpt */}
              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excerpt (Short Description)
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  placeholder="Brief description of your blog post..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                />
              </div>

              {/* Featured Image */}
              <div>
                <label htmlFor="featured_image_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Featured Image URL
                </label>
                <input
                  type="url"
                  id="featured_image_url"
                  name="featured_image_url"
                  value={formData.featured_image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="javascript, react, tutorial, web development"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Content *</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreview(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !isPreview 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  ✏️ Write
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreview(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isPreview 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  👁️ Preview
                </button>
              </div>
            </div>

            {!isPreview ? (
              <div>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write your blog content in Markdown..."
                  rows={20}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  💡 Tip: Use Markdown syntax for formatting. Supports headings, code blocks, links, and more!
                </p>
              </div>
            ) : (
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 min-h-[500px]">
                <div 
                  className="prose prose-sm max-w-none text-gray-900 dark:text-gray-100"
                  dangerouslySetInnerHTML={{ __html: formatPreview(formData.content) }}
                />
                {!formData.content.trim() && (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    Content preview will appear here...
                  </p>
                )}
              </div>
            )}
          </div>

          {/* SEO Settings */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">SEO Settings (Optional)</h2>
            
            <div className="space-y-4">
              {/* Meta Title */}
              <div>
                <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SEO Title (max 60 characters)
                </label>
                <input
                  type="text"
                  id="meta_title"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleChange}
                  placeholder="Custom title for search engines..."
                  maxLength={60}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.meta_title.length}/60 characters
                </p>
              </div>

              {/* Meta Description */}
              <div>
                <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SEO Description (max 160 characters)
                </label>
                <textarea
                  id="meta_description"
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleChange}
                  placeholder="Description that appears in search results..."
                  maxLength={160}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.meta_description.length}/160 characters
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="published"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="published" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Published (uncheck to save as draft)
                </label>
              </div>

              <div className="flex gap-3">
                <Link
                  href={`/profile/${username}/blogs`}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </Link>
                {blog.published && (
                  <Link
                    href={`/blog/${blog.slug}`}
                    target="_blank"
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    👁️ View Live
                  </Link>
                )}
                <button
                  type="submit"
                  disabled={updateBlog.isPending}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateBlog.isPending 
                    ? "Saving..." 
                    : "💾 Update Blog"
                  }
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


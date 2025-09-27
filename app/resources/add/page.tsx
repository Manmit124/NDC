"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreateResource } from "@/hooks/api/useResources";
import { RESOURCE_CATEGORIES, ResourceCategory } from "@/types/database";
import { useAuth, useOnboardingCheck } from "@/hooks/auth/useAuth";
import Link from "next/link";

export default function AddResourcePage() {
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    category: "" as ResourceCategory | "",
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");

  const { user } = useAuth();
  const { needsOnboarding, isLoading: onboardingLoading } = useOnboardingCheck();
  const router = useRouter();
  const createResource = useCreateResource();

  // Redirect to onboarding if user needs to complete it
  useEffect(() => {
    if (!onboardingLoading && needsOnboarding) {
      router.push('/onboarding');
    }
  }, [needsOnboarding, onboardingLoading, router]);

  // Show loading while checking onboarding status
  if (onboardingLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Checking your profile...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-semibold text-foreground">Authentication Required</h1>
          <p className="text-muted-foreground">
            Please log in to add resources.
          </p>
          <Link
            href="/login"
            className="inline-block bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-medium transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!formData.url.trim()) {
      setError("URL is required");
      return;
    }
    if (!formData.category) {
      setError("Category is required");
      return;
    }

    // Validate URL format
    try {
      new URL(formData.url);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    createResource.mutate(
      {
        title: formData.title.trim(),
        url: formData.url.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category,
        tags: formData.tags,
        submitted_by: user.id
      },
      {
        onSuccess: () => {
          router.push("/resources");
        },
        onError: (err: Error) => {
          setError(err.message || "Failed to create resource");
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/resources"
              className="w-12 h-12 rounded-2xl bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <span className="text-lg">←</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Add Resource
                </h1>
                <p className="text-lg text-muted-foreground">
                  Share an amazing tool with the developer community
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Title *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
                placeholder="e.g., React Developer Tools"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                URL *
              </label>
              <input
                type="url"
                required
                className="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Category *
              </label>
              <select
                required
                className="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ResourceCategory }))}
              >
                <option value="">Select a category</option>
                {RESOURCE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all duration-200"
                placeholder="Describe what this resource is and why it's useful..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl font-medium transition-all duration-200"
                >
                  Add
                </button>
              </div>
              
              {/* Display Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-primary/70 hover:text-primary text-xs"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={createResource.isPending}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {createResource.isPending ? "Adding..." : "✨ Add Resource"}
              </button>
              <Link
                href="/resources"
                className="px-6 py-3 border border-input rounded-xl text-foreground hover:bg-muted transition-colors font-medium text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

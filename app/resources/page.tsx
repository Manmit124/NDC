"use client";

import { useState } from "react";
import { useResources } from "@/hooks/api/useResources";
import { RESOURCE_CATEGORIES } from "@/types/database";
import Link from "next/link";
import { useAuth, useOnboardingCheck } from "@/hooks/auth/useAuth";
import { ResourceCard } from "@/components/Resources";

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { user } = useAuth();
  const { needsOnboarding } = useOnboardingCheck();
  
  // Fetch resources with filters
  const { data: resources, isLoading, error } = useResources({
    category: selectedCategory,
    search: searchQuery
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading resources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl font-semibold text-foreground">Error Loading Resources</h1>
          <p className="text-muted-foreground">
            Something went wrong while loading the resources.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🛠️</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Developer Resources
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Curated collection of amazing open source tools & free resources
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span>{resources?.length || 0} resources available</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-primary">✨</span>
                  <span>Community curated</span>
                </div>
              </div>
            </div>
            
            {user && !needsOnboarding && (
              <Link
                href="/resources/add"
                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center"
              >
                ✨ Add Resource
              </Link>
            )}
            {user && needsOnboarding && (
              <Link
                href="/onboarding"
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center"
              >
                🚀 Complete Setup
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-xs">🔍</span>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Search resources, tools, libraries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-input rounded-xl bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/60"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="text-sm">✕</span>
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory("All")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    selectedCategory === "All"
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  All Categories
                </button>
                {RESOURCE_CATEGORIES.map((category) => {
                  const categoryCount = resources?.filter(r => r.category === category).length || 0;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 flex items-center gap-2 ${
                        selectedCategory === category
                          ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span>{category}</span>
                      {categoryCount > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                          selectedCategory === category
                            ? "bg-white/20 text-primary-foreground"
                            : "bg-primary/20 text-primary"
                        }`}>
                          {categoryCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedCategory !== "All") && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20 flex items-center gap-2">
                      Search: &ldquo;{searchQuery}&rdquo;
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-primary/70 hover:text-primary"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  {selectedCategory !== "All" && (
                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20 flex items-center gap-2">
                      Category: {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory("All")}
                        className="text-primary/70 hover:text-primary"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Resources Grid */}
        {resources && resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                <span className="text-4xl">
                  {searchQuery || selectedCategory !== "All" ? "🔍" : "🛠️"}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-3xl animate-pulse"></div>
            </div>
            
            <div className="space-y-4 max-w-lg mx-auto">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {searchQuery || selectedCategory !== "All" ? "No Resources Found" : "Start Building Your Toolkit"}
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {searchQuery || selectedCategory !== "All" 
                  ? "Try adjusting your search terms or explore different categories to discover amazing tools."
                  : "Be the pioneer! Share the first amazing open source tool or free resource with the community."
                }
              </p>
              
              {searchQuery || selectedCategory !== "All" ? (
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    className="px-6 py-3 bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground rounded-xl font-medium transition-all duration-300"
                  >
                    🔄 Clear Filters
                  </button>
                  {user && !needsOnboarding && (
                    <Link
                      href="/resources/add"
                      className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      ✨ Add Resource Instead
                    </Link>
                  )}
                </div>
              ) : (
                <div className="pt-6">
                  {user && !needsOnboarding && (
                    <Link
                      href="/resources/add"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
                    >
                      <span className="text-xl">🚀</span>
                      Add First Resource
                    </Link>
                  )}
                  {user && needsOnboarding && (
                    <Link
                      href="/onboarding"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
                    >
                      <span className="text-xl">⚙️</span>
                      Complete Setup First
                    </Link>
                  )}
                  {!user && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">Join the community to contribute resources</p>
                      <Link
                        href="/login"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <span className="text-lg">👋</span>
                        Sign In
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

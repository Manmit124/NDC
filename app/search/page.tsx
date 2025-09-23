"use client";

import { useState, useEffect } from "react";
import { useSearchProfiles } from "@/hooks/api/useSearch";
import { useUIStore } from "@/stores/ui";
import Link from "next/link";
import Image from "next/image";
import { Profile } from "@/types/database";

export default function SearchPage() {
  const [filteredDevelopers, setFilteredDevelopers] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  
  // Use our new hooks instead of manual state management
  const { data: developers, isLoading } = useSearchProfiles();
  const { searchQuery: globalSearchQuery, setSearchQuery: setGlobalSearchQuery } = useUIStore();

  // Initialize search query from global state if available
  useEffect(() => {
    if (globalSearchQuery && !searchQuery) {
      setSearchQuery(globalSearchQuery);
    }
  }, [globalSearchQuery, searchQuery]);

  // Get all unique skills for filter
  const allSkills = Array.from(
    new Set(
      (developers || [])
        .flatMap(dev => dev.skills || [])
        .sort()
    )
  );

  useEffect(() => {
    if (!developers) return;
    
    let filtered = developers;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(dev =>
        dev.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dev.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dev.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dev.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by selected skill
    if (selectedSkill) {
      filtered = filtered.filter(dev =>
        dev.skills?.includes(selectedSkill)
      );
    }

    setFilteredDevelopers(filtered);
  }, [searchQuery, selectedSkill, developers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-xl">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-transparent animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Finding developers...
            </p>
            <p className="text-sm text-muted-foreground">Searching through Nagpur&apos;s tech community</p>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 p-6 space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            {/* Search Badge */}
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span>🔍 Discover Talent</span>
            </div>
          </div>

        {/* Search and Filters */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Search Input */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center space-x-2">
                  <span>🔍</span>
                  <span>Search Developers</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-muted-foreground text-sm">👤</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, username, bio, or skills..."
                    className="w-full pl-12 pr-4 py-3 h-12 bg-background/50 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setGlobalSearchQuery(e.target.value); // Update global search state
                    }}
                  />
                </div>
              </div>

              {/* Skill Filter */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center space-x-2">
                  <span>⚡</span>
                  <span>Filter by Skill</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-muted-foreground text-sm">🛠️</span>
                  </div>
                  <select
                    className="w-full pl-12 pr-4 py-3 h-12 bg-background/50 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 appearance-none cursor-pointer"
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                  >
                    <option value="">All Skills</option>
                    {allSkills.map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(searchQuery || selectedSkill) && (
              <div className="pt-4 border-t border-border/50">
                <div className="flex flex-wrap gap-3">
                  {searchQuery && (
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 text-primary text-sm rounded-full border border-primary/20 backdrop-blur-sm">
                      <span className="mr-2">🔍</span>
                      <span>Search: &quot;{searchQuery}&quot;</span>
                      <button
                        onClick={() => setSearchQuery("")}
                        className="ml-3 w-5 h-5 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center text-primary hover:text-primary/80 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {selectedSkill && (
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 text-primary text-sm rounded-full border border-primary/20 backdrop-blur-sm">
                      <span className="mr-2">⚡</span>
                      <span>Skill: {selectedSkill}</span>
                      <button
                        onClick={() => setSelectedSkill("")}
                        className="ml-3 w-5 h-5 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center text-primary hover:text-primary/80 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground">
                {filteredDevelopers.length} Developer{filteredDevelopers.length !== 1 ? 's' : ''} Found
              </h2>
              <p className="text-muted-foreground">
                {searchQuery || selectedSkill ? 'Matching your search criteria' : 'Ready to connect with you'}
              </p>
            </div>
          </div>

          {filteredDevelopers.length === 0 ? (
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-12 text-center shadow-xl">
              <div className="space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-4xl">🔍</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-foreground">
                    No developers found
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Try adjusting your search criteria or filters to discover more amazing developers in our community
                  </p>
                </div>
                <div className="flex justify-center space-x-4">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="px-6 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                  {selectedSkill && (
                    <button
                      onClick={() => setSelectedSkill("")}
                      className="px-6 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDevelopers.map((developer, index) => (
                <Link
                  key={developer.username}
                  href={`/profile/${developer.username}`}
                  className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:border-primary/20"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                        {developer.avatar_url ? (
                          <Image
                            src={developer.avatar_url}
                            alt={developer.full_name}
                            width={56}
                            height={56}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-primary font-bold text-lg">
                            {developer.full_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-transparent animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {developer.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        @{developer.username}
                      </p>
                    </div>
                  </div>

                  {developer.bio && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                      {developer.bio}
                    </p>
                  )}

                  {developer.skills && developer.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {developer.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-gradient-to-r from-primary/10 to-primary/5 text-primary text-xs rounded-full font-medium border border-primary/20 group-hover:border-primary/40 transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                      {developer.skills.length > 3 && (
                        <span className="px-3 py-1 bg-muted/50 text-muted-foreground text-xs rounded-full font-medium">
                          +{developer.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Hover indicator */}
                  <div className="mt-4 pt-4 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center text-primary text-sm font-medium">
                      <span>View Profile</span>
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
  );
}

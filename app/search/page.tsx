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
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading developers...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">
            Search Developers
          </h1>
          <p className="text-muted-foreground">
            Connect with {developers?.length || 0} developers in Nagpur&apos;s tech community
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name, username, bio, or skills..."
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setGlobalSearchQuery(e.target.value); // Update global search state
                }}
              />
            </div>

            {/* Skill Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Filter by Skill
              </label>
              <select
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
              >
                <option value="">All Skills</option>
                {allSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedSkill) && (
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  Search: &quot;{searchQuery}&quot;
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-2 text-primary hover:text-primary/80"
                  >
                    ✕
                  </button>
                </span>
              )}
              {selectedSkill && (
                <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  Skill: {selectedSkill}
                  <button
                    onClick={() => setSelectedSkill("")}
                    className="ml-2 text-primary hover:text-primary/80"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              {filteredDevelopers.length} Developer{filteredDevelopers.length !== 1 ? 's' : ''}
            </h2>
          </div>

          {filteredDevelopers.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No developers found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDevelopers.map((developer) => (
                <Link
                  key={developer.username}
                  href={`/profile/${developer.username}`}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      {developer.avatar_url ? (
                        <Image
                          src={developer.avatar_url}
                          alt={developer.full_name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-primary font-semibold">
                          {developer.full_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {developer.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        @{developer.username}
                      </p>
                    </div>
                  </div>

                  {developer.bio && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {developer.bio}
                    </p>
                  )}

                  {developer.skills && developer.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {developer.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                      {developer.skills.length > 3 && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                          +{developer.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}

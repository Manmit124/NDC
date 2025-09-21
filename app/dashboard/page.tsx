"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

interface Profile {
  username: string;
  full_name: string;
  bio?: string;
  skills?: string[];
  avatar_url?: string;
}

interface DashboardStats {
  totalDevelopers: number;
  totalJobs: number;
  totalQuestions: number;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalDevelopers: 0,
    totalJobs: 0,
    totalQuestions: 0
  });
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Get user profile
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id);

          if (profiles && profiles.length > 0) {
            setProfile(profiles[0]);
          }

          // Get community stats
          const { data: allProfiles } = await supabase
            .from('profiles')
            .select('id');

          setStats({
            totalDevelopers: allProfiles?.length || 0,
            totalJobs: 12, // Placeholder - will be replaced when jobs table is created
            totalQuestions: 8 // Placeholder - will be replaced when Q&A table is created
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">
            Welcome to NDC Dashboard
          </h1>
          <p className="text-muted-foreground">
            Your gateway to Nagpur&apos;s developer community
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.totalDevelopers}</p>
                <p className="text-sm text-muted-foreground">Developers</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💼</span>
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.totalJobs}</p>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">❓</span>
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.totalQuestions}</p>
                <p className="text-sm text-muted-foreground">Q&A Posts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/jobs"
              className="flex items-center space-x-3 p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
            >
              <span className="text-2xl">💼</span>
              <div>
                <p className="font-medium text-foreground">Browse Jobs</p>
                <p className="text-sm text-muted-foreground">Find opportunities</p>
              </div>
            </Link>

            <Link
              href="/search"
              className="flex items-center space-x-3 p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
            >
              <span className="text-2xl">🔍</span>
              <div>
                <p className="font-medium text-foreground">Search Developers</p>
                <p className="text-sm text-muted-foreground">Connect with peers</p>
              </div>
            </Link>

            <Link
              href="/qa"
              className="flex items-center space-x-3 p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
            >
              <span className="text-2xl">❓</span>
              <div>
                <p className="font-medium text-foreground">Ask Question</p>
                <p className="text-sm text-muted-foreground">Get help</p>
              </div>
            </Link>

            <Link
              href="/chat"
              className="flex items-center space-x-3 p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
            >
              <span className="text-2xl">💬</span>
              <div>
                <p className="font-medium text-foreground">Join Chat</p>
                <p className="text-sm text-muted-foreground">Community discussion</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Profile Completion */}
        {profile && (!profile.bio || !profile.skills || profile.skills.length === 0) && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">✨</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Complete Your Profile
                </h3>
                <p className="text-muted-foreground mb-4">
                  Add your bio and skills to help other developers connect with you and discover opportunities.
                </p>
                <Link
                  href={`/profile/${profile.username}`}
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Complete Profile
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity Placeholder */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm">👋</span>
              </div>
              <div>
                <p className="text-sm text-foreground">Welcome to NDC!</p>
                <p className="text-xs text-muted-foreground">Start by exploring the community</p>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}

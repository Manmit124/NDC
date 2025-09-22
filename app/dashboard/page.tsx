"use client";

import { useAuth } from "@/hooks/auth/useAuth";
import { useDashboardStats } from "@/hooks/api/useDashboard";
import Link from "next/link";

export default function DashboardPage() {
  // Use our new hooks instead of manual state management
  const { profile } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

  // Combined loading state
  const loading = isLoading;

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
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats?.totalDevelopers || 0}</p>
                <p className="text-sm text-muted-foreground">Developers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {profile?.username && (
              <Link
                href={`/profile/${profile.username}`}
                className="flex items-center space-x-3 p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
              >
                <span className="text-2xl">👤</span>
                <div>
                  <p className="font-medium text-foreground">View Profile</p>
                  <p className="text-sm text-muted-foreground">Manage your profile</p>
                </div>
              </Link>
            )}
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

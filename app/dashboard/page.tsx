"use client";

import { useAuth, useOnboardingCheck } from "@/hooks/auth/useAuth";
import { useDashboardStats } from "@/hooks/api/useDashboard";
import Link from "next/link";

export default function DashboardPage() {
  // Use our new hooks instead of manual state management
  const { profile } = useAuth();
  const { needsOnboarding, user } = useOnboardingCheck();
  const { data: stats, isLoading } = useDashboardStats();

  // Combined loading state
  const loading = isLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-xl">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-transparent animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Loading your dashboard...
            </p>
            <p className="text-sm text-muted-foreground">Preparing your developer community experience</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Background Effects - Reduced */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 p-6 space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span>🚀 Welcome to NDC</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Your Developer
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Connect, learn, and grow with Nagpur&apos;s vibrant developer community
            </p>
          </div>
        </div>

        {/* Onboarding Completion - Beautiful but lighter */}
        {user && needsOnboarding && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-orange-500/10 via-orange-400/5 to-transparent border border-orange-500/20 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🚀</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-foreground">
                      Complete Your Setup
                    </h3>
                    <div className="px-2 py-1 bg-orange-500/20 text-orange-600 text-xs rounded-full font-medium">
                      Required
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    Welcome to NDC! Complete your profile setup to unlock all features and connect with the community.
                  </p>
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <span>⚡</span>
                    Complete Setup Now
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Features Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Explore NDC Features</h2>
            <p className="text-muted-foreground">Everything you need to connect and grow as a developer</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Search Developers */}
            <Link
              href="/search"
              className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:border-primary/20"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🔍</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    Search Developers
                  </h3>
                  <p className="text-muted-foreground mt-2 leading-relaxed">
                    Find and connect with talented developers in Nagpur. Filter by skills and expertise.
                  </p>
                </div>
                <div className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Explore developers</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Q&A Community */}
            <Link
              href="/qa"
              className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:border-primary/20"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">❓</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    Q&A Community
                  </h3>
                  <p className="text-muted-foreground mt-2 leading-relaxed">
                    Ask questions, share knowledge, and help fellow developers solve coding challenges.
                  </p>
                </div>
                <div className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Browse questions</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Resources */}
            <Link
              href="/resources"
              className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:border-primary/20"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🛠️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    Developer Resources
                  </h3>
                  <p className="text-muted-foreground mt-2 leading-relaxed">
                    Discover curated tools, libraries, and resources shared by the community.
                  </p>
                </div>
                <div className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Discover tools</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Anonymous Chat */}
            <Link
              href="/chat"
              className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:border-primary/20"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">💬</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    Anonymous Chat
                  </h3>
                  <p className="text-muted-foreground mt-2 leading-relaxed">
                    Join real-time discussions with the community. Chat anonymously or with your identity.
                  </p>
                </div>
                <div className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Join chat</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Profile */}
            {profile?.username && (
              <Link
                href={`/profile/${profile.username}`}
                className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:border-primary/20"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">👤</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      Your Profile
                    </h3>
                    <p className="text-muted-foreground mt-2 leading-relaxed">
                      Manage your developer profile, showcase skills, and connect with others.
                    </p>
                  </div>
                  <div className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>View profile</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Link>
            )}

            {/* Blog */}
            <Link
              href="/blog"
              className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:border-primary/20"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-pink-600/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">📝</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    Developer Blog
                  </h3>
                  <p className="text-muted-foreground mt-2 leading-relaxed">
                    Read and write technical articles, tutorials, and insights from the community.
                  </p>
                </div>
                <div className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Read articles</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Profile Completion */}
        {profile && (!profile.bio || !profile.skills || profile.skills.length === 0) && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">✨</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    Complete Your Profile
                  </h3>
                  <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                    Add your bio and skills to help other developers connect with you and discover opportunities in Nagpur&apos;s tech community.
                  </p>
                  <Link
                    href={`/profile/${profile.username}`}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <span>🚀</span>
                    Complete Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

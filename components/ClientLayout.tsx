"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { useUIStore } from "@/stores/ui";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  // Use our new hooks instead of manual state management
  const { user, profile, isLoading, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  
  const router = useRouter();
  const pathname = usePathname();

  // Check if current route should show dashboard layout
  const isDashboardRoute = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/jobs') || 
                          pathname.startsWith('/search') || 
                          pathname.startsWith('/qa') || 
                          pathname.startsWith('/chat') || 
                          pathname.startsWith('/resources') || 
                          pathname.startsWith('/profile/');

  // Navigation items
  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: "🏠",
      current: pathname === "/dashboard"
    },
    {
      name: "Jobs",
      href: "/jobs",
      icon: "💼",
      current: pathname.startsWith("/jobs")
    },
    {
      name: "Search",
      href: "/search",
      icon: "🔍",
      current: pathname.startsWith("/search")
    },
    {
      name: "Q&A",
      href: "/qa",
      icon: "❓",
      current: pathname.startsWith("/qa")
    },
    {
      name: "Resources",
      href: "/resources",
      icon: "🛠️",
      current: pathname.startsWith("/resources")
    },
    {
      name: "Chat",
      href: "/chat",
      icon: "💬",
      current: pathname.startsWith("/chat")
    }
  ];

  // Redirect to login if not authenticated and on dashboard route
  useEffect(() => {
    if (!isLoading && !user && isDashboardRoute) {
      router.push('/login');
    }
  }, [user, isLoading, isDashboardRoute, router]);

  const handleSignOut = () => {
    logout(); // Uses our auth hook's logout function
  };

  // Show loading state
  if (isLoading && isDashboardRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-xl">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-transparent animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Loading your workspace...
            </p>
            <p className="text-sm text-muted-foreground">Please wait while we prepare everything</p>
          </div>
        </div>
      </div>
    );
  }

  // If not a dashboard route or no user, show content without sidebar
  if (!isDashboardRoute || !user) {
    return <>{children}</>;
  }

  // Dashboard layout with sidebar
  return (
    <div className="h-screen bg-gradient-to-br from-background via-background to-primary/5 flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      )}

      {/* Sidebar - Fixed position */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card/80 backdrop-blur-xl border-r border-border/50 shadow-2xl transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border/50">
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <span className="text-primary-foreground font-bold text-sm">NDC</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-xl animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-foreground text-sm leading-tight">Nagpur Dev Club</span>
                <span className="text-xs text-muted-foreground">Developer Community</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden w-8 h-8 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                  item.current
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg transform scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:transform hover:scale-[1.01]'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.current && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent animate-pulse" />
                )}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  item.current 
                    ? 'bg-white/20 shadow-sm' 
                    : 'bg-muted/30 group-hover:bg-muted/50'
                }`}>
                  <span className="text-lg">{item.icon}</span>
                </div>
                <span className="relative z-10">{item.name}</span>
                {item.current && (
                  <div className="absolute right-2 w-2 h-2 bg-white/50 rounded-full animate-pulse" />
                )}
              </Link>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="border-t border-border/50 p-4 bg-gradient-to-r from-muted/20 to-transparent">
            <div className="flex items-center space-x-3 mb-4 p-3 bg-card/50 rounded-xl border border-border/30 backdrop-blur-sm">
              <div className="relative group">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-primary font-bold text-lg">
                      {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-transparent animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {profile?.full_name || user?.email?.split('@')[0] || 'Developer'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  @{profile?.username || user?.email?.split('@')[0] || 'user'}
                </p>
              </div>
            </div>
            
            <div className="space-y-1">
              {profile?.username ? (
                <Link
                  href={`/profile/${profile.username}`}
                  className="group flex items-center space-x-3 w-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200 transform hover:scale-[1.01]"
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <span className="text-xs">👤</span>
                  </div>
                  <span>View Profile</span>
                </Link>
              ) : (
                <Link
                  href="/onboarding"
                  className="group flex items-center space-x-3 w-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200 transform hover:scale-[1.01]"
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="w-6 h-6 rounded-md bg-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                    <span className="text-xs">⚙️</span>
                  </div>
                  <span>Complete Setup</span>
                </Link>
              )}
              <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-md bg-purple-500/20 flex items-center justify-center">
                    <span className="text-xs">🎨</span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Theme</span>
                </div>
                <ThemeToggle />
              </div>
              <button
                onClick={handleSignOut}
                className="group flex items-center space-x-3 w-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200 transform hover:scale-[1.01]"
              >
                <div className="w-6 h-6 rounded-md bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                  <span className="text-xs">🚪</span>
                </div>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content - Scrollable area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Top bar for mobile */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-30 flex-shrink-0 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200 transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/dashboard" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
              <span className="text-primary-foreground font-bold text-xs">NDC</span>
            </div>
            <span className="font-bold text-foreground text-sm">Nagpur Dev Club</span>
          </Link>
          <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
            <ThemeToggle />
          </div>
        </div>

        {/* Page content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

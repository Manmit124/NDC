"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { useUIStore } from "@/stores/ui";
import Link from "next/link";
import Image from "next/image";

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
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
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">NDC</span>
              </div>
              <span className="font-semibold text-foreground">Nagpur Dev Club</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.current
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="border-t border-border p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-primary font-semibold">
                    {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.full_name || user?.email?.split('@')[0] || 'Developer'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  @{profile?.username || user?.email?.split('@')[0] || 'user'}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              {profile?.username ? (
                <Link
                  href={`/profile/${profile.username}`}
                  className="block w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  View Profile
                </Link>
              ) : (
                <Link
                  href="/onboarding"
                  className="block w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  Complete Setup
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar for mobile */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/dashboard" className="font-semibold text-foreground">
            NDC
          </Link>
          <div className="w-6" /> {/* Spacer */}
        </div>

        {/* Page content */}
        <main className="flex-1 min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}

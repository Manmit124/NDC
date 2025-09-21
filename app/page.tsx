"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if user has completed onboarding (has a profile with username)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id);

        const profile = profiles && profiles.length > 0 ? profiles[0] : null;
        
        if (!profile?.username) {
          // User needs to complete onboarding
          router.push("/onboarding");
          return;
        }
      }
      
      setUser(user);
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user || null;
        
        if (user) {
          // Check if user has completed onboarding
          const { data: profiles } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id);

          const profile = profiles && profiles.length > 0 ? profiles[0] : null;
          
          if (!profile?.username) {
            // User needs to complete onboarding
            router.push("/onboarding");
            return;
          }
        }
        
        setUser(user);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-foreground">
                  NDC - Nagpur Developer Club
                </h1>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => router.push("/login")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground text-balance">
                Welcome to <span className="text-primary">NDC</span>
              </h1>
              <h2 className="text-2xl sm:text-3xl font-medium text-muted-foreground mb-4">
                Nagpur Developer Club
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
                Connect with Nagpur's thriving software developer community. Build your profile, find opportunities, get help, and grow your career in the heart of Maharashtra's tech scene.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => router.push("/signup")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md font-medium transition-colors"
              >
                Join the Community
              </button>
              <button
                onClick={() => router.push("/login")}
                className="text-muted-foreground hover:text-foreground px-8 py-3 rounded-md font-medium transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </main>

        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold text-foreground mb-4">
                Why Join NDC?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover the benefits of being part of Nagpur's premier developer community
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground">Developer Profiles</h3>
                <p className="text-muted-foreground">
                  Showcase your skills, projects, and experience to connect with fellow Nagpur developers and potential employers.
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6m8 0H8m0 0V4a2 2 0 012-2h4a2 2 0 012 2v2m-6 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground">Job & Internship Board</h3>
                <p className="text-muted-foreground">
                  Discover exciting career opportunities in Nagpur's growing tech ecosystem. From startups to established companies.
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground">Q&A + Anonymous Chat</h3>
                <p className="text-muted-foreground">
                  Get help with coding challenges, share knowledge, and engage in meaningful discussions with the community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-muted-foreground">
              <p>© 2024 NDC - Nagpur Developer Club. Connecting local developers.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-foreground">
                NDC - Nagpur Developer Club
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Welcome to NDC Dashboard
            </h1>
            <p className="text-muted-foreground">
              Your gateway to Nagpur's developer community
            </p>
          </div>

          {/* Account Information Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Account Information
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-muted-foreground">Email</span>
                  <span className="text-sm text-foreground font-mono">{user.email}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-muted-foreground">User ID</span>
                  <span className="text-sm text-foreground font-mono">{user.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-muted-foreground">Last Sign In</span>
                  <span className="text-sm text-foreground">
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 NDC - Nagpur Developer Club. Connecting local developers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

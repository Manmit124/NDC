"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";

export default function HomePage() {
  const router = useRouter();
  
  // Use our new auth hook instead of manual state management
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      if (!profile?.username) {
        // User needs to complete onboarding
        router.push("/onboarding");
        return;
      } else {
        // User has profile, redirect to dashboard
        router.push("/dashboard");
        return;
      }
    }
  }, [user, profile, isLoading, router]);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-xl">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-transparent animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Welcome to NDC...
            </p>
            <p className="text-sm text-muted-foreground">Preparing your developer community</p>
          </div>
        </div>
      </div>
    );
  }

  
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Header */}
        <header className="   sticky top-0 z-50 ">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                    <span className="text-primary-foreground font-bold text-sm">NDC</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-xl animate-pulse"></div>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-bold text-foreground leading-tight">
                    Nagpur Developer Club
                </h1>
                  <span className="text-xs text-muted-foreground">Connect • Learn • Grow</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push("/login")}
                  className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  ✨ Sign In
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            {/* Hero Badge */}
            <div className="inline-flex mt-12 items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span>🚀 Join 500+ Developers in Nagpur</span>
            </div>

            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance space-x-2">
                  <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                    Welcome to
                  </span>
                  {/* <br /> */}
                  <span className="bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                    NDC
                  </span>
              </h1>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-muted-foreground">
                Nagpur Developer Club
              </h2>
                <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto text-balance leading-relaxed">
                  Connect with Nagpur&apos;s thriving software developer community. 
                  <span className="text-foreground font-medium"> Build your profile</span>, 
                  <span className="text-foreground font-medium"> find opportunities</span>, 
                  <span className="text-foreground font-medium"> get help</span>, and 
                  <span className="text-foreground font-medium"> grow your career</span> in Maharashtra&apos;s tech hub.
                </p>
            </div>
            
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                onClick={() => router.push("/signup")}
                  className="group bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center space-x-2"
                >
                  <span>🚀</span>
                  <span>Join the Community</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
              </button>
              <button
                onClick={() => router.push("/login")}
                  className="group text-muted-foreground hover:text-foreground px-10 py-4 rounded-full text-lg font-medium transition-all duration-300 hover:bg-muted/50 backdrop-blur-sm border border-border/50 hover:border-border flex items-center space-x-2"
              >
                  <span>Already a member?</span>
                  <span className="font-semibold">Sign In</span>
              </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">500+</div>
                <div className="text-sm text-muted-foreground">Developers</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">50+</div>
                <div className="text-sm text-muted-foreground">Companies</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">100+</div>
                <div className="text-sm text-muted-foreground">Job Posts</div>
              </div>
            </div>
          </div>
        </main>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm mb-6">
                <span>✨</span>
                <span>Why Choose NDC?</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Everything You Need to
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Grow Your Career
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Discover the benefits of being part of Nagpur&apos;s premier developer community
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center space-y-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-2xl">👤</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent rounded-2xl animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-foreground">Developer Profiles</h3>
                  <p className="text-muted-foreground leading-relaxed">
                  Showcase your skills, projects, and experience to connect with fellow Nagpur developers and potential employers.
                </p>
                </div>
              </div>
              
              <div className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center space-y-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-2xl">💼</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent rounded-2xl animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-foreground">Job & Internship Board</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Discover exciting career opportunities in Nagpur&apos;s growing tech ecosystem. From startups to established companies.
                  </p>
                </div>
              </div>
              
              <div className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center space-y-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-2xl">💬</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-2xl animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-foreground">Q&A + Anonymous Chat</h3>
                  <p className="text-muted-foreground leading-relaxed">
                  Get help with coding challenges, share knowledge, and engage in meaningful discussions with the community.
                </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 py-12 bg-card/30 backdrop-blur-sm relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-primary-foreground font-bold text-xs">NDC</span>
                </div>
                <span className="text-lg font-bold text-foreground">Nagpur Developer Club</span>
              </div>
              <p className="text-muted-foreground max-w-md mx-auto">
                Building Maharashtra&apos;s strongest developer community, one connection at a time.
              </p>
              <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
                <span>Connect</span>
                <span>•</span>
                <span>Learn</span>
                <span>•</span>
                <span>Grow</span>
              </div>
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  © 2025 NDC - Nagpur Developer Club. Made with ❤️ for developers.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

 


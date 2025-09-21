"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

export default function OnboardingStep3() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [error, setError] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      // Check if user has a profile with username (Step 1 completed)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('username, github_url, linkedin_url, portfolio_url')
        .eq('id', user.id);

      const profile = profiles && profiles.length > 0 ? profiles[0] : null;
      
      if (!profile?.username) {
        // User hasn't completed Step 1, redirect back
        router.push("/onboarding/step-1");
        return;
      }

      // Pre-fill existing data if available
      if (profile.github_url) setGithubUrl(profile.github_url);
      if (profile.linkedin_url) setLinkedinUrl(profile.linkedin_url);
      if (profile.portfolio_url) setPortfolioUrl(profile.portfolio_url);

      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, [supabase, router]);

  const validateUrl = (url: string, platform: string): string | null => {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      
      switch (platform) {
        case 'github':
          if (!urlObj.hostname.includes('github.com')) {
            return 'Please enter a valid GitHub URL';
          }
          break;
        case 'linkedin':
          if (!urlObj.hostname.includes('linkedin.com')) {
            return 'Please enter a valid LinkedIn URL';
          }
          break;
        case 'portfolio':
          // Any valid URL is acceptable for portfolio
          break;
      }
      
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  };

  const normalizeUrl = (url: string): string => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate URLs
    const githubError = validateUrl(githubUrl, 'github');
    const linkedinError = validateUrl(linkedinUrl, 'linkedin');
    const portfolioError = validateUrl(portfolioUrl, 'portfolio');
    
    if (githubError || linkedinError || portfolioError) {
      setError(githubError || linkedinError || portfolioError || '');
      return;
    }
    
    setSubmitting(true);
    setError("");

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          github_url: githubUrl ? normalizeUrl(githubUrl) : null,
          linkedin_url: linkedinUrl ? normalizeUrl(linkedinUrl) : null,
          portfolio_url: portfolioUrl ? normalizeUrl(portfolioUrl) : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user!.id);

      if (error) {
        throw error;
      }

      // Success - redirect to profile page
      router.push(`/profile/${profile.username}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipToComplete = async () => {
    setSubmitting(true);
    setError("");

    try {
      // Update with current data (even if empty)
      const { error } = await supabase
        .from('profiles')
        .update({
          github_url: githubUrl ? normalizeUrl(githubUrl) : null,
          linkedin_url: linkedinUrl ? normalizeUrl(linkedinUrl) : null,
          portfolio_url: portfolioUrl ? normalizeUrl(portfolioUrl) : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user!.id);

      if (error) {
        throw error;
      }

      // Skip to profile page
      router.push(`/profile/${profile.username}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
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
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-semibold text-foreground hover:text-muted-foreground transition-colors">
                NDC - Nagpur Developer Club
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Progress Section */}
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Connect Your Profiles
            </h1>
            <p className="text-muted-foreground">
              Link your professional profiles to showcase your work
            </p>
          </div>

          {/* Onboarding Form */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Step 3 of 3 - Connect Your Profiles</span>
              </div>
              <div className="flex space-x-2">
                <div className="h-2 w-full bg-primary rounded-full"></div>
                <div className="h-2 w-full bg-primary rounded-full"></div>
                <div className="h-2 w-full bg-primary rounded-full"></div>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* GitHub URL */}
              <div className="space-y-2">
                <label htmlFor="github" className="text-sm font-medium text-foreground flex items-center">
                  <span className="mr-2">🐙</span>
                  GitHub Profile
                </label>
                <input
                  id="github"
                  name="github"
                  type="url"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                  placeholder="https://github.com/yourusername"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                />
              </div>

              {/* LinkedIn URL */}
              <div className="space-y-2">
                <label htmlFor="linkedin" className="text-sm font-medium text-foreground flex items-center">
                  <span className="mr-2">💼</span>
                  LinkedIn Profile
                </label>
                <input
                  id="linkedin"
                  name="linkedin"
                  type="url"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                  placeholder="https://linkedin.com/in/yourusername"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                />
              </div>

              {/* Portfolio URL */}
              <div className="space-y-2">
                <label htmlFor="portfolio" className="text-sm font-medium text-foreground flex items-center">
                  <span className="mr-2">🌐</span>
                  Portfolio Website
                </label>
                <input
                  id="portfolio"
                  name="portfolio"
                  type="url"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                  placeholder="https://yourportfolio.com"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-2 px-4 rounded-md transition-colors"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      <span>Completing profile...</span>
                    </div>
                  ) : (
                    "Complete Profile"
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleSkipToComplete}
                  disabled={submitting}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Skip - Complete Later
                </button>
              </div>
            </form>
          </div>

          {/* Navigation */}
          <div className="text-center">
            <Link
              href="/onboarding/step-2"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Step 2
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

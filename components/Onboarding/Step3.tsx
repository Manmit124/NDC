"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { useCompleteOnboarding } from "@/hooks/api/useOnboarding";
import { useUIStore } from "@/stores/ui";

export default function Step3() {
  const { user, profile, isLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();
  const completeOnboarding = useCompleteOnboarding();
  const { onboardingData, updateOnboardingData, setOnboardingStep, resetOnboarding } = useUIStore();

  // Initialize with stored data or existing profile data
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
        return;
      }

      // Check if user has completed Step 1 by looking at onboarding data
      if (!onboardingData.step1.username || !onboardingData.step1.fullName) {
        console.log('Step1 data missing, redirecting to step 1');
        setOnboardingStep(1);
        return;
      }

      // Initialize with stored onboarding data or existing profile data
      if (onboardingData.step3.githubUrl) {
        setGithubUrl(onboardingData.step3.githubUrl);
      } else if (profile?.github_url) {
        setGithubUrl(profile.github_url);
      }

      if (onboardingData.step3.linkedinUrl) {
        setLinkedinUrl(onboardingData.step3.linkedinUrl);
      } else if (profile?.linkedin_url) {
        setLinkedinUrl(profile.linkedin_url);
      }

      if (onboardingData.step3.portfolioUrl) {
        setPortfolioUrl(onboardingData.step3.portfolioUrl);
      } else if (profile?.portfolio_url) {
        setPortfolioUrl(profile.portfolio_url);
      }
    }
  }, [user, profile, isLoading, router, onboardingData, setOnboardingStep]);

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

  const handleGithubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGithubUrl(value);
    updateOnboardingData('step3', { githubUrl: value });
  };

  const handleLinkedinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLinkedinUrl(value);
    updateOnboardingData('step3', { linkedinUrl: value });
  };

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPortfolioUrl(value);
    updateOnboardingData('step3', { portfolioUrl: value });
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
      // Collect all onboarding data and save to Supabase
      const step1Data = onboardingData.step1;
      const step2Data = onboardingData.step2;

      if (!step1Data.username || !step1Data.fullName) {
        setError("Missing required information from previous steps");
        return;
      }

      await completeOnboarding.mutateAsync({
        id: user!.id,
        username: step1Data.username,
        fullName: step1Data.fullName,
        bio: step2Data.bio || undefined,
        skills: step2Data.skills && step2Data.skills.length > 0 ? step2Data.skills : undefined,
        githubUrl: githubUrl || undefined,
        linkedinUrl: linkedinUrl || undefined,
        portfolioUrl: portfolioUrl || undefined,
      });

      // Update store with final data
      updateOnboardingData('step3', {
        githubUrl: githubUrl ? normalizeUrl(githubUrl) : '',
        linkedinUrl: linkedinUrl ? normalizeUrl(linkedinUrl) : '',
        portfolioUrl: portfolioUrl ? normalizeUrl(portfolioUrl) : ''
      });

      // Onboarding complete! Reset onboarding state and redirect to profile
      resetOnboarding();
      router.push(`/profile/${step1Data.username}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToStep2 = () => {
    setOnboardingStep(2);
  };

  if (isLoading) {
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
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-xl">
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
                  onChange={handleGithubChange}
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
                  onChange={handleLinkedinChange}
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
                  onChange={handlePortfolioChange}
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

              </div>
            </form>
          </div>

          {/* Navigation */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleBackToStep2}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Step 2
            </button>
          </div>
        </div>
      </main>
  );
}
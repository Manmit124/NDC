"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { useUIStore } from "@/stores/ui";
import { createClient } from "@/utils/supabase/client";
import { useDebounce } from 'use-debounce';

export default function Step1() {
  const [submitting, setSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [value] = useDebounce(username, 2000);
  const [fullName, setFullName] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const supabase = createClient();
  const { user, profile, isLoading } = useAuth();
  const { onboardingData, updateOnboardingData, setOnboardingStep, currentOnboardingStep } = useUIStore();

  // Log current step for debugging
  console.log('Step1 component - Current onboarding step:', currentOnboardingStep);

  // Initialize with stored data or prefill from auth
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
        return;
      }

      if (profile?.username) {
        // User already has a profile, redirect to dashboard
        router.push("/dashboard");
        return;
      }

      // Initialize with stored onboarding data or prefill from auth
      if (onboardingData.step1.username) {
        setUsername(onboardingData.step1.username);
      }

      if (onboardingData.step1.fullName) {
        setFullName(onboardingData.step1.fullName);
      } else if (user.user_metadata?.name) {
        // Pre-fill full name if available from auth metadata
        setFullName(user.user_metadata.name);
      }
    }
  }, [user, profile, isLoading, router, onboardingData]);

  // Check username availability with debouncing
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (!username || username.length < 3) {
        setUsernameAvailable(null);
        return;
      }

      setUsernameChecking(true);

      try {
        // Use direct Supabase call instead of mutation to avoid repeated calls
        const { data } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username.toLowerCase());

        // Username is available if no data is returned
        const isAvailable = !data || data.length === 0;
        setUsernameAvailable(isAvailable);
      } catch (error) {
        console.error('Username check failed:', error);
        setUsernameAvailable(null);
      } finally {
        setUsernameChecking(false);
      }
    };

    const timeoutId = setTimeout(checkUsernameAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [username, supabase]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(value);
    // Update store with current input
    updateOnboardingData('step1', { username: value });
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFullName(value);
    // Update store with current input
    updateOnboardingData('step1', { fullName: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Step1 form submitted:', { username, fullName, usernameAvailable });

    if (!username || !fullName) {
      setError("Please fill in all required fields");
      return;
    }

    if (usernameAvailable === false) {
      setError("Username is not available");
      return;
    }

    if (usernameAvailable === null) {
      setError("Please wait for username validation to complete");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Just update store with validated data, don't save to Supabase yet
      console.log('Updating step1 data:', { username: username.toLowerCase(), fullName });
      updateOnboardingData('step1', { username: username.toLowerCase(), fullName });

      console.log('Step1 data updated, moving to step 2');

      // Add a small delay to ensure state is updated
      setTimeout(() => {
        console.log('About to set step to 2');
        setOnboardingStep(2);
        console.log('Step set to 2');
      }, 100);
    } catch (err: unknown) {
      console.error('Step1 submission error:', err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-xl">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-transparent animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Loading your profile...
            </p>
            <p className="text-sm text-muted-foreground">Just a moment</p>
          </div>
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
          {/* Welcome Section */}
          <div className="text-center space-y-6">
            {/* Welcome Badge */}
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span>🎉 Welcome to NDC</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Join the
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Community
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Let&apos;s set up your developer profile to connect with Nagpur&apos;s tech community
              </p>
            </div>
          </div>

          {/* Onboarding Form */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-xl">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-3">
                <span>Step 1 of 3</span>
                <span>Basic Information</span>
              </div>
              <div className="flex space-x-2">
                <div className="h-3 w-full bg-gradient-to-r from-primary to-primary/80 rounded-full shadow-sm"></div>
                <div className="h-3 w-full bg-muted/50 rounded-full"></div>
                <div className="h-3 w-full bg-muted/50 rounded-full"></div>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Username Field */}
              <div className="space-y-3">
                <label htmlFor="username" className="text-sm font-semibold text-foreground flex items-center space-x-2">
                  <span>👤</span>
                  <span>Choose Your Username *</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-muted-foreground font-medium">@</span>
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 h-12 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
                    placeholder="your_username"
                    value={username}
                    onChange={handleUsernameChange}
                    minLength={3}
                    maxLength={30}
                  />
                </div>

                {/* Username Status */}
                {username && (
                  <div className="text-sm">
                    {usernameChecking ? (
                      <span className="text-muted-foreground">Checking availability...</span>
                    ) : usernameAvailable === true ? (
                      <span className="text-green-600">✅ Available</span>
                    ) : usernameAvailable === false ? (
                      <span className="text-red-600">❌ Already taken</span>
                    ) : null}
                  </div>
                )}

                {username && usernameAvailable && (
                  <p className="text-xs text-muted-foreground">
                    Your profile will be: ndc.com/profile/{username}
                  </p>
                )}
              </div>

              {/* Full Name Field */}
              <div className="space-y-3">
                <label htmlFor="fullName" className="text-sm font-semibold text-foreground flex items-center space-x-2">
                  <span>✨</span>
                  <span>Full Name *</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="w-full px-4 py-3 h-12 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={handleFullNameChange}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-500">⚠️</span>
                    <p className="text-red-500 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || !username || !fullName || usernameAvailable !== true}
                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      <span>Validating...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Continue to Skills</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer Note */}
          <div className="text-center space-y-4">
            <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
              <span>Step 1</span>
              <span>•</span>
              <span>Basic Info</span>
              <span>•</span>
              <span>Quick Setup</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You can always update your profile information later
            </p>
          </div>
        </div>
      </main>
  );
}
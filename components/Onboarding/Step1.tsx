"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { useUIStore } from "@/stores/ui";
import { createClient } from "@/utils/supabase/client";
import { useDebounce } from 'use-debounce';
import Link from "next/link";

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
  }, [value]);

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
          {/* Welcome Section */}
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <div className="text-4xl mb-4">🎉</div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Welcome to NDC Community!
              </h1>
              <p className="text-muted-foreground">
                Let&apos;s set up your developer profile to connect with Nagpur&apos;s tech community.
              </p>
            </div>
          </div>

          {/* Onboarding Form */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Step 1 of 3 - Basic Information</span>
              </div>
              <div className="flex space-x-2">
                <div className="h-2 w-full bg-primary rounded-full"></div>
                <div className="h-2 w-full bg-muted rounded-full"></div>
                <div className="h-2 w-full bg-muted rounded-full"></div>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground">
                  Choose Your Username *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-muted-foreground">@</span>
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="w-full pl-8 pr-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
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
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={handleFullNameChange}
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
                  disabled={submitting || !username || !fullName || usernameAvailable !== true}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-2 px-4 rounded-md transition-colors"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      <span>Validating...</span>
                    </div>
                  ) : (
                    "Continue to Skills"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer Note */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              You can always update your profile information later
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
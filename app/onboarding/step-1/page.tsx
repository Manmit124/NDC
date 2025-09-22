"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function OnboardingStep1() {
  const [submitting, setSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const supabase = createClient();
  
  // Use our auth hook instead of manual state management
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
        return;
      }

      if (profile?.username) {
        // User already has a profile, redirect to dashboard
        router.push("/");
        return;
      }

      // Pre-fill full name if available from auth metadata
      if (user.user_metadata?.name) {
        setFullName(user.user_metadata.name);
      }
    }
  }, [user, profile, isLoading, router]);

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (!username || username.length < 3) {
        setUsernameAvailable(null);
        return;
      }

      setUsernameChecking(true);
      
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase());

      // Username is available if no data is returned
      setUsernameAvailable(!data || data.length === 0);
      setUsernameChecking(false);
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username, supabase]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !fullName) {
      setError("Please fill in all required fields");
      return;
    }

    if (usernameAvailable === false) {
      setError("Username is not available");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user!.id,
          username: username.toLowerCase(),
          full_name: fullName,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      // Success - redirect to step 2
      router.push("/onboarding/step-2");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipToComplete = async () => {
    if (!username || !fullName || usernameAvailable === false) {
      setError("Username and full name are required");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user!.id,
          username: username.toLowerCase(),
          full_name: fullName,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      // Skip to profile page
      router.push(`/profile/${username.toLowerCase()}`);
    } catch (err: unknown) {
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
                  onChange={(e) => setFullName(e.target.value)}
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
                  disabled={submitting || !username || !fullName || usernameAvailable === false}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-2 px-4 rounded-md transition-colors"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      <span>Setting up profile...</span>
                    </div>
                  ) : (
                    "Continue to Skills"
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleSkipToComplete}
                  disabled={submitting || !username || !fullName || usernameAvailable === false}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Skip - Complete Later
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

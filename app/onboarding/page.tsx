"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingCheck } from "@/hooks/auth/useAuth";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, needsOnboarding, isLoading } = useOnboardingCheck();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
        return;
      }

      if (!needsOnboarding && profile?.username) {
        // User already has a profile, redirect to dashboard
        router.push("/dashboard");
        return;
      }
    }
  }, [user, profile, needsOnboarding, isLoading, router]);

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

  // Redirect to step 1 by default
  router.push("/onboarding/step-1");
  return null;
}

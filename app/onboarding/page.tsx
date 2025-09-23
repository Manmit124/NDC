"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingCheck } from "@/hooks/auth/useAuth";
import { useUIStore } from "@/stores/ui";
import Step1 from "@/components/Onboarding/Step1";
import Step2 from "@/components/Onboarding/Step2";
import Step3 from "@/components/Onboarding/Step3";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, needsOnboarding, isLoading } = useOnboardingCheck();
  const { currentOnboardingStep, setOnboardingStep, resetOnboarding } = useUIStore();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
        return;
      }

      if (!needsOnboarding && profile?.username) {
        // User already has a profile, reset onboarding state and redirect to dashboard
        resetOnboarding();
        router.push("/dashboard");
        return;
      }

      // Only reset to step 1 if user needs onboarding and step is 0 or invalid
      if (needsOnboarding && (currentOnboardingStep < 1 || currentOnboardingStep > 3)) {
        console.log('Resetting to step 1 due to invalid step:', currentOnboardingStep);
        setOnboardingStep(1);
      }
    }
  }, [user, profile, needsOnboarding, isLoading, router, currentOnboardingStep, setOnboardingStep, resetOnboarding]);

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

  // If user already has a profile, redirect to dashboard
  if (!needsOnboarding && profile?.username) {
    return null;
  }

  // Render the appropriate step component
  const renderCurrentStep = () => {
    console.log('Rendering onboarding step:', currentOnboardingStep);
    
    switch (currentOnboardingStep) {
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      default:
        return <Step1 />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderCurrentStep()}
    </div>
  );
}

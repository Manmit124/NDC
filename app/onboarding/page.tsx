"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingCheck } from "@/hooks/auth/useAuth";
import { useUIStore } from "@/stores/ui";
import Link from "next/link";
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-xl">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-transparent animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Setting up your profile...
            </p>
            <p className="text-sm text-muted-foreground">Preparing your onboarding experience</p>
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden flex flex-col">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Common Header */}
      <header className="sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <span className="text-primary-foreground font-bold text-sm">NDC</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-xl animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground leading-tight">Nagpur Developer Club</span>
                <span className="text-xs text-muted-foreground">Setup your profile</span>
              </div>
            </Link>
            <div className="flex items-center space-x-3">
              {user && (
                <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                  {user.email}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <div className="relative z-10 flex-1">
        {renderCurrentStep()}
      </div>
    </div>
  );
}

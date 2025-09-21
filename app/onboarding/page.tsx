"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

export default function OnboardingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      // Check if user already has a profile
      const { data: profiles } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id);

      const profile = profiles && profiles.length > 0 ? profiles[0] : null;
      
      if (profile?.username) {
        // User already has a profile, redirect to dashboard
        router.push("/");
        return;
      }

      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, [supabase, router]);

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

  // Redirect to step 1 by default
  router.push("/onboarding/step-1");
  return null;
}

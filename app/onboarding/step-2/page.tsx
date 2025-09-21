"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

// Predefined skills categories
const skillsCategories = {
  frontend: [
    "React", "JavaScript", "Vue.js", "Angular", "HTML/CSS", "TypeScript", 
    "Next.js", "Svelte", "jQuery", "Bootstrap", "Tailwind CSS"
  ],
  backend: [
    "Node.js", "Python", "Java", "PHP", "Django", "Express.js", 
    "Spring", "Laravel", "Ruby", "Go", "C#", ".NET"
  ],
  database: [
    "MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase", "SQLite", 
    "Oracle", "Cassandra", "DynamoDB"
  ],
  mobile: [
    "React Native", "Flutter", "Swift", "Kotlin", "Ionic", "Xamarin", 
    "Android", "iOS"
  ],
  devops: [
    "Docker", "AWS", "Azure", "GCP", "Kubernetes", "Jenkins", 
    "Git", "Linux", "Nginx", "Apache"
  ],
  other: [
    "Machine Learning", "AI", "Blockchain", "GraphQL", "REST API", 
    "Microservices", "Testing", "Agile", "Scrum"
  ]
};

export default function OnboardingStep2() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bio, setBio] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
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
        .select('username, bio, skills')
        .eq('id', user.id);

      const profile = profiles && profiles.length > 0 ? profiles[0] : null;
      
      if (!profile?.username) {
        // User hasn't completed Step 1, redirect back
        router.push("/onboarding/step-1");
        return;
      }

      // Pre-fill existing data if available
      if (profile.bio) setBio(profile.bio);
      if (profile.skills) setSelectedSkills(profile.skills);

      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, [supabase, router]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSubmitting(true);
    setError("");

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bio: bio.trim() || null,
          skills: selectedSkills.length > 0 ? selectedSkills : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user!.id);

      if (error) {
        throw error;
      }

      // Success - redirect to step 3
      router.push("/onboarding/step-3");
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
          bio: bio.trim() || null,
          skills: selectedSkills.length > 0 ? selectedSkills : null,
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
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Progress Section */}
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Tell us about yourself
            </h1>
            <p className="text-muted-foreground">
              Help other developers know your expertise and interests
            </p>
          </div>

          {/* Onboarding Form */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Step 2 of 3 - Professional Information</span>
              </div>
              <div className="flex space-x-2">
                <div className="h-2 w-full bg-primary rounded-full"></div>
                <div className="h-2 w-full bg-primary rounded-full"></div>
                <div className="h-2 w-full bg-muted rounded-full"></div>
              </div>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Bio Field */}
              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium text-foreground">
                  Tell us about yourself
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-none"
                  placeholder="Full-stack developer passionate about React and Node.js. Love building scalable web apps and contributing to open source projects."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {bio.length}/500 characters
                </p>
              </div>

              {/* Skills Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">
                  Your Skills (Select all that apply)
                </h3>
                
                {Object.entries(skillsCategories).map(([category, skills]) => (
                  <div key={category} className="space-y-3">
                    <h4 className="text-sm font-medium text-foreground capitalize border-b border-border pb-1">
                      {category === 'devops' ? 'DevOps & Tools' : category}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {skills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-3 py-2 text-sm rounded-md border transition-colors text-left ${
                            selectedSkills.includes(skill)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background text-foreground border-input hover:bg-muted'
                          }`}
                        >
                          {selectedSkills.includes(skill) ? '✓ ' : ''}{skill}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                
                {selectedSkills.length > 0 && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-md">
                    <p className="text-sm text-muted-foreground mb-2">Selected skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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
                      <span>Saving...</span>
                    </div>
                  ) : (
                    "Continue to Links"
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
              href="/onboarding/step-1"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Step 1
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

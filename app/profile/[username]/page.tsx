"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/api/useProfile";
import Link from "next/link";
import Image from "next/image";
import { Profile } from "@/types/database";

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  
  const params = useParams();
  const username = params.username as string;
  
  // Use our new hooks instead of manual state management
  const { user } = useAuth();
  const { data: profile, isLoading, error } = useProfile(username);
  const updateProfile = useUpdateProfile();
  
  // Check if this is the current user's profile
  const isOwnProfile = user?.id === profile?.id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl font-semibold text-foreground">Profile Not Found</h1>
          <p className="text-muted-foreground">
            The profile you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-medium transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Edit Button for Own Profile */}
      {isOwnProfile && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setEditing(!editing)}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="text-center space-y-6">
            {/* Avatar */}
            <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl font-semibold text-primary">
                  {profile.full_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Name and Username */}
            <div>
              <h1 className="text-4xl font-semibold text-foreground mb-2">
                {profile.full_name}
              </h1>
              <p className="text-xl text-muted-foreground">@{profile.username}</p>
              {isOwnProfile && (
                <p className="text-sm text-muted-foreground mt-2">
                  This is your profile - others see it this way
                </p>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="max-w-2xl mx-auto">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}
          </div>

          {/* Skills Section */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {(profile.github_url || profile.linkedin_url || profile.portfolio_url) && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Connect</h2>
              <div className="flex flex-wrap gap-4">
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md transition-colors"
                  >
                    <span>🐙</span>
                    <span>GitHub</span>
                  </a>
                )}
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md transition-colors"
                  >
                    <span>💼</span>
                    <span>LinkedIn</span>
                  </a>
                )}
                {profile.portfolio_url && (
                  <a
                    href={profile.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md transition-colors"
                  >
                    <span>🌐</span>
                    <span>Portfolio</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Empty State for Own Profile */}
          {isOwnProfile && !profile.bio && (!profile.skills || profile.skills.length === 0) && !profile.github_url && !profile.linkedin_url && !profile.portfolio_url && (
            <div className="bg-muted/30 border border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Complete Your Profile
              </h3>
              <p className="text-muted-foreground mb-4">
                Add your bio, skills, and social links to help other developers connect with you.
              </p>
              <button
                onClick={() => setEditing(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-medium transition-colors"
              >
                Edit Profile
              </button>
            </div>
          )}

          {/* Member Since */}
          <div className="text-center text-sm text-muted-foreground">
            Member since {new Date(profile.updated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long'
            })}
          </div>
        </div>
      </div>

      {/* Edit Modal/Overlay */}
      {editing && isOwnProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Edit Profile</h2>
              <button
                onClick={() => setEditing(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            
            <EditProfileForm 
              profile={profile} 
              updateProfile={updateProfile}
              onSave={() => setEditing(false)}
              onCancel={() => setEditing(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Edit Profile Form Component
function EditProfileForm({ 
  profile, 
  updateProfile,
  onSave, 
  onCancel 
}: { 
  profile: Profile;
  updateProfile: ReturnType<typeof useUpdateProfile>;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    full_name: profile.full_name,
    bio: profile.bio || '',
    github_url: profile.github_url || '',
    linkedin_url: profile.linkedin_url || '',
    portfolio_url: profile.portfolio_url || '',
  });
  const [selectedSkills, setSelectedSkills] = useState<string[]>(profile.skills || []);
  const [error, setError] = useState("");

  // Skills categories (same as onboarding)
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

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const updates = {
      full_name: formData.full_name,
      bio: formData.bio.trim() || undefined,
      skills: selectedSkills.length > 0 ? selectedSkills : undefined,
      github_url: formData.github_url.trim() || undefined,
      linkedin_url: formData.linkedin_url.trim() || undefined,
      portfolio_url: formData.portfolio_url.trim() || undefined,
    };

    updateProfile.mutate(
      { profileId: profile.id, updates: updates as Partial<Profile> },
      {
        onSuccess: () => {
          onSave();
        },
        onError: (err: Error) => {
          setError(err.message || "Failed to update profile");
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Full Name *
        </label>
        <input
          type="text"
          required
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          value={formData.full_name}
          onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Bio
        </label>
        <textarea
          rows={4}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          placeholder="Tell others about yourself..."
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground">
          {formData.bio.length}/500 characters
        </p>
      </div>

      {/* Skills */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground">
          Skills
        </label>
        {Object.entries(skillsCategories).map(([category, skills]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-medium text-foreground capitalize">
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
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground">
          Social Links
        </label>
        
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">GitHub</label>
          <input
            type="url"
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="https://github.com/yourusername"
            value={formData.github_url}
            onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">LinkedIn</label>
          <input
            type="url"
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="https://linkedin.com/in/yourusername"
            value={formData.linkedin_url}
            onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Portfolio</label>
          <input
            type="url"
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="https://yourportfolio.com"
            value={formData.portfolio_url}
            onChange={(e) => setFormData(prev => ({ ...prev, portfolio_url: e.target.value }))}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 px-4 py-2 rounded-md font-medium transition-colors"
              >
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={updateProfile.isPending}
                className="px-4 py-2 border border-input rounded-md text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
      </div>
    </form>
  );
}
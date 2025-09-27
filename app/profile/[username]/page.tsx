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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      {/* Action Buttons for Own Profile */}
      {isOwnProfile && (
        <div className="mb-6 flex justify-end gap-3">
          <Link
            href={`/profile/${username}/blogs`}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            📝 My Blogs
          </Link>
          <button
            onClick={() => setEditing(!editing)}
            className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {editing ? "Cancel" : "✨ Edit Profile"}
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-2xl mx-auto">
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="text-center space-y-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-xl">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-36 h-36 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full flex items-center justify-center mx-auto shadow-2xl ring-4 ring-primary/20 group-hover:ring-primary/30 transition-all duration-500">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    width={144}
                    height={144}
                    className="w-36 h-36 rounded-full object-cover shadow-lg"
                  />
                ) : (
                  <span className="text-5xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
                    {profile.full_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {/* Decorative rings */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-transparent animate-pulse"></div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {profile.full_name}
              </h1>
              {/* {isOwnProfile && (
                <p className="text-sm text-muted-foreground">
                  This is your profile - others see it this way
                </p>
              )} */}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="max-w-xl mx-auto">
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Profile Info */}
            <div className="space-y-4 pt-4">
              {/* Joined Date */}
              <div className="flex items-center justify-center gap-3 bg-muted/30 rounded-full px-4 py-2 mx-auto w-fit backdrop-blur-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📅</span>
                </div>
                <span className="text-foreground font-medium">
                  Joined {new Date(profile.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>

              {/* Portfolio URL */}
              {profile.portfolio_url && (
                <div className="flex items-center justify-center gap-3 bg-muted/30 rounded-full px-4 py-2 mx-auto w-fit backdrop-blur-sm hover:bg-muted/40 transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🔗</span>
                  </div>
                  <a
                    href={profile.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors font-medium"
                    title={profile.portfolio_url}
                  >
                    {(() => {
                      const displayUrl = profile.portfolio_url.replace(/^https?:\/\//, '');
                      return displayUrl.length > 25 
                        ? `${displayUrl.substring(0, 25)}...` 
                        : displayUrl;
                    })()}
                  </a>
                </div>
              )}

              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="pt-2">
                  <div className="flex flex-wrap justify-center gap-2">
                    {profile.skills.map((skill, index) => (
                      <span
                        key={skill}
                        className="px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 text-primary text-sm rounded-full font-medium border border-primary/20 hover:border-primary/40 hover:from-primary/20 hover:to-primary/10 transition-all duration-300 transform hover:scale-105 shadow-sm"
                        style={{
                          animationDelay: `${index * 100}ms`
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          {(profile.github_url || profile.linkedin_url) && (
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Connect
              </h2>
              <div className="flex flex-wrap gap-4 justify-center">
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 px-6 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <span className="text-lg">🐙</span>
                    </div>
                    <span className="font-medium">GitHub</span>
                  </a>
                )}
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 px-6 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <span className="text-lg">💼</span>
                    </div>
                    <span className="font-medium">LinkedIn</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Empty State for Own Profile */}
          {isOwnProfile && !profile.bio && (!profile.skills || profile.skills.length === 0) && !profile.github_url && !profile.linkedin_url && !profile.portfolio_url && (
            <div className="bg-gradient-to-br from-muted/20 to-muted/10 border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center backdrop-blur-sm">
              <div className="text-6xl mb-6 animate-bounce">✨</div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Complete Your Profile
              </h3>
              <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                Add your bio, skills, and social links to help other developers connect with you.
              </p>
              <button
                onClick={() => setEditing(true)}
                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                🚀 Edit Profile
              </button>
            </div>
          )}
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
"use client";

export default function JobsPage() {
  return (
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">
            Jobs & Internships
          </h1>
          <p className="text-muted-foreground">
            Discover opportunities in Nagpur&apos;s tech ecosystem
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="text-6xl mb-6">💼</div>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Job Board Coming Soon
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            We&apos;re building a comprehensive job board to connect Nagpur developers with local opportunities. Stay tuned!
          </p>
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">What to expect:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Local job postings from Nagpur companies</li>
                <li>• Internship opportunities for students</li>
                <li>• Remote work options</li>
                <li>• Skill-based job matching</li>
                <li>• Direct application system</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    
  );
}

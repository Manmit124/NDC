"use client";

export default function QAPage() {
  return (
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">
            Q&A Community
          </h1>
          <p className="text-muted-foreground">
            Ask questions, share knowledge, and help fellow developers
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="text-6xl mb-6">❓</div>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Q&A Platform Coming Soon
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            We&apos;re building a community-driven Q&A platform where Nagpur developers can help each other grow.
          </p>
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">What to expect:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ask technical questions and get expert answers</li>
                <li>• Share your knowledge with the community</li>
                <li>• Vote on the best answers</li>
                <li>• Build your reputation as a helpful developer</li>
                <li>• Tag-based question organization</li>
                <li>• Real-time notifications for answers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  );
}

"use client";

export default function ChatPage() {
  return (
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">
            Community Chat
          </h1>
          <p className="text-muted-foreground">
            Connect and chat with Nagpur&apos;s developer community
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="text-6xl mb-6">💬</div>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Community Chat Coming Soon
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            We&apos;re developing a real-time chat system for instant communication and community building.
          </p>
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">What to expect:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time messaging with fellow developers</li>
                <li>• Topic-based chat channels</li>
                <li>• Anonymous chat option for sensitive discussions</li>
                <li>• File and code snippet sharing</li>
                <li>• Direct messaging between developers</li>
                <li>• Moderated community guidelines</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  );
}

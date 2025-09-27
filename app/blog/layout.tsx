import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Developer Blog | NDC Nagpur",
  description: "Read the latest articles, tutorials, and insights from Nagpur's developer community. Learn about web development, programming tips, and tech trends.",
  keywords: "developer blog, programming tutorials, web development, Nagpur developers, tech articles, coding tips",
  openGraph: {
    title: "Developer Blog | NDC Nagpur",
    description: "Read the latest articles and tutorials from Nagpur's developer community",
    type: "website",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Blog Header - Matching NDC Theme */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/blog"
                className="flex items-center space-x-3 group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <span className="text-primary-foreground text-lg">📝</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Developer Blog
                  </span>
                  <span className="text-xs text-muted-foreground">Knowledge Sharing</span>
                </div>
              </Link>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/blog"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                All Posts
              </Link>
              <Link 
                href="/dashboard"
                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer - Matching NDC Theme */}
      <footer className="border-t border-border/50 py-12 bg-card/30 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-primary-foreground font-bold text-xs">NDC</span>
              </div>
              <span className="text-lg font-bold text-foreground">Developer Blog</span>
            </div>
            <p className="text-muted-foreground max-w-md mx-auto">
              Part of <Link href="/" className="text-primary hover:text-primary/80 font-medium transition-colors">Nagpur Developer Club</Link> - 
              Sharing knowledge, building community 🚀
            </p>
            <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
              <span>Learn</span>
              <span>•</span>
              <span>Share</span>
              <span>•</span>
              <span>Grow</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

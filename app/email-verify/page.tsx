"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function EmailVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if there's an error in the URL params (Supabase adds error params on failure)
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      setStatus('error');
      setMessage(errorDescription || 'Email verification failed. Please try again.');
    } else {
      // If no error, assume success (Supabase redirected here after successful verification)
      setStatus('success');
      setMessage('Your email has been verified successfully!');
    }
  }, [searchParams]);

  const handleContinue = () => {
    router.push('/login');
  };


  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-foreground">
                NDC - Nagpur Developer Club
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="mx-auto h-16 w-16 text-primary animate-spin" />
                <h2 className="mt-6 text-3xl font-semibold text-foreground">
                  Verifying your email...
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Please wait while we confirm your email address.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h2 className="mt-6 text-3xl font-semibold text-foreground">
                  Email Verified!
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {message}
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  Welcome to the Nagpur Developer Club! You can now sign in to your account.
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="mx-auto h-16 w-16 text-red-500" />
                <h2 className="mt-6 text-3xl font-semibold text-foreground">
                  Verification Failed
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {message}
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  The verification link may have expired or been used already.
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {status === 'success' && (
              <Button
                onClick={handleContinue}
                className="w-full"
              >
                Continue to Sign In
              </Button>
            )}

          </div>

          {/* Back to Home */}
          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 NDC - Nagpur Developer Club. Connecting local developers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function EmailVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <EmailVerifyContent />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  
  // Use our new auth hook instead of manual state management
  const { login, isLoggingIn, loginError } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    login({ email, password }, {
      onSuccess: () => {
        router.push("/dashboard");
      }
    });
  };

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
              <Link
                href="/signup"
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                Don&apos;t have an account? Sign up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Welcome back
              </h1>
              <p className="text-muted-foreground">
                Sign in to continue to NDC
              </p>
            </div>
          </div>

          {/* Login Form */}
          <Card>
            
            <CardHeader className="text-center">
              <CardTitle>Sign in to your account</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleLogin}>
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {/* Error Message */}
                {loginError && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                    <p className="text-destructive text-sm">{loginError.message}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full"
                >
                  {isLoggingIn ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              {/* Signup Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Need help? Contact your administrator
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

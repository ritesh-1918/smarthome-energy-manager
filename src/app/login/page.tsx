"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const callbackURL = "/profile";

    const { error } = await authClient.signIn.email({
      email,
      password,
      rememberMe,
      callbackURL,
    });

    if (error?.code) {
      setError("Invalid email or password. Please make sure you have already registered an account and try again.");
      setLoading(false);
      return;
    }

    // bearer token is stored by auth-client plugin; redirect
    router.push(callbackURL);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
            <div className="space-y-2">
              <label className="text-sm">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="off" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              Remember me
            </label>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-4">
            Don&apos;t have an account? <Link href="/register" className="underline">Register</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
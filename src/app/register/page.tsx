"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const { error } = await authClient.signUp.email({
      email,
      name,
      password,
    });

    if (error?.code) {
      setError(error.code === "USER_ALREADY_EXISTS" ? "Email already registered" : "Registration failed");
      setLoading(false);
      return;
    }

    router.push("/login?registered=true");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
            <div className="space-y-2">
              <label className="text-sm">Name</label>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="off" />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Confirm Password</label>
              <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="off" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-4">
            Already have an account? <Link href="/login" className="underline">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
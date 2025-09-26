"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/state/AuthContext";

export default function ProfilePage() {
  const { user, logout, refresh } = useAuth();
  const [name, setName] = useState(user?.name || "");

  // In-memory demo has no persistence for profile updates, so just simulate.
  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    // pretend save
    alert("Profile saved (demo)");
    refresh();
  }

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <Button variant="secondary" onClick={logout}>Log out</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="grid gap-4 max-w-lg">
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} readOnly />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <Button type="submit">Save changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
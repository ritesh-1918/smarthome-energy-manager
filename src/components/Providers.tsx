"use client";
import React from "react";
import { AuthProvider } from "@/state/AuthContext";
import { ThemeProvider } from "next-themes";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
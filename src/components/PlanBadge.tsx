"use client";
import React from "react";
import Link from "next/link";
import { useCustomer } from "autumn-js/react";

export const PlanBadge: React.FC = () => {
  const { customer, isLoading } = useCustomer();
  if (isLoading) return null;
  const planName = customer?.products?.[0]?.name || "Free Plan";

  return (
    <Link
      href="/pricing"
      className="fixed z-40 bottom-4 right-4 sm:top-4 sm:bottom-auto sm:right-4 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-secondary border text-xs text-foreground shadow-sm hover:bg-secondary/80 transition-colors"
      aria-label={`Current plan: ${planName}. Click to manage or upgrade.`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
      <span className="font-medium">{planName}</span>
      <span className="opacity-70">·</span>
      <span className="underline underline-offset-2">Manage</span>
    </Link>
  );
};

export default PlanBadge;
import React from "react";
import PricingTable from "@/components/autumn/pricing-table";

export default function PricingPage() {
  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold">Choose your plan</h1>
        <p className="text-muted-foreground">Upgrade anytime. Manage billing from your account.</p>
      </div>
      <div className="max-w-5xl mx-auto w-full">
        <PricingTable />
      </div>
    </div>
  );
}
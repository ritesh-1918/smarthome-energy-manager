"use client";
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export default function PlannerPage() {
  const [monthlyKwh, setMonthlyKwh] = useState(300);
  const [budget, setBudget] = useState(60);
  const [peakShare, setPeakShare] = useState(30);

  const estCost = useMemo(() => (monthlyKwh * 0.2).toFixed(2), [monthlyKwh]);

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto grid gap-6">
      <h1 className="text-2xl font-semibold">Monthly Energy Plan</h1>
      <Card>
        <CardHeader>
          <CardTitle>Targets</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="kwh">Monthly kWh target</Label>
              <Input id="kwh" type="number" value={monthlyKwh} onChange={(e) => setMonthlyKwh(Number(e.target.value))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="budget">Monthly budget ($)</Label>
              <Input id="budget" type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
            </div>
            <div className="grid gap-2">
              <Label>Peak-hour usage share (%)</Label>
              <div className="px-2">
                <Slider value={[peakShare]} onValueChange={([v]) => setPeakShare(v)} max={100} step={1} />
              </div>
              <div className="text-sm text-muted-foreground">{peakShare}%</div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Estimated cost at $0.20/kWh: ${estCost}</div>
          <Button onClick={() => alert("Plan saved (demo)")}>Save Plan</Button>
        </CardContent>
      </Card>
    </div>
  );
}
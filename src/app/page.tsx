"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { authClient, useSession } from "@/lib/auth-client";
import { useCustomer } from "autumn-js/react";

// Simple formatter for timestamps
function fmtTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// Client-side simulator to keep charts lively even without a device posting
function useSimulatedTelemetry(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(async () => {
      const t = Date.now();
      // basic wave + noise
      const voltage = 230 + Math.sin(t / 3000) * 5 + (Math.random() - 0.5) * 1.5;
      const current = 2 + Math.sin(t / 2000) * 0.8 + Math.random() * 0.3;
      const power = voltage * current;
      const token = localStorage.getItem("bearer_token");
      await fetch("/api/telemetry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ts: t, voltage, current, power }),
      }).catch(() => {});
    }, 1000);
    return () => clearInterval(id);
  }, [enabled]);
}

export default function DashboardPage() {
  const { data: session, isPending, refetch } = useSession();
  const { customer } = useCustomer();
  const [metric, setMetric] = useState("power");
  const [data, setData] = useState<Array<{ ts: number; voltage: number; current: number; power: number; energy?: number }>>([]);

  async function handleLogout() {
    const { error } = await authClient.signOut();
    if (!error?.code) {
      localStorage.removeItem("bearer_token");
      refetch();
    }
  }

  // Enable simulator only for unauthenticated quick demo
  useSimulatedTelemetry(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/telemetry", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (!cancelled) setData(json.data || []);
    };
    load();
    const id = setInterval(load, 2000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const latest = data.at(-1);
  const avgPower = useMemo(() => {
    if (!data.length) return 0;
    return data.reduce((a, b) => a + (b.power || 0), 0) / data.length;
  }, [data]);

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Top nav */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1000&auto=format&fit=crop" alt="logo" className="h-8 w-8 rounded" />
          <h1 className="text-xl font-semibold">Smart Home Energy Manager</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Plan badge */}
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-secondary border">
            {customer?.products?.[0]?.name || "Free Plan"}
          </span>
          <Link href="/planner"><Button variant="secondary">Planner</Button></Link>
          <Link href="/chatbot"><Button variant="secondary">Advisor</Button></Link>
          <Link href="/profile"><Button variant="secondary">Profile</Button></Link>
          <Link href="/pricing"><Button variant="secondary">Pricing</Button></Link>
          {session?.user ? (
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          ) : (
            <>
              <Link href="/login"><Button variant="outline">Login</Button></Link>
              <Link href="/register"><Button>Register</Button></Link>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Voltage (V)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-mono">{latest ? latest.voltage.toFixed(1) : "--"}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Current (A)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-mono">{latest ? latest.current.toFixed(2) : "--"}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Power (W)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-mono">{latest ? latest.power.toFixed(1) : "--"}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg Power (W)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-mono">{avgPower.toFixed(1)}</CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="flex items-center justify-between gap-4">
          <CardTitle>Live Telemetry</CardTitle>
          <Select value={metric} onValueChange={(v) => setMetric(v)}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select metric" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="power">Power (W)</SelectItem>
              <SelectItem value="voltage">Voltage (V)</SelectItem>
              <SelectItem value="current">Current (A)</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="ts" tickFormatter={fmtTime} stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={["auto", "auto"]} />
                <Tooltip labelFormatter={(v) => fmtTime(Number(v))} />
                <Line type="monotone" dataKey={metric} stroke="hsl(var(--primary))" dot={false} strokeWidth={2} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ESP32 Integration Help */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>ESP32 HTTP Post (example)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-3 rounded overflow-auto">
{`POST https://your-host/api/telemetry
Content-Type: application/json

{"ts": 1737939000000, "voltage": 230.1, "current": 1.95, "power": 448.7}`}
            </pre>
            <p className="text-sm text-muted-foreground mt-2">Send a JSON body every second from your ESP32.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ESP32 Arduino Snippet</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-3 rounded overflow-auto">
{`// Pseudo-code
void loop(){
  float voltage = readVoltage();
  float current = readCurrent();
  float power = voltage * current;
  http.post("/api/telemetry", {"voltage": voltage, "current": current, "power": power});
  delay(1000);
}`}
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-2">
        <Link href="/planner"><Button variant="secondary">Monthly Planner</Button></Link>
        <Link href="/chatbot"><Button variant="secondary">Energy Advisor</Button></Link>
        <Link href="/profile"><Button variant="secondary">Profile</Button></Link>
        <Link href="/pricing"><Button variant="secondary">Pricing</Button></Link>
      </div>
    </div>
  );
}
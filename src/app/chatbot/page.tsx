"use client";
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/state/AuthContext";

// Simple local rule-based assistant for demo (no external API keys needed)
function getAdvice(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("peak") || p.includes("time of use")) {
    return "Consider shifting heavy loads (EV charging, laundry, dishwashing) to off-peak hours. Use the planner page to reduce your peak-hour share below 30%.";
  }
  if (p.includes("ac") || p.includes("hvac") || p.includes("cool")) {
    return "Set HVAC to 24°C/75°F in summer and 20°C/68°F in winter. Clean filters monthly and use ceiling fans to feel cooler at higher setpoints.";
  }
  if (p.includes("solar") || p.includes("pv")) {
    return "If you have solar, run energy-intensive tasks during solar production windows and consider storing surplus in a battery if available.";
  }
  if (p.includes("standby") || p.includes("vampire") || p.includes("plug")) {
    return "Use smart plugs to cut standby loads from TVs, consoles, and chargers. Group them and schedule off-hours shutoff.";
  }
  return "Reduce base load by auditing always-on devices. Use smart scheduling and prefer efficient appliances. Ask about peak hours, HVAC, or solar for tailored tips.";
}

export default function ChatbotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: "Hi" + (user?.name ? `, ${user.name}` : "") + "! I'm your Energy Advisor. Ask me how to cut costs or optimize usage." },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    // Simulate streaming answer
    const reply = getAdvice(text);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    }, 300);
  }

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto grid gap-4">
      <h1 className="text-2xl font-semibold">Energy Advisor</h1>
      <Card className="h-[70vh] flex flex-col">
        <CardHeader>
          <CardTitle>Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-3">
          <ScrollArea className="flex-1 rounded border p-3">
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "assistant" ? "bg-secondary/60 rounded p-2" : "text-right"}>
                  <span className="text-sm whitespace-pre-wrap">{m.content}</span>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          </ScrollArea>
          <div className="flex gap-2">
            <Input placeholder="Ask about peak hours, HVAC, solar..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
            <Button onClick={send}>Send</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
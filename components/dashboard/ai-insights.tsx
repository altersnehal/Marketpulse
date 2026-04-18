"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { aiInsights } from "@/lib/mock-data"

const TYPE_INDICATOR: Record<string, { dot: string; label: string }> = {
  warning: { dot: "bg-[var(--warning)]",  label: "Warning"     },
  success: { dot: "bg-[var(--positive)]", label: "Opportunity" },
  info:    { dot: "bg-primary",            label: "Info"        },
}

const CHANNEL_COLORS: Record<string, string> = {
  "Paid Search":  "#4285F4",
  "Email":        "#D97706",
  "Organic SEO":  "#16A34A",
  "Paid Social":  "#1877F2",
}

export function AiInsights() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Weekly Briefing</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">April 12, 2026</p>
        </div>
        <button
          onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1200) }}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Insights list */}
      <div className="flex flex-col divide-y divide-border">
        {aiInsights.map((insight) => {
          const ind = TYPE_INDICATOR[insight.type] ?? TYPE_INDICATOR.info
          const channelColor = CHANNEL_COLORS[insight.channel] ?? "#6B7280"

          return (
            <div key={insight.id} className="px-5 py-4">
              {/* Top row: type dot + label + metric badge */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${ind.dot}`} />
                  <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wide">
                    {ind.label}
                  </span>
                </div>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{
                    background: insight.type === "success"
                      ? "oklch(0.52 0.16 148 / 0.1)"
                      : insight.type === "warning"
                      ? "oklch(0.63 0.17 65 / 0.1)"
                      : "oklch(0.57 0.13 188 / 0.1)",
                    color: insight.type === "success"
                      ? "var(--positive)"
                      : insight.type === "warning"
                      ? "var(--warning)"
                      : "var(--primary)",
                  }}
                >
                  {insight.metric}
                </span>
              </div>

              {/* Headline */}
              <p className="text-[13px] font-semibold text-foreground leading-snug mb-1.5">
                {insight.title}
              </p>

              {/* Body */}
              <p className="text-[11.5px] text-muted-foreground leading-relaxed mb-2.5">
                {insight.body}
              </p>

              {/* Footer: channel chip + time */}
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                  style={{ background: channelColor }}
                >
                  {insight.channel}
                </span>
                <span className="text-[10px] text-muted-foreground/60">{insight.time}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary strip */}
      <div className="mt-auto px-5 py-3.5 bg-secondary/40 border-t border-border rounded-b-xl">
        <p className="text-[11.5px] text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Summary — </span>
          Revenue up 18.7%. Email is highest-ROI channel. Action needed: Google Ads CTR, LinkedIn pacing.
        </p>
      </div>
    </div>
  )
}

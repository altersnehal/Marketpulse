"use client"

import { useState } from "react"
import { channelData } from "@/lib/mock-data"
import { ChevronDown, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useApp } from "@/lib/app-context"

// Channel brand identity - Minimalist approach
const CHANNEL_CONFIG: Record<string, { color: string; bg: string; abbr: string }> = {
  "Paid Search":    { color: "var(--primary)", bg: "oklch(0.55 0.22 264 / 0.1)", abbr: "G"  },
  "Organic SEO":    { color: "var(--chart-2)", bg: "oklch(0.65 0.18 160 / 0.1)", abbr: "Se" },
  "Email":          { color: "var(--chart-3)", bg: "oklch(0.65 0.20 40 / 0.1)", abbr: "Em" },
  "Paid Social":    { color: "var(--chart-4)", bg: "oklch(0.60 0.20 300 / 0.1)", abbr: "M"  },
  "Organic Social": { color: "var(--chart-5)", bg: "oklch(0.75 0.15 85 / 0.1)", abbr: "IG" },
  "Referral":       { color: "var(--muted-foreground)", bg: "var(--secondary)", abbr: "Re" },
}

type Metric = "cost" | "revenue" | "conversions"

export function ChannelBreakdown() {
  const { dateRange, channel: globalChannel } = useApp()
  const [metric, setMetric] = useState<Metric>("cost")

  const dateScale = dateRange === "Last 7 days" ? 0.25 : dateRange === "Last 14 days" ? 0.5 : dateRange === "Last 90 days" ? 3 : dateRange === "This quarter" ? 2.5 : 1

  // Filter channels based on global filter, and scale data based on dateRange
  const displayData = channelData
    .filter(row => globalChannel === "All Channels" || row.channel === globalChannel)
    .map(row => ({
      ...row,
      cost: row.cost * dateScale,
      revenue: row.revenue * dateScale,
      conversions: row.conversions * dateScale,
    }))

  // Sort by selected metric descending
  const sorted = [...displayData].sort((a, b) => b[metric] - a[metric])
  const maxVal = sorted[0]?.[metric] || 1
  const topChannel = sorted[0]?.channel

  const formatValue = (val: number, m: Metric) => {
    if (m === "cost" || m === "revenue") return val > 0 ? `$${(val / 1000).toFixed(0)}k` : "—"
    return val > 0 ? val.toLocaleString() : "—"
  }

  const getMetricLabel = (m: Metric) => {
    if (m === "cost") return "Spend"
    if (m === "revenue") return "Revenue"
    return "Conversions"
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{getMetricLabel(metric)} by Channel</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Total performance &middot; {dateRange}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 bg-secondary rounded-md border border-border">
              {getMetricLabel(metric)}
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            {(["cost", "revenue", "conversions"] as Metric[]).map((m) => (
              <DropdownMenuItem key={m} onClick={() => setMetric(m)} className="text-xs cursor-pointer gap-2">
                {m === metric && <Check className="h-3 w-3 text-primary" />}
                <span className={m === metric ? "text-primary font-medium" : ""}>{getMetricLabel(m)}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-3.5 flex-1">
        {sorted.map((row) => {
          const cfg = CHANNEL_CONFIG[row.channel]
          const val = row[metric]
          const pct = val > 0 ? (val / maxVal) * 100 : 0
          const roas = row.cost > 0 ? (row.revenue / row.cost).toFixed(1) : "—"
          const isTop = row.channel === topChannel && val > 0

          return (
            <div key={row.channel} className="flex items-center gap-3">
              {/* Channel logo */}
              <div
                className="h-7 w-7 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{ background: cfg?.bg, color: cfg?.color }}
              >
                {cfg?.abbr}
              </div>

              {/* Bar + label */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-medium text-foreground truncate">{row.channel}</span>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {isTop && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                        style={{ background: cfg?.color }}
                      >
                        TOP
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-foreground tabular-nums">
                      {formatValue(val, metric)}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: cfg?.color }}
                  />
                </div>
              </div>

              {/* Extra metric badge */}
              <div className="flex-shrink-0 w-14 text-right">
                <span className="text-[11px] text-muted-foreground">
                  {metric === "cost" ? (
                    row.cost > 0 ? (
                      <><span className="font-semibold text-foreground">{roas}x</span><span className="text-[10px]"> ROAS</span></>
                    ) : <span className="text-[10px]">organic</span>
                  ) : metric === "revenue" ? (
                     <><span className="font-semibold text-foreground">{row.conversions.toLocaleString()}</span><span className="text-[10px]"> cv</span></>
                  ) : (
                     <><span className="font-semibold text-foreground">${row.cost > 0 ? (row.cost/row.conversions).toFixed(0) : "0"}</span><span className="text-[10px]"> CPA</span></>
                  )}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer totals */}
      <div className="mt-5 pt-4 border-t border-border grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">Total Spend</p>
          <p className="text-[15px] font-bold text-foreground">
            ${(displayData.reduce((s, r) => s + r.cost, 0) / 1000).toFixed(0)}k
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">Blended ROAS</p>
          <p className="text-[15px] font-bold text-foreground">
            {displayData.length > 0 && displayData.some(r => r.cost > 0) ? (
              displayData.reduce((s, r) => s + r.revenue, 0) /
              displayData.filter((r) => r.cost > 0).reduce((s, r) => s + r.cost, 0)
            ).toFixed(1) : "—"}x
          </p>
        </div>
      </div>
    </div>
  )
}

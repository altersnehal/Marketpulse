"use client"

import { funnelData } from "@/lib/mock-data"
import { useApp } from "@/lib/app-context"

// Monochromatic minimalist primary shades
const STAGE_COLORS = ["var(--primary)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]

export function FunnelChart() {
  const { dateRange } = useApp()
  const dateScale = dateRange === "Last 7 days" ? 0.25 : dateRange === "Last 14 days" ? 0.5 : dateRange === "Last 90 days" ? 3 : dateRange === "This quarter" ? 2.5 : 1

  const scaledData = funnelData.map(d => ({
    ...d,
    value: Math.round(d.value * dateScale)
  }))

  const max = scaledData[0].value

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col h-full">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-foreground">Funnel Conversion Breakdown</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Impressions → Sales &middot; {dateRange}</p>
      </div>

      {/* Vertical columns */}
      <div className="flex gap-3 flex-1" style={{ minHeight: 200 }}>
        {scaledData.map((stage, i) => {
          const fillPct = (stage.value / max) * 100
          const hatchPct = 100 - fillPct
          const nextStage = scaledData[i + 1]
          const dropPct = nextStage
            ? (((stage.value - nextStage.value) / stage.value) * 100).toFixed(1)
            : null

          return (
            <div key={stage.stage} className="relative flex-1 flex flex-col" style={{ height: 200 }}>
              {/* Hatched top area */}
              <div
                className="w-full flex-shrink-0"
                style={{
                  height: `${hatchPct}%`,
                  backgroundImage:
                    "repeating-linear-gradient(-45deg, #e8eaed 0, #e8eaed 1px, transparent 1px, transparent 6px)",
                  borderRadius: "6px 6px 0 0",
                }}
              />

              {/* Drop-off badge — sits at junction of hatch and fill */}
              {dropPct && (
                <div
                  className="absolute left-1/2 z-10 pointer-events-none"
                  style={{
                    top: `${hatchPct}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <span className="flex items-center gap-0.5 bg-card border border-border text-muted-foreground text-[9.5px] font-bold px-2 py-[3px] rounded-full shadow-sm whitespace-nowrap leading-none">
                    ▼ {dropPct}%
                  </span>
                </div>
              )}

              {/* Filled bottom area */}
              <div
                className="w-full flex-shrink-0"
                style={{
                  height: `${fillPct}%`,
                  background: STAGE_COLORS[i],
                  opacity: 0.85 + i * 0.05,
                  borderRadius: i === funnelData.length - 1 ? "0 0 4px 4px" : "0",
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Stage labels + values */}
      <div className="flex gap-3 mt-3">
        {scaledData.map((stage) => (
          <div key={stage.stage} className="flex-1 text-center">
            <p className="text-[13px] font-bold text-foreground tabular-nums leading-none">
              {stage.value >= 1000000
                ? `${(stage.value / 1000000).toFixed(1)}M`
                : stage.value >= 1000
                ? `${(stage.value / 1000).toFixed(0)}k`
                : stage.value.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{stage.stage}</p>
          </div>
        ))}
      </div>

      {/* Summary row */}
      <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Click Rate",  val: "6.9%" },
          { label: "Lead Rate",   val: "24.1%" },
          { label: "Close Rate",  val: "18.9%" },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-[15px] font-bold text-foreground">{s.val}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

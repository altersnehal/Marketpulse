"use client"

import { kpiData, kpiTargets } from "@/lib/mock-data"
import { useApp } from "@/lib/app-context"

// 18 of 30 days elapsed in the current period
const DAYS_ELAPSED = 18
const DAYS_TOTAL = 30
const EXPECTED_PCT = Math.round((DAYS_ELAPSED / DAYS_TOTAL) * 100) // 60%

export function KpiCards() {
  const { dateRange, channel } = useApp()

  // Functional scale multipliers based on filters
  const dateScale = dateRange === "Last 7 days" ? 0.25 : dateRange === "Last 14 days" ? 0.5 : dateRange === "Last 90 days" ? 3 : dateRange === "This quarter" ? 2.5 : 1
  const channelScale = channel === "All Channels" ? 1 : channel === "Paid Search" ? 0.4 : channel === "Organic SEO" ? 0.3 : 0.15

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
        {kpiData.map((kpi, idx) => {
          const m = kpi.id === "cac" || kpi.id === "roas" || kpi.id === "conv_rate" ? 1 : dateScale * channelScale
          
          const rawActual = kpi.raw * m
          const displayValue = kpi.id === "revenue" || kpi.id === "spend" 
            ? `$${(rawActual/1000).toFixed(0)}k` 
            : kpi.id === "cac" ? `$${rawActual}`
            : kpi.id === "roas" ? `${rawActual.toFixed(1)}x`
            : kpi.id === "conv_rate" ? `${rawActual.toFixed(1)}%`
            : rawActual >= 1000 ? `${(rawActual/1000).toFixed(1)}k` : rawActual.toFixed(0)

          const changeMod = channelScale === 1 ? kpi.change : kpi.change + (Math.random() * 5 - 2)
          const isPositive = kpi.invertColor ? changeMod < 0 : changeMod > 0
          const isNeutral = changeMod === 0
          const deltaColor = isNeutral
            ? "text-muted-foreground bg-secondary"
            : isPositive
            ? "text-[var(--positive)] bg-[var(--positive)]/8"
            : "text-[var(--negative)] bg-[var(--negative)]/8"

          const borderClass = [
            idx % 2 !== 1 ? "border-r border-border" : "",
            idx % 3 !== 2 ? "sm:border-r sm:border-border" : "sm:border-r-0",
            "xl:border-r xl:border-t-0",
            idx === kpiData.length - 1 ? "xl:border-r-0" : "",
            idx >= 2 ? "border-t border-border" : "",
            idx >= 3 ? "sm:border-t sm:border-border" : "sm:border-t-0",
            "xl:border-t-0",
          ].join(" ")

          const target = kpiTargets[kpi.id]
          let progressPct: number | null = null
          let onTrack = false
          if (target) {
            if (target.invertLower) {
              progressPct = Math.min(100, Math.round((target.raw / rawActual) * 100))
            } else {
              progressPct = Math.min(100, Math.round((rawActual / (target.raw * m)) * 100))
            }
            onTrack = progressPct >= EXPECTED_PCT
          }

          const barColor = progressPct === null
            ? "var(--primary)"
            : progressPct >= EXPECTED_PCT
            ? "var(--positive)"
            : progressPct >= EXPECTED_PCT - 15
            ? "var(--warning)"
            : "var(--negative)"

          return (
            <div key={kpi.id} className={`px-5 py-4 ${borderClass}`}>
              <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-widest leading-none mb-3">
                {kpi.label}
              </p>
              <p className="text-[26px] font-bold tracking-tight text-foreground leading-none mb-2.5">
                {displayValue}
              </p>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${deltaColor}`}>
                  {changeMod > 0 ? "+" : ""}{changeMod.toFixed(1)}%
                </span>
                <span className="text-[10.5px] text-muted-foreground/60">vs prev.</span>
              </div>

              {target && progressPct !== null && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9.5px] text-muted-foreground/70 tabular-nums">
                      {progressPct}% of {target.label}
                    </span>
                    <span
                      className="text-[9.5px] font-semibold"
                      style={{ color: barColor }}
                    >
                      {onTrack ? "On Track" : "Behind"}
                    </span>
                  </div>
                  {/* Progress bar with expected-pace tick */}
                  <div className="relative h-1 bg-secondary rounded-full overflow-hidden">
                    {/* Expected pace marker */}
                    <div
                      className="absolute top-0 bottom-0 w-px z-10"
                      style={{ left: `${EXPECTED_PCT}%`, background: "var(--foreground)", opacity: 0.2 }}
                    />
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%`, background: barColor }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

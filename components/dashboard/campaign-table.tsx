"use client"

import { useState, Fragment } from "react"
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronRight as Expand,
  Download,
} from "lucide-react"
import { campaignData, aiInsights, campaignBudgets } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/app-context"

type SortKey = keyof (typeof campaignData)[0]
type SortDir = "asc" | "desc" | null

const STATUS_STYLES: Record<string, string> = {
  Active:    "bg-[var(--positive)]/10 text-[var(--positive)]",
  Paused:    "bg-[var(--warning)]/10 text-[var(--warning)]",
  Completed: "bg-secondary text-muted-foreground",
}

const CHANNEL_CONFIG: Record<string, { color: string; bg: string; abbr: string }> = {
  "Paid Search":  { color: "var(--primary)", bg: "oklch(0.55 0.22 264 / 0.1)", abbr: "G" },
  "Paid Social":  { color: "var(--chart-4)", bg: "oklch(0.60 0.20 300 / 0.1)", abbr: "M" },
  "Email":        { color: "var(--chart-3)", bg: "oklch(0.65 0.20 40 / 0.1)", abbr: "Em" },
  "Organic SEO":  { color: "var(--chart-2)", bg: "oklch(0.65 0.18 160 / 0.1)", abbr: "Se" },
  "Referral":     { color: "var(--muted-foreground)", bg: "var(--secondary)", abbr: "Re" },
}

const TRENDS: Record<number, number[]> = {
  1: [68, 72, 75, 71, 78, 82, 87],
  2: [52, 48, 45, 43, 40, 38, 35],
  3: [88, 91, 95, 93, 98, 102, 108],
  4: [71, 75, 80, 77, 83, 88, 93],
  5: [60, 57, 53, 50, 47, 44, 41],
  6: [40, 37, 34, 31, 29, 26, 24],
  7: [74, 79, 76, 82, 86, 90, 95],
  8: [65, 68, 72, 69, 65, 62, 58],
}

const CAMPAIGN_INSIGHTS: Record<number, { text: string; type: "warning" | "info" | "success" }> = {
  2: { text: "Performance drop likely caused by increased CPM on Meta — creative fatigue suspected.", type: "warning" },
  6: { text: "LinkedIn ROAS below 3x target with 10 days left. Consider pausing or reducing daily budget.", type: "warning" },
}

type HealthStatus = "on-track" | "over-pacing" | "at-risk" | "critical"

function getCampaignHealth(roas: number, budgetId: number): HealthStatus | null {
  const b = campaignBudgets[budgetId]
  if (!b) return null
  const spentPct = b.spent / b.monthly
  const expectedPct = b.daysElapsed / b.daysTotal
  const roasOk = roas >= b.roasTarget * 0.8
  const overPacing = spentPct > expectedPct + 0.12

  if (!roasOk && overPacing) return "critical"
  if (!roasOk) return "at-risk"
  if (overPacing) return "over-pacing"
  return "on-track"
}

const HEALTH_STYLES: Record<HealthStatus, { label: string; dot: string; text: string; bg: string }> = {
  "on-track":    { label: "On Track",    dot: "bg-[var(--positive)]", text: "text-[var(--positive)]", bg: "bg-[var(--positive)]/8" },
  "over-pacing": { label: "Over Pacing", dot: "bg-[var(--warning)]",  text: "text-[var(--warning)]",  bg: "bg-[var(--warning)]/8"  },
  "at-risk":     { label: "At Risk",     dot: "bg-[var(--negative)]", text: "text-[var(--negative)]", bg: "bg-[var(--negative)]/8" },
  "critical":    { label: "Critical",    dot: "bg-[var(--negative)]", text: "text-[var(--negative)]", bg: "bg-[var(--negative)]/8" },
}

function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const color = up ? "var(--positive)" : "var(--negative)"

  return (
    <div className="flex items-end gap-[2px] h-7 w-[52px]">
      {data.map((v, i) => {
        const isLast = i === data.length - 1
        return (
          <div
            key={i}
            className="flex-1 rounded-[1px] min-h-[2px]"
            style={{
              height: `${Math.max(8, ((v - min) / range) * 100)}%`,
              backgroundColor: isLast ? color : "var(--border)",
              opacity: isLast ? 1 : 0.45 + (i / data.length) * 0.45,
            }}
          />
        )
      })}
    </div>
  )
}

// Mini horizontal budget bar
function BudgetBar({ id }: { id: number }) {
  const b = campaignBudgets[id]
  if (!b) return null
  const spentPct = Math.min(100, Math.round((b.spent / b.monthly) * 100))
  const expectedPct = Math.round((b.daysElapsed / b.daysTotal) * 100)
  const overPacing = spentPct > expectedPct + 12
  const barColor = overPacing ? "var(--warning)" : "var(--positive)"

  return (
    <div className="w-[56px]">
      <div className="text-[9.5px] text-muted-foreground/70 tabular-nums mb-0.5 text-right">
        {spentPct}%
      </div>
      <div className="relative h-1 bg-secondary rounded-full overflow-hidden">
        <div
          className="absolute top-0 bottom-0 w-px z-10"
          style={{ left: `${expectedPct}%`, background: "var(--foreground)", opacity: 0.25 }}
        />
        <div
          className="h-full rounded-full"
          style={{ width: `${spentPct}%`, background: barColor }}
        />
      </div>
    </div>
  )
}

const PAGE_SIZE = 5

export function CampaignTable() {
  const { dateRange, channel: globalChannel } = useApp()
  const [sortKey, setSortKey] = useState<SortKey>("roas")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState<number | null>(null)

  const dateScale = dateRange === "Last 7 days" ? 0.25 : dateRange === "Last 14 days" ? 0.5 : dateRange === "Last 90 days" ? 3 : dateRange === "This quarter" ? 2.5 : 1

  const displayData = campaignData
    .filter(row => globalChannel === "All Channels" || row.channel === globalChannel)
    .map(row => ({
      ...row,
      impressions: row.impressions * dateScale,
      clicks: row.clicks * dateScale,
      conversions: row.conversions * dateScale,
      cost: row.cost * dateScale,
    }))

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const sorted = [...displayData].sort((a, b) => {
    if (!sortDir) return 0
    const va = a[sortKey], vb = b[sortKey]
    const mult = sortDir === "asc" ? 1 : -1
    return typeof va === "number" && typeof vb === "number"
      ? (va - vb) * mult
      : String(va).localeCompare(String(vb)) * mult
  })

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronsUpDown className="h-3 w-3 text-muted-foreground/40" />
    if (sortDir === "asc") return <ChevronUp className="h-3 w-3 text-primary" />
    if (sortDir === "desc") return <ChevronDown className="h-3 w-3 text-primary" />
    return <ChevronsUpDown className="h-3 w-3 text-muted-foreground/40" />
  }

  const cols: { key: SortKey; label: string; align?: string }[] = [
    { key: "name",        label: "Campaign" },
    { key: "channel",     label: "Channel" },
    { key: "status",      label: "Status" },
    { key: "impressions", label: "Impr.",  align: "text-right" },
    { key: "clicks",      label: "Clicks", align: "text-right" },
    { key: "ctr",         label: "CTR",    align: "text-right" },
    { key: "conversions", label: "Conv.",  align: "text-right" },
    { key: "cost",        label: "Spend",  align: "text-right" },
    { key: "roas",        label: "ROAS",   align: "text-right" },
  ]

  // Count campaigns needing attention
  const attentionCount = displayData.filter((c) => {
    const h = getCampaignHealth(c.roas, c.id)
    return h === "at-risk" || h === "critical"
  }).length

  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">Campaign Insights</h2>
            {attentionCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[var(--negative)]/10 text-[var(--negative)]">
                {attentionCount} need attention
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{displayData.length} campaigns · click row to expand · {dateRange}</p>
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
          <Download className="h-3 w-3" />
          Export
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              {cols.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-medium text-muted-foreground whitespace-nowrap cursor-pointer hover:text-foreground select-none ${col.align ?? "text-left"}`}
                  onClick={() => handleSort(col.key)}
                >
                  <div className={`flex items-center gap-1 ${col.align === "text-right" ? "justify-end" : ""}`}>
                    {col.label}
                    <SortIcon k={col.key} />
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 font-medium text-muted-foreground text-right whitespace-nowrap">Trend</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-right whitespace-nowrap">Budget</th>
              <th className="px-3 py-3 w-6" />
            </tr>
          </thead>
          <tbody>
            {paginated.map((row) => {
              const isExpanded = expanded === row.id
              const trend = TRENDS[row.id] ?? [50, 52, 51, 53, 54, 53, 55]
              const trendUp = trend[trend.length - 1] >= trend[0]
              const roasColor =
                row.roas >= 4 ? "text-[var(--positive)] font-bold"
                : row.roas >= 2 ? "text-[var(--warning)] font-semibold"
                : "text-[var(--negative)] font-semibold"
              const insight = CAMPAIGN_INSIGHTS[row.id]
              const cfg = CHANNEL_CONFIG[row.channel]
              const health = getCampaignHealth(row.roas, row.id)
              const healthStyle = health ? HEALTH_STYLES[health] : null

              return (
                <Fragment key={row.id}>
                  <tr
                    key={row.id}
                    className={`border-b border-border/60 hover:bg-secondary/30 cursor-pointer transition-colors ${isExpanded ? "bg-secondary/20" : ""}`}
                    onClick={() => setExpanded(isExpanded ? null : row.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {healthStyle && (health === "at-risk" || health === "critical") && (
                          <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${healthStyle.dot}`} />
                        )}
                        <span className="text-foreground font-medium line-clamp-1 max-w-[180px] block">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-5 w-5 rounded flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                          style={{ background: cfg?.bg, color: cfg?.color }}
                        >
                          {cfg?.abbr}
                        </span>
                        <span className="text-muted-foreground whitespace-nowrap hidden lg:block">{row.channel}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_STYLES[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{(row.impressions / 1000).toFixed(0)}k</td>
                    <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{(row.clicks / 1000).toFixed(1)}k</td>
                    <td className="px-4 py-3 text-right text-foreground tabular-nums">{row.ctr}%</td>
                    <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{row.conversions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">${(row.cost / 1000).toFixed(1)}k</td>
                    <td className={`px-4 py-3 text-right tabular-nums ${roasColor}`}>{row.roas}x</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Sparkline data={trend} up={trendUp} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <BudgetBar id={row.id} />
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-muted-foreground/40 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr key={`${row.id}-insight`} className="border-b border-border/60 bg-secondary/20">
                      <td colSpan={12} className="px-5 py-3">
                        <div className="flex items-start gap-4 flex-wrap">
                          {/* Insight text */}
                          <div className="flex items-start gap-2 flex-1 min-w-[200px]">
                            {insight ? (
                              <>
                                <span className={`mt-0.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${insight.type === "warning" ? "bg-[var(--warning)]" : "bg-primary"}`} />
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-semibold text-foreground">Insight: </span>
                                  {insight.text}
                                </p>
                              </>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                <span className="font-semibold text-foreground">Performance: </span>
                                {row.roas >= 4
                                  ? `Strong ROAS of ${row.roas}x — consider scaling budget to capture more volume.`
                                  : row.roas >= 2
                                  ? `Moderate ROAS of ${row.roas}x. Monitor CTR trends before increasing spend.`
                                  : `ROAS of ${row.roas}x is below target. Review targeting and creatives.`}
                              </p>
                            )}
                          </div>

                          {/* Budget pacing detail */}
                          {campaignBudgets[row.id] && (() => {
                            const b = campaignBudgets[row.id]
                            const spentPct = Math.round((b.spent / b.monthly) * 100)
                            const expectedPct = Math.round((b.daysElapsed / b.daysTotal) * 100)
                            const remaining = b.monthly - b.spent
                            const daysLeft = b.daysTotal - b.daysElapsed
                            return (
                              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0 bg-secondary/60 rounded-lg px-3 py-2">
                                <div>
                                  <span className="text-[10px] uppercase tracking-wide font-semibold block mb-0.5">Budget Used</span>
                                  <span className="font-bold text-foreground tabular-nums">{spentPct}%</span>
                                  <span className="text-[10px] ml-1">(exp. {expectedPct}%)</span>
                                </div>
                                <div className="w-px h-6 bg-border" />
                                <div>
                                  <span className="text-[10px] uppercase tracking-wide font-semibold block mb-0.5">Remaining</span>
                                  <span className="font-bold text-foreground tabular-nums">${(remaining / 1000).toFixed(1)}k</span>
                                  <span className="text-[10px] ml-1">/ {daysLeft}d left</span>
                                </div>
                                <div className="w-px h-6 bg-border" />
                                <div>
                                  <span className="text-[10px] uppercase tracking-wide font-semibold block mb-0.5">ROAS Target</span>
                                  <span className={`font-bold tabular-nums ${row.roas >= b.roasTarget ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                                    {row.roas}x
                                  </span>
                                  <span className="text-[10px] ml-1">/ {b.roasTarget}x</span>
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-border">
        <span className="text-xs text-muted-foreground">
          {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, displayData.length)} of {displayData.length}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-7 w-7 rounded-md text-xs font-medium transition-colors ${
                page === i + 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

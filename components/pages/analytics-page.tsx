"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LabelList,
} from "recharts"
import { trendData, channelData, kpiTargets } from "@/lib/mock-data"
import { TrendingUp, TrendingDown, Users, MousePointerClick, Target, ArrowRight } from "lucide-react"
import { useApp } from "@/lib/app-context"

const METRICS = ["Traffic", "Leads", "Conversions"] as const
type Metric = (typeof METRICS)[number]

const METRIC_CONFIG: Record<Metric, { key: string; color: string; icon: React.ElementType; targetKey: string; dailyTarget: number }> = {
  Traffic:     { key: "traffic",     color: "#4f8ef7", icon: Users,            targetKey: "traffic",     dailyTarget: Math.round(3000000 / 30) },
  Leads:       { key: "leads",       color: "#34d9bc", icon: Target,           targetKey: "leads",       dailyTarget: Math.round(55000 / 30)   },
  Conversions: { key: "conversions", color: "#f5a623", icon: MousePointerClick, targetKey: "conversions", dailyTarget: Math.round(10000 / 30)  },
}

const TIME_TABS = ["7D", "30D", "90D", "YTD"] as const

// Annotated events that explain spikes/dips
const CHART_EVENTS: Record<string, { label: string; type: "spike" | "dip" | "launch" }> = {
  "Mar 13": { label: "Campaign launch",  type: "launch" },
  "Mar 25": { label: "Email blast",      type: "spike"  },
  "Apr 6":  { label: "SEO blog publish", type: "spike"  },
  "Apr 12": { label: "Landing page A/B", type: "launch" },
}

// Channel performance with ROAS
const channelChartData = channelData.map((c) => ({
  channel: c.channel.replace("Organic ", "Org. ").replace("Paid ", ""),
  cost:    c.cost,
  revenue: c.revenue,
  roas:    c.cost > 0 ? parseFloat((c.revenue / c.cost).toFixed(1)) : null,
}))

const CHANNEL_COLORS: Record<string, string> = {
  "Search":       "#4285F4",
  "SEO":          "#16A34A",
  "Email":        "#D97706",
  "Social":       "#1877F2",
  "Org. Social":  "#7C3AED",
  "Referral":     "#6B7280",
}

function StatCard({ label, value, change, icon: Icon, color, targetPct }: {
  label: string; value: string; change: number; icon: React.ElementType; color: string; targetPct?: number
}) {
  const positive = change >= 0
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className="h-7 w-7 rounded-md flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon className="h-3.5 w-3.5" style={{ color }} />
        </div>
      </div>
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <div className="flex items-center gap-1.5">
        {positive ? <TrendingUp className="h-3.5 w-3.5 text-[var(--positive)]" /> : <TrendingDown className="h-3.5 w-3.5 text-[var(--negative)]" />}
        <span className={`text-xs font-medium ${positive ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
          {positive ? "+" : ""}{change}%
        </span>
        <span className="text-xs text-muted-foreground">vs prev.</span>
      </div>
      {targetPct !== undefined && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9.5px] text-muted-foreground/70">{targetPct}% of target</span>
            <span className={`text-[9.5px] font-semibold ${targetPct >= 60 ? "text-[var(--positive)]" : "text-[var(--warning)]"}`}>
              {targetPct >= 60 ? "On Track" : "Behind"}
            </span>
          </div>
          <div className="relative h-1 bg-secondary rounded-full overflow-hidden">
            <div className="absolute top-0 bottom-0 w-px z-10" style={{ left: "60%", background: "var(--foreground)", opacity: 0.2 }} />
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${targetPct}%`, background: targetPct >= 60 ? "var(--positive)" : targetPct >= 45 ? "var(--warning)" : "var(--negative)" }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function CustomLineTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const event = CHART_EVENTS[label]
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-md text-xs min-w-[160px]">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {event && (
        <p className="text-[10px] text-primary font-medium mb-2 pb-2 border-b border-border">
          ★ {event.label}
        </p>
      )}
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: p.stroke }} />
            <span className="text-muted-foreground capitalize">{p.dataKey}</span>
          </div>
          <span className="font-semibold text-foreground tabular-nums">
            {p.value >= 1000 ? `${(p.value / 1000).toFixed(1)}k` : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function AnalyticsPage() {
  const [activeMetrics, setActiveMetrics] = useState<Metric[]>(["Traffic", "Leads", "Conversions"])
  const [timeTab, setTimeTab] = useState<(typeof TIME_TABS)[number]>("30D")
  const { can } = useApp()

  const toggleMetric = (m: Metric) =>
    setActiveMetrics((prev) => prev.includes(m) ? (prev.length > 1 ? prev.filter((x) => x !== m) : prev) : [...prev, m])

  // Determine which single metric's target to show as reference line (first active)
  const primaryMetric = activeMetrics[0]
  const primaryCfg    = METRIC_CONFIG[primaryMetric]

  return (
    <div className="px-5 lg:px-8 py-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-foreground">Analytics</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Performance vs targets · 18 of 30 days elapsed (60% of period)</p>
        </div>
        {can("exportReports") && (
          <button className="h-8 px-3 text-xs font-medium border border-border rounded-md bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
            Export Data
          </button>
        )}
      </div>

      {/* Stat row with target progress */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Sessions"          value="2.84M"   change={12.4} icon={Users}             color="#4f8ef7" targetPct={Math.round(2840000 / 3000000 * 100)} />
        <StatCard label="Leads Generated"   value="48,320"  change={8.1}  icon={Target}            color="#34d9bc" targetPct={Math.round(48320 / 55000 * 100)} />
        <StatCard label="Conversions"       value="9,142"   change={-3.2} icon={MousePointerClick}  color="#f5a623" targetPct={Math.round(9142 / 10000 * 100)} />
        <StatCard label="Avg. Session Dur." value="3m 42s"  change={5.7}  icon={TrendingUp}         color="#e05252" />
      </div>

      {/* Multi-line chart with target reference */}
      <div className="bg-card border border-border rounded-lg p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Performance Over Time</h2>
            <p className="text-[10.5px] text-muted-foreground mt-0.5">
              Dashed line = daily target ({primaryCfg.dailyTarget >= 1000 ? `${(primaryCfg.dailyTarget / 1000).toFixed(0)}k` : primaryCfg.dailyTarget} / day for {primaryMetric.toLowerCase()})
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-0.5 bg-secondary rounded-md p-0.5">
              {TIME_TABS.map((t) => (
                <button key={t} onClick={() => setTimeTab(t)} className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${timeTab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              {METRICS.map((m) => {
                const cfg = METRIC_CONFIG[m]
                const active = activeMetrics.includes(m)
                return (
                  <button
                    key={m}
                    onClick={() => toggleMetric(m)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${active ? "text-foreground border-transparent" : "text-muted-foreground border-border opacity-50"}`}
                    style={active ? { background: `${cfg.color}18`, borderColor: `${cfg.color}40` } : {}}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: cfg.color }} />
                    {m}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Event legend */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {Object.entries(CHART_EVENTS).map(([date, ev]) => (
            <div key={date} className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
              <span className="text-primary font-bold">★</span>
              <span>{date}: {ev.label}</span>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trendData} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
            <Tooltip content={<CustomLineTooltip />} />

            {/* Target reference line for primary metric */}
            <ReferenceLine
              y={primaryCfg.dailyTarget}
              stroke={primaryCfg.color}
              strokeDasharray="5 4"
              strokeWidth={1.5}
              strokeOpacity={0.5}
              label={{ value: `${primaryMetric} target`, position: "insideTopRight", fontSize: 10, fill: primaryCfg.color, opacity: 0.7 }}
            />

            {/* Event annotation lines */}
            {Object.entries(CHART_EVENTS).map(([date]) => (
              <ReferenceLine
                key={date}
                x={date}
                stroke="var(--primary)"
                strokeDasharray="2 3"
                strokeWidth={1}
                strokeOpacity={0.3}
              />
            ))}

            {activeMetrics.map((m) => (
              <Line
                key={m}
                type="monotone"
                dataKey={METRIC_CONFIG[m].key}
                stroke={METRIC_CONFIG[m].color}
                strokeWidth={2}
                dot={(props: any) => {
                  const event = CHART_EVENTS[props.payload?.date]
                  if (!event) return <g key={props.key} />
                  return (
                    <circle
                      key={props.key}
                      cx={props.cx}
                      cy={props.cy}
                      r={4}
                      fill={METRIC_CONFIG[m].color}
                      stroke="var(--card)"
                      strokeWidth={2}
                    />
                  )
                }}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Channel performance: Cost vs Revenue with ROAS */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Channel ROI Breakdown</h2>
            <p className="text-[10.5px] text-muted-foreground mt-0.5">Cost vs revenue per channel — ROAS shown above each pair</p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-border" />
              <span className="text-muted-foreground">Cost</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
              <span className="text-muted-foreground">Revenue</span>
            </div>
          </div>
        </div>

        {/* ROAS badges above chart */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {channelChartData.map((c) => (
            <div key={c.channel} className="flex items-center gap-1 text-[10px]">
              <span className="text-muted-foreground/70">{c.channel}:</span>
              {c.roas !== null ? (
                <span className={`font-bold ${c.roas >= 4 ? "text-[var(--positive)]" : c.roas >= 2 ? "text-[var(--warning)]" : "text-[var(--negative)]"}`}>
                  {c.roas}x
                </span>
              ) : (
                <span className="text-muted-foreground/50">organic</span>
              )}
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={channelChartData} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="channel" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: 11 }}
              formatter={(v: number, name: string) => [`$${(v / 1000).toFixed(0)}k`, name === "cost" ? "Cost" : "Revenue"]}
            />
            {/* 3x ROAS target reference: revenue = 3 × cost. We can't directly draw this, but add a note */}
            <Bar dataKey="cost" name="Cost" fill="var(--border)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="revenue" name="Revenue" fill="var(--primary)" radius={[3, 3, 0, 0]} fillOpacity={0.85} />
          </BarChart>
        </ResponsiveContainer>

        {/* Bottom insight */}
        <div className="mt-3 pt-3 border-t border-border flex items-start gap-2 text-xs text-muted-foreground">
          <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-primary" />
          <span>
            Email delivers the highest ROAS (<span className="font-semibold text-foreground">45x</span>) despite lowest spend.
            Paid Social channels are below the <span className="font-semibold text-foreground">3x target</span> — consider reallocating budget toward Email and Organic SEO.
          </span>
        </div>
      </div>
    </div>
  )
}

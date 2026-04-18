"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { trendData } from "@/lib/mock-data"
import { useApp } from "@/lib/app-context"

// Split traffic into paid (61%) and organic (39%) — two distinct stories
const baseChartData = trendData.map((d) => ({
  date: d.date,
  paid: Math.round(d.traffic * 0.61),
  organic: Math.round(d.traffic * 0.39),
}))

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-md text-xs min-w-[140px]">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: p.fill }} />
            <span className="text-muted-foreground capitalize">{p.dataKey}</span>
          </div>
          <span className="font-semibold text-foreground tabular-nums">
            {(p.value / 1000).toFixed(0)}k
          </span>
        </div>
      ))}
    </div>
  )
}

export function TrendCharts() {
  const { dateRange, channel } = useApp()

  // Functional scale multipliers based on filters
  const dateScale = dateRange === "Last 7 days" ? 0.25 : dateRange === "Last 14 days" ? 0.5 : dateRange === "Last 90 days" ? 3 : dateRange === "This quarter" ? 2.5 : 1
  const channelScale = channel === "All Channels" ? 1 : channel === "Paid Search" ? 0.4 : channel === "Organic SEO" ? 0.3 : 0.15

  // Sliced data based on dateScale
  const dataLen = Math.max(7, Math.floor(baseChartData.length * dateScale))
  const chartData = baseChartData.slice(-dataLen).map(d => ({
    date: d.date,
    paid: d.paid * channelScale,
    organic: d.organic * channelScale,
  }))

  const totalPaid = chartData.reduce((s, d) => s + d.paid, 0)
  const totalOrganic = chartData.reduce((s, d) => s + d.organic, 0)
  const totalTraffic = totalPaid + totalOrganic

  return (
    <div className="bg-card border border-border rounded-xl p-5 md:p-6 flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Contextual Content */}
      <div className="flex flex-col w-full lg:w-[320px] flex-shrink-0">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-foreground">Traffic Performance Trend</h2>
          <p className="text-xs text-muted-foreground mt-1">{dateRange}</p>
        </div>

        <div className="bg-secondary/50 rounded-xl p-4 border border-border mb-6">
          <p className="text-xs font-semibold text-foreground mb-1">Key Insight</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Paid traffic saw a significant surge following the mid-March campaign launch, while organic traffic remains stable with slight week-over-week growth.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Paid</span>
            </div>
            <p className="text-xl font-bold text-foreground">{(totalPaid / 1000).toFixed(0)}k</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{((totalPaid / totalTraffic) * 100).toFixed(0)}% of total</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--chart-2)" }} />
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Organic</span>
            </div>
            <p className="text-xl font-bold text-foreground">{(totalOrganic / 1000).toFixed(0)}k</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{((totalOrganic / totalTraffic) * 100).toFixed(0)}% of total</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-w-0 flex flex-col">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            {/* Daily target: 3M sessions / 30 days ≈ 100k/day total */}
            <ReferenceLine
              y={61000}
              stroke="var(--primary)"
              strokeDasharray="4 3"
              strokeWidth={1}
              strokeOpacity={0.5}
              label={{ value: "Paid target", position: "insideTopRight", fontSize: 10, fill: "var(--primary)", opacity: 0.8 }}
            />
            <defs>
              <linearGradient id="gradPaid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradOrganic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              dy={10}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="paid"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#gradPaid)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: "var(--primary)" }}
            />
            <Area
              type="monotone"
              dataKey="organic"
              stroke="var(--chart-2)"
              strokeWidth={2}
              fill="url(#gradOrganic)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: "var(--chart-2)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

"use client"

import React, { useState } from "react"
import { ArrowLeft, Check, CheckCircle2, BarChart2, PieChart, FileText, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

const SCHEDULES    = ["One-time", "Daily", "Weekly", "Bi-weekly", "Monthly"]
const REPORT_TYPES = ["Overview", "Channel", "Campaign", "Executive", "Analytics"]
const METRICS_LIST = ["Traffic", "Leads", "Conversions", "Revenue", "CTR", "ROAS", "CAC", "Spend"]

const TYPE_ICONS: Record<string, React.ElementType> = {
  Overview: BarChart2, Channel: PieChart, Campaign: FileText, Executive: BarChart2, Analytics: BarChart2,
}

const TEMPLATE_PRESETS = [
  { label: "Channel Overview",   type: "Channel",   desc: "Traffic and conversions by channel", icon: PieChart },
  { label: "Campaign Digest",    type: "Campaign",  desc: "Top campaigns ranked by ROAS",       icon: FileText },
  { label: "Executive Summary",  type: "Executive", desc: "High-level KPIs for leadership",     icon: BarChart2 },
  { label: "Attribution Report", type: "Analytics", desc: "Multi-touch attribution breakdown",  icon: BarChart2 },
]

const EMPTY_FORM = {
  name: "", type: "Overview", schedule: "Weekly",
  recipients: "", metrics: [] as string[], description: "", includeChart: true,
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-1.5">
      <label className="text-xs font-medium text-muted-foreground">{children}</label>
      {hint && <span className="text-[10px] text-muted-foreground/60">{hint}</span>}
    </div>
  )
}

interface NewReportPageProps {
  onBack: () => void
  onCreate: () => void
  prefill?: { label: string; type: string } | null
}

export function NewReportPage({ onBack, onCreate, prefill }: NewReportPageProps) {
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    name: prefill?.label ?? "",
    type: prefill?.type ?? "Overview",
  })
  const [created, setCreated] = useState(false)

  const patch = (p: Partial<typeof EMPTY_FORM>) => setForm(f => ({ ...f, ...p }))
  const toggleMetric = (m: string) =>
    patch({ metrics: form.metrics.includes(m) ? form.metrics.filter(x => x !== m) : [...form.metrics, m] })

  const TypeIcon = TYPE_ICONS[form.type] ?? FileText
  const canCreate = !!(form.name && form.metrics.length > 0)

  const handleCreate = () => {
    setCreated(true)
    setTimeout(() => onCreate(), 1500)
  }

  if (created) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-6">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Send className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-1">Report Created!</h2>
          <p className="text-sm text-muted-foreground">"{form.name}" has been added to your reports.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 lg:px-8 py-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Create New Report</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {prefill ? `Based on template: ${prefill.label}` : "Configure a new scheduled or on-demand report"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── Left: form ── */}
        <div className="xl:col-span-2 flex flex-col gap-5">

          {/* Basics */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-sm font-semibold text-foreground mb-4">Report Details</p>
            <div className="flex flex-col gap-4">
              <div>
                <FieldLabel>Report Name *</FieldLabel>
                <input value={form.name} onChange={e => patch({ name: e.target.value })} placeholder="e.g. Q3 Paid Performance" className="input-field" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Report Type</FieldLabel>
                  <div className="grid grid-cols-1 gap-1.5">
                    {REPORT_TYPES.map(t => (
                      <button key={t} type="button" onClick={() => patch({ type: t })}
                        className={["flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all text-left", form.type === t ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/30"].join(" ")}>
                        {React.createElement(TYPE_ICONS[t] ?? FileText, { className: "h-3.5 w-3.5 flex-shrink-0" })}
                        {t}
                        {form.type === t && <Check className="h-3 w-3 ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <FieldLabel>Schedule</FieldLabel>
                  <div className="grid grid-cols-1 gap-1.5">
                    {SCHEDULES.map(s => (
                      <button key={s} type="button" onClick={() => patch({ schedule: s })}
                        className={["flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all", form.schedule === s ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/30"].join(" ")}>
                        {s}
                        {form.schedule === s && <Check className="h-3 w-3" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-sm font-semibold text-foreground mb-1">Include Metrics *</p>
            <p className="text-xs text-muted-foreground mb-4">Select at least one metric to include in the report</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {METRICS_LIST.map(m => {
                const selected = form.metrics.includes(m)
                return (
                  <button key={m} type="button" onClick={() => toggleMetric(m)}
                    className={["flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all", selected ? "bg-primary/10 border-primary/40 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/30 hover:bg-secondary/50"].join(" ")}>
                    {m}
                    {selected && <Check className="h-3 w-3 ml-auto flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Distribution */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-sm font-semibold text-foreground mb-4">Distribution</p>
            <div className="flex flex-col gap-4">
              <div>
                <FieldLabel hint="comma separated">Recipients</FieldLabel>
                <input value={form.recipients} onChange={e => patch({ recipients: e.target.value })} placeholder="cmo@company.com, team@company.com" className="input-field" />
              </div>
              <div>
                <FieldLabel hint="optional">Description</FieldLabel>
                <textarea value={form.description} onChange={e => patch({ description: e.target.value })} placeholder="What should this report focus on?" rows={3} className="input-field resize-none h-auto py-2" />
              </div>
              <div className="flex items-center justify-between py-3 border-t border-border">
                <div>
                  <p className="text-xs font-medium text-foreground">Include Charts</p>
                  <p className="text-[10px] text-muted-foreground">Embed visual charts in the report output</p>
                </div>
                <button
                  onClick={() => patch({ includeChart: !form.includeChart })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.includeChart ? "bg-primary" : "bg-muted"}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${form.includeChart ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: summary ── */}
        <div className="xl:col-span-1">
          <div className="sticky top-20">
            <div className="bg-card border border-border rounded-2xl p-5 mb-4">
              <p className="text-xs font-semibold text-foreground mb-4">Report Preview</p>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <TypeIcon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-0.5">{form.name || "Untitled Report"}</p>
              <p className="text-xs text-muted-foreground mb-4">{form.type} · {form.schedule}</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Metrics",    value: form.metrics.length > 0 ? form.metrics.join(", ") : "—" },
                  { label: "Recipients", value: form.recipients || "—" },
                  { label: "Charts",     value: form.includeChart ? "Included" : "Excluded" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground">{label}</span>
                    <span className={`text-[11px] font-medium text-right max-w-[65%] line-clamp-2 ${value === "—" ? "text-muted-foreground/40" : "text-foreground"}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-xl border p-4 mb-4 ${canCreate ? "bg-[var(--positive)]/5 border-[var(--positive)]/20" : "bg-secondary border-border"}`}>
              <div className="flex items-center gap-2 mb-2">
                {canCreate ? <CheckCircle2 className="h-4 w-4 text-[var(--positive)]" /> : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />}
                <span className={`text-xs font-semibold ${canCreate ? "text-[var(--positive)]" : "text-muted-foreground"}`}>
                  {canCreate ? "Ready to Create" : "Fill in required fields"}
                </span>
              </div>
              {[
                { label: "Report name", done: !!form.name },
                { label: "Metrics selected", done: form.metrics.length > 0 },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-1.5 mt-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${done ? "bg-[var(--positive)]" : "bg-muted-foreground/30"}`} />
                  <span className={`text-[11px] ${done ? "text-muted-foreground" : "text-muted-foreground/50"}`}>{label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <Button className="w-full h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" disabled={!canCreate} onClick={handleCreate}>
                <Send className="h-4 w-4" />
                Create Report
              </Button>
              <Button variant="outline" className="w-full h-9 text-xs" onClick={onBack}>Cancel</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

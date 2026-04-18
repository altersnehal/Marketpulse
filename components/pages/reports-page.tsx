"use client"

import { useState } from "react"
import {
  Download,
  FileText,
  BarChart2,
  PieChart,
  Calendar,
  Clock,
  Plus,
  Lock,
  Users,
  ChevronDown,
  Check,
  Pencil,
  Eye,
  Trash2,
} from "lucide-react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { DrawerPanel } from "@/components/ui/drawer-panel"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface Report {
  id: number
  name: string
  type: string
  schedule: string
  lastRun: string
  recipients: number
  status: "ready" | "processing" | "scheduled"
  description: string
}

const REPORTS: Report[] = [
  {
    id: 1,
    name: "Weekly Marketing Summary",
    type: "Overview",
    schedule: "Every Monday",
    lastRun: "Apr 7, 2026",
    recipients: 6,
    status: "ready",
    description: "Top-level KPIs, channel performance, and week-over-week trend summary for the leadership team.",
  },
  {
    id: 2,
    name: "Paid Search Performance",
    type: "Channel",
    schedule: "Daily",
    lastRun: "Apr 12, 2026",
    recipients: 3,
    status: "ready",
    description: "Google Ads impressions, CTR, cost, ROAS, and Quality Score breakdown by campaign.",
  },
  {
    id: 3,
    name: "Email Campaign ROI",
    type: "Campaign",
    schedule: "Weekly",
    lastRun: "Apr 10, 2026",
    recipients: 4,
    status: "ready",
    description: "Email open rates, CTR, revenue attribution, and list hygiene metrics per campaign.",
  },
  {
    id: 4,
    name: "Social Media Engagement",
    type: "Channel",
    schedule: "Weekly",
    lastRun: "Apr 8, 2026",
    recipients: 5,
    status: "processing",
    description: "Reach, engagement, follower growth, and paid post performance across all social channels.",
  },
  {
    id: 5,
    name: "Q2 Executive Dashboard",
    type: "Executive",
    schedule: "Monthly",
    lastRun: "Apr 1, 2026",
    recipients: 8,
    status: "ready",
    description: "Board-level marketing impact report: revenue contribution, pipeline, CAC, LTV, and ROAS.",
  },
  {
    id: 6,
    name: "Funnel Conversion Analysis",
    type: "Analytics",
    schedule: "Bi-weekly",
    lastRun: "Apr 5, 2026",
    recipients: 3,
    status: "scheduled",
    description: "Stage-by-stage conversion rates, drop-off points, and attribution model comparison.",
  },
]

const TYPE_ICONS: Record<string, React.ElementType> = {
  Overview:  BarChart2,
  Channel:   PieChart,
  Campaign:  FileText,
  Executive: BarChart2,
  Analytics: BarChart2,
}

const STATUS_STYLES: Record<string, string> = {
  ready:      "bg-[var(--positive)]/15 text-[var(--positive)] border-[var(--positive)]/30",
  processing: "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30",
  scheduled:  "bg-primary/15 text-primary border-primary/30",
}

const TEMPLATE_CARDS = [
  { label: "Channel Overview",    desc: "Traffic and conversions by channel, with paid vs organic split",  icon: PieChart,  type: "Channel" },
  { label: "Campaign Digest",     desc: "Top campaigns ranked by ROAS, spend, and conversion volume",       icon: FileText,  type: "Campaign" },
  { label: "Executive Summary",   desc: "High-level KPIs, revenue impact, and CAC/LTV for leadership",      icon: BarChart2, type: "Executive" },
  { label: "Attribution Report",  desc: "Multi-touch attribution breakdown across all paid and owned media", icon: BarChart2, type: "Analytics" },
]

const SCHEDULES   = ["One-time", "Daily", "Weekly", "Bi-weekly", "Monthly"]
const REPORT_TYPES = ["Overview", "Channel", "Campaign", "Executive", "Analytics"]
const METRICS_LIST = ["Traffic", "Leads", "Conversions", "Revenue", "CTR", "ROAS", "CAC", "Spend"]

const EMPTY_FORM = {
  name: "",
  type: "Overview",
  schedule: "Weekly",
  recipients: "",
  metrics: [] as string[],
  description: "",
  includeChart: true,
}

function DrawerField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  )
}

export function ReportsPage({
  onNewReport,
  onNewReportFromTemplate,
}: {
  onNewReport?: () => void
  onNewReportFromTemplate?: (t: { label: string; type: string }) => void
}) {
  const { can } = useApp()
  const [activeTab, setActiveTab] = useState<"saved" | "templates">("saved")
  const [drawerMode, setDrawerMode] = useState<"edit" | "detail" | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [formSaved, setFormSaved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const selectedReport = REPORTS.find((r) => r.id === selectedId) ?? null
  const confirmDeleteReport = REPORTS.find((r) => r.id === confirmDelete) ?? null

  const openDetail = (id: number) => { setSelectedId(id); setDrawerMode("detail") }
  const openEdit   = (id: number) => {
    const r = REPORTS.find(x => x.id === id)
    if (!r) return
    setForm({ ...EMPTY_FORM, name: r.name, type: r.type, schedule: r.schedule, description: r.description })
    setFormSaved(false); setSelectedId(id); setDrawerMode("edit")
  }

  const handleSave = () => {
    setFormSaved(true)
    setTimeout(() => { setFormSaved(false); setDrawerMode(null) }, 1200)
  }

  const toggleMetric = (m: string) => {
    setForm((f) => ({
      ...f,
      metrics: f.metrics.includes(m) ? f.metrics.filter((x) => x !== m) : [...f.metrics, m],
    }))
  }

  return (
    <div className="px-5 lg:px-8 py-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-lg font-bold text-foreground">Reports</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Scheduled and on-demand marketing reports</p>
        </div>
        {can("createReports") ? (
          <Button size="sm" className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={onNewReport}>
            <Plus className="h-3.5 w-3.5" />
            New Report
          </Button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary border border-border rounded-lg px-3 py-1.5">
            <Lock className="h-3.5 w-3.5" />
            Creating reports requires Manager role or above
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 bg-secondary border border-border rounded-lg p-0.5 w-fit mb-5">
        {(["saved", "templates"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={[
              "px-4 py-1.5 rounded-md text-xs font-medium transition-colors",
              activeTab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {t === "saved" ? "Saved Reports" : "Templates"}
          </button>
        ))}
      </div>

      {activeTab === "saved" ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Report</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Schedule</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Last Run</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Recipients</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 w-28 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {REPORTS.map((r) => {
                const Icon = TYPE_ICONS[r.type] ?? FileText
                return (
                  <tr
                    key={r.id}
                    className="border-b border-border/60 hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => openDetail(r.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{r.type}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {r.schedule}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {r.lastRun}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3 w-3" />
                        {r.recipients}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize ${STATUS_STYLES[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          title="View"
                          onClick={(e) => { e.stopPropagation(); openDetail(r.id) }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {can("exportReports") ? (
                          <button className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary transition-colors" title="Export">
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-muted-foreground/30" />
                        )}
                        {can("createReports") && (
                          <button
                            className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            title="Edit"
                            onClick={(e) => { e.stopPropagation(); openEdit(r.id) }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {can("createReports") && (
                          <button
                            className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Delete"
                            onClick={(e) => { e.stopPropagation(); setConfirmDelete(r.id) }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TEMPLATE_CARDS.map((t) => {
            const Icon = t.icon
            const canCreate = can("createReports")
            return (
              <button
                key={t.label}
                className={[
                  "bg-card border border-border rounded-xl p-5 text-left transition-all group",
                  canCreate
                    ? "hover:border-primary/50 hover:bg-secondary/30 cursor-pointer"
                    : "opacity-60 cursor-not-allowed",
                ].join(" ")}
                disabled={!canCreate}
                onClick={() => canCreate && onNewReportFromTemplate && onNewReportFromTemplate(t)}
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1 text-balance">{t.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
                {canCreate ? (
                  <div className="flex items-center gap-1 mt-3 text-[11px] text-primary font-medium">
                    <Plus className="h-3 w-3" />
                    Use template
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-3 text-[10px] text-muted-foreground/60">
                    <Lock className="h-3 w-3" />
                    Requires Manager or above
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Edit Report Drawer ─────────────────────────────────────── */}
      <DrawerPanel
        open={drawerMode === "edit"}
        onClose={() => setDrawerMode(null)}
        title="Edit Report"
        subtitle={selectedReport?.name}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setDrawerMode(null)}>Cancel</Button>
            <Button size="sm" className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave}>
              {formSaved ? "Saved!" : "Save Changes"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <DrawerField label="Report Name">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Q3 Paid Performance" className="input-field" />
          </DrawerField>
          <div className="grid grid-cols-2 gap-3">
            <DrawerField label="Report Type">
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="input-field">
                {REPORT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </DrawerField>
            <DrawerField label="Schedule">
              <select value={form.schedule} onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))} className="input-field">
                {SCHEDULES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </DrawerField>
          </div>
          <DrawerField label="Description">
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="input-field resize-none" />
          </DrawerField>
        </div>
      </DrawerPanel>

      {/* ── New Report Drawer (removed — now full page) ─────────────── */}

      {/* ── Report Detail Drawer ──────────────────────────────────── */}
      <DrawerPanel
        open={drawerMode === "detail"}
        onClose={() => setDrawerMode(null)}
        title="Report Details"
        subtitle={selectedReport?.name}
        footer={
          <div className="flex items-center gap-2">
            {can("exportReports") && (
              <Button size="sm" className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                <Download className="h-3.5 w-3.5" />
                Export Report
              </Button>
            )}
            {can("createReports") && (
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => selectedId && openEdit(selectedId)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>
        }
      >
        {selectedReport && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${STATUS_STYLES[selectedReport.status]}`}>
                {selectedReport.status}
              </span>
              <span className="text-xs text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-full">{selectedReport.type}</span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">{selectedReport.description}</p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Schedule",    value: selectedReport.schedule,            icon: Calendar },
                { label: "Last Run",    value: selectedReport.lastRun,             icon: Clock },
                { label: "Recipients",  value: `${selectedReport.recipients} people`, icon: Users },
                { label: "Type",        value: selectedReport.type,                icon: FileText },
              ].map((item) => (
                <div key={item.label} className="bg-secondary/50 border border-border rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                    <item.icon className="h-3 w-3" />
                    {item.label}
                  </p>
                  <p className="text-xs font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>

            {!can("exportReports") && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 border border-border rounded-lg px-3 py-2.5">
                <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                Exporting reports requires Analyst role or above.
              </div>
            )}
          </div>
        )}
      </DrawerPanel>

      {/* ── Delete Confirm ────────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => setConfirmDelete(null)}
        title={`Delete "${confirmDeleteReport?.name}"?`}
        description="This will permanently remove this report and all its scheduled runs. This cannot be undone."
        confirmLabel="Delete Report"
        variant="danger"
        icon="trash"
      />
    </div>
  )
}

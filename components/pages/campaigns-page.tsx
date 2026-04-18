"use client"

import { useState, useMemo } from "react"
import {
  Plus,
  Search,
  Download,
  Pencil,
  Trash2,
  Pause,
  Play,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  X,
  Lock,
  BarChart2,
  AlertCircle,
  Target,
  TrendingUp,
  Users,
  Megaphone,
  MousePointerClick,
  DollarSign,
  Calendar,
  Globe,
  CheckCircle2,
} from "lucide-react"
import { campaignData, campaignBudgets } from "@/lib/mock-data"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { DrawerPanel } from "@/components/ui/drawer-panel"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

type SortKey = keyof (typeof campaignData)[0]
type SortDir = "asc" | "desc" | null

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        {hint && <span className="text-[10px] text-muted-foreground/60">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function SectionHeader({ step, title, subtitle }: { step: number; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 pt-1">
      <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
        {step}
      </div>
      <div>
        <p className="text-xs font-semibold text-foreground">{title}</p>
        {subtitle && <p className="text-[10.5px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

const STATUS_STYLES: Record<string, string> = {
  Active:    "bg-[var(--positive)]/15 text-[var(--positive)] border-[var(--positive)]/30",
  Paused:    "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30",
  Completed: "bg-muted text-muted-foreground border-border",
}

const CHANNEL_CONFIG: Record<string, { color: string; bg: string; abbr: string; desc: string }> = {
  "Paid Search":  { color: "#4285F4", bg: "#EBF2FF", abbr: "G",  desc: "Google / Bing search ads" },
  "Paid Social":  { color: "#1877F2", bg: "#DBEAFE", abbr: "M",  desc: "Meta, LinkedIn, TikTok" },
  "Email":        { color: "#D97706", bg: "#FEF3C7", abbr: "Em", desc: "Newsletter & sequences" },
  "Organic SEO":  { color: "#16A34A", bg: "#DCFCE7", abbr: "Se", desc: "Content & SEO" },
  "Referral":     { color: "#6B7280", bg: "#F3F4F6", abbr: "Re", desc: "Partners & affiliates" },
}

const CAMPAIGN_GOALS = [
  { id: "awareness",   label: "Brand Awareness", icon: Megaphone,        desc: "Maximize reach & impressions",    roasSuggestion: 1.5  },
  { id: "traffic",     label: "Traffic",          icon: Users,            desc: "Drive clicks to site/landing page", roasSuggestion: 2.0 },
  { id: "leads",       label: "Lead Gen",         icon: Target,           desc: "Capture qualified leads",         roasSuggestion: 3.0  },
  { id: "conversions", label: "Conversions",      icon: MousePointerClick, desc: "Drive purchase / sign-up",       roasSuggestion: 4.0  },
  { id: "revenue",     label: "Revenue",          icon: DollarSign,       desc: "Maximize return on spend",        roasSuggestion: 5.0  },
  { id: "retention",   label: "Retention",        icon: TrendingUp,       desc: "Re-engage existing customers",    roasSuggestion: 8.0  },
]

const AUDIENCE_TYPES = ["Prospecting", "Retargeting", "Lookalike", "CRM / Email List", "Contextual"]
const GEO_OPTIONS    = ["Global", "United States", "North America", "Europe", "APAC", "Custom"]

type HealthStatus = "on-track" | "over-pacing" | "at-risk" | "critical"

function getCampaignHealth(roas: number, id: number): HealthStatus | null {
  const b = campaignBudgets[id]
  if (!b) return null
  const spentPct  = b.spent / b.monthly
  const expected  = b.daysElapsed / b.daysTotal
  const roasOk    = roas >= b.roasTarget * 0.8
  const overPacing = spentPct > expected + 0.12
  if (!roasOk && overPacing) return "critical"
  if (!roasOk)  return "at-risk"
  if (overPacing) return "over-pacing"
  return "on-track"
}

const HEALTH_CONFIG: Record<HealthStatus, { label: string; dotCls: string; textCls: string; bgCls: string }> = {
  "on-track":    { label: "On Track",    dotCls: "bg-[var(--positive)]", textCls: "text-[var(--positive)]", bgCls: "bg-[var(--positive)]/10 border-[var(--positive)]/20" },
  "over-pacing": { label: "Over Pacing", dotCls: "bg-[var(--warning)]",  textCls: "text-[var(--warning)]",  bgCls: "bg-[var(--warning)]/10 border-[var(--warning)]/20"   },
  "at-risk":     { label: "At Risk",     dotCls: "bg-[var(--negative)]", textCls: "text-[var(--negative)]", bgCls: "bg-[var(--negative)]/10 border-[var(--negative)]/20" },
  "critical":    { label: "Critical",    dotCls: "bg-[var(--negative)]", textCls: "text-[var(--negative)]", bgCls: "bg-[var(--negative)]/10 border-[var(--negative)]/20" },
}

const STATUSES  = ["All", "Active", "Paused", "Completed"]
const PAGE_SIZE = 6

const EMPTY_FORM = {
  name:        "",
  channel:     "",
  goal:        "",
  status:      "Active",
  budget:      "",
  startDate:   "",
  endDate:     "",
  roasTarget:  "",
  cpaTarget:   "",
  audiences:   [] as string[],
  geo:         "United States",
  notes:       "",
}

export function CampaignsPage({ onNewCampaign }: { onNewCampaign?: () => void }) {
  const { can } = useApp()
  const [sortKey, setSortKey]           = useState<SortKey>("revenue")
  const [sortDir, setSortDir]           = useState<SortDir>("desc")
  const [page, setPage]                 = useState(1)
  const [statusFilter, setStatusFilter] = useState("All")
  const [search, setSearch]             = useState("")
  const [drawerMode, setDrawerMode]     = useState<"edit" | "detail" | null>(null)
  const [selectedId, setSelectedId]     = useState<number | null>(null)
  const [form, setForm]                 = useState({ ...EMPTY_FORM })
  const [formSaved, setFormSaved]       = useState(false)
  // Pause / Delete confirm state
  const [confirmPause, setConfirmPause] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [pausedIds, setPausedIds]       = useState<Set<number>>(new Set())

  const selectedCampaign = campaignData.find((c) => c.id === selectedId) ?? null
  const confirmPauseCampaign = campaignData.find((c) => c.id === confirmPause) ?? null
  const confirmDeleteCampaign = campaignData.find((c) => c.id === confirmDelete) ?? null

  const openEdit   = (id: number) => {
    const c = campaignData.find((x) => x.id === id)
    if (!c) return
    setForm({ ...EMPTY_FORM, name: c.name, channel: c.channel, status: c.status, budget: String(c.cost) })
    setFormSaved(false); setSelectedId(id); setDrawerMode("edit")
  }
  const openDetail = (id: number) => { setSelectedId(id); setDrawerMode("detail") }
  const closeDrawer = () => setDrawerMode(null)
  const handleSave  = () => { setFormSaved(true); setTimeout(() => { setFormSaved(false); closeDrawer() }, 1400) }

  const handlePauseConfirm = () => {
    if (confirmPause !== null) {
      setPausedIds(prev => {
        const next = new Set(prev)
        if (next.has(confirmPause)) next.delete(confirmPause); else next.add(confirmPause)
        return next
      })
    }
    setConfirmPause(null)
  }

  const patchForm = (patch: Partial<typeof EMPTY_FORM>) => setForm((f) => ({ ...f, ...patch }))

  const toggleAudience = (a: string) =>
    patchForm({ audiences: form.audiences.includes(a) ? form.audiences.filter((x) => x !== a) : [...form.audiences, a] })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"))
    else { setSortKey(key); setSortDir("desc") }
    setPage(1)
  }

  const filtered = campaignData
    .filter((c) => statusFilter === "All" || c.status === statusFilter)
    .filter((c) => search === "" || c.name.toLowerCase().includes(search.toLowerCase()) || c.channel.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (!sortDir) return 0
      const va = a[sortKey], vb = b[sortKey], mult = sortDir === "asc" ? 1 : -1
      return typeof va === "number" && typeof vb === "number" ? (va - vb) * mult : String(va).localeCompare(String(vb)) * mult
    })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Budget math for form preview
  const budgetNum   = parseFloat(form.budget) || 0
  const startD      = form.startDate ? new Date(form.startDate) : null
  const endD        = form.endDate   ? new Date(form.endDate)   : null
  const durationDays = startD && endD ? Math.max(1, Math.ceil((endD.getTime() - startD.getTime()) / 86400000)) : null
  const dailyBudget  = durationDays && budgetNum ? (budgetNum / durationDays) : null
  const goalCfg      = CAMPAIGN_GOALS.find((g) => g.id === form.goal)

  // Summary stats
  const activeCampaigns = campaignData.filter((c) => c.status === "Active")
  const totalSpent      = Object.values(campaignBudgets).reduce((s, b) => s + b.spent, 0)
  const totalBudget     = Object.values(campaignBudgets).reduce((s, b) => s + b.monthly, 0)
  const spentPct        = Math.round((totalSpent / totalBudget) * 100)
  const avgRoas         = activeCampaigns.reduce((s, c) => s + c.roas, 0) / activeCampaigns.length
  const needAttention   = campaignData.filter((c) => { const h = getCampaignHealth(c.roas, c.id); return h === "at-risk" || h === "critical" }).length

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronsUpDown className="h-3 w-3 text-muted-foreground/40" />
    if (sortDir === "asc")  return <ChevronUp   className="h-3 w-3 text-primary" />
    if (sortDir === "desc") return <ChevronDown className="h-3 w-3 text-primary" />
    return <ChevronsUpDown className="h-3 w-3 text-muted-foreground/40" />
  }

  const COLS: { key: SortKey; label: string; right?: boolean }[] = [
    { key: "name",        label: "Campaign" },
    { key: "channel",     label: "Channel"  },
    { key: "status",      label: "Status"   },
    { key: "impressions", label: "Impr.",    right: true },
    { key: "clicks",      label: "Clicks",   right: true },
    { key: "ctr",         label: "CTR",      right: true },
    { key: "conversions", label: "Conv.",    right: true },
    { key: "cost",        label: "Spend",    right: true },
    { key: "roas",        label: "ROAS",     right: true },
  ]

  return (
    <div className="px-5 lg:px-8 py-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg font-bold text-foreground">Campaigns</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} campaigns · {activeCampaigns.length} active · Apr 2026</p>
        </div>
        <div className="flex items-center gap-2">
          {can("exportReports") && (
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><Download className="h-3.5 w-3.5" />Export</Button>
          )}
          {can("editCampaigns") ? (
            <Button size="sm" className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={onNewCampaign}>
              <Plus className="h-3.5 w-3.5" />New Campaign
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary border border-border rounded-md px-3 py-1.5">
              <Lock className="h-3.5 w-3.5" />View only
            </div>
          )}
        </div>
      </div>

      {/* Portfolio health strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Budget Used</p>
          <p className="text-xl font-bold text-foreground tabular-nums">{spentPct}%</p>
          <div className="mt-2 mb-1.5">
            <div className="relative h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="absolute top-0 bottom-0 w-px z-10" style={{ left: "60%", background: "var(--foreground)", opacity: 0.2 }} />
              <div className="h-full rounded-full" style={{ width: `${spentPct}%`, background: spentPct > 75 ? "var(--warning)" : "var(--positive)" }} />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">${(totalSpent / 1000).toFixed(0)}k of ${(totalBudget / 1000).toFixed(0)}k · 12d left</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Avg. ROAS</p>
          <p className={`text-xl font-bold tabular-nums ${avgRoas >= 3.5 ? "text-[var(--positive)]" : avgRoas >= 2 ? "text-[var(--warning)]" : "text-[var(--negative)]"}`}>{avgRoas.toFixed(1)}x</p>
          <p className="text-[10px] text-muted-foreground mt-2">Target <span className="font-semibold">3.5x</span> · {avgRoas >= 3.5 ? "Meeting target" : "Below target"}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Active</p>
          <p className="text-xl font-bold text-foreground tabular-nums">{activeCampaigns.length}</p>
          <p className="text-[10px] text-muted-foreground mt-2">of {campaignData.length} total · {campaignData.filter(c => c.status === "Paused").length} paused</p>
        </div>
        <div className={`border rounded-xl p-4 ${needAttention > 0 ? "bg-[var(--negative)]/5 border-[var(--negative)]/20" : "bg-[var(--positive)]/5 border-[var(--positive)]/20"}`}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Need Attention</p>
          <p className={`text-xl font-bold tabular-nums ${needAttention > 0 ? "text-[var(--negative)]" : "text-[var(--positive)]"}`}>{needAttention}</p>
          <p className="text-[10px] text-muted-foreground mt-2">{needAttention > 0 ? `${needAttention} campaign${needAttention > 1 ? "s" : ""} at risk` : "All campaigns healthy"}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input type="text" placeholder="Search campaigns..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full h-8 pl-8 pr-3 text-xs bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>}
        </div>
        <div className="flex items-center gap-0.5 bg-secondary border border-border rounded-lg p-0.5">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
              className={["px-3 py-1.5 rounded-md text-xs font-medium transition-colors", statusFilter === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"].join(" ")}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                {COLS.map((col) => (
                  <th key={col.key} onClick={() => handleSort(col.key)}
                    className={["px-4 py-3 font-medium text-muted-foreground whitespace-nowrap cursor-pointer hover:text-foreground select-none", col.right ? "text-right" : "text-left"].join(" ")}>
                    <div className={`flex items-center gap-1 ${col.right ? "justify-end" : ""}`}>{col.label}<SortIcon k={col.key} /></div>
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-medium text-muted-foreground whitespace-nowrap">Health</th>
                <th className="px-4 py-3 w-20 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={11} className="px-4 py-14 text-center text-xs text-muted-foreground">No campaigns match your filters.</td></tr>
              ) : paginated.map((row) => {
                const roasColor = row.roas >= 4 ? "text-[var(--positive)]" : row.roas >= 2 ? "text-[var(--warning)]" : "text-[var(--negative)]"
                const health    = getCampaignHealth(row.roas, row.id)
                const hCfg      = health ? HEALTH_CONFIG[health] : null
                const cfg       = CHANNEL_CONFIG[row.channel]
                const budget    = campaignBudgets[row.id]
                const sp        = budget ? Math.round((budget.spent / budget.monthly) * 100) : null
                return (
                  <tr key={row.id} className="border-b border-border/60 hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => openDetail(row.id)}>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-foreground font-medium line-clamp-1 max-w-[200px]">{row.name}</span>
                        {budget && sp !== null && (
                          <div className="flex items-center gap-1.5">
                            <div className="relative h-1 w-20 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${sp}%`, background: sp > 72 ? "var(--warning)" : "var(--positive)" }} />
                            </div>
                            <span className="text-[9.5px] text-muted-foreground/60 tabular-nums">{sp}% budget</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-5 w-5 rounded flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{ background: cfg?.bg, color: cfg?.color }}>{cfg?.abbr}</span>
                        <span className="text-muted-foreground whitespace-nowrap hidden lg:block">{row.channel}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_STYLES[row.status]}`}>{row.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{(row.impressions / 1000).toFixed(0)}k</td>
                    <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{(row.clicks / 1000).toFixed(1)}k</td>
                    <td className="px-4 py-3 text-right text-foreground tabular-nums">{row.ctr}%</td>
                    <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{row.conversions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">${(row.cost / 1000).toFixed(1)}k</td>
                    <td className={`px-4 py-3 text-right font-bold tabular-nums ${roasColor}`}>{row.roas}x</td>
                    <td className="px-4 py-3 text-right">
                      {hCfg ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${hCfg.bgCls}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${hCfg.dotCls}`} />
                          <span className={hCfg.textCls}>{hCfg.label}</span>
                        </span>
                      ) : <span className="text-muted-foreground/40 text-[10px]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {can("editCampaigns") && (
                          <button onClick={(e) => { e.stopPropagation(); openEdit(row.id) }} className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {can("editCampaigns") && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmPause(row.id) }}
                            className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          >
                            {pausedIds.has(row.id) || row.status === "Paused"
                              ? <Play className="h-3.5 w-3.5" />
                              : <Pause className="h-3.5 w-3.5" />}
                          </button>
                        )}
                        {can("deleteCampaigns") && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDelete(row.id) }}
                            className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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
        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {filtered.length === 0 ? "No results" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
            {Array.from({ length: Math.max(1, totalPages) }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={["h-7 w-7 rounded-md text-xs font-medium transition-colors", page === i + 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"].join(" ")}>{i + 1}</button>
            ))}
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </div>

      {/* ── Edit Campaign Drawer ─────────────────────────────── */}
      <DrawerPanel
        open={drawerMode === "edit"}
        onClose={closeDrawer}
        width="lg"
        title="Edit Campaign"
        subtitle={selectedCampaign?.name}
        footer={
          <div className="flex items-center justify-between">
            <p className="text-[10.5px] text-muted-foreground">
              {form.name && form.channel && form.goal && form.budget
                ? <span className="flex items-center gap-1 text-[var(--positive)]"><CheckCircle2 className="h-3.5 w-3.5" /> Ready to save</span>
                : "Fill in required fields to continue"}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={closeDrawer}>Cancel</Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSave}
                disabled={!form.name || !form.channel || !form.goal || !form.budget}
              >
                {formSaved ? "Saved!" : "Save Changes"}
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-6">

          {/* ── Section 1: Identity ────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <SectionHeader step={1} title="Campaign Identity" subtitle="Name your campaign and choose the channel" />

            <Field label="Campaign Name *" hint="Be specific — include channel & quarter">
              <input
                value={form.name}
                onChange={(e) => patchForm({ name: e.target.value })}
                placeholder="e.g. Q2 Brand Awareness — Google Search"
                className="input-field"
              />
            </Field>

            {/* Channel card picker */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">Channel *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(CHANNEL_CONFIG).map(([ch, cfg]) => {
                  const selected = form.channel === ch
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => patchForm({ channel: ch })}
                      className={[
                        "flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all",
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border hover:border-muted-foreground/30 hover:bg-secondary/60",
                      ].join(" ")}
                    >
                      <span className="h-7 w-7 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.abbr}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11.5px] font-semibold text-foreground leading-tight">{ch}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight truncate">{cfg.desc}</p>
                      </div>
                      {selected && <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0 ml-auto" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-3 gap-2">
              {["Active", "Paused", "Draft"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => patchForm({ status: s })}
                  className={[
                    "py-2 rounded-lg border text-xs font-medium transition-all",
                    form.status === s ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/30" : "border-border text-muted-foreground hover:border-muted-foreground/30",
                  ].join(" ")}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* ── Section 2: Goal ───────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <SectionHeader step={2} title="Campaign Goal" subtitle="Choose the primary objective — this affects optimization and targets" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CAMPAIGN_GOALS.map((g) => {
                const selected = form.goal === g.id
                const Icon = g.icon
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => patchForm({ goal: g.id, roasTarget: String(g.roasSuggestion) })}
                    className={[
                      "flex flex-col items-start gap-1.5 px-3 py-3 rounded-lg border text-left transition-all",
                      selected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:border-muted-foreground/30 hover:bg-secondary/60",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`h-6 w-6 rounded-md flex items-center justify-center ${selected ? "bg-primary/15" : "bg-secondary"}`}>
                        <Icon className={`h-3.5 w-3.5 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      {selected && <CheckCircle2 className="h-3 w-3 text-primary" />}
                    </div>
                    <p className="text-[11.5px] font-semibold text-foreground leading-tight">{g.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{g.desc}</p>
                    {selected && (
                      <p className="text-[10px] text-primary font-semibold mt-0.5">Suggested ROAS: {g.roasSuggestion}x</p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* ── Section 3: Budget & Schedule ───────────────────── */}
          <div className="flex flex-col gap-4">
            <SectionHeader step={3} title="Budget & Schedule" subtitle="Set your total spend cap and flight dates" />

            <div className="grid grid-cols-2 gap-3">
              <Field label="Total Budget (USD) *">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                  <input
                    type="number"
                    value={form.budget}
                    onChange={(e) => patchForm({ budget: e.target.value })}
                    placeholder="50,000"
                    className="input-field pl-6"
                  />
                </div>
              </Field>
              <div className="flex flex-col justify-end">
                {dailyBudget ? (
                  <div className="h-9 flex items-center px-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <span className="text-[11px] text-muted-foreground">Daily cap: </span>
                    <span className="text-[11px] font-bold text-primary ml-1">${dailyBudget.toFixed(0)}/day</span>
                  </div>
                ) : (
                  <div className="h-9 flex items-center px-3 bg-secondary border border-border rounded-lg">
                    <span className="text-[11px] text-muted-foreground/60">Set dates to see daily budget</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date">
                <input type="date" value={form.startDate} onChange={(e) => patchForm({ startDate: e.target.value })} className="input-field" />
              </Field>
              <Field label="End Date">
                <input type="date" value={form.endDate} onChange={(e) => patchForm({ endDate: e.target.value })} className="input-field" />
              </Field>
            </div>

            {durationDays && budgetNum > 0 && (
              <div className="rounded-lg bg-secondary/60 border border-border px-4 py-3 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Duration</p>
                  <p className="text-sm font-bold text-foreground">{durationDays}d</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Daily Budget</p>
                  <p className="text-sm font-bold text-primary">${dailyBudget?.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Total Budget</p>
                  <p className="text-sm font-bold text-foreground">${budgetNum.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border" />

          {/* ── Section 4: Performance Targets ─────────────────── */}
          <div className="flex flex-col gap-4">
            <SectionHeader step={4} title="Performance Targets" subtitle="Define what success looks like for this campaign" />

            <div className="grid grid-cols-2 gap-3">
              <Field label="ROAS Target" hint={goalCfg ? `Suggested: ${goalCfg.roasSuggestion}x` : undefined}>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={form.roasTarget}
                    onChange={(e) => patchForm({ roasTarget: e.target.value })}
                    placeholder={goalCfg ? String(goalCfg.roasSuggestion) : "3.5"}
                    className="input-field pr-6"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">x</span>
                </div>
              </Field>
              <Field label="Max CPA Target" hint="optional">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                  <input
                    type="number"
                    value={form.cpaTarget}
                    onChange={(e) => patchForm({ cpaTarget: e.target.value })}
                    placeholder="45"
                    className="input-field pl-6"
                  />
                </div>
              </Field>
            </div>

            {/* Revenue projection */}
            {form.roasTarget && budgetNum > 0 && (
              <div className="rounded-lg bg-[var(--positive)]/5 border border-[var(--positive)]/20 px-4 py-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Projected Return at {form.roasTarget}x ROAS</p>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Revenue</p>
                    <p className="text-base font-bold text-[var(--positive)]">
                      ${(budgetNum * parseFloat(form.roasTarget)).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Profit</p>
                    <p className="text-base font-bold text-foreground">
                      ${((budgetNum * parseFloat(form.roasTarget)) - budgetNum).toLocaleString()}
                    </p>
                  </div>
                  {form.cpaTarget && budgetNum > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground">Est. Conversions</p>
                      <p className="text-base font-bold text-foreground">
                        {Math.round(budgetNum / parseFloat(form.cpaTarget)).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border" />

          {/* ── Section 5: Audience ────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <SectionHeader step={5} title="Audience & Targeting" subtitle="Define who this campaign reaches" />

            <Field label="Audience Type" hint="select all that apply">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {AUDIENCE_TYPES.map((a) => {
                  const on = form.audiences.includes(a)
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAudience(a)}
                      className={[
                        "px-3 py-1 rounded-full text-[11px] font-medium border transition-all",
                        on ? "bg-primary/10 border-primary/40 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/40",
                      ].join(" ")}
                    >
                      {a}
                    </button>
                  )
                })}
              </div>
            </Field>

            <Field label="Geographic Focus">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {GEO_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => patchForm({ geo: g })}
                    className={[
                      "px-3 py-1 rounded-full text-[11px] font-medium border transition-all",
                      form.geo === g ? "bg-primary/10 border-primary/40 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/40",
                    ].join(" ")}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Creative Notes" hint="optional">
              <textarea
                value={form.notes}
                onChange={(e) => patchForm({ notes: e.target.value })}
                placeholder="Key messages, creative direction, landing page URL..."
                rows={3}
                className="input-field h-auto py-2 resize-none"
              />
            </Field>
          </div>

        </div>
      </DrawerPanel>

      {/* ── Campaign Detail Drawer ────────────────────────────────── */}
      <DrawerPanel
        open={drawerMode === "detail"}
        onClose={closeDrawer}
        title="Campaign Details"
        subtitle={selectedCampaign?.name}
        footer={
          can("editCampaigns") ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => selectedId && openEdit(selectedId)}>
                <Pencil className="h-3.5 w-3.5" />Edit
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                {selectedCampaign?.status === "Active" ? <><Pause className="h-3.5 w-3.5" />Pause</> : <><Play className="h-3.5 w-3.5" />Activate</>}
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedCampaign && (() => {
          const budget   = campaignBudgets[selectedCampaign.id]
          const health   = getCampaignHealth(selectedCampaign.roas, selectedCampaign.id)
          const hCfg     = health ? HEALTH_CONFIG[health] : null
          const cfg      = CHANNEL_CONFIG[selectedCampaign.channel]
          const sp       = budget ? Math.round((budget.spent / budget.monthly) * 100) : null
          const expPct   = budget ? Math.round((budget.daysElapsed / budget.daysTotal) * 100) : null
          const dLeft    = budget ? budget.daysTotal - budget.daysElapsed : null
          const rem      = budget ? budget.monthly - budget.spent : null

          return (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[selectedCampaign.status]}`}>{selectedCampaign.status}</span>
                <div className="flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded flex items-center justify-center text-[9px] font-bold" style={{ background: cfg?.bg, color: cfg?.color }}>{cfg?.abbr}</span>
                  <span className="text-xs text-muted-foreground">{selectedCampaign.channel}</span>
                </div>
                {hCfg && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${hCfg.bgCls}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${hCfg.dotCls}`} />
                    <span className={hCfg.textCls}>{hCfg.label}</span>
                  </span>
                )}
              </div>

              {budget && sp !== null && expPct !== null && (
                <div className="border border-border rounded-lg p-4 bg-secondary/30">
                  <p className="text-xs font-semibold text-foreground mb-3">Budget Pacing — April 2026</p>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Spent</span>
                      <span className="font-semibold text-foreground tabular-nums">${(budget.spent / 1000).toFixed(1)}k of ${(budget.monthly / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="absolute top-0 bottom-0 w-0.5 z-10 rounded-full" style={{ left: `${expPct}%`, background: "var(--foreground)", opacity: 0.3 }} />
                      <div className="h-full rounded-full transition-all" style={{ width: `${sp}%`, background: sp > expPct + 12 ? "var(--warning)" : "var(--positive)" }} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-muted-foreground tabular-nums">{sp}% spent</span>
                      <span className="text-[10px] text-muted-foreground tabular-nums">{expPct}% expected · {dLeft}d left</span>
                    </div>
                  </div>
                  {rem !== null && (
                    <p className="text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">${(rem / 1000).toFixed(1)}k</span> remaining · daily cap: <span className="font-semibold text-foreground">${(rem / (dLeft ?? 1) / 1000).toFixed(1)}k/day</span>
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Impressions", value: `${(selectedCampaign.impressions / 1000).toFixed(0)}k` },
                  { label: "Clicks",      value: `${(selectedCampaign.clicks / 1000).toFixed(1)}k` },
                  { label: "CTR",         value: `${selectedCampaign.ctr}%` },
                  { label: "Conversions", value: selectedCampaign.conversions.toLocaleString() },
                  { label: "Spend",       value: `$${(selectedCampaign.cost / 1000).toFixed(1)}k` },
                  { label: "Revenue",     value: `$${(selectedCampaign.revenue / 1000).toFixed(0)}k` },
                ].map((item) => (
                  <div key={item.label} className="bg-secondary/50 border border-border rounded-lg p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{item.label}</p>
                    <p className="text-base font-bold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className={`border rounded-lg p-4 ${selectedCampaign.roas >= 3 ? "bg-[var(--positive)]/8 border-[var(--positive)]/25" : "bg-[var(--warning)]/8 border-[var(--warning)]/25"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-foreground/60" />
                    <span className="text-xs font-semibold text-foreground">ROAS</span>
                  </div>
                  {budget && <span className="text-[10px] text-muted-foreground">Target: <span className="font-semibold">{budget.roasTarget}x</span></span>}
                </div>
                <p className={`text-2xl font-bold ${selectedCampaign.roas >= 3 ? "text-[var(--positive)]" : "text-[var(--warning)]"}`}>{selectedCampaign.roas}x</p>
                {budget && (
                  <div className="mt-2">
                    <div className="relative h-1.5 bg-secondary/80 rounded-full overflow-hidden">
                      <div className="absolute top-0 bottom-0 w-px z-10" style={{ left: `${Math.min(100, (budget.roasTarget / (budget.roasTarget * 1.5)) * 100)}%`, background: "var(--foreground)", opacity: 0.3 }} />
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, (selectedCampaign.roas / (budget.roasTarget * 1.5)) * 100)}%`, background: selectedCampaign.roas >= budget.roasTarget ? "var(--positive)" : selectedCampaign.roas >= budget.roasTarget * 0.7 ? "var(--warning)" : "var(--negative)" }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {selectedCampaign.roas >= budget.roasTarget ? `Exceeding ${budget.roasTarget}x target` : selectedCampaign.roas >= budget.roasTarget * 0.8 ? `Close to ${budget.roasTarget}x target` : `Below ${budget.roasTarget}x target — review strategy`}
                    </p>
                  </div>
                )}
              </div>

              {!can("editCampaigns") && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 border border-border rounded-lg px-3 py-2.5">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />Your role does not have permission to edit campaigns.
                </div>
              )}
            </div>
          )
        })()}
      </DrawerPanel>

      {/* ── Pause Confirm Dialog ─────────────────────────── */}
      <ConfirmDialog
        open={confirmPause !== null}
        onClose={() => setConfirmPause(null)}
        onConfirm={handlePauseConfirm}
        title={pausedIds.has(confirmPause!) || confirmPauseCampaign?.status === "Paused"
          ? `Resume "${confirmPauseCampaign?.name}"?`
          : `Pause "${confirmPauseCampaign?.name}"?`}
        description={pausedIds.has(confirmPause!) || confirmPauseCampaign?.status === "Paused"
          ? "This will resume the campaign and it will begin spending again."
          : "This will stop the campaign from running and pause all ad delivery."}
        confirmLabel={pausedIds.has(confirmPause!) || confirmPauseCampaign?.status === "Paused" ? "Resume" : "Pause Campaign"}
        variant="warning"
        icon="pause"
      />

      {/* ── Delete Confirm Dialog ────────────────────────── */}
      <ConfirmDialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => setConfirmDelete(null)}
        title={`Delete "${confirmDeleteCampaign?.name}"?`}
        description="This action is permanent and cannot be undone. All campaign data, performance history, and reports will be lost."
        confirmLabel="Delete Campaign"
        variant="danger"
        icon="trash"
      />
    </div>
  )
}

"use client"

import { useState } from "react"
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Lock,
  ExternalLink,
  Zap,
  Search,
  Clock,
  Activity,
  Settings2,
  Unplug,
} from "lucide-react"
import { useApp } from "@/lib/app-context"
import { DrawerPanel } from "@/components/ui/drawer-panel"
import { Button } from "@/components/ui/button"

interface Integration {
  id: string
  name: string
  category: string
  description: string
  features: string[]
  status: "connected" | "error" | "disconnected"
  lastSync?: string
  syncFrequency?: string
  recordsImported?: number
  logo: string
  color: string
}

const INTEGRATIONS: Integration[] = [
  {
    id: "google-ads",
    name: "Google Ads",
    category: "Advertising",
    description: "Import campaign data, spend, ROAS, Quality Score, and conversion tracking from Google Ads.",
    features: ["Campaign sync", "Conversion tracking", "Keyword data", "Audience lists"],
    status: "connected",
    lastSync: "2 min ago",
    syncFrequency: "Every 15 min",
    recordsImported: 412000,
    logo: "G",
    color: "#4285f4",
  },
  {
    id: "meta-ads",
    name: "Meta Ads",
    category: "Advertising",
    description: "Sync Facebook and Instagram ad performance, audience insights, and creative analytics.",
    features: ["Ad performance", "Audience insights", "Creative analytics", "Pixel events"],
    status: "connected",
    lastSync: "5 min ago",
    syncFrequency: "Every 15 min",
    recordsImported: 280000,
    logo: "M",
    color: "#1877f2",
  },
  {
    id: "google-analytics",
    name: "Google Analytics 4",
    category: "Analytics",
    description: "Pull web traffic, engagement metrics, and conversion funnel data from GA4.",
    features: ["Session data", "Event tracking", "Funnel analysis", "Audience segments"],
    status: "connected",
    lastSync: "10 min ago",
    syncFrequency: "Hourly",
    recordsImported: 2840000,
    logo: "GA",
    color: "#e8710a",
  },
  {
    id: "hubspot",
    name: "HubSpot CRM",
    category: "CRM",
    description: "Sync leads, contacts, deal stages, and revenue attribution from HubSpot.",
    features: ["Lead sync", "Deal pipeline", "Revenue attribution", "Contact enrichment"],
    status: "connected",
    lastSync: "15 min ago",
    syncFrequency: "Every 30 min",
    recordsImported: 48320,
    logo: "HS",
    color: "#ff7a59",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    category: "Email",
    description: "Import email campaign stats, open rates, click-through data, and subscriber trends.",
    features: ["Campaign stats", "Subscriber data", "A/B test results", "Automation flows"],
    status: "error",
    lastSync: "2 hours ago",
    syncFrequency: "Every 30 min",
    recordsImported: 96000,
    logo: "MC",
    color: "#ffe01b",
  },
  {
    id: "linkedin-ads",
    name: "LinkedIn Ads",
    category: "Advertising",
    description: "Monitor sponsored content, lead gen forms, and B2B audience performance.",
    features: ["Sponsored content", "Lead gen forms", "Company insights", "Demographic data"],
    status: "connected",
    lastSync: "30 min ago",
    syncFrequency: "Hourly",
    recordsImported: 82000,
    logo: "LI",
    color: "#0a66c2",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    category: "CRM",
    description: "Connect pipeline data, close rates, and opportunity details for full-funnel attribution.",
    features: ["Opportunity sync", "Pipeline tracking", "Close rate analysis", "Account mapping"],
    status: "disconnected",
    logo: "SF",
    color: "#00a1e0",
  },
  {
    id: "slack",
    name: "Slack Notifications",
    category: "Notifications",
    description: "Send campaign alerts, weekly digests, and anomaly notifications to Slack channels.",
    features: ["Alert routing", "Weekly digest", "Custom webhooks", "Channel targeting"],
    status: "disconnected",
    logo: "SL",
    color: "#4a154b",
  },
]

const STATUS_CONFIG = {
  connected:    { icon: CheckCircle2, color: "text-[var(--positive)]", label: "Connected",     dot: "bg-[var(--positive)]",     border: "border-border" },
  error:        { icon: AlertTriangle, color: "text-[var(--warning)]",  label: "Error",         dot: "bg-[var(--warning)]",      border: "border-[var(--warning)]/40" },
  disconnected: { icon: Plus,          color: "text-muted-foreground",  label: "Not Connected", dot: "bg-muted-foreground/40",   border: "border-border border-dashed" },
}

const CATEGORIES = ["All", "Advertising", "Analytics", "CRM", "Email", "Notifications"]

export function IntegrationsPage() {
  const { can } = useApp()
  const [filter, setFilter]           = useState("All")
  const [search, setSearch]           = useState("")
  const [syncing, setSyncing]         = useState<string | null>(null)
  const [syncDone, setSyncDone]       = useState<string | null>(null)
  const [selectedId, setSelectedId]   = useState<string | null>(null)
  const [drawerMode, setDrawerMode]   = useState<"detail" | "new" | null>(null)
  const [newForm, setNewForm]         = useState({ name: "", category: "Advertising", apiKey: "", webhookUrl: "" })
  const [newSaved, setNewSaved]       = useState(false)

  const canManage = can("manageIntegrations")

  const handleSync = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!canManage) return
    setSyncing(id)
    setSyncDone(null)
    setTimeout(() => {
      setSyncing(null)
      setSyncDone(id)
      setTimeout(() => setSyncDone(null), 3000)
    }, 2000)
  }

  const openDetail = (id: string) => {
    setSelectedId(id)
    setDrawerMode("detail")
  }

  const selectedIntegration = INTEGRATIONS.find((i) => i.id === selectedId) ?? null

  const filtered = INTEGRATIONS
    .filter((i) => filter === "All" || i.category === filter)
    .filter((i) => search === "" || i.name.toLowerCase().includes(search.toLowerCase()))

  const stats = {
    connected:    INTEGRATIONS.filter((i) => i.status === "connected").length,
    errors:       INTEGRATIONS.filter((i) => i.status === "error").length,
    available:    INTEGRATIONS.filter((i) => i.status === "disconnected").length,
  }

  return (
    <div className="px-5 lg:px-8 py-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-lg font-bold text-foreground">Integrations</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {stats.connected} of {INTEGRATIONS.length} integrations active
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!canManage && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary border border-border rounded-lg px-3 py-1.5">
              <Lock className="h-3.5 w-3.5" />
              Admin role required to manage
            </div>
          )}
          {canManage && (
            <Button size="sm" className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => { setNewSaved(false); setDrawerMode("new") }}>
              <Plus className="h-3.5 w-3.5" />
              New Integration
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Connected",  count: stats.connected, color: "text-[var(--positive)]", bg: "bg-[var(--positive)]/8 border-[var(--positive)]/20" },
          { label: "Errors",     count: stats.errors,    color: "text-[var(--warning)]",  bg: "bg-[var(--warning)]/8 border-[var(--warning)]/20" },
          { label: "Available",  count: stats.available, color: "text-muted-foreground",  bg: "" },
        ].map((s) => (
          <div key={s.label} className={`bg-card border rounded-xl p-4 ${s.bg || "border-border"}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-1 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={[
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                filter === c
                  ? "bg-primary/12 text-primary border-primary/30"
                  : "text-muted-foreground border-border hover:text-foreground hover:bg-secondary",
              ].join(" ")}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search integrations..."
            className="h-8 w-52 pl-8 pr-3 text-xs bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Integration cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((integration) => {
          const cfg     = STATUS_CONFIG[integration.status]
          const isSyncing = syncing === integration.id
          const isDone    = syncDone === integration.id

          return (
            <div
              key={integration.id}
              className={`bg-card border ${cfg.border} rounded-xl p-4 flex flex-col gap-3 cursor-pointer hover:border-primary/40 hover:bg-secondary/20 transition-all`}
              onClick={() => openDetail(integration.id)}
            >
              {/* Logo + status */}
              <div className="flex items-start justify-between">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 shadow-sm"
                  style={{ background: integration.color }}
                >
                  {integration.logo}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} ${integration.status === "connected" ? "animate-pulse" : ""}`} />
                  <span className={`text-[10px] font-semibold ${cfg.color}`}>{cfg.label}</span>
                </div>
              </div>

              {/* Info */}
              <div>
                <p className="text-sm font-semibold text-foreground">{integration.name}</p>
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mt-0.5">{integration.category}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1 line-clamp-2">{integration.description}</p>

              {/* Sync info */}
              {integration.lastSync && (
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-muted-foreground/50" />
                  <span className="text-[10px] text-muted-foreground/60">
                    {isDone ? "Just synced!" : `Last sync: ${integration.lastSync}`}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
                {integration.status === "connected" && (
                  <button
                    onClick={(e) => handleSync(integration.id, e)}
                    disabled={!canManage || isSyncing}
                    className={[
                      "flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-40",
                      isDone ? "text-[var(--positive)]" : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
                    {isSyncing ? "Syncing..." : isDone ? "Synced!" : "Sync now"}
                  </button>
                )}
                {integration.status === "disconnected" && (
                  <button
                    disabled={!canManage}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-40"
                  >
                    <Plus className="h-3 w-3" />
                    Connect
                  </button>
                )}
                {integration.status === "error" && (
                  <button
                    disabled={!canManage}
                    className="flex items-center gap-1.5 text-xs font-medium text-[var(--warning)] hover:opacity-80 transition-colors disabled:opacity-40"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Reconnect
                  </button>
                )}
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto">
                  <ExternalLink className="h-3 w-3" />
                  Docs
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Detail Drawer ─────────────────────────────────────────── */}
      <DrawerPanel
        open={drawerMode === "detail"}
        onClose={() => setDrawerMode(null)}
        title="Integration Details"
        subtitle={selectedIntegration?.name}
        footer={
          selectedIntegration && (
            <div className="flex items-center gap-2">
              {selectedIntegration.status === "connected" && (
                <Button
                  size="sm"
                  className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!canManage || syncing === selectedIntegration.id}
                  onClick={(e) => handleSync(selectedIntegration.id, e as any)}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${syncing === selectedIntegration.id ? "animate-spin" : ""}`} />
                  {syncing === selectedIntegration.id ? "Syncing..." : syncDone === selectedIntegration.id ? "Synced!" : "Sync Now"}
                </Button>
              )}
              {selectedIntegration.status === "disconnected" && canManage && (
                <Button size="sm" className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-3.5 w-3.5" />
                  Connect
                </Button>
              )}
              {canManage && selectedIntegration.status === "connected" && (
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Unplug className="h-3.5 w-3.5" />
                  Disconnect
                </Button>
              )}
            </div>
          )
        }
      >
        {selectedIntegration && (
          <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm" style={{ background: selectedIntegration.color }}>
                {selectedIntegration.logo}
              </div>
              <div>
                <p className="font-semibold text-foreground">{selectedIntegration.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[selectedIntegration.status].dot}`} />
                  <span className={`text-xs ${STATUS_CONFIG[selectedIntegration.status].color}`}>
                    {STATUS_CONFIG[selectedIntegration.status].label}
                  </span>
                  <span className="text-[10px] text-muted-foreground bg-secondary border border-border px-1.5 py-0.5 rounded-full">{selectedIntegration.category}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">{selectedIntegration.description}</p>

            {/* Stats */}
            {selectedIntegration.status === "connected" && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Last Sync",       value: selectedIntegration.lastSync ?? "—",  icon: Clock },
                  { label: "Sync Frequency",  value: selectedIntegration.syncFrequency ?? "—", icon: RefreshCw },
                  { label: "Records Imported", value: selectedIntegration.recordsImported?.toLocaleString() ?? "—", icon: Activity },
                  { label: "Status",          value: "Healthy",                             icon: CheckCircle2 },
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
            )}

            {/* Features */}
            <div>
              <p className="text-xs font-semibold text-foreground mb-2">Included Features</p>
              <div className="flex flex-col gap-1.5">
                {selectedIntegration.features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--positive)] flex-shrink-0" />
                    <span className="text-xs text-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Error state */}
            {selectedIntegration.status === "error" && (
              <div className="bg-[var(--warning)]/8 border border-[var(--warning)]/25 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />
                  <p className="text-xs font-semibold text-[var(--warning)]">Connection Error</p>
                </div>
                <p className="text-xs text-muted-foreground">The OAuth token has expired. Please reconnect to restore the integration.</p>
              </div>
            )}

            {!canManage && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 border border-border rounded-lg px-3 py-2.5">
                <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                Managing integrations requires Admin role.
              </div>
            )}
          </div>
        )}
      </DrawerPanel>

      {/* ── New Integration Drawer ────────────────────────────────── */}
      <DrawerPanel
        open={drawerMode === "new"}
        onClose={() => setDrawerMode(null)}
        title="Add New Integration"
        subtitle="Connect a custom data source or webhook"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setDrawerMode(null)}>Cancel</Button>
            <Button size="sm" className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => { setNewSaved(true); setTimeout(() => { setNewSaved(false); setDrawerMode(null) }, 1200) }}>
              {newSaved ? "Connected!" : "Connect"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <NField label="Integration Name">
            <input value={newForm.name} onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Custom Webhook" className="input-field" />
          </NField>
          <NField label="Category">
            <select value={newForm.category} onChange={(e) => setNewForm((f) => ({ ...f, category: e.target.value }))} className="input-field">
              {["Advertising", "Analytics", "CRM", "Email", "Notifications", "Other"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </NField>
          <NField label="API Key">
            <input type="password" value={newForm.apiKey} onChange={(e) => setNewForm((f) => ({ ...f, apiKey: e.target.value }))} placeholder="••••••••••••" className="input-field" />
          </NField>
          <NField label="Webhook URL (optional)">
            <input value={newForm.webhookUrl} onChange={(e) => setNewForm((f) => ({ ...f, webhookUrl: e.target.value }))} placeholder="https://..." className="input-field" />
          </NField>
          <p className="text-[11px] text-muted-foreground leading-relaxed p-3 bg-secondary/50 rounded-lg border border-border">
            API keys are encrypted at rest. MarketPulse will only use read access for data imports.
          </p>
        </div>
      </DrawerPanel>
    </div>
  )
}

function NField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  )
}

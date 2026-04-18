"use client"

import { useState } from "react"
import { AlertTriangle, Info, CheckCircle2, Bell, Plus, Trash2, Check, Lock, Pencil } from "lucide-react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { DrawerPanel } from "@/components/ui/drawer-panel"

interface Alert {
  id: number
  severity: "critical" | "warning" | "info" | "success"
  title: string
  message: string
  channel: string
  time: string
  read: boolean
}

interface Rule {
  id: number
  name: string
  condition: string
  channel: string
  metric: string
  threshold: string
  enabled: boolean
}

const ALL_ALERTS: Alert[] = [
  { id: 1, severity: "critical", title: "Conversion Rate Below Threshold", message: "Conversion rate fell below 2% threshold on Google Ads. Average over the past 72 hours is 1.4%. Immediate review recommended.", channel: "Paid Search", time: "10 min ago", read: false },
  { id: 2, severity: "warning",  title: "Budget Pacing Alert — Meta Ads", message: "Meta Ads spend is at 85% of monthly budget with 9 days remaining. At current pace, budget will be exhausted in 6 days.", channel: "Paid Social", time: "2 hours ago", read: false },
  { id: 3, severity: "warning",  title: "CTR Drop — Google Ads", message: "Click-through rate dropped 18% over the last 3 days across top ad groups. Likely cause: creative fatigue. Consider rotating ad copy.", channel: "Paid Search", time: "3 hours ago", read: false },
  { id: 4, severity: "info",     title: "Weekly Report Delivered", message: "Scheduled weekly marketing summary sent to 6 recipients at 9:00 AM.", channel: "Email", time: "Yesterday", read: true },
  { id: 5, severity: "success",  title: "Email Campaign Completed", message: "Newsletter April 2026 completed with 14% CTR — 2.3x above benchmark. 812 conversions attributed.", channel: "Email", time: "2 days ago", read: true },
  { id: 6, severity: "info",     title: "New Integration: LinkedIn Ads", message: "LinkedIn Ads integration synced successfully. 82,000 impressions imported.", channel: "Paid Social", time: "3 days ago", read: true },
  { id: 7, severity: "warning",  title: "ROAS Below Target — LinkedIn", message: "LinkedIn Sponsored Posts ROAS is 1.4x against a target of 3x. Consider pausing or adjusting targeting.", channel: "Paid Social", time: "4 days ago", read: true },
  { id: 8, severity: "success",  title: "Organic Traffic Milestone", message: "Organic SEO crossed 700k monthly impressions for the first time. 3 blog posts ranking in top 3 positions.", channel: "Organic SEO", time: "5 days ago", read: true },
]

const INITIAL_RULES: Rule[] = [
  { id: 1, name: "Conversion Rate Drop",   condition: "CVR falls below",     channel: "All Channels",            metric: "CVR",   threshold: "2%",  enabled: true  },
  { id: 2, name: "Budget Pacing",          condition: "Monthly spend exceeds", channel: "Paid Search, Paid Social", metric: "Spend", threshold: "80%", enabled: true  },
  { id: 3, name: "ROAS Below Target",      condition: "ROAS drops below",     channel: "All Channels",            metric: "ROAS",  threshold: "3x",  enabled: false },
  { id: 4, name: "CTR Anomaly",            condition: "CTR changes >",        channel: "Paid Search",             metric: "CTR",   threshold: "15%", enabled: true  },
]

const SEVERITY_CONFIG = {
  critical: { icon: AlertTriangle, borderColor: "border-l-[var(--negative)]",  iconColor: "text-[var(--negative)]",  badge: "bg-[var(--negative)]/15 text-[var(--negative)] border-[var(--negative)]/30",  label: "Critical" },
  warning:  { icon: AlertTriangle, borderColor: "border-l-[var(--warning)]",   iconColor: "text-[var(--warning)]",   badge: "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30",   label: "Warning"  },
  info:     { icon: Info,          borderColor: "border-l-primary",            iconColor: "text-primary",            badge: "bg-primary/15 text-primary border-primary/30",                              label: "Info"     },
  success:  { icon: CheckCircle2,  borderColor: "border-l-[var(--positive)]",  iconColor: "text-[var(--positive)]",  badge: "bg-[var(--positive)]/15 text-[var(--positive)] border-[var(--positive)]/30", label: "Success"  },
}

const FILTER_OPTS = ["All", "Unread", "Critical", "Warning", "Info", "Success"]

const EMPTY_RULE = { name: "", condition: "CVR falls below", channel: "All Channels", metric: "CVR", threshold: "", enabled: true }
const CHANNELS_LIST = ["All Channels", "Paid Search", "Paid Social", "Email", "Organic SEO", "Referral"]
const METRICS_LIST  = ["CVR", "CTR", "ROAS", "Spend", "CPC", "Impressions", "Conversions"]

export function AlertsPage() {
  const { can } = useApp()
  const [activeFilter, setActiveFilter] = useState("All")
  const [alerts, setAlerts]             = useState(ALL_ALERTS)
  const [rules, setRules]               = useState(INITIAL_RULES)
  const [activeTab, setActiveTab]       = useState<"alerts" | "rules">("alerts")
  const [drawerMode, setDrawerMode]     = useState<"newRule" | "editRule" | null>(null)
  const [editingRule, setEditingRule]   = useState<Rule | null>(null)
  const [ruleForm, setRuleForm]         = useState({ ...EMPTY_RULE })
  const [ruleSaved, setRuleSaved]       = useState(false)

  const canManage = can("manageAlerts")

  const markAllRead = () => canManage && setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
  const markRead    = (id: number) => canManage && setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, read: true } : a))
  const deleteAlert = (id: number) => canManage && setAlerts((prev) => prev.filter((a) => a.id !== id))
  const toggleRule  = (id: number) => canManage && setRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r))
  const deleteRule  = (id: number) => canManage && setRules((prev) => prev.filter((r) => r.id !== id))

  const openNewRule = () => {
    setRuleForm({ ...EMPTY_RULE })
    setEditingRule(null)
    setRuleSaved(false)
    setDrawerMode("newRule")
  }

  const openEditRule = (rule: Rule) => {
    setRuleForm({ name: rule.name, condition: rule.condition, channel: rule.channel, metric: rule.metric, threshold: rule.threshold, enabled: rule.enabled })
    setEditingRule(rule)
    setRuleSaved(false)
    setDrawerMode("editRule")
  }

  const handleSaveRule = () => {
    if (editingRule) {
      setRules((prev) => prev.map((r) => r.id === editingRule.id ? { ...r, ...ruleForm } : r))
    } else {
      setRules((prev) => [...prev, { ...ruleForm, id: Date.now() }])
    }
    setRuleSaved(true)
    setTimeout(() => { setRuleSaved(false); setDrawerMode(null) }, 1000)
  }

  const filtered = alerts.filter((a) => {
    if (activeFilter === "All")    return true
    if (activeFilter === "Unread") return !a.read
    return a.severity === activeFilter.toLowerCase()
  })

  const unreadCount = alerts.filter((a) => !a.read).length

  return (
    <div className="px-5 lg:px-8 py-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            Alerts
            {unreadCount > 0 && (
              <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center tabular-nums">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {unreadCount} unread &middot; {alerts.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canManage ? (
            <>
              <button
                onClick={markAllRead}
                className="h-8 px-3 text-xs border border-border rounded-lg bg-secondary text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
                Mark all read
              </button>
              {activeTab === "rules" && (
                <Button size="sm" className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={openNewRule}>
                  <Plus className="h-3.5 w-3.5" />
                  Create Rule
                </Button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary border border-border rounded-lg px-3 py-1.5">
              <Lock className="h-3.5 w-3.5" />
              Manager role required to manage alerts
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 bg-secondary border border-border rounded-lg p-0.5 w-fit mb-5">
        {(["alerts", "rules"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={[
              "px-4 py-1.5 rounded-md text-xs font-medium transition-colors",
              activeTab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {t === "alerts" ? "Alert Feed" : "Alert Rules"}
          </button>
        ))}
      </div>

      {activeTab === "alerts" ? (
        <>
          {/* Filter chips */}
          <div className="flex items-center gap-1.5 flex-wrap mb-4">
            {FILTER_OPTS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={[
                  "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                  activeFilter === f
                    ? "bg-primary/12 text-primary border-primary/30"
                    : "text-muted-foreground border-border hover:text-foreground hover:bg-secondary",
                ].join(" ")}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {filtered.length === 0 ? (
              <div className="bg-card border border-border rounded-xl py-16 flex flex-col items-center gap-3">
                <Bell className="h-8 w-8 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">No alerts match this filter</p>
              </div>
            ) : (
              filtered.map((alert) => {
                const cfg  = SEVERITY_CONFIG[alert.severity]
                const Icon = cfg.icon
                return (
                  <div
                    key={alert.id}
                    className={[
                      "bg-card border border-l-4 border-border rounded-xl p-4 transition-all",
                      cfg.borderColor,
                      !alert.read ? "shadow-sm" : "opacity-75",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${cfg.iconColor}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">{alert.title}</span>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${cfg.badge}`}>
                              {cfg.label}
                            </span>
                            {!alert.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                            {canManage && !alert.read && (
                              <button onClick={() => markRead(alert.id)} className="text-[10px] text-primary hover:opacity-80 font-medium">
                                Mark read
                              </button>
                            )}
                            {canManage && (
                              <button onClick={() => deleteAlert(alert.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{alert.message}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                          <span className="text-[10px] text-muted-foreground/60">{alert.channel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-3">
          {rules.map((rule) => (
            <div key={rule.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{rule.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {rule.condition} <span className="font-semibold text-foreground">{rule.threshold}</span>
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-muted-foreground bg-secondary border border-border px-1.5 py-0.5 rounded-full">{rule.metric}</span>
                  <span className="text-[10px] text-muted-foreground">{rule.channel}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  disabled={!canManage}
                  onClick={() => toggleRule(rule.id)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-40 ${rule.enabled ? "bg-primary" : "bg-muted"}`}
                  title={rule.enabled ? "Disable rule" : "Enable rule"}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${rule.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
                {canManage && (
                  <>
                    <button onClick={() => openEditRule(rule)} className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteRule(rule.id)} className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {rules.length === 0 && (
            <div className="bg-card border border-border rounded-xl py-12 flex flex-col items-center gap-3">
              <Bell className="h-8 w-8 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">No alert rules configured</p>
              {canManage && (
                <Button size="sm" className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 mt-1" onClick={openNewRule}>
                  <Plus className="h-3.5 w-3.5" />
                  Create first rule
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Rule Drawer ───────────────────────────────────────────── */}
      <DrawerPanel
        open={drawerMode === "newRule" || drawerMode === "editRule"}
        onClose={() => setDrawerMode(null)}
        title={drawerMode === "editRule" ? "Edit Alert Rule" : "New Alert Rule"}
        subtitle={drawerMode === "editRule" ? editingRule?.name : "Define when MarketPulse should notify you"}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setDrawerMode(null)}>Cancel</Button>
            <Button size="sm" className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSaveRule}>
              {ruleSaved ? "Saved!" : drawerMode === "editRule" ? "Save Changes" : "Create Rule"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <RField label="Rule Name">
            <input value={ruleForm.name} onChange={(e) => setRuleForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Low ROAS Alert" className="input-field" />
          </RField>
          <div className="grid grid-cols-2 gap-3">
            <RField label="Metric">
              <select value={ruleForm.metric} onChange={(e) => setRuleForm((f) => ({ ...f, metric: e.target.value }))} className="input-field">
                {METRICS_LIST.map((m) => <option key={m}>{m}</option>)}
              </select>
            </RField>
            <RField label="Threshold">
              <input value={ruleForm.threshold} onChange={(e) => setRuleForm((f) => ({ ...f, threshold: e.target.value }))} placeholder="e.g. 3x or 80%" className="input-field" />
            </RField>
          </div>
          <RField label="Condition">
            <input value={ruleForm.condition} onChange={(e) => setRuleForm((f) => ({ ...f, condition: e.target.value }))} placeholder="e.g. falls below, exceeds" className="input-field" />
          </RField>
          <RField label="Channel Scope">
            <select value={ruleForm.channel} onChange={(e) => setRuleForm((f) => ({ ...f, channel: e.target.value }))} className="input-field">
              {CHANNELS_LIST.map((c) => <option key={c}>{c}</option>)}
            </select>
          </RField>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <p className="text-xs font-medium text-foreground">Enable immediately</p>
              <p className="text-[10px] text-muted-foreground">Rule will fire when condition is met</p>
            </div>
            <button
              onClick={() => setRuleForm((f) => ({ ...f, enabled: !f.enabled }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${ruleForm.enabled ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${ruleForm.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>
      </DrawerPanel>
    </div>
  )
}

function RField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  )
}

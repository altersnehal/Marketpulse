"use client"

import { useState } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  Megaphone,
  Target,
  Users,
  MousePointerClick,
  DollarSign,
  TrendingUp,
  Rocket,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// ── Types & constants ───────────────────────────────────────────────────────
const CHANNEL_CONFIG: Record<string, { color: string; bg: string; abbr: string; desc: string }> = {
  "Paid Search":  { color: "#4285F4", bg: "#EBF2FF", abbr: "G",  desc: "Google / Bing search ads" },
  "Paid Social":  { color: "#1877F2", bg: "#DBEAFE", abbr: "M",  desc: "Meta, LinkedIn, TikTok" },
  "Email":        { color: "#D97706", bg: "#FEF3C7", abbr: "Em", desc: "Newsletter & sequences" },
  "Organic SEO":  { color: "#16A34A", bg: "#DCFCE7", abbr: "Se", desc: "Content & SEO" },
  "Referral":     { color: "#6B7280", bg: "#F3F4F6", abbr: "Re", desc: "Partners & affiliates" },
}

const CAMPAIGN_GOALS = [
  { id: "awareness",   label: "Brand Awareness", icon: Megaphone,        desc: "Maximize reach & impressions",     roasSuggestion: 1.5 },
  { id: "traffic",     label: "Traffic",          icon: Users,            desc: "Drive clicks to landing page",    roasSuggestion: 2.0 },
  { id: "leads",       label: "Lead Gen",         icon: Target,           desc: "Capture qualified leads",         roasSuggestion: 3.0 },
  { id: "conversions", label: "Conversions",      icon: MousePointerClick, desc: "Drive purchase / sign-up",       roasSuggestion: 4.0 },
  { id: "revenue",     label: "Revenue",          icon: DollarSign,       desc: "Maximize return on spend",        roasSuggestion: 5.0 },
  { id: "retention",   label: "Retention",        icon: TrendingUp,       desc: "Re-engage existing customers",    roasSuggestion: 8.0 },
]

const AUDIENCE_TYPES = ["Prospecting", "Retargeting", "Lookalike", "CRM / Email List", "Contextual"]
const GEO_OPTIONS    = ["Global", "United States", "North America", "Europe", "APAC", "Custom"]

const EMPTY_FORM = {
  name: "", channel: "", goal: "", status: "Active",
  budget: "", startDate: "", endDate: "",
  roasTarget: "", cpaTarget: "",
  audiences: [] as string[],
  geo: "United States", notes: "",
}

function StepBadge({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
      done ? "bg-primary text-primary-foreground" :
      active ? "bg-primary/20 text-primary ring-2 ring-primary/30" :
      "bg-secondary text-muted-foreground"
    }`}>
      {done ? <CheckCircle2 className="h-4 w-4" /> : n}
    </div>
  )
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-1.5">
      <label className="text-xs font-medium text-muted-foreground">{children}</label>
      {hint && <span className="text-[10px] text-muted-foreground/60">{hint}</span>}
    </div>
  )
}

interface NewCampaignPageProps {
  onBack: () => void
  onLaunch: () => void
}

export function NewCampaignPage({ onBack, onLaunch }: NewCampaignPageProps) {
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [launched, setLaunched] = useState(false)

  const patch = (p: Partial<typeof EMPTY_FORM>) => setForm(f => ({ ...f, ...p }))
  const toggleAudience = (a: string) =>
    patch({ audiences: form.audiences.includes(a) ? form.audiences.filter(x => x !== a) : [...form.audiences, a] })

  const budgetNum    = parseFloat(form.budget) || 0
  const startD       = form.startDate ? new Date(form.startDate) : null
  const endD         = form.endDate   ? new Date(form.endDate)   : null
  const durationDays = startD && endD ? Math.max(1, Math.ceil((endD.getTime() - startD.getTime()) / 86400000)) : null
  const dailyBudget  = durationDays && budgetNum ? budgetNum / durationDays : null
  const goalCfg      = CAMPAIGN_GOALS.find(g => g.id === form.goal)

  const step1Done = !!(form.name && form.channel)
  const step2Done = !!form.goal
  const step3Done = !!(form.budget && form.startDate && form.endDate)
  const step4Done = !!form.roasTarget
  const canLaunch = step1Done && step2Done && step3Done

  const handleLaunch = () => {
    setLaunched(true)
    setTimeout(() => { onLaunch() }, 1600)
  }

  if (launched) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-6">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Rocket className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-1">Campaign Launched! 🎉</h2>
          <p className="text-sm text-muted-foreground">{form.name || "Your campaign"} is now live.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 lg:px-8 py-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">New Campaign</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Configure your campaign details — takes about 2 minutes</p>
        </div>
        {/* Step progress */}
        <div className="hidden lg:flex items-center gap-2">
          {[
            { n: 1, label: "Identity",  done: step1Done },
            { n: 2, label: "Goal",      done: step2Done },
            { n: 3, label: "Budget",    done: step3Done },
            { n: 4, label: "Targets",   done: step4Done },
            { n: 5, label: "Audience",  done: false },
          ].map((s, i, arr) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <StepBadge n={s.n} active={false} done={s.done} />
                <span className="text-[9px] text-muted-foreground">{s.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className={`w-8 h-px mb-3 ${s.done ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── Left col: form ── */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* Section 1: Identity */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <StepBadge n={1} active done={step1Done} />
              <div>
                <p className="text-sm font-semibold text-foreground">Campaign Identity</p>
                <p className="text-xs text-muted-foreground">Name your campaign and choose the channel</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <FieldLabel hint="Be specific — include channel & quarter">Campaign Name *</FieldLabel>
                <input
                  value={form.name}
                  onChange={e => patch({ name: e.target.value })}
                  placeholder="e.g. Q2 Brand Awareness — Google Search"
                  className="input-field"
                />
              </div>

              <div>
                <FieldLabel>Channel *</FieldLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                  {Object.entries(CHANNEL_CONFIG).map(([ch, cfg]) => {
                    const selected = form.channel === ch
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => patch({ channel: ch })}
                        className={[
                          "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all",
                          selected
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-border hover:border-muted-foreground/30 hover:bg-secondary/60",
                        ].join(" ")}
                      >
                        <span className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
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

              <div>
                <FieldLabel>Initial Status</FieldLabel>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {["Active", "Paused", "Draft"].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => patch({ status: s })}
                      className={[
                        "py-2 rounded-xl border text-xs font-medium transition-all",
                        form.status === s
                          ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/30"
                          : "border-border text-muted-foreground hover:border-muted-foreground/30",
                      ].join(" ")}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Goal */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <StepBadge n={2} active done={step2Done} />
              <div>
                <p className="text-sm font-semibold text-foreground">Campaign Goal</p>
                <p className="text-xs text-muted-foreground">Choose the primary objective — affects optimization & targets</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CAMPAIGN_GOALS.map(g => {
                const selected = form.goal === g.id
                const Icon = g.icon
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => patch({ goal: g.id, roasTarget: String(g.roasSuggestion) })}
                    className={[
                      "flex flex-col items-start gap-1.5 px-4 py-3.5 rounded-xl border text-left transition-all",
                      selected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:border-muted-foreground/30 hover:bg-secondary/60",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${selected ? "bg-primary/15" : "bg-secondary"}`}>
                        <Icon className={`h-3.5 w-3.5 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      {selected && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <p className="text-[11.5px] font-semibold text-foreground leading-tight">{g.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{g.desc}</p>
                    {selected && <p className="text-[10px] text-primary font-semibold">Suggested ROAS: {g.roasSuggestion}x</p>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 3: Budget & Schedule */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <StepBadge n={3} active done={step3Done} />
              <div>
                <p className="text-sm font-semibold text-foreground">Budget & Schedule</p>
                <p className="text-xs text-muted-foreground">Set your total spend cap and flight dates</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Total Budget (USD) *</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                    <input type="number" value={form.budget} onChange={e => patch({ budget: e.target.value })} placeholder="50,000" className="input-field pl-6" />
                  </div>
                </div>
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
                <div>
                  <FieldLabel>Start Date *</FieldLabel>
                  <input type="date" value={form.startDate} onChange={e => patch({ startDate: e.target.value })} className="input-field" />
                </div>
                <div>
                  <FieldLabel>End Date *</FieldLabel>
                  <input type="date" value={form.endDate} onChange={e => patch({ endDate: e.target.value })} className="input-field" />
                </div>
              </div>

              {durationDays && budgetNum > 0 && (
                <div className="rounded-xl bg-secondary/60 border border-border px-4 py-3 grid grid-cols-3 gap-4 text-center">
                  <div><p className="text-[10px] text-muted-foreground mb-0.5">Duration</p><p className="text-sm font-bold text-foreground">{durationDays}d</p></div>
                  <div><p className="text-[10px] text-muted-foreground mb-0.5">Daily Budget</p><p className="text-sm font-bold text-primary">${dailyBudget?.toFixed(0)}</p></div>
                  <div><p className="text-[10px] text-muted-foreground mb-0.5">Total</p><p className="text-sm font-bold text-foreground">${budgetNum.toLocaleString()}</p></div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Performance Targets */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <StepBadge n={4} active done={step4Done} />
              <div>
                <p className="text-sm font-semibold text-foreground">Performance Targets</p>
                <p className="text-xs text-muted-foreground">Define what success looks like</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel hint={goalCfg ? `Suggested: ${goalCfg.roasSuggestion}x` : undefined}>ROAS Target</FieldLabel>
                  <div className="relative">
                    <input type="number" step="0.1" value={form.roasTarget} onChange={e => patch({ roasTarget: e.target.value })} placeholder={goalCfg ? String(goalCfg.roasSuggestion) : "3.5"} className="input-field pr-6" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">x</span>
                  </div>
                </div>
                <div>
                  <FieldLabel hint="optional">Max CPA Target</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                    <input type="number" value={form.cpaTarget} onChange={e => patch({ cpaTarget: e.target.value })} placeholder="45" className="input-field pl-6" />
                  </div>
                </div>
              </div>

              {form.roasTarget && budgetNum > 0 && (
                <div className="rounded-xl bg-[var(--positive)]/5 border border-[var(--positive)]/20 px-5 py-4">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">Projected Return at {form.roasTarget}x ROAS</p>
                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Revenue</p>
                      <p className="text-lg font-bold text-[var(--positive)]">${(budgetNum * parseFloat(form.roasTarget)).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Profit</p>
                      <p className="text-lg font-bold text-foreground">${((budgetNum * parseFloat(form.roasTarget)) - budgetNum).toLocaleString()}</p>
                    </div>
                    {form.cpaTarget && (
                      <div>
                        <p className="text-[10px] text-muted-foreground">Est. Conversions</p>
                        <p className="text-lg font-bold text-foreground">{Math.round(budgetNum / parseFloat(form.cpaTarget)).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Audience */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <StepBadge n={5} active done={false} />
              <div>
                <p className="text-sm font-semibold text-foreground">Audience & Targeting</p>
                <p className="text-xs text-muted-foreground">Define who this campaign reaches</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <FieldLabel hint="select all that apply">Audience Type</FieldLabel>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {AUDIENCE_TYPES.map(a => {
                    const on = form.audiences.includes(a)
                    return (
                      <button key={a} type="button" onClick={() => toggleAudience(a)}
                        className={["px-3 py-1 rounded-full text-[11px] font-medium border transition-all", on ? "bg-primary/10 border-primary/40 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/40"].join(" ")}>
                        {a}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <FieldLabel>Geographic Focus</FieldLabel>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {GEO_OPTIONS.map(g => (
                    <button key={g} type="button" onClick={() => patch({ geo: g })}
                      className={["px-3 py-1 rounded-full text-[11px] font-medium border transition-all", form.geo === g ? "bg-primary/10 border-primary/40 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/40"].join(" ")}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel hint="optional">Creative Notes</FieldLabel>
                <textarea value={form.notes} onChange={e => patch({ notes: e.target.value })} placeholder="Key messages, creative direction, landing page URL..." rows={3} className="input-field h-auto py-2 resize-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right col: summary ── */}
        <div className="xl:col-span-1">
          <div className="sticky top-20">
            <div className="bg-card border border-border rounded-2xl p-5 mb-4">
              <p className="text-xs font-semibold text-foreground mb-4">Campaign Summary</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Name",    value: form.name || "—" },
                  { label: "Channel", value: form.channel || "—" },
                  { label: "Goal",    value: goalCfg?.label || "—" },
                  { label: "Budget",  value: budgetNum > 0 ? `$${budgetNum.toLocaleString()}` : "—" },
                  { label: "Period",  value: durationDays ? `${durationDays} days` : "—" },
                  { label: "ROAS Target", value: form.roasTarget ? `${form.roasTarget}x` : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground">{label}</span>
                    <span className={`text-[11px] font-medium text-right max-w-[60%] truncate ${value === "—" ? "text-muted-foreground/40" : "text-foreground"}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Readiness */}
            <div className={`rounded-xl border p-4 mb-4 ${canLaunch ? "bg-[var(--positive)]/5 border-[var(--positive)]/20" : "bg-secondary border-border"}`}>
              <div className="flex items-center gap-2 mb-2">
                {canLaunch
                  ? <CheckCircle2 className="h-4 w-4 text-[var(--positive)]" />
                  : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                }
                <span className={`text-xs font-semibold ${canLaunch ? "text-[var(--positive)]" : "text-muted-foreground"}`}>
                  {canLaunch ? "Ready to Launch" : "Complete required fields"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {[
                  { label: "Campaign name", done: !!form.name },
                  { label: "Channel selected", done: !!form.channel },
                  { label: "Goal chosen", done: !!form.goal },
                  { label: "Budget & dates set", done: !!(form.budget && form.startDate && form.endDate) },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${done ? "bg-[var(--positive)]" : "bg-muted-foreground/30"}`} />
                    <span className={`text-[11px] ${done ? "text-muted-foreground" : "text-muted-foreground/50"}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                className="w-full h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!canLaunch}
                onClick={handleLaunch}
              >
                <Rocket className="h-4 w-4" />
                Launch Campaign
              </Button>
              <Button variant="outline" className="w-full h-9 text-xs" onClick={onBack}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

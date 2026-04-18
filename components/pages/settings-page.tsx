"use client"

import { useState } from "react"
import { Globe, Palette, Database, Users, Lock, Sun, Moon, Check } from "lucide-react"
import { useApp, USER_ROLES, DEMO_USERS, type UserRole } from "@/lib/app-context"
import { Button } from "@/components/ui/button"

const SECTION_TABS = ["General", "Appearance", "Data & Privacy", "User Management"] as const
type SectionTab = (typeof SECTION_TABS)[number]

const CURRENCIES = ["USD ($)", "EUR (€)", "GBP (£)", "JPY (¥)", "CAD ($)"]
const DATE_FORMATS = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]
const REFRESH_INTERVALS = ["5 minutes", "15 minutes", "30 minutes", "1 hour", "Manual only"]

export function SettingsPage() {
  const { isDark, toggleTheme, can, user, setUser } = useApp()
  const [activeTab, setActiveTab] = useState<SectionTab>("General")
  const [saved, setSaved] = useState(false)
  const [currency, setCurrency] = useState("USD ($)")
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY")
  const [refreshInterval, setRefreshInterval] = useState("15 minutes")

  const canManage = can("manageSettings")

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="px-5 lg:px-8 py-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-lg font-bold text-foreground">App Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Configure your workspace preferences</p>
        </div>
        {canManage ? (
          <Button onClick={handleSave} size="sm" className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
            {saved ? <><Check className="h-3.5 w-3.5" />Saved!</> : "Save Changes"}
          </Button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary border border-border rounded-md px-3 py-1.5">
            <Lock className="h-3.5 w-3.5" />
            Settings management requires Admin role
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 bg-secondary border border-border rounded-md p-0.5 w-fit mb-5 flex-wrap">
        {SECTION_TABS.map((t) => {
          const icons: Record<SectionTab, React.ElementType> = {
            General: Globe,
            Appearance: Palette,
            "Data & Privacy": Database,
            "User Management": Users,
          }
          const Icon = icons[t]
          return (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t}
            </button>
          )
        })}
      </div>

      {activeTab === "General" && (
        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          <div className="p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Workspace Preferences</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Default Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  disabled={!canManage}
                  className="w-full h-9 px-3 text-xs bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
                >
                  {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Date Format</label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  disabled={!canManage}
                  className="w-full h-9 px-3 text-xs bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
                >
                  {DATE_FORMATS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Data Refresh Interval</label>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(e.target.value)}
                  disabled={!canManage}
                  className="w-full h-9 px-3 text-xs bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
                >
                  {REFRESH_INTERVALS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="p-5">
            <h2 className="text-sm font-semibold text-foreground mb-1">Workspace Name</h2>
            <p className="text-xs text-muted-foreground mb-3">This appears in reports and notifications</p>
            <input
              type="text"
              defaultValue="MarketPulse Workspace"
              disabled={!canManage}
              className="w-full max-w-sm h-9 px-3 text-xs bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
            />
          </div>
        </div>
      )}

      {activeTab === "Appearance" && (
        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          <div className="p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Theme</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={!isDark ? undefined : toggleTheme}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  !isDark ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
                }`}
              >
                <div className="h-12 w-20 rounded-md bg-white border border-gray-200 flex items-center justify-center">
                  <Sun className="h-5 w-5 text-yellow-500" />
                </div>
                <span className="text-xs font-medium text-foreground">Light Mode</span>
              </button>
              <button
                onClick={isDark ? undefined : toggleTheme}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  isDark ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
                }`}
              >
                <div className="h-12 w-20 rounded-md bg-gray-900 border border-gray-700 flex items-center justify-center">
                  <Moon className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-xs font-medium text-foreground">Dark Mode</span>
              </button>
            </div>
          </div>
          <div className="p-5">
            <h2 className="text-sm font-semibold text-foreground mb-1">Sidebar Style</h2>
            <p className="text-xs text-muted-foreground mb-3">Currently: Compact with labels at 1024px+</p>
            <div className="flex items-center gap-2">
              {["Compact", "Full", "Icon-only"].map((style) => (
                <button
                  key={style}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    style === "Compact"
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "text-muted-foreground border-border hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Data & Privacy" && (
        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          <div className="p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Data Retention</h2>
            <div className="flex flex-col gap-4">
              {[
                { label: "Raw data retention", value: "24 months", desc: "How long raw event data is stored" },
                { label: "Aggregated data retention", value: "Indefinite", desc: "Summarized metrics retained forever" },
                { label: "Report history", value: "12 months", desc: "How long generated reports are available" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-5">
            <h2 className="text-sm font-semibold text-foreground mb-1 text-[var(--negative)]">Danger Zone</h2>
            <p className="text-xs text-muted-foreground mb-4">These actions are irreversible</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                disabled={!canManage}
                className="h-8 px-3 text-xs border border-[var(--warning)]/40 rounded-md text-[var(--warning)] hover:bg-[var(--warning)]/10 transition-colors disabled:opacity-40"
              >
                Export All Data
              </button>
              <button
                disabled={!canManage}
                className="h-8 px-3 text-xs border border-[var(--negative)]/40 rounded-md text-[var(--negative)] hover:bg-[var(--negative)]/10 transition-colors disabled:opacity-40"
              >
                Delete Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "User Management" && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Team Members</h2>
              <p className="text-xs text-muted-foreground mt-0.5">4 active users across roles</p>
            </div>
            {can("manageUsers") && (
              <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                Invite User
              </Button>
            )}
          </div>
          <div className="divide-y divide-border">
            {(Object.keys(DEMO_USERS) as UserRole[]).map((role) => {
              const demo = DEMO_USERS[role]
              const roleConfig = USER_ROLES[role]
              const isCurrentUser = user.role === role
              return (
                <div key={role} className="flex items-center gap-4 px-5 py-4">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border flex-shrink-0 ${roleConfig.color}`}>
                    {demo.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{demo.name}</p>
                      {isCurrentUser && (
                        <span className="text-[9px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{demo.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block">{demo.department}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${roleConfig.color}`}>
                    {roleConfig.label}
                  </span>
                  {can("manageUsers") && !isCurrentUser && (
                    <button className="text-xs text-muted-foreground hover:text-[var(--negative)] transition-colors">
                      Remove
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

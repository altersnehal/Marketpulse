"use client"

import { useState } from "react"
import {
  User,
  Bell,
  Shield,
  Lock,
  Save,
  Check,
  Eye,
  EyeOff,
  ChevronDown,
  BarChart2,
  Megaphone,
  FileText,
  Plug,
  Settings,
} from "lucide-react"
import { useApp, USER_ROLES, DEMO_USERS, type UserRole } from "@/lib/app-context"
import { Button } from "@/components/ui/button"

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Singapore",
]

const TABS = ["Profile", "Notifications", "Security", "Permissions", "User Views"] as const
type Tab = (typeof TABS)[number]

// What each role can see in the dashboard — for the "User Views" tab
const ROLE_VIEWS: Record<
  UserRole,
  {
    pages: string[]
    highlights: string[]
    restrictions: string[]
    tagline: string
  }
> = {
  admin: {
    tagline: "Full access to all features, settings, users, billing, and integrations.",
    pages: ["Overview", "Campaigns", "Analytics", "Reports", "Integrations", "Alerts", "Settings", "Profile"],
    highlights: [
      "Create, edit, and delete campaigns",
      "Manage all integrations and API connections",
      "Full report creation and export",
      "User management and role assignment",
      "Billing and subscription access",
      "Manage alert rules and thresholds",
    ],
    restrictions: [],
  },
  manager: {
    tagline: "Can create and manage campaigns, reports, and alerts. No billing or integration access.",
    pages: ["Overview", "Campaigns", "Analytics", "Reports", "Alerts", "Profile"],
    highlights: [
      "Create and edit campaigns",
      "Create and export reports",
      "Manage alert rules",
      "View all analytics data",
    ],
    restrictions: [
      "Cannot delete campaigns",
      "Cannot manage integrations",
      "No billing access",
      "Cannot manage other users",
    ],
  },
  analyst: {
    tagline: "Read-only analytics access. Can view and export data but cannot create or edit.",
    pages: ["Overview", "Analytics", "Reports", "Alerts", "Profile"],
    highlights: [
      "View all dashboard data",
      "Export reports and data",
      "View and filter alerts",
    ],
    restrictions: [
      "Cannot create or edit campaigns",
      "Cannot create reports (only view)",
      "Cannot manage alert rules",
      "No integration access",
    ],
  },
  viewer: {
    tagline: "Read-only access to overview and basic reports. No edit or export capabilities.",
    pages: ["Overview", "Reports", "Alerts", "Profile"],
    highlights: [
      "View overview dashboard",
      "View saved reports",
      "View alert feed",
    ],
    restrictions: [
      "Cannot edit campaigns",
      "Cannot export data",
      "No alert rule management",
      "No integration or settings access",
    ],
  },
}

const PAGE_ICONS: Record<string, React.ElementType> = {
  Overview:     BarChart2,
  Campaigns:    Megaphone,
  Analytics:    BarChart2,
  Reports:      FileText,
  Integrations: Plug,
  Alerts:       Bell,
  Settings:     Settings,
  Profile:      User,
}

export function ProfilePage() {
  const { user, setUser, can } = useApp()
  const [activeTab, setActiveTab] = useState<Tab>("Profile")
  const [saved, setSaved] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [localUser, setLocalUser] = useState({ ...user })
  const [previewRole, setPreviewRole] = useState<UserRole>(user.role)

  const handleSave = () => {
    setUser(localUser)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleNotification = (key: keyof typeof localUser.notifications) => {
    setLocalUser((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }))
  }

  const permissions = USER_ROLES[user.role].permissions
  const roleView = ROLE_VIEWS[previewRole]
  const allPages = ["Overview", "Campaigns", "Analytics", "Reports", "Integrations", "Alerts", "Settings", "Profile"]

  return (
    <div className="px-5 lg:px-8 py-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-lg font-bold text-foreground">Profile Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage your account, notifications, and security</p>
        </div>
        <Button
          onClick={handleSave}
          size="sm"
          className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {saved ? <><Check className="h-3.5 w-3.5" />Saved!</> : <><Save className="h-3.5 w-3.5" />Save Changes</>}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* ── Left panel: avatar + role switcher ───────────────── */}
        <div className="lg:w-64 flex-shrink-0 flex flex-col gap-3">
          {/* Avatar card */}
          <div className="bg-card border border-border rounded-xl p-5 flex flex-col items-center gap-3 text-center">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold ${USER_ROLES[user.role].bgColor}`}>
              {user.avatar}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${USER_ROLES[user.role].color}`}>
              {USER_ROLES[user.role].label}
            </span>
            <p className="text-xs text-muted-foreground">{user.department}</p>
          </div>

          {/* Role switcher */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Shield className="h-3 w-3" />
              Demo: Switch Role View
            </p>
            <div className="flex flex-col gap-1">
              {(Object.keys(DEMO_USERS) as UserRole[]).map((role) => {
                const demo    = DEMO_USERS[role]
                const isActive = user.role === role
                return (
                  <button
                    key={role}
                    onClick={() => { setUser(demo); setLocalUser(demo); setPreviewRole(role) }}
                    className={[
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all",
                      isActive ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                    ].join(" ")}
                  >
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${USER_ROLES[role].bgColor}`}>
                      {demo.avatar}
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <p className="font-medium truncate">{demo.name}</p>
                      <p className="text-[10px] opacity-60 truncate">{USER_ROLES[role].label}</p>
                    </div>
                    {isActive && <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Right panel ───────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Tab bar */}
          <div className="flex items-center gap-0.5 bg-secondary border border-border rounded-lg p-0.5 w-fit mb-5 flex-wrap">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={[
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                  activeTab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </div>

          {/* ── Profile tab ────────────────────────────────────── */}
          {activeTab === "Profile" && (
            <div className="bg-card border border-border rounded-xl">
              <div className="p-5">
                <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Full Name",   key: "name",       value: localUser.name },
                    { label: "Email",       key: "email",      value: localUser.email },
                    { label: "Department",  key: "department", value: localUser.department },
                  ].map((field) => (
                    <ProfileField key={field.key} label={field.label}>
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => setLocalUser((p) => ({ ...p, [field.key]: e.target.value }))}
                        className="input-field"
                      />
                    </ProfileField>
                  ))}
                  <ProfileField label="Timezone">
                    <div className="relative">
                      <select
                        value={localUser.timezone}
                        onChange={(e) => setLocalUser((p) => ({ ...p, timezone: e.target.value }))}
                        className="input-field appearance-none pr-8"
                      >
                        {TIMEZONES.map((tz) => <option key={tz}>{tz}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </ProfileField>
                </div>
              </div>
            </div>
          )}

          {/* ── Notifications tab ──────────────────────────────── */}
          {activeTab === "Notifications" && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Notification Preferences
              </h2>
              <div className="flex flex-col divide-y divide-border">
                {[
                  { key: "email" as const, label: "Email Notifications",  desc: "Alert summaries and report deliveries" },
                  { key: "push"  as const, label: "Push Notifications",    desc: "Real-time critical alerts in browser" },
                  { key: "weekly" as const, label: "Weekly Digest",        desc: "Performance summary every Monday morning" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => toggleNotification(item.key)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${localUser.notifications[item.key] ? "bg-primary" : "bg-muted"}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${localUser.notifications[item.key] ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Security tab ───────────────────────────────────── */}
          {activeTab === "Security" && (
            <div className="flex flex-col gap-3">
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Change Password
                </h2>
                <div className="flex flex-col gap-4 max-w-sm">
                  {["Current Password", "New Password", "Confirm New Password"].map((label, i) => (
                    <ProfileField key={label} label={label}>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="input-field pr-9"
                        />
                        {i === 1 && (
                          <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                    </ProfileField>
                  ))}
                  <Button size="sm" className="h-8 text-xs w-fit bg-primary text-primary-foreground hover:bg-primary/90">
                    Update Password
                  </Button>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-foreground mb-1">Two-Factor Authentication</h2>
                <p className="text-xs text-muted-foreground mb-4">Add an extra layer of security to your account.</p>
                <button className="h-8 px-3 text-xs border border-border rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
                  Enable 2FA
                </button>
              </div>
            </div>
          )}

          {/* ── Permissions tab ────────────────────────────────── */}
          {activeTab === "Permissions" && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Role Permissions — {USER_ROLES[user.role].label}
                  </h2>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ml-1 ${USER_ROLES[user.role].color}`}>
                    {user.role}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Permissions are role-based and cannot be edited individually.
                </p>
              </div>
              <div className="divide-y divide-border">
                {Object.entries(permissions).map(([key, allowed]) => {
                  const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())
                  return (
                    <div key={key} className="flex items-center justify-between px-5 py-3">
                      <span className="text-xs text-foreground">{label}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${allowed ? "bg-[var(--positive)]/15 text-[var(--positive)] border-[var(--positive)]/30" : "bg-muted text-muted-foreground border-border"}`}>
                        {allowed ? "Allowed" : "Restricted"}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── User Views tab ─────────────────────────────────── */}
          {activeTab === "User Views" && (
            <div className="flex flex-col gap-4">
              {/* Role selector */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-foreground mb-1">Preview Role Experience</h2>
                <p className="text-xs text-muted-foreground mb-4">See exactly what each user role has access to in the dashboard.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.keys(DEMO_USERS) as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => setPreviewRole(role)}
                      className={[
                        "flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all",
                        previewRole === role
                          ? "border-primary/40 bg-primary/8"
                          : "border-border hover:border-primary/20 hover:bg-secondary/50",
                      ].join(" ")}
                    >
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-bold ${USER_ROLES[role].bgColor}`}>
                        {DEMO_USERS[role].avatar}
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground text-[11px]">{DEMO_USERS[role].name.split(" ")[0]}</p>
                        <p className={`text-[9px] font-semibold mt-0.5 ${previewRole === role ? "text-primary" : "text-muted-foreground"}`}>
                          {USER_ROLES[role].label}
                        </p>
                      </div>
                      {previewRole === role && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Role summary */}
              <div className={`border rounded-xl p-4 ${USER_ROLES[previewRole].color.includes("negative") ? "border-[var(--negative)]/20 bg-[var(--negative)]/5" : USER_ROLES[previewRole].color.includes("primary") ? "border-primary/20 bg-primary/5" : USER_ROLES[previewRole].color.includes("warning") ? "border-[var(--warning)]/20 bg-[var(--warning)]/5" : "border-border bg-secondary/30"}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${USER_ROLES[previewRole].bgColor}`}>
                    {DEMO_USERS[previewRole].avatar}
                  </div>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full border ${USER_ROLES[previewRole].color}`}>
                    {USER_ROLES[previewRole].label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{roleView.tagline}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Accessible pages */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-xs font-semibold text-foreground mb-3">Accessible Pages</p>
                  <div className="flex flex-col gap-1.5">
                    {allPages.map((page) => {
                      const Icon      = PAGE_ICONS[page] ?? BarChart2
                      const hasAccess = roleView.pages.includes(page)
                      return (
                        <div key={page} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg ${hasAccess ? "bg-[var(--positive)]/8" : "opacity-40"}`}>
                          <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${hasAccess ? "text-[var(--positive)]" : "text-muted-foreground"}`} />
                          <span className="text-xs text-foreground flex-1">{page}</span>
                          {hasAccess
                            ? <Check className="h-3.5 w-3.5 text-[var(--positive)]" />
                            : <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                          }
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Capabilities */}
                <div className="flex flex-col gap-3">
                  <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-[var(--positive)]" />
                      Capabilities
                    </p>
                    <div className="flex flex-col gap-2">
                      {roleView.highlights.map((h) => (
                        <div key={h} className="flex items-start gap-2">
                          <Check className="h-3 w-3 text-[var(--positive)] flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-muted-foreground leading-snug">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {roleView.restrictions.length > 0 && (
                    <div className="bg-card border border-border rounded-xl p-4">
                      <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                        Restrictions
                      </p>
                      <div className="flex flex-col gap-2">
                        {roleView.restrictions.map((r) => (
                          <div key={r} className="flex items-start gap-2">
                            <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-muted-foreground leading-snug">{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProfileField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  )
}

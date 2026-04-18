"use client"

import {
  LayoutDashboard,
  Megaphone,
  BarChart3,
  FileText,
  Plug,
  Bell,
  Settings,
  HelpCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react"
import { useApp, type Page, USER_ROLES } from "@/lib/app-context"
import { useState } from "react"
import { alertsData } from "@/lib/mock-data"

interface NavItem {
  icon: React.ElementType
  label: string
  page: Page
  badge?: number
  permission?: string  // if set, only show when user has this permission
}

const NAV_MAIN: NavItem[] = [
  { icon: LayoutDashboard, label: "Overview",     page: "overview" },
  { icon: Megaphone,       label: "Campaigns",    page: "campaigns", permission: "viewDashboard" },
  { icon: BarChart3,       label: "Analytics",    page: "analytics", permission: "viewDashboard" },
  { icon: FileText,        label: "Reports",      page: "reports",   permission: "viewReports" },
  { icon: Plug,            label: "Integrations", page: "integrations", permission: "manageIntegrations" },
  {
    icon: Bell,
    label: "Alerts",
    page: "alerts",
    permission: "viewAlerts",
    badge: alertsData.filter((a) => a.severity === "critical").length,
  },
]

const NAV_BOTTOM: NavItem[] = [
  { icon: Users,    label: "Profile",  page: "profile" },
  { icon: Settings, label: "Settings", page: "settings", permission: "manageSettings" },
]

function NavButton({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
  const { activePage, setActivePage } = useApp()
  const Icon = item.icon
  const isActive = activePage === item.page

  return (
    <button
      onClick={() => setActivePage(item.page)}
      aria-current={isActive ? "page" : undefined}
      className={[
        "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary font-medium",
        isCollapsed ? "justify-center" : ""
      ].join(" ")}
      title={isCollapsed ? item.label : undefined}
    >
      <Icon className="h-[17px] w-[17px] flex-shrink-0" />
      {!isCollapsed && <span className="hidden lg:block flex-1 text-left leading-none">{item.label}</span>}
      {!isCollapsed && item.badge && item.badge > 0 ? (
        <span className="hidden lg:flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive/10 text-[10px] font-bold text-destructive px-1.5 tabular-nums">
          {item.badge}
        </span>
      ) : null}
    </button>
  )
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user } = useApp()
  const role = USER_ROLES[user.role]

  return (
    <aside className={`hidden md:flex flex-col bg-sidebar border-r border-sidebar-border flex-shrink-0 z-30 transition-all duration-300 ease-in-out relative ${isCollapsed ? "w-[52px]" : "w-[52px] lg:w-[216px]"}`}>
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute -right-3 top-6 h-6 w-6 bg-card border border-border rounded-full items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary z-40 transition-colors shadow-sm"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Role badge (expanded only) */}
      {!isCollapsed && (
        <div className="hidden lg:flex items-center gap-2 px-4 pt-4 pb-2">
          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${role.bgColor}`}>
            {user.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-foreground truncate leading-none">{user.name}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">{role.label}</p>
          </div>
          <ShieldCheck className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
        </div>
      )}

      <nav
        className="flex-1 flex flex-col gap-0.5 px-3 py-5 overflow-y-auto"
        aria-label="Main navigation"
      >
        <p className={`hidden lg:block text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-3 mb-2 transition-opacity duration-300 ${isCollapsed ? "opacity-0 invisible" : "opacity-100"}`}>
          Menu
        </p>
        {NAV_MAIN
          .filter(item => !item.permission || USER_ROLES[user.role].permissions[item.permission])
          .map((item) => (
            <NavButton key={item.page} item={item} isCollapsed={isCollapsed} />
          ))}
      </nav>

      <div className="flex flex-col gap-0.5 px-3 py-4 border-t border-sidebar-border">
        {NAV_BOTTOM
          .filter(item => !item.permission || USER_ROLES[user.role].permissions[item.permission])
          .map((item) => (
            <NavButton key={item.page} item={item} isCollapsed={isCollapsed} />
          ))}
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Help Center">
          <HelpCircle className="h-[17px] w-[17px] flex-shrink-0" />
          {!isCollapsed && <span className="hidden lg:block leading-none">Help Center</span>}
        </button>
      </div>
    </aside>
  )
}

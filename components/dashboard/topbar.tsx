"use client"

import { useState, useEffect } from "react"
import {
  Bell,
  ChevronDown,
  RefreshCw,
  Moon,
  Sun,
  User,
  LogOut,
  Settings,
  Shield,
  UserCog,
  Check,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { alertsData } from "@/lib/mock-data"
import { useApp, DEMO_USERS, USER_ROLES, type UserRole, type Page } from "@/lib/app-context"
import { useTheme } from "next-themes"

const DATE_PRESETS = [
  "Last 7 days",
  "Last 14 days",
  "Last 30 days",
  "Last 90 days",
  "This quarter",
]
const CHANNELS = ["All Channels", "Paid Search", "Organic SEO", "Email", "Paid Social", "Referral"]

interface TopbarProps {
  onRefresh: () => void
  isRefreshing: boolean
}

export function Topbar({
  onRefresh,
  isRefreshing,
}: TopbarProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { user, setUser, activePage, setActivePage, dateRange, setDateRange, channel, setChannel } = useApp()
  const [mounted, setMounted] = useState(false)
  const isDark = mounted && resolvedTheme === "dark"
  const [showAlerts, setShowAlerts] = useState(false)
  const criticalCount = alertsData.filter((a) => a.severity === "critical").length

  // Ensure next-themes is mounted before rendering theme toggle
  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border flex-shrink-0">
      <div className="flex h-[58px] items-center gap-4 px-5 lg:px-6">
        {/* Brand */}
        <div className="flex items-center flex-shrink-0 mr-4">
          <img
            src="/logo.png"
            alt="MarketPulse"
            className="h-8 w-auto object-contain hidden sm:block"
          />
          {/* Mobile fallback — just icon portion */}
          <img
            src="/logo.png"
            alt="MarketPulse"
            className="h-7 w-7 object-cover object-left sm:hidden rounded"
          />
        </div>

        {/* Search */}
        <label className="hidden md:flex items-center gap-2 h-8 px-3 bg-secondary rounded-lg border border-border text-sm text-muted-foreground flex-1 max-w-[260px] cursor-text focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
          <Search className="h-3.5 w-3.5 flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="flex-1 text-xs bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
          />
          <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/60 font-mono">
            <span>⌘</span><span>K</span>
          </kbd>
        </label>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right controls */}
        <div className="flex items-center gap-1.5">
          {/* Date range */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 text-foreground hidden sm:flex"
              >
                {dateRange}
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Date Range</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {DATE_PRESETS.map((d) => (
                <DropdownMenuItem key={d} onSelect={() => setDateRange(d)} className="text-xs cursor-pointer gap-2">
                  {d === dateRange && <Check className="h-3 w-3 text-primary" />}
                  <span className={d === dateRange ? "text-primary font-medium" : ""}>{d}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Channel filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 text-foreground hidden lg:flex"
              >
                {channel}
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Channel</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {CHANNELS.map((c) => (
                <DropdownMenuItem key={c} onSelect={() => setChannel(c)} className="text-xs cursor-pointer gap-2">
                  {c === channel && <Check className="h-3 w-3 text-primary" />}
                  <span className={c === channel ? "text-primary font-medium" : ""}>{c}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            title="Refresh data"
            className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            title={resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {mounted && resolvedTheme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>

          {/* Alerts bell */}
          <DropdownMenu open={showAlerts} onOpenChange={setShowAlerts}>
            <DropdownMenuTrigger asChild>
              <button className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary relative transition-colors">
                <Bell className="h-3.5 w-3.5" />
                {criticalCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="text-xs font-semibold flex items-center justify-between pb-2">
                Recent Alerts
                <Badge variant="outline" className="text-[10px] h-4 font-normal">
                  {alertsData.length} new
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {alertsData.map((alert) => (
                <DropdownMenuItem
                  key={alert.id}
                  className="flex flex-col items-start gap-1 py-2.5 cursor-pointer"
                  onSelect={() => setActivePage("alerts")}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                      alert.severity === "critical" ? "bg-destructive"
                      : alert.severity === "warning" ? "bg-[var(--warning)]"
                      : "bg-primary"
                    }`} />
                    <span className="text-xs text-foreground flex-1 line-clamp-2">{alert.message}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground pl-3.5">{alert.time}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-xs text-primary cursor-pointer justify-center font-medium py-2"
                onSelect={() => { setActivePage("alerts"); setShowAlerts(false) }}
              >
                View all alerts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 h-8 pl-1 pr-2 rounded-lg hover:bg-secondary transition-colors ml-0.5">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${USER_ROLES[user.role].bgColor}`}>
                  {user.avatar}
                </div>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-[12px] font-semibold text-foreground leading-none">{user.name}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{USER_ROLES[user.role].label}</span>
                </div>
                <ChevronDown className="hidden lg:block h-3 w-3 text-muted-foreground ml-0.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2.5 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${USER_ROLES[user.role].bgColor}`}>
                    {user.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="py-1">
                <DropdownMenuItem className="text-xs cursor-pointer gap-2 mx-1 rounded-md" onSelect={() => setActivePage("profile")}>
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs cursor-pointer gap-2 mx-1 rounded-md" onSelect={() => setActivePage("settings")}>
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  App Settings
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-xs gap-2 mx-1 rounded-md cursor-pointer">
                    <UserCog className="h-3.5 w-3.5 text-muted-foreground" />
                    Switch User View
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-52">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Shield className="h-3 w-3" /> Demo: Role Switcher
                      </p>
                    </div>
                    {(Object.keys(DEMO_USERS) as UserRole[]).map((role) => {
                      const demo = DEMO_USERS[role]
                      return (
                        <DropdownMenuItem key={role} onSelect={() => setUser(demo)} className="text-xs cursor-pointer gap-2 mx-1 rounded-md my-0.5">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${USER_ROLES[role].bgColor}`}>
                            {demo.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground font-medium truncate">{demo.name}</p>
                            <p className="text-muted-foreground text-[10px]">{USER_ROLES[role].label}</p>
                          </div>
                          {user.role === role && <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </div>
              <DropdownMenuSeparator />
              <div className="py-1">
                <DropdownMenuItem className="text-xs text-destructive cursor-pointer gap-2 mx-1 rounded-md">
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Top Tabs for Mobile/Tablet */}
      <div className="md:hidden border-t border-border overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 px-4 py-2 min-w-max">
          {[
            { label: "Overview", page: "overview" },
            { label: "Campaigns", page: "campaigns" },
            { label: "Analytics", page: "analytics" },
            { label: "Reports", page: "reports" },
            { label: "Integrations", page: "integrations" },
            { label: "Alerts", page: "alerts", badge: criticalCount },
          ].map((item) => {
            const isActive = activePage === item.page
            return (
              <button
                key={item.page}
                onClick={() => setActivePage(item.page as Page)}
                className={[
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                ].join(" ")}
              >
                {item.label}
                {item.badge ? (
                  <span className={["flex h-4 min-w-[16px] items-center justify-center rounded-full text-[9px] font-bold px-1 tabular-nums", isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-destructive/10 text-destructive"].join(" ")}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}


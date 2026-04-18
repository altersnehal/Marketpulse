"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"

// ─── Pages ────────────────────────────────────────────────────────────────────
export type Page =
  | "overview"
  | "campaigns"
  | "analytics"
  | "reports"
  | "integrations"
  | "alerts"
  | "settings"
  | "profile"

// ─── Roles ────────────────────────────────────────────────────────────────────
export type UserRole = "admin" | "manager" | "analyst" | "viewer"

export interface UserProfile {
  name: string
  email: string
  role: UserRole
  avatar: string
  department: string
  timezone: string
  notifications: { email: boolean; push: boolean; weekly: boolean }
}

// ─── Role definitions ─────────────────────────────────────────────────────────
export const USER_ROLES: Record<
  UserRole,
  {
    label: string
    color: string      // badge color classes
    bgColor: string    // avatar bg
    permissions: Record<string, boolean>
  }
> = {
  admin: {
    label: "Admin",
    color: "bg-[var(--negative)]/15 text-[var(--negative)] border-[var(--negative)]/30",
    bgColor: "bg-[var(--negative)]/20 text-[var(--negative)]",
    permissions: {
      viewDashboard: true,
      editCampaigns: true,
      deleteCampaigns: true,
      viewReports: true,
      exportReports: true,
      createReports: true,
      manageIntegrations: true,
      viewAlerts: true,
      manageAlerts: true,
      manageUsers: true,
      viewBilling: true,
      manageSettings: true,
    },
  },
  manager: {
    label: "Marketing Manager",
    color: "bg-primary/15 text-primary border-primary/30",
    bgColor: "bg-primary/20 text-primary",
    permissions: {
      viewDashboard: true,
      editCampaigns: true,
      deleteCampaigns: false,
      viewReports: true,
      exportReports: true,
      createReports: true,
      manageIntegrations: false,
      viewAlerts: true,
      manageAlerts: true,
      manageUsers: false,
      viewBilling: false,
      manageSettings: false,
    },
  },
  analyst: {
    label: "Analyst",
    color: "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30",
    bgColor: "bg-[var(--warning)]/20 text-[var(--warning)]",
    permissions: {
      viewDashboard: true,
      editCampaigns: false,
      deleteCampaigns: false,
      viewReports: true,
      exportReports: true,
      createReports: false,
      manageIntegrations: false,
      viewAlerts: true,
      manageAlerts: false,
      manageUsers: false,
      viewBilling: false,
      manageSettings: false,
    },
  },
  viewer: {
    label: "Viewer",
    color: "bg-muted text-muted-foreground border-border",
    bgColor: "bg-muted text-muted-foreground",
    permissions: {
      viewDashboard: true,
      editCampaigns: false,
      deleteCampaigns: false,
      viewReports: true,
      exportReports: false,
      createReports: false,
      manageIntegrations: false,
      viewAlerts: true,
      manageAlerts: false,
      manageUsers: false,
      viewBilling: false,
      manageSettings: false,
    },
  },
}

// ─── Demo users ──────────────────────────────────────────────────────────────
export const DEMO_USERS: Record<UserRole, UserProfile> = {
  admin: {
    name: "Alex Chen",
    email: "alex.chen@marketpulse.io",
    role: "admin",
    avatar: "AC",
    department: "Engineering",
    timezone: "America/Los_Angeles",
    notifications: { email: true, push: true, weekly: true },
  },
  manager: {
    name: "Sarah Mitchell",
    email: "sarah.mitchell@marketpulse.io",
    role: "manager",
    avatar: "SM",
    department: "Marketing",
    timezone: "America/New_York",
    notifications: { email: true, push: false, weekly: true },
  },
  analyst: {
    name: "Raj Patel",
    email: "raj.patel@marketpulse.io",
    role: "analyst",
    avatar: "RP",
    department: "Data & Analytics",
    timezone: "America/Chicago",
    notifications: { email: true, push: true, weekly: false },
  },
  viewer: {
    name: "Linda Torres",
    email: "linda.torres@marketpulse.io",
    role: "viewer",
    avatar: "LT",
    department: "Sales",
    timezone: "America/Denver",
    notifications: { email: false, push: false, weekly: true },
  },
}

// ─── Context type ─────────────────────────────────────────────────────────────
interface AppContextValue {
  activePage: Page
  setActivePage: (p: Page) => void
  user: UserProfile
  setUser: (u: UserProfile) => void
  can: (permission: string) => boolean
  dateRange: string
  setDateRange: (d: string) => void
  channel: string
  setChannel: (c: string) => void
}

// ─── Default values for SSR safety ───────────────────────────────────────────
const defaultContext: AppContextValue = {
  activePage: "overview",
  setActivePage: () => {},
  user: DEMO_USERS.manager,
  setUser: () => {},
  can: () => false,
  dateRange: "Last 30 days",
  setDateRange: () => {},
  channel: "All Channels",
  setChannel: () => {},
}

const AppContext = createContext<AppContextValue>(defaultContext)

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  const [activePage, setActivePage] = useState<Page>("overview")
  const [user, setUserState] = useState<UserProfile>(DEMO_USERS.manager)
  const [dateRange, setDateRange] = useState("Last 30 days")
  const [channel, setChannel] = useState("All Channels")

  const setUser = useCallback((u: UserProfile) => setUserState(u), [])

  const can = useCallback(
    (permission: string) => USER_ROLES[user.role]?.permissions[permission] ?? false,
    [user.role]
  )

  return (
    <AppContext.Provider
      value={{ 
        activePage, setActivePage, 
        user, setUser, 
        can,
        dateRange, setDateRange,
        channel, setChannel
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}

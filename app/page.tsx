"use client"

import { useState, useCallback } from "react"
import { Topbar } from "@/components/dashboard/topbar"
import { Sidebar } from "@/components/dashboard/sidebar"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { TrendCharts } from "@/components/dashboard/trend-charts"
import { ChannelBreakdown } from "@/components/dashboard/channel-breakdown"
import { FunnelChart } from "@/components/dashboard/funnel-chart"
import { CampaignTable } from "@/components/dashboard/campaign-table"
import { AiInsights } from "@/components/dashboard/ai-insights"
import { CampaignsPage } from "@/components/pages/campaigns-page"
import { AnalyticsPage } from "@/components/pages/analytics-page"
import { ReportsPage } from "@/components/pages/reports-page"
import { IntegrationsPage } from "@/components/pages/integrations-page"
import { AlertsPage } from "@/components/pages/alerts-page"
import { ProfilePage } from "@/components/pages/profile-page"
import { SettingsPage } from "@/components/pages/settings-page"
import { NewCampaignPage } from "@/components/pages/new-campaign-page"
import { NewReportPage } from "@/components/pages/new-report-page"
import { useApp } from "@/lib/app-context"

// Extended page type includes full-page "modal" pages
type FullPage = "new-campaign" | "new-report"

function OverviewPage() {
  const { dateRange, channel } = useApp()

  return (
    <div className="px-5 lg:px-7 py-6 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Marketing Overview</h1>
          <p className="text-xs text-muted-foreground mt-1">{dateRange} &middot; {channel}</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--positive)] bg-[var(--positive)]/8 border border-[var(--positive)]/20 rounded-lg px-3 py-1.5 flex-shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--positive)] animate-pulse" />
          Live
        </div>
      </div>

      <section className="mb-4"><KpiCards /></section>
      <section className="mb-4"><TrendCharts /></section>
      <section className="mb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 xl:col-span-8"><FunnelChart /></div>
          <div className="lg:col-span-5 xl:col-span-4"><ChannelBreakdown /></div>
        </div>
      </section>
      <section className="mb-4"><CampaignTable /></section>
      <section className="mb-4"><AiInsights /></section>
      <footer className="text-center py-5">
        <p className="text-[11px] text-muted-foreground/40">
          MarketPulse &copy; 2026 &middot; Data refreshes hourly &middot; All metrics in USD
        </p>
      </footer>
    </div>
  )
}

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [fullPage, setFullPage] = useState<FullPage | null>(null)
  const [reportPrefill, setReportPrefill] = useState<{ label: string; type: string } | null>(null)
  const { activePage, setActivePage } = useApp()

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }, [])

  // Full-page overlays (campaign & report creation) take precedence
  if (fullPage === "new-campaign") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Topbar onRefresh={handleRefresh} isRefreshing={isRefreshing} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <NewCampaignPage
              onBack={() => setFullPage(null)}
              onLaunch={() => { setFullPage(null); setActivePage("campaigns") }}
            />
          </main>
        </div>
      </div>
    )
  }

  if (fullPage === "new-report") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Topbar onRefresh={handleRefresh} isRefreshing={isRefreshing} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <NewReportPage
              prefill={reportPrefill}
              onBack={() => { setFullPage(null); setReportPrefill(null) }}
              onCreate={() => { setFullPage(null); setReportPrefill(null); setActivePage("reports") }}
            />
          </main>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (activePage) {
      case "overview":     return <OverviewPage />
      case "campaigns":    return <CampaignsPage onNewCampaign={() => setFullPage("new-campaign")} />
      case "analytics":    return <AnalyticsPage />
      case "reports":      return (
        <ReportsPage
          onNewReport={() => { setReportPrefill(null); setFullPage("new-report") }}
          onNewReportFromTemplate={(t) => { setReportPrefill(t); setFullPage("new-report") }}
        />
      )
      case "integrations": return <IntegrationsPage />
      case "alerts":       return <AlertsPage />
      case "profile":      return <ProfilePage />
      case "settings":     return <SettingsPage />
      default:             return <OverviewPage />
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Topbar onRefresh={handleRefresh} isRefreshing={isRefreshing} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

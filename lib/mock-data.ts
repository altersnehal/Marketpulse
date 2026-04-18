// Mock data for the marketing analytics dashboard

export const kpiData = [
  {
    id: "traffic",
    label: "Total Traffic",
    value: "2.84M",
    raw: 2840000,
    change: 12.4,
    period: "vs last period",
    icon: "users",
  },
  {
    id: "leads",
    label: "Leads",
    value: "48,320",
    raw: 48320,
    change: 8.1,
    period: "vs last period",
    icon: "target",
  },
  {
    id: "conversions",
    label: "Conversions",
    value: "9,142",
    raw: 9142,
    change: -3.2,
    period: "vs last period",
    icon: "trending-up",
  },
  {
    id: "revenue",
    label: "Revenue",
    value: "$1.23M",
    raw: 1230000,
    change: 18.7,
    period: "vs last period",
    icon: "dollar-sign",
  },
  {
    id: "cac",
    label: "CAC",
    value: "$42.80",
    raw: 42.8,
    change: -5.4,
    period: "vs last period",
    icon: "arrow-down-circle",
    invertColor: true,
  },
  {
    id: "roas",
    label: "ROAS",
    value: "4.8x",
    raw: 4.8,
    change: 9.3,
    period: "vs last period",
    icon: "bar-chart-2",
  },
]

export const trendData = [
  { date: "Mar 1", traffic: 82000, conversions: 820, leads: 1640 },
  { date: "Mar 5", traffic: 91000, conversions: 910, leads: 1820 },
  { date: "Mar 9", traffic: 78000, conversions: 780, leads: 1560 },
  { date: "Mar 13", traffic: 105000, conversions: 1050, leads: 2100 },
  { date: "Mar 17", traffic: 112000, conversions: 1120, leads: 2240 },
  { date: "Mar 21", traffic: 98000, conversions: 980, leads: 1960 },
  { date: "Mar 25", traffic: 125000, conversions: 1250, leads: 2500 },
  { date: "Mar 29", traffic: 119000, conversions: 1190, leads: 2380 },
  { date: "Apr 2", traffic: 134000, conversions: 1340, leads: 2680 },
  { date: "Apr 6", traffic: 141000, conversions: 1410, leads: 2820 },
  { date: "Apr 10", traffic: 128000, conversions: 1280, leads: 2560 },
  { date: "Apr 12", traffic: 155000, conversions: 1550, leads: 3100 },
]

export const channelData = [
  { channel: "Paid Search", impressions: 980000, clicks: 42000, conversions: 3360, cost: 128000, revenue: 672000 },
  { channel: "Organic SEO", impressions: 720000, clicks: 61200, conversions: 2448, cost: 12000, revenue: 489600 },
  { channel: "Email", impressions: 340000, clicks: 47600, conversions: 1904, cost: 8500, revenue: 380800 },
  { channel: "Paid Social", impressions: 560000, clicks: 22400, conversions: 896, cost: 74000, revenue: 179200 },
  { channel: "Organic Social", impressions: 210000, clicks: 18900, conversions: 378, cost: 0, revenue: 75600 },
  { channel: "Referral", impressions: 95000, clicks: 8550, conversions: 171, cost: 2100, revenue: 34200 },
]

export const trafficPieData = [
  { name: "Paid Search", value: 34, color: "#4f8ef7" },
  { name: "Organic SEO", value: 25, color: "#34d9bc" },
  { name: "Email", value: 18, color: "#f5a623" },
  { name: "Paid Social", value: 13, color: "#e05252" },
  { name: "Organic Social", value: 7, color: "#8b8fa8" },
  { name: "Referral", value: 3, color: "#6b7280" },
]

export const campaignData = [
  {
    id: 1,
    name: "Q2 Brand Awareness — Google",
    channel: "Paid Search",
    status: "Active",
    impressions: 412000,
    clicks: 18540,
    ctr: 4.5,
    conversions: 1483,
    cost: 54600,
    revenue: 296600,
    roas: 5.43,
  },
  {
    id: 2,
    name: "Spring Sale — Meta Retargeting",
    channel: "Paid Social",
    status: "Active",
    impressions: 280000,
    clicks: 11200,
    ctr: 4.0,
    conversions: 448,
    cost: 37000,
    revenue: 89600,
    roas: 2.42,
  },
  {
    id: 3,
    name: "Newsletter April 2026",
    channel: "Email",
    status: "Completed",
    impressions: 145000,
    clicks: 20300,
    ctr: 14.0,
    conversions: 812,
    cost: 3600,
    revenue: 162400,
    roas: 45.1,
  },
  {
    id: 4,
    name: "SEO Blog — Demand Gen",
    channel: "Organic SEO",
    status: "Active",
    impressions: 318000,
    clicks: 27030,
    ctr: 8.5,
    conversions: 1081,
    cost: 5200,
    revenue: 216200,
    roas: 41.6,
  },
  {
    id: 5,
    name: "Instagram Story Ads",
    channel: "Paid Social",
    status: "Paused",
    impressions: 198000,
    clicks: 7920,
    ctr: 4.0,
    conversions: 238,
    cost: 28400,
    revenue: 47600,
    roas: 1.68,
  },
  {
    id: 6,
    name: "LinkedIn Sponsored Posts",
    channel: "Paid Social",
    status: "Active",
    impressions: 82000,
    clicks: 3280,
    ctr: 4.0,
    conversions: 131,
    cost: 18700,
    revenue: 26200,
    roas: 1.4,
  },
  {
    id: 7,
    name: "Re-engagement Email Series",
    channel: "Email",
    status: "Active",
    impressions: 96000,
    clicks: 14400,
    ctr: 15.0,
    conversions: 576,
    cost: 2800,
    revenue: 115200,
    roas: 41.1,
  },
  {
    id: 8,
    name: "YouTube Pre-roll — Brand",
    channel: "Paid Search",
    status: "Active",
    impressions: 524000,
    clicks: 9432,
    ctr: 1.8,
    conversions: 377,
    cost: 31200,
    revenue: 75400,
    roas: 2.42,
  },
]

export const funnelData = [
  { stage: "Impressions", value: 2905000, pct: 100 },
  { stage: "Clicks", value: 200650, pct: 6.9 },
  { stage: "Leads", value: 48320, pct: 1.66 },
  { stage: "Sales", value: 9142, pct: 0.31 },
]

export const aiInsights = [
  {
    id: 1,
    type: "warning",
    title: "CTR Drop Detected",
    body: "Google Ads CTR dropped 18% over the last 3 days. Likely cause: ad fatigue on top creatives. Consider rotating ad copy.",
    metric: "-18% CTR",
    channel: "Paid Search",
    time: "3 hours ago",
  },
  {
    id: 2,
    type: "success",
    title: "Email Outperforms Paid",
    body: "Email campaigns are delivering 32% higher ROI than paid social this month. Recommend increasing email send frequency.",
    metric: "+32% ROI",
    channel: "Email",
    time: "6 hours ago",
  },
  {
    id: 3,
    type: "info",
    title: "Organic Traffic Spike",
    body: "SEO traffic is up 24% vs last week, driven by 3 high-ranking blog posts. These pages account for 41% of organic leads.",
    metric: "+24% Traffic",
    channel: "Organic SEO",
    time: "12 hours ago",
  },
  {
    id: 4,
    type: "warning",
    title: "Budget Pacing Alert",
    body: "LinkedIn campaign is pacing 18% over budget with 10 days remaining in the period. Current ROAS is 1.4x — below target of 3x.",
    metric: "+18% Spend",
    channel: "Paid Social",
    time: "1 day ago",
  },
]

// Monthly targets per KPI — used for progress-to-goal bars
export const kpiTargets: Record<string, { raw: number; label: string; invertLower?: boolean }> = {
  traffic:     { raw: 3000000, label: "3M"    },
  leads:       { raw: 55000,   label: "55k"   },
  conversions: { raw: 10000,   label: "10k"   },
  revenue:     { raw: 1500000, label: "$1.5M" },
  cac:         { raw: 40,      label: "$40",   invertLower: true },
  roas:        { raw: 5.0,     label: "5x"    },
}

// Budget pacing per campaign — period Apr 1–30, currently Apr 18 (18 of 30 days elapsed)
export const campaignBudgets: Record<number, {
  monthly: number
  spent: number
  daysElapsed: number
  daysTotal: number
  roasTarget: number
}> = {
  1: { monthly: 65000, spent: 54600, daysElapsed: 18, daysTotal: 30, roasTarget: 4.0  },
  2: { monthly: 42000, spent: 37000, daysElapsed: 18, daysTotal: 30, roasTarget: 3.5  },
  3: { monthly: 4000,  spent: 3600,  daysElapsed: 30, daysTotal: 30, roasTarget: 20.0 },
  4: { monthly: 6000,  spent: 5200,  daysElapsed: 18, daysTotal: 30, roasTarget: 30.0 },
  5: { monthly: 35000, spent: 28400, daysElapsed: 18, daysTotal: 30, roasTarget: 3.0  },
  6: { monthly: 20000, spent: 18700, daysElapsed: 18, daysTotal: 30, roasTarget: 3.0  },
  7: { monthly: 3200,  spent: 2800,  daysElapsed: 18, daysTotal: 30, roasTarget: 20.0 },
  8: { monthly: 38000, spent: 31200, daysElapsed: 18, daysTotal: 30, roasTarget: 3.5  },
}

export const alertsData = [
  { id: 1, severity: "critical", message: "Conversion rate fell below 2% threshold on Google Ads", time: "10 min ago" },
  { id: 2, severity: "warning", message: "Meta Ads spend 85% of monthly budget with 9 days left", time: "2 hours ago" },
  { id: 3, severity: "info", message: "Scheduled report: Weekly Summary sent to 6 recipients", time: "Yesterday" },
]

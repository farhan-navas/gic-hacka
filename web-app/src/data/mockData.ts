// Mock data for the reporting dashboard

export const portfolios = [
  {
    id: "port-001",
    name: "Global Equity Fund",
    value: 250000000,
    type: "equity"
  },
  {
    id: "port-002", 
    name: "Fixed Income Portfolio",
    value: 180000000,
    type: "fixed_income"
  },
  {
    id: "port-003",
    name: "Alternative Investments",
    value: 95000000,
    type: "alternatives"
  },
  {
    id: "port-004",
    name: "Balanced Fund",
    value: 320000000,
    type: "balanced"
  }
];

export const riskMetrics = [
  {
    name: "Value at Risk (VaR)",
    value: 2.3,
    unit: "%",
    benchmark: 2.5,
    status: "good"
  },
  {
    name: "Sharpe Ratio",
    value: 1.45,
    unit: "",
    benchmark: 1.2,
    status: "good"
  },
  {
    name: "Beta",
    value: 0.85,
    unit: "",
    benchmark: 1.0,
    status: "warning"
  },
  {
    name: "Maximum Drawdown",
    value: 8.2,
    unit: "%",
    benchmark: 10.0,
    status: "good"
  },
  {
    name: "Tracking Error",
    value: 3.1,
    unit: "%",
    benchmark: 3.0,
    status: "warning"
  },
  {
    name: "Information Ratio",
    value: 0.68,
    unit: "",
    benchmark: 0.5,
    status: "good"
  }
];

export const performanceData = [
  { date: "2024-01", portfolio: 2.1, benchmark: 1.8 },
  { date: "2024-02", portfolio: -0.5, benchmark: 0.2 },
  { date: "2024-03", portfolio: 3.2, benchmark: 2.9 },
  { date: "2024-04", portfolio: 1.8, benchmark: 1.5 },
  { date: "2024-05", portfolio: -1.2, benchmark: -0.8 },
  { date: "2024-06", portfolio: 2.7, benchmark: 2.3 },
  { date: "2024-07", portfolio: 1.4, benchmark: 1.9 },
  { date: "2024-08", portfolio: -0.8, benchmark: -0.3 },
  { date: "2024-09", portfolio: 2.9, benchmark: 2.4 },
  { date: "2024-10", portfolio: 1.6, benchmark: 1.2 },
  { date: "2024-11", portfolio: 0.9, benchmark: 1.1 },
  { date: "2024-12", portfolio: 2.3, benchmark: 2.0 }
];

export const volatilityData = [
  { date: "2024-01", volatility: 12.5 },
  { date: "2024-02", volatility: 15.2 },
  { date: "2024-03", volatility: 11.8 },
  { date: "2024-04", volatility: 13.4 },
  { date: "2024-05", volatility: 16.7 },
  { date: "2024-06", volatility: 14.1 },
  { date: "2024-07", volatility: 12.9 },
  { date: "2024-08", volatility: 17.3 },
  { date: "2024-09", volatility: 13.6 },
  { date: "2024-10", volatility: 11.2 },
  { date: "2024-11", volatility: 14.8 },
  { date: "2024-12", volatility: 13.1 }
];

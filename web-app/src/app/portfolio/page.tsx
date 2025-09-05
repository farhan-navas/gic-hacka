"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";

// ------------------- Mock Data -------------------
const portfolios = [
  { id: "1", name: "Global Equity Fund", value: 2450000000 },
  { id: "2", name: "Asian Bond Portfolio", value: 1850000000 },
];

const portfolioMetrics = {
  "1": {
    dailyReturns: 0.23,
    portfolioPrice: 2450000000,
    volatility: 8.2,
    trackingError: 1.5,
    cumulativeReturns: 18.7,
  },
  "2": {
    dailyReturns: 0.15,
    portfolioPrice: 1850000000,
    volatility: 5.1,
    trackingError: 2.1,
    cumulativeReturns: 12.3,
  },
} as const;

type PortfolioId = keyof typeof portfolioMetrics;

const timePeriodOptions = [
  { value: "1W", label: "1 Week" },
  { value: "1M", label: "1 Month" },
  { value: "3M", label: "3 Months" },
  { value: "6M", label: "6 Months" },
  { value: "1Y", label: "1 Year" },
];

const metricsList = [
  { key: "dailyReturns", label: "Daily Returns" },
  { key: "portfolioPrice", label: "Portfolio Price" },
  { key: "volatility", label: "Volatility" },
  { key: "trackingError", label: "Tracking Error" },
  { key: "cumulativeReturns", label: "Cumulative Returns" },
];

const portfolioTimeSeries = {
  "1": {
    dailyReturns: [0.2, 0.3, 0.25, 0.22, 0.28, 0.24, 0.27],
    portfolioPrice: [2450, 2455, 2460, 2462, 2465, 2466, 2468],
    volatility: [8.1, 8.3, 8.2, 8.4, 8.2, 8.3, 8.2],
    trackingError: [1.4, 1.5, 1.6, 1.5, 1.5, 1.4, 1.5],
    cumulativeReturns: [18.5, 18.6, 18.7, 18.8, 18.7, 18.6, 18.7],
  },
  "2": {
    dailyReturns: [0.15, 0.18, 0.17, 0.16, 0.19, 0.16, 0.17],
    portfolioPrice: [1850, 1851, 1852, 1853, 1854, 1855, 1856],
    volatility: [5.0, 5.2, 5.1, 5.3, 5.1, 5.2, 5.1],
    trackingError: [2.0, 2.1, 2.2, 2.1, 2.1, 2.0, 2.1],
    cumulativeReturns: [12.2, 12.3, 12.4, 12.3, 12.2, 12.3, 12.3],
  },
};

// ------------------- Utils -------------------
function calcCorrelation(arr1: number[], arr2: number[]): number {
  const n = arr1.length;
  const mean1 = arr1.reduce((a, b) => a + b, 0) / n;
  const mean2 = arr2.reduce((a, b) => a + b, 0) / n;
  const cov =
    arr1.map((v, i) => (v - mean1) * (arr2[i] - mean2)).reduce((a, b) => a + b, 0) / n;
  const std1 = Math.sqrt(arr1.map((v) => (v - mean1) ** 2).reduce((a, b) => a + b, 0) / n);
  const std2 = Math.sqrt(arr2.map((v) => (v - mean2) ** 2).reduce((a, b) => a + b, 0) / n);
  return cov / (std1 * std2);
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const getScenarioColor = (scenario: string) => {
  if (scenario.includes("Base")) return "text-green-600";
  if (scenario.includes("Combined")) return "text-red-600";
  return "text-yellow-600";
};

// ------------------- Component -------------------
export default function PortfolioPage() {
  const [selectedPortfolioA, setSelectedPortfolioA] = useState("1");
  const [selectedPortfolioB, setSelectedPortfolioB] = useState("2");
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("1M");
  const [selectedMetric, setSelectedMetric] = useState("dailyReturns");
  const [marketDropPercent, setMarketDropPercent] = useState([15]);
  const [rateHikePercent, setRateHikePercent] = useState([200]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Stress Test Calculation
  function getStressTestResults(portfolioId: PortfolioId, marketDrop: number, rateHike: number) {
    const base = portfolioMetrics[portfolioId];
    const marketDropFactor = marketDrop / 50;
    const rateHikeFactor = rateHike / 500;

    return [
      { scenario: "Base Case", ...base },
      {
        scenario: `Market Drop ${marketDrop}%`,
        dailyReturns: base.dailyReturns - marketDropFactor * 0.5,
        portfolioPrice: base.portfolioPrice * (1 - marketDropFactor * 0.15),
        volatility: base.volatility + marketDropFactor * 4,
        trackingError: base.trackingError + marketDropFactor * 1,
        cumulativeReturns: base.cumulativeReturns - marketDropFactor * 8,
      },
      {
        scenario: `Rate Hike ${rateHike}bps`,
        dailyReturns: base.dailyReturns - rateHikeFactor * 0.2,
        portfolioPrice: base.portfolioPrice * (1 - rateHikeFactor * 0.05),
        volatility: base.volatility + rateHikeFactor * 2,
        trackingError: base.trackingError + rateHikeFactor * 0.5,
        cumulativeReturns: base.cumulativeReturns - rateHikeFactor * 3,
      },
      {
        scenario: "Combined Stress",
        dailyReturns: base.dailyReturns - (marketDropFactor * 0.5 + rateHikeFactor * 0.2),
        portfolioPrice:
          base.portfolioPrice * (1 - marketDropFactor * 0.15) * (1 - rateHikeFactor * 0.05),
        volatility: base.volatility + (marketDropFactor * 4 + rateHikeFactor * 2),
        trackingError: base.trackingError + (marketDropFactor * 1 + rateHikeFactor * 0.5),
        cumulativeReturns: base.cumulativeReturns - (marketDropFactor * 8 + rateHikeFactor * 3),
      },
    ];
  }

  const stressTestResults = getStressTestResults(
    selectedPortfolioA as PortfolioId,
    marketDropPercent[0],
    rateHikePercent[0]
  );

  // Correlation Matrix
  const portfolioIds = Object.keys(portfolioTimeSeries);
  const correlationMatrix = portfolioIds.map((idA) =>
    portfolioIds.map((idB) => {
      const arrA = portfolioTimeSeries[idA as keyof typeof portfolioTimeSeries]?.[selectedMetric as keyof typeof portfolioTimeSeries["1"]];
      const arrB = portfolioTimeSeries[idB as keyof typeof portfolioTimeSeries]?.[selectedMetric as keyof typeof portfolioTimeSeries["1"]];
      if (!arrA || !arrB || !Array.isArray(arrA) || !Array.isArray(arrB)) return 0;
      return calcCorrelation(arrA, arrB);
    })
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Portfolio Comparison */}
        <div className="financial-card p-8 space-y-6 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">
              Portfolio Comparison
            </h2>
            <div className="flex gap-4">
              <Select value={selectedPortfolioA} onValueChange={setSelectedPortfolioA}>
                <SelectTrigger className="w-56 border-blue-200 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {portfolios.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPortfolioB} onValueChange={setSelectedPortfolioB}>
                <SelectTrigger className="w-56 border-blue-200 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {portfolios.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedTimePeriod} onValueChange={setSelectedTimePeriod}>
                <SelectTrigger className="w-32 border-blue-200 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {timePeriodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[selectedPortfolioA, selectedPortfolioB].map((selected, idx) => {
              const metrics = portfolioMetrics[selected as PortfolioId];
              const portfolio = portfolios.find((p) => p.id === selected);
              if (!metrics || !portfolio) return null;
              return (
                <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-blue-200 hover:shadow-md transition-all duration-200">
                  <h4 className={`font-semibold text-lg mb-3 ${idx === 0 ? "text-blue-700" : "text-green-700"}`}>
                    {portfolio.name}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily Returns:</span>
                      <span className="font-medium text-blue-900">{metrics.dailyReturns.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Portfolio Price:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(metrics.portfolioPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Volatility:</span>
                      <span className="font-medium text-blue-900">{metrics.volatility.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tracking Error:</span>
                      <span className="font-medium text-blue-900">{metrics.trackingError.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cumulative Returns:</span>
                      <span className="font-medium text-blue-900">{metrics.cumulativeReturns.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Correlation Matrix */}
        <div className="financial-card p-8 space-y-6 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Correlation Matrix</h2>
            <div className="flex gap-4">
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-48 border-blue-200 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {metricsList.map((m) => (
                    <SelectItem key={m.key} value={m.key}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedTimePeriod} onValueChange={setSelectedTimePeriod}>
                <SelectTrigger className="w-32 border-blue-200 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {timePeriodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-200">
                  <th className="p-4 text-left font-semibold text-blue-900"></th>
                  {portfolioIds.map((id) => (
                    <th key={id} className="p-4 text-center font-semibold text-blue-900">
                      {portfolios.find((p) => p.id === id)?.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {portfolioIds.map((idA, i) => (
                  <tr key={idA} className="hover:bg-blue-50/50 border-b border-blue-100">
                    <td className="p-4 font-semibold text-blue-900 bg-blue-50/30">
                      {portfolios.find((p) => p.id === idA)?.name}
                    </td>
                    {portfolioIds.map((idB, j) => {
                      const corr = correlationMatrix[i]?.[j] ?? 0;
                      return (
                        <td key={idB} className="p-4 text-center font-mono font-medium text-gray-700">
                          {corr.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stress Testing */}
        <div className="financial-card p-8 space-y-6 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2 flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Stress Testing Scenarios
            </h2>
            <Select value={selectedPortfolioA} onValueChange={(v) => setSelectedPortfolioA(v)}>
              <SelectTrigger className="w-56 border-blue-200 focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Select Portfolio" />
              </SelectTrigger>
              <SelectContent>
                {portfolios.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
              <label className="text-sm font-semibold text-blue-700 mb-4 block">
                Market Drop Scenario
              </label>
              <Slider
                value={marketDropPercent}
                onValueChange={setMarketDropPercent}
                min={5}
                max={50}
                step={5}
                className="w-full [&>span]:bg-blue-600 [&>span]:h-4 [&>span]:w-4"
              />
              <div className="flex justify-between text-xs text-blue-600 mt-3">
                <span>5%</span>
                <span className="font-bold bg-blue-100 px-2 py-1 rounded">{marketDropPercent[0]}% Drop</span>
                <span>50%</span>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
              <label className="text-sm font-semibold text-purple-700 mb-4 block">
                Interest Rate Hike
              </label>
              <Slider
                value={rateHikePercent}
                onValueChange={setRateHikePercent}
                min={50}
                max={500}
                step={25}
                className="w-full [&>span]:bg-purple-600 [&>span]:h-4 [&>span]:w-4"
              />
              <div className="flex justify-between text-xs text-purple-600 mt-3">
                <span>50bps</span>
                <span className="font-bold bg-purple-100 px-2 py-1 rounded">{rateHikePercent[0]}bps Hike</span>
                <span>500bps</span>
              </div>
            </div>
          </div>

          {/* Stress Test Results Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200 overflow-hidden mt-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-200">
                  <TableHead className="font-semibold text-blue-900">Scenario</TableHead>
                  <TableHead className="font-semibold text-blue-900">Daily Returns</TableHead>
                  <TableHead className="font-semibold text-blue-900">Portfolio Price</TableHead>
                  <TableHead className="font-semibold text-blue-900">Volatility</TableHead>
                  <TableHead className="font-semibold text-blue-900">Tracking Error</TableHead>
                  <TableHead className="font-semibold text-blue-900">Cumulative Returns</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stressTestResults.map((result, idx) => (
                  <TableRow key={idx} className="hover:bg-blue-50/50 border-b border-blue-100">
                    <TableCell className={`font-semibold ${getScenarioColor(result.scenario)}`}>
                      {result.scenario}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {result.dailyReturns > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">{result.dailyReturns.toFixed(2)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-700">
                      {formatCurrency(result.portfolioPrice)}
                    </TableCell>
                    <TableCell className="font-medium text-gray-700">
                      {result.volatility.toFixed(2)}%
                    </TableCell>
                    <TableCell className="font-medium text-gray-700">
                      {result.trackingError.toFixed(2)}%
                    </TableCell>
                    <TableCell className="font-medium text-gray-700">
                      {result.cumulativeReturns.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}





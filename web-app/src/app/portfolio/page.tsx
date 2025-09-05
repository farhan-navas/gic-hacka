"use client";

import { useState } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";

// ------------------- Mock Data -------------------
const portfolios = [
  { id: "1", name: "Global Equity Fund", value: 2450000000 },
  { id: "2", name: "Asian Bond Portfolio", value: 1850000000 },
];

const portfolioMetrics = {
  "1": { dailyReturns: 0.23, portfolioPrice: 2450000000, volatility: 8.2, trackingError: 1.5, cumulativeReturns: 18.7 },
  "2": { dailyReturns: 0.15, portfolioPrice: 1850000000, volatility: 5.1, trackingError: 2.1, cumulativeReturns: 12.3 },
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
  const cov = arr1.map((v, i) => (v - mean1) * (arr2[i] - mean2)).reduce((a, b) => a + b, 0) / n;
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
  const [selectedPortfolioA, setSelectedPortfolioA] = useState(portfolios[0].id);
  const [selectedPortfolioB, setSelectedPortfolioB] = useState(portfolios[1].id);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("1M");
  const [selectedMetric, setSelectedMetric] = useState("dailyReturns");
  const [marketDropPercent, setMarketDropPercent] = useState([15]);
  const [rateHikePercent, setRateHikePercent] = useState([200]);

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
        portfolioPrice: base.portfolioPrice * (1 - marketDropFactor * 0.15) * (1 - rateHikeFactor * 0.05),
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
      if (!arrA || !arrB) return NaN;
      return calcCorrelation(arrA, arrB);
    })
  );

  return (
    <div className="space-y-6 p-6">
      {/* Portfolio Comparison Section */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex gap-4">
            <Select value={selectedPortfolioA} onValueChange={setSelectedPortfolioA}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                {portfolios.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedPortfolioB} onValueChange={setSelectedPortfolioB}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                {portfolios.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Select value={selectedTimePeriod} onValueChange={setSelectedTimePeriod}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Select period" /></SelectTrigger>
            <SelectContent>
              {timePeriodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[selectedPortfolioA, selectedPortfolioB].map((selected, idx) => {
              const metrics = portfolioMetrics[selected as PortfolioId];
              return (
                <div key={idx} className="space-y-1 text-sm">
                  <h4 className={`font-medium ${idx === 0 ? "text-blue-600" : "text-green-600"}`}>
                    {portfolios.find((p) => p.id === selected)?.name}
                  </h4>
                  <div>Daily Returns: {metrics.dailyReturns.toFixed(2)}%</div>
                  <div>Portfolio Price: {formatCurrency(metrics.portfolioPrice)}</div>
                  <div>Volatility: {metrics.volatility.toFixed(2)}%</div>
                  <div>Tracking Error: {metrics.trackingError.toFixed(2)}%</div>
                  <div>Cumulative Returns: {metrics.cumulativeReturns.toFixed(2)}%</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Correlation Matrix */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Correlation Matrix</CardTitle>
          <div className="flex gap-4">
            {/* Metric Selector */}
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {metricsList.map((m) => <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Time Period Selector */}
            <Select value={selectedTimePeriod} onValueChange={setSelectedTimePeriod}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Select period" /></SelectTrigger>
              <SelectContent>
                {timePeriodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border"></th>
                {portfolioIds.map((id) => (
                  <th key={id} className="p-2 border text-center">
                    {portfolios.find((p) => p.id === id)?.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {portfolioIds.map((idA, i) => (
                <tr key={idA}>
                  <td className="p-2 border font-medium">
                    {portfolios.find((p) => p.id === idA)?.name}
                  </td>
                  {portfolioIds.map((idB, j) => {
                    const corr = correlationMatrix[i][j];
                    return (
                      <td key={idB} className="p-2 border text-center font-mono">
                        {isNaN(corr) ? "-" : corr.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Stress Testing */}
<Card>
  <CardHeader className="flex justify-between items-center">
    <CardTitle className="flex items-center gap-2">
      <Zap className="h-5 w-5" />
      Stress Testing Scenarios
    </CardTitle>

    {/* 🔹 Portfolio selector for stress testing */}
    <Select
      value={selectedPortfolioA}
      onValueChange={(v) => setSelectedPortfolioA(v)}
    >
      <SelectTrigger className="w-56">
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
  </CardHeader>

  <CardContent>
    {/* Sliders */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
      <div>
        <label className="text-sm font-semibold text-blue-700">
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
        <div className="flex justify-between text-xs text-blue-600 mt-2">
          <span>5%</span>
          <span className="font-bold">{marketDropPercent[0]}% Drop</span>
          <span>50%</span>
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-purple-700">
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
        <div className="flex justify-between text-xs text-purple-600 mt-2">
          <span>50bps</span>
          <span className="font-bold">{rateHikePercent[0]}bps Hike</span>
          <span>500bps</span>
        </div>
      </div>
    </div>

    {/* Stress Test Results Table */}
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Scenario</TableHead>
          <TableHead>Daily Returns</TableHead>
          <TableHead>Portfolio Price</TableHead>
          <TableHead>Volatility</TableHead>
          <TableHead>Tracking Error</TableHead>
          <TableHead>Cumulative Returns</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {getStressTestResults(
          selectedPortfolioA as PortfolioId,
          marketDropPercent[0],
          rateHikePercent[0]
        ).map((result, idx) => (
          <TableRow key={idx}>
            <TableCell
              className={`font-medium ${getScenarioColor(result.scenario)}`}
            >
              {result.scenario}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                {result.dailyReturns > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                {result.dailyReturns.toFixed(2)}%
              </div>
            </TableCell>
            <TableCell>{formatCurrency(result.portfolioPrice)}</TableCell>
            <TableCell>{result.volatility.toFixed(2)}%</TableCell>
            <TableCell>{result.trackingError.toFixed(2)}%</TableCell>
            <TableCell>{result.cumulativeReturns.toFixed(2)}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>

    </div>
  );
}





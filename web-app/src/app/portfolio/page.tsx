"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
import { Badge } from "@/components/ui/badge";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  RefreshCw,
  ArrowUpDown,
  Settings2,
} from "lucide-react";

// mock data (later replace with API calls to FastAPI)
const portfolios = [
  { id: "1", name: "Global Equity Fund", value: 2450000000 },
  { id: "2", name: "Asian Bond Portfolio", value: 1850000000 },
];

const correlationMatrix = [
  { asset: "Equity", equity: 1.0, bonds: -0.12, reits: 0.68, commodities: 0.34 },
  { asset: "Bonds", equity: -0.12, bonds: 1.0, reits: 0.23, commodities: -0.08 },
  { asset: "REITs", equity: 0.68, bonds: 0.23, reits: 1.0, commodities: 0.45 },
  { asset: "Commodities", equity: 0.34, bonds: -0.08, reits: 0.45, commodities: 1.0 },
];

export default function PortfolioPage() {
  const [selectedPortfolioA, setSelectedPortfolioA] = useState(portfolios[0].id);
  const [selectedPortfolioB, setSelectedPortfolioB] = useState(portfolios[1].id);
  const [marketDropPercent, setMarketDropPercent] = useState([15]);
  const [rateHikePercent, setRateHikePercent] = useState([200]);

  const riskReturnData = [
    { risk: 8.2, return: 12.5, name: "Global Equity Fund" },
    { risk: 5.1, return: 7.8, name: "Asian Bond Portfolio" },
    { risk: 11.4, return: 15.2, name: "Real Estate Investment" },
    { risk: 14.8, return: 18.9, name: "Alternative Investments" },
    { risk: 9.6, return: 13.1, name: "Benchmark" },
  ];

  const stressTestResults = [
    { scenario: "Base Case", return: 12.5, volatility: 8.2, sharpe: 1.52, drawdown: -4.2 },
    { scenario: `Market Drop ${marketDropPercent[0]}%`, return: 8.3, volatility: 12.8, sharpe: 0.65, drawdown: -15.7 },
    { scenario: `Rate Hike ${rateHikePercent[0]}bps`, return: 10.1, volatility: 9.4, sharpe: 1.07, drawdown: -6.8 },
    { scenario: "Combined Stress", return: 5.9, volatility: 16.2, sharpe: 0.36, drawdown: -22.4 },
  ];

  const similarPortfolios = [
    { name: "Sovereign Wealth Fund A", similarity: 94.2, returns: 11.8, risk: 8.5 },
    { name: "University Endowment B", similarity: 91.7, returns: 13.1, risk: 9.1 },
    { name: "Pension Fund C", similarity: 88.3, returns: 10.9, risk: 7.8 },
    { name: "Insurance Portfolio D", similarity: 85.6, returns: 12.3, risk: 8.9 },
  ];

  const getScenarioColor = (scenario: string) => {
    if (scenario.includes("Base")) return "text-green-600";
    if (scenario.includes("Combined")) return "text-red-600";
    return "text-yellow-600";
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="space-y-6 p-6">
      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Run Analysis
          </Button>
          <Button variant="outline">
            <Settings2 className="h-4 w-4 mr-2" />
            Configure Scenarios
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Rebalance
          </Button>
          <Button variant="outline" size="sm">
            <Target className="h-4 w-4 mr-2" />
            Optimize
          </Button>
        </div>
      </div>

      {/* Portfolio Comparison + Risk-Return */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {([selectedPortfolioA, selectedPortfolioB] as string[]).map((selected, idx) => {
                const portfolio = portfolios.find((p) => p.id === selected)!;
                return (
                  <div key={idx} className="space-y-2">
                    <h4 className={`font-medium ${idx === 0 ? "text-blue-600" : "text-green-600"}`}>
                      {portfolio.name}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Value:</span>
                        <span>{formatCurrency(portfolio.value)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Return:</span>
                        <span className="text-green-600">+{idx === 0 ? 12.5 : 7.8}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Volatility:</span>
                        <span>{idx === 0 ? "8.2%" : "5.1%"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sharpe:</span>
                        <span>{idx === 0 ? "1.52" : "1.53"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Risk-Return Scatter */}
        <Card>
          <CardHeader>
            <CardTitle>Risk-Return Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="risk" name="Risk (%)" type="number" domain={[0, 20]} />
                  <YAxis dataKey="return" name="Return (%)" type="number" domain={[0, 25]} />
                  <Tooltip formatter={(v, n) => [`${Number(v).toFixed(1)}%`, n]} />
                  <Scatter data={riskReturnData} fill="hsl(var(--chart-1))" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stress Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Stress Testing Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scenario</TableHead>
                <TableHead>Return</TableHead>
                <TableHead>Volatility</TableHead>
                <TableHead>Sharpe</TableHead>
                <TableHead>Drawdown</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stressTestResults.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className={getScenarioColor(r.scenario)}>{r.scenario}</TableCell>
                  <TableCell>{r.return.toFixed(1)}%</TableCell>
                  <TableCell>{r.volatility.toFixed(1)}%</TableCell>
                  <TableCell>{r.sharpe.toFixed(2)}</TableCell>
                  <TableCell className="text-red-600">{r.drawdown.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Correlation + Similar Portfolios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Correlation Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Correlation Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            {correlationMatrix.map((row, idx) => (
              <div key={idx} className="grid grid-cols-5 gap-2 text-sm">
                <div className="font-medium text-right pr-2">{row.asset}</div>
                <div>{row.equity.toFixed(2)}</div>
                <div>{row.bonds.toFixed(2)}</div>
                <div>{row.reits.toFixed(2)}</div>
                <div>{row.commodities.toFixed(2)}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Similar Portfolios */}
        <Card>
          <CardHeader>
            <CardTitle>Similar Portfolio Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {similarPortfolios.map((p, idx) => (
              <div key={idx} className="flex justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-gray-500">
                    Return: {p.returns}% | Risk: {p.risk}%
                  </p>
                </div>
                <Badge>{p.similarity}% Match</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

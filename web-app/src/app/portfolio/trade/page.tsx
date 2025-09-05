"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";

export default function PortfolioManager() {
  
  const initialPortfolios: any = {
    "Global Equity Fund": {
      AAPL: { shares: 100, price: 150 },
      MSFT: { shares: 50, price: 300 },
      TSLA: { shares: 25, price: 800 },
    },
    "Asian Bond Portfolio": {
      TSM: { shares: 200, price: 100 },
      BABA: { shares: 150, price: 120 },
      HSI: { shares: 50, price: 200 },
    },
  };

  const [selectedPortfolio, setSelectedPortfolio] = useState("Global Equity Fund");
  const [portfolio, setPortfolio] = useState(initialPortfolios["Global Equity Fund"]);
  const [tradeTicker, setTradeTicker] = useState("AAPL");
  const [tradeShares, setTradeShares] = useState(0);
  const [tradeResult, setTradeResult] = useState<
    { status: string; reason?: string } | null
  >(null);

  // --- Dynamic metrics (fake calculations for demo) ---
  const [metrics, setMetrics] = useState({
    tracking_error: 0.009, // 0.9%
    sharpe: 0.65,
    volatility: 0.12, // 12%
    max_drawdown: -0.08, // -8%
  });

  // --- Trade handler (all frontend-only) ---
  function handleTrade(action: "BUY" | "SELL") {
    const newPortfolio = { ...portfolio };
    const holding = newPortfolio[tradeTicker];

    if (!holding) {
      setTradeResult({
        status: "rejected",
        reason: `Ticker ${tradeTicker} not found in portfolio`,
      });
      return;
    }

    
    if (action === "BUY") {
      holding.shares += tradeShares;
    } else {
      holding.shares = Math.max(0, holding.shares - tradeShares);
    }
    holding.value = holding.shares * holding.price;
    newPortfolio[tradeTicker] = holding;

    
    let newMetrics = { ...metrics };
    const tradeImpact = tradeShares / 100; 

    newMetrics.volatility = Math.min(0.20, metrics.volatility + tradeImpact * 0.001);
    newMetrics.sharpe = Math.max(0.3, metrics.sharpe - tradeImpact * 0.0005);
    newMetrics.tracking_error = Math.min(0.03, metrics.tracking_error + tradeImpact * 0.0003);
    newMetrics.max_drawdown = Math.max(-0.20, metrics.max_drawdown - tradeImpact * 0.0005);

    
    if (newMetrics.tracking_error > 0.01) {
      setPortfolio(newPortfolio);
      setMetrics(newMetrics);
      setTradeResult({
        status: "rejected",
        reason: "Tracking Error breach (limit ≤ 1%)",
      });
      return;
    }
    if (newMetrics.sharpe < 0.5) {
      setPortfolio(newPortfolio);
      setMetrics(newMetrics);
      setTradeResult({
        status: "rejected",
        reason: "Sharpe ratio too low (min ≥ 0.5)",
      });
      return;
    }
    if (newMetrics.volatility > 0.15) {
      setPortfolio(newPortfolio);
      setMetrics(newMetrics);
      setTradeResult({
        status: "rejected",
        reason: "Volatility too high (limit ≤ 15%)",
      });
      return;
    }
    if (newMetrics.max_drawdown < -0.1) {
      setPortfolio(newPortfolio);
      setMetrics(newMetrics);
      setTradeResult({
        status: "rejected",
        reason: "Max Drawdown exceeded (limit ≥ -10%)",
      });
      return;
    }

    
    setPortfolio(newPortfolio);
    setMetrics(newMetrics);
    setTradeResult({
      status: "approved",
      reason: `You ${action === "BUY" ? "bought" : "sold"} ${tradeShares} shares of ${tradeTicker} for ${selectedPortfolio}`,
    });
  }

  return (
    <div className="space-y-6 p-6">
      {/* Portfolio Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="border rounded p-2"
            value={selectedPortfolio}
            onChange={(e) => {
              const name = e.target.value;
              setSelectedPortfolio(name);
              setPortfolio(initialPortfolios[name]);
              setTradeTicker(Object.keys(initialPortfolios[name])[0]);
            }}
          >
            {Object.keys(initialPortfolios).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      
      <Card>
        <CardHeader>
          <CardTitle>Current Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticker</TableHead>
                <TableHead>Shares</TableHead>
                <TableHead>Price ($)</TableHead>
                <TableHead>Value ($)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(portfolio).map(([ticker, { shares, price }]: any) => (
                <TableRow key={ticker}>
                  <TableCell>{ticker}</TableCell>
                  <TableCell>{shares.toFixed(2)}</TableCell>
                  <TableCell>{price.toFixed(2)}</TableCell>
                  <TableCell>${(shares * price).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      
      <Card>
        <CardHeader>
          <CardTitle>Risk & Compliance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2">
            <li>
              <strong>Tracking Error:</strong>{" "}
              {(metrics.tracking_error * 100).toFixed(2)}% (limit ≤ 1%)
            </li>
            <li>
              <strong>Sharpe Ratio:</strong> {metrics.sharpe.toFixed(2)} (min ≥ 0.5)
            </li>
            <li>
              <strong>Volatility:</strong>{" "}
              {(metrics.volatility * 100).toFixed(2)}% (limit ≤ 15%)
            </li>
            <li>
              <strong>Max Drawdown:</strong>{" "}
              {(metrics.max_drawdown * 100).toFixed(2)}% (limit ≥ -10%)
            </li>
          </ul>
        </CardContent>
      </Card>

      
      <Card>
        <CardHeader>
          <CardTitle>Trade Simulator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center mb-6">
            <select
              className="border rounded p-2"
              value={tradeTicker}
              onChange={(e) => setTradeTicker(e.target.value)}
            >
              {Object.keys(portfolio).map((ticker) => (
                <option key={ticker} value={ticker}>
                  {ticker}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Number of Shares"
              className="border rounded p-2 w-40"
              value={tradeShares}
              onChange={(e) => setTradeShares(Number(e.target.value))}
            />

            <button
              className="px-4 py-2 bg-green-600 text-white rounded"
              onClick={() => handleTrade("BUY")}
            >
              Buy
            </button>

            <button
              className="px-4 py-2 bg-red-600 text-white rounded"
              onClick={() => handleTrade("SELL")}
            >
              Sell
            </button>
          </div>

          
          {tradeResult && (
            <div
              className={`mt-4 p-3 rounded ${
                tradeResult.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {tradeResult.status === "approved"
                ? `✅ Trade Approved – ${tradeResult.reason}`
                : `❌ Trade Rejected: ${tradeResult.reason}`}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}




/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
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

  const [selectedPortfolio, setSelectedPortfolio] =
    useState("Global Equity Fund");
  const [portfolio, setPortfolio] = useState(
    initialPortfolios["Global Equity Fund"]
  );
  const [tradeTicker, setTradeTicker] = useState("AAPL");
  const [tradeShares, setTradeShares] = useState(0);
  const [tradeResult, setTradeResult] = useState<{
    status: string;
    reason?: string;
  } | null>(null);

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

    holding.value = holding.shares * holding.price;
    newPortfolio[tradeTicker] = holding;

    const newMetrics = { ...metrics };
    const tradeImpact = tradeShares / 100;

    newMetrics.volatility = Math.min(
      0.2,
      metrics.volatility + tradeImpact * 0.001
    );
    newMetrics.sharpe = Math.max(0.3, metrics.sharpe - tradeImpact * 0.0005);
    newMetrics.tracking_error = Math.min(
      0.03,
      metrics.tracking_error + tradeImpact * 0.0003
    );
    newMetrics.max_drawdown = Math.max(
      -0.2,
      metrics.max_drawdown - tradeImpact * 0.0005
    );

    if (newMetrics.tracking_error > 0.01) {
      setTradeResult({
        status: "rejected",
        reason: "Tracking Error breach (limit ≤ 1%)",
      });
      return;
    }
    if (newMetrics.sharpe < 0.5) {
      setTradeResult({
        status: "rejected",
        reason: "Sharpe ratio too low (min ≥ 0.5)",
      });
      return;
    }
    if (newMetrics.volatility > 0.15) {
      setTradeResult({
        status: "rejected",
        reason: "Volatility too high (limit ≤ 15%)",
      });
      return;
    }
    if (newMetrics.max_drawdown < -0.1) {
      setTradeResult({
        status: "rejected",
        reason: "Max Drawdown exceeded (limit ≥ -10%)",
      });
      return;
    }

    if (action === "BUY") {
      holding.shares += tradeShares;
    } else {
      holding.shares = Math.max(0, holding.shares - tradeShares);
    }

    setPortfolio(newPortfolio);
    setMetrics(newMetrics);
    setTradeResult({
      status: "approved",
      reason: `You ${
        action === "BUY" ? "bought" : "sold"
      } ${tradeShares} shares of ${tradeTicker} for ${selectedPortfolio}`,
    });
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Portfolio Selection */}
        <section className="financial-card p-8 space-y-6 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-lg">
          <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">
            Select Portfolio
          </h2>
          <select
            className="w-full border border-blue-200 rounded-lg p-3 bg-white/80 backdrop-blur-sm hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
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
        </section>

        {/* Current Holdings */}
        <section className="financial-card p-8 space-y-6 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-lg">
          <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">
            Current Holdings
          </h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-blue-800 font-semibold">
                    Ticker
                  </TableHead>
                  <TableHead className="text-blue-800 font-semibold">
                    Shares
                  </TableHead>
                  <TableHead className="text-blue-800 font-semibold">
                    Price ($)
                  </TableHead>
                  <TableHead className="text-blue-800 font-semibold">
                    Value ($)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(portfolio).map(
                  ([ticker, { shares, price }]: any) => (
                    <TableRow
                      key={ticker}
                      className="hover:bg-blue-50/50 transition-colors duration-200"
                    >
                      <TableCell className="font-medium text-gray-800">
                        {ticker}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {shares.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {price.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-semibold text-blue-700">
                        ${(shares * price).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Risk & Compliance Metrics */}
        <section className="financial-card p-8 space-y-6 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-lg">
          <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">
            Risk & Compliance Metrics
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-blue-200 rounded-xl p-5 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200 hover:border-blue-300">
              <p className="text-sm text-blue-600 font-medium mb-1">
                Risk Management
              </p>
              <p className="font-semibold text-gray-800 mb-2">Tracking Error</p>
              <p className="text-blue-700 font-medium">
                {(metrics.tracking_error * 100).toFixed(2)}% (limit ≤ 1%)
              </p>
            </div>
            <div className="border border-blue-200 rounded-xl p-5 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200 hover:border-blue-300">
              <p className="text-sm text-blue-600 font-medium mb-1">
                Performance
              </p>
              <p className="font-semibold text-gray-800 mb-2">Sharpe Ratio</p>
              <p className="text-blue-700 font-medium">
                {metrics.sharpe.toFixed(2)} (min ≥ 0.5)
              </p>
            </div>
            {/* <div className="border border-blue-200 rounded-xl p-5 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200 hover:border-blue-300">
              <p className="text-sm text-blue-600 font-medium mb-1">Risk Management</p>
              <p className="font-semibold text-gray-800 mb-2">Volatility</p>
              <p className="text-blue-700 font-medium">{(metrics.volatility * 100).toFixed(2)}% (limit ≤ 15%)</p>
            </div>
            <div className="border border-blue-200 rounded-xl p-5 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200 hover:border-blue-300">
              <p className="text-sm text-blue-600 font-medium mb-1">Risk Management</p>
              <p className="font-semibold text-gray-800 mb-2">Max Drawdown</p>
              <p className="text-blue-700 font-medium">{(metrics.max_drawdown * 100).toFixed(2)}% (limit ≥ -10%)</p>
            </div> */}
            <div className="border border-blue-200 rounded-xl p-5 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200 hover:border-blue-300">
              <p className="text-sm text-blue-600 font-medium mb-1">
                Compliance
              </p>
              <p className="font-semibold text-gray-800 mb-2">Trading Limit</p>
              <p className="text-blue-700 font-medium">4,000,000</p>
            </div>
            <div className="border border-blue-200 rounded-xl p-5 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200 hover:border-blue-300">
              <p className="text-sm text-blue-600 font-medium mb-1">
                Compliance
              </p>
              <p className="font-semibold text-gray-800 mb-2">
                Report Frequency
              </p>
              <p className="text-blue-700 font-medium">Daily</p>
            </div>
          </div>
        </section>

        {/* Trade Simulator */}
        <section className="financial-card p-8 space-y-6 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-lg">
          <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">
            Trade Simulator
          </h2>
          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Select Ticker
              </label>
              <select
                className="w-full h-12 border border-blue-200 rounded-lg px-3 py-3 bg-white/80 backdrop-blur-sm hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                value={tradeTicker}
                onChange={(e) => setTradeTicker(e.target.value)}
              >
                {Object.keys(portfolio).map((ticker) => (
                  <option key={ticker} value={ticker}>
                    {ticker}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Number of Shares
              </label>
              <input
                type="number"
                placeholder="Enter shares"
                className="w-full h-12 border border-blue-200 rounded-lg px-3 py-3 bg-white/80 backdrop-blur-sm hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                value={tradeShares}
                onChange={(e) => setTradeShares(Number(e.target.value))}
              />
            </div>

            <div className="flex gap-2">
              <button
                className="px-3 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm w-16"
                onClick={() => handleTrade("BUY")}
              >
                Buy
              </button>

              <button
                className="px-3 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm w-16"
                onClick={() => handleTrade("SELL")}
              >
                Sell
              </button>
            </div>
          </div>

          {/* Trade Result */}
          {tradeResult && (
            <div
              className={`p-4 rounded-lg border ${
                tradeResult.status === "approved"
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              {tradeResult.status === "approved"
                ? `✅ Trade Approved – ${tradeResult.reason}`
                : `❌ Trade Rejected: ${tradeResult.reason}`}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

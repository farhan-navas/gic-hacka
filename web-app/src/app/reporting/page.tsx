'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  Download, 
  Calendar, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Target
} from 'lucide-react';
import { portfolios, riskMetrics, performanceData, volatilityData } from '@/data/mockData';

const ReportingAnalystDashboard = () => {
  const [selectedPortfolio, setSelectedPortfolio] = useState(portfolios[0].id);
  const [selectedDateRange, setSelectedDateRange] = useState('ytd');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getMetricStatus = (status: string) => {
    switch (status) {
      case 'good':
        return 'status-pass';
      case 'warning':
        return 'status-warning';
      case 'danger':
        return 'status-fail';
      default:
        return 'status-pass';
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Portfolio" />
            </SelectTrigger>
            <SelectContent>
              {portfolios.map((portfolio) => (
                <SelectItem key={portfolio.id} value={portfolio.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{portfolio.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatCurrency(portfolio.value)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="ytd">YTD</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {riskMetrics.slice(0, 4).map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.name}</p>
                  <p className="text-2xl font-bold">
                    {metric.value}
                    <span className="text-sm font-normal">{metric.unit}</span>
                  </p>
                  {metric.benchmark && (
                    <p className="text-xs text-muted-foreground">
                      Target: {metric.benchmark}{metric.unit}
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  {metric.value > (metric.benchmark || 0) ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-danger" />
                  )}
                </div>
              </div>
              <Badge className={`mt-2 ${getMetricStatus(metric.status)}`}>
                {metric.status.toUpperCase()}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance vs Benchmark</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${Number(value).toFixed(2)}%`,
                    name === 'portfolio' ? 'Portfolio' : 'Benchmark'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="portfolio" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-1))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: 'hsl(var(--chart-2))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volatility Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Volatility Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volatilityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Volatility']} />
                  <Area 
                    type="monotone" 
                    dataKey="volatility" 
                    stroke="hsl(var(--chart-3))" 
                    fill="hsl(var(--chart-3) / 0.2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Metrics Table */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Metrics Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riskMetrics.slice(0, 5).map((metric, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{metric.name}</TableCell>
                    <TableCell>
                      {metric.value}{metric.unit}
                    </TableCell>
                    <TableCell>
                      {metric.benchmark ? `${metric.benchmark}${metric.unit}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getMetricStatus(metric.status)}>
                        {metric.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scheduled Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium">Monthly Risk Committee Report</p>
                <p className="text-sm text-muted-foreground">Next: Dec 1, 2024 at 9:00 AM</p>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium">Weekly MAS Regulatory Report</p>
                <p className="text-sm text-muted-foreground">Next: Nov 29, 2024 at 5:00 PM</p>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium">Quarterly Board Summary</p>
                <p className="text-sm text-muted-foreground">Next: Dec 31, 2024 at 12:00 PM</p>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportingAnalystDashboard;
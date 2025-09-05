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
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Controls */}
                <div className="financial-card p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-2">Portfolio</label>
                                <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
                                    <SelectTrigger className="w-64 border-gray-200 focus:ring-blue-500 focus:border-blue-500">
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
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-2">Date Range</label>
                                <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                                    <SelectTrigger className="w-32 border-gray-200 focus:ring-blue-500 focus:border-blue-500">
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
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule Report
                            </Button>
                            <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                <Download className="h-4 w-4 mr-2" />
                                Export PDF
                            </Button>
                            <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                <FileText className="h-4 w-4 mr-2" />
                                Export Excel
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {riskMetrics.slice(0, 4).map((metric, index) => (
                        <Card key={index} className="financial-card metric-card border-0">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">{metric.name}</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {metric.value}
                                            <span className="text-lg font-normal text-gray-500">{metric.unit}</span>
                                        </p>
                                        {metric.benchmark && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Target: {metric.benchmark}{metric.unit}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center p-3 rounded-full bg-blue-50">
                                        {metric.value > (metric.benchmark || 0) ? (
                                            <TrendingUp className="h-6 w-6 text-green-600" />
                                        ) : (
                                            <TrendingDown className="h-6 w-6 text-red-600" />
                                        )}
                                    </div>
                                </div>
                                <Badge className={`mt-3 ${getMetricStatus(metric.status)} px-3 py-1 text-xs font-medium`}>
                                    {metric.status.toUpperCase()}
                                </Badge>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Performance Chart */}
                <Card className="financial-card border-0 mb-6">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-semibold text-gray-900">Portfolio Performance vs Benchmark</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80 bg-gradient-to-br from-blue-50 to-white rounded-lg p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={performanceData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="date" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip
                                        formatter={(value, name) => [
                                            `${Number(value).toFixed(2)}%`,
                                            name === 'portfolio' ? 'Portfolio' : 'Benchmark'
                                        ]}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="portfolio"
                                        stroke="#1e40af"
                                        strokeWidth={3}
                                        dot={{ fill: '#1e40af', strokeWidth: 2, r: 4 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="benchmark"
                                        stroke="#059669"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Volatility Trend */}
                    <Card className="financial-card border-0">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-semibold text-gray-900">Volatility Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 bg-gradient-to-br from-red-50 to-white rounded-lg p-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={volatilityData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="date" stroke="#64748b" />
                                        <YAxis stroke="#64748b" />
                                        <Tooltip 
                                            formatter={(value) => [`${value}%`, 'Volatility']}
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="volatility"
                                            stroke="#dc2626"
                                            fill="rgba(220, 38, 38, 0.1)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Risk Metrics Table */}
                    <Card className="financial-card border-0">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-semibold text-gray-900">Risk Metrics Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-hidden rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="font-semibold text-gray-700">Metric</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Current</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Target</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {riskMetrics.slice(0, 5).map((metric, index) => (
                                            <TableRow key={index} className="hover:bg-gray-50">
                                                <TableCell className="font-medium text-gray-900">{metric.name}</TableCell>
                                                <TableCell className="text-gray-700">
                                                    {metric.value}{metric.unit}
                                                </TableCell>
                                                <TableCell className="text-gray-700">
                                                    {metric.benchmark ? `${metric.benchmark}${metric.unit}` : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`${getMetricStatus(metric.status)} px-2 py-1 text-xs font-medium`}>
                                                        {metric.status.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Scheduled Reports */}
                <Card className="financial-card border-0">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                            <Clock className="h-5 w-5 text-blue-600" />
                            Scheduled Reports
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-blue-50 to-white hover:shadow-md transition-shadow">
                                <div>
                                    <p className="font-semibold text-gray-900">Monthly Risk Committee Report</p>
                                    <p className="text-sm text-gray-600">Next: Dec 1, 2024 at 9:00 AM</p>
                                </div>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-blue-50 to-white hover:shadow-md transition-shadow">
                                <div>
                                    <p className="font-semibold text-gray-900">Weekly MAS Regulatory Report</p>
                                    <p className="text-sm text-gray-600">Next: Nov 29, 2024 at 5:00 PM</p>
                                </div>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-blue-50 to-white hover:shadow-md transition-shadow">
                                <div>
                                    <p className="font-semibold text-gray-900">Quarterly Board Summary</p>
                                    <p className="text-sm text-gray-600">Next: Dec 31, 2024 at 12:00 PM</p>
                                </div>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ReportingAnalystDashboard;
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Download, TrendingDown } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Management',
        href: '/admin/inventory',
    },
    {
        title: 'Reports',
        href: '/admin/inventory/reports',
    },
    {
        title: 'Daily Consumption Report',
        href: '/admin/inventory/reports/daily-consumption',
    },
];

interface DailyConsumption {
    transaction_date: string;
    product_id: number;
    total_quantity: number;
    total_cost: number;
    product: {
        name: string;
        code: string;
        unit_of_measure?: string;
    };
}

interface ProductSummary {
    product_id: number;
    total_quantity: number;
    total_cost: number;
    product: {
        name: string;
        code: string;
        unit_of_measure?: string;
    };
}

interface DailyConsumptionReportProps {
    dailyData: Record<string, DailyConsumption[]>;
    productSummary: ProductSummary[];
    filters: {
        start_date: string;
        end_date: string;
    };
}

export default function DailyConsumptionReport({ dailyData, productSummary, filters }: DailyConsumptionReportProps) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const handleFilter = () => {
        router.get(
            '/admin/inventory/reports/daily-consumption',
            {
                start_date: startDate,
                end_date: endDate,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleExport = (format: 'excel' | 'pdf' | 'word') => {
        const params = new URLSearchParams({ start_date: startDate || '', end_date: endDate || '', format });
        window.location.href = `/admin/inventory/reports/daily-consumption/export?${params.toString()}`;
    };

    const getTotalDailyConsumption = () => {
        return Object.values(dailyData || {})
            .flat()
            .reduce(
                (totals, consumption: any) => ({
                    quantity: totals.quantity + (Number(consumption?.total_quantity) || 0),
                    cost: totals.cost + (Number(consumption?.total_cost) || 0),
                }),
                { quantity: 0, cost: 0 },
            );
    };

    const totals = getTotalDailyConsumption();
    const totalCostNumber = Number(totals.cost || 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daily Consumption Report" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Heading title="Daily Consumption Report" description="Daily usage patterns and consumption trends" icon={Calendar} />
                        <div className="flex items-center gap-4">
                            <Button variant="secondary" onClick={() => router.visit('/admin/inventory/reports')} className="bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Reports
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleExport('excel')}>Excel</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExport('pdf')}>PDF</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExport('word')}>Word</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Date Filters */}
                <div className="holographic-card shadow-lg border-0 mb-8 overflow-hidden rounded-xl bg-white">
                    <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
                        <div className="flex items-center gap-3 p-6">
                            <div className="p-2 bg-gradient-to-br from-pink-400 to-pink-500 rounded-lg">
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Date Range Filter</h3>
                                <p className="text-pink-100 mt-1">Filter reports by specific date ranges</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-6 bg-gradient-to-br from-pink-50 to-pink-100">
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="start_date" className="text-base font-semibold text-gray-700">Start Date</Label>
                                <Input id="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-12 border-gray-300 focus:border-pink-500 focus:ring-pink-500 rounded-xl shadow-sm" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date" className="text-base font-semibold text-gray-700">End Date</Label>
                                <Input id="end_date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-12 border-gray-300 focus:border-pink-500 focus:ring-pink-500 rounded-xl shadow-sm" />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleFilter} className="w-full h-12 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                                    Apply Filter
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-6 md:grid-cols-3 mb-8">
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg">
                                        <Calendar className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Total Days</h3>
                                        <p className="text-blue-100 text-sm">Days with consumption</p>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white">{Object.keys(dailyData).length}</div>
                            </div>
                        </div>
                    </div>

                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-green-400 to-green-500 rounded-lg">
                                        <TrendingDown className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Total Quantity</h3>
                                        <p className="text-green-100 text-sm">Units consumed</p>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white">{totals.quantity}</div>
                            </div>
                        </div>
                    </div>

                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg">
                                        <TrendingDown className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Total Cost</h3>
                                        <p className="text-orange-100 text-sm">Total consumption value</p>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white">₱{Number(totalCostNumber || 0).toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Summary */}
                <div className="holographic-card shadow-lg border-0 mb-8 overflow-hidden rounded-xl bg-white">
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                        <div className="flex items-center gap-3 p-6">
                            <div className="p-2 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-lg">
                                <TrendingDown className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Product Consumption Summary</h3>
                                <p className="text-indigo-100 mt-1">Summary of all products consumed during the period</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-6 bg-gradient-to-br from-indigo-50 to-indigo-100">
                        {productSummary.length > 0 ? (
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-gray-50">
                                            <TableHead className="font-semibold text-gray-700">Product</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Total Quantity</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Total Cost</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Average Daily</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {productSummary.map((item) => (
                                            <TableRow key={item.product_id} className="hover:bg-indigo-50/50 transition-colors border-b border-gray-100">
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{item.product.name}</div>
                                                        <div className="text-sm text-gray-600">{item.product.code}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-gray-900">{item.total_quantity}</div>
                                                    <div className="text-sm text-gray-600">{item.product.unit_of_measure || 'units'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-gray-900">₱{Number(item.total_cost || 0).toFixed(2)}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-gray-900">
                                                        {(item.total_quantity / Object.keys(dailyData).length).toFixed(1)}
                                                    </div>
                                                    <div className="text-sm text-gray-600">per day</div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <div className="p-6 bg-gray-50 rounded-2xl">
                                    <TrendingDown className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                    <h3 className="mb-2 text-2xl font-bold text-gray-900">No Consumption Data Found</h3>
                                    <p className="mb-6 text-gray-600">No daily consumption data in the selected date range.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Daily Breakdown */}
                <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white">
                    <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                        <div className="flex items-center gap-3 p-6">
                            <div className="p-2 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg">
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Daily Consumption Breakdown</h3>
                                <p className="text-teal-100 mt-1">Detailed daily consumption patterns and trends</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-6 bg-gradient-to-br from-teal-50 to-teal-100">
                        {Object.keys(dailyData).length > 0 ? (
                            <div className="space-y-6">
                                {Object.entries(dailyData || {})
                                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                                    .map(([date, consumptions]) => (
                                        <div key={date} className="holographic-card shadow-md border-0 overflow-hidden rounded-xl bg-white">
                                            <div className="bg-gradient-to-r from-gray-50 to-gray-100">
                                                <div className="flex items-center justify-between p-4">
                                                    <h3 className="text-lg font-bold text-gray-900">{new Date(date).toLocaleDateString()}</h3>
                                                    <div className="flex gap-4 text-sm">
                                                        <span className="font-medium text-gray-700">
                                                            Total: {(consumptions || []).reduce((sum, c) => sum + (Number(c.total_quantity) || 0), 0)}{' '}
                                                            units
                                                        </span>
                                                        <span className="font-medium text-gray-700">
                                                            Cost: ₱
                                                            {Number(
                                                                (consumptions || []).reduce((sum, c) => sum + (Number(c.total_cost) || 0), 0),
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                                    <Table>
                                                        <TableHeader className="bg-gray-50">
                                                            <TableRow className="hover:bg-gray-50">
                                                                <TableHead className="font-semibold text-gray-700">Product</TableHead>
                                                                <TableHead className="font-semibold text-gray-700">Quantity</TableHead>
                                                                <TableHead className="font-semibold text-gray-700">Cost</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {(consumptions || []).map((consumption) => (
                                                                <TableRow key={`${date}-${consumption.product_id}`} className="hover:bg-teal-50/50 transition-colors border-b border-gray-100">
                                                                    <TableCell>
                                                                        <div>
                                                                            <div className="font-medium text-gray-900">{consumption.product.name}</div>
                                                                            <div className="text-sm text-gray-600">
                                                                                {consumption.product.code}
                                                                            </div>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="font-medium text-gray-900">{consumption.total_quantity}</div>
                                                                        <div className="text-sm text-gray-600">
                                                                            {consumption.product.unit_of_measure || 'units'}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="font-medium text-gray-900">
                                                                            ₱{Number(consumption.total_cost || 0).toFixed(2)}
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <div className="p-6 bg-gray-50 rounded-2xl">
                                    <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                    <h3 className="mb-2 text-2xl font-bold text-gray-900">No Daily Data Found</h3>
                                    <p className="mb-6 text-gray-600">No daily consumption data in the selected date range.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

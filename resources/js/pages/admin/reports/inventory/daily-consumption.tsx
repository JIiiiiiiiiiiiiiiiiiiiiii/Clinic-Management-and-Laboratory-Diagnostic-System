import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CustomDatePicker } from '@/components/ui/date-picker';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Download, TrendingDown } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/admin/reports' },
    { title: 'Inventory', href: '/admin/reports/inventory' },
    { title: 'Daily Consumption Report', href: '/admin/reports/inventory/daily-consumption' },
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
            '/admin/reports/inventory/daily-consumption',
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
        window.location.href = `/admin/reports/inventory/daily-consumption/export?${params.toString()}`;
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
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Heading title="Daily Consumption Report" description="Daily usage patterns and consumption trends" icon={Calendar} />
                        <div className="flex items-center gap-4">
                            <Button variant="secondary" onClick={() => router.visit('/admin/reports/inventory')} className="bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Reports
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="bg-white border border-gray-300 hover:bg-gray-50 text-black shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
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

                {/* Combined Report Card */}
                <div className="holographic-card shadow-lg border-0 mb-8 overflow-hidden rounded-xl bg-white">
                    <div className="bg-white border-b border-gray-200 text-black">
                        <div className="flex items-center gap-3 p-6">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Calendar className="h-6 w-6 text-black" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-black">Daily Consumption Report</h3>
                                <p className="text-gray-600 mt-1">Complete report with filters, summary, and daily breakdown</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-6 bg-white">
                        {/* Date Range Filter */}
                        <div className="mb-8">
                            <h4 className="text-lg font-semibold text-black mb-4">Date Range Filter</h4>
                            <div className="flex flex-wrap gap-2 items-end">
                                <div className="flex-1 min-w-[200px]">
                                    <Label htmlFor="start_date" className="text-base font-semibold text-gray-700 mb-1 block">Start Date</Label>
                                    <CustomDatePicker
                                        value={startDate}
                                        onChange={(date) => setStartDate(date ? date.toISOString().split('T')[0] : '')}
                                        placeholder="Select start date"
                                        variant="responsive"
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <Label htmlFor="end_date" className="text-base font-semibold text-gray-700 mb-1 block">End Date</Label>
                                    <CustomDatePicker
                                        value={endDate}
                                        onChange={(date) => setEndDate(date ? date.toISOString().split('T')[0] : '')}
                                        placeholder="Select end date"
                                        variant="responsive"
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex-none">
                                    <Button onClick={handleFilter} className="h-12 bg-white border border-gray-300 hover:bg-gray-50 text-black shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6">
                                        Apply Filter
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid gap-6 md:grid-cols-3 mb-8">
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <Calendar className="h-6 w-6 text-black" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-black">Total Days</h4>
                                            <p className="text-gray-600 text-sm">Days with consumption</p>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-black">{Object.keys(dailyData).length}</div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <TrendingDown className="h-6 w-6 text-black" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-black">Total Quantity</h4>
                                            <p className="text-gray-600 text-sm">Units consumed</p>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-black">{totals.quantity}</div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <TrendingDown className="h-6 w-6 text-black" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-black">Total Cost</h4>
                                            <p className="text-gray-600 text-sm">Total consumption value</p>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-black">₱{Number(totalCostNumber || 0).toFixed(2)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Product Summary */}
                        <div className="mb-8">
                            <h4 className="text-lg font-semibold text-black mb-4">Product Consumption Summary</h4>
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
                                            <TableRow key={item.product_id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
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

                        {/* Daily Breakdown */}
                        <div>
                            <h4 className="text-lg font-semibold text-black mb-4">Daily Consumption Breakdown</h4>
                        {Object.keys(dailyData || {}).length > 0 ? (
                            <div className="space-y-6">
                                {Object.entries(dailyData || {})
                                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                                    .map(([date, consumptions]) => (
                                        <div key={date} className="holographic-card shadow-md border-0 overflow-hidden rounded-xl bg-white">
                                            <div className="bg-white border-b border-gray-200">
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
                                                                <TableRow key={`${date}-${consumption.product_id}`} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
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
            </div>
        </AppLayout>
    );
}

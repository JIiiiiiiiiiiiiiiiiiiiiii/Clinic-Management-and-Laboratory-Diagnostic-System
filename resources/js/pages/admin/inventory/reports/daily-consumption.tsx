import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
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
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.visit('/admin/inventory/reports')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Reports
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Daily Consumption Report</h1>
                            <p className="text-muted-foreground">Daily usage patterns and consumption trends</p>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button>
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

                {/* Date Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Date Range Filter
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input id="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">End Date</Label>
                                <Input id="end_date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleFilter} className="w-full">
                                    Apply Filter
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Object.keys(dailyData).length}</div>
                            <p className="text-xs text-muted-foreground">Days with consumption</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
                            <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totals.quantity}</div>
                            <p className="text-xs text-muted-foreground">Units consumed</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                            <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{Number(totalCostNumber || 0).toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">Total consumption value</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Product Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Product Consumption Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {productSummary.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Total Quantity</TableHead>
                                            <TableHead>Total Cost</TableHead>
                                            <TableHead>Average Daily</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {productSummary.map((item) => (
                                            <TableRow key={item.product_id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{item.product.name}</div>
                                                        <div className="text-sm text-muted-foreground">{item.product.code}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{item.total_quantity}</div>
                                                    <div className="text-sm text-muted-foreground">{item.product.unit_of_measure || 'units'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">₱{Number(item.total_cost || 0).toFixed(2)}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {(item.total_quantity / Object.keys(dailyData).length).toFixed(1)}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">per day</div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <TrendingDown className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold">No consumption data found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">No daily consumption data in the selected date range.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Daily Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Consumption Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {Object.keys(dailyData).length > 0 ? (
                            <div className="space-y-6">
                                {Object.entries(dailyData || {})
                                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                                    .map(([date, consumptions]) => (
                                        <div key={date} className="rounded-lg border p-4">
                                            <div className="mb-4 flex items-center justify-between">
                                                <h3 className="text-lg font-semibold">{new Date(date).toLocaleDateString()}</h3>
                                                <div className="flex gap-4 text-sm">
                                                    <span className="font-medium">
                                                        Total: {(consumptions || []).reduce((sum, c) => sum + (Number(c.total_quantity) || 0), 0)}{' '}
                                                        units
                                                    </span>
                                                    <span className="font-medium">
                                                        Cost: ₱
                                                        {Number(
                                                            (consumptions || []).reduce((sum, c) => sum + (Number(c.total_cost) || 0), 0),
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Product</TableHead>
                                                            <TableHead>Quantity</TableHead>
                                                            <TableHead>Cost</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {(consumptions || []).map((consumption) => (
                                                            <TableRow key={`${date}-${consumption.product_id}`}>
                                                                <TableCell>
                                                                    <div>
                                                                        <div className="font-medium">{consumption.product.name}</div>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            {consumption.product.code}
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="font-medium">{consumption.total_quantity}</div>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {consumption.product.unit_of_measure || 'units'}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="font-medium">
                                                                        ₱{Number(consumption.total_cost || 0).toFixed(2)}
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold">No daily data found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">No daily consumption data in the selected date range.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

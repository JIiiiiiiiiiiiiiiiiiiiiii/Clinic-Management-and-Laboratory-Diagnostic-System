import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Download, Users } from 'lucide-react';
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
        title: 'Usage by Location Report',
        href: '/admin/inventory/reports/usage-by-location',
    },
];

interface LocationUsage {
    usage_location: string;
    product_id: number;
    total_quantity: number;
    total_cost: number;
    product: {
        name: string;
        code: string;
        unit_of_measure?: string;
    };
}

interface UsageByLocationReportProps {
    usageByLocation: Record<string, LocationUsage[]>;
    filters: {
        start_date: string;
        end_date: string;
    };
}

export default function UsageByLocationReport({ usageByLocation, filters }: UsageByLocationReportProps) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const handleFilter = () => {
        router.get(
            '/admin/inventory/reports/usage-by-location',
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
        window.location.href = `/admin/inventory/reports/usage-by-location/export?${params.toString()}`;
    };

    const getTotalUsageByLocation = (location: string) => {
        const usages = (usageByLocation && usageByLocation[location]) || [];
        return {
            totalQuantity: usages.reduce((sum, usage) => sum + (Number(usage.total_quantity) || 0), 0),
            totalCost: usages.reduce((sum, usage) => sum + (Number(usage.total_cost) || 0), 0),
            productCount: usages.length,
        };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usage by Location Report" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.visit('/admin/inventory/reports')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Reports
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Usage by Location Report</h1>
                            <p className="text-muted-foreground">Supply consumption breakdown by department/location</p>
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
                            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Object.keys(usageByLocation || {}).length}</div>
                            <p className="text-xs text-muted-foreground">Departments using supplies</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {Object.values(usageByLocation || {}).reduce((sum, usages) => sum + (usages?.length || 0), 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">Product-location combinations</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₱
                                {Number(
                                    Object.values(usageByLocation || {})
                                        .flat()
                                        .reduce((sum, usage: any) => sum + (Number(usage?.total_cost) || 0), 0),
                                ).toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">Total cost across all locations</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Location Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Location Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {Object.keys(usageByLocation || {}).length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Products Used</TableHead>
                                            <TableHead>Total Quantity</TableHead>
                                            <TableHead>Total Cost</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Object.keys(usageByLocation || {}).map((location) => {
                                            const totals = getTotalUsageByLocation(location);
                                            return (
                                                <TableRow key={location}>
                                                    <TableCell>
                                                        <div className="font-medium">{location}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{totals.productCount}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{totals.totalQuantity}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">₱{totals.totalCost.toFixed(2)}</div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold">No usage data found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">No supply usage by location in the selected date range.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Detailed Usage by Location */}
                {Object.keys(usageByLocation || {}).length > 0 && (
                    <div className="space-y-6">
                        {Object.entries(usageByLocation || {}).map(([location, usages]) => (
                            <Card key={location}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        {location}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Product</TableHead>
                                                    <TableHead>Total Quantity</TableHead>
                                                    <TableHead>Total Cost</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {(usages || []).map((usage) => (
                                                    <TableRow key={`${location}-${usage.product_id}`}>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">{usage.product.name}</div>
                                                                <div className="text-sm text-muted-foreground">{usage.product.code}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">{usage.total_quantity}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {usage.product.unit_of_measure || 'units'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">₱{Number(usage.total_cost || 0).toFixed(2)}</div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

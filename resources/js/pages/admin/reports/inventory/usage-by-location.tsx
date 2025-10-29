import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ReportDatePicker } from '@/components/ui/report-date-picker';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Download, Users } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/admin/reports' },
    { title: 'Inventory', href: '/admin/reports/inventory' },
    { title: 'Usage by Location Report', href: '/admin/reports/inventory/usage-by-location' },
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
            '/admin/reports/inventory/usage-by-location',
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
        window.location.href = `/admin/reports/inventory/usage-by-location/export?${params.toString()}`;
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
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Heading title="Usage by Location Report" description="Supply consumption breakdown by department/location" icon={Users} />
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
                                <Users className="h-6 w-6 text-black" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-black">Usage by Location Report</h3>
                                <p className="text-gray-600 mt-1">Complete report with filters, summary, and location breakdown</p>
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
                                    <ReportDatePicker
                                        date={startDate ? new Date(startDate) : undefined}
                                        onDateChange={(date) => setStartDate(date ? date.toISOString().split('T')[0] : '')}
                                        filter="daily"
                                        placeholder="Select start date"
                                        disabled={false}
                                    />
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <Label htmlFor="end_date" className="text-base font-semibold text-gray-700 mb-1 block">End Date</Label>
                                    <ReportDatePicker
                                        date={endDate ? new Date(endDate) : undefined}
                                        onDateChange={(date) => setEndDate(date ? date.toISOString().split('T')[0] : '')}
                                        filter="daily"
                                        placeholder="Select end date"
                                        disabled={false}
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
                                            <Users className="h-6 w-6 text-black" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-black">Total Locations</h4>
                                            <p className="text-gray-600 text-sm">Departments using supplies</p>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-black">{Object.keys(usageByLocation || {}).length}</div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <Users className="h-6 w-6 text-black" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-black">Total Products</h4>
                                            <p className="text-gray-600 text-sm">Product-location combinations</p>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-black">
                                        {Object.values(usageByLocation || {}).reduce((sum, usages) => sum + (usages?.length || 0), 0)}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <Users className="h-6 w-6 text-black" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-black">Total Value</h4>
                                            <p className="text-gray-600 text-sm">Total cost across all locations</p>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-black">
                                        ₱
                                        {Number(
                                            Object.values(usageByLocation || {})
                                                .flat()
                                                .reduce((sum, usage: any) => sum + (Number(usage?.total_cost) || 0), 0),
                                        ).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                </div>

                        {/* Location Summary */}
                        <div className="mb-8">
                            <h4 className="text-lg font-semibold text-black mb-4">Location Summary</h4>
                        {Object.keys(usageByLocation || {}).length > 0 ? (
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-gray-50">
                                            <TableHead className="font-semibold text-gray-700">Location</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Products Used</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Total Quantity</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Total Cost</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Object.keys(usageByLocation || {}).map((location) => {
                                            const totals = getTotalUsageByLocation(location);
                                            return (
                                                <TableRow key={location} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                                                    <TableCell>
                                                        <div className="font-medium text-gray-900">{location}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="px-3 py-1">{totals.productCount}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-gray-900">{totals.totalQuantity}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-gray-900">₱{totals.totalCost.toFixed(2)}</div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <div className="p-6 bg-gray-50 rounded-2xl">
                                    <Users className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                    <h3 className="mb-2 text-2xl font-bold text-gray-900">No Usage Data Found</h3>
                                    <p className="mb-6 text-gray-600">No supply usage by location in the selected date range.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                        {/* Detailed Usage by Location */}
                        {Object.keys(usageByLocation || {}).length > 0 && (
                            <div>
                                <h4 className="text-lg font-semibold text-black mb-4">Detailed Breakdown by Location</h4>
                                <div className="space-y-6">
                                    {Object.entries(usageByLocation || {}).map(([location, usages]) => (
                                        <div key={location} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-gray-100 rounded-lg">
                                                    <Users className="h-6 w-6 text-black" />
                                                </div>
                                                <div>
                                                    <h5 className="text-lg font-bold text-black">{location}</h5>
                                                    <p className="text-gray-600 text-sm">Detailed usage breakdown for this location</p>
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                                <Table>
                                                    <TableHeader className="bg-gray-50">
                                                        <TableRow className="hover:bg-gray-50">
                                                            <TableHead className="font-semibold text-gray-700">Product</TableHead>
                                                            <TableHead className="font-semibold text-gray-700">Total Quantity</TableHead>
                                                            <TableHead className="font-semibold text-gray-700">Total Cost</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {(usages || []).map((usage) => (
                                                            <TableRow key={`${location}-${usage.product_id}`} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                                                                <TableCell>
                                                                    <div>
                                                                        <div className="font-medium text-gray-900">{usage.product.name}</div>
                                                                        <div className="text-sm text-gray-600">{usage.product.code}</div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="font-medium text-gray-900">{usage.total_quantity}</div>
                                                                    <div className="text-sm text-gray-600">
                                                                        {usage.product.unit_of_measure || 'units'}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="font-medium text-gray-900">₱{Number(usage.total_cost || 0).toFixed(2)}</div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
        </AppLayout>
    );
}

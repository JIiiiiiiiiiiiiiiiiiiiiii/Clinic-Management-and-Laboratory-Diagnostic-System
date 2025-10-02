import { Badge } from '@/components/ui/badge';
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Heading title="Usage by Location Report" description="Supply consumption breakdown by department/location" icon={Users} />
                        <div className="flex items-center gap-4">
                            <Button variant="secondary" onClick={() => router.visit('/admin/inventory/reports')} className="bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Reports
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
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
                    <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                        <div className="flex items-center gap-3 p-6">
                            <div className="p-2 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg">
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Date Range Filter</h3>
                                <p className="text-teal-100 mt-1">Filter reports by specific date ranges</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-6 bg-gradient-to-br from-teal-50 to-teal-100">
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="start_date" className="text-base font-semibold text-gray-700">Start Date</Label>
                                <Input id="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-xl shadow-sm" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date" className="text-base font-semibold text-gray-700">End Date</Label>
                                <Input id="end_date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-xl shadow-sm" />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleFilter} className="w-full h-12 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
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
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Total Locations</h3>
                                        <p className="text-blue-100 text-sm">Departments using supplies</p>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white">{Object.keys(usageByLocation || {}).length}</div>
                            </div>
                        </div>
                    </div>

                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-green-400 to-green-500 rounded-lg">
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Total Products</h3>
                                        <p className="text-green-100 text-sm">Product-location combinations</p>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white">
                                    {Object.values(usageByLocation || {}).reduce((sum, usages) => sum + (usages?.length || 0), 0)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg">
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Total Value</h3>
                                        <p className="text-purple-100 text-sm">Total cost across all locations</p>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white">
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
                </div>

                {/* Location Summary */}
                <div className="holographic-card shadow-lg border-0 mb-8 overflow-hidden rounded-xl bg-white">
                    <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
                        <div className="flex items-center gap-3 p-6">
                            <div className="p-2 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-lg">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Location Summary</h3>
                                <p className="text-cyan-100 mt-1">Summary of supply usage by location</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-6 bg-gradient-to-br from-cyan-50 to-cyan-100">
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
                                                <TableRow key={location} className="hover:bg-cyan-50/50 transition-colors border-b border-gray-100">
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
                    <div className="space-y-6">
                        {Object.entries(usageByLocation || {}).map(([location, usages]) => (
                            <div key={location} className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white">
                                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                                    <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">{location}</h3>
                                            <p className="text-emerald-100 mt-1">Detailed usage breakdown for this location</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-6 bg-gradient-to-br from-emerald-50 to-emerald-100">
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
                                                    <TableRow key={`${location}-${usage.product_id}`} className="hover:bg-emerald-50/50 transition-colors border-b border-gray-100">
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
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

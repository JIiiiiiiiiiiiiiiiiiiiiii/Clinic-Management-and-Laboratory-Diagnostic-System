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
import { ArrowLeft, Calendar, Download, FileText } from 'lucide-react';
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
        title: 'Rejected Supplies Report',
        href: '/admin/inventory/reports/rejected-supplies',
    },
];

interface RejectedSupply {
    id: number;
    type: string;
    subtype: string;
    quantity: number;
    unit_cost?: number;
    total_cost?: number;
    transaction_date: string;
    notes?: string;
    product: {
        name: string;
        code: string;
        unit_of_measure?: string;
    };
    user: {
        name: string;
    };
    approved_by?: {
        name: string;
    };
}

interface ProductSummary {
    product: {
        name: string;
        code: string;
    };
    total_quantity: number;
    total_cost: number;
    transactions: RejectedSupply[];
}

interface RejectedSuppliesReportProps {
    rejectedSupplies: RejectedSupply[];
    summary: Record<string, ProductSummary>;
    filters: {
        start_date: string;
        end_date: string;
    };
}

export default function RejectedSuppliesReport({ rejectedSupplies, summary, filters }: RejectedSuppliesReportProps) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const handleFilter = () => {
        router.get(
            '/admin/inventory/reports/rejected-supplies',
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
        window.location.href = `/admin/inventory/reports/rejected-supplies/export?${params.toString()}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rejected Supplies Report" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Heading title="Rejected Supplies Report" description="Monitor rejected, damaged, or expired supplies" icon={FileText} />
                        <div className="flex items-center gap-4">
                            <Button variant="secondary" onClick={() => router.visit('/admin/inventory/reports')} className="bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Reports
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
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
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                        <div className="flex items-center gap-3 p-6">
                            <div className="p-2 bg-gradient-to-br from-red-400 to-red-500 rounded-lg">
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Date Range Filter</h3>
                                <p className="text-red-100 mt-1">Filter reports by specific date ranges</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-6 bg-gradient-to-br from-red-50 to-red-100">
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="start_date" className="text-base font-semibold text-gray-700">Start Date</Label>
                                <Input id="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-xl shadow-sm" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date" className="text-base font-semibold text-gray-700">End Date</Label>
                                <Input id="end_date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-xl shadow-sm" />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleFilter} className="w-full h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                                    Apply Filter
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-6 md:grid-cols-3 mb-8">
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-red-400 to-red-500 rounded-lg">
                                        <FileText className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Total Rejections</h3>
                                        <p className="text-red-100 text-sm">Rejected supply transactions</p>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white">{rejectedSupplies.length}</div>
                            </div>
                        </div>
                    </div>

                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg">
                                        <FileText className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Total Products</h3>
                                        <p className="text-orange-100 text-sm">Different products rejected</p>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white">{Object.keys(summary).length}</div>
                            </div>
                        </div>
                    </div>

                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg">
                                        <FileText className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Total Value</h3>
                                        <p className="text-yellow-100 text-sm">Total cost of rejected supplies</p>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white">
                                    ₱{Number(Object.values(summary).reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0)).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Summary */}
                <div className="holographic-card shadow-lg border-0 mb-8 overflow-hidden rounded-xl bg-white">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                        <div className="flex items-center gap-3 p-6">
                            <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Product Summary</h3>
                                <p className="text-purple-100 mt-1">Summary of all rejected supplies by product</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-6 bg-gradient-to-br from-purple-50 to-purple-100">
                        {Object.keys(summary).length > 0 ? (
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-gray-50">
                                            <TableHead className="font-semibold text-gray-700">Product</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Total Quantity</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Total Cost</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Rejections</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Object.values(summary).map((item) => (
                                            <TableRow key={item.product?.code || Math.random()} className="hover:bg-purple-50/50 transition-colors border-b border-gray-100">
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{item.product?.name || 'Unknown'}</div>
                                                        <div className="text-sm text-gray-600">{item.product?.code || '—'}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-gray-900">{item.total_quantity}</div>
                                                    <div className="text-sm text-gray-600">
                                                        {'unit_of_measure' in (item.product ?? {}) && (item.product as any).unit_of_measure
                                                            ? (item.product as any).unit_of_measure
                                                            : 'units'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-gray-900">₱{Number(item.total_cost || 0).toFixed(2)}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="destructive" className="px-3 py-1">{item.transactions.length}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <div className="p-6 bg-gray-50 rounded-2xl">
                                    <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                    <h3 className="mb-2 text-2xl font-bold text-gray-900">No Rejected Supplies Found</h3>
                                    <p className="mb-6 text-gray-600">No supplies were rejected in the selected date range.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detailed Transactions */}
                <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white">
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                        <div className="flex items-center gap-3 p-6">
                            <div className="p-2 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-lg">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Detailed Rejections</h3>
                                <p className="text-indigo-100 mt-1">Complete rejection history with all details</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-6 bg-gradient-to-br from-indigo-50 to-indigo-100">
                        {rejectedSupplies.length > 0 ? (
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-gray-50">
                                            <TableHead className="font-semibold text-gray-700">Date</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Product</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Quantity</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Reason</TableHead>
                                            <TableHead className="font-semibold text-gray-700">User</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Approved By</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rejectedSupplies.map((supply) => (
                                            <TableRow key={supply.id} className="hover:bg-indigo-50/50 transition-colors border-b border-gray-100">
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{new Date(supply.transaction_date).toLocaleDateString()}</div>
                                                        <div className="text-sm text-gray-600">{supply.subtype}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{supply.product?.name || 'Unknown'}</div>
                                                        <div className="text-sm text-gray-600">{supply.product?.code || '—'}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-gray-900">{Math.abs(supply.quantity)}</div>
                                                    <div className="text-sm text-gray-600">{supply.product?.unit_of_measure || 'units'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-700">{supply.notes || 'N/A'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-700">{supply.user.name}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-700">{supply.approved_by?.name || 'N/A'}</div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <div className="p-6 bg-gray-50 rounded-2xl">
                                    <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                    <h3 className="mb-2 text-2xl font-bold text-gray-900">No Rejections Found</h3>
                                    <p className="mb-6 text-gray-600">No supply rejections in the selected date range.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

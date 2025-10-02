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
import { ArrowDown, ArrowLeft, ArrowUp, BarChart3, Calendar, Download } from 'lucide-react';
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
        title: 'In/Out Supplies Report',
        href: '/admin/inventory/reports/in-out-supplies',
    },
];

interface SupplyTransaction {
    id: number;
    type: string;
    subtype: string;
    quantity: number;
    unit_cost?: number;
    total_cost?: number;
    transaction_date: string;
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
    transactions: SupplyTransaction[];
}

interface InOutSuppliesReportProps {
    incomingSupplies: SupplyTransaction[];
    outgoingSupplies: SupplyTransaction[];
    incomingSummary: Record<string, ProductSummary>;
    outgoingSummary: Record<string, ProductSummary>;
    filters: {
        start_date: string;
        end_date: string;
    };
}

export default function InOutSuppliesReport({
    incomingSupplies,
    outgoingSupplies,
    incomingSummary,
    outgoingSummary,
    filters,
}: InOutSuppliesReportProps) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const handleFilter = () => {
        router.get(
            '/admin/inventory/reports/in-out-supplies',
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
        window.location.href = `/admin/inventory/reports/in-out-supplies/export?${params.toString()}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="In/Out Supplies Report" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Heading title="In/Out Supplies Report" description="Complete transaction history for all supply movements" icon={BarChart3} />
                        <div className="flex items-center gap-4">
                            <Button variant="secondary" onClick={() => router.visit('/admin/inventory/reports')} className="bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Reports
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
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
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                        <div className="flex items-center gap-3 p-6">
                            <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg">
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Date Range Filter</h3>
                                <p className="text-purple-100 mt-1">Filter reports by specific date ranges</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-6 bg-gradient-to-br from-purple-50 to-purple-100">
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="start_date" className="text-base font-semibold text-gray-700">Start Date</Label>
                                <Input id="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date" className="text-base font-semibold text-gray-700">End Date</Label>
                                <Input id="end_date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm" />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleFilter} className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                                    Apply Filter
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-6 md:grid-cols-4 mb-8">
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg border">
                                    <ArrowUp className="h-6 w-6 text-[#283890]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[#283890]">Incoming</h3>
                                    <p className="text-[#283890] text-sm">Incoming transactions</p>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-[#283890]">{incomingSupplies.length}</div>
                        </div>
                    </div>

                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg border">
                                    <ArrowDown className="h-6 w-6 text-[#283890]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[#283890]">Outgoing</h3>
                                    <p className="text-[#283890] text-sm">Outgoing transactions</p>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-[#283890]">{outgoingSupplies.length}</div>
                        </div>
                    </div>

                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg border">
                                    <BarChart3 className="h-6 w-6 text-[#283890]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[#283890]">Net Incoming</h3>
                                    <p className="text-[#283890] text-sm">Net quantity change</p>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-[#283890]">
                                {Object.values(incomingSummary).reduce((sum, item) => sum + item.total_quantity, 0) -
                                    Object.values(outgoingSummary).reduce((sum, item) => sum + item.total_quantity, 0)}
                            </div>
                        </div>
                    </div>

                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg border">
                                    <BarChart3 className="h-6 w-6 text-[#283890]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[#283890]">Total Value</h3>
                                    <p className="text-[#283890] text-sm">Total transaction value</p>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-[#283890]">
                                ₱
                                {Number(
                                    Object.values(incomingSummary).reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0) +
                                        Object.values(outgoingSummary).reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0),
                                ).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 mb-8">
                    {/* Incoming Summary */}
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-gradient-to-br from-green-400 to-green-500 rounded-lg">
                                    <ArrowUp className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Incoming Supplies Summary</h3>
                                    <p className="text-green-100 mt-1">Summary of all incoming supply transactions</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6 bg-gradient-to-br from-green-50 to-green-100">
                            {Object.keys(incomingSummary).length > 0 ? (
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
                                            <TableRow className="hover:bg-gray-50">
                                                <TableHead className="font-semibold text-gray-700">Product</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Quantity</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Value</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Object.values(incomingSummary).map((item) => (
                                                <TableRow key={item.product?.code || Math.random()} className="hover:bg-green-50/50 transition-colors border-b border-gray-100">
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium text-gray-900">{item.product?.name || 'Unknown'}</div>
                                                            <div className="text-sm text-gray-600">{item.product?.code || '—'}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-green-600">+{item.total_quantity}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-gray-900">₱{Number(item.total_cost || 0).toFixed(2)}</div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="p-6 bg-gray-50 rounded-2xl">
                                        <ArrowUp className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                        <h3 className="mb-2 text-2xl font-bold text-gray-900">No Incoming Supplies</h3>
                                        <p className="mb-6 text-gray-600">No incoming transactions in the selected date range.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Outgoing Summary */}
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-gradient-to-br from-red-400 to-red-500 rounded-lg">
                                    <ArrowDown className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Outgoing Supplies Summary</h3>
                                    <p className="text-red-100 mt-1">Summary of all outgoing supply transactions</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6 bg-gradient-to-br from-red-50 to-red-100">
                            {Object.keys(outgoingSummary).length > 0 ? (
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
                                            <TableRow className="hover:bg-gray-50">
                                                <TableHead className="font-semibold text-gray-700">Product</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Quantity</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Value</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Object.values(outgoingSummary).map((item) => (
                                                <TableRow key={item.product?.code || Math.random()} className="hover:bg-red-50/50 transition-colors border-b border-gray-100">
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium text-gray-900">{item.product?.name || 'Unknown'}</div>
                                                            <div className="text-sm text-gray-600">{item.product?.code || '—'}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-red-600">-{item.total_quantity}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-gray-900">₱{Number(item.total_cost || 0).toFixed(2)}</div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="p-6 bg-gray-50 rounded-2xl">
                                        <ArrowDown className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                        <h3 className="mb-2 text-2xl font-bold text-gray-900">No Outgoing Supplies</h3>
                                        <p className="mb-6 text-gray-600">No outgoing transactions in the selected date range.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* All Transactions */}
                <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white">
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                        <div className="flex items-center gap-3 p-6">
                            <div className="p-2 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-lg">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">All Transactions</h3>
                                <p className="text-indigo-100 mt-1">Complete transaction history with all details</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-6 bg-gradient-to-br from-indigo-50 to-indigo-100">
                        {[...(incomingSupplies || []), ...(outgoingSupplies || [])].length > 0 ? (
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-gray-50">
                                            <TableHead className="font-semibold text-gray-700">Date</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Type</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Product</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Quantity</TableHead>
                                            <TableHead className="font-semibold text-gray-700">User</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Approved By</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[...(incomingSupplies || []), ...(outgoingSupplies || [])]
                                            .sort(
                                                (a, b) =>
                                                    new Date(b?.transaction_date || '').getTime() - new Date(a?.transaction_date || '').getTime(),
                                            )
                                            .map((transaction) => (
                                                <TableRow key={transaction.id} className="hover:bg-indigo-50/50 transition-colors border-b border-gray-100">
                                                    <TableCell>
                                                        <div className="font-medium text-gray-900">
                                                            {new Date(transaction.transaction_date).toLocaleDateString()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {transaction.type === 'in' ? (
                                                                <ArrowUp className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <ArrowDown className="h-4 w-4 text-red-500" />
                                                            )}
                                                            <Badge variant={transaction.type === 'in' ? 'success' : 'secondary'} className="px-3 py-1">
                                                                {transaction.subtype}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium text-gray-900">{transaction.product?.name || 'Unknown'}</div>
                                                            <div className="text-sm text-gray-600">{transaction.product?.code || '—'}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-gray-900">
                                                            {transaction.type === 'in' ? '+' : ''}
                                                            {transaction.quantity}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm text-gray-700">{transaction.user?.name || 'N/A'}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm text-gray-700">{transaction.approved_by?.name || 'N/A'}</div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <div className="p-6 bg-gray-50 rounded-2xl">
                                    <BarChart3 className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                    <h3 className="mb-2 text-2xl font-bold text-gray-900">No Transactions Found</h3>
                                    <p className="mb-6 text-gray-600">No supply transactions in the selected date range.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

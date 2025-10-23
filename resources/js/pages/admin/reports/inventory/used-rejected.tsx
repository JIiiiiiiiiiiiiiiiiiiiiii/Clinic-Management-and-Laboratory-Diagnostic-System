import { Badge } from '@/components/ui/badge';
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
import { ArrowLeft, Calendar, Download, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports',
        href: '/admin/reports',
    },
    {
        title: 'Inventory',
        href: '/admin/reports/inventory',
    },
    {
        title: 'Used/Rejected Supplies Report',
        href: '/admin/reports/inventory/used-rejected',
    },
];

interface UsedRejectedSupply {
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

interface UsedRejectedReportProps {
    usedSupplies: UsedRejectedSupply[];
    rejectedSupplies: UsedRejectedSupply[];
    usedSummary: Record<string, { total_quantity: number; total_cost: number }>;
    rejectedSummary: Record<string, { total_quantity: number; total_cost: number }>;
    totalUsed: number;
    totalRejected: number;
    totalValue: number;
    filters?: {
        start_date: string;
        end_date: string;
    };
}

export default function UsedRejectedReport({
    usedSupplies,
    rejectedSupplies,
    usedSummary,
    rejectedSummary,
    totalUsed,
    totalRejected,
    totalValue,
    filters,
}: UsedRejectedReportProps) {
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');

    const handleFilter = () => {
        router.get('/admin/reports/inventory/used-rejected', {
            start_date: startDate,
            end_date: endDate,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleExport = (format: 'excel' | 'pdf' | 'word') => {
        const params = new URLSearchParams({ start_date: startDate || '', end_date: endDate || '', format });
        window.location.href = `/admin/reports/inventory/used-rejected/export?${params.toString()}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Used/Rejected Supplies Report" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Heading title="Used/Rejected Supplies Report" description="Track used and rejected supplies with detailed summaries" icon={FileText} />
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
                                <FileText className="h-6 w-6 text-black" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-black">Used/Rejected Supplies Report</h3>
                                <p className="text-gray-600 mt-1">Complete report with filters, summary, and transaction details</p>
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
                        <div className="grid gap-6 md:grid-cols-4 mb-8">
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <CheckCircle className="h-6 w-6 text-black" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-black">Used Supplies</h4>
                                            <p className="text-gray-600 text-sm">Successfully used items</p>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-black">{(usedSupplies || []).length}</div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <AlertTriangle className="h-6 w-6 text-black" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-black">Rejected Supplies</h4>
                                            <p className="text-gray-600 text-sm">Rejected/damaged items</p>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-black">{(rejectedSupplies || []).length}</div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <FileText className="h-6 w-6 text-black" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-black">Total Items</h4>
                                            <p className="text-gray-600 text-sm">Used + Rejected</p>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-black">{(usedSupplies || []).length + (rejectedSupplies || []).length}</div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <FileText className="h-6 w-6 text-black" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-black">Total Value</h4>
                                            <p className="text-gray-600 text-sm">Total transaction value</p>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-black">₱{Number(totalValue || 0).toFixed(2)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Used Summary */}
                        <div className="mb-8">
                            <h4 className="text-lg font-semibold text-black mb-4">Used Supplies Summary</h4>
                            {Object.keys(usedSummary || {}).length > 0 ? (
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
                                            {Object.entries(usedSummary || {}).map(([product, data]) => (
                                                <TableRow key={product} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                                                    <TableCell className="font-medium text-gray-900">{product}</TableCell>
                                                    <TableCell className="font-medium text-gray-900">{data.total_quantity}</TableCell>
                                                    <TableCell className="font-medium text-gray-900">₱{Number(data.total_cost || 0).toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="p-6 bg-gray-50 rounded-2xl">
                                        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                        <h3 className="mb-2 text-2xl font-bold text-gray-900">No Used Supplies Found</h3>
                                        <p className="mb-6 text-gray-600">No used supplies in the selected date range.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Rejected Summary */}
                        <div className="mb-8">
                            <h4 className="text-lg font-semibold text-black mb-4">Rejected Supplies Summary</h4>
                            {Object.keys(rejectedSummary || {}).length > 0 ? (
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
                                            {Object.entries(rejectedSummary || {}).map(([product, data]) => (
                                                <TableRow key={product} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                                                    <TableCell className="font-medium text-gray-900">{product}</TableCell>
                                                    <TableCell className="font-medium text-gray-900">{data.total_quantity}</TableCell>
                                                    <TableCell className="font-medium text-gray-900">₱{Number(data.total_cost || 0).toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="p-6 bg-gray-50 rounded-2xl">
                                        <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                        <h3 className="mb-2 text-2xl font-bold text-gray-900">No Rejected Supplies Found</h3>
                                        <p className="mb-6 text-gray-600">No rejected supplies in the selected date range.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* All Transactions */}
                        <div>
                            <h4 className="text-lg font-semibold text-black mb-4">All Transactions</h4>
                            {(usedSupplies || []).length > 0 || (rejectedSupplies || []).length > 0 ? (
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
                                            <TableRow className="hover:bg-gray-50">
                                                <TableHead className="font-semibold text-gray-700">Date</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Type</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Product</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Quantity</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Unit Cost</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Total Cost</TableHead>
                                                <TableHead className="font-semibold text-gray-700">User</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Notes</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {[...(usedSupplies || []), ...(rejectedSupplies || [])]
                                                .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
                                                .map((transaction) => (
                                                    <TableRow key={transaction.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                                                        <TableCell>
                                                            <div className="font-medium text-gray-900">{new Date(transaction.transaction_date).toLocaleDateString()}</div>
                                                            <div className="text-sm text-gray-600">{transaction.subtype}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={transaction.type === 'used' ? 'default' : 'destructive'} className="px-3 py-1">
                                                                {transaction.type === 'used' ? 'Used' : 'Rejected'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium text-gray-900">{transaction.product?.name || 'Unknown'}</div>
                                                                <div className="text-sm text-gray-600">{transaction.product?.code || '—'}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium text-gray-900">{Math.abs(transaction.quantity || 0)}</div>
                                                            <div className="text-sm text-gray-600">{transaction.product?.unit_of_measure || 'units'}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium text-gray-900">₱{Number(transaction.unit_cost || 0).toFixed(2)}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium text-gray-900">₱{Number(transaction.total_cost || 0).toFixed(2)}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm text-gray-700">{transaction.user?.name || 'N/A'}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm text-gray-700">{transaction.notes || 'N/A'}</div>
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
                                        <h3 className="mb-2 text-2xl font-bold text-gray-900">No Transactions Found</h3>
                                        <p className="mb-6 text-gray-600">No used or rejected supplies in the selected date range.</p>
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

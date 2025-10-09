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
import { ArrowLeft, Calendar, Download, TrendingDown } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Supply Management',
        href: '/admin/inventory',
    },
    {
        title: 'Reports',
        href: '/admin/inventory/reports',
    },
    {
        title: 'Used Supplies Report',
        href: '/admin/inventory/reports/used-supplies',
    },
];

interface UsedSupply {
    id: number;
    type: string;
    subtype: string;
    quantity: number;
    unit_cost?: number;
    total_cost?: number;
    transaction_date: string;
    usage_location?: string;
    usage_purpose?: string;
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
    charged_to?: {
        name: string;
    };
}

interface ProductSummary {
    product: {
        name: string;
        code: string;
        unit_of_measure?: string;
    };
    total_quantity: number;
    total_cost: number;
    transactions: UsedSupply[];
}

interface UsedSuppliesReportProps {
    usedSupplies: UsedSupply[];
    summary: Record<string, ProductSummary>;
    filters: {
        start_date: string;
        end_date: string;
    };
}

export default function UsedSuppliesReport({ usedSupplies, summary, filters }: UsedSuppliesReportProps) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const handleFilter = () => {
        router.get(
            '/admin/inventory/reports/used-supplies',
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
        window.location.href = `/admin/inventory/reports/used-supplies/export?${params.toString()}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Used Supplies Report" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Heading title="Used Supplies Report" description="Track consumed and used supplies" icon={TrendingDown} />
                        <div className="flex items-center gap-4">
                            <Button variant="secondary" onClick={() => router.visit('/admin/inventory/reports')} className="bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
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
                                <TrendingDown className="h-6 w-6 text-black" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-black">Used Supplies Report</h3>
                                <p className="text-gray-600 mt-1">Complete report with filters, summary, and detailed transactions</p>
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
                                            <TrendingDown className="h-6 w-6 text-black" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-black">Total Transactions</h4>
                                            <p className="text-gray-600 text-sm">Used supply transactions</p>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-black">{usedSupplies.length}</div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <TrendingDown className="h-6 w-6 text-black" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-black">Total Products</h4>
                                            <p className="text-gray-600 text-sm">Different products used</p>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-black">{Object.keys(summary).length}</div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <TrendingDown className="h-6 w-6 text-black" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-black">Total Value</h4>
                                            <p className="text-gray-600 text-sm">Total cost of used supplies</p>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-black">
                                        ₱{Number(Object.values(summary).reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0)).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Summary */}
                        <div className="mb-8">
                            <h4 className="text-lg font-semibold text-black mb-4">Product Summary</h4>
                            {Object.keys(summary).length > 0 ? (
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
                                            <TableRow className="hover:bg-gray-50">
                                                <TableHead className="font-semibold text-gray-700">Product</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Total Quantity</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Total Cost</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Transactions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Object.values(summary).map((item) => (
                                                <TableRow key={item.product?.code || Math.random()} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium text-gray-900">{item.product?.name || 'Unknown'}</div>
                                                            <div className="text-sm text-gray-600">{item.product?.code || '—'}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-gray-900">{item.total_quantity}</div>
                                                        <div className="text-sm text-gray-600">{item.product?.unit_of_measure || 'units'}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-gray-900">₱{Number(item.total_cost || 0).toFixed(2)}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="px-3 py-1">{item.transactions.length}</Badge>
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
                                        <h3 className="mb-2 text-2xl font-bold text-gray-900">No Used Supplies Found</h3>
                                        <p className="mb-6 text-gray-600">No supplies were used in the selected date range.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Detailed Transactions */}
                        <div>
                            <h4 className="text-lg font-semibold text-black mb-4">Detailed Transactions</h4>
                        {(usedSupplies || []).length > 0 ? (
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-gray-50">
                                            <TableHead className="font-semibold text-gray-700">Date</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Product</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Quantity</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Location</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Purpose</TableHead>
                                            <TableHead className="font-semibold text-gray-700">User</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Charged To</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(usedSupplies || []).map((supply) => (
                                            <TableRow key={supply.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
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
                                                    <div className="font-medium text-gray-900">{Math.abs(Number(supply.quantity) || 0)}</div>
                                                    <div className="text-sm text-gray-600">{supply.product?.unit_of_measure || 'units'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-700">{supply.usage_location || 'N/A'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-700">{supply.usage_purpose || 'N/A'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-700">{supply.user?.name || 'N/A'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-700">{supply.charged_to?.name || 'N/A'}</div>
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
                                    <h3 className="mb-2 text-2xl font-bold text-gray-900">No Transactions Found</h3>
                                    <p className="mb-6 text-gray-600">No supply usage transactions in the selected date range.</p>
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

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
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.visit('/admin/inventory/reports')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Used Supplies Report</h1>
                            <p className="text-muted-foreground">Track consumed and used supplies</p>
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
                            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                            <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{usedSupplies.length}</div>
                            <p className="text-xs text-muted-foreground">Used supply transactions</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                            <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Object.keys(summary).length}</div>
                            <p className="text-xs text-muted-foreground">Different products used</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                            <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₱{Number(Object.values(summary).reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0)).toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">Total cost of used supplies</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Product Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Product Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {Object.keys(summary).length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Total Quantity</TableHead>
                                            <TableHead>Total Cost</TableHead>
                                            <TableHead>Transactions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Object.values(summary).map((item) => (
                                            <TableRow key={item.product?.code || Math.random()}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{item.product?.name || 'Unknown'}</div>
                                                        <div className="text-sm text-muted-foreground">{item.product?.code || '—'}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{item.total_quantity}</div>
                                                    <div className="text-sm text-muted-foreground">{item.product?.unit_of_measure || 'units'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">₱{Number(item.total_cost || 0).toFixed(2)}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{item.transactions.length}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <TrendingDown className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold">No used supplies found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">No supplies were used in the selected date range.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Detailed Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detailed Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(usedSupplies || []).length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Purpose</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Charged To</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(usedSupplies || []).map((supply) => (
                                            <TableRow key={supply.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{new Date(supply.transaction_date).toLocaleDateString()}</div>
                                                        <div className="text-sm text-muted-foreground">{supply.subtype}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{supply.product?.name || 'Unknown'}</div>
                                                        <div className="text-sm text-muted-foreground">{supply.product?.code || '—'}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{Math.abs(Number(supply.quantity) || 0)}</div>
                                                    <div className="text-sm text-muted-foreground">{supply.product?.unit_of_measure || 'units'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">{supply.usage_location || 'N/A'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">{supply.usage_purpose || 'N/A'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">{supply.user?.name || 'N/A'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">{supply.charged_to?.name || 'N/A'}</div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <TrendingDown className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold">No transactions found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">No supply usage transactions in the selected date range.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

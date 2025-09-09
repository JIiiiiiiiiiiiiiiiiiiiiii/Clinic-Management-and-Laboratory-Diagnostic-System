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
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.visit('/admin/inventory/reports')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Reports
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Rejected Supplies Report</h1>
                            <p className="text-muted-foreground">Monitor rejected, damaged, or expired supplies</p>
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
                            <CardTitle className="text-sm font-medium">Total Rejections</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{rejectedSupplies.length}</div>
                            <p className="text-xs text-muted-foreground">Rejected supply transactions</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Object.keys(summary).length}</div>
                            <p className="text-xs text-muted-foreground">Different products rejected</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₱{Number(Object.values(summary).reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0)).toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">Total cost of rejected supplies</p>
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
                                            <TableHead>Rejections</TableHead>
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
                                                    <div className="text-sm text-muted-foreground">
                                                        {'unit_of_measure' in (item.product ?? {}) && (item.product as any).unit_of_measure
                                                            ? (item.product as any).unit_of_measure
                                                            : 'units'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">₱{Number(item.total_cost || 0).toFixed(2)}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="destructive">{item.transactions.length}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold">No rejected supplies found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">No supplies were rejected in the selected date range.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Detailed Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detailed Rejections</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {rejectedSupplies.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Approved By</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rejectedSupplies.map((supply) => (
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
                                                    <div className="font-medium">{Math.abs(supply.quantity)}</div>
                                                    <div className="text-sm text-muted-foreground">{supply.product?.unit_of_measure || 'units'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">{supply.notes || 'N/A'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">{supply.user.name}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">{supply.approved_by?.name || 'N/A'}</div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold">No rejections found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">No supply rejections in the selected date range.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

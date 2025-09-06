import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
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

    const handleExport = () => {
        // TODO: Implement PDF export
        alert('PDF export functionality will be implemented soon.');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="In/Out Supplies Report" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.visit('/admin/inventory/reports')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Reports
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">In/Out Supplies Report</h1>
                            <p className="text-muted-foreground">Complete transaction history for all supply movements</p>
                        </div>
                    </div>
                    <Button onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                    </Button>
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
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Incoming</CardTitle>
                            <ArrowUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{incomingSupplies.length}</div>
                            <p className="text-xs text-muted-foreground">Incoming transactions</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Outgoing</CardTitle>
                            <ArrowDown className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{outgoingSupplies.length}</div>
                            <p className="text-xs text-muted-foreground">Outgoing transactions</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Incoming</CardTitle>
                            <BarChart3 className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {Object.values(incomingSummary).reduce((sum, item) => sum + item.total_quantity, 0) -
                                    Object.values(outgoingSummary).reduce((sum, item) => sum + item.total_quantity, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">Net quantity change</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                            <BarChart3 className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">
                                ₱
                                {(
                                    Object.values(incomingSummary).reduce((sum, item) => sum + item.total_cost, 0) +
                                    Object.values(outgoingSummary).reduce((sum, item) => sum + item.total_cost, 0)
                                ).toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">Total transaction value</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Incoming Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-600">
                                <ArrowUp className="h-5 w-5" />
                                Incoming Supplies Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {Object.keys(incomingSummary).length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Quantity</TableHead>
                                                <TableHead>Value</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Object.values(incomingSummary).map((item) => (
                                                <TableRow key={item.product.code}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{item.product.name}</div>
                                                            <div className="text-sm text-muted-foreground">{item.product.code}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-green-600">+{item.total_quantity}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">₱{item.total_cost.toFixed(2)}</div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <ArrowUp className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-2 text-sm font-semibold">No incoming supplies</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">No incoming transactions in the selected date range.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Outgoing Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-600">
                                <ArrowDown className="h-5 w-5" />
                                Outgoing Supplies Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {Object.keys(outgoingSummary).length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Quantity</TableHead>
                                                <TableHead>Value</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Object.values(outgoingSummary).map((item) => (
                                                <TableRow key={item.product.code}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{item.product.name}</div>
                                                            <div className="text-sm text-muted-foreground">{item.product.code}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-red-600">-{item.total_quantity}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">₱{item.total_cost.toFixed(2)}</div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <ArrowDown className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-2 text-sm font-semibold">No outgoing supplies</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">No outgoing transactions in the selected date range.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* All Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {[...incomingSupplies, ...outgoingSupplies].length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Approved By</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[...incomingSupplies, ...outgoingSupplies]
                                            .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
                                            .map((transaction) => (
                                                <TableRow key={transaction.id}>
                                                    <TableCell>
                                                        <div className="font-medium">
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
                                                            <Badge variant={transaction.type === 'in' ? 'default' : 'secondary'}>
                                                                {transaction.subtype}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{transaction.product.name}</div>
                                                            <div className="text-sm text-muted-foreground">{transaction.product.code}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">
                                                            {transaction.type === 'in' ? '+' : ''}
                                                            {transaction.quantity}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">{transaction.user.name}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">{transaction.approved_by?.name || 'N/A'}</div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold">No transactions found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">No supply transactions in the selected date range.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

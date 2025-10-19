import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Download, Eye, Package } from 'lucide-react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { title: 'Reports', href: route('hospital.reports.index') },
    { title: 'Inventory Reports', href: route('hospital.reports.inventory') },
];

interface InventoryTransaction {
    id: number;
    supply_name: string;
    type: string;
    quantity: number;
    unit_cost: number;
    total_cost: number;
    transaction_date: string;
}

interface Props {
    stats: {
        total_items: number;
        low_stock_items: number;
        out_of_stock_items: number;
        total_value: number;
    };
    transactions: {
        data: InventoryTransaction[];
        links: any[];
        meta: any;
    };
    dateRange: {
        start: string;
        end: string;
        period: string;
        label: string;
    };
    filters: any;
}

export default function HospitalInventoryReports({ stats, transactions, dateRange, filters }: Props) {
    const getTypeBadgeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'in':
                return 'bg-green-100 text-green-800';
            case 'out':
                return 'bg-red-100 text-red-800';
            case 'adjustment':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Reports - Hospital" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Inventory Reports</h1>
                        <p className="text-muted-foreground">Supply and inventory management analytics for {dateRange.label}</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" asChild>
                            <Link href={route('hospital.reports.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Reports
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('hospital.reports.export', 'inventory')}>
                                <Download className="mr-2 h-4 w-4" />
                                Export Data
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_items || 0}</div>
                            <p className="text-xs text-muted-foreground">Inventory items</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                            <Package className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">₱{stats?.total_value?.toLocaleString() || 0}</div>
                            <p className="text-xs text-muted-foreground">Inventory value</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats?.low_stock_items || 0}</div>
                            <p className="text-xs text-muted-foreground">Items running low</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats?.out_of_stock_items || 0}</div>
                            <p className="text-xs text-muted-foreground">Items out of stock</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Inventory Transactions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Inventory Transactions</CardTitle>
                        <CardDescription>Detailed inventory transactions for the selected period</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transactions.data && transactions.data.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Supply Item</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Unit Cost</TableHead>
                                        <TableHead>Total Cost</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.data.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="font-medium">{transaction.supply_name}</TableCell>
                                            <TableCell>
                                                <Badge className={getTypeBadgeColor(transaction.type)}>{transaction.type.toUpperCase()}</Badge>
                                            </TableCell>
                                            <TableCell>{transaction.quantity}</TableCell>
                                            <TableCell>₱{transaction.unit_cost.toLocaleString()}</TableCell>
                                            <TableCell className="font-medium">₱{transaction.total_cost.toLocaleString()}</TableCell>
                                            <TableCell>{new Date(transaction.transaction_date).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={route('hospital.patients.show', transaction.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-8 text-center">
                                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">No transactions found</h3>
                                <p className="mt-1 text-sm text-gray-500">No inventory transactions found for the selected period.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

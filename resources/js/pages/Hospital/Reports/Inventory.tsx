import ExportDropdown from '@/components/hospital/ExportDropdown';
import PageHeader from '@/components/hospital/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { DollarSign, Filter, Minus, Package, Search, TrendingDown, TrendingUp, User } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface InventoryTransaction {
    id: number;
    product: {
        name: string;
        code: string;
    };
    type: string;
    quantity: number;
    unit_cost: number;
    total_cost: number;
    transaction_date: string;
    user: {
        name: string;
    };
    lot_number?: string;
    reference_number?: string;
    created_at: string;
}

interface InventoryStats {
    total_transactions: number;
    by_type: Record<string, number>;
    total_value: number;
}

interface DateRange {
    start: string;
    end: string;
    period: string;
    label: string;
}

interface Props {
    user: any;
    transactions: {
        data: InventoryTransaction[];
        links: any[];
        meta: any;
    };
    stats: InventoryStats;
    dateRange: DateRange;
    filters: {
        search?: string;
        type?: string;
    };
}

export default function HospitalInventoryReports({ user, transactions, stats, dateRange, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Hospital Dashboard', href: route('hospital.dashboard') },
        { label: 'Reports', href: route('hospital.reports.index') },
        { label: 'Inventory Reports', href: route('hospital.reports.inventory') },
    ];

    const handleFilter = () => {
        router.get(
            route('hospital.reports.inventory'),
            {
                search: search || undefined,
                type: type || undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setType('');
        router.get(
            route('hospital.reports.inventory'),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    // Export function with format selection
    const exportReportWithFormat = async (format: 'csv' | 'pdf' | 'excel') => {
        try {
            const params = new URLSearchParams({
                search: search || '',
                type: type || '',
            });

            let exportUrl: string;
            let filename: string;
            let acceptHeader: string;

            switch (format) {
                case 'csv':
                    exportUrl = `/hospital/reports/export/inventory?${params.toString()}`;
                    filename = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
                    acceptHeader = 'text/csv,application/csv';
                    break;
                case 'pdf':
                    exportUrl = `/hospital/reports/export-pdf/inventory?${params.toString()}`;
                    filename = `inventory_report_${new Date().toISOString().split('T')[0]}.pdf`;
                    acceptHeader = 'application/pdf';
                    break;
                case 'excel':
                    exportUrl = `/hospital/reports/export-excel/inventory?${params.toString()}`;
                    filename = `inventory_report_${new Date().toISOString().split('T')[0]}.xlsx`;
                    acceptHeader = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    break;
                default:
                    throw new Error('Invalid export format');
            }

            console.log('Export URL:', exportUrl);

            // Use fetch with credentials to maintain authentication
            const response = await fetch(exportUrl, {
                method: 'GET',
                credentials: 'same-origin', // This is crucial for maintaining authentication
                headers: {
                    Accept: acceptHeader,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error(`Export failed: ${response.status} ${response.statusText}`);
            }

            // Check if we got HTML instead of expected format (authentication issue)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                throw new Error('Authentication failed - got HTML instead of file. Please refresh the page and try again.');
            }

            // Get the filename from the response headers
            const contentDisposition = response.headers.get('Content-Disposition');
            const finalFilename = contentDisposition ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') : filename;

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = finalFilename;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the object URL
            window.URL.revokeObjectURL(url);

            console.log('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed: ' + (error instanceof Error ? error.message : String(error)));
        }
    };

    const getTransactionIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'in':
            case 'receipt':
            case 'purchase':
                return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'out':
            case 'issue':
            case 'consumption':
                return <TrendingDown className="h-4 w-4 text-red-500" />;
            case 'adjustment':
            case 'transfer':
                return <Minus className="h-4 w-4 text-blue-500" />;
            default:
                return <Package className="h-4 w-4 text-gray-500" />;
        }
    };

    const getTransactionBadge = (type: string) => {
        const variants = {
            in: 'default',
            receipt: 'default',
            purchase: 'default',
            out: 'destructive',
            issue: 'destructive',
            consumption: 'destructive',
            adjustment: 'secondary',
            transfer: 'secondary',
        } as const;

        return <Badge variant={variants[type.toLowerCase() as keyof typeof variants] || 'outline'}>{type}</Badge>;
    };

    const renderExport = () => <ExportDropdown onSelect={(fmt) => exportReportWithFormat(fmt)} />;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Reports - Hospital" />

            <div className="space-y-6 px-4 md:px-6">
                {/* Header */}
                <PageHeader
                    title="Inventory Reports"
                    description={`Supply and inventory management analytics for ${dateRange.label}`}
                    badgeText={dateRange.label}
                    trailing={
                        <div className="flex items-center gap-2">
                            {renderExport()}
                            <Button asChild>
                                <Link href={route('hospital.reports.index')}>Back to Dashboard</Link>
                            </Button>
                        </div>
                    }
                />

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_transactions.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Inventory movements in period</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Transaction Types</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {Object.entries(stats.by_type).map(([type, count]) => (
                                    <div key={type} className="flex justify-between text-sm">
                                        <span className="capitalize">{type}</span>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{stats.total_value.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Total transaction value</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                        <CardDescription>Filter inventory transactions by various criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Product name, code, lot number..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="type">Transaction Type</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Types</SelectItem>
                                        <SelectItem value="in">In/Receipt</SelectItem>
                                        <SelectItem value="out">Out/Issue</SelectItem>
                                        <SelectItem value="adjustment">Adjustment</SelectItem>
                                        <SelectItem value="transfer">Transfer</SelectItem>
                                        <SelectItem value="purchase">Purchase</SelectItem>
                                        <SelectItem value="consumption">Consumption</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end gap-2">
                                <Button onClick={handleFilter} className="flex-1">
                                    Apply Filters
                                </Button>
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transactions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Inventory Transaction Records</CardTitle>
                        <CardDescription>{transactions.meta.total} transactions found</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Transaction Type</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Unit Cost</TableHead>
                                        <TableHead>Total Cost</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.data.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{transaction.product?.name || 'N/A'}</div>
                                                    {transaction.product?.code && (
                                                        <div className="text-sm text-muted-foreground">Code: {transaction.product.code}</div>
                                                    )}
                                                    {transaction.lot_number && (
                                                        <div className="text-sm text-muted-foreground">Lot: {transaction.lot_number}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getTransactionIcon(transaction.type)}
                                                    {getTransactionBadge(transaction.type)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{transaction.quantity.toLocaleString()}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">₱{transaction.unit_cost.toLocaleString()}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">₱{transaction.total_cost.toLocaleString()}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{transaction.user?.name || 'N/A'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{new Date(transaction.transaction_date).toLocaleDateString()}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {new Date(transaction.transaction_date).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm">
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {transactions.links && transactions.links.length > 3 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {transactions.meta.from} to {transactions.meta.to} of {transactions.meta.total} results
                                </div>
                                <div className="flex gap-1">
                                    {transactions.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

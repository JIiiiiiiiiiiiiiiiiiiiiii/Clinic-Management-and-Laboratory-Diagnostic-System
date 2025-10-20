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
import { AlertCircle, Calendar, CheckCircle, CreditCard, DollarSign, Filter, Search, User, XCircle } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface Transaction {
    id: number;
    transaction_id: string;
    patient: {
        full_name: string;
    };
    doctor: {
        name: string;
    };
    payment_type: string;
    total_amount: number;
    status: string;
    transaction_date: string;
    created_at: string;
}

interface TransactionStats {
    total: number;
    total_amount: number;
    by_payment_type: Record<string, number>;
    by_status: Record<string, number>;
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
        data: Transaction[];
        links: any[];
        meta: any;
    };
    stats: TransactionStats;
    dateRange: DateRange;
    filters: {
        search?: string;
        payment_type?: string;
        status?: string;
    };
}

export default function HospitalTransactionReports({ user, transactions, stats, dateRange, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [paymentType, setPaymentType] = useState(filters.payment_type || '');
    const [status, setStatus] = useState(filters.status || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Hospital Dashboard', href: route('hospital.dashboard') },
        { label: 'Reports', href: route('hospital.reports.index') },
        { label: 'Transaction Reports', href: route('hospital.reports.transactions') },
    ];

    const handleFilter = () => {
        router.get(
            route('hospital.reports.transactions'),
            {
                search: search || undefined,
                payment_type: paymentType || undefined,
                status: status || undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setPaymentType('');
        setStatus('');
        router.get(
            route('hospital.reports.transactions'),
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
                payment_type: paymentType || '',
                status: status || '',
            });

            let exportUrl: string;
            let filename: string;
            let acceptHeader: string;

            switch (format) {
                case 'csv':
                    exportUrl = `/hospital/reports/export/transactions?${params.toString()}`;
                    filename = `transactions_report_${new Date().toISOString().split('T')[0]}.csv`;
                    acceptHeader = 'text/csv,application/csv';
                    break;
                case 'pdf':
                    exportUrl = `/hospital/reports/export-pdf/transactions?${params.toString()}`;
                    filename = `transactions_report_${new Date().toISOString().split('T')[0]}.pdf`;
                    acceptHeader = 'application/pdf';
                    break;
                case 'excel':
                    exportUrl = `/hospital/reports/export-excel/transactions?${params.toString()}`;
                    filename = `transactions_report_${new Date().toISOString().split('T')[0]}.xlsx`;
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

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'paid':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'cancelled':
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'pending':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            default:
                return <CreditCard className="h-4 w-4 text-blue-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            completed: 'default',
            paid: 'default',
            cancelled: 'destructive',
            failed: 'destructive',
            pending: 'secondary',
            processing: 'outline',
        } as const;

        return <Badge variant={variants[status.toLowerCase() as keyof typeof variants] || 'outline'}>{status}</Badge>;
    };

    const getPaymentTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'cash':
                return '💵';
            case 'card':
                return '💳';
            case 'bank_transfer':
                return '🏦';
            case 'check':
                return '📝';
            case 'hmo':
                return '🏥';
            default:
                return '💰';
        }
    };

    const renderExport = () => <ExportDropdown onSelect={(fmt) => exportReportWithFormat(fmt)} />;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaction Reports - Hospital" />

            <div className="space-y-6 px-4 md:px-6">
                {/* Header */}
                <PageHeader
                    title="Transaction Reports"
                    description={`Financial transactions and revenue analytics for ${dateRange.label}`}
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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Processed in selected period</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{stats.total_amount.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Revenue generated</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Payment Types</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {Object.entries(stats.by_payment_type).map(([type, count]) => (
                                    <div key={type} className="flex justify-between text-sm">
                                        <span className="capitalize">{type.replace('_', ' ')}</span>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {Object.entries(stats.by_status).map(([status, count]) => (
                                    <div key={status} className="flex justify-between text-sm">
                                        <span className="capitalize">{status}</span>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                ))}
                            </div>
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
                        <CardDescription>Filter transactions by various criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Transaction ID, patient name..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="payment_type">Payment Type</Label>
                                <Select value={paymentType} onValueChange={setPaymentType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Types</SelectItem>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="check">Check</SelectItem>
                                        <SelectItem value="hmo">HMO</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
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
                        <CardTitle>Transaction Records</CardTitle>
                        <CardDescription>{transactions.meta.total} transactions found</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Transaction ID</TableHead>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Doctor</TableHead>
                                        <TableHead>Payment Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.data.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="font-medium">{transaction.transaction_id}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{transaction.patient?.full_name || 'N/A'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{transaction.doctor?.name || 'N/A'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span>{getPaymentTypeIcon(transaction.payment_type)}</span>
                                                    <span className="capitalize">{transaction.payment_type.replace('_', ' ')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">₱{transaction.total_amount.toLocaleString()}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(transaction.status)}
                                                    {getStatusBadge(transaction.status)}
                                                </div>
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

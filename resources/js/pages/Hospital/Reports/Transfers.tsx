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
import { AlertCircle, ArrowRightLeft, Calendar, CheckCircle, Download, Filter, Search, User, XCircle } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface Transfer {
    id: number;
    patient: {
        full_name: string;
    };
    from_clinic: {
        name: string;
    } | null;
    to_clinic: {
        name: string;
    } | null;
    transfer_date: string;
    status: string;
    reason?: string;
    notes?: string;
    created_at: string;
}

interface TransferStats {
    total: number;
    by_status: Record<string, number>;
    by_direction: Record<string, number>;
}

interface DateRange {
    start: string;
    end: string;
    period: string;
    label: string;
}

interface Props {
    user: any;
    transfers: {
        data: Transfer[];
        links: any[];
        meta: any;
    };
    stats: TransferStats;
    dateRange: DateRange;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function HospitalTransferReports({ user, transfers, stats, dateRange, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Hospital Dashboard', href: route('hospital.dashboard') },
        { label: 'Reports', href: route('hospital.reports.index') },
        { label: 'Transfer Reports', href: route('hospital.reports.transfers') },
    ];

    const handleFilter = () => {
        router.get(
            route('hospital.reports.transfers'),
            {
                search: search || undefined,
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
        setStatus('');
        router.get(
            route('hospital.reports.transfers'),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const exportReport = () => {
        const params = new URLSearchParams({
            search: search || '',
            status: status || '',
        });

        // Create a temporary link element to trigger download
        const link = document.createElement('a');
        link.href = route('hospital.reports.export', 'transfers') + '?' + params.toString();
        link.download = `transfers_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'pending':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            default:
                return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            completed: 'default',
            cancelled: 'destructive',
            pending: 'secondary',
            in_progress: 'outline',
        } as const;

        return <Badge variant={variants[status.toLowerCase() as keyof typeof variants] || 'outline'}>{status}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transfer Reports - Hospital" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Transfer Reports</h1>
                        <p className="text-muted-foreground">Patient transfer analytics and data for {dateRange.label}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={exportReport}>
                            <Download className="mr-2 h-4 w-4" />
                            Export Report
                        </Button>
                        <Button asChild>
                            <Link href={route('hospital.reports.index')}>Back to Dashboard</Link>
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
                            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Transfers in selected period</p>
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

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Transfer Direction</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {Object.entries(stats.by_direction).map(([direction, count]) => (
                                    <div key={direction} className="flex justify-between text-sm">
                                        <span>{direction}</span>
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
                        <CardDescription>Filter transfers by various criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Patient name..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
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
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
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

                {/* Transfers Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transfer Records</CardTitle>
                        <CardDescription>{transfers.meta.total} transfers found</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>From</TableHead>
                                        <TableHead>To</TableHead>
                                        <TableHead>Transfer Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transfers.data.map((transfer) => (
                                        <TableRow key={transfer.id}>
                                            <TableCell>
                                                <div className="font-medium">{transfer.patient?.full_name || 'N/A'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{transfer.from_clinic?.name || 'Hospital'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{transfer.to_clinic?.name || 'Hospital'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{new Date(transfer.transfer_date).toLocaleDateString()}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {new Date(transfer.transfer_date).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(transfer.status)}
                                                    {getStatusBadge(transfer.status)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{transfer.reason || 'N/A'}</div>
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
                        {transfers.links && transfers.links.length > 3 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {transfers.meta.from} to {transfers.meta.to} of {transfers.meta.total} results
                                </div>
                                <div className="flex gap-1">
                                    {transfers.links.map((link, index) => (
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

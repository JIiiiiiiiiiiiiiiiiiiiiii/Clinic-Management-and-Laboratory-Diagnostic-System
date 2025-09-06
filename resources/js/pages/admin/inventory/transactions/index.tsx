import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, CheckCircle, Eye, Plus, Search, XCircle } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Supply Management',
        href: '/admin/inventory',
    },
    {
        title: 'Supply Movements',
        href: '/admin/inventory/transactions',
    },
];

interface Transaction {
    id: number;
    type: string;
    subtype: string;
    quantity: number;
    unit_cost?: number;
    total_cost?: number;
    lot_number?: string;
    expiry_date?: string;
    transaction_date: string;
    approval_status: string;
    usage_location?: string;
    usage_purpose?: string;
    notes?: string;
    product: {
        name: string;
        code: string;
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

interface TransactionsIndexProps {
    transactions: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        type?: string;
        approval_status?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function TransactionsIndex({ transactions, filters }: TransactionsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || '');
    const [approvalStatus, setApprovalStatus] = useState(filters.approval_status || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleSearch = () => {
        router.get(
            '/admin/inventory/transactions',
            {
                search: search || undefined,
                type: type || undefined,
                approval_status: approvalStatus || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleApprove = (transactionId: number) => {
        if (confirm('Are you sure you want to approve this transaction?')) {
            router.post(
                `/admin/inventory/transactions/${transactionId}/approve`,
                {},
                {
                    onSuccess: () => {
                        // Success handled by flash message
                    },
                    onError: (errors) => {
                        console.error('Approve error:', errors);
                    },
                },
            );
        }
    };

    const handleReject = (transactionId: number) => {
        const reason = prompt('Please provide a reason for rejection:');
        if (reason) {
            router.post(
                `/admin/inventory/transactions/${transactionId}/reject`,
                {
                    reason: reason,
                },
                {
                    onSuccess: () => {
                        // Success handled by flash message
                    },
                    onError: (errors) => {
                        console.error('Reject error:', errors);
                    },
                },
            );
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge variant="default" className="text-xs">
                        Approved
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="secondary" className="text-xs">
                        Pending
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge variant="destructive" className="text-xs">
                        Rejected
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-xs">
                        {status}
                    </Badge>
                );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Transactions" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Supply Movements</h1>
                        <p className="text-muted-foreground">Track all supply movements and approvals</p>
                    </div>
                    <Button onClick={() => router.visit('/admin/inventory/transactions/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Record Movement
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-6">
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="search"
                                        placeholder="Search transactions..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button variant="outline" size="icon" onClick={handleSearch}>
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <select
                                    id="type"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <option value="">All Types</option>
                                    <option value="in">Incoming</option>
                                    <option value="out">Outgoing</option>
                                    <option value="adjustment">Adjustment</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="approval_status">Status</Label>
                                <select
                                    id="approval_status"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    value={approvalStatus}
                                    onChange={(e) => setApprovalStatus(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date_from">From Date</Label>
                                <Input id="date_from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date_to">To Date</Label>
                                <Input id="date_to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                            </div>

                            <div className="flex items-end">
                                <Button onClick={handleSearch} className="w-full">
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transactions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Supply Movements ({transactions.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {transactions.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Movement</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.data.map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">#{transaction.id}</div>
                                                        <div className="text-sm text-muted-foreground">{transaction.subtype}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{transaction.product.name}</div>
                                                        <div className="text-sm text-muted-foreground">{transaction.product.code}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {transaction.type === 'in' ? (
                                                            <ArrowUp className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <ArrowDown className="h-4 w-4 text-red-500" />
                                                        )}
                                                        <span className="capitalize">{transaction.type}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {transaction.type === 'in' ? '+' : ''}
                                                        {transaction.quantity}
                                                    </div>
                                                    {transaction.unit_cost && (
                                                        <div className="text-sm text-muted-foreground">
                                                            ₱{Number(transaction.unit_cost).toFixed(2)} each
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">
                                                            {new Date(transaction.transaction_date).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">by {transaction.user.name}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(transaction.approval_status)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => router.visit(`/admin/inventory/transactions/${transaction.id}`)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        {transaction.approval_status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() => handleApprove(transaction.id)}
                                                                    className="text-green-600 hover:text-green-700"
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() => handleReject(transaction.id)}
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <ArrowUp className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold">No movements found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Get started by recording a new supply movement.</p>
                                <div className="mt-6">
                                    <Button onClick={() => router.visit('/admin/inventory/transactions/create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Record Movement
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {transactions.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {(transactions.current_page - 1) * transactions.per_page + 1} to{' '}
                            {Math.min(transactions.current_page * transactions.per_page, transactions.total)} of {transactions.total} results
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={transactions.current_page === 1}
                                onClick={() => router.get(`/admin/inventory/transactions?page=${transactions.current_page - 1}`)}
                            >
                                Previous
                            </Button>
                            <span className="text-sm">
                                Page {transactions.current_page} of {transactions.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={transactions.current_page === transactions.last_page}
                                onClick={() => router.get(`/admin/inventory/transactions?page=${transactions.current_page + 1}`)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

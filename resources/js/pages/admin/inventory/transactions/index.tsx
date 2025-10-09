import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CustomDatePicker } from '@/components/ui/date-picker';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
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
                    <Badge variant="success" className="text-xs">
                        Approved
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="warning" className="text-xs">
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
            <div className="min-h-screen bg-white p-6 pb-12">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Heading title="Supply Movements" description="Track all supply movements and approvals" icon={ArrowUp} />
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={() => router.visit('/admin/inventory/transactions/create')}
                                className="bg-white border border-gray-300 hover:bg-gray-50 text-black shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
                            >
                                <Plus className="mr-3 h-6 w-6" />
                                Record Movement
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Combined Filters and Supply Movements */}
                <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                    <div className="bg-white border-b border-gray-200 text-black">
                        <div className="flex items-center gap-3 p-6">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <ArrowUp className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-black">Supply Movements</h3>
                                <p className="text-gray-600 mt-1">{transactions.total} total transactions</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Filters Section */}
                    <div className="px-6 py-6 bg-gray-50 border-b border-gray-200">
                        <div className="flex flex-wrap gap-2 items-end">
                            <div className="flex-1 min-w-[250px]">
                                <Label htmlFor="search" className="mb-1 block">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="search"
                                        placeholder="Search transactions by product, user, or ID..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-10 h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 min-w-[150px]">
                                <Label htmlFor="type" className="mb-1 block">Type</Label>
                                <select
                                    id="type"
                                    className="flex h-12 w-full rounded-xl border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <option value="">All Types</option>
                                    <option value="in">Incoming</option>
                                    <option value="out">Outgoing</option>
                                    <option value="adjustment">Adjustment</option>
                                </select>
                            </div>

                            <div className="flex-1 min-w-[150px]">
                                <Label htmlFor="approval_status" className="mb-1 block">Status</Label>
                                <select
                                    id="approval_status"
                                    className="flex h-12 w-full rounded-xl border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                                    value={approvalStatus}
                                    onChange={(e) => setApprovalStatus(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            <div className="flex-1 min-w-[180px]">
                                <Label htmlFor="date_from" className="mb-1 block">From Date</Label>
                                <CustomDatePicker
                                    value={dateFrom}
                                    onChange={(date) => setDateFrom(date ? date.toISOString().split('T')[0] : '')}
                                    placeholder="Select start date"
                                    variant="responsive"
                                    className="w-full"
                                />
                            </div>

                            <div className="flex-1 min-w-[180px]">
                                <Label htmlFor="date_to" className="mb-1 block">To Date</Label>
                                <CustomDatePicker
                                    value={dateTo}
                                    onChange={(date) => setDateTo(date ? date.toISOString().split('T')[0] : '')}
                                    placeholder="Select end date"
                                    variant="responsive"
                                    className="w-full"
                                />
                            </div>

                            <div className="flex-none">
                                <Button 
                                    onClick={handleSearch} 
                                    className="h-12 bg-white border border-gray-300 hover:bg-gray-50 text-black shadow-lg hover:shadow-xl transition-all duration-300 px-6 text-base font-semibold rounded-xl"
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="px-6 py-6 bg-white">
                        {transactions.data.length > 0 ? (
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-gray-50">
                                            <TableHead className="font-semibold text-gray-700">Movement</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Product</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Type</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Quantity</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Date</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.data.map((transaction) => (
                                            <TableRow key={transaction.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                                                <TableCell>
                                                    <div>
                                                        <div className="font-semibold text-black">#{transaction.id}</div>
                                                        <div className="text-sm text-gray-600">{transaction.subtype}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{transaction.product.name}</div>
                                                        <div className="text-sm text-gray-600">{transaction.product.code}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {transaction.type === 'in' ? (
                                                            <ArrowUp className="h-4 w-4 text-black" />
                                                        ) : (
                                                            <ArrowDown className="h-4 w-4 text-black" />
                                                        )}
                                                        <span className="capitalize font-medium text-gray-900">{transaction.type}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-semibold text-gray-900">
                                                        {transaction.type === 'in' ? '+' : ''}
                                                        {transaction.quantity}
                                                    </div>
                                                    {transaction.unit_cost && (
                                                        <div className="text-sm text-gray-600">
                                                            ₱{Number(transaction.unit_cost).toFixed(2)} each
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {new Date(transaction.transaction_date).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-sm text-gray-600">by {transaction.user.name}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(transaction.approval_status)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            className="bg-white border border-gray-300 hover:bg-gray-50 text-black shadow-md hover:shadow-lg transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl"
                                                            onClick={() => router.visit(`/admin/inventory/transactions/${transaction.id}`)}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" /> View
                                                        </Button>
                                                        {transaction.approval_status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    className="bg-white border border-gray-300 hover:bg-gray-50 text-black shadow-md hover:shadow-lg transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl"
                                                                    onClick={() => handleApprove(transaction.id)}
                                                                >
                                                                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                                                </Button>
                                                                <Button
                                                                    className="bg-white border border-gray-300 hover:bg-gray-50 text-black shadow-md hover:shadow-lg transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl"
                                                                    onClick={() => handleReject(transaction.id)}
                                                                >
                                                                    <XCircle className="mr-2 h-4 w-4" /> Reject
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
                    </div>
                </div>

                {/* Pagination */}
                {transactions.last_page > 1 && (
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        <div className="px-6 py-4 bg-white">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {(transactions.current_page - 1) * transactions.per_page + 1} to{' '}
                                    {Math.min(transactions.current_page * transactions.per_page, transactions.total)} of {transactions.total} results
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={transactions.current_page === 1}
                                        onClick={() => router.get(`/admin/inventory/transactions?page=${transactions.current_page - 1}`)}
                                        className="bg-white border border-gray-300 hover:bg-gray-50 text-black shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm font-medium">
                                        Page {transactions.current_page} of {transactions.last_page}
                                    </span>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={transactions.current_page === transactions.last_page}
                                        onClick={() => router.get(`/admin/inventory/transactions?page=${transactions.current_page + 1}`)}
                                        className="bg-white border border-gray-300 hover:bg-gray-50 text-black shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

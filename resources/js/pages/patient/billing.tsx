import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import SharedNavigation from '@/components/SharedNavigation';
import { Head, Link } from '@inertiajs/react';
import { Receipt, Search, Eye, Calendar, DollarSign, FileText, Download } from 'lucide-react';
import { useState } from 'react';

interface PatientBillingProps {
    user: {
        name: string;
        email: string;
        role: string;
    };
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        patient_no: string;
    };
    transactions: Array<{
        id: number;
        transaction_id: string;
        patient: {
            id: number;
            first_name: string;
            last_name: string;
            patient_no: string;
        } | null;
        doctor: {
            id: number;
            name: string;
        } | null;
        payment_type: 'cash' | 'health_card' | 'discount';
        total_amount: number;
        amount: number;
        discount_amount: number;
        discount_percentage: number | null;
        is_senior_citizen: boolean;
        senior_discount_amount: number;
        senior_discount_percentage: number | null;
        hmo_provider: string | null;
        hmo_reference: string | null;
        hmo_reference_number: string | null;
        payment_method: 'cash' | 'card' | 'bank_transfer' | 'check' | 'hmo';
        payment_reference: string | null;
        status: 'draft' | 'pending' | 'paid' | 'cancelled' | 'refunded';
        description: string | null;
        notes: string | null;
        transaction_date: string;
        due_date: string | null;
        created_at: string;
        items: Array<{
            id: number;
            item_type: string;
            item_name: string;
            item_description: string;
            quantity: number;
            unit_price: number;
            total_price: number;
        }>;
        createdBy: {
            id: number;
            name: string;
        } | null;
    }>;
    notifications?: Array<{
        id: number;
        type: string;
        title: string;
        message: string;
        read: boolean;
        created_at: string;
        data: any;
    }>;
    unreadCount?: number;
}

const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
        'paid': { label: 'Paid', variant: 'default' },
        'pending': { label: 'Pending', variant: 'secondary' },
        'draft': { label: 'Draft', variant: 'outline' },
        'cancelled': { label: 'Cancelled', variant: 'destructive' },
        'refunded': { label: 'Refunded', variant: 'destructive' },
    };
    const statusConfig = statuses[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
};

const formatCurrency = (amount: number) => {
    return `₱${Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export default function PatientBilling({
    user,
    patient,
    transactions = [],
    notifications = [],
    unreadCount = 0
}: PatientBillingProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = 
            transaction.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (transaction.description && transaction.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const totalPaid = transactions
        .filter(t => t.status === 'paid')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalPending = transactions
        .filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <>
            <Head title="Billing History" />
            <SharedNavigation user={user} currentPath="/patient/billing" notifications={notifications} unreadCount={unreadCount} />
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <Receipt className="h-8 w-8" />
                            Billing History
                        </h1>
                        <p className="text-gray-600 mt-2">
                            View your billing transactions and receipts
                        </p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{transactions.length}</div>
                                <p className="text-xs text-muted-foreground">All billing records</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
                                <p className="text-xs text-muted-foreground">Completed payments</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalPending)}</div>
                                <p className="text-xs text-muted-foreground">Awaiting payment</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Filter Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search by transaction ID or description..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="w-full md:w-48">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                        <option value="draft">Draft</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transactions Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Transactions</CardTitle>
                            <CardDescription>
                                {filteredTransactions.length} transaction(s) found
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredTransactions.length === 0 ? (
                                <div className="text-center py-12">
                                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No transactions found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Transaction ID</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Payment Method</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredTransactions.map((transaction) => (
                                                <TableRow key={transaction.id}>
                                                    <TableCell className="font-medium">
                                                        {transaction.transaction_id}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(transaction.transaction_date)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {transaction.description || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="font-semibold">
                                                        {formatCurrency(transaction.amount)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {transaction.payment_method.toUpperCase()}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(transaction.status)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link
                                                            href={`/patient/billing/${transaction.id}/receipt`}
                                                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            View Receipt
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}


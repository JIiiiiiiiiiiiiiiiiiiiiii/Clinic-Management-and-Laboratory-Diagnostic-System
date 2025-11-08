import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { 
    Plus, 
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    CreditCard,
    Calculator,
    Receipt,
    Stethoscope,
    Microscope,
    Scan,
    Calendar,
    User,
    Coins
} from 'lucide-react';
import { useState } from 'react';

type ManualTransaction = {
    id: number;
    transaction_id: string;
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        patient_no: string;
    };
    specialist?: {
        id: number;
        name: string;
        role: string;
        specialization: string;
    };
    transaction_type: string;
    specialist_type: string;
    amount: number;
    final_amount: number;
    payment_method: string;
    status: string;
    description: string;
    transaction_date: string;
    created_at: string;
    creator: {
        id: number;
        name: string;
    };
};

type Summary = {
    total_transactions: number;
    pending_transactions: number;
    paid_transactions: number;
    total_revenue: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Manual Transactions', href: '/admin/manual-transactions' },
];

export default function ManualTransactionsIndex({ 
    transactions,
    summary,
    filters
}: { 
    transactions: {
        data: ManualTransaction[];
        links: any[];
        meta: any;
    };
    summary: Summary;
    filters: any;
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.transaction_type || 'all');
    const [specialistTypeFilter, setSpecialistTypeFilter] = useState(filters.specialist_type || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const getTransactionTypeIcon = (type: string) => {
        switch (type) {
            case 'consultation':
                return <Stethoscope className="h-4 w-4" />;
            case 'laboratory':
                return <Microscope className="h-4 w-4" />;
            case 'radiology':
                return <Scan className="h-4 w-4" />;
            default:
                return <Receipt className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentMethodColor = (method: string) => {
        switch (method) {
            case 'cash':
                return 'bg-green-100 text-green-800';
            case 'hmo':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleFilter = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (typeFilter !== 'all') params.append('transaction_type', typeFilter);
        if (specialistTypeFilter !== 'all') params.append('specialist_type', specialistTypeFilter);
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);
        
        window.location.href = `/admin/manual-transactions?${params.toString()}`;
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setTypeFilter('all');
        setSpecialistTypeFilter('all');
        setDateFrom('');
        setDateTo('');
        window.location.href = '/admin/manual-transactions';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manual Transactions" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Heading title="Manual Transactions" description="Manage manual payment transactions" icon={CreditCard} />
                        </div>
                        <Button asChild>
                            <Link href="/admin/manual-transactions/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Transaction
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.total_transactions}</p>
                                </div>
                                <Calculator className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-600">{summary.pending_transactions}</p>
                                </div>
                                <Receipt className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Paid</p>
                                    <p className="text-2xl font-bold text-green-600">{summary.paid_transactions}</p>
                                </div>
                                <CreditCard className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-green-600">₱{summary.total_revenue.toLocaleString()}</p>
                                </div>
                                <Coins className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search transactions..."
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Transaction Type</Label>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="consultation">Consultation</SelectItem>
                                        <SelectItem value="laboratory">Laboratory</SelectItem>
                                        <SelectItem value="radiology">Radiology</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="specialist_type">Specialist Type</Label>
                                <Select value={specialistTypeFilter} onValueChange={setSpecialistTypeFilter}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="doctor">Doctor</SelectItem>
                                        <SelectItem value="medtech">MedTech</SelectItem>
                                        <SelectItem value="nurse">Nurse</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date_from">Date From</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date_to">Date To</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <Button onClick={handleFilter}>
                                <Filter className="mr-2 h-4 w-4" />
                                Apply Filters
                            </Button>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Transactions List */}
                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            Manual Transactions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {transactions.data.length === 0 ? (
                            <div className="text-center py-8">
                                <Receipt className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <h3 className="mb-2 text-lg font-semibold text-gray-600">No manual transactions found</h3>
                                <p className="text-gray-500 mb-4">Create your first manual transaction</p>
                                <Button asChild>
                                    <Link href="/admin/manual-transactions/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Transaction
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {transactions.data.map((transaction) => (
                                    <div key={transaction.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    {getTransactionTypeIcon(transaction.transaction_type)}
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {transaction.patient.last_name}, {transaction.patient.first_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {transaction.patient.patient_no} • {transaction.transaction_id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="font-semibold text-gray-900">
                                                        ₱{transaction.final_amount.toLocaleString()}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(transaction.transaction_date).toLocaleDateString()}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                                        {transaction.status}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(transaction.payment_method)}`}>
                                                        {transaction.payment_method.toUpperCase()}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={`/admin/manual-transactions/${transaction.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={`/admin/manual-transactions/${transaction.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {transaction.specialist && (
                                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                                <User className="h-4 w-4" />
                                                <span>{transaction.specialist.name} ({transaction.specialist.role})</span>
                                            </div>
                                        )}

                                        {transaction.description && (
                                            <div className="mt-2 text-sm text-gray-600">
                                                {transaction.description}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

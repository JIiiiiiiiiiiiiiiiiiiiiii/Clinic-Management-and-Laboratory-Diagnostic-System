import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    Check,
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    Edit,
    Eye,
    FileText,
    Filter,
    MoreHorizontal,
    Plus,
    Printer,
    Receipt,
    Search,
    Trash2,
    TrendingUp,
    Users,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

type BillingTransaction = {
    id: number;
    transaction_id: string;
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        patient_no: string;
    };
    doctor: {
        id: number;
        name: string;
    } | null;
    payment_type: 'cash' | 'health_card' | 'discount';
    total_amount: number;
    discount_amount: number;
    hmo_provider: string | null;
    payment_method: 'cash' | 'card' | 'bank_transfer' | 'check' | 'hmo';
    status: 'draft' | 'pending' | 'paid' | 'cancelled' | 'refunded';
    description: string | null;
    transaction_date: string;
    due_date: string | null;
    created_at: string;
    items: Array<{
        id: number;
        item_type: string;
        item_name: string;
        quantity: number;
        unit_price: number;
        total_price: number;
    }>;
};

type Summary = {
    total_revenue: number;
    pending_amount: number;
    total_transactions: number;
    paid_transactions: number;
    total_expenses: number;
    total_doctor_payments: number;
    net_profit: number;
};

type Doctor = {
    id: number;
    name: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Billing',
        href: '/admin/billing',
    },
];

const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-500', icon: FileText },
    pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
    paid: { label: 'Paid', color: 'bg-green-500', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
    refunded: { label: 'Refunded', color: 'bg-orange-500', icon: AlertCircle },
};

const paymentMethodConfig = {
    cash: { label: 'Cash', color: 'bg-green-100 text-green-800' },
    card: { label: 'Card', color: 'bg-blue-100 text-blue-800' },
    bank_transfer: { label: 'Bank Transfer', color: 'bg-purple-100 text-purple-800' },
    check: { label: 'Check', color: 'bg-yellow-100 text-yellow-800' },
    hmo: { label: 'HMO', color: 'bg-indigo-100 text-indigo-800' },
};

type PendingAppointment = {
    id: number;
    patient_name: string;
    patient_id: string;
    appointment_type: string;
    price: number;
    appointment_date: string;
    appointment_time: string;
    specialist_name: string;
    billing_status: string;
};

export default function BillingIndex({
    transactions,
    pendingAppointments,
    doctorPayments,
    expenses,
    revenueData,
    expenseData,
    doctorPaymentData,
    summary,
    doctors,
    filters,
    defaultTab = 'transactions',
    debug,
}: {
    transactions: any;
    pendingAppointments: PendingAppointment[];
    doctorPayments: any;
    expenses: any;
    revenueData: any[];
    expenseData: any[];
    doctorPaymentData: any[];
    summary: Summary;
    doctors: Doctor[];
    filters: any;
    defaultTab?: string;
    debug?: any;
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState(filters.payment_method || 'all');
    const [doctorFilter, setDoctorFilter] = useState(filters.doctor_id || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<BillingTransaction | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentReference, setPaymentReference] = useState('');

    // Ensure we have data to work with
    const transactionsData = Array.isArray(transactions?.data) ? transactions.data : Array.isArray(transactions) ? transactions : [];

    // Debug logging
    console.log('Debug info:', debug);
    console.log('Transactions data:', transactions);
    console.log('Transactions data count:', transactionsData.length);
    console.log('Sample transaction:', transactionsData[0]);
    console.log('Doctor payments data:', doctorPayments);
    console.log('Doctor payments data count:', doctorPayments?.data?.length || 0);

    const filteredTransactions = transactionsData.filter((transaction: BillingTransaction) => {
        const patientName = transaction.patient ? `${transaction.patient.first_name} ${transaction.patient.last_name}`.toLowerCase() : '';
        const search = searchTerm.toLowerCase();

        const matchesSearch =
            patientName.includes(search) ||
            transaction.transaction_id.toLowerCase().includes(search) ||
            (transaction.patient?.patient_no || '').toLowerCase().includes(search);

        const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
        const matchesPaymentMethod = paymentMethodFilter === 'all' || transaction.payment_method === paymentMethodFilter;
        const matchesDoctor = doctorFilter === 'all' || transaction.doctor?.id.toString() === doctorFilter;

        return matchesSearch && matchesStatus && matchesPaymentMethod && matchesDoctor;
    });

    const getStatusBadge = (status: keyof typeof statusConfig) => {
        const config = statusConfig[status];
        const Icon = config.icon;

        const variantMap = {
            draft: 'secondary',
            pending: 'warning',
            paid: 'success',
            cancelled: 'destructive',
            refunded: 'destructive',
        };

        return (
            <Badge variant={variantMap[status] as any}>
                <Icon className="mr-1 h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getPaymentMethodBadge = (method: keyof typeof paymentMethodConfig) => {
        const config = paymentMethodConfig[method];
        return <Badge className={config.color}>{config.label}</Badge>;
    };

    const handleFilter = () => {
        router.get(
            '/admin/billing',
            {
                search: searchTerm,
                status: statusFilter,
                payment_method: paymentMethodFilter,
                doctor_id: doctorFilter,
                date_from: dateFrom,
                date_to: dateTo,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleMarkPaidClick = (transaction: BillingTransaction) => {
        setSelectedTransaction(transaction);
        setShowMarkPaidModal(true);
    };

    const handleMarkPaid = () => {
        if (!selectedTransaction) return;

        router.put(
            `/admin/billing/${selectedTransaction.id}/mark-paid`,
            {
                payment_method: paymentMethod,
                payment_reference: paymentReference,
            },
            {
                onSuccess: () => {
                    setShowMarkPaidModal(false);
                    setSelectedTransaction(null);
                    setPaymentMethod('cash');
                    setPaymentReference('');
                },
                onError: (errors) => {
                    console.error('Mark as paid failed:', errors);
                    alert('Failed to mark transaction as paid. Please try again.');
                },
            },
        );
    };

    const handleStatusUpdate = (transactionId: number, newStatus: string) => {
        router.put(
            `/admin/billing/${transactionId}/status`,
            { status: newStatus },
            {
                onSuccess: () => {},
                onError: (errors) => {
                    console.error('Status update failed:', errors);
                    alert('Failed to update status. Please try again.');
                },
            },
        );
    };

    const handleDelete = (transactionId: number) => {
        if (confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
            router.delete(`/admin/billing/${transactionId}`, {
                onSuccess: () => {},
                onError: (errors) => {
                    console.error('Delete failed:', errors);
                    alert('Failed to delete transaction. Please try again.');
                },
            });
        }
    };

    // Report Action Functions
    const handleTransactionReport = () => {
        const reportDateFrom = dateFrom || new Date().toISOString().split('T')[0];
        const reportDateTo = dateTo || new Date().toISOString().split('T')[0];

        // Navigate to transaction report with current filters
        router.get('/admin/billing/transaction-report', {
            date_from: reportDateFrom,
            date_to: reportDateTo,
            status: statusFilter,
            payment_method: paymentMethodFilter,
            doctor_id: doctorFilter,
        });
    };

    const handleDoctorSummary = () => {
        const reportDateFrom = dateFrom || new Date().toISOString().split('T')[0];
        const reportDateTo = dateTo || new Date().toISOString().split('T')[0];

        // Navigate to doctor summary report
        router.get('/admin/billing/reports/doctor-summary', {
            date_from: reportDateFrom,
            date_to: reportDateTo,
            doctor_id: doctorFilter,
        });
    };

    const handleHMOReport = () => {
        const reportDateFrom = dateFrom || new Date().toISOString().split('T')[0];
        const reportDateTo = dateTo || new Date().toISOString().split('T')[0];

        // Navigate to HMO report
        router.get('/admin/billing/reports/hmo', {
            date_from: reportDateFrom,
            date_to: reportDateTo,
        });
    };

    const handleExportAll = () => {
        const reportDateFrom = dateFrom || new Date().toISOString().split('T')[0];
        const reportDateTo = dateTo || new Date().toISOString().split('T')[0];

        // Show export options modal or direct export
        const exportUrl = `/admin/billing/reports/export-all?date_from=${reportDateFrom}&date_to=${reportDateTo}&format=excel`;
        window.open(exportUrl, '_blank');
    };

    // Enhanced Export Functions with Format Options
    const handleExportWithFormat = (reportType: string, format: 'excel' | 'pdf' = 'excel') => {
        const reportDateFrom = dateFrom || new Date().toISOString().split('T')[0];
        const reportDateTo = dateTo || new Date().toISOString().split('T')[0];

        const exportUrl = `/admin/billing/reports/${reportType}/export?date_from=${reportDateFrom}&date_to=${reportDateTo}&format=${format}`;
        window.open(exportUrl, '_blank');
    };

    // Quick Export Functions
    const handleQuickExport = (type: 'transactions' | 'doctor-payments' | 'expenses' | 'all') => {
        const reportDateFrom = dateFrom || new Date().toISOString().split('T')[0];
        const reportDateTo = dateTo || new Date().toISOString().split('T')[0];

        const exportUrl = `/admin/billing/export/${type}?date_from=${reportDateFrom}&date_to=${reportDateTo}&format=excel`;
        window.open(exportUrl, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing & Payments" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Heading title="Billing & Payments" description="Manage all clinic financial transactions" icon={CreditCard} />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex h-20 w-52 items-center overflow-hidden rounded-xl border bg-white px-6 py-4 shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gray-100 p-2">
                                        <DollarSign className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl leading-tight font-bold whitespace-nowrap text-gray-900">
                                            ₱{summary.total_revenue.toLocaleString()}
                                        </div>
                                        <div className="text-sm font-medium whitespace-nowrap text-gray-600">Total Revenue</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex h-20 w-52 items-center overflow-hidden rounded-xl border bg-white px-6 py-4 shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gray-100 p-2">
                                        <TrendingUp className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl leading-tight font-bold whitespace-nowrap text-gray-900">
                                            {summary.paid_transactions}
                                        </div>
                                        <div className="text-sm font-medium whitespace-nowrap text-gray-600">Paid Transactions</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Debug Info */}
                {debug && (
                    <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                        <h3 className="font-semibold text-yellow-800">Debug Info:</h3>
                        <p>
                            Transactions: {debug.transactions_count} (Total: {debug.transactions_total})
                        </p>
                        <p>Doctor Payments: {debug.doctor_payments_count}</p>
                        <p>Expenses: {debug.expenses_count}</p>
                    </div>
                )}

                {/* Main Content with Tabs */}
                <Tabs defaultValue={defaultTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="transactions">Transactions</TabsTrigger>
                        <TabsTrigger value="pending-appointments">Pending Appointments</TabsTrigger>
                        <TabsTrigger value="doctor-payments">Doctor Payments</TabsTrigger>
                        <TabsTrigger value="expenses">Expenses</TabsTrigger>
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                    </TabsList>

                    {/* Transactions Tab */}
                    <TabsContent value="transactions">
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gray-100 p-2">
                                        <CreditCard className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Billing Transactions</CardTitle>
                                        <p className="mt-1 text-sm text-gray-500">Manage patient payments and billing records</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button asChild>
                                                    <Link href="/admin/billing/create">
                                                        <Plus className="mr-2 h-5 w-5" />
                                                        New Transaction
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Create New Transaction</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline">
                                                <Download className="mr-2 h-5 w-5" />
                                                Export
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => window.open('/admin/billing/export?format=excel', '_self')}>
                                                Excel
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => window.open('/admin/billing/export?format=pdf', '_self')}>
                                                PDF
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {/* Filters */}
                                <div className="mb-6">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="relative max-w-md flex-1">
                                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                            <Input
                                                placeholder="Search transactions..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="h-12 rounded-xl border-gray-300 pl-10 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                                            />
                                        </div>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="h-12 rounded-xl border border-gray-200 px-4 focus:border-gray-500 focus:ring-gray-500"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="draft">Draft</option>
                                            <option value="pending">Pending</option>
                                            <option value="paid">Paid</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="refunded">Refunded</option>
                                        </select>
                                        <select
                                            value={paymentMethodFilter}
                                            onChange={(e) => setPaymentMethodFilter(e.target.value)}
                                            className="h-12 rounded-xl border border-gray-200 px-4 focus:border-gray-500 focus:ring-gray-500"
                                        >
                                            <option value="all">All Payment Methods</option>
                                            <option value="cash">Cash</option>
                                            <option value="card">Card</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="check">Check</option>
                                            <option value="hmo">HMO</option>
                                        </select>
                                        <select
                                            value={doctorFilter}
                                            onChange={(e) => setDoctorFilter(e.target.value)}
                                            className="h-12 rounded-xl border border-gray-200 px-4 focus:border-gray-500 focus:ring-gray-500"
                                        >
                                            <option value="all">All Specialists</option>
                                            {doctors.map((doctor) => (
                                                <option key={doctor.id} value={doctor.id.toString()}>
                                                    {doctor.name}
                                                </option>
                                            ))}
                                        </select>
                                        <Button onClick={handleFilter} className="h-12 px-6">
                                            <Filter className="mr-2 h-4 w-4" />
                                            Apply Filters
                                        </Button>
                                    </div>
                                </div>

                                {/* Transactions Table */}
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
                                            <TableRow className="hover:bg-gray-50">
                                                <TableHead className="font-semibold text-gray-700">
                                                    <div className="flex items-center gap-2">
                                                        <Receipt className="h-4 w-4" />
                                                        Transaction ID
                                                    </div>
                                                </TableHead>
                                                <TableHead className="font-semibold text-gray-700">Patient</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Specialist</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Payment Method</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Date</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {!filteredTransactions || filteredTransactions.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="py-8 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <CreditCard className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                            <h3 className="mb-2 text-lg font-semibold text-gray-600">
                                                                {searchTerm ? 'No transactions found' : 'No billing transactions yet'}
                                                            </h3>
                                                            <p className="text-gray-500">
                                                                {searchTerm
                                                                    ? 'Try adjusting your search terms'
                                                                    : 'Create your first transaction to get started'}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredTransactions.map((transaction: BillingTransaction) => {
                                                    return (
                                                        <TableRow key={transaction.id} className="hover:bg-gray-50">
                                                            <TableCell className="font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="rounded-full bg-gray-100 p-1">
                                                                        <Receipt className="h-4 w-4 text-black" />
                                                                    </div>
                                                                    {transaction.transaction_id}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div>
                                                                    <div className="font-medium">
                                                                        {transaction.patient
                                                                            ? `${transaction.patient.last_name}, ${transaction.patient.first_name}`
                                                                            : 'Loading...'}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {transaction.patient?.patient_no || 'Loading...'}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {transaction.doctor ? (
                                                                    <div className="font-medium">{transaction.doctor.name}</div>
                                                                ) : (
                                                                    <span className="text-gray-400">—</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="font-semibold">
                                                                ₱{transaction.total_amount.toLocaleString()}
                                                            </TableCell>
                                                            <TableCell>{getPaymentMethodBadge(transaction.payment_method)}</TableCell>
                                                            <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                                                            <TableCell className="text-sm text-gray-600">
                                                                {new Date(transaction.transaction_date).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex gap-2">
                                                                    <Button asChild size="sm">
                                                                        <Link href={`/admin/billing/${transaction.id}`}>
                                                                            <Eye className="mr-1 h-3 w-3" />
                                                                            View
                                                                        </Link>
                                                                    </Button>
                                                                    {transaction.status === 'pending' && (
                                                                        <Button size="sm" onClick={() => handleMarkPaidClick(transaction)}>
                                                                            <CheckCircle className="mr-1 h-3 w-3" />
                                                                            Mark Paid
                                                                        </Button>
                                                                    )}
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button size="sm" variant="outline">
                                                                                <MoreHorizontal className="h-3 w-3" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/admin/billing/${transaction.id}/edit`}>
                                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                                    Edit
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/admin/billing/${transaction.id}/receipt`}>
                                                                                    <Printer className="mr-2 h-4 w-4" />
                                                                                    Print Receipt
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                onClick={() => handleDelete(transaction.id)}
                                                                                className="text-red-600"
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                Delete
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Pending Appointments Tab */}
                    <TabsContent value="pending-appointments">
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gray-100 p-2">
                                        <Calendar className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Pending Appointments</CardTitle>
                                        <p className="mt-1 text-sm text-gray-500">Appointments awaiting payment processing</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button asChild>
                                        <Link href="/admin/billing/create-from-appointments">
                                            <Plus className="mr-2 h-5 w-5" />
                                            Create Transaction
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {/* Pending Appointments Table */}
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
                                            <TableRow className="hover:bg-gray-50">
                                                <TableHead className="font-semibold text-gray-700">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        Patient
                                                    </div>
                                                </TableHead>
                                                <TableHead className="font-semibold text-gray-700">Appointment Type</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Specialist</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Date & Time</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Price</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pendingAppointments.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="py-8 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                            <h3 className="mb-2 text-lg font-semibold text-gray-600">No pending appointments</h3>
                                                            <p className="text-gray-500">All appointments have been processed for billing</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                pendingAppointments.map((appointment: PendingAppointment) => (
                                                    <TableRow key={appointment.id} className="hover:bg-gray-50">
                                                        <TableCell className="font-medium">
                                                            <div>
                                                                <div className="font-medium">{appointment.patient_name}</div>
                                                                <div className="text-sm text-gray-500">{appointment.patient_id}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="capitalize">
                                                                {appointment.appointment_type}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">{appointment.specialist_name}</div>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-gray-600">
                                                            <div>
                                                                <div>{new Date(appointment.appointment_date).toLocaleDateString()}</div>
                                                                <div className="text-gray-500">{appointment.appointment_time}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-semibold">₱{appointment.price.toLocaleString()}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary">
                                                                <Clock className="mr-1 h-3 w-3" />
                                                                Pending Payment
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button asChild size="sm" variant="outline">
                                                                    <Link href={`/admin/appointments/${appointment.id}`}>
                                                                        <Eye className="mr-1 h-3 w-3" />
                                                                        View
                                                                    </Link>
                                                                </Button>
                                                                <Button asChild size="sm">
                                                                    <Link
                                                                        href={`/admin/billing/create-from-appointments?appointment_id=${appointment.id}`}
                                                                    >
                                                                        <CreditCard className="mr-1 h-3 w-3" />
                                                                        Pay Now
                                                                    </Link>
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Doctor Payments Tab */}
                    <TabsContent value="doctor-payments">
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gray-100 p-2">
                                        <Users className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Doctor Payments</CardTitle>
                                        <p className="mt-1 text-sm text-gray-500">Manage doctor salary payments and commissions</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button asChild>
                                        <Link href="/admin/billing/doctor-payments/create">
                                            <Plus className="mr-2 h-5 w-5" />
                                            New Payment
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href="/admin/billing/doctor-summary">
                                            <TrendingUp className="mr-2 h-5 w-5" />
                                            Summary Report
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {/* Search and Filters */}
                                <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                                    <div className="flex-1">
                                        <Input placeholder="Search payments..." className="w-full" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Select defaultValue="all">
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue placeholder="All Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select defaultValue="all">
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue placeholder="All Doctors" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Doctors</SelectItem>
                                                {doctors?.map((doctor: any) => (
                                                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                                        {doctor.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button variant="outline">
                                            <Filter className="mr-2 h-4 w-4" />
                                            Apply Filters
                                        </Button>
                                    </div>
                                </div>

                                {/* Doctor Payments Table */}
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
                                            <TableRow className="hover:bg-gray-50">
                                                <TableHead className="font-semibold text-gray-700">Doctor</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Basic Salary</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Deductions</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Holiday Pay</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Incentives</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Net Payment</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Payment Date</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {doctorPayments?.data?.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={9} className="py-8 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                            <h3 className="mb-2 text-lg font-semibold text-gray-600">No doctor payments</h3>
                                                            <p className="text-gray-500">Create your first doctor payment</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                (Array.isArray(doctorPayments?.data)
                                                    ? doctorPayments.data
                                                    : Array.isArray(doctorPayments)
                                                      ? doctorPayments
                                                      : []
                                                ).map((payment: any) => (
                                                    <TableRow key={payment.id} className="hover:bg-gray-50">
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <Users className="h-4 w-4 text-gray-500" />
                                                                {payment.doctor?.name || 'N/A'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-semibold">
                                                            ₱{payment.basic_salary?.toLocaleString() || '0.00'}
                                                        </TableCell>
                                                        <TableCell className="text-red-600">
                                                            -₱{payment.deductions?.toLocaleString() || '0.00'}
                                                        </TableCell>
                                                        <TableCell className="text-green-600">
                                                            +₱{payment.holiday_pay?.toLocaleString() || '0.00'}
                                                        </TableCell>
                                                        <TableCell className="text-green-600">
                                                            +₱{payment.incentives?.toLocaleString() || '0.00'}
                                                        </TableCell>
                                                        <TableCell className="font-semibold">
                                                            ₱{payment.net_payment?.toLocaleString() || '0.00'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={
                                                                    payment.status === 'paid'
                                                                        ? 'default'
                                                                        : payment.status === 'pending'
                                                                          ? 'secondary'
                                                                          : 'destructive'
                                                                }
                                                            >
                                                                <div className="flex items-center gap-1">
                                                                    {payment.status === 'pending' && <Clock className="h-3 w-3" />}
                                                                    {payment.status === 'paid' && <Check className="h-3 w-3" />}
                                                                    {payment.status === 'cancelled' && <X className="h-3 w-3" />}
                                                                    {payment.status}
                                                                </div>
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button asChild size="sm" variant="outline">
                                                                    <Link href={`/admin/billing/doctor-payments/${payment.id}`}>
                                                                        <Eye className="mr-1 h-3 w-3" />
                                                                        View
                                                                    </Link>
                                                                </Button>
                                                                <Button asChild size="sm" variant="outline">
                                                                    <Link href={`/admin/billing/doctor-payments/${payment.id}/edit`}>
                                                                        <Edit className="mr-1 h-3 w-3" />
                                                                        Edit
                                                                    </Link>
                                                                </Button>
                                                                {payment.status === 'pending' && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="text-green-600 hover:text-green-700"
                                                                    >
                                                                        <Check className="mr-1 h-3 w-3" />
                                                                        Mark Paid
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Expenses Tab */}
                    <TabsContent value="expenses">
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gray-100 p-2">
                                        <FileText className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Expenses</CardTitle>
                                        <p className="mt-1 text-sm text-gray-500">Track clinic expenses and costs</p>
                                    </div>
                                </div>
                                <Button asChild>
                                    <Link href="/admin/billing/expenses/create">
                                        <Plus className="mr-2 h-5 w-5" />
                                        New Expense
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6">
                                {/* Expenses Table */}
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
                                            <TableRow className="hover:bg-gray-50">
                                                <TableHead className="font-semibold text-gray-700">Description</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Category</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Date</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {expenses?.data?.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="py-8 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                            <h3 className="mb-2 text-lg font-semibold text-gray-600">No expenses</h3>
                                                            <p className="text-gray-500">Create your first expense record</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                expenses?.data?.map((expense: any) => (
                                                    <TableRow key={expense.id} className="hover:bg-gray-50">
                                                        <TableCell className="font-medium">{expense.description}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{expense.category?.name || 'General'}</Badge>
                                                        </TableCell>
                                                        <TableCell className="font-semibold">₱{expense.amount?.toLocaleString()}</TableCell>
                                                        <TableCell>{new Date(expense.expense_date).toLocaleDateString()}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={expense.status === 'approved' ? 'default' : 'secondary'}>
                                                                {expense.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button asChild size="sm" variant="outline">
                                                                    <Link href={`/admin/billing/expenses/${expense.id}`}>
                                                                        <Eye className="mr-1 h-3 w-3" />
                                                                        View
                                                                    </Link>
                                                                </Button>
                                                                <Button asChild size="sm" variant="outline">
                                                                    <Link href={`/admin/billing/expenses/${expense.id}/edit`}>
                                                                        <Edit className="mr-1 h-3 w-3" />
                                                                        Edit
                                                                    </Link>
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Reports Tab */}
                    <TabsContent value="reports">
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                                <Card className="shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                                <p className="text-2xl font-bold text-green-600">₱{summary.total_revenue?.toLocaleString() || '0'}</p>
                                            </div>
                                            <div className="rounded-full bg-green-100 p-3">
                                                <DollarSign className="h-6 w-6 text-green-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                                                <p className="text-2xl font-bold text-red-600">₱{summary.total_expenses?.toLocaleString() || '0'}</p>
                                            </div>
                                            <div className="rounded-full bg-red-100 p-3">
                                                <FileText className="h-6 w-6 text-red-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Doctor Payments</p>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    ₱{summary.total_doctor_payments?.toLocaleString() || '0'}
                                                </p>
                                            </div>
                                            <div className="rounded-full bg-blue-100 p-3">
                                                <Users className="h-6 w-6 text-blue-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                                                <p className="text-2xl font-bold text-purple-600">₱{summary.net_profit?.toLocaleString() || '0'}</p>
                                            </div>
                                            <div className="rounded-full bg-purple-100 p-3">
                                                <TrendingUp className="h-6 w-6 text-purple-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Quick Actions */}
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                        <TrendingUp className="h-5 w-5 text-black" />
                                        Report Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <Button variant="outline" className="flex h-20 flex-col gap-2" onClick={handleTransactionReport}>
                                            <Calendar className="h-6 w-6" />
                                            Transaction Report
                                        </Button>
                                        <Button variant="outline" className="flex h-20 flex-col gap-2" onClick={handleDoctorSummary}>
                                            <Users className="h-6 w-6" />
                                            Doctor Summary
                                        </Button>
                                        <Button variant="outline" className="flex h-20 flex-col gap-2" onClick={handleHMOReport}>
                                            <FileText className="h-6 w-6" />
                                            HMO Report
                                        </Button>
                                        <Button variant="outline" className="flex h-20 flex-col gap-2" onClick={handleExportAll}>
                                            <Download className="h-6 w-6" />
                                            Export All
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Mark as Paid Modal */}
                {showMarkPaidModal && selectedTransaction && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
                        <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
                            <div className="p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Mark as Paid</h3>
                                    <Button variant="outline" size="sm" onClick={() => setShowMarkPaidModal(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="mb-2 text-sm text-gray-600">
                                            Transaction: <span className="font-medium">{selectedTransaction.transaction_id}</span>
                                        </p>
                                        <p className="mb-4 text-sm text-gray-600">
                                            Amount: <span className="font-medium">₱{selectedTransaction.total_amount.toLocaleString()}</span>
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="payment_method">Payment Method</Label>
                                        <select
                                            id="payment_method"
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-black"
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="card">Card</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="check">Check</option>
                                            <option value="hmo">HMO</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="payment_reference">Payment Reference (Optional)</Label>
                                        <Input
                                            id="payment_reference"
                                            value={paymentReference}
                                            onChange={(e) => setPaymentReference(e.target.value)}
                                            placeholder="Enter payment reference number"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <Button variant="outline" onClick={() => setShowMarkPaidModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleMarkPaid} className="bg-green-600 hover:bg-green-700">
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Mark as Paid
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

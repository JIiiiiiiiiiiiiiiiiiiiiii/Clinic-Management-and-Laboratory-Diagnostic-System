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
import Heading from '@/components/heading';
import { safeFormatDate, safeFormatTime } from '@/utils/dateTime';
import { 
    AlertCircle, 
    ArrowLeft, 
    CheckCircle, 
    Clock, 
    Download, 
    Eye, 
    FileText, 
    Plus, 
    Search, 
    XCircle, 
    CreditCard,
    Receipt,
    DollarSign,
    TrendingUp,
    Users,
    Calendar,
    Edit,
    Filter,
    Printer,
    Trash2,
    MoreHorizontal,
    X,
    Check
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
    amount: number;
    discount_amount: number;
    discount_percentage: number | null;
    is_senior_citizen: boolean;
    senior_discount_amount: number;
    senior_discount_percentage: number;
    hmo_provider: string | null;
    hmo_reference: string | null;
    hmo_reference_number: string | null;
    payment_method: 'cash' | 'hmo';
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
    revenueData,
    doctorPaymentData,
    summary, 
    doctors, 
    filters,
    defaultTab = 'transactions',
    debug
}: { 
    transactions: any;
    pendingAppointments: PendingAppointment[];
    doctorPayments: any;
    revenueData: any[];
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
    
    // Sorting state
    const [sortBy, setSortBy] = useState<string>(filters.sort_by || 'transaction_date');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>(filters.sort_dir || 'desc');

    // Ensure we have data to work with
    const transactionsData = transactions?.data || [];
    
    
    const filteredTransactions = (transactionsData || []).filter((transaction: BillingTransaction) => {
        if (!transaction) {
            return false;
        }
        
        const patientName = transaction.patient ? 
            `${transaction.patient.first_name || ''} ${transaction.patient.last_name || ''}`.toLowerCase() : '';
        const search = searchTerm.toLowerCase();
        
        const matchesSearch = patientName.includes(search) || 
                            (transaction.transaction_id || '').toLowerCase().includes(search) ||
                            (transaction.patient?.patient_no || '').toLowerCase().includes(search);
        
        const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
        const matchesPaymentMethod = paymentMethodFilter === 'all' || transaction.payment_method === paymentMethodFilter;
        const matchesDoctor = doctorFilter === 'all' || transaction.doctor?.id?.toString() === doctorFilter;
        
        const passes = matchesSearch && matchesStatus && matchesPaymentMethod && matchesDoctor;
        
        
        return passes;
    });
    


    const getStatusBadge = (status: keyof typeof statusConfig) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        
        const variantMap = {
            draft: 'secondary',
            pending: 'warning',
            paid: 'success',
            cancelled: 'destructive',
            refunded: 'destructive'
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
        return (
            <Badge className={config.color}>
                {config.label}
            </Badge>
        );
    };

    // Handle sorting
    const handleSort = (field: string) => {
        const newSortDir = sortBy === field && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(field);
        setSortDir(newSortDir);
        router.get('/admin/billing', {
            search: searchTerm,
            status: statusFilter,
            payment_method: paymentMethodFilter,
            doctor_id: doctorFilter,
            date_from: dateFrom,
            date_to: dateTo,
            sort_by: field,
            sort_dir: newSortDir,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilter = () => {
        router.get('/admin/billing', {
            search: searchTerm,
            status: statusFilter,
            payment_method: paymentMethodFilter,
            doctor_id: doctorFilter,
            date_from: dateFrom,
            date_to: dateTo,
            sort_by: sortBy,
            sort_dir: sortDir,
        }, {
            preserveState: true,
            replace: true,
        });
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
                onSuccess: () => {
                },
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
                onSuccess: () => {
                },
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
        router.get('/admin/billing/billing-reports/doctor-summary', {
            date_from: reportDateFrom,
            date_to: reportDateTo,
            doctor_id: doctorFilter,
        });
    };

    const handleHMOReport = () => {
        const reportDateFrom = dateFrom || new Date().toISOString().split('T')[0];
        const reportDateTo = dateTo || new Date().toISOString().split('T')[0];
        
        // Navigate to HMO report
        router.get('/admin/billing/billing-reports/hmo', {
            date_from: reportDateFrom,
            date_to: reportDateTo,
        });
    };

    const handleExportAll = () => {
        const reportDateFrom = dateFrom || new Date().toISOString().split('T')[0];
        const reportDateTo = dateTo || new Date().toISOString().split('T')[0];
        
        // Show export options modal or direct export
        const exportUrl = `/admin/billing/billing-reports/export-all?date_from=${reportDateFrom}&date_to=${reportDateTo}&format=excel`;
        window.open(exportUrl, '_blank');
    };

    // Enhanced Export Functions with Format Options
    const handleExportWithFormat = (reportType: string, format: 'excel' | 'pdf' = 'excel') => {
        const reportDateFrom = dateFrom || new Date().toISOString().split('T')[0];
        const reportDateTo = dateTo || new Date().toISOString().split('T')[0];
        
        const exportUrl = `/admin/billing/billing-reports/${reportType}/export?date_from=${reportDateFrom}&date_to=${reportDateTo}&format=${format}`;
        window.open(exportUrl, '_blank');
    };

    // Quick Export Functions
    const handleQuickExport = (type: 'transactions' | 'doctor-payments' | 'all') => {
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
                    </div>
                </div>

                {/* Debug Info */}
                {debug && (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h3 className="font-semibold text-yellow-800">Debug Info:</h3>
                        <p>Transactions: {debug.transactions_count} (Total: {debug.transactions_total})</p>
                        <p>Doctor Payments: {debug.doctor_payments_count}</p>
                    </div>
                )}

                {/* Main Content with Tabs */}
                <Tabs defaultValue={defaultTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="transactions">Transactions</TabsTrigger>
                        <TabsTrigger value="pending-appointments">Pending Appointments</TabsTrigger>
                        <TabsTrigger value="doctor-payments">Doctor Payments</TabsTrigger>
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                    </TabsList>

                    {/* Transactions Tab */}
                    <TabsContent value="transactions">
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <CreditCard className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Billing Transactions</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">Manage patient payments and billing records</p>
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
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <div className="relative flex-1 max-w-md">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Search transactions..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                            />
                                        </div>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="h-12 px-4 border border-gray-200 rounded-xl focus:border-gray-500 focus:ring-gray-500"
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
                                            className="h-12 px-4 border border-gray-200 rounded-xl focus:border-gray-500 focus:ring-gray-500"
                                        >
                                            <option value="all">All Payment Methods</option>
                                            <option value="cash">Cash</option>
                                            <option value="hmo">HMO</option>
                                        </select>
                                        <select
                                            value={doctorFilter}
                                            onChange={(e) => setDoctorFilter(e.target.value)}
                                            className="h-12 px-4 border border-gray-200 rounded-xl focus:border-gray-500 focus:ring-gray-500"
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
                                                <TableHead 
                                                    className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('transaction_id')}
                                                >
                                                    Transaction ID
                                                    {sortBy === 'transaction_id' && (
                                                        <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                                                    )}
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
                                            {filteredTransactions && filteredTransactions.length > 0 ? filteredTransactions.map((transaction: any) => (
                                                <TableRow key={transaction.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <TableCell className="font-medium">{transaction.transaction_id}</TableCell>
                                                    <TableCell>
                                                        {transaction.patient ? 
                                                            `${transaction.patient.last_name}, ${transaction.patient.first_name}` : 
                                                            'Loading...'
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        {transaction.doctor ? transaction.doctor.name : '—'}
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-green-600">
                                                        ₱{transaction.amount.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {transaction.payment_method}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(transaction.status)}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {new Date(transaction.transaction_date).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button asChild variant="outline" size="sm">
                                                                <Link href={`/admin/billing/${transaction.id}`}>
                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                    View
                                                                </Link>
                                                            </Button>
                                                            <Button asChild variant="outline" size="sm">
                                                                <Link href={`/admin/billing/${transaction.id}/edit`}>
                                                                    <Edit className="h-4 w-4 mr-1" />
                                                                    Edit
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                                        No transactions found
                                                    </TableCell>
                                                </TableRow>
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
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Calendar className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Pending Appointments</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">Appointments awaiting payment processing</p>
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
                                                <TableHead className="font-semibold text-gray-700">Patient</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Appointment Type</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Specialist</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Date & Time</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Price</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pendingAppointments && pendingAppointments.length > 0 ? pendingAppointments.map((appointment: any) => (
                                                <TableRow key={appointment.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <TableCell className="font-medium">{appointment.patient_name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {appointment.appointment_type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{appointment.specialist_name}</TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">
                                                                {safeFormatDate(appointment.appointment_date)}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {safeFormatTime(appointment.appointment_time)}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-green-600">
                                                        ₱{appointment.price.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                                            {appointment.billing_status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button asChild variant="outline" size="sm">
                                                                <Link href={`/admin/appointments/${appointment.id}`}>
                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                    View
                                                                </Link>
                                                            </Button>
                                                            <Button asChild size="sm">
                                                                <Link href={`/admin/billing/create-from-appointments?appointment_id=${appointment.id}`}>
                                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                                    Pay Now
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                        No pending appointments
                                                    </TableCell>
                                                </TableRow>
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
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Users className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Doctor Payments</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">Manage doctor salary payments and commissions</p>
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
                                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1">
                                        <Input 
                                            placeholder="Search payments..." 
                                            className="w-full"
                                        />
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
                                            {!doctorPayments?.data || doctorPayments.data.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={9} className="text-center py-8">
                                                        <div className="flex flex-col items-center">
                                                            <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                            <h3 className="mb-2 text-lg font-semibold text-gray-600">No doctor payments</h3>
                                                            <p className="text-gray-500">Create your first doctor payment</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                doctorPayments?.data?.map((payment: any) => (
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
                                                            <Badge variant={payment.status === 'paid' ? 'default' : payment.status === 'pending' ? 'secondary' : 'destructive'}>
                                                                <div className="flex items-center gap-1">
                                                                    {payment.status === 'pending' && <Clock className="h-3 w-3" />}
                                                                    {payment.status === 'paid' && <Check className="h-3 w-3" />}
                                                                    {payment.status === 'cancelled' && <X className="h-3 w-3" />}
                                                                    {payment.status}
                                                                </div>
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(payment.payment_date).toLocaleDateString()}
                                                        </TableCell>
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
                                                                        onClick={() => {
                                                                            if (confirm('Are you sure you want to mark this payment as paid?')) {
                                                                                router.put(`/admin/billing/doctor-payments/${payment.id}/mark-paid`, {}, {
                                                                                    onSuccess: () => {
                                                                                        // Refresh the page to show updated status
                                                                                        window.location.reload();
                                                                                    },
                                                                                    onError: (errors) => {
                                                                                        console.error('Mark as paid failed:', errors);
                                                                                        alert('Failed to mark payment as paid. Please try again.');
                                                                                    },
                                                                                });
                                                                            }
                                                                        }}
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


                    {/* Reports Tab */}
                    <TabsContent value="reports">
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    ₱{summary.total_revenue?.toLocaleString() || '0'}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-green-100 rounded-full">
                                                <DollarSign className="h-6 w-6 text-green-600" />
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
                                            <div className="p-3 bg-blue-100 rounded-full">
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
                                                <p className="text-2xl font-bold text-purple-600">
                                                    ₱{summary.net_profit?.toLocaleString() || '0'}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-purple-100 rounded-full">
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <Button 
                                            variant="outline" 
                                            className="h-20 flex flex-col gap-2"
                                            onClick={handleTransactionReport}
                                        >
                                            <Calendar className="h-6 w-6" />
                                            Transaction Report
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="h-20 flex flex-col gap-2"
                                            onClick={handleDoctorSummary}
                                        >
                                            <Users className="h-6 w-6" />
                                            Doctor Summary
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="h-20 flex flex-col gap-2"
                                            onClick={handleHMOReport}
                                        >
                                            <FileText className="h-6 w-6" />
                                            HMO Report
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="h-20 flex flex-col gap-2"
                                            onClick={handleExportAll}
                                        >
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
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Mark as Paid</h3>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowMarkPaidModal(false)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Transaction: <span className="font-medium">{selectedTransaction.transaction_id}</span>
                                        </p>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Amount: <span className="font-medium">₱{(selectedTransaction.amount || 0).toLocaleString()}</span>
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="payment_method">Payment Method</Label>
                                        <select
                                            id="payment_method"
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                        >
                                            <option value="cash">Cash</option>
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
                                
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowMarkPaidModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleMarkPaid}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
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
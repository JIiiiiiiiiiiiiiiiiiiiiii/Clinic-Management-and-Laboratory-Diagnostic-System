import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { 
    ArrowLeft, 
    Plus, 
    Search, 
    Users,
    DollarSign,
    TrendingUp,
    Calendar,
    Filter,
    Edit,
    Eye,
    Trash2,
    MoreHorizontal,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react';
import { useState } from 'react';

type DoctorPayment = {
    id: number;
    doctor: {
        id: number;
        name: string;
    };
    payment_period_from: string;
    payment_period_to: string;
    amount_paid: number;
    payment_method: 'cash' | 'card' | 'bank_transfer' | 'check';
    payment_reference: string | null;
    remarks: string | null;
    status: 'draft' | 'pending' | 'paid' | 'cancelled';
    payment_date: string;
    created_at: string;
};

type Summary = {
    total_paid: number;
    pending_amount: number;
    total_payments: number;
    paid_payments: number;
};

type Doctor = {
    id: number;
    name: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Doctor Payments', href: '/admin/billing/doctor-payments' },
];

const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-500', icon: Clock },
    pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
    paid: { label: 'Paid', color: 'bg-green-500', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
};

const paymentMethodConfig = {
    cash: { label: 'Cash', color: 'bg-green-100 text-green-800' },
    card: { label: 'Card', color: 'bg-blue-100 text-blue-800' },
    bank_transfer: { label: 'Bank Transfer', color: 'bg-purple-100 text-purple-800' },
    check: { label: 'Check', color: 'bg-yellow-100 text-yellow-800' },
};

export default function DoctorPaymentsIndex({ 
    payments, 
    summary, 
    doctors, 
    filters 
}: { 
    payments: any;
    summary: Summary;
    doctors: Doctor[];
    filters: any;
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState(filters.payment_method || 'all');
    const [doctorFilter, setDoctorFilter] = useState(filters.doctor_id || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const filteredPayments = payments?.data?.filter((payment: DoctorPayment) => {
        const doctorName = payment.doctor.name.toLowerCase();
        const search = searchTerm.toLowerCase();
        
        const matchesSearch = doctorName.includes(search) || 
                            payment.payment_reference?.toLowerCase().includes(search) || '';
        
        const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
        const matchesPaymentMethod = paymentMethodFilter === 'all' || payment.payment_method === paymentMethodFilter;
        const matchesDoctor = doctorFilter === 'all' || payment.doctor.id.toString() === doctorFilter;
        
        return matchesSearch && matchesStatus && matchesPaymentMethod && matchesDoctor;
    });

    const getStatusBadge = (status: keyof typeof statusConfig) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        
        const variantMap = {
            draft: 'secondary',
            pending: 'warning',
            paid: 'success',
            cancelled: 'destructive'
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

    const handleFilter = () => {
        router.get('/admin/billing/doctor-payments', {
            search: searchTerm,
            status: statusFilter,
            payment_method: paymentMethodFilter,
            doctor_id: doctorFilter,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusUpdate = (paymentId: number, newStatus: string) => {
        router.put(
            `/admin/billing/doctor-payments/${paymentId}/status`,
            { status: newStatus },
            {
                onError: (errors) => {
                    console.error('Status update failed:', errors);
                },
            },
        );
    };

    const handleDelete = (paymentId: number) => {
        if (confirm('Are you sure you want to delete this payment?')) {
            router.delete(`/admin/billing/doctor-payments/${paymentId}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Doctor Payments" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button asChild variant="outline" className="h-12 w-12">
                                <Link href="/admin/billing">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <Heading title="Doctor Payments" description="Manage doctor payouts and commissions" icon={Users} />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4 w-52 h-20 flex items-center overflow-hidden">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <DollarSign className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900 whitespace-nowrap leading-tight">₱{summary.total_paid.toLocaleString()}</div>
                                        <div className="text-gray-600 text-sm font-medium whitespace-nowrap">Total Paid</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4 w-52 h-20 flex items-center overflow-hidden">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900 whitespace-nowrap leading-tight">{summary.paid_payments}</div>
                                        <div className="text-gray-600 text-sm font-medium whitespace-nowrap">Paid Payments</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Doctor Payments Section */}
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Users className="h-6 w-6 text-black" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold text-gray-900">Doctor Payments</CardTitle>
                                <p className="text-sm text-gray-500 mt-1">Manage doctor payouts and commission tracking</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button asChild>
                                            <Link href="/admin/billing/doctor-payments/create">
                                                <Plus className="mr-2 h-5 w-5" />
                                                New Payment
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Create New Doctor Payment</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <Button asChild variant="outline">
                                <Link href="/admin/billing/doctor-summary">
                                    <TrendingUp className="mr-2 h-5 w-5" />
                                    Summary Report
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {/* Filters */}
                        <div className="mb-6">
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search payments..."
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
                                </select>
                                <select
                                    value={paymentMethodFilter}
                                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                                    className="h-12 px-4 border border-gray-200 rounded-xl focus:border-gray-500 focus:ring-gray-500"
                                >
                                    <option value="all">All Payment Methods</option>
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="check">Check</option>
                                </select>
                                <select
                                    value={doctorFilter}
                                    onChange={(e) => setDoctorFilter(e.target.value)}
                                    className="h-12 px-4 border border-gray-200 rounded-xl focus:border-gray-500 focus:ring-gray-500"
                                >
                                    <option value="all">All Doctors</option>
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

                        {/* Payments Table */}
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="hover:bg-gray-50">
                                        <TableHead className="font-semibold text-gray-700">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                Doctor
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700">Payment Period</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Payment Method</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Payment Date</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!filteredPayments || filteredPayments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                <div className="flex flex-col items-center">
                                                    <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                    <h3 className="mb-2 text-lg font-semibold text-gray-600">{searchTerm ? 'No payments found' : 'No doctor payments yet'}</h3>
                                                    <p className="text-gray-500">
                                                        {searchTerm ? 'Try adjusting your search terms' : 'Create your first doctor payment to get started'}
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPayments.map((payment: DoctorPayment) => (
                                            <TableRow key={payment.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1 bg-gray-100 rounded-full">
                                                            <Users className="h-4 w-4 text-black" />
                                                        </div>
                                                        {payment.doctor.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {new Date(payment.payment_period_from).toLocaleDateString()} - {new Date(payment.payment_period_to).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    ₱{payment.amount_paid.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {getPaymentMethodBadge(payment.payment_method)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(payment.status)}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    {new Date(payment.payment_date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button asChild size="sm">
                                                            <Link href={`/admin/billing/doctor-payments/${payment.id}`}>
                                                                <Eye className="mr-1 h-3 w-3" />
                                                                View
                                                            </Link>
                                                        </Button>
                                                        {payment.status === 'pending' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleStatusUpdate(payment.id, 'paid')}
                                                            >
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
                                                                    <Link href={`/admin/billing/doctor-payments/${payment.id}/edit`}>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    onClick={() => handleDelete(payment.id)}
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
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}




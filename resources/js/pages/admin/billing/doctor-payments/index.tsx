import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { type BreadcrumbItem } from '@/types';
import Heading from '@/components/heading';
import { 
    Plus, 
    Search, 
    Filter,
    Eye,
    Edit,
    Trash2,
    MoreHorizontal,
    CheckCircle,
    Clock,
    XCircle,
    Receipt,
    FileText,
    Users,
    DollarSign,
    TrendingUp,
    ArrowLeft
} from 'lucide-react';

interface Doctor {
    id: number;
    name: string;
}

interface DoctorPayment {
    id: number;
    doctor: Doctor;
    basic_salary: number;
    deductions: number;
    holiday_pay: number;
    incentives: number;
    net_payment: number;
    payment_date: string;
    status: 'pending' | 'paid' | 'cancelled';
    notes: string | null;
    created_at: string;
    created_by: {
        id: number;
        name: string;
    };
}

interface Summary {
    total_paid: number;
    pending_amount: number;
    total_payments: number;
    paid_payments: number;
}

interface Filters {
    search?: string;
    status?: string;
    doctor_id?: string;
    date_from?: string;
    date_to?: string;
}

interface Props {
    payments: {
        data: DoctorPayment[];
        links: any[];
        meta: any;
    };
    summary: Summary;
    doctors: Doctor[];
    filters: Filters;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Doctor Payments', href: '/admin/billing/doctor-payments' },
];

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
    paid: { label: 'Paid', color: 'bg-green-500', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
};

export default function DoctorPaymentsIndex({ payments, summary, doctors, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [doctorFilter, setDoctorFilter] = useState(filters.doctor_id || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const getStatusBadge = (status: keyof typeof statusConfig) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        
        const variantMap = {
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

    const handleFilter = () => {
        router.get('/admin/billing/doctor-payments', {
            search: searchTerm,
            status: statusFilter,
            doctor_id: doctorFilter,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleAddToTransactions = (paymentId: number) => {
        router.post(`/admin/billing/doctor-payments/${paymentId}/add-to-transactions`, {}, {
            onSuccess: () => {
                router.reload();
            }
        });
    };

    const handleMarkAsPaid = (paymentId: number) => {
        router.post(`/admin/billing/doctor-payments/${paymentId}/mark-as-paid`, {}, {
            onSuccess: () => {
                router.reload();
            }
        });
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
                            <Heading title="Doctor Payments" description="Manage doctor salary payments and commissions" icon={Users} />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4 w-52 h-20 flex items-center overflow-hidden">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <DollarSign className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900 whitespace-nowrap leading-tight">
                                            ₱{summary.total_paid.toLocaleString()}
                                        </div>
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
                                        <div className="text-3xl font-bold text-gray-900 whitespace-nowrap leading-tight">
                                            {summary.paid_payments}
                                        </div>
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
                                <CardDescription>Manage doctor salary payments and commission tracking</CardDescription>
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
                                <Link href="/admin/billing/doctor-payments/summary">
                                    <FileText className="mr-2 h-5 w-5" />
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
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="cancelled">Cancelled</option>
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
                                    {!payments.data || payments.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-8">
                                                <div className="flex flex-col items-center">
                                                    <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                    <h3 className="mb-2 text-lg font-semibold text-gray-600">
                                                        {searchTerm ? 'No payments found' : 'No doctor payments yet'}
                                                    </h3>
                                                    <p className="text-gray-500">
                                                        {searchTerm ? 'Try adjusting your search terms' : 'Create your first doctor payment to get started'}
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        payments.data.map((payment: DoctorPayment) => (
                                            <TableRow key={payment.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1 bg-gray-100 rounded-full">
                                                            <Users className="h-4 w-4 text-black" />
                                                        </div>
                                                        {payment.doctor.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    ₱{payment.basic_salary.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-red-600">
                                                    -₱{payment.deductions.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-green-600">
                                                    +₱{payment.holiday_pay.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-green-600">
                                                    +₱{payment.incentives.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="font-semibold text-lg">
                                                    ₱{payment.net_payment.toLocaleString()}
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
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleAddToTransactions(payment.id)}
                                                                >
                                                                    <Receipt className="mr-1 h-3 w-3" />
                                                                    Add to Transactions
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleMarkAsPaid(payment.id)}
                                                                >
                                                                    <CheckCircle className="mr-1 h-3 w-3" />
                                                                    Mark Paid
                                                                </Button>
                                                            </>
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

                        {/* Pagination */}
                        {payments.links && payments.links.length > 3 && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {payments.meta.from} to {payments.meta.to} of {payments.meta.total} results
                                </div>
                                <div className="flex gap-2">
                                    {payments.links.map((link: any, index: number) => (
                                        <Button
                                            key={index}
                                            asChild
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            disabled={!link.url}
                                        >
                                            <Link href={link.url || '#'}>
                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                            </Link>
                                        </Button>
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
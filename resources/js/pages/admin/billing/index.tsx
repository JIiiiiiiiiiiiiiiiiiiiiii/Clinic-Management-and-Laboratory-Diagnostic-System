import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { CreditCard, Filter, Plus, Receipt, Search } from 'lucide-react';
import Heading from '@/components/heading';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Billing', href: '/admin/billing' },
];

// Mock data - in real app this would come from props
const billingRecords = [
    {
        id: 1,
        patientName: 'John Doe',
        patientId: 'P001',
        service: 'Consultation',
        amount: 500.0,
        status: 'Paid',
        dueDate: '2025-04-24',
        paymentMethod: 'Cash',
        invoiceNumber: 'INV-001',
        date: '2025-04-24',
    },
    {
        id: 2,
        patientName: 'Jane Smith',
        patientId: 'P002',
        service: 'Laboratory Test',
        amount: 1200.0,
        status: 'Pending',
        dueDate: '2025-04-25',
        paymentMethod: 'Credit Card',
        invoiceNumber: 'INV-002',
        date: '2025-04-24',
    },
    {
        id: 3,
        patientName: 'Bob Johnson',
        patientId: 'P003',
        service: 'Medicine',
        amount: 350.0,
        status: 'Paid',
        dueDate: '2025-04-23',
        paymentMethod: 'Cash',
        invoiceNumber: 'INV-003',
        date: '2025-04-23',
    },
    {
        id: 4,
        patientName: 'Alice Brown',
        patientId: 'P004',
        service: 'X-Ray',
        amount: 800.0,
        status: 'Overdue',
        dueDate: '2025-04-20',
        paymentMethod: 'Pending',
        invoiceNumber: 'INV-004',
        date: '2025-04-20',
    },
];

const getStatusBadge = (status: string) => {
    const statusConfig = {
        Paid: 'bg-green-100 text-green-800',
        Pending: 'bg-yellow-100 text-yellow-800',
        Overdue: 'bg-red-100 text-red-800',
        Partial: 'bg-blue-100 text-blue-800',
    };

    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);
};

export default function BillingIndex() {
    const { permissions, canAccessModule } = useRoleAccess();

    // Redirect if user doesn't have access to billing
    if (!permissions.canAccessBilling) {
        router.visit('/admin/dashboard');
        return null;
    }

    const totalRevenue = billingRecords.reduce((sum, record) => sum + record.amount, 0);
    const paidAmount = billingRecords.filter((r) => r.status === 'Paid').reduce((sum, record) => sum + record.amount, 0);
    const pendingAmount = billingRecords.filter((r) => r.status === 'Pending').reduce((sum, record) => sum + record.amount, 0);
    const overdueAmount = billingRecords.filter((r) => r.status === 'Overdue').reduce((sum, record) => sum + record.amount, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing Management" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Heading title="Billing Management" description="Manage patient billing, payments, and invoices" icon={CreditCard} />
                        {permissions.canCreateBilling && (
                            <Button asChild className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                <Link href="/admin/billing/create">
                                    <Plus className="mr-2 h-5 w-5" />
                                    New Invoice
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Financial Overview Cards (glassy metrics like Reports) */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <CreditCard className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Total Revenue</h3>
                                        <p className="text-emerald-100 mt-1 text-xs">All time</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6">
                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
                        </div>
                    </div>

                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Receipt className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Paid Amount</h3>
                                        <p className="text-blue-100 mt-1 text-xs">Settled invoices</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6">
                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(paidAmount)}</div>
                        </div>
                    </div>

                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all">
                        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Filter className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Pending Payment</h3>
                                        <p className="text-amber-100 mt-1 text-xs">Awaiting settlement</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6">
                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(pendingAmount)}</div>
                        </div>
                    </div>

                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <CreditCard className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Overdue Amount</h3>
                                        <p className="text-orange-100 mt-1 text-xs">Past due</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6">
                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(overdueAmount)}</div>
                        </div>
                    </div>
                </div>

                {/* Billing Section */}
                <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                    {/* Header Section - Consistent with Patient Management */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <CreditCard className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Billing Records</h3>
                                    <p className="text-blue-100 mt-1">Search, filter and manage invoices and payments</p>
                                </div>
                            </div>
                            {permissions.canCreateBilling && (
                                <Button asChild className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                    <Link href="/admin/billing/create">
                                        <Plus className="mr-2 h-5 w-5" />
                                        New Invoice
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="px-6 py-6 bg-gradient-to-br from-blue-50 to-blue-100">
                        {/* Filters and Search */}
                        <div className="mb-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by patient name, invoice number, or service..."
                                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button className="h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Apply Filters
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Billing Records Table */}
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="hover:bg-gray-50">
                                        <TableHead className="font-semibold text-gray-700">Patient</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Service</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Due Date</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Payment Method</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Invoice #</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {billingRecords.map((record) => (
                                        <TableRow key={record.id} className="hover:bg-blue-50/50 transition-colors border-b border-gray-100">
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium text-gray-900">{record.patientName}</div>
                                                    <div className="text-sm text-gray-500">ID: {record.patientId}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Receipt className="h-4 w-4 text-blue-500" />
                                                    {record.service}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-gray-900">{formatCurrency(record.amount)}</TableCell>
                                            <TableCell>
                                                <Badge className={getStatusBadge(record.status)}>{record.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-700">{record.dueDate}</TableCell>
                                            <TableCell className="text-gray-700">{record.paymentMethod}</TableCell>
                                            <TableCell className="font-mono text-gray-900">{record.invoiceNumber}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-3">
                                                    <Button asChild className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl">
                                                        <Link href={`/admin/billing/${record.id}`}>View</Link>
                                                    </Button>
                                                    {record.status === 'Pending' && permissions.canEditBilling && (
                                                        <Button asChild className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl">
                                                            <Link href={`/admin/billing/${record.id}/payment`}>
                                                                <CreditCard className="mr-2 h-4 w-4" />
                                                                Payment
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    {permissions.canEditBilling && (
                                                        <Button asChild className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl">
                                                            <Link href={`/admin/billing/${record.id}/edit`}>Edit</Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

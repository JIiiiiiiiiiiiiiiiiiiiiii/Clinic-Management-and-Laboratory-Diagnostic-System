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

            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Billing Management</h1>
                            <p className="text-gray-500">Manage patient billing, payments, and invoices</p>
                        </div>
                        {permissions.canCreateBilling && (
                            <Button asChild>
                                <Link href="/admin/billing/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Invoice
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Financial Overview Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Paid Amount</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Pending Payment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Overdue Amount</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{formatCurrency(overdueAmount)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Search and filter billing records</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input placeholder="Search by patient name, invoice number, or service..." className="pl-10" />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filter by Status
                                </Button>
                                <Button variant="outline">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filter by Date Range
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Billing Records Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Billing Records</CardTitle>
                        <CardDescription>A list of all patient billing records and their payment status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Payment Method</TableHead>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {billingRecords.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{record.patientName}</div>
                                                <div className="text-sm text-gray-500">ID: {record.patientId}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Receipt className="h-4 w-4 text-blue-500" />
                                                {record.service}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{formatCurrency(record.amount)}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusBadge(record.status)}>{record.status}</Badge>
                                        </TableCell>
                                        <TableCell>{record.dueDate}</TableCell>
                                        <TableCell>{record.paymentMethod}</TableCell>
                                        <TableCell className="font-mono">{record.invoiceNumber}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/admin/billing/${record.id}`}>View</Link>
                                                </Button>
                                                {record.status === 'Pending' && permissions.canEditBilling && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/admin/billing/${record.id}/payment`}>
                                                            <CreditCard className="mr-1 h-3 w-3" />
                                                            Payment
                                                        </Link>
                                                    </Button>
                                                )}
                                                {permissions.canEditBilling && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/admin/billing/${record.id}/edit`}>Edit</Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Clock, CreditCard, Download, Eye } from 'lucide-react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { title: 'Reports', href: route('hospital.reports.index') },
    { title: 'Financial Reports', href: route('hospital.reports.billing') },
];

interface Transaction {
    id: number;
    patient_name: string;
    transaction_type: string;
    amount: number;
    payment_type: string;
    status: string;
    transaction_date: string;
    created_by?: string;
}

interface Props {
    transactions: {
        data: Transaction[];
        links: any[];
        meta: any;
    };
    stats: {
        total_transactions: number;
        total_revenue: number;
        pending_payments: number;
        completed_payments: number;
    };
    dateRange: {
        start: string;
        end: string;
        period: string;
        label: string;
    };
    filters: any;
}

export default function HospitalTransactionReports({ transactions, stats, dateRange, filters }: Props) {
    const getStatusBadgeColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentTypeBadgeColor = (paymentType: string) => {
        switch (paymentType.toLowerCase()) {
            case 'cash':
                return 'bg-green-100 text-green-800';
            case 'card':
                return 'bg-blue-100 text-blue-800';
            case 'hmo':
                return 'bg-purple-100 text-purple-800';
            case 'insurance':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial Reports - Hospital" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
                        <p className="text-muted-foreground">Financial transactions and billing analytics for {dateRange.label}</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" asChild>
                            <Link href={route('hospital.reports.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Reports
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('hospital.reports.export', 'billing')}>
                                <Download className="mr-2 h-4 w-4" />
                                Export Data
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_transactions || 0}</div>
                            <p className="text-xs text-muted-foreground">{dateRange.label}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <CreditCard className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">₱{stats?.total_revenue?.toLocaleString() || 0}</div>
                            <p className="text-xs text-muted-foreground">Total earnings</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats?.completed_payments || 0}</div>
                            <p className="text-xs text-muted-foreground">Successful payments</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats?.pending_payments || 0}</div>
                            <p className="text-xs text-muted-foreground">Awaiting payment</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Transactions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Financial Transactions</CardTitle>
                        <CardDescription>Detailed financial transactions for the selected period</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transactions.data && transactions.data.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Payment Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.data.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="font-medium">{transaction.patient_name}</TableCell>
                                            <TableCell>{transaction.transaction_type}</TableCell>
                                            <TableCell className="font-medium">₱{transaction.amount.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge className={getPaymentTypeBadgeColor(transaction.payment_type)}>
                                                    {transaction.payment_type.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusBadgeColor(transaction.status)}>{transaction.status.toUpperCase()}</Badge>
                                            </TableCell>
                                            <TableCell>{new Date(transaction.transaction_date).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={route('hospital.patients.show', transaction.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-8 text-center">
                                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">No transactions found</h3>
                                <p className="mt-1 text-sm text-gray-500">No financial transactions found for the selected period.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

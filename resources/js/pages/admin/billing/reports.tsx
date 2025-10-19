import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    TrendingUp,
    AlertTriangle,
    Plus,
    Building2,
    ArrowLeft,
    BarChart3,
    Download,
    DollarSign,
    Calendar,
    Users,
    FileText
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Billing Management',
        href: '/admin/billing',
    },
    {
        title: 'Reports',
        href: '/admin/billing/billing-reports',
    },
];

interface BillingReportsProps {
    revenueData: any[];
    expenseData: any[];
    doctorPaymentData: any[];
    summary: {
        total_revenue: number;
        total_doctor_payments: number;
        net_profit: number;
        revenue_count: number;
    };
    filters: {
        date_from: string;
        date_to: string;
        report_type: string;
    };
    error?: string;
}

export default function BillingReports({
    revenueData,
    expenseData,
    doctorPaymentData,
    summary,
    filters,
    error
}: BillingReportsProps) {
    const [selectedFormat, setSelectedFormat] = useState('excel');

    const handleExportAll = (format: string) => {
        const exportUrl = `/admin/billing/billing-reports/export-all?format=${format}&date_from=${filters.date_from}&date_to=${filters.date_to}`;
        window.open(exportUrl, '_blank');
    };

    const handleDateRangeChange = (dateFrom: string, dateTo: string) => {
        router.get('/admin/billing/billing-reports', {
            date_from: dateFrom,
            date_to: dateTo,
            report_type: filters.report_type
        });
    };

    const reportTypes = [
        {
            title: 'Daily Report',
            description: 'View daily billing transactions and payments',
            icon: Calendar,
            href: '/admin/billing/daily-report',
            color: 'bg-blue-500'
        },
        {
            title: 'Monthly Report',
            description: 'View monthly billing summary and trends',
            icon: BarChart3,
            href: '/admin/billing/monthly-report',
            color: 'bg-green-500'
        },
        {
            title: 'Yearly Report',
            description: 'View yearly financial overview and analytics',
            icon: TrendingUp,
            href: '/admin/billing/yearly-report',
            color: 'bg-purple-500'
        },
        {
            title: 'Transaction Report',
            description: 'Detailed transaction analysis and filtering',
            icon: FileText,
            href: '/admin/billing/transaction-report',
            color: 'bg-orange-500'
        },
        {
            title: 'Doctor Summary',
            description: 'Doctor payment summaries and performance',
            icon: Users,
            href: '/admin/billing/doctor-summary',
            color: 'bg-indigo-500'
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing Reports" />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Billing Reports</h1>
                                <p className="mt-2 text-gray-600">Comprehensive billing and financial reports</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => handleExportAll(selectedFormat)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export All ({selectedFormat.toUpperCase()})
                                </Button>
                                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="excel">Excel</SelectItem>
                                        <SelectItem value="pdf">PDF</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <AlertTriangle className="h-5 w-5 text-red-400" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                                    <div className="mt-2 text-sm text-red-700">{error}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Summary Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₱{summary?.total_revenue?.toLocaleString() || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    From {revenueData?.length || 0} transactions
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Doctor Payments</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₱{summary?.total_doctor_payments?.toLocaleString() || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    From {doctorPaymentData?.length || 0} payments
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₱{summary?.net_profit?.toLocaleString() || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Revenue minus payments
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Date Range</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm font-bold">
                                    {filters?.date_from} to {filters?.date_to}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Report period
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Report Types */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Reports</h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {reportTypes.map((report, index) => (
                                <Card key={index} className="relative overflow-hidden transition-all duration-200 hover:shadow-xl hover:scale-105">
                                    <div className={`absolute inset-0 ${report.color} opacity-10`} />
                                    <CardHeader className="relative">
                                        <CardTitle className="flex items-center gap-2">
                                            <report.icon className="h-6 w-6" />
                                            {report.title}
                                        </CardTitle>
                                        <p className="text-sm text-gray-600">{report.description}</p>
                                    </CardHeader>
                                    <CardContent className="relative">
                                        <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                                            <Link href={report.href}>View Report</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <p className="text-sm text-gray-600">Latest billing transactions and payments</p>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Patient/Description</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Payment Method</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {revenueData?.slice(0, 10).map((transaction, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">Billing</TableCell>
                                            <TableCell>{transaction.patient?.name || 'N/A'}</TableCell>
                                            <TableCell>₱{transaction.total_amount?.toLocaleString() || 0}</TableCell>
                                            <TableCell>{transaction.payment_method || 'N/A'}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    transaction.status === 'paid' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {transaction.status || 'Unknown'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {transaction.transaction_date ? 
                                                    new Date(transaction.transaction_date).toLocaleDateString() : 
                                                    'N/A'
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {doctorPaymentData?.slice(0, 5).map((payment, index) => (
                                        <TableRow key={`payment-${index}`}>
                                            <TableCell className="font-medium">Doctor Payment</TableCell>
                                            <TableCell>{payment.doctor?.name || 'Unknown Doctor'}</TableCell>
                                            <TableCell>₱{payment.amount_paid?.toLocaleString() || 0}</TableCell>
                                            <TableCell>{payment.payment_method || 'N/A'}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    payment.status === 'paid' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {payment.status || 'Unknown'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {payment.payment_date ? 
                                                    new Date(payment.payment_date).toLocaleDateString() : 
                                                    'N/A'
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Calendar, DollarSign, Download, FileText, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface Transaction {
    id: number;
    patient_name: string;
    doctor_name: string;
    total_amount: number;
    payment_method: string;
    transaction_date: string;
    status: string;
}

interface Summary {
    total_revenue: number;
    total_transactions: number;
    average_transaction: number;
    date_from: string;
    date_to: string;
}

interface FinancialReportsProps {
    transactions: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    summary: Summary;
}

const breadcrumbs = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Reports & Analytics', href: '/admin/reports' },
    { label: 'Financial Reports', href: '/admin/reports/financial' },
];

export default function FinancialReports({ transactions, summary }: FinancialReportsProps) {
    const [dateFrom, setDateFrom] = useState(summary.date_from);
    const [dateTo, setDateTo] = useState(summary.date_to);
    const [paymentMethod, setPaymentMethod] = useState('all');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
        try {
            setIsExporting(true);
            const params = new URLSearchParams({
                format,
                date_from: dateFrom,
                date_to: dateTo,
                payment_method: paymentMethod,
            });
            window.location.href = `/admin/reports/export?type=financial&${params.toString()}`;

            setTimeout(() => {
                setIsExporting(false);
            }, 2000);
        } catch (error) {
            console.error('Export failed:', error);
            setIsExporting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs as any}>
            <Head title="Financial Reports" />
            <div className="min-h-screen bg-white p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="mb-4 text-4xl font-semibold text-black">Financial Reports</h1>
                                <p className="mt-1 text-sm text-black">Revenue, expenses, and financial analytics</p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => handleExport('excel')} disabled={isExporting} variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Excel
                                </Button>
                                <Button onClick={() => handleExport('pdf')} disabled={isExporting} variant="outline">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Export PDF
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                    Total Revenue
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-green-600">{formatCurrency(summary.total_revenue)}</div>
                                <p className="text-sm text-gray-600">All transactions</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Total Transactions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-blue-600">{summary.total_transactions.toLocaleString()}</div>
                                <p className="text-sm text-gray-600">All transactions</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                    Average Transaction
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-purple-600">{formatCurrency(summary.average_transaction)}</div>
                                <p className="text-sm text-gray-600">Per transaction</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <Calendar className="h-5 w-5 text-orange-600" />
                                    Date Range
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-sm font-semibold text-orange-600">
                                    {new Date(summary.date_from).toLocaleDateString()} - {new Date(summary.date_to).toLocaleDateString()}
                                </div>
                                <p className="text-sm text-gray-600">Report period</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-8 rounded-xl border-0 bg-white shadow-lg">
                        <CardHeader className="border-b border-gray-200 bg-white">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                <Calendar className="h-5 w-5 text-black" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div>
                                    <Label htmlFor="date_from">From Date</Label>
                                    <Input
                                        id="date_from"
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="date_to">To Date</Label>
                                    <Input id="date_to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="payment_method">Payment Method</Label>
                                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select payment method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Methods</SelectItem>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="card">Card</SelectItem>
                                            <SelectItem value="hmo">HMO</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end">
                                    <Button className="w-full">Apply Filters</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transactions Table */}
                    <Card className="rounded-xl border-0 bg-white shadow-lg">
                        <CardHeader className="border-b border-gray-200 bg-white">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                <FileText className="h-5 w-5 text-black" />
                                Financial Transactions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-gray-100">
                                            <TableHead className="font-semibold text-black">Transaction ID</TableHead>
                                            <TableHead className="font-semibold text-black">Patient</TableHead>
                                            <TableHead className="font-semibold text-black">Doctor</TableHead>
                                            <TableHead className="font-semibold text-black">Amount</TableHead>
                                            <TableHead className="font-semibold text-black">Payment Method</TableHead>
                                            <TableHead className="font-semibold text-black">Date</TableHead>
                                            <TableHead className="font-semibold text-black">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="py-8 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                        <h3 className="mb-2 text-lg font-semibold text-black">No transactions found</h3>
                                                        <p className="text-black">Try adjusting your filters or date range</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            transactions.data.map((transaction) => (
                                                <TableRow key={transaction.id} className="hover:bg-gray-50">
                                                    <TableCell className="font-medium text-black">#{transaction.id}</TableCell>
                                                    <TableCell className="text-black">{transaction.patient_name}</TableCell>
                                                    <TableCell className="text-black">{transaction.doctor_name}</TableCell>
                                                    <TableCell className="font-semibold text-green-600">
                                                        {formatCurrency(transaction.total_amount)}
                                                    </TableCell>
                                                    <TableCell className="text-black">{transaction.payment_method}</TableCell>
                                                    <TableCell className="text-black">
                                                        {new Date(transaction.transaction_date).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

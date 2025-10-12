import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { 
    ArrowLeft, 
    Calendar,
    DollarSign,
    TrendingUp,
    FileText,
    Download,
    Receipt,
    CreditCard
} from 'lucide-react';
import { useState } from 'react';

type Transaction = {
    id: number;
    type: 'billing' | 'doctor_payment' | 'expense' | 'appointment';
    transaction_id: string;
    patient_name: string;
    specialist_name: string;
    amount: number;
    payment_method: string;
    status: string;
    description: string;
    time: string;
    items_count: number;
    appointments_count: number;
};

type Expense = {
    id: number;
    expense_name: string;
    amount: number;
    expense_category: string;
    status: string;
    expense_date: string;
};

type Summary = {
    total_revenue: number;
    total_expenses: number;
    total_doctor_payments: number;
    net_profit: number;
    transaction_count: number;
    expense_count: number;
    doctor_payment_count: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Reports', href: '/admin/billing/billing-reports' },
    { title: 'Daily Report', href: '/admin/billing/daily-report' },
];

export default function DailyReport({ 
    transactions,
    expenses,
    summary,
    date
}: { 
    transactions: Transaction[];
    expenses: Expense[];
    summary: Summary;
    date: string;
}) {
    const [selectedDate, setSelectedDate] = useState(date);

    const handleDateChange = () => {
        router.get('/admin/billing/daily-report', {
            date: selectedDate,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daily Report" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button asChild variant="outline" className="h-12 w-12">
                                <Link href="/admin/billing/billing-reports">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <Heading title="Daily Report" description={`Financial report for ${new Date(date).toLocaleDateString()}`} icon={Calendar} />
                        </div>
                        <div className="flex items-center gap-4">
                            <Button 
                                variant="outline"
                                onClick={() => {
                                    const exportUrl = `/admin/billing/billing-reports/daily/export?date=${selectedDate}&format=excel`;
                                    window.open(exportUrl, '_blank');
                                }}
                            >
                                <Download className="mr-2 h-5 w-5" />
                                Export Excel
                            </Button>
                            <Button 
                                variant="outline"
                                onClick={() => {
                                    const exportUrl = `/admin/billing/billing-reports/daily/export?date=${selectedDate}&format=pdf`;
                                    window.open(exportUrl, '_blank');
                                }}
                            >
                                <Download className="mr-2 h-5 w-5" />
                                Export PDF
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Date Filter */}
                <Card className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                            <Calendar className="h-5 w-5 text-black" />
                            Select Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Report Date</Label>
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                />
                            </div>
                            <Button onClick={handleDateChange} className="h-12 px-6">
                                <Calendar className="mr-2 h-4 w-4" />
                                Generate Report
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">₱{(summary.total_revenue || 0).toLocaleString()}</div>
                                    <div className="text-sm text-gray-600">Total Revenue</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <FileText className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">₱{(summary.total_expenses || 0).toLocaleString()}</div>
                                    <div className="text-sm text-gray-600">Total Expenses</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Receipt className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">₱{(summary.total_doctor_payments || 0).toLocaleString()}</div>
                                    <div className="text-sm text-gray-600">Doctor Payments</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${(summary.net_profit || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                    <TrendingUp className={`h-6 w-6 ${(summary.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                                </div>
                                <div>
                                    <div className={`text-2xl font-bold ${(summary.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ₱{(summary.net_profit || 0).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">Net Profit</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Receipt className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{summary.transaction_count || 0}</div>
                                    <div className="text-sm text-gray-600">Transactions</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Transactions Table */}
                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                <CreditCard className="h-5 w-5 text-black" />
                                Daily Transactions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-gray-50">
                                            <TableHead className="font-semibold text-gray-700">Type</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Transaction ID</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Patient/Source</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Specialist</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Payment Method</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8">
                                                    <div className="flex flex-col items-center">
                                                        <CreditCard className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                        <h3 className="mb-2 text-lg font-semibold text-gray-600">No transactions found</h3>
                                                        <p className="text-gray-500">No transactions for this date</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            transactions.map((transaction) => (
                                                <TableRow key={transaction.id} className="hover:bg-gray-50">
                                                    <TableCell>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            transaction.type === 'billing' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : transaction.type === 'doctor_payment'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : transaction.type === 'expense'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {transaction.type.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {transaction.transaction_id}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">
                                                            {transaction.patient_name}
                                                        </div>
                                                        {transaction.items_count > 0 && (
                                                            <div className="text-sm text-gray-500">
                                                                {transaction.items_count} items
                                                            </div>
                                                        )}
                                                        {transaction.appointments_count > 0 && (
                                                            <div className="text-sm text-gray-500">
                                                                {transaction.appointments_count} appointments
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {transaction.specialist_name}
                                                    </TableCell>
                                                    <TableCell className={`font-semibold ${
                                                        transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                                                    }`}>
                                                        {transaction.amount < 0 ? '-' : ''}₱{Math.abs(transaction.amount).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            {transaction.payment_method.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            transaction.status === 'paid' || transaction.status === 'approved'
                                                                ? 'bg-green-100 text-green-800' 
                                                                : transaction.status === 'pending'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {transaction.status}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Expenses Table */}
                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                <FileText className="h-5 w-5 text-black" />
                                Daily Expenses
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-gray-50">
                                            <TableHead className="font-semibold text-gray-700">Expense</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Category</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {expenses.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8">
                                                    <div className="flex flex-col items-center">
                                                        <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                        <h3 className="mb-2 text-lg font-semibold text-gray-600">No expenses found</h3>
                                                        <p className="text-gray-500">No expenses for this date</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            expenses.map((expense) => (
                                                <TableRow key={expense.id} className="hover:bg-gray-50">
                                                    <TableCell className="font-medium">
                                                        {expense.expense_name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {expense.expense_category.replace('_', ' ')}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="font-semibold">
                                                        ₱{expense.amount.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            expense.status === 'approved' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {expense.status}
                                                        </span>
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
            </div>
        </AppLayout>
    );
}




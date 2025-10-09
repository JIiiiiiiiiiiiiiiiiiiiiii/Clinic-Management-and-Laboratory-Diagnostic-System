import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { 
    ArrowLeft, 
    TrendingUp,
    DollarSign,
    BarChart3,
    PieChart,
    Download,
    Calendar,
    Filter,
    FileText,
    Users,
    CreditCard
} from 'lucide-react';
import { useState } from 'react';

type Summary = {
    total_revenue: number;
    total_expenses: number;
    total_doctor_payments: number;
    net_profit: number;
    revenue_count: number;
    expense_count: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Reports', href: '/admin/billing/reports' },
];

export default function BillingReports({ 
    revenueData,
    expenseData,
    doctorPaymentData,
    summary,
    filters
}: { 
    revenueData: any[];
    expenseData: any[];
    doctorPaymentData: any[];
    summary: Summary;
    filters: any;
}) {
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [reportType, setReportType] = useState(filters.report_type || 'daily');

    const handleFilter = () => {
        router.get('/admin/billing/reports', {
            date_from: dateFrom,
            date_to: dateTo,
            report_type: reportType,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleExport = (format: string) => {
        router.get('/admin/billing/export', {
            date_from: dateFrom,
            date_to: dateTo,
            report_type: reportType,
            format: format,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing Reports" />
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
                            <Heading title="Billing Reports" description="Financial reports and analytics" icon={TrendingUp} />
                        </div>
                        <div className="flex items-center gap-4">
                            <Button onClick={() => handleExport('excel')} variant="outline">
                                <Download className="mr-2 h-5 w-5" />
                                Export Excel
                            </Button>
                            <Button onClick={() => handleExport('pdf')} variant="outline">
                                <Download className="mr-2 h-5 w-5" />
                                Export PDF
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <Card className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                            <Filter className="h-5 w-5 text-black" />
                            Report Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Date From</Label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Date To</Label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Report Type</Label>
                                <Select value={reportType} onValueChange={setReportType}>
                                    <SelectTrigger className="h-12 w-40 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleFilter} className="h-12 px-6">
                                <Filter className="mr-2 h-4 w-4" />
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">₱{summary.total_revenue.toLocaleString()}</div>
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
                                    <div className="text-2xl font-bold text-gray-900">₱{summary.total_expenses.toLocaleString()}</div>
                                    <div className="text-sm text-gray-600">Total Expenses</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">₱{summary.total_doctor_payments.toLocaleString()}</div>
                                    <div className="text-sm text-gray-600">Doctor Payments</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${summary.net_profit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                    <TrendingUp className={`h-6 w-6 ${summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                                </div>
                                <div>
                                    <div className={`text-2xl font-bold ${summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ₱{summary.net_profit.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">Net Profit</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Reports Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="revenue">Revenue</TabsTrigger>
                        <TabsTrigger value="expenses">Expenses</TabsTrigger>
                        <TabsTrigger value="doctor-payments">Doctor Payments</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                        <BarChart3 className="h-5 w-5 text-black" />
                                        Revenue Trend
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="text-center py-8">
                                        <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                        <h3 className="mb-2 text-lg font-semibold text-gray-600">Revenue Chart</h3>
                                        <p className="text-gray-500">Revenue trend visualization will be implemented here</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                        <PieChart className="h-5 w-5 text-black" />
                                        Payment Methods
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="text-center py-8">
                                        <PieChart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                        <h3 className="mb-2 text-lg font-semibold text-gray-600">Payment Methods</h3>
                                        <p className="text-gray-500">Payment method distribution will be implemented here</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Revenue Tab */}
                    <TabsContent value="revenue">
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                    <DollarSign className="h-5 w-5 text-black" />
                                    Revenue Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-center py-8">
                                    <DollarSign className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                    <h3 className="mb-2 text-lg font-semibold text-gray-600">Revenue Data</h3>
                                    <p className="text-gray-500 mb-4">Detailed revenue analysis will be displayed here</p>
                                    <div className="space-y-2">
                                        {revenueData.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                <span className="font-medium">{item.date || item.week || item.month}</span>
                                                <span className="font-semibold">₱{item.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Expenses Tab */}
                    <TabsContent value="expenses">
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                    <FileText className="h-5 w-5 text-black" />
                                    Expense Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-center py-8">
                                    <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                    <h3 className="mb-2 text-lg font-semibold text-gray-600">Expense Data</h3>
                                    <p className="text-gray-500 mb-4">Detailed expense analysis will be displayed here</p>
                                    <div className="space-y-2">
                                        {expenseData.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                <span className="font-medium">{item.date || item.week || item.month}</span>
                                                <span className="font-semibold">₱{item.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Doctor Payments Tab */}
                    <TabsContent value="doctor-payments">
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                    <Users className="h-5 w-5 text-black" />
                                    Doctor Payment Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-center py-8">
                                    <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                    <h3 className="mb-2 text-lg font-semibold text-gray-600">Doctor Payment Data</h3>
                                    <p className="text-gray-500 mb-4">Detailed doctor payment analysis will be displayed here</p>
                                    <div className="space-y-2">
                                        {doctorPaymentData.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                <span className="font-medium">{item.date || item.week || item.month}</span>
                                                <span className="font-semibold">₱{item.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Quick Actions */}
                <Card className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                            <Calendar className="h-5 w-5 text-black" />
                            Quick Reports
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button asChild variant="outline" className="h-16">
                                <Link href="/admin/billing/daily-report">
                                    <Calendar className="mr-2 h-5 w-5" />
                                    Daily Report
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="h-16">
                                <Link href="/admin/billing/hmo-report">
                                    <CreditCard className="mr-2 h-5 w-5" />
                                    HMO Report
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="h-16">
                                <Link href="/admin/billing/doctor-summary">
                                    <Users className="mr-2 h-5 w-5" />
                                    Doctor Summary
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}




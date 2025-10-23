import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
    CreditCard,
    UserCheck,
    Clock,
    CheckCircle
} from 'lucide-react';
import { useState } from 'react';

type Summary = {
    total_payments: number;
    total_amount: number;
    paid_amount: number;
    pending_amount: number;
    average_payment: number;
};

type ReportData = {
    date?: string;
    year?: number;
    month?: number;
    month_name?: string;
    doctor_id: number;
    doctor_name: string;
    doctor_specialization: string;
    payment_count: number;
    total_incentives: number;
    total_net_payment: number;
    average_payment: number;
};

type Doctor = {
    id: number;
    name: string;
    specialization: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Doctor Payment Reports', href: '/admin/billing/doctor-payment-reports' },
];

export default function DoctorPaymentReports({ 
    reportData,
    summary,
    doctors,
    filters
}: { 
    reportData: ReportData[];
    summary: Summary;
    doctors: Doctor[];
    filters: any;
}) {
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [reportType, setReportType] = useState(filters.report_type || 'daily');
    const [doctorId, setDoctorId] = useState(filters.doctor_id || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleFilter = () => {
        router.get('/admin/billing/doctor-payment-reports', {
            date_from: dateFrom,
            date_to: dateTo,
            report_type: reportType,
            doctor_id: doctorId,
            status: status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleExport = (format: string) => {
        router.get('/admin/billing/doctor-payment-reports/export', {
            date_from: dateFrom,
            date_to: dateTo,
            report_type: reportType,
            doctor_id: doctorId,
            status: status,
            format: format,
        });
    };

    const handleDoctorDetails = (doctorId: number) => {
        router.get(`/admin/billing/doctor-payment-reports/doctor/${doctorId}`, {
            date_from: dateFrom,
            date_to: dateTo,
            status: status,
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Doctor Payment Reports" />
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
                            <Heading title="Doctor Payment Reports" description="Comprehensive doctor payment analytics and reporting" icon={TrendingUp} />
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                                    <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Doctor</Label>
                                <Select value={doctorId} onValueChange={setDoctorId}>
                                    <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Doctors</SelectItem>
                                        {doctors.map((doctor) => (
                                            <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                                {doctor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Button onClick={handleFilter} className="h-12 px-6">
                                <Filter className="mr-2 h-4 w-4" />
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{summary.total_payments}</div>
                                    <div className="text-sm text-gray-600">Total Payments</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_amount)}</div>
                                    <div className="text-sm text-gray-600">Total Amount</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.paid_amount)}</div>
                                    <div className="text-sm text-gray-600">Paid Amount</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Clock className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.pending_amount)}</div>
                                    <div className="text-sm text-gray-600">Pending Amount</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <BarChart3 className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.average_payment)}</div>
                                    <div className="text-sm text-gray-600">Average Payment</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Report Data */}
                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                            <UserCheck className="h-5 w-5 text-black" />
                            Doctor Payment Report - {reportType.charAt(0).toUpperCase() + reportType.slice(1)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {reportData.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="font-semibold">
                                                {reportType === 'daily' ? 'Date' : 
                                                 reportType === 'monthly' ? 'Month' : 'Year'}
                                            </TableHead>
                                            <TableHead className="font-semibold">Doctor</TableHead>
                                            <TableHead className="font-semibold">Specialization</TableHead>
                                            <TableHead className="font-semibold text-right">Payments</TableHead>
                                            <TableHead className="font-semibold text-right">Incentives</TableHead>
                                            <TableHead className="font-semibold text-right">Net Payment</TableHead>
                                            <TableHead className="font-semibold text-right">Average</TableHead>
                                            <TableHead className="font-semibold text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.map((item, index) => (
                                            <TableRow key={index} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    {reportType === 'daily' ? formatDate(item.date!) :
                                                     reportType === 'monthly' ? item.month_name :
                                                     item.year}
                                                </TableCell>
                                                <TableCell className="font-medium">{item.doctor_name}</TableCell>
                                                <TableCell className="text-gray-600">{item.doctor_specialization}</TableCell>
                                                <TableCell className="text-right font-semibold">{item.payment_count}</TableCell>
                                                <TableCell className="text-right text-green-600">{formatCurrency(item.total_incentives)}</TableCell>
                                                <TableCell className="text-right font-bold text-blue-600">{formatCurrency(item.total_net_payment)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(item.average_payment)}</TableCell>
                                                <TableCell className="text-center">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleDoctorDetails(item.doctor_id)}
                                                    >
                                                        View Details
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <UserCheck className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <h3 className="mb-2 text-lg font-semibold text-gray-600">No Data Found</h3>
                                <p className="text-gray-500">No doctor payment data found for the selected filters.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

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
                                <Link href="/admin/billing/doctor-payment-reports/daily">
                                    <Calendar className="mr-2 h-5 w-5" />
                                    Daily Report
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="h-16">
                                <Link href="/admin/billing/doctor-payment-reports/monthly">
                                    <BarChart3 className="mr-2 h-5 w-5" />
                                    Monthly Report
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="h-16">
                                <Link href="/admin/billing/doctor-payment-reports/yearly">
                                    <TrendingUp className="mr-2 h-5 w-5" />
                                    Yearly Report
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

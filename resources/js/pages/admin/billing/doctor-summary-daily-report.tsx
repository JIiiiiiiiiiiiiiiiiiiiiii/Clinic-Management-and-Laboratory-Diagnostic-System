import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { 
    ArrowLeft, 
    Download,
    Calendar,
    User,
    DollarSign,
    TrendingUp,
    Users,
    CreditCard
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Doctor Summary Report', href: '/admin/billing/doctor-summary-report' },
    { title: 'Daily Report', href: '/admin/billing/doctor-summary-report/daily' },
];

interface DoctorSummaryDailyReportProps {
    doctorPayments: any[];
    revenueByDoctor: any[];
    summary: {
        total_doctor_payments: number;
        total_doctor_revenue: number;
        doctors_count: number;
    };
    doctors: any[];
    date: string;
    filters: {
        date: string;
        doctor_id: string;
    };
}

export default function DoctorSummaryDailyReport({ 
    doctorPayments, 
    revenueByDoctor, 
    summary, 
    doctors, 
    date,
    filters 
}: DoctorSummaryDailyReportProps) {
    const handleExport = (format: string) => {
        const params: any = { format, date, doctor_id: filters.doctor_id };
        const queryString = new URLSearchParams(params).toString();
        const exportUrl = `/admin/billing/doctor-summary-report/daily/export?${queryString}`;
        window.open(exportUrl, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Doctor Summary Daily Report - ${date}`} />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button asChild variant="outline" className="h-12 w-12">
                                <Link href="/admin/billing/doctor-summary-report">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <Heading 
                                title={`Doctor Summary Daily Report`} 
                                description={`Report for ${new Date(date).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}`} 
                                icon={Calendar} 
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Button 
                                variant="outline"
                                onClick={() => handleExport('excel')}
                                className="h-12"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export Excel
                            </Button>
                            <Button 
                                variant="outline"
                                onClick={() => handleExport('pdf')}
                                className="h-12"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export PDF
                            </Button>
                            <Button 
                                variant="outline"
                                onClick={() => handleExport('word')}
                                className="h-12"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export Word
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Doctor Payments</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ₱{summary.total_doctor_payments.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <DollarSign className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ₱{summary.total_doctor_revenue.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Doctors</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {summary.doctors_count}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Doctor Payments Table */}
                <Card className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                            <CreditCard className="h-5 w-5 text-black" />
                            Doctor Payments Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {doctorPayments.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Doctor</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Total Paid</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Pending Amount</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Payment Count</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Paid Payments</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.values(doctorPayments).map((payment: any, index: number) => (
                                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-100 rounded-lg">
                                                            <User className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{payment.doctor.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="font-semibold text-green-600">
                                                        ₱{payment.total_paid.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="font-semibold text-orange-600">
                                                        ₱{payment.pending_amount.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge variant="outline">{payment.payment_count}</Badge>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge variant="default">{payment.paid_payments}</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="p-4 bg-gray-100 rounded-lg w-fit mx-auto mb-4">
                                    <User className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-lg">No doctor payments found for this date</p>
                                <p className="text-gray-400 text-sm">Try selecting a different date or doctor</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Revenue by Doctor Table */}
                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                            <TrendingUp className="h-5 w-5 text-black" />
                            Revenue by Doctor
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {revenueByDoctor.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Doctor</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Total Revenue</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Transaction Count</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.values(revenueByDoctor).map((revenue: any, index: number) => (
                                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-green-100 rounded-lg">
                                                            <User className="h-4 w-4 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{revenue.doctor.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="font-semibold text-green-600">
                                                        ₱{revenue.total_revenue.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge variant="outline">{revenue.transaction_count}</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="p-4 bg-gray-100 rounded-lg w-fit mx-auto mb-4">
                                    <TrendingUp className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-lg">No revenue data found for this date</p>
                                <p className="text-gray-400 text-sm">Try selecting a different date or doctor</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

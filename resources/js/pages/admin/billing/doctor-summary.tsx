import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { 
    ArrowLeft, 
    Users,
    DollarSign,
    TrendingUp,
    Calendar,
    Filter,
    Download
} from 'lucide-react';
import { useState } from 'react';

type DoctorSummary = {
    doctor: {
        id: number;
        name: string;
    };
    total_paid: number;
    pending_amount: number;
    payment_count: number;
    paid_payments: number;
};

type Summary = {
    total_doctor_payments: number;
    total_doctor_revenue: number;
    doctors_count: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Doctor Summary', href: '/admin/billing/doctor-summary' },
];

export default function DoctorSummary({ 
    doctorPayments,
    revenueByDoctor,
    summary,
    doctors,
    filters
}: { 
    doctorPayments: any;
    revenueByDoctor: any;
    summary: Summary;
    doctors: any[];
    filters: any;
}) {
    const [doctorFilter, setDoctorFilter] = useState(filters.doctor_id || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleFilter = () => {
        router.get('/admin/billing/doctor-summary', {
            doctor_id: doctorFilter,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Doctor Summary Report" />
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
                            <Heading title="Doctor Summary Report" description="Doctor payment and revenue analysis" icon={Users} />
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="outline">
                                <Download className="mr-2 h-5 w-5" />
                                Export Report
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
                                <Label className="text-sm font-medium text-gray-700">Doctor</Label>
                                <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                                    <SelectTrigger className="h-12 w-64 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                        <SelectValue placeholder="Select doctor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Doctors</SelectItem>
                                        {doctors && doctors.map((doctor) => (
                                            <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                                {doctor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
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
                            <Button onClick={handleFilter} className="h-12 px-6">
                                <Filter className="mr-2 h-4 w-4" />
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{summary.doctors_count}</div>
                                    <div className="text-sm text-gray-600">Total Doctors</div>
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
                                    <div className="text-2xl font-bold text-gray-900">₱{summary.total_doctor_payments.toLocaleString()}</div>
                                    <div className="text-sm text-gray-600">Total Payments</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">₱{summary.total_doctor_revenue.toLocaleString()}</div>
                                    <div className="text-sm text-gray-600">Total Revenue</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Doctor Payments Table */}
                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                            <Users className="h-5 w-5 text-black" />
                            Doctor Payment Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="hover:bg-gray-50">
                                        <TableHead className="font-semibold text-gray-700">Doctor</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Total Paid</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Pending Amount</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Payment Count</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Paid Payments</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {doctorPayments && Object.values(doctorPayments).length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                <div className="flex flex-col items-center">
                                                    <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                    <h3 className="mb-2 text-lg font-semibold text-gray-600">No doctor payments found</h3>
                                                    <p className="text-gray-500">No payment data available for the selected period</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        doctorPayments && Object.values(doctorPayments).map((payment: DoctorSummary) => (
                                            <TableRow key={payment.doctor.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1 bg-gray-100 rounded-full">
                                                            <Users className="h-4 w-4 text-black" />
                                                        </div>
                                                        {payment.doctor.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold text-green-600">
                                                    ₱{payment.total_paid.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="font-semibold text-yellow-600">
                                                    ₱{payment.pending_amount.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {payment.payment_count}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {payment.paid_payments}
                                                </TableCell>
                                                <TableCell>
                                                    <Button asChild size="sm" variant="outline">
                                                        <Link href={`/admin/billing/doctor-payments?doctor_id=${payment.doctor.id}`}>
                                                            <Users className="mr-1 h-3 w-3" />
                                                            View Details
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue by Doctor Table */}
                <Card className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                            <TrendingUp className="h-5 w-5 text-black" />
                            Revenue by Doctor
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="hover:bg-gray-50">
                                        <TableHead className="font-semibold text-gray-700">Doctor</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Total Revenue</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Transaction Count</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {revenueByDoctor && Object.values(revenueByDoctor).length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8">
                                                <div className="flex flex-col items-center">
                                                    <TrendingUp className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                    <h3 className="mb-2 text-lg font-semibold text-gray-600">No revenue data found</h3>
                                                    <p className="text-gray-500">No revenue data available for the selected period</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        revenueByDoctor && Object.values(revenueByDoctor).map((revenue: any) => (
                                            <TableRow key={revenue.doctor.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1 bg-gray-100 rounded-full">
                                                            <TrendingUp className="h-4 w-4 text-black" />
                                                        </div>
                                                        {revenue.doctor.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold text-green-600">
                                                    ₱{revenue.total_revenue.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {revenue.transaction_count}
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
        </AppLayout>
    );
}




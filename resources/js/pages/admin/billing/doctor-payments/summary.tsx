import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    Search, 
    Filter,
    FileText,
    Users,
    DollarSign,
    TrendingUp,
    Download,
    Calendar,
    User
} from 'lucide-react';

interface Doctor {
    id: number;
    name: string;
}

interface CreatedBy {
    id: number;
    name: string;
}

interface DoctorSummaryReport {
    id: number;
    doctor: Doctor;
    payment: {
        id: number;
        payment_date: string;
    };
    incentives: number;
    total_paid: number;
    payment_date: string;
    status: 'pending' | 'paid' | 'cancelled';
    notes: string | null;
    created_at: string;
    created_by: CreatedBy;
}

interface Summary {
    total_paid: number;
    total_reports: number;
    doctors_count: number;
}

interface Filters {
    doctor_id?: string;
    date_from?: string;
    date_to?: string;
}

interface Props {
    reports: {
        data: DoctorSummaryReport[];
        links: any[];
        meta: any;
    };
    summary: Summary;
    doctors: Doctor[];
    filters: Filters;
}

export default function DoctorSummaryReport({ reports, summary, doctors, filters }: Props) {
    const [doctorFilter, setDoctorFilter] = useState(filters.doctor_id || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleFilter = () => {
        router.get('/admin/billing/doctor-payments/summary', {
            doctor_id: doctorFilter,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleExport = () => {
        // This would trigger an export functionality
        console.log('Exporting summary report...');
    };

    return (
        <AppLayout>
            <Head title="Doctor Summary Report" />
            
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button asChild variant="outline" className="h-12 w-12">
                                <Link href="/admin/billing/doctor-payments">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Doctor Summary Report</h1>
                                <p className="text-gray-600">Comprehensive report of all doctor payments</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4 w-52 h-20 flex items-center overflow-hidden">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <DollarSign className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900 whitespace-nowrap leading-tight">
                                            ₱{summary.total_paid.toLocaleString()}
                                        </div>
                                        <div className="text-gray-600 text-sm font-medium whitespace-nowrap">Total Paid</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4 w-52 h-20 flex items-center overflow-hidden">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900 whitespace-nowrap leading-tight">
                                            {summary.doctors_count}
                                        </div>
                                        <div className="text-gray-600 text-sm font-medium whitespace-nowrap">Doctors</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Report Section */}
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <FileText className="h-6 w-6 text-black" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold text-gray-900">Summary Report</CardTitle>
                                <CardDescription>Detailed breakdown of all doctor payments</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button onClick={handleExport} variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Export Report
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {/* Filters */}
                        <div className="mb-6">
                            <div className="flex items-center gap-4 flex-wrap">
                                <select
                                    value={doctorFilter}
                                    onChange={(e) => setDoctorFilter(e.target.value)}
                                    className="h-12 px-4 border border-gray-200 rounded-xl focus:border-gray-500 focus:ring-gray-500"
                                >
                                    <option value="all">All Doctors</option>
                                    {doctors.map((doctor) => (
                                        <option key={doctor.id} value={doctor.id.toString()}>
                                            {doctor.name}
                                        </option>
                                    ))}
                                </select>
                                <Input
                                    type="date"
                                    placeholder="From Date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                />
                                <Input
                                    type="date"
                                    placeholder="To Date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                />
                                <Button onClick={handleFilter} className="h-12 px-6">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Apply Filters
                                </Button>
                            </div>
                        </div>

                        {/* Reports Table */}
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="hover:bg-gray-50">
                                        <TableHead className="font-semibold text-gray-700">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Doctor
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700">Incentives</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Total Paid</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Payment Date</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!reports.data || reports.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8">
                                                <div className="flex flex-col items-center">
                                                    <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                    <h3 className="mb-2 text-lg font-semibold text-gray-600">
                                                        No summary reports found
                                                    </h3>
                                                    <p className="text-gray-500">
                                                        No doctor payments have been marked as paid yet
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        reports.data.map((report: DoctorSummaryReport) => (
                                            <TableRow key={report.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1 bg-gray-100 rounded-full">
                                                            <User className="h-4 w-4 text-black" />
                                                        </div>
                                                        {report.doctor.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-green-600">
                                                    +₱{report.incentives.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="font-semibold text-lg text-blue-600">
                                                    ₱{report.total_paid.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(report.payment_date).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="success">
                                                        {report.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {reports.links && reports.links.length > 3 && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {reports.meta.from} to {reports.meta.to} of {reports.meta.total} results
                                </div>
                                <div className="flex gap-2">
                                    {reports.links.map((link: any, index: number) => (
                                        <Button
                                            key={index}
                                            asChild
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            disabled={!link.url}
                                        >
                                            <Link href={link.url || '#'}>
                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                            </Link>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
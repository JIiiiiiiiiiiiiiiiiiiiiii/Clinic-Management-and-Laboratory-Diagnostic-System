import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle, Clock, Download, XCircle } from 'lucide-react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { title: 'Reports', href: route('hospital.reports.index') },
    { title: 'Appointment Reports', href: route('hospital.reports.appointments') },
];

interface Props {
    user: any;
    appointments: {
        data: any[];
        links: any[];
        meta: any;
    };
    stats: {
        total_appointments: number;
        completed_appointments: number;
        pending_appointments: number;
        cancelled_appointments: number;
    };
    dateRange: {
        start: string;
        end: string;
    };
    filters: any;
}

export default function HospitalAppointmentReports({ user, appointments, stats, dateRange, filters }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appointment Reports - Hospital" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Appointment Reports</h1>
                        <p className="text-muted-foreground">
                            Appointment statistics and schedules for {dateRange.start} to {dateRange.end}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" asChild>
                            <Link href={route('hospital.reports.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Reports
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('hospital.reports.export', 'appointments')}>
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
                            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_appointments}</div>
                            <p className="text-xs text-muted-foreground">All appointments</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.completed_appointments}</div>
                            <p className="text-xs text-muted-foreground">Successfully completed</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending_appointments}</div>
                            <p className="text-xs text-muted-foreground">Awaiting completion</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.cancelled_appointments}</div>
                            <p className="text-xs text-muted-foreground">Cancelled appointments</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Appointments Content */}
                <Card>
                    <CardHeader>
                        <CardTitle>Appointment Details</CardTitle>
                        <CardDescription>Detailed appointment information for the selected period</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="py-8 text-center">
                            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No appointments found</h3>
                            <p className="mt-1 text-sm text-gray-500">No appointment records found for the selected period.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

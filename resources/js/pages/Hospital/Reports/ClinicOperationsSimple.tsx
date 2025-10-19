import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Activity, ArrowLeft, Calendar, CheckCircle, Clock, DollarSign, Download, Users } from 'lucide-react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { title: 'Reports', href: route('hospital.reports.index') },
    { title: 'Clinic Operations', href: route('hospital.reports.clinic.operations') },
];

interface Props {
    stats: {
        total_patients: number;
        total_appointments: number;
        completed_appointments: number;
        total_revenue: number;
        average_appointment_duration: number;
        patient_satisfaction_score: number;
    };
    dateRange: {
        start: string;
        end: string;
        period: string;
        label: string;
    };
}

export default function HospitalClinicOperationsReports({ stats, dateRange }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clinic Operations Reports - Hospital" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Clinic Operations Reports</h1>
                        <p className="text-muted-foreground">Clinic operations and performance analytics for {dateRange.label}</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" asChild>
                            <Link href={route('hospital.reports.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Reports
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('hospital.reports.export', 'all')}>
                                <Download className="mr-2 h-4 w-4" />
                                Export Data
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_patients || 0}</div>
                            <p className="text-xs text-muted-foreground">Registered patients</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_appointments || 0}</div>
                            <p className="text-xs text-muted-foreground">Scheduled appointments</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats?.completed_appointments || 0}</div>
                            <p className="text-xs text-muted-foreground">Completed appointments</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">₱{stats?.total_revenue?.toLocaleString() || 0}</div>
                            <p className="text-xs text-muted-foreground">Total earnings</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                            <Clock className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats?.average_appointment_duration || 0} min</div>
                            <p className="text-xs text-muted-foreground">Average appointment time</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
                            <Activity className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats?.patient_satisfaction_score || 0}/5</div>
                            <p className="text-xs text-muted-foreground">Patient satisfaction</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Operations Overview */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appointment Performance</CardTitle>
                            <CardDescription>Appointment completion and efficiency metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Completion Rate</span>
                                    <Badge variant="outline">
                                        {stats?.total_appointments > 0
                                            ? Math.round((stats.completed_appointments / stats.total_appointments) * 100)
                                            : 0}
                                        %
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Pending Appointments</span>
                                    <Badge variant="outline">{stats?.total_appointments - stats?.completed_appointments || 0}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Average Duration</span>
                                    <Badge variant="outline">{stats?.average_appointment_duration || 0} minutes</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Patient Satisfaction</CardTitle>
                            <CardDescription>Patient experience and feedback metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Overall Rating</span>
                                    <Badge
                                        variant="outline"
                                        className={
                                            stats?.patient_satisfaction_score >= 4 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }
                                    >
                                        {stats?.patient_satisfaction_score || 0}/5
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Total Patients</span>
                                    <Badge variant="outline">{stats?.total_patients || 0}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Revenue per Patient</span>
                                    <Badge variant="outline">
                                        ₱{stats?.total_patients > 0 ? Math.round((stats.total_revenue / stats.total_patients) * 100) / 100 : 0}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Operations Summary</CardTitle>
                        <CardDescription>Key performance indicators for clinic operations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">{stats?.total_appointments || 0}</div>
                                <p className="text-sm text-muted-foreground">Total Appointments</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600">
                                    {stats?.total_appointments > 0 ? Math.round((stats.completed_appointments / stats.total_appointments) * 100) : 0}%
                                </div>
                                <p className="text-sm text-muted-foreground">Completion Rate</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600">₱{stats?.total_revenue?.toLocaleString() || 0}</div>
                                <p className="text-sm text-muted-foreground">Total Revenue</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

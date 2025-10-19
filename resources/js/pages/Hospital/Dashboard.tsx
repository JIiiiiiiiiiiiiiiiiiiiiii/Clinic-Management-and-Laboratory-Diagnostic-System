import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Activity, ArrowRight, Clock, FileText, TrendingUp, User, UserCheck, Users } from 'lucide-react';
import { route } from 'ziggy-js';

interface DashboardProps {
    stats: {
        total_patients: number;
        recent_transfers: number;
        pending_transfers: number;
        clinic_appointments: number;
    };
    recentTransfers: Array<{
        id: number;
        first_name: string;
        last_name: string;
        patient_id: string;
        transfers: Array<{
            id: number;
            transfer_reason: string;
            priority: string;
            status: string;
            created_at: string;
        }>;
    }>;
    clinicOperations: {
        total_appointments: number;
        completed_appointments: number;
        pending_appointments: number;
        total_billing: number;
        lab_orders: number;
    };
}

export default function HospitalDashboard({ stats, recentTransfers, clinicOperations }: DashboardProps) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Hospital Dashboard', href: route('hospital.dashboard') }];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>


            <div className="space-y-6">


                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_patients.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">All registered patients</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Recent Transfers</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.recent_transfers}</div>
                            <p className="text-xs text-muted-foreground">Last 30 days</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Transfers</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.pending_transfers}</div>
                            <p className="text-xs text-muted-foreground">Awaiting clinic acceptance</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Clinic Appointments</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.clinic_appointments}</div>
                            <p className="text-xs text-muted-foreground">Last 30 days</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Recent Transfers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <UserCheck className="h-5 w-5" />
                                <span>Recent Patient Transfers</span>
                            </CardTitle>
                            <CardDescription>Latest patient transfers to St. James Clinic</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentTransfers.length > 0 ? (
                                    recentTransfers.map((patient) => (
                                        <div key={patient.id} className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="space-y-1">
                                                <div className="font-medium">
                                                    {patient.first_name} {patient.last_name}
                                                </div>
                                                <div className="text-sm text-muted-foreground">ID: {patient.patient_id}</div>
                                                {patient.transfers.length > 0 && (
                                                    <div className="text-xs text-muted-foreground">{patient.transfers[0].transfer_reason}</div>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end space-y-1">
                                                {patient.transfers.length > 0 && (
                                                    <>
                                                        <Badge className={getPriorityColor(patient.transfers[0].priority)}>
                                                            {patient.transfers[0].priority}
                                                        </Badge>
                                                        <Badge className={getStatusColor(patient.transfers[0].status)}>
                                                            {patient.transfers[0].status}
                                                        </Badge>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-6 text-center text-muted-foreground">No recent transfers</div>
                                )}
                            </div>
                            <div className="mt-4">
                                <Button variant="outline" className="w-full">
                                    View All Transfers
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Clinic Operations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5" />
                                <span>Clinic Operations</span>
                            </CardTitle>
                            <CardDescription>Overview of clinic activities and performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-lg bg-blue-50 p-3 text-center">
                                        <div className="text-2xl font-bold text-blue-600">{clinicOperations.total_appointments}</div>
                                        <div className="text-sm text-blue-600">Total Appointments</div>
                                    </div>
                                    <div className="rounded-lg bg-green-50 p-3 text-center">
                                        <div className="text-2xl font-bold text-green-600">{clinicOperations.completed_appointments}</div>
                                        <div className="text-sm text-green-600">Completed</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-lg bg-yellow-50 p-3 text-center">
                                        <div className="text-2xl font-bold text-yellow-600">{clinicOperations.pending_appointments}</div>
                                        <div className="text-sm text-yellow-600">Pending</div>
                                    </div>
                                    <div className="rounded-lg bg-purple-50 p-3 text-center">
                                        <div className="text-2xl font-bold text-purple-600">{clinicOperations.lab_orders}</div>
                                        <div className="text-sm text-purple-600">Lab Orders</div>
                                    </div>
                                </div>

                                <div className="rounded-lg bg-gray-50 p-3">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-600">₱{clinicOperations.total_billing.toLocaleString()}</div>
                                        <div className="text-sm text-gray-600">Total Billing</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <FileText className="h-5 w-5" />
                            <span>Quick Actions</span>
                        </CardTitle>
                        <CardDescription>Common tasks and navigation shortcuts for hospital staff</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <Button asChild className="flex h-auto flex-col items-center space-y-2 p-4">
                                <Link href={route('hospital.patients.index')}>
                                    <Users className="h-6 w-6" />
                                    <span>Manage Patients</span>
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="flex h-auto flex-col items-center space-y-2 p-4">
                                <Link href={route('hospital.patients.create')}>
                                    <User className="h-6 w-6" />
                                    <span>Add Patient</span>
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="flex h-auto flex-col items-center space-y-2 p-4">
                                <Link href={route('hospital.patients.refer')}>
                                    <UserCheck className="h-6 w-6" />
                                    <span>Refer Patient</span>
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="flex h-auto flex-col items-center space-y-2 p-4">
                                <Link href={route('hospital.reports.index')}>
                                    <FileText className="h-6 w-6" />
                                    <span>Generate Reports</span>
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

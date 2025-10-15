import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Users, 
    Calendar, 
    FlaskConical, 
    Package2,
    DollarSign,
    Activity,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

export default function Dashboard() {
    const { user, stats, recent_appointments, today_appointments, notifications } = usePage().props as any;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="@container/main flex flex-1 flex-col gap-6">
                    {/* Welcome Header */}
                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-6">
                        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Admin'}!</h1>
                        <p className="text-green-100">St. James Hospital - Industrial Clinic and Diagnostic Center</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="bg-white shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Appointments</CardTitle>
                                <Calendar className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{stats?.total_appointments || 0}</div>
                                <p className="text-xs text-muted-foreground">All time appointments</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Patients</CardTitle>
                                <Users className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{stats?.total_patients || 0}</div>
                                <p className="text-xs text-muted-foreground">Registered patients</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Pending Appointments</CardTitle>
                                <Clock className="h-4 w-4 text-yellow-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">{stats?.pending_appointments || 0}</div>
                                <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Today's Appointments</CardTitle>
                                <CheckCircle className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-600">{stats?.today_appointments || 0}</div>
                                <p className="text-xs text-muted-foreground">Scheduled for today</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Today's Appointments */}
                    {today_appointments && today_appointments.length > 0 && (
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-green-600" />
                                    Today's Appointments ({today_appointments.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {today_appointments.slice(0, 5).map((appointment: any) => (
                                        <div key={appointment.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-lg">{appointment.patient_name}</h4>
                                                <p className="text-gray-600">with {appointment.specialist_name}</p>
                                                <p className="text-sm text-gray-500">{appointment.appointment_type} at {appointment.appointment_time}</p>
                                            </div>
                                            <Badge variant="outline" className="bg-green-100 text-green-800">
                                                {appointment.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent Appointments */}
                    {recent_appointments && recent_appointments.length > 0 && (
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                    Recent Appointments
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {recent_appointments.slice(0, 5).map((appointment: any) => (
                                        <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-lg">{appointment.patient_name}</h4>
                                                <p className="text-gray-600">with {appointment.specialist_name}</p>
                                                <p className="text-sm text-gray-500">{appointment.appointment_date} at {appointment.appointment_time}</p>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {appointment.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="p-6 bg-white shadow-lg">
                            <div className="flex items-center mb-4">
                                <div className="bg-green-100 p-3 rounded-lg mr-4">
                                    <Calendar className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Appointments</h3>
                                    <p className="text-gray-600">Manage all appointments</p>
                                </div>
                            </div>
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                <Calendar className="mr-2 h-4 w-4" />
                                Manage Appointments
                            </Button>
                        </Card>

                        <Card className="p-6 bg-white shadow-lg">
                            <div className="flex items-center mb-4">
                                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Patients</h3>
                                    <p className="text-gray-600">Patient management</p>
                                </div>
                            </div>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                <Users className="mr-2 h-4 w-4" />
                                Manage Patients
                            </Button>
                        </Card>

                        <Card className="p-6 bg-white shadow-lg">
                            <div className="flex items-center mb-4">
                                <div className="bg-purple-100 p-3 rounded-lg mr-4">
                                    <FlaskConical className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Lab Tests</h3>
                                    <p className="text-gray-600">Laboratory management</p>
                                </div>
                            </div>
                            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                                <FlaskConical className="mr-2 h-4 w-4" />
                                Manage Lab Tests
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
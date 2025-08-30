import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Clock, Filter, Plus, Search, Stethoscope } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Appointments', href: '/admin/appointments' },
];

// Mock data - in real app this would come from props
const appointments = [
    {
        id: 1,
        patientName: 'John Doe',
        patientId: 'P001',
        doctor: 'Dr. Smith',
        date: '2025-04-24',
        time: '10:00 AM',
        type: 'Follow-up',
        status: 'Confirmed',
        duration: '30 min',
        notes: 'Hypertension follow-up',
        contactNumber: '+63 912 345 6789',
    },
    {
        id: 2,
        patientName: 'Jane Smith',
        patientId: 'P002',
        doctor: 'Dr. Johnson',
        date: '2025-04-24',
        time: '2:00 PM',
        type: 'New Consultation',
        status: 'Confirmed',
        duration: '45 min',
        notes: 'Diabetes screening',
        contactNumber: '+63 923 456 7890',
    },
    {
        id: 3,
        patientName: 'Bob Johnson',
        patientId: 'P003',
        doctor: 'Dr. Davis',
        date: '2025-04-25',
        time: '9:00 AM',
        type: 'Annual Check-up',
        status: 'Pending',
        duration: '60 min',
        notes: 'Routine health assessment',
        contactNumber: '+63 934 567 8901',
    },
    {
        id: 4,
        patientName: 'Alice Brown',
        patientId: 'P004',
        doctor: 'Dr. Wilson',
        date: '2025-04-24',
        time: '11:30 AM',
        type: 'Emergency',
        status: 'Completed',
        duration: '20 min',
        notes: 'Chest pain evaluation',
        contactNumber: '+63 945 678 9012',
    },
];

const getStatusBadge = (status: string) => {
    const statusConfig = {
        Confirmed: 'bg-green-100 text-green-800',
        Pending: 'bg-yellow-100 text-yellow-800',
        Completed: 'bg-blue-100 text-blue-800',
        Cancelled: 'bg-red-100 text-red-800',
        Rescheduled: 'bg-purple-100 text-purple-800',
    };

    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
};

const getTypeBadge = (type: string) => {
    const typeConfig = {
        'New Consultation': 'bg-blue-100 text-blue-800',
        'Follow-up': 'bg-green-100 text-green-800',
        'Annual Check-up': 'bg-purple-100 text-purple-800',
        Emergency: 'bg-red-100 text-red-800',
        Routine: 'bg-gray-100 text-gray-800',
    };

    return typeConfig[type as keyof typeof typeConfig] || 'bg-gray-100 text-gray-800';
};

export default function AppointmentsIndex() {
    const { permissions, canAccessModule } = useRoleAccess();

    // Redirect if user doesn't have access to appointments
    if (!permissions.canAccessAppointments) {
        router.visit('/admin/dashboard');
        return null;
    }

    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter((apt) => apt.date === today);
    const confirmedAppointments = appointments.filter((apt) => apt.status === 'Confirmed');
    const pendingAppointments = appointments.filter((apt) => apt.status === 'Pending');
    const completedAppointments = appointments.filter((apt) => apt.status === 'Completed');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appointments Management" />

            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                            <p className="text-gray-500">Manage patient appointments and schedules</p>
                        </div>
                        {permissions.canCreateAppointments && (
                            <Button asChild>
                                <Link href="/admin/appointments/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Appointment
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Appointment Stats */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Today's Appointments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{todayAppointments.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Confirmed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{confirmedAppointments.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{pendingAppointments.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{completedAppointments.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Search and filter appointments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input placeholder="Search by patient name, doctor, or appointment type..." className="pl-10" />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filter by Status
                                </Button>
                                <Button variant="outline">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filter by Date
                                </Button>
                                <Button variant="outline">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filter by Doctor
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Appointments Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Appointment Schedule</CardTitle>
                        <CardDescription>A list of all scheduled appointments and their current status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {appointments.map((appointment) => (
                                    <TableRow key={appointment.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{appointment.patientName}</div>
                                                <div className="text-sm text-gray-500">ID: {appointment.patientId}</div>
                                                <div className="text-sm text-gray-500">{appointment.contactNumber}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Stethoscope className="h-4 w-4 text-blue-500" />
                                                {appointment.doctor}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{appointment.date}</div>
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    <Clock className="h-3 w-3" />
                                                    {appointment.time}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getTypeBadge(appointment.type)}>{appointment.type}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusBadge(appointment.status)}>{appointment.status}</Badge>
                                        </TableCell>
                                        <TableCell>{appointment.duration}</TableCell>
                                        <TableCell className="max-w-xs truncate" title={appointment.notes}>
                                            {appointment.notes}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/admin/appointments/${appointment.id}`}>View</Link>
                                                </Button>
                                                {appointment.status === 'Pending' && permissions.canEditAppointments && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/admin/appointments/${appointment.id}/confirm`}>Confirm</Link>
                                                    </Button>
                                                )}
                                                {permissions.canEditAppointments && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/admin/appointments/${appointment.id}/edit`}>Edit</Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

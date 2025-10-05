import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, Filter, Plus, Search, Stethoscope } from 'lucide-react';
import Heading from '@/components/heading';

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
        Confirmed: 'success',
        Pending: 'warning',
        Completed: 'success',
        Cancelled: 'destructive',
        Rescheduled: 'info',
    };

    return statusConfig[status as keyof typeof statusConfig] || 'secondary';
};

const getTypeBadge = (type: string) => {
    const typeConfig = {
        'New Consultation': 'info',
        'Follow-up': 'success',
        'Annual Check-up': 'secondary',
        Emergency: 'destructive',
        Routine: 'outline',
    };

    return typeConfig[type as keyof typeof typeConfig] || 'secondary';
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

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Heading title="Appointments" description="Manage patient appointments and schedules" icon={Calendar} />
                        {permissions.canCreateAppointments && (
                            <Button asChild className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                <Link href="/admin/appointments/create">
                                    <Plus className="mr-2 h-5 w-5" />
                                    New Appointment
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Appointment Analytics Cards (glassy metrics like Reports) */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Calendar className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Today's Appointments</h3>
                                        <p className="text-blue-100 mt-1 text-xs">Scheduled today</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6">
                            <div className="text-2xl font-bold text-gray-900">{todayAppointments.length}</div>
                        </div>
                    </div>

                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <CheckCircle className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Confirmed</h3>
                                        <p className="text-emerald-100 mt-1 text-xs">On track for today</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6">
                            <div className="text-2xl font-bold text-gray-900">{confirmedAppointments.length}</div>
                        </div>
                    </div>

                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all">
                        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Pending</h3>
                                        <p className="text-amber-100 mt-1 text-xs">Awaiting confirmation</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6">
                            <div className="text-2xl font-bold text-gray-900">{pendingAppointments.length}</div>
                        </div>
                    </div>

                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <CheckCircle className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Completed</h3>
                                        <p className="text-indigo-100 mt-1 text-xs">Done today</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6">
                            <div className="text-2xl font-bold text-gray-900">{completedAppointments.length}</div>
                        </div>
                    </div>
                </div>

                {/* Appointments Section */}
                <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Stethoscope className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Appointment Schedule</h3>
                                    <p className="text-blue-100 mt-1">Search and manage patient appointments</p>
                                </div>
                            </div>
                            {permissions.canCreateAppointments && (
                                <Button asChild className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                    <Link href="/admin/appointments/create">
                                        <Plus className="mr-2 h-5 w-5" />
                                        New Appointment
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="px-6 py-6 bg-gradient-to-br from-blue-50 to-blue-100">
                        <div className="mb-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by patient name, doctor, or appointment type..."
                                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button className="h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Apply Filters
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Appointments Table */}
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="hover:bg-gray-50">
                                        <TableHead className="font-semibold text-gray-700">Patient</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Doctor</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Date & Time</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Type</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Duration</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Notes</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {appointments.map((appointment) => (
                                        <TableRow key={appointment.id} className="hover:bg-blue-50/50 transition-colors border-b border-gray-100">
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium text-gray-900">{appointment.patientName}</div>
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
                                                    <div className="font-medium text-gray-900">{appointment.date}</div>
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        <Clock className="h-3 w-3" />
                                                        {appointment.time}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getTypeBadge(appointment.type) as any}>{appointment.type}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadge(appointment.status) as any}>{appointment.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-700">{appointment.duration}</TableCell>
                                            <TableCell className="max-w-xs truncate text-gray-700" title={appointment.notes}>
                                                {appointment.notes}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-3">
                                                    <Button asChild className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl">
                                                        <Link href={`/admin/appointments/${appointment.id}`}>View</Link>
                                                    </Button>
                                                    {appointment.status === 'Pending' && permissions.canEditAppointments && (
                                                        <Button asChild className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl">
                                                            <Link href={`/admin/appointments/${appointment.id}/confirm`}>Confirm</Link>
                                                        </Button>
                                                    )}
                                                    {permissions.canEditAppointments && (
                                                        <Button asChild className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl">
                                                            <Link href={`/admin/appointments/${appointment.id}/edit`}>Edit</Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                {/* Removed old schedule table as requested */}
            </div>
        </AppLayout>
    );
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Calendar, 
    Clock, 
    User, 
    Eye, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    Bell,
    X
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Appointments', href: '/admin/appointments' },
    { title: 'Pending Appointments', href: '/admin/pending-appointments' },
];

interface PendingAppointment {
    id: number;
    patient_name: string;
    patient_id: string;
    appointment_type: string;
    specialist_name: string;
    appointment_date: string;
    appointment_time: string;
    price: string;
    notes: string | null;
    special_requirements: string | null;
    created_at: string;
    appointment_source: 'online' | 'walk_in';
}

interface PendingAppointmentsIndexProps {
    pendingAppointments: PendingAppointment[];
}

export default function PendingAppointmentsIndex({ 
    pendingAppointments 
}: PendingAppointmentsIndexProps) {
    
    // Calculate statistics
    const stats = {
        totalPending: pendingAppointments.length,
        onlineAppointments: pendingAppointments.filter(apt => apt.appointment_source === 'online').length,
        walkInAppointments: pendingAppointments.filter(apt => apt.appointment_source === 'walk_in').length,
        todayAppointments: pendingAppointments.filter(apt => {
            const today = new Date().toDateString();
            const appointmentDate = new Date(apt.appointment_date).toDateString();
            return appointmentDate === today;
        }).length,
    };
    
    const handleRemoveAppointment = (appointmentId: number) => {
        if (confirm('Are you sure you want to remove this pending appointment? This action cannot be undone.')) {
            // Use Inertia to delete the appointment
            router.delete(route('admin.pending-appointments.destroy', appointmentId), {
                onSuccess: () => {
                    alert('Pending appointment removed successfully!');
                },
                onError: (errors) => {
                    console.error('Error removing appointment:', errors);
                    alert('Error removing appointment. Please try again.');
                }
            });
        }
    };
    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'consultation':
                return 'bg-blue-100 text-blue-800';
            case 'checkup':
                return 'bg-green-100 text-green-800';
            case 'fecalysis':
                return 'bg-yellow-100 text-yellow-800';
            case 'cbc':
                return 'bg-purple-100 text-purple-800';
            case 'urinalysis':
                return 'bg-orange-100 text-orange-800';
            case 'x-ray':
                return 'bg-red-100 text-red-800';
            case 'ultrasound':
                return 'bg-indigo-100 text-indigo-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pending Appointments" />
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Pending</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.totalPending}</p>
                                        <p className="text-sm text-gray-500">All pending appointments</p>
                                    </div>
                                    <div className="p-3 bg-yellow-100 rounded-full">
                                        <Bell className="h-6 w-6 text-yellow-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Online</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.onlineAppointments}</p>
                                        <p className="text-sm text-gray-500">Online bookings</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <Calendar className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Walk-in</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.walkInAppointments}</p>
                                        <p className="text-sm text-gray-500">Walk-in appointments</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <User className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Today</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.todayAppointments}</p>
                                        <p className="text-sm text-gray-500">Scheduled today</p>
                                    </div>
                                    <div className="p-3 bg-orange-100 rounded-full">
                                        <Clock className="h-6 w-6 text-orange-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Data Table */}
                    <Card className="bg-white border border-gray-200">
                    <CardHeader className="bg-white border-b border-gray-200">
                        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            Appointment Requests Awaiting Approval ({pendingAppointments.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="text-black font-semibold">Patient</TableHead>
                                        <TableHead className="text-black font-semibold">Appointment Details</TableHead>
                                        <TableHead className="text-black font-semibold">Source</TableHead>
                                        <TableHead className="text-black font-semibold">Specialist</TableHead>
                                        <TableHead className="text-black font-semibold">Date & Time</TableHead>
                                        <TableHead className="text-black font-semibold">Price</TableHead>
                                        <TableHead className="text-black font-semibold">Requested</TableHead>
                                        <TableHead className="text-black font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingAppointments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                                No pending appointment requests
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pendingAppointments.map((appointment) => (
                                            <TableRow key={appointment.id} className="hover:bg-gray-50">
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-black">{appointment.patient_name}</div>
                                                        <div className="text-sm text-gray-500">ID: {appointment.patient_id}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <Badge className={getTypeBadge(appointment.appointment_type)}>
                                                            {appointment.appointment_type}
                                                        </Badge>
                                                        {appointment.notes && (
                                                            <div className="text-sm text-gray-600 mt-1">
                                                                Notes: {appointment.notes}
                                                            </div>
                                                        )}
                                                        {appointment.special_requirements && (
                                                            <div className="text-sm text-gray-600 mt-1">
                                                                Requirements: {appointment.special_requirements}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={appointment.appointment_source === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                                                        {appointment.appointment_source === 'online' ? 'Online' : 'Walk-in'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-black">{appointment.specialist_name}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-gray-500" />
                                                        <div>
                                                            <div className="font-medium text-black">{appointment.appointment_date}</div>
                                                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {appointment.appointment_time}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-semibold text-green-600">{appointment.price}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-600">{appointment.created_at}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                                        >
                                                            <Link href={`/admin/pending-appointments/${appointment.id}`}>
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                Review
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleRemoveAppointment(appointment.id)}
                                                            className="text-red-600 border-red-300 hover:bg-red-50"
                                                        >
                                                            <X className="h-4 w-4 mr-1" />
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="mt-6 bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-600" />
                            <div>
                                <h3 className="font-semibold text-blue-900">How the Approval Process Works</h3>
                                <p className="text-blue-800 text-sm mt-1">
                                    When patients request appointments, they are sent here for admin approval. 
                                    Click "Review" to see full details and either approve or reject the request. 
                                    Approved appointments will be added to the main appointments table.
                                </p>
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

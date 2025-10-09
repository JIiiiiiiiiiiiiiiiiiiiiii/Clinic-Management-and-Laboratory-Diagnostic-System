import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, ArrowLeft, Plus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Appointment {
    id: number;
    patient_name: string;
    appointment_type: string;
    specialist_name?: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    reason: string;
    notes?: string;
    created_at: string;
}

interface PatientAppointmentsProps {
    appointments: Appointment[];
}

export default function PatientAppointments({ appointments = [] }: PatientAppointmentsProps) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return <CheckCircle className="h-4 w-4" />;
            case 'pending':
                return <AlertCircle className="h-4 w-4" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <>
            <Head title="My Appointments" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href={route('patient.dashboard')} className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-4">My Appointments</h1>
                                <p className="text-xl text-gray-600">
                                    Manage your scheduled appointments with St. James Clinic.
                                </p>
                            </div>
                            <Link href={route('patient.appointments.create')}>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Book New Appointment
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Appointments List */}
                    {appointments.length > 0 ? (
                        <div className="space-y-6">
                            {appointments.map((appointment) => (
                                <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="bg-blue-100 p-3 rounded-lg">
                                                    <Calendar className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-semibold">{appointment.appointment_type}</h3>
                                                    <p className="text-gray-600">
                                                        {appointment.specialist_name || 'General Consultation'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={`${getStatusColor(appointment.status)} flex items-center space-x-1`}>
                                                {getStatusIcon(appointment.status)}
                                                <span>{appointment.status}</span>
                                            </Badge>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-3">
                                                    <Clock className="h-5 w-5 text-gray-500" />
                                                    <div>
                                                        <p className="font-medium">Date & Time</p>
                                                        <p className="text-gray-600">
                                                            {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center space-x-3">
                                                    <User className="h-5 w-5 text-gray-500" />
                                                    <div>
                                                        <p className="font-medium">Patient</p>
                                                        <p className="text-gray-600">{appointment.patient_name}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <p className="font-medium mb-2">Reason for Visit</p>
                                                    <p className="text-gray-600">{appointment.reason}</p>
                                                </div>
                                                
                                                {appointment.notes && (
                                                    <div>
                                                        <p className="font-medium mb-2">Additional Notes</p>
                                                        <p className="text-gray-600">{appointment.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t flex justify-between items-center">
                                            <div className="text-sm text-gray-500">
                                                Booked on {new Date(appointment.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="flex space-x-2">
                                                {appointment.status === 'pending' && (
                                                    <Button variant="outline" size="sm">
                                                        Edit
                                                    </Button>
                                                )}
                                                {appointment.status === 'pending' && (
                                                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                                        Cancel
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-12">
                            <CardContent>
                                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Calendar className="h-10 w-10 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-semibold mb-4">No Appointments Yet</h3>
                                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                    You haven't booked any appointments yet. Book your first appointment to get started with St. James Clinic.
                                </p>
                                <Link href={route('patient.appointments.create')}>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Book Your First Appointment
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <div className="mt-12 grid md:grid-cols-3 gap-6">
                        <Card className="text-center p-6">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Book Appointment</h3>
                            <p className="text-gray-600 mb-4">
                                Schedule a new appointment with our medical professionals.
                            </p>
                            <Link href={route('patient.appointments.create')}>
                                <Button className="w-full">Book Now</Button>
                            </Link>
                        </Card>

                        <Card className="text-center p-6">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Manage Appointments</h3>
                            <p className="text-gray-600 mb-4">
                                View, edit, or cancel your existing appointments.
                            </p>
                            <Button variant="outline" className="w-full" disabled>
                                Coming Soon
                            </Button>
                        </Card>

                        <Card className="text-center p-6">
                            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Update Profile</h3>
                            <p className="text-gray-600 mb-4">
                                Keep your personal information up to date.
                            </p>
                            <Link href={route('profile.edit')}>
                                <Button variant="outline" className="w-full">Update Profile</Button>
                            </Link>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
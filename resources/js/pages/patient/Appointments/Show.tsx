import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, ArrowLeft, Edit, Trash2 } from 'lucide-react';

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

interface PatientAppointmentShowProps {
    appointment: Appointment;
}

export default function PatientAppointmentShow({ appointment }: PatientAppointmentShowProps) {
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
            <Head title={`Appointment Details - ${appointment.appointment_type}`} />
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href={route('patient.appointments')}>
                            <Button variant="outline" className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Appointments
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Appointment Details</h1>
                        <p className="text-gray-600 mt-2">View your appointment information</p>
                    </div>

                    {/* Appointment Details */}
                    <div className="grid gap-6">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl">{appointment.appointment_type}</CardTitle>
                                        <CardDescription>
                                            {appointment.specialist_name || 'General Consultation'}
                                        </CardDescription>
                                    </div>
                                    <Badge className={`${getStatusColor(appointment.status)} flex items-center space-x-1`}>
                                        <span>{appointment.status}</span>
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <Calendar className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <p className="font-medium">Date</p>
                                                <p className="text-gray-600">{formatDate(appointment.appointment_date)}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-3">
                                            <Clock className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <p className="font-medium">Time</p>
                                                <p className="text-gray-600">{formatTime(appointment.appointment_time)}</p>
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

                                <div className="pt-4 border-t flex justify-between items-center">
                                    <div className="text-sm text-gray-500">
                                        Booked on {new Date(appointment.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex space-x-2">
                                        {appointment.status === 'pending' && (
                                            <Link href={route('patient.appointments.edit', appointment.id)}>
                                                <Button variant="outline" size="sm" className="flex items-center">
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                            </Link>
                                        )}
                                        {appointment.status === 'pending' && (
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="text-red-600 hover:text-red-700 flex items-center"
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to cancel this appointment?')) {
                                                        // Handle cancel logic here
                                                        console.log('Cancel appointment:', appointment.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

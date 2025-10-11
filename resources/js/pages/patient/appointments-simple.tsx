import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Clock, Plus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/patient/dashboard' },
    { title: 'Appointments', href: '/patient/appointments' },
];

interface SimpleAppointmentsProps {
    user: {
        name: string;
        email: string;
        role: string;
    };
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        patient_no: string;
    };
    appointments: Array<{
        id: number;
        type: string;
        specialist: string;
        date: string;
        time: string;
        status: string;
        status_color: string;
        price: string;
        billing_status: string;
    }>;
}

export default function SimpleAppointments({ 
    user, 
    patient, 
    appointments = []
}: SimpleAppointmentsProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Confirmed':
                return <CheckCircle className="h-4 w-4" />;
            case 'Completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'Cancelled':
                return <XCircle className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Appointments" />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-black">My Appointments</h1>
                    <p className="text-gray-500">View and manage your scheduled appointments</p>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <div className="flex gap-4">
                        <Link href="/patient/appointments/create">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Book New Appointment
                            </Button>
                        </Link>
                        <Link href="/patient/dashboard">
                            <Button variant="outline">
                                <Calendar className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Appointments List */}
                <div className="space-y-6">
                    {appointments.length > 0 ? (
                        appointments.map((appointment) => (
                            <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-blue-100 p-3 rounded-lg">
                                                <Calendar className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl">{appointment.type}</CardTitle>
                                                <p className="text-gray-600">{appointment.specialist}</p>
                                            </div>
                                        </div>
                                        <Badge className={`${appointment.status_color} flex items-center space-x-1`}>
                                            {getStatusIcon(appointment.status)}
                                            <span>{appointment.status}</span>
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span className="font-medium">{appointment.date}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Clock className="h-4 w-4 text-gray-500" />
                                            <span className="font-medium">{appointment.time}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-gray-500">Price:</span>
                                            <span className="font-medium">{appointment.price}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="text-center py-12">
                                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Appointments Found</h3>
                                <p className="text-gray-500 mb-6">
                                    You don't have any appointments yet. Book your first appointment to get started.
                                </p>
                                <Link href="/patient/appointments/create">
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Book Your First Appointment
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

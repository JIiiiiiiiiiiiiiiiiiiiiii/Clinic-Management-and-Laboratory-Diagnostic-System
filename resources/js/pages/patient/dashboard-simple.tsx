import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Heart, Stethoscope, LogOut } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import RealtimeNotificationBell from '@/components/RealtimeNotificationBell';

interface SimpleDashboardProps {
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
    stats: {
        total_appointments: number;
        upcoming_appointments: number;
        completed_appointments: number;
        pending_lab_results: number;
        total_visits: number;
    };
    recent_appointments: Array<{
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
    upcoming_appointments: Array<{
        id: number;
        type: string;
        specialist: string;
        date: string;
        time: string;
        status: string;
        is_today: boolean;
        is_upcoming: boolean;
    }>;
    recent_lab_orders: Array<{
        id: number;
        created_at: string;
        tests: string[];
        has_results: boolean;
        status: string;
    }>;
    recent_visits: Array<{
        id: number;
        visit_date: string;
        chief_complaint: string;
        diagnosis: string;
        treatment: string;
    }>;
    notifications: Array<{
        id: number;
        type: string;
        title: string;
        message: string;
        read: boolean;
        created_at: string;
        data: any;
    }>;
    unreadCount: number;
}

export default function SimpleDashboard({ 
    user, 
    patient, 
    stats, 
    recent_appointments, 
    upcoming_appointments, 
    recent_lab_orders, 
    recent_visits,
    notifications,
    unreadCount
}: SimpleDashboardProps) {
    const handleLogout = () => {
        router.post(route('logout'));
    };
    return (
        <>
            <Head title="Patient Dashboard - St. James Hospital" />
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
                {/* Notification Bell */}
                <div className="fixed top-4 right-4 z-50">
                    <RealtimeNotificationBell userRole="patient" initialNotifications={notifications} unreadCount={unreadCount} />
                </div>
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-white rounded-full p-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Stethoscope className="h-8 w-8 text-blue-600" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">St. James Hospital, Inc.</h1>
                                    <p className="text-green-100">Industrial Clinic and Diagnostic Center</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm text-green-100">Welcome back,</p>
                                    <p className="font-semibold">{user.name}</p>
                                </div>
                                <Button
                                    onClick={handleLogout}
                                    variant="outline"
                                    size="sm"
                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    {/* Welcome Section */}
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Your Community Clinic
                        </h2>
                        <p className="text-xl text-gray-600 mb-8">
                            Your health is our priority. Book your appointment today and experience world-class healthcare.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link href={route('patient.online.appointment')}>
                                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg">
                                    <Calendar className="mr-2 h-5 w-5" />
                                    Online Appointment
                                </Button>
                            </Link>
                            <Link href={route('patient.appointments')}>
                                <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-green-600 text-green-600 hover:bg-green-50">
                                    <Clock className="mr-2 h-5 w-5" />
                                    View My Appointments
                                </Button>
                            </Link>
                        </div>
                    </div>




                    {/* No Data Message */}
                    {!patient && (
                        <Card className="mb-8 p-8 text-center bg-yellow-50 border-yellow-200 border-0 rounded-xl">
                            <h3 className="text-xl font-semibold text-yellow-800 mb-4">
                                Patient Record Not Found
                            </h3>
                            <p className="text-yellow-700 mb-6">
                                Your user account is not linked to a patient record yet. Please contact the clinic to set up your patient profile.
                            </p>
                            <Link href={route('patient.contact')}>
                                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                    Contact Clinic
                                </Button>
                            </Link>
                        </Card>
                    )}

                </div>
            </div>
        </>
    );
}

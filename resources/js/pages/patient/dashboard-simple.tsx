import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Heart, Stethoscope, TestTube, FileText, ArrowRight, CheckCircle, Users, Shield, Activity, Zap } from 'lucide-react';
import { Link } from '@inertiajs/react';
import SharedNavigation from '@/components/SharedNavigation';

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
    notifications,
    unreadCount
}: SimpleDashboardProps) {
    return (
        <div className="min-h-screen bg-white">
            <Head title="Patient Dashboard - SJHI Industrial Clinic" />
            
            {/* Shared Navigation */}
            <SharedNavigation user={user} currentPath="/patient/dashboard" notifications={notifications} unreadCount={unreadCount} />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-green-50 via-white to-blue-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <Badge className="bg-green-100 text-green-800 border-green-200 mb-6">
                            Welcome Back, {user.name}
                        </Badge>
                        <h1 className="text-5xl font-bold text-gray-900 mb-6">
                            Your Health Dashboard
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Track your appointments, view test results, and manage your health records all in one place.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Health Overview</h2>
                        <p className="text-lg text-gray-600">Track your health journey with us</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600">Total Appointments</p>
                                        <p className="text-3xl font-bold text-blue-900">{stats.total_appointments}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <Calendar className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-600">Upcoming</p>
                                        <p className="text-3xl font-bold text-green-900">{stats.upcoming_appointments}</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <Clock className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-600">Completed</p>
                                        <p className="text-3xl font-bold text-purple-900">{stats.completed_appointments}</p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-full">
                                        <CheckCircle className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-orange-600">Lab Results</p>
                                        <p className="text-3xl font-bold text-orange-900">{stats.pending_lab_results}</p>
                                    </div>
                                    <div className="p-3 bg-orange-100 rounded-full">
                                        <TestTube className="h-6 w-6 text-orange-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Main Content Grid */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Quick Actions */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Quick Actions */}
                            <Card className="bg-white shadow-lg border-0 rounded-xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                                        <Zap className="h-5 w-5 text-green-600" />
                                        Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Link href="/patient/online-appointment">
                                        <Button className="w-full justify-start bg-green-600 hover:bg-green-700 text-white">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            Book New Appointment
                                        </Button>
                                    </Link>
                                    <Link href="/patient/appointments">
                                        <Button variant="outline" className="w-full justify-start border-green-200 text-green-700 hover:bg-green-50">
                                            <Clock className="mr-2 h-4 w-4" />
                                            View My Appointments
                                        </Button>
                                    </Link>
                                    <Link href="/patient/test-results">
                                        <Button variant="outline" className="w-full justify-start border-blue-200 text-blue-700 hover:bg-blue-50">
                                            <TestTube className="mr-2 h-4 w-4" />
                                            Check Test Results
                                        </Button>
                                    </Link>
                                    <Link href="/patient/records">
                                        <Button variant="outline" className="w-full justify-start border-purple-200 text-purple-700 hover:bg-purple-50">
                                            <FileText className="mr-2 h-4 w-4" />
                                            Medical Records
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Appointments and Activity */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Upcoming Appointments */}
                            <Card className="bg-white shadow-lg border-0 rounded-xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                                        <Calendar className="h-5 w-5 text-green-600" />
                                        Upcoming Appointments
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {upcoming_appointments && upcoming_appointments.length > 0 ? (
                                        <div className="space-y-4">
                                            {upcoming_appointments.slice(0, 3).map((appointment) => (
                                                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="p-2 bg-green-100 rounded-lg">
                                                            <Stethoscope className="h-4 w-4 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{appointment.specialist}</p>
                                                            <p className="text-sm text-gray-600">{appointment.type}</p>
                                                            <p className="text-xs text-gray-500">{appointment.date} at {appointment.time}</p>
                                                        </div>
                                                    </div>
                                                    <Badge className={`${appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {appointment.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                            <Link href="/patient/appointments">
                                                <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                                                    View All Appointments
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Appointments</h3>
                                            <p className="text-gray-600 mb-4">Book your first appointment to get started</p>
                                            <Link href="/patient/online-appointment">
                                                <Button className="bg-green-600 hover:bg-green-700 text-white">
                                                    <Calendar className="mr-2 h-4 w-4" />
                                                    Book Appointment
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recent Lab Results */}
                            <Card className="bg-white shadow-lg border-0 rounded-xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                                        <TestTube className="h-5 w-5 text-blue-600" />
                                        Recent Lab Results
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {recent_lab_orders && recent_lab_orders.length > 0 ? (
                                        <div className="space-y-4">
                                            {recent_lab_orders.slice(0, 3).map((lab) => (
                                                <div key={lab.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="p-2 bg-blue-100 rounded-lg">
                                                            <TestTube className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{lab.tests.join(', ')}</p>
                                                            <p className="text-sm text-gray-600">{new Date(lab.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {lab.has_results ? (
                                                            <Badge className="bg-green-100 text-green-800">Results Ready</Badge>
                                                        ) : (
                                                            <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            <Link href="/patient/test-results">
                                                <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                                                    View All Results
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Lab Results Yet</h3>
                                            <p className="text-gray-600">Your lab results will appear here once available</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* No Patient Record Message */}
            {!patient && (
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Card className="p-8 text-center bg-yellow-50 border-yellow-200 border-0 rounded-xl">
                            <h3 className="text-xl font-semibold text-yellow-800 mb-4">
                                Patient Record Not Found
                            </h3>
                            <p className="text-yellow-700 mb-6">
                                Your user account is not linked to a patient record yet. Please contact the clinic to set up your patient profile.
                            </p>
                            <Link href="/patient/contact">
                                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                    Contact Clinic
                                </Button>
                            </Link>
                        </Card>
                    </div>
                </section>
            )}
        </div>
    );
}

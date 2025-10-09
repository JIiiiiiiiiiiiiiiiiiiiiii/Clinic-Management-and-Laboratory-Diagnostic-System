import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    Calendar, 
    Clock, 
    Plus,
    Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';
import RealtimeNotificationBell from '@/components/RealtimeNotificationBell';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patient Dashboard',
        href: '/patient/dashboard',
    },
];

interface AppointmentFocusedDashboardProps {
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

export default function AppointmentFocusedDashboard({ 
    user, 
    patient, 
    notifications,
    unreadCount
}: AppointmentFocusedDashboardProps) {
    
    // Get flash messages
    const { flash } = usePage().props as any;
    
    // Real-time state management
    const [notificationsList, setNotificationsList] = useState(notifications);
    const [unreadCountState, setUnreadCountState] = useState(unreadCount);

    // Real-time updates
    useEffect(() => {
        // Set up real-time listeners for notification updates
        const setupRealtimeUpdates = () => {
            if (!window.Echo || !window.Echo.private) {
                console.log('Echo not available, skipping real-time setup');
                return;
            }
            
            try {
                // Listen for new notifications
                window.Echo.private(`patient.notifications.${user.id}`)
                    .listen('appointment.status.update', (e) => {
                        console.log('Real-time notification received:', e);
                        
                        if (e.notification) {
                            setNotificationsList(prev => [e.notification, ...prev]);
                            setUnreadCountState(prev => prev + 1);
                        }
                    });

                // Listen for appointment approval notifications
                window.Echo.private(`patient.notifications.${user.id}`)
                    .listen('AppointmentApproved', (e) => {
                        console.log('Appointment approved notification received:', e);
                        
                        // Force a complete page reload to get fresh data
                        window.location.reload();
                    });
            } catch (error) {
                console.log('Error setting up real-time listeners:', error);
            }
        };

        // Initialize real-time updates
        if (window.Echo) {
            setupRealtimeUpdates();
        }

        // Cleanup on unmount
        return () => {
            if (window.Echo && window.Echo.leave) {
                window.Echo.leave(`patient.notifications.${user.id}`);
            }
        };
    }, [user.id]);

    // Update local state when props change
    useEffect(() => {
        setNotificationsList(notifications);
        setUnreadCountState(unreadCount);
    }, [notifications, unreadCount]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patient Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}!</h1>
                            <p className="text-gray-600">Book and manage your appointments with St. James Clinic</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <RealtimeNotificationBell 
                                userRole="patient"
                                initialNotifications={notificationsList}
                                unreadCount={unreadCountState}
                            />
                            <Link href="/patient/register-and-book">
                                <Button className="bg-green-600 hover:bg-green-700">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Register & Book Appointment
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Success Message */}
                    {flash?.success && (
                        <div className="rounded-md border border-green-300 bg-green-50 p-4 text-sm text-green-800">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="font-medium">{flash.success}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {flash?.error && (
                        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="font-medium">{flash.error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Banner Section - Full Width */}
                    <div className="w-full mb-8">
                        <div 
                            className="relative w-full min-h-[600px] rounded-lg overflow-hidden shadow-lg"
                            style={{
                                backgroundImage: 'url(/st-james-banner.jpg)',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                            }}
                        >
                            {/* Content Overlay */}
                            <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center p-8 min-h-[600px]">
                                {/* Welcome Message */}
                                <div className="text-center mb-12 max-w-3xl bg-white/5 backdrop-blur-sm rounded-lg p-8 shadow-lg">
                                    <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
                                        Welcome to St. James Hospital
                                    </h2>
                                    <p className="text-xl text-white drop-shadow-lg">
                                        Your community clinic for quality healthcare. Book your appointment today and experience professional medical care.
                                    </p>
                                </div>

                                {/* Quick Actions */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
                                    <Card className="bg-white/5 backdrop-blur-sm shadow-lg flex flex-col h-full">
                                        <CardHeader className="text-center p-6 flex-1">
                                            <div className="mx-auto w-20 h-20 bg-blue-100/60 rounded-full flex items-center justify-center mb-6">
                                                <Calendar className="h-10 w-10 text-blue-600" />
                                            </div>
                                            <CardTitle className="text-2xl mb-4 text-white drop-shadow-lg">Book New Appointment</CardTitle>
                                            <CardDescription className="text-lg text-white drop-shadow-lg">
                                                Schedule your medical consultation with our specialists
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="text-center p-6 pt-0 mt-auto">
                                            <Link href="/patient/appointments/create">
                                                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3">
                                                    <Plus className="mr-2 h-5 w-5" />
                                                    Book Now
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-white/5 backdrop-blur-sm shadow-lg flex flex-col h-full">
                                        <CardHeader className="text-center p-6 flex-1">
                                            <div className="mx-auto w-20 h-20 bg-green-100/60 rounded-full flex items-center justify-center mb-6">
                                                <Clock className="h-10 w-10 text-green-600" />
                                            </div>
                                            <CardTitle className="text-2xl mb-4 text-white drop-shadow-lg">My Appointments</CardTitle>
                                            <CardDescription className="text-lg text-white drop-shadow-lg">
                                                View and manage your scheduled appointments
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="text-center p-6 pt-0 mt-auto">
                                            <Link href="/patient/appointments">
                                                <Button size="lg" variant="outline" className="w-full text-lg py-3 bg-white/80 hover:bg-white text-gray-800">
                                                    <Clock className="mr-2 h-5 w-5" />
                                                    View Appointments
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information Section */}
                    <div className="w-full">
                        <Card className="bg-white shadow-lg">
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl font-semibold text-gray-900 mb-4">
                                    Why Choose St. James Hospital?
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Calendar className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <h4 className="font-semibold text-lg mb-2">Easy Booking</h4>
                                        <p className="text-gray-600">Book appointments online with our specialists</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Clock className="h-6 w-6 text-green-600" />
                                        </div>
                                        <h4 className="font-semibold text-lg mb-2">Flexible Scheduling</h4>
                                        <p className="text-gray-600">Choose appointment times that work for you</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Bell className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <h4 className="font-semibold text-lg mb-2">Real-time Updates</h4>
                                        <p className="text-gray-600">Get instant notifications about your appointments</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

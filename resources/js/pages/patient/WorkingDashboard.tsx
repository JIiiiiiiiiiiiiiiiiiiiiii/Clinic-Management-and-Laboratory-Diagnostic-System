import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Phone, Star, Heart, Shield, Users, Stethoscope, Award, Bell, CheckCircle, TrendingUp, Activity, Plus, CalendarDays } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface WorkingDashboardProps {
    user: {
        id: number;
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
        total_visits: number;
        pending_lab_results: number;
    };
    recent_appointments: any[];
    recent_lab_orders: any[];
    recent_visits: any[];
    notifications: any[];
    unreadCount: number;
}

export default function WorkingDashboard({ 
    user, 
    patient, 
    stats, 
    recent_appointments, 
    recent_lab_orders, 
    recent_visits, 
    notifications, 
    unreadCount 
}: WorkingDashboardProps) {
    
    return (
        <AppLayout>
            <Head title="Patient Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}!</h1>
                            <p className="text-gray-600">Manage your healthcare with St. James Clinic</p>
                            {patient && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Patient ID: {patient.patient_no} | {patient.first_name} {patient.last_name}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/patient/appointments/create">
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Book Appointment
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_appointments}</div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.upcoming_appointments}</div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.completed_appointments}</div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_visits}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>Common tasks and features</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Link href="/patient/register-and-book">
                                        <Button className="w-full h-20 flex flex-col items-center justify-center bg-green-600 hover:bg-green-700 text-white">
                                            <Plus className="h-6 w-6 mb-2" />
                                            <span className="text-sm">Register & Book</span>
                                        </Button>
                                    </Link>
                                    
                                    <Link href="/patient/appointments/create">
                                        <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                                            <Calendar className="h-6 w-6 mb-2" />
                                            <span className="text-sm">Book Appointment</span>
                                        </Button>
                                    </Link>
                                    
                                    <Link href="/patient/appointments">
                                        <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                                            <Clock className="h-6 w-6 mb-2" />
                                            <span className="text-sm">My Appointments</span>
                                        </Button>
                                    </Link>
                                    
                                    <Link href="/patient/records">
                                        <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                                            <Stethoscope className="h-6 w-6 mb-2" />
                                            <span className="text-sm">Medical Records</span>
                                        </Button>
                                    </Link>
                                    
                                    <Link href="/patient/test-results">
                                        <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                                            <Award className="h-6 w-6 mb-2" />
                                            <span className="text-sm">Test Results</span>
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Your latest healthcare activities</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recent_appointments.length > 0 ? (
                                    <div className="space-y-4">
                                        {recent_appointments.slice(0, 3).map((appointment) => (
                                            <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">{appointment.type}</p>
                                                    <p className="text-sm text-gray-600">{appointment.specialist}</p>
                                                </div>
                                                <Badge variant="outline">{appointment.status}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No recent activity to show</p>
                                        <p className="text-sm mt-2">Book your first appointment to get started!</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Clinic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>About St. James Clinic</CardTitle>
                            <CardDescription>Your trusted healthcare partner</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Heart className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h4 className="font-semibold text-lg mb-2">Quality Care</h4>
                                    <p className="text-gray-600">Professional medical services with compassionate care</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Shield className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h4 className="font-semibold text-lg mb-2">Trusted Service</h4>
                                    <p className="text-gray-600">Experienced healthcare professionals you can trust</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Users className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <h4 className="font-semibold text-lg mb-2">Community Focus</h4>
                                    <p className="text-gray-600">Serving our community with dedication and care</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

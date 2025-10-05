import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Calendar, Clock, FileText, Heart, MapPin, User } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patient Dashboard',
        href: '/patient/dashboard',
    },
];

// Mock patient data - in real app this would come from props
const patientData = {
    name: 'John Doe',
    age: 35,
    gender: 'Male',
    bloodType: 'O+',
    lastVisit: '2025-04-20',
    nextAppointment: '2025-05-15',
    totalVisits: 12,
    recentTests: [
        { id: 1, name: 'Blood Test', date: '2025-04-20', status: 'Completed', result: 'Normal' },
        { id: 2, name: 'Urinalysis', date: '2025-04-20', status: 'Completed', result: 'Normal' },
        { id: 3, name: 'Chest X-Ray', date: '2025-03-15', status: 'Completed', result: 'Normal' },
    ],
    recentPrescriptions: [
        { id: 1, medicine: 'Vitamin D', dosage: '1000 IU daily', duration: '30 days', prescribed: '2025-04-20' },
        { id: 2, medicine: 'Iron Supplement', dosage: '65mg daily', duration: '60 days', prescribed: '2025-03-15' },
    ],
    upcomingAppointments: [
        { id: 1, date: '2025-05-15', time: '10:00 AM', doctor: 'Dr. Smith', type: 'Follow-up' },
        { id: 2, date: '2025-06-01', time: '2:00 PM', doctor: 'Dr. Johnson', type: 'Annual Check-up' },
    ],
};

export default function PatientDashboard() {
    const { isPatient, shouldRedirectToPatient } = useRoleAccess();

    // If user is not a patient, redirect them to appropriate dashboard
    if (!isPatient) {
        // Redirect non-patient users to admin dashboard
        router.visit('/admin/dashboard');
        return null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patient Dashboard" />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Welcome back, {patientData.name}!</h1>
                    <p className="text-gray-500">Here's an overview of your health information and upcoming appointments.</p>
                </div>

                {/* Patient Info Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-500">Total Visits</CardTitle>
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <User size={18} className="text-blue-600" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{patientData.totalVisits}</div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-500">Blood Type</CardTitle>
                                <div className="rounded-lg bg-red-100 p-2">
                                    <Heart size={18} className="text-red-600" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{patientData.bloodType}</div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-500">Last Visit</CardTitle>
                                <div className="rounded-lg bg-green-100 p-2">
                                    <Calendar size={18} className="text-green-600" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{patientData.lastVisit}</div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-500">Next Appointment</CardTitle>
                                <div className="rounded-lg bg-purple-100 p-2">
                                    <Clock size={18} className="text-purple-600" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{patientData.nextAppointment}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Tests */}
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Medical Tests</CardTitle>
                                    <CardDescription>Your latest laboratory and diagnostic test results</CardDescription>
                                </div>
                                <Button variant="outline">View All Tests</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Test Name</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Result</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patientData.recentTests.map((test) => (
                                        <TableRow key={test.id}>
                                            <TableCell className="font-medium">{test.name}</TableCell>
                                            <TableCell>{test.date}</TableCell>
                                            <TableCell>
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{test.status}</Badge>
                                            </TableCell>
                                            <TableCell>{test.result}</TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm">
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Prescriptions */}
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Prescriptions</CardTitle>
                                    <CardDescription>Medications prescribed by your doctors</CardDescription>
                                </div>
                                <Button variant="outline">View All Prescriptions</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Medicine</TableHead>
                                        <TableHead>Dosage</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Prescribed Date</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patientData.recentPrescriptions.map((prescription) => (
                                        <TableRow key={prescription.id}>
                                            <TableCell className="font-medium">{prescription.medicine}</TableCell>
                                            <TableCell>{prescription.dosage}</TableCell>
                                            <TableCell>{prescription.duration}</TableCell>
                                            <TableCell>{prescription.prescribed}</TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm">
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Upcoming Appointments */}
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Upcoming Appointments</CardTitle>
                                    <CardDescription>Your scheduled visits and consultations</CardDescription>
                                </div>
                                <Button>Schedule New Appointment</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Doctor</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patientData.upcomingAppointments.map((appointment) => (
                                        <TableRow key={appointment.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{appointment.date}</div>
                                                    <div className="text-sm text-gray-500">{appointment.time}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{appointment.doctor}</TableCell>
                                            <TableCell>
                                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{appointment.type}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-500" />
                                                    <span>Main Clinic</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm">
                                                        Reschedule
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card className="shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Medical Records
                            </CardTitle>
                            <CardDescription>Access your complete medical history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">View Records</Button>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Book Appointment
                            </CardTitle>
                            <CardDescription>Schedule a new consultation</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">Book Now</Button>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="h-5 w-5" />
                                Health Tips
                            </CardTitle>
                            <CardDescription>Get personalized health advice</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">View Tips</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

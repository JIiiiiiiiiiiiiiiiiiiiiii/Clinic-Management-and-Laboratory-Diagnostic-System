import RealtimeNotificationBell from '@/components/RealtimeNotificationBell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { Award, Calendar, Clock, Heart, MapPin, Shield, Star, Stethoscope, Users } from 'lucide-react';

interface PatientDashboardProps {
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

export default function PatientDashboard({
    user,
    patient,
    stats,
    recent_appointments,
    upcoming_appointments,
    recent_lab_orders,
    recent_visits,
    notifications,
    unreadCount,
}: PatientDashboardProps) {
    return (
        <>
            <Head title="Patient Dashboard" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                {/* Notification Bell */}
                <div className="fixed top-4 right-4 z-50">
                    <RealtimeNotificationBell userRole="patient" initialNotifications={notifications} unreadCount={unreadCount} />
                </div>

                <div className="container mx-auto px-4 py-8">
                    {/* Welcome Hero Section */}
                    <div className="mb-12 text-center">
                        <h1 className="mb-4 text-4xl font-bold text-gray-900">Welcome to St. James Clinic, {user.name}!</h1>
                        <p className="mb-8 text-xl text-gray-600">
                            Your health is our priority. Book your appointment today and experience world-class healthcare.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link href={route('patient.appointments.create')}>
                                <Button size="lg" className="bg-blue-600 px-8 py-3 text-lg text-white hover:bg-blue-700">
                                    <Calendar className="mr-2 h-5 w-5" />
                                    Book Appointment Now
                                </Button>
                            </Link>
                            <Link href={route('patient.appointments.index')}>
                                <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                                    <Clock className="mr-2 h-5 w-5" />
                                    View My Appointments
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Patient Data Overview */}
                    {patient && (
                        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="bg-white p-6 text-center shadow-lg">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                    <Calendar className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="mb-2 text-2xl font-bold text-blue-600">{stats.total_appointments}</h3>
                                <p className="text-gray-600">Total Appointments</p>
                            </Card>

                            <Card className="bg-white p-6 text-center shadow-lg">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                    <Clock className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="mb-2 text-2xl font-bold text-green-600">{stats.upcoming_appointments}</h3>
                                <p className="text-gray-600">Upcoming Appointments</p>
                            </Card>

                            <Card className="bg-white p-6 text-center shadow-lg">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                                    <Heart className="h-8 w-8 text-purple-600" />
                                </div>
                                <h3 className="mb-2 text-2xl font-bold text-purple-600">{stats.pending_lab_results}</h3>
                                <p className="text-gray-600">Pending Lab Results</p>
                            </Card>

                            <Card className="bg-white p-6 text-center shadow-lg">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                                    <Stethoscope className="h-8 w-8 text-orange-600" />
                                </div>
                                <h3 className="mb-2 text-2xl font-bold text-orange-600">{stats.total_visits}</h3>
                                <p className="text-gray-600">Total Visits</p>
                            </Card>
                        </div>
                    )}

                    {/* Upcoming Appointments */}
                    {upcoming_appointments.length > 0 && (
                        <Card className="mb-8 bg-white p-6 shadow-lg">
                            <h3 className="mb-6 flex items-center text-2xl font-bold">
                                <Calendar className="mr-3 h-6 w-6 text-blue-600" />
                                Upcoming Appointments
                            </h3>
                            <div className="space-y-4">
                                {Array.isArray(upcoming_appointments)
                                    ? upcoming_appointments.map((appointment) => (
                                          <div key={appointment.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                                              <div className="flex-1">
                                                  <h4 className="text-lg font-semibold">{appointment.type}</h4>
                                                  <p className="text-gray-600">with {appointment.specialist}</p>
                                                  <p className="text-sm text-gray-500">
                                                      {appointment.date} at {appointment.time}
                                                  </p>
                                              </div>
                                              <Badge variant={appointment.is_today ? 'default' : 'secondary'}>
                                                  {appointment.is_today ? 'Today' : appointment.status}
                                              </Badge>
                                          </div>
                                      ))
                                    : null}
                            </div>
                        </Card>
                    )}

                    {/* Recent Appointments */}
                    {recent_appointments.length > 0 && (
                        <Card className="mb-8 bg-white p-6 shadow-lg">
                            <h3 className="mb-6 flex items-center text-2xl font-bold">
                                <Clock className="mr-3 h-6 w-6 text-green-600" />
                                Recent Appointments
                            </h3>
                            <div className="space-y-4">
                                {Array.isArray(recent_appointments)
                                    ? recent_appointments.map((appointment) => (
                                          <div key={appointment.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                                              <div className="flex-1">
                                                  <h4 className="text-lg font-semibold">{appointment.type}</h4>
                                                  <p className="text-gray-600">with {appointment.specialist}</p>
                                                  <p className="text-sm text-gray-500">
                                                      {appointment.date} at {appointment.time}
                                                  </p>
                                                  <p className="text-sm text-gray-500">Price: {appointment.price}</p>
                                              </div>
                                              <div className="flex flex-col items-end space-y-2">
                                                  <Badge
                                                      variant="outline"
                                                      className={`text-${appointment.status_color}-600 border-${appointment.status_color}-600`}
                                                  >
                                                      {appointment.status}
                                                  </Badge>
                                                  <Badge variant="outline" className="text-xs">
                                                      {appointment.billing_status}
                                                  </Badge>
                                              </div>
                                          </div>
                                      ))
                                    : null}
                            </div>
                        </Card>
                    )}

                    {/* Recent Lab Orders */}
                    {recent_lab_orders.length > 0 && (
                        <Card className="mb-8 bg-white p-6 shadow-lg">
                            <h3 className="mb-6 flex items-center text-2xl font-bold">
                                <Heart className="mr-3 h-6 w-6 text-purple-600" />
                                Recent Lab Orders
                            </h3>
                            <div className="space-y-4">
                                {recent_lab_orders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-semibold">Lab Order #{order.id}</h4>
                                            <p className="text-gray-600">{order.tests.join(', ')}</p>
                                            <p className="text-sm text-gray-500">Ordered: {order.created_at}</p>
                                        </div>
                                        <Badge variant={order.status === 'Completed' ? 'default' : 'secondary'}>{order.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Recent Visits */}
                    {recent_visits.length > 0 && (
                        <Card className="mb-8 bg-white p-6 shadow-lg">
                            <h3 className="mb-6 flex items-center text-2xl font-bold">
                                <Stethoscope className="mr-3 h-6 w-6 text-orange-600" />
                                Recent Medical Visits
                            </h3>
                            <div className="space-y-4">
                                {recent_visits.map((visit) => (
                                    <div key={visit.id} className="rounded-lg bg-gray-50 p-4">
                                        <div className="mb-2 flex items-start justify-between">
                                            <h4 className="text-lg font-semibold">Visit #{visit.id}</h4>
                                            <span className="text-sm text-gray-500">{visit.visit_date}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <p>
                                                <strong>Chief Complaint:</strong> {visit.chief_complaint}
                                            </p>
                                            {visit.diagnosis && (
                                                <p>
                                                    <strong>Diagnosis:</strong> {visit.diagnosis}
                                                </p>
                                            )}
                                            {visit.treatment && (
                                                <p>
                                                    <strong>Treatment:</strong> {visit.treatment}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* No Data Message */}
                    {!patient && (
                        <Card className="mb-8 border-yellow-200 bg-yellow-50 p-8 text-center">
                            <h3 className="mb-4 text-xl font-semibold text-yellow-800">Patient Record Not Found</h3>
                            <p className="mb-6 text-yellow-700">
                                Your user account is not linked to a patient record yet. Please contact the clinic to set up your patient profile.
                            </p>
                            <Link href={route('patient.contact')}>
                                <Button className="bg-yellow-600 text-white hover:bg-yellow-700">Contact Clinic</Button>
                            </Link>
                        </Card>
                    )}

                    {/* Clinic Features & Services */}
                    <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="p-6 text-center transition-shadow hover:shadow-lg">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                <Stethoscope className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">Expert Medical Care</h3>
                            <p className="text-gray-600">
                                Our experienced doctors provide comprehensive healthcare services with the latest medical technology.
                            </p>
                        </Card>

                        <Card className="p-6 text-center transition-shadow hover:shadow-lg">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <Clock className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">Easy Online Booking</h3>
                            <p className="text-gray-600">
                                Book your appointments online 24/7. Choose your preferred doctor and time slot conveniently.
                            </p>
                        </Card>

                        <Card className="p-6 text-center transition-shadow hover:shadow-lg">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                                <Shield className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">Safe & Secure</h3>
                            <p className="text-gray-600">
                                Your health information is protected with the highest security standards and privacy protocols.
                            </p>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-12 grid gap-8 md:grid-cols-2">
                        <Card className="p-8">
                            <div className="mb-6 flex items-center">
                                <div className="mr-4 rounded-lg bg-blue-100 p-3">
                                    <Calendar className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">Book Your Appointment</h3>
                                    <p className="text-gray-600">Schedule with our specialists</p>
                                </div>
                            </div>
                            <p className="mb-6 text-gray-700">
                                Choose from our team of experienced doctors and specialists. Select your preferred date and time for a convenient
                                appointment.
                            </p>
                            <Link href={route('patient.appointments.create')}>
                                <Button className="w-full bg-blue-600 py-3 text-white hover:bg-blue-700">
                                    <Calendar className="mr-2 h-5 w-5" />
                                    Book Appointment
                                </Button>
                            </Link>
                        </Card>

                        <Card className="p-8">
                            <div className="mb-6 flex items-center">
                                <div className="mr-4 rounded-lg bg-green-100 p-3">
                                    <Clock className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">Manage Appointments</h3>
                                    <p className="text-gray-600">View and update your bookings</p>
                                </div>
                            </div>
                            <p className="mb-6 text-gray-700">
                                Check your upcoming appointments, reschedule if needed, or cancel appointments that are no longer required.
                            </p>
                            <Link href={route('patient.appointments.index')}>
                                <Button variant="outline" className="w-full py-3">
                                    <Clock className="mr-2 h-5 w-5" />
                                    View Appointments
                                </Button>
                            </Link>
                        </Card>
                    </div>

                    {/* Clinic Information */}
                    <div className="mb-12 grid gap-8 md:grid-cols-2">
                        <Card className="p-6">
                            <h3 className="mb-4 flex items-center text-2xl font-bold">
                                <MapPin className="mr-3 h-6 w-6 text-blue-600" />
                                Visit Our Clinic
                            </h3>
                            <div className="space-y-3">
                                <p className="text-gray-700">
                                    <strong>Address:</strong> St. James Clinic
                                    <br />
                                    Medical Center Building
                                    <br />
                                    Healthcare District, City
                                </p>
                                <p className="text-gray-700">
                                    <strong>Phone:</strong> (02) 123-4567
                                </p>
                                <p className="text-gray-700">
                                    <strong>Email:</strong> info@stjamesclinic.com
                                </p>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="mb-4 flex items-center text-2xl font-bold">
                                <Clock className="mr-3 h-6 w-6 text-green-600" />
                                Operating Hours
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Monday - Friday</span>
                                    <span className="font-semibold">8:00 AM - 6:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Saturday</span>
                                    <span className="font-semibold">9:00 AM - 4:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Sunday</span>
                                    <span className="font-semibold">Closed</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Why Choose Us */}
                    <Card className="p-8 text-center">
                        <h2 className="mb-6 text-3xl font-bold">Why Choose St. James Clinic?</h2>
                        <div className="grid gap-6 md:grid-cols-4">
                            <div className="flex flex-col items-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                    <Award className="h-8 w-8 text-blue-600" />
                                </div>
                                <h4 className="mb-2 font-semibold">Award-Winning</h4>
                                <p className="text-sm text-gray-600">Recognized for excellence in healthcare</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                    <Users className="h-8 w-8 text-green-600" />
                                </div>
                                <h4 className="mb-2 font-semibold">Expert Team</h4>
                                <p className="text-sm text-gray-600">Experienced medical professionals</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                                    <Heart className="h-8 w-8 text-purple-600" />
                                </div>
                                <h4 className="mb-2 font-semibold">Patient-Centered</h4>
                                <p className="text-sm text-gray-600">Your health is our priority</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                                    <Star className="h-8 w-8 text-orange-600" />
                                </div>
                                <h4 className="mb-2 font-semibold">5-Star Service</h4>
                                <p className="text-sm text-gray-600">Consistently rated excellent</p>
                            </div>
                        </div>
                    </Card>

                    {/* Call to Action */}
                    <div className="mt-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold">Ready to Book Your Appointment?</h2>
                        <p className="mb-8 text-xl text-gray-600">
                            Join thousands of satisfied patients who trust St. James Clinic for their healthcare needs.
                        </p>
                        <Link href={route('patient.appointments.create')}>
                            <Button size="lg" className="bg-blue-600 px-12 py-4 text-xl text-white hover:bg-blue-700">
                                <Calendar className="mr-3 h-6 w-6" />
                                Book Your Appointment Today
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

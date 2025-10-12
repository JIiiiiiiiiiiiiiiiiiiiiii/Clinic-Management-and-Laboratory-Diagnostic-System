import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Patient Dashboard', href: '/patient/dashboard' },
    { title: 'Contact Clinic', href: '/patient/contact' },
];

export default function PatientContact() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contact Clinic" />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-black">Contact St. James Hospital</h1>
                    <p className="text-gray-500">Get in touch with our clinic for any questions or concerns</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Contact Information */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-blue-600" />
                                    Phone Numbers
                                </CardTitle>
                                <CardDescription>
                                    Call us for appointments and inquiries
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <p className="font-medium">Main Line</p>
                                        <p className="text-gray-600">(02) 123-4567</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <p className="font-medium">Emergency</p>
                                        <p className="text-gray-600">(02) 123-4568</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <p className="font-medium">Appointments</p>
                                        <p className="text-gray-600">(02) 123-4569</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-blue-600" />
                                    Email
                                </CardTitle>
                                <CardDescription>
                                    Send us an email for non-urgent matters
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <p className="font-medium">General Inquiries</p>
                                        <p className="text-gray-600">info@stjameshospital.com</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-blue-600" />
                                    Address
                                </CardTitle>
                                <CardDescription>
                                    Visit us at our main location
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                                    <div>
                                        <p className="font-medium">St. James Hospital</p>
                                        <p className="text-gray-600">
                                            123 Healthcare Street<br />
                                            Medical District<br />
                                            Metro Manila, Philippines 1000
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Operating Hours & Quick Actions */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                    Operating Hours
                                </CardTitle>
                                <CardDescription>
                                    Our clinic hours and emergency services
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="font-medium text-sm">Monday - Friday</p>
                                        <p className="text-gray-600 text-sm">8:00 AM - 6:00 PM</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Saturday</p>
                                        <p className="text-gray-600 text-sm">8:00 AM - 2:00 PM</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Sunday</p>
                                        <p className="text-gray-600 text-sm">Emergency Only</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Emergency</p>
                                        <p className="text-gray-600 text-sm">24/7 Available</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageCircle className="h-5 w-5 text-blue-600" />
                                    Quick Actions
                                </CardTitle>
                                <CardDescription>
                                    Common tasks you can do online
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start"
                                    onClick={() => window.location.href = '/patient/appointments/create'}
                                >
                                    <Phone className="h-4 w-4 mr-2" />
                                    Book an Appointment
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start"
                                    onClick={() => window.location.href = '/patient/appointments'}
                                >
                                    <Clock className="h-4 w-4 mr-2" />
                                    View My Appointments
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start"
                                    onClick={() => window.location.href = '/patient/profile'}
                                >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Update My Profile
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Emergency Information</CardTitle>
                                <CardDescription>
                                    Important numbers for emergencies
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-red-800 mb-2">Emergency Hotline</h4>
                                    <p className="text-red-700 text-lg font-bold">(02) 123-4568</p>
                                    <p className="text-red-600 text-sm mt-1">
                                        Available 24/7 for medical emergencies
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

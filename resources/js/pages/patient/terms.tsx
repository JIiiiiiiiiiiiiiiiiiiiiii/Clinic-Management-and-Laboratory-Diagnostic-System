import React from 'react';
import { Head, Link } from '@inertiajs/react';
import SharedNavigation from '@/components/SharedNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    FileText,
    Scale,
    Shield,
    AlertCircle,
    CheckCircle,
    UserCheck,
    Calendar,
    Phone
} from 'lucide-react';

interface PatientTermsProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        created_at: string;
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

export default function PatientTerms({ 
    user, 
    patient, 
    notifications,
    unreadCount
}: PatientTermsProps) {
    const sections = [
        {
            title: "Acceptance of Terms",
            icon: FileText,
            content: [
                "By accessing and using our services, you accept and agree to be bound by these terms",
                "If you do not agree to these terms, please do not use our services",
                "We reserve the right to modify these terms at any time",
                "Continued use of our services constitutes acceptance of any changes"
            ]
        },
        {
            title: "Medical Services",
            icon: Shield,
            content: [
                "All medical services are provided by licensed healthcare professionals",
                "We strive to provide accurate and reliable medical care",
                "Patients are responsible for providing accurate medical information",
                "Emergency situations should be directed to emergency services"
            ]
        },
        {
            title: "Appointments and Cancellations",
            icon: Calendar,
            content: [
                "Appointments must be scheduled in advance",
                "Cancellations should be made at least 24 hours in advance",
                "No-show fees may apply for missed appointments",
                "We reserve the right to reschedule appointments when necessary"
            ]
        },
        {
            title: "Payment and Billing",
            icon: Scale,
            content: [
                "Payment is due at the time of service unless other arrangements are made",
                "We accept various payment methods including insurance",
                "Late payment fees may apply to overdue accounts",
                "Refunds are subject to our refund policy"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Head title="Terms of Service" />
            
            {/* Shared Navigation */}
            <SharedNavigation user={user} currentPath="/patient/terms" />
            
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-green-50 via-white to-blue-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold text-gray-900 mb-6">
                            Terms of Service
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            These terms and conditions govern your use of SJHI Industrial Clinic services. 
                            Please read them carefully before using our services.
                        </p>
                    </div>
                </div>
            </section>

            {/* Terms Content */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="prose prose-lg max-w-none">
                        <div className="mb-8">
                            <p className="text-lg text-gray-600 mb-6">
                                Welcome to SJHI Industrial Clinic. These Terms of Service ("Terms") govern your use of 
                                our website and services. By accessing or using our services, you agree to be bound by 
                                these Terms.
                            </p>
                            
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="h-6 w-6 text-yellow-600 mt-1" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-yellow-900 mb-2">Important Notice</h3>
                                        <p className="text-yellow-800">
                                            These terms are effective as of January 1, 2025. We may update these terms 
                                            from time to time, and your continued use of our services constitutes 
                                            acceptance of any changes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Terms Sections */}
                        <div className="space-y-12">
                            {sections.map((section, index) => (
                                <Card key={index} className="bg-white shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center text-xl font-bold text-gray-900">
                                            <section.icon className="h-6 w-6 text-green-600 mr-3" />
                                            {section.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {section.content.map((item, itemIndex) => (
                                                <li key={itemIndex} className="flex items-start space-x-3">
                                                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-700">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Additional Terms */}
                        <div className="mt-12 space-y-8">
                            <Card className="bg-gray-50 border-gray-200">
                                <CardContent className="p-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Patient Responsibilities</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Provide Accurate Information</h4>
                                            <p className="text-gray-600 text-sm">
                                                Patients must provide accurate and complete medical information.
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Follow Medical Advice</h4>
                                            <p className="text-gray-600 text-sm">
                                                Patients should follow the medical advice and treatment plans provided.
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Respect Staff and Facilities</h4>
                                            <p className="text-gray-600 text-sm">
                                                Patients must treat staff and other patients with respect.
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Timely Payment</h4>
                                            <p className="text-gray-600 text-sm">
                                                Patients are responsible for timely payment of services.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="p-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Limitation of Liability</h3>
                                    <p className="text-gray-700 mb-4">
                                        SJHI Industrial Clinic shall not be liable for any indirect, incidental, special, 
                                        consequential, or punitive damages, including but not limited to loss of profits, 
                                        data, or use, arising out of or relating to your use of our services.
                                    </p>
                                    <p className="text-gray-700">
                                        Our total liability to you for any damages shall not exceed the amount you paid 
                                        for the services that gave rise to the claim.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-green-50 border-green-200">
                                <CardContent className="p-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
                                    <p className="text-gray-700 mb-6">
                                        If you have any questions about these Terms of Service, please contact us:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <FileText className="h-5 w-5 text-green-600" />
                                            <span className="text-gray-700">Email: stjamesclinic413@gmail.com</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <UserCheck className="h-5 w-5 text-green-600" />
                                            <span className="text-gray-700">Address: <a href="https://maps.app.goo.gl/du9rahz164nMFuaMA" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline">View on Google Maps</a></span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Governing Law */}
                        <div className="mt-12">
                            <Card className="bg-gray-100 border-gray-300">
                                <CardContent className="p-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h3>
                                    <p className="text-gray-700">
                                        These Terms of Service shall be governed by and construed in accordance with the 
                                        laws of the Philippines. Any disputes arising from these terms shall be subject 
                                        to the exclusive jurisdiction of the courts of the Philippines.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Last Updated */}
                        <div className="mt-12 text-center">
                            <p className="text-gray-500 text-sm">
                                Last updated: January 1, 2025
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-green-600 to-green-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">Questions About Our Terms?</h2>
                    <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
                        We're here to help you understand our terms and conditions. Contact us if you need clarification.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/patient/contact">
                            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-50 px-8 py-4 text-lg">
                                <FileText className="mr-2 h-5 w-5" />
                                Contact Us
                            </Button>
                        </Link>
                        <Link href="/patient/online-appointment">
                            <Button variant="outline" size="lg" className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-green-600 px-8 py-4 text-lg backdrop-blur-sm">
                                <Calendar className="mr-2 h-5 w-5" />
                                Book Appointment
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import SharedNavigation from '@/components/SharedNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Shield,
    Eye,
    Lock,
    Database,
    UserCheck,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

interface PatientPrivacyProps {
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

export default function PatientPrivacy({ 
    user, 
    patient, 
    notifications,
    unreadCount
}: PatientPrivacyProps) {
    const sections = [
        {
            title: "Information We Collect",
            icon: Database,
            content: [
                "Personal identification information (name, email, phone number)",
                "Medical information and health records",
                "Appointment and treatment history",
                "Payment and billing information",
                "Website usage data and cookies"
            ]
        },
        {
            title: "How We Use Your Information",
            icon: UserCheck,
            content: [
                "Provide medical care and treatment",
                "Schedule and manage appointments",
                "Process payments and insurance claims",
                "Communicate with you about your health",
                "Improve our services and patient care"
            ]
        },
        {
            title: "Information Sharing",
            icon: Lock,
            content: [
                "We do not sell your personal information",
                "We may share information with your consent",
                "Information may be shared with healthcare providers",
                "Legal requirements may necessitate disclosure",
                "Emergency situations may require information sharing"
            ]
        },
        {
            title: "Data Security",
            icon: Shield,
            content: [
                "Encryption of sensitive data",
                "Secure servers and databases",
                "Regular security audits",
                "Access controls and authentication",
                "Staff training on data protection"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Head title="Privacy Policy - SJHI Industrial Clinic" />
            
            {/* Shared Navigation */}
            <SharedNavigation user={user} currentPath="/patient/privacy" />
            
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-green-50 via-white to-blue-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <Badge className="bg-green-100 text-green-800 border-green-200 mb-6">
                            Privacy Policy
                        </Badge>
                        <h1 className="text-5xl font-bold text-gray-900 mb-6">
                            Your Privacy Matters
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            At SJHI Industrial Clinic, we are committed to protecting your privacy and ensuring the security 
                            of your personal and medical information.
                        </p>
                    </div>
                </div>
            </section>

            {/* Privacy Policy Content */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="prose prose-lg max-w-none">
                        <div className="mb-8">
                            <p className="text-lg text-gray-600 mb-6">
                                This Privacy Policy describes how SJHI Industrial Clinic collects, uses, and protects your 
                                personal information when you use our services. We are committed to maintaining the 
                                confidentiality and security of your health information.
                            </p>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="h-6 w-6 text-blue-600 mt-1" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-blue-900 mb-2">Important Notice</h3>
                                        <p className="text-blue-800">
                                            This policy is effective as of January 1, 2025, and applies to all information 
                                            collected by SJHI Industrial Clinic. By using our services, you consent to the 
                                            collection and use of information as described in this policy.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Privacy Sections */}
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

                        {/* Additional Information */}
                        <div className="mt-12 space-y-8">
                            <Card className="bg-gray-50 border-gray-200">
                                <CardContent className="p-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Rights</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Access Your Information</h4>
                                            <p className="text-gray-600 text-sm">
                                                You have the right to access and review your personal and medical information.
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Request Corrections</h4>
                                            <p className="text-gray-600 text-sm">
                                                You can request corrections to any inaccurate information in your records.
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Data Portability</h4>
                                            <p className="text-gray-600 text-sm">
                                                You can request a copy of your data in a portable format.
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Withdraw Consent</h4>
                                            <p className="text-gray-600 text-sm">
                                                You can withdraw consent for certain uses of your information.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-green-50 border-green-200">
                                <CardContent className="p-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Us About Privacy</h3>
                                    <p className="text-gray-700 mb-6">
                                        If you have any questions about this Privacy Policy or how we handle your information, 
                                        please contact our Privacy Officer:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <Shield className="h-5 w-5 text-green-600" />
                                            <span className="text-gray-700">Email: privacy@sjhi.com</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Shield className="h-5 w-5 text-green-600" />
                                            <span className="text-gray-700">Phone: +63 XXX XXX XXXX</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Shield className="h-5 w-5 text-green-600" />
                                            <span className="text-gray-700">Address: SJHI Industrial Clinic, Industrial Area, Philippines</span>
                                        </div>
                                    </div>
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
                    <h2 className="text-4xl font-bold text-white mb-6">Questions About Your Privacy?</h2>
                    <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
                        We're here to help you understand how we protect your information and respect your privacy rights.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/patient/contact">
                            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-50 px-8 py-4 text-lg">
                                <Shield className="mr-2 h-5 w-5" />
                                Contact Privacy Officer
                            </Button>
                        </Link>
                        <Link href="/patient/online-appointment">
                            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 text-lg">
                                <UserCheck className="mr-2 h-5 w-5" />
                                Book Appointment
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

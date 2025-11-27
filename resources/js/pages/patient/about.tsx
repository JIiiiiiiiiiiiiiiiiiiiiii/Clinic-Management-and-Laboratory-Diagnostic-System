import React from 'react';
import { Head, Link } from '@inertiajs/react';
import SharedNavigation from '@/components/SharedNavigation';
import PublicFooter from '@/components/PublicFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Calendar, 
    Phone, 
    MapPin, 
    Clock, 
    Star, 
    CheckCircle, 
    Users, 
    Award, 
    Shield,
    Heart,
    Stethoscope,
    Microscope,
    TestTube,
    Activity,
    UserCheck,
    ArrowRight,
    Play,
    Target,
    Zap,
    Globe
} from 'lucide-react';

interface PatientAboutProps {
    user?: {
        id: number;
        name: string;
        email: string;
        role: string;
        created_at: string;
    } | null;
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        patient_no: string;
    };
    notifications?: Array<{
        id: number;
        type: string;
        title: string;
        message: string;
        read: boolean;
        created_at: string;
        data: any;
    }>;
    unreadCount?: number;
}

export default function PatientAbout({ 
    user, 
    patient, 
    notifications,
    unreadCount
}: PatientAboutProps) {
    const values = [
        {
            icon: Heart,
            title: "Patient-Centered Care",
            description: "We prioritize our patients' well-being and comfort in everything we do, ensuring personalized care for each individual."
        },
        {
            icon: Shield,
            title: "Quality & Safety",
            description: "We maintain the highest standards of medical care with rigorous safety protocols and quality assurance measures."
        },
        {
            icon: Award,
            title: "Excellence",
            description: "We strive for excellence in all our services, continuously improving and staying at the forefront of medical technology."
        },
        {
            icon: Users,
            title: "Teamwork",
            description: "Our collaborative approach ensures comprehensive care through the expertise of our multidisciplinary team."
        }
    ];

    const achievements = [
        {
            number: "15+",
            label: "Years of Excellence",
            description: "Serving the community with dedication"
        },
        {
            number: "10,000+",
            label: "Patients Served",
            description: "Trusted healthcare for thousands"
        },
        {
            number: "50+",
            label: "Medical Professionals",
            description: "Expert team of healthcare providers"
        },
        {
            number: "24/7",
            label: "Emergency Care",
            description: "Round-the-clock medical support"
        }
    ];

    const team = [
        {
            name: "Dr. Margaret Anderson",
            position: "Head of Laboratory Department",
            specialization: "Pathology & Laboratory Medicine",
            experience: "15+ years",
            education: "MD, PhD in Pathology"
        },
        {
            name: "Dr. Mark Anthony",
            position: "Senior Pathologist",
            specialization: "Clinical Pathology",
            experience: "12+ years",
            education: "MD, Board Certified Pathologist"
        },
        {
            name: "Samantha Wood",
            position: "Laboratory Technician",
            specialization: "Medical Technology",
            experience: "8+ years",
            education: "BS Medical Technology"
        }
    ];

    const certifications = [
        "ISO 15189:2012 Medical Laboratories",
        "CAP (College of American Pathologists) Accreditation",
        "CLIA (Clinical Laboratory Improvement Amendments) Certified",
        "Joint Commission Accredited",
        "ISO 9001:2015 Quality Management System"
    ];

    return (
        <div className="min-h-screen bg-white">
            <Head title="About Us" />
            
            {/* Shared Navigation */}
            <SharedNavigation user={user || undefined} currentPath="/about" notifications={notifications || []} unreadCount={unreadCount || 0} />
            
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-green-50 via-white to-blue-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold text-gray-900 mb-6">
                            Your Trusted Healthcare Partner
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            SJHI Industrial Clinic and Diagnostic Center has been serving the community for over 15 years, 
                            providing comprehensive healthcare services with state-of-the-art technology and compassionate care.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
                            <p className="text-xl text-gray-600 mb-8">
                                To provide exceptional healthcare services that improve the quality of life for our patients 
                                and the community we serve, through innovative medical technology, expert care, and 
                                compassionate service.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-4">
                                    <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Patient-Centered Approach</h3>
                                        <p className="text-gray-600">Every decision we make is guided by what's best for our patients.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Continuous Innovation</h3>
                                        <p className="text-gray-600">We embrace new technologies and methods to improve patient care.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Community Commitment</h3>
                                        <p className="text-gray-600">We're dedicated to serving our community's healthcare needs.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Target className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Vision</h3>
                                </div>
                                <p className="text-gray-700 text-center">
                                    "To be the leading healthcare provider in the region, recognized for excellence in medical care, 
                                    innovation, and patient satisfaction, while maintaining the highest standards of quality and safety."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
                        <p className="text-xl text-gray-600">
                            These fundamental principles guide everything we do at SJHI Industrial Clinic.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="p-8 text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <value.icon className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                                    <p className="text-gray-600">{value.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Achievements Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Achievements</h2>
                        <p className="text-xl text-gray-600">
                            Numbers that reflect our commitment to excellence and community service.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {achievements.map((achievement, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl font-bold text-green-600 mb-2">
                                    {achievement.number}
                                </div>
                                <div className="text-lg font-semibold text-gray-900 mb-1">
                                    {achievement.label}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {achievement.description}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Expert Team</h2>
                        <p className="text-xl text-gray-600">
                            Our dedicated healthcare professionals are committed to providing you with the best possible care.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {team.map((member, index) => (
                            <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="p-8">
                                    <div className="text-center mb-6">
                                        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                                            <UserCheck className="h-12 w-12 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                                        <p className="text-green-600 font-semibold mb-1">{member.position}</p>
                                        <p className="text-gray-600 text-sm">{member.specialization}</p>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <Award className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-gray-600">{member.experience} experience</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-gray-600">{member.education}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Certifications Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Certifications & Accreditations</h2>
                        <p className="text-xl text-gray-600">
                            We maintain the highest standards through rigorous certification and accreditation processes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certifications.map((cert, index) => (
                            <div key={index} className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-gray-900 font-medium">{cert}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technology Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">Advanced Technology & Equipment</h2>
                            <p className="text-xl text-gray-600 mb-8">
                                We employ the latest research technology and cutting-edge equipment to ensure accurate 
                                diagnoses and effective treatments for our patients.
                            </p>
                            
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Microscope className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Microscopy</h3>
                                        <p className="text-gray-600">High-resolution digital imaging for precise cellular analysis.</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <TestTube className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Automated Laboratory Systems</h3>
                                        <p className="text-gray-600">Fully automated testing systems for faster and more accurate results.</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Zap className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Assurance</h3>
                                        <p className="text-gray-600">Rigorous quality control and certification processes.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Globe className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Certified Excellence</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="text-gray-700">ISO 15189:2012 Certified</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="text-gray-700">CAP Accredited</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="text-gray-700">CLIA Certified</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="text-gray-700">Joint Commission Accredited</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-green-600 to-green-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">Experience Excellence in Healthcare</h2>
                    <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
                        Join thousands of satisfied patients who trust SJHI Industrial Clinic for their healthcare needs. 
                        Schedule your appointment today and experience the difference.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/patient/online-appointment">
                            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-50 px-8 py-4 text-lg">
                                <Calendar className="mr-2 h-5 w-5" />
                                Schedule Appointment
                            </Button>
                        </Link>
                        <Link href="/patient/contact">
                            <Button variant="outline" size="lg" className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-green-600 px-8 py-4 text-lg backdrop-blur-sm">
                                <Phone className="mr-2 h-5 w-5" />
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <PublicFooter />
        </div>
    );
}

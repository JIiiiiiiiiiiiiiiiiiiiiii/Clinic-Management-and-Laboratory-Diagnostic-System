import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SharedNavigation from '@/components/SharedNavigation';
import { 
    Calendar, 
    Clock, 
    Heart, 
    Stethoscope, 
    TestTube, 
    FileText, 
    Phone, 
    MapPin, 
    Star, 
    CheckCircle, 
    Users, 
    Shield, 
    Activity,
    ArrowRight,
    Play,
    Award,
    Target,
    Zap,
    User,
    Microscope,
    Beaker,
    Globe,
    Mail,
    MessageCircle
} from 'lucide-react';

interface PatientHomeProps {
    user?: {
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
    stats?: {
        total_appointments: number;
        upcoming_appointments: number;
        completed_appointments: number;
        pending_lab_results: number;
    };
    recent_appointments?: Array<{
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
    upcoming_appointments?: Array<{
        id: number;
        type: string;
        specialist: string;
        date: string;
        time: string;
        status: string;
        is_today: boolean;
        is_upcoming: boolean;
    }>;
    recent_lab_orders?: Array<{
        id: number;
        created_at: string;
        tests: string[];
        has_results: boolean;
        status: string;
    }>;
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

export default function PatientHome({ 
    user, 
    patient, 
    stats, 
    recent_appointments, 
    upcoming_appointments, 
    recent_lab_orders, 
    notifications,
    unreadCount
}: PatientHomeProps) {
    const isLoggedIn = !!user;

    const testimonials = [
        {
            name: "Ethan Shaw",
            role: "Patient",
            rating: 5,
            text: "The doctors are knowledgeable and caring. I always feel comfortable during my visits. The staff is professional and the facilities are top-notch."
        },
        {
            name: "Maria Eve",
            role: "Lawyer",
            rating: 5,
            text: "Excellent service and professional staff. The clinic provides comprehensive healthcare services with modern equipment and facilities."
        },
        {
            name: "Liam Bower",
            role: "Mechanic",
            rating: 5,
            text: "Great experience from start to finish. The medical team is thorough and the results are always accurate and delivered on time."
        }
    ];

    const services = [
        {
            icon: TestTube,
            title: "Pathology Testing",
            description: "Comprehensive pathology testing with advanced laboratory equipment and expert analysis.",
            color: "green"
        },
        {
            icon: Microscope,
            title: "Mineral Assay",
            description: "Precise mineral analysis and testing for various industrial and medical applications.",
            color: "blue"
        },
        {
            icon: Activity,
            title: "Pharmaceutical Research",
            description: "Cutting-edge pharmaceutical research and development services.",
            color: "purple"
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Head title="Home" />
            
            {/* Shared Navigation */}
            <SharedNavigation user={user} currentPath="/" notifications={notifications} unreadCount={unreadCount} />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-green-50 via-white to-blue-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                    Welcome to SJHI Clinic
                                </Badge>
                                <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                                    We'll Ensure You Always Get The Best Result.
                                </h1>
                                <p className="text-xl text-gray-600 leading-relaxed">
                                    SJHI Industrial Clinic and Diagnostic Center provides comprehensive healthcare services with state-of-the-art equipment, qualified medical professionals, and a commitment to excellence in patient care.
                                </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/patient/online-appointment">
                                    <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
                                        <Calendar className="mr-2 h-5 w-5" />
                                        Make An Appointment
                                    </Button>
                                </Link>
                                <Link href="/patient/about">
                                    <Button variant="outline" size="lg" className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 text-lg">
                                        Learn More
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="bg-white rounded-2xl shadow-2xl p-8">
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Stethoscope className="h-8 w-8 text-green-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Lab Certification</h3>
                                        <p className="text-gray-600">Certified by international standards</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <h4 className="font-semibold text-gray-900">Our Main Service</h4>
                                            <p className="text-sm text-gray-600 mt-1">Comprehensive healthcare solutions</p>
                                        </div>
                                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <h4 className="font-semibold text-gray-900">Our Facilities</h4>
                                            <p className="text-sm text-gray-600 mt-1">Modern equipment and technology</p>
                                        </div>
                                    </div>

                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-semibold text-gray-900">Our Location</h4>
                                        <p className="text-sm text-gray-600 mt-1 mb-2">
                                            SJHI Industrial Clinic and Diagnostic Center<br />
                                            Cabuyao City, Laguna
                                        </p>
                                        <a 
                                            href="https://maps.app.goo.gl/fWUa7BTJs6nW3Dvx6" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm text-green-600 hover:text-green-700 underline"
                                        >
                                            View on Google Maps
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">4.7</div>
                            <div className="text-lg font-semibold text-gray-900 mb-1">of 5</div>
                            <div className="text-sm text-gray-600">Patient Rating</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">1860</div>
                            <div className="text-lg font-semibold text-gray-900 mb-1">Reviews</div>
                            <div className="text-sm text-gray-600">Happy Patients</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">4.8</div>
                            <div className="text-lg font-semibold text-gray-900 mb-1">of 5</div>
                            <div className="text-sm text-gray-600">Service Quality</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">4.6</div>
                            <div className="text-lg font-semibold text-gray-900 mb-1">of 5</div>
                            <div className="text-sm text-gray-600">Staff Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Expertise</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            We provide comprehensive healthcare services with the latest technology and expert medical professionals.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="p-8 text-center">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                                        service.color === 'green' ? 'bg-green-100' :
                                        service.color === 'blue' ? 'bg-blue-100' : 'bg-purple-100'
                                    }`}>
                                        <service.icon className={`h-8 w-8 ${
                                            service.color === 'green' ? 'text-green-600' :
                                            service.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
                                        }`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                                    <p className="text-gray-600 mb-6">{service.description}</p>
                                    <Link href="/patient/services">
                                        <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                                            Learn More
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Patient Dashboard Section - Only for logged in users */}
            {isLoggedIn && stats && (
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Health Dashboard</h2>
                            <p className="text-xl text-gray-600">Track your appointments and health records</p>
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

                        {/* Quick Actions for logged in users */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
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

                            <div className="lg:col-span-2">
                                {upcoming_appointments && upcoming_appointments.length > 0 ? (
                                    <Card className="bg-white shadow-lg border-0 rounded-xl">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                                                <Calendar className="h-5 w-5 text-green-600" />
                                                Upcoming Appointments
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
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
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card className="bg-white shadow-lg border-0 rounded-xl">
                                        <CardContent className="p-8 text-center">
                                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Appointments</h3>
                                            <p className="text-gray-600 mb-4">Book your first appointment to get started</p>
                                            <Link href="/patient/online-appointment">
                                                <Button className="bg-green-600 hover:bg-green-700 text-white">
                                                    <Calendar className="mr-2 h-4 w-4" />
                                                    Book Appointment
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Testimonials Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">What People Say About Us</h2>
                        <p className="text-xl text-gray-600">
                            Hear from our satisfied patients about their experience with SJHI Industrial Clinic.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <Card key={index} className="bg-white shadow-lg">
                                <CardContent className="p-6">
                                    <div className="flex items-center mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                        ))}
                                    </div>
                                    <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                            <User className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                            <p className="text-sm text-gray-600">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link href="/patient/testimonials">
                            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                                View All Testimonials
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-green-600 to-green-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">Get One Step Ahead Of Disease</h2>
                    <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
                        Don't wait for symptoms to appear. Regular health checkups and preventive care can help you maintain optimal health and catch potential issues early.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/patient/online-appointment">
                            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-50 px-8 py-4 text-lg">
                                <Calendar className="mr-2 h-5 w-5" />
                                Make An Appointment
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
            <footer className="bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Company Info */}
                        <div className="lg:col-span-1">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                    <Stethoscope className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xl font-bold">SJHI Clinic</span>
                            </div>
                            <p className="text-gray-300 mb-4">
                                SJHI Industrial Clinic and Diagnostic Center - Your trusted healthcare partner in the Philippines.
                            </p>
                            <div className="flex space-x-4">
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                    <Heart className="h-4 w-4" />
                                </div>
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                    <Shield className="h-4 w-4" />
                                </div>
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                    <Users className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        {/* Our Main Services */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Our Main Services</h3>
                            <ul className="space-y-2">
                                <li><Link href="/patient/services" className="text-gray-300 hover:text-green-400 transition-colors">Sample Preparations</Link></li>
                                <li><Link href="/patient/services" className="text-gray-300 hover:text-green-400 transition-colors">Healthcare Labs</Link></li>
                                <li><Link href="/patient/services" className="text-gray-300 hover:text-green-400 transition-colors">Advanced Microscopy</Link></li>
                                <li><Link href="/patient/services" className="text-gray-300 hover:text-green-400 transition-colors">Chemical Research</Link></li>
                                <li><Link href="/patient/services" className="text-gray-300 hover:text-green-400 transition-colors">Pathology Testing</Link></li>
                            </ul>
                        </div>

                        {/* Useful Links */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Useful Links</h3>
                            <ul className="space-y-2">
                                <li><Link href="/patient/about" className="text-gray-300 hover:text-green-400 transition-colors">About Our Clinic</Link></li>
                                <li><Link href="/login" className="text-gray-300 hover:text-green-400 transition-colors">Patient Portal</Link></li>
                                <li><Link href="/patient/about" className="text-gray-300 hover:text-green-400 transition-colors">Meet Our Team</Link></li>
                                <li><Link href="/patient/services" className="text-gray-300 hover:text-green-400 transition-colors">Our Services</Link></li>
                                <li><Link href="/patient/testimonials" className="text-gray-300 hover:text-green-400 transition-colors">Testimonials</Link></li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
                            <div className="space-y-3">
                                <div className="flex items-start space-x-3">
                                    <MapPin className="h-5 w-5 text-green-400 mt-0.5" />
                                    <div>
                                        <p className="text-gray-300">SJHI Industrial Clinic and Diagnostic Center</p>
                                        <p className="text-gray-300">Cabuyao City, Laguna</p>
                                        <a 
                                            href="https://maps.app.goo.gl/fWUa7BTJs6nW3Dvx6" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-gray-300 hover:text-green-400 transition-colors underline"
                                        >
                                            View on Google Maps
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Phone className="h-5 w-5 text-green-400 mt-0.5" />
                                    <div className="text-gray-300 space-y-1">
                                        <a href="tel:+639338256214" className="hover:text-green-400 transition-colors block">0933 825 6214</a>
                                        <a href="tel:+63285844533" className="hover:text-green-400 transition-colors block">(02) 8584 4533</a>
                                        <a href="tel:+63495341254" className="hover:text-green-400 transition-colors block">(049) 534 1254</a>
                                        <a href="tel:+63495020058" className="hover:text-green-400 transition-colors block">(049) 502-0058</a>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Mail className="h-5 w-5 text-green-400" />
                                    <a 
                                        href="mailto:stjamesclinic413@gmail.com" 
                                        className="text-gray-300 hover:text-green-400 transition-colors"
                                    >
                                        stjamesclinic413@gmail.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-gray-800 mt-8 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <p className="text-gray-400 text-sm">
                                Copyright © 2025 SJHI Industrial Clinic | Powered by SJHI Clinic
                            </p>
                            <div className="flex space-x-6 mt-4 md:mt-0">
                                <Link href="/patient/privacy" className="text-gray-400 hover:text-green-400 text-sm">
                                    Privacy Policy
                                </Link>
                                <Link href="/patient/terms" className="text-gray-400 hover:text-green-400 text-sm">
                                    Terms of Service
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

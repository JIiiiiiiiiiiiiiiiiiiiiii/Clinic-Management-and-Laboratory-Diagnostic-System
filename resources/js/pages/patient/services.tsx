import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SharedNavigation from '@/components/SharedNavigation';
import { 
    Heart, 
    TestTube, 
    Activity, 
    Eye, 
    Brain, 
    Bone, 
    Baby, 
    Shield, 
    Clock, 
    Star, 
    CheckCircle, 
    ArrowRight,
    Stethoscope,
    Calendar,
    Phone,
    MapPin,
    Award,
    Users,
    Target,
    Zap
} from 'lucide-react';

interface PatientServicesProps {
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

export default function PatientServices({ 
    user, 
    patient, 
    notifications,
    unreadCount
}: PatientServicesProps) {
    const services = [
        {
            id: 1,
            name: "General Consultation",
            description: "Comprehensive health assessment and medical consultation with our experienced doctors.",
            icon: Stethoscope,
            price: "₱300",
            duration: "30-45 min",
            features: ["Health Assessment", "Medical Consultation", "Prescription", "Follow-up Planning"],
            color: "green"
        },
        {
            id: 2,
            name: "Laboratory Tests",
            description: "Complete range of diagnostic tests including blood work, urinalysis, and specialized tests.",
            icon: TestTube,
            price: "₱150-500",
            duration: "15-30 min",
            features: ["Blood Tests", "Urinalysis", "Fecalysis", "Specialized Tests"],
            color: "blue"
        },
        {
            id: 3,
            name: "Diagnostic Imaging",
            description: "Advanced imaging services including X-ray, ultrasound, and other diagnostic procedures.",
            icon: Activity,
            price: "₱800-1200",
            duration: "20-60 min",
            features: ["X-Ray", "Ultrasound", "ECG", "Other Imaging"],
            color: "purple"
        },
        {
            id: 4,
            name: "Cardiology Services",
            description: "Specialized heart and cardiovascular health services with expert cardiologists.",
            icon: Heart,
            price: "₱500-800",
            duration: "45-60 min",
            features: ["Heart Assessment", "ECG", "Echocardiogram", "Cardiac Consultation"],
            color: "red"
        },
        {
            id: 5,
            name: "Pediatric Care",
            description: "Comprehensive healthcare services for children and adolescents.",
            icon: Baby,
            price: "₱300-500",
            duration: "30-45 min",
            features: ["Child Health Check", "Vaccination", "Growth Monitoring", "Parental Guidance"],
            color: "pink"
        },
        {
            id: 6,
            name: "Emergency Services",
            description: "24/7 emergency medical care for urgent health situations.",
            icon: Shield,
            price: "₱500+",
            duration: "As needed",
            features: ["Emergency Care", "Trauma Treatment", "Critical Care", "24/7 Availability"],
            color: "orange"
        }
    ];

    const specialties = [
        { name: "Internal Medicine", icon: Heart, description: "Adult health and chronic disease management" },
        { name: "Pediatrics", icon: Baby, description: "Child and adolescent healthcare" },
        { name: "Cardiology", icon: Heart, description: "Heart and cardiovascular health" },
        { name: "Neurology", icon: Brain, description: "Brain and nervous system disorders" },
        { name: "Orthopedics", icon: Bone, description: "Bone, joint, and muscle health" },
        { name: "Ophthalmology", icon: Eye, description: "Eye health and vision care" }
    ];

    const getColorClasses = (color: string) => {
        const colorMap = {
            green: "bg-green-50 border-green-200 text-green-700",
            blue: "bg-blue-50 border-blue-200 text-blue-700",
            purple: "bg-purple-50 border-purple-200 text-purple-700",
            red: "bg-red-50 border-red-200 text-red-700",
            pink: "bg-pink-50 border-pink-200 text-pink-700",
            orange: "bg-orange-50 border-orange-200 text-orange-700"
        };
        return colorMap[color as keyof typeof colorMap] || colorMap.green;
    };

    const getIconColorClasses = (color: string) => {
        const colorMap = {
            green: "bg-green-100 text-green-600",
            blue: "bg-blue-100 text-blue-600",
            purple: "bg-purple-100 text-purple-600",
            red: "bg-red-100 text-red-600",
            pink: "bg-pink-100 text-pink-600",
            orange: "bg-orange-100 text-orange-600"
        };
        return colorMap[color as keyof typeof colorMap] || colorMap.green;
    };

    return (
        <div className="min-h-screen bg-white">
            <Head title="Our Services - SJHI Industrial Clinic" />
            
            {/* Shared Navigation */}
            <SharedNavigation user={user} currentPath="/patient/services" />
            
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Our Main Services
                        </h1>
                        <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
                            Comprehensive healthcare services designed to meet all your medical needs 
                            with the highest standards of care and expertise.
                        </p>
                    </div>
                </div>
            </div>

            {/* Services Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <Card key={service.id} className={`${getColorClasses(service.color)} shadow-lg border-0 rounded-xl hover:shadow-xl transition-shadow`}>
                            <CardHeader>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-lg ${getIconColorClasses(service.color)}`}>
                                        <service.icon className="h-6 w-6" />
                                    </div>
                                    <Badge className={`${getColorClasses(service.color)} border-0`}>
                                        {service.price}
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                                    {service.name}
                                </CardTitle>
                                <p className="text-gray-600 text-sm">
                                    {service.description}
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock className="h-4 w-4" />
                                        <span>Duration: {service.duration}</span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-gray-900 text-sm">What's Included:</h4>
                                        <ul className="space-y-1">
                                            {service.features.map((feature, index) => (
                                                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <Link href="/patient/online-appointment">
                                        <Button className={`w-full ${getColorClasses(service.color)} border-0 hover:opacity-90`}>
                                            Book This Service
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Medical Specialties */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Medical Specialties</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Our team of specialized medical professionals provides expert care 
                            across various medical disciplines.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {specialties.map((specialty, index) => (
                            <Card key={index} className="bg-white shadow-lg border-0 rounded-xl hover:shadow-xl transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-green-100 rounded-lg">
                                            <specialty.icon className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {specialty.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {specialty.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Why Choose Us */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose St. James Hospital</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        We employ the latest research technology and maintain the highest standards 
                        of healthcare excellence.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="text-center">
                        <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Shield className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">High Quality Lab</h3>
                        <p className="text-gray-600 text-sm">State-of-the-art laboratory equipment and certified processes</p>
                    </div>
                    
                    <div className="text-center">
                        <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Award className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unmatched Expertise</h3>
                        <p className="text-gray-600 text-sm">Experienced medical professionals with specialized training</p>
                    </div>
                    
                    <div className="text-center">
                        <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Target className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Precise Results</h3>
                        <p className="text-gray-600 text-sm">Accurate diagnostics and reliable test results</p>
                    </div>
                    
                    <div className="text-center">
                        <div className="p-4 bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Users className="h-8 w-8 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Qualified Staff</h3>
                        <p className="text-gray-600 text-sm">Licensed and certified healthcare professionals</p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Book Your Appointment?</h2>
                    <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
                        Take the first step towards better health. Our expert medical team is ready 
                        to provide you with the care you deserve.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/patient/online-appointment">
                            <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 px-8 py-4 text-lg font-semibold">
                                <Calendar className="mr-2 h-6 w-6" />
                                Book Appointment
                            </Button>
                        </Link>
                        <Link href="/patient/contact">
                            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 text-lg font-semibold">
                                <Phone className="mr-2 h-6 w-6" />
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <MapPin className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Address</h3>
                            <p className="text-gray-600">123 Medical Center St.<br />Healthcare District<br />City, State 12345</p>
                        </div>
                        
                        <div className="text-center">
                            <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Phone className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Call Us</h3>
                            <p className="text-gray-600">+1 123 456 7890<br />Emergency: +1 123 456 7891<br />24/7 Available</p>
                        </div>
                        
                        <div className="text-center">
                            <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Clock className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hours</h3>
                            <p className="text-gray-600">Mon-Fri: 8AM-5PM<br />Sat: 8AM-12PM<br />Sun: Emergency Only</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

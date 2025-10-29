import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SharedNavigation from '@/components/SharedNavigation';
import { 
    Phone, 
    Mail, 
    MapPin, 
    Clock, 
    Send, 
    MessageCircle, 
    Calendar,
    User,
    AlertCircle,
    CheckCircle,
    Star,
    Award,
    Shield,
    Heart
} from 'lucide-react';
import { useState } from 'react';

interface PatientContactProps {
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

export default function PatientContact({ 
    user, 
    patient, 
    notifications,
    unreadCount
}: PatientContactProps) {
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: '',
        subject: '',
        message: '',
        priority: 'normal'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/patient/contact', {
            onSuccess: () => {
                setIsSubmitted(true);
            }
        });
    };

    const contactInfo = [
        {
            icon: MapPin,
            title: "Address",
            details: [
                "SJHI Industrial Clinic and Diagnostic Center",
                "Industrial Area, Philippines",
                "Coordinates: 14.23902171672204, 121.136267776227"
            ],
            color: "green"
        },
        {
            icon: Phone,
            title: "Phone",
            details: [
                "Main: +63 XXX XXX XXXX",
                "Emergency: +63 XXX XXX XXXX",
                "24/7 Available"
            ],
            color: "blue"
        },
        {
            icon: Mail,
            title: "Email",
            details: [
                "info@sjhi.com",
                "appointments@sjhi.com",
                "emergency@sjhi.com"
            ],
            color: "purple"
        },
        {
            icon: Clock,
            title: "Hours",
            details: [
                "Monday - Friday: 8:00 AM - 5:00 PM",
                "Saturday: 8:00 AM - 12:00 PM",
                "Sunday: Emergency Only"
            ],
            color: "orange"
        }
    ];

    const getColorClasses = (color: string) => {
        const colorMap = {
            green: "bg-green-50 border-green-200 text-green-700",
            blue: "bg-blue-50 border-blue-200 text-blue-700",
            purple: "bg-purple-50 border-purple-200 text-purple-700",
            orange: "bg-orange-50 border-orange-200 text-orange-700"
        };
        return colorMap[color as keyof typeof colorMap] || colorMap.green;
    };

    const getIconColorClasses = (color: string) => {
        const colorMap = {
            green: "bg-green-100 text-green-600",
            blue: "bg-blue-100 text-blue-600",
            purple: "bg-purple-100 text-purple-600",
            orange: "bg-orange-100 text-orange-600"
        };
        return colorMap[color as keyof typeof colorMap] || colorMap.green;
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-white">
                <Head title="Contact Us - Message Sent" />
                
                {/* Shared Navigation */}
                <SharedNavigation user={user} currentPath="/patient/contact" notifications={notifications} unreadCount={unreadCount} />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-8 text-center">
                            <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-green-900 mb-4">Message Sent Successfully!</h1>
                            <p className="text-lg text-green-700 mb-6">
                                Thank you for contacting us. We have received your message and will get back to you within 24 hours.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button 
                                    onClick={() => setIsSubmitted(false)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    Send Another Message
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => window.location.href = '/patient/dashboard'}
                                    className="border-green-300 text-green-700 hover:bg-green-50"
                                >
                                    Back to Dashboard
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Head title="Contact Us - SJHI Industrial Clinic" />
            
            {/* Shared Navigation */}
            <SharedNavigation user={user} currentPath="/patient/contact" />
            
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Contact Us
                        </h1>
                        <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
                            We're here to help. Get in touch with our team for any questions, 
                            concerns, or to schedule your appointment.
                        </p>
                    </div>
                </div>
            </div>

            {/* Contact Information Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {contactInfo.map((info, index) => (
                        <Card key={index} className={`${getColorClasses(info.color)} shadow-lg border-0 rounded-xl`}>
                            <CardContent className="p-6 text-center">
                                <div className={`p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center ${getIconColorClasses(info.color)}`}>
                                    <info.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">{info.title}</h3>
                                <div className="space-y-1">
                                    {info.details.map((detail, idx) => (
                                        <p key={idx} className="text-sm text-gray-600">{detail}</p>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Contact Form and Map */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <Card className="bg-white shadow-lg border-0 rounded-xl">
                            <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                                <MessageCircle className="h-6 w-6 text-green-600" />
                                Send us a Message
                                </CardTitle>
                            <p className="text-gray-600">
                                Have a question or need assistance? Fill out the form below and we'll get back to you soon.
                            </p>
                            </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                                            Full Name *
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="mt-1"
                                            required
                                        />
                                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                            Email Address *
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="mt-1"
                                            required
                                        />
                                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="mt-1"
                                        />
                                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="priority" className="text-sm font-semibold text-gray-700">
                                            Priority Level
                                        </Label>
                                        <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low - General Inquiry</SelectItem>
                                                <SelectItem value="normal">Normal - Standard Request</SelectItem>
                                                <SelectItem value="high">High - Urgent Matter</SelectItem>
                                                <SelectItem value="emergency">Emergency - Critical Issue</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="subject" className="text-sm font-semibold text-gray-700">
                                        Subject *
                                    </Label>
                                    <Input
                                        id="subject"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        className="mt-1"
                                        placeholder="What is this about?"
                                        required
                                    />
                                    {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="message" className="text-sm font-semibold text-gray-700">
                                        Message *
                                    </Label>
                                    <Textarea
                                        id="message"
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        className="mt-1 min-h-[120px]"
                                        placeholder="Please provide details about your inquiry..."
                                        required
                                    />
                                    {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                                </div>

                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                                >
                                    {processing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Sending Message...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Send Message
                                        </>
                                    )}
                                </Button>
                            </form>
                            </CardContent>
                        </Card>

                    {/* Map and Additional Info */}
                    <div className="space-y-8">
                        {/* Map Placeholder */}
                        <Card className="bg-white shadow-lg border-0 rounded-xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                                    <MapPin className="h-5 w-5 text-green-600" />
                                    Our Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg overflow-hidden">
                                    <iframe 
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241.70270924686233!2d121.136267776227!3d14.23902171672204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bd6267d38f3177%3A0x814b872d7fd6aa5a!2sSJHI%20Industrial%20Clinic%20and%20Diagnostic%20Center!5e0!3m2!1sen!2sph!4v1761354844143!5m2!1sen!2sph" 
                                        width="100%" 
                                        height="300" 
                                        style={{border: 0}} 
                                        allowFullScreen={true} 
                                        loading="lazy" 
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="SJHI Industrial Clinic and Diagnostic Center Location"
                                    ></iframe>
                                    </div>
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-600">
                                        <MapPin className="h-4 w-4 inline mr-1" />
                                        SJHI Industrial Clinic and Diagnostic Center
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Contact Options */}
                        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-green-900">
                                    <Phone className="h-5 w-5" />
                                    Quick Contact
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-200 rounded-lg">
                                        <Phone className="h-4 w-4 text-green-700" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-green-900">Call Us</p>
                                        <p className="text-sm text-green-700">+1 123 456 7890</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-200 rounded-lg">
                                        <Mail className="h-4 w-4 text-green-700" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-green-900">Email Us</p>
                                        <p className="text-sm text-green-700">info@stjameshospital.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-200 rounded-lg">
                                        <Calendar className="h-4 w-4 text-green-700" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-green-900">Book Online</p>
                                        <p className="text-sm text-green-700">Schedule your appointment</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 border-t border-red-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="bg-red-50 border-red-200">
                        <CardContent className="p-8 text-center">
                            <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-red-900 mb-4">Emergency Contact</h2>
                            <p className="text-lg text-red-700 mb-6">
                                For medical emergencies, please call our emergency line immediately or visit the nearest emergency room.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3">
                                    <Phone className="mr-2 h-5 w-5" />
                                    Emergency: +1 123 456 7891
                                </Button>
                                <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50 px-8 py-3">
                                    <Heart className="mr-2 h-5 w-5" />
                                    Call 911
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Testimonials */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Patients Say</h2>
                        <p className="text-lg text-gray-600">
                            Don't just take our word for it - hear from our satisfied patients.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="bg-white shadow-lg border-0 rounded-xl">
                            <CardContent className="p-6">
                                <div className="flex items-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-4">
                                    "Excellent service and care. The staff is professional and the facilities are top-notch."
                                </p>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                        <User className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Sarah Johnson</p>
                                        <p className="text-sm text-gray-500">Patient</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white shadow-lg border-0 rounded-xl">
                            <CardContent className="p-6">
                                <div className="flex items-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-4">
                                    "Quick and efficient service. The online booking system makes it so convenient."
                                </p>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                        <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Michael Chen</p>
                                        <p className="text-sm text-gray-500">Patient</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white shadow-lg border-0 rounded-xl">
                            <CardContent className="p-6">
                                <div className="flex items-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-4">
                                    "The doctors are knowledgeable and caring. I always feel comfortable during my visits."
                                </p>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                        <User className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Emily Rodriguez</p>
                                        <p className="text-sm text-gray-500">Patient</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
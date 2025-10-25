import React from 'react';
import { Head, Link } from '@inertiajs/react';
import SharedNavigation from '@/components/SharedNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    Globe,
    Quote,
    ThumbsUp,
    MessageCircle
} from 'lucide-react';

interface PatientTestimonialsProps {
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

export default function PatientTestimonials({ 
    user, 
    patient, 
    notifications,
    unreadCount
}: PatientTestimonialsProps) {
    const testimonials = [
        {
            name: "Ethan Shaw",
            role: "Patient",
            rating: 5,
            text: "The doctors are knowledgeable and caring. I always feel comfortable during my visits. The staff is professional and the facilities are top-notch. I highly recommend SJHI Clinic for anyone looking for quality healthcare.",
            service: "General Health Check",
            date: "December 2024"
        },
        {
            name: "Maria Eve",
            role: "Lawyer",
            rating: 5,
            text: "Excellent service and professional staff. The clinic provides comprehensive healthcare services with modern equipment and facilities. The results were delivered on time and the consultation was very thorough.",
            service: "Comprehensive Health Package",
            date: "November 2024"
        },
        {
            name: "Liam Bower",
            role: "Mechanic",
            rating: 5,
            text: "Great experience from start to finish. The medical team is thorough and the results are always accurate and delivered on time. The staff is friendly and the environment is clean and comfortable.",
            service: "Laboratory Testing",
            date: "October 2024"
        },
        {
            name: "Nicky",
            role: "Dancer",
            rating: 5,
            text: "Outstanding healthcare services. The clinic maintains high standards and provides excellent patient care with a personal touch. I've been coming here for years and always receive excellent service.",
            service: "Regular Check-ups",
            date: "September 2024"
        },
        {
            name: "Dr. Sarah Johnson",
            role: "Medical Professional",
            rating: 5,
            text: "As a medical professional myself, I can attest to the high quality of services at SJHI Clinic. The laboratory results are accurate, the equipment is state-of-the-art, and the staff is highly competent.",
            service: "Professional Consultation",
            date: "August 2024"
        },
        {
            name: "Michael Chen",
            role: "Business Owner",
            rating: 5,
            text: "The executive health package was comprehensive and well-organized. The staff was professional and the facilities were excellent. I would definitely recommend this clinic to anyone looking for quality healthcare.",
            service: "Executive Health Package",
            date: "July 2024"
        }
    ];

    const stats = [
        {
            number: "4.7",
            label: "Average Rating",
            description: "Based on 1,860+ reviews"
        },
        {
            number: "98%",
            label: "Patient Satisfaction",
            description: "Would recommend to others"
        },
        {
            number: "24/7",
            label: "Emergency Support",
            description: "Round-the-clock care"
        },
        {
            number: "15+",
            label: "Years Experience",
            description: "Serving the community"
        }
    ];

    const featuredTestimonials = [
        {
            name: "Alex Hobbs",
            role: "Founder, CEO of TechCorp",
            rating: 5,
            text: "SJHI Industrial Clinic has been our trusted healthcare partner for over 5 years. Their commitment to excellence and patient care is unmatched. The laboratory services are top-notch and the results are always accurate and timely.",
            service: "Corporate Health Program"
        },
        {
            name: "Dr. Margaret Anderson",
            role: "Medical Director, City Hospital",
            rating: 5,
            text: "As a medical professional, I can confidently say that SJHI Clinic maintains the highest standards of healthcare delivery. Their laboratory services are reliable, their staff is competent, and their facilities are world-class.",
            service: "Professional Referral"
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Head title="Testimonials - SJHI Industrial Clinic" />
            
            {/* Shared Navigation */}
            <SharedNavigation user={user} currentPath="/patient/testimonials" />
            
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-green-50 via-white to-blue-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <Badge className="bg-green-100 text-green-800 border-green-200 mb-6">
                            Patient Testimonials
                        </Badge>
                        <h1 className="text-5xl font-bold text-gray-900 mb-6">
                            What Our Patients Say
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Hear from our satisfied patients about their experience with SJHI Industrial Clinic. 
                            Their stories reflect our commitment to excellence in healthcare.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl font-bold text-green-600 mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-lg font-semibold text-gray-900 mb-1">
                                    {stat.label}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {stat.description}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Testimonials */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Testimonials</h2>
                        <p className="text-xl text-gray-600">
                            Special recognition from our valued patients and partners.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {featuredTestimonials.map((testimonial, index) => (
                            <Card key={index} className="bg-white shadow-lg">
                                <CardContent className="p-8">
                                    <div className="flex items-start space-x-4 mb-6">
                                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                            <UserCheck className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">{testimonial.name}</h3>
                                            <p className="text-green-600 font-semibold mb-2">{testimonial.role}</p>
                                            <div className="flex items-center space-x-1">
                                                {[...Array(testimonial.rating)].map((_, i) => (
                                                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <blockquote className="text-gray-700 italic mb-4 text-lg">
                                        "{testimonial.text}"
                                    </blockquote>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">{testimonial.service}</span>
                                        <Quote className="h-6 w-6 text-green-600" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* All Testimonials */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Patient Reviews</h2>
                        <p className="text-xl text-gray-600">
                            Real experiences from our patients across various services.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                        ))}
                                    </div>
                                    
                                    <blockquote className="text-gray-700 italic mb-4">
                                        "{testimonial.text}"
                                    </blockquote>
                                    
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <UserCheck className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                                <p className="text-sm text-gray-600">{testimonial.role}</p>
                                            </div>
                                        </div>
                                        <Quote className="h-5 w-5 text-green-600" />
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span>{testimonial.service}</span>
                                        <span>{testimonial.date}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                            Load More Reviews
                        </Button>
                    </div>
                </div>
            </section>

            {/* Rating Breakdown */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Rating Breakdown</h2>
                            <p className="text-xl text-gray-600 mb-8">
                                Detailed breakdown of our patient satisfaction ratings across different service areas.
                            </p>
                            
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700">Overall Experience</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div className="bg-green-600 h-2 rounded-full" style={{width: '94%'}}></div>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">4.7/5</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700">Staff Professionalism</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div className="bg-green-600 h-2 rounded-full" style={{width: '96%'}}></div>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">4.8/5</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700">Facility Quality</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div className="bg-green-600 h-2 rounded-full" style={{width: '92%'}}></div>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">4.6/5</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700">Wait Times</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div className="bg-green-600 h-2 rounded-full" style={{width: '90%'}}></div>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">4.5/5</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700">Value for Money</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div className="bg-green-600 h-2 rounded-full" style={{width: '88%'}}></div>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">4.4/5</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="bg-white rounded-2xl shadow-2xl p-8">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ThumbsUp className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Patient Satisfaction</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-green-600 mb-2">98%</div>
                                        <div className="text-gray-600">Would recommend to others</div>
                                    </div>
                                    
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-green-600 mb-2">4.7/5</div>
                                        <div className="text-gray-600">Average rating</div>
                                    </div>
                                    
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-green-600 mb-2">1,860+</div>
                                        <div className="text-gray-600">Patient reviews</div>
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
                    <h2 className="text-4xl font-bold text-white mb-6">Join Our Satisfied Patients</h2>
                    <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
                        Experience the same high-quality healthcare that our patients rave about. 
                        Schedule your appointment today and become part of our success story.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/patient/online-appointment">
                            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-50 px-8 py-4 text-lg">
                                <Calendar className="mr-2 h-5 w-5" />
                                Book Appointment
                            </Button>
                        </Link>
                        <Link href="/patient/contact">
                            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 text-lg">
                                <MessageCircle className="mr-2 h-5 w-5" />
                                Share Your Experience
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

import { Link } from '@inertiajs/react';
import { Stethoscope, Heart, Shield, Users, MapPin, Mail, Phone } from 'lucide-react';

export default function PublicFooter() {
    return (
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
                            <li><Link href="/services" className="text-gray-300 hover:text-green-400 transition-colors">Sample Preparations</Link></li>
                            <li><Link href="/services" className="text-gray-300 hover:text-green-400 transition-colors">Healthcare Labs</Link></li>
                            <li><Link href="/services" className="text-gray-300 hover:text-green-400 transition-colors">Advanced Microscopy</Link></li>
                            <li><Link href="/services" className="text-gray-300 hover:text-green-400 transition-colors">Chemical Research</Link></li>
                            <li><Link href="/services" className="text-gray-300 hover:text-green-400 transition-colors">Pathology Testing</Link></li>
                        </ul>
                    </div>

                    {/* Useful Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Useful Links</h3>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="text-gray-300 hover:text-green-400 transition-colors">About Our Clinic</Link></li>
                            <li><Link href="/login" className="text-gray-300 hover:text-green-400 transition-colors">Patient Portal</Link></li>
                            <li><Link href="/about" className="text-gray-300 hover:text-green-400 transition-colors">Meet Our Team</Link></li>
                            <li><Link href="/services" className="text-gray-300 hover:text-green-400 transition-colors">Our Services</Link></li>
                            <li><Link href="/testimonials" className="text-gray-300 hover:text-green-400 transition-colors">Testimonials</Link></li>
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
                            <div className="flex items-center space-x-3">
                                <Phone className="h-5 w-5 text-green-400" />
                                <div className="text-gray-300">
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
                            <Link href="/privacy" className="text-gray-400 hover:text-green-400 text-sm">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-gray-400 hover:text-green-400 text-sm">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}


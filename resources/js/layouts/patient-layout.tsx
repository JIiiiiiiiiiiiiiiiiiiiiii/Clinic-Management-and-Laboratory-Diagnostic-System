import { Head } from '@inertiajs/react';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
    Menu, 
    X, 
    Home, 
    Calendar, 
    User, 
    FileText, 
    TestTube, 
    Phone, 
    Info, 
    LogOut,
    Bell,
    ChevronDown
} from 'lucide-react';
import RealtimeNotificationBell from '@/components/RealtimeNotificationBell';

interface PatientLayoutProps {
    children: React.ReactNode;
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

export default function PatientLayout({ 
    children, 
    user, 
    patient,
    notifications = [],
    unreadCount = 0
}: PatientLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const handleLogout = () => {
        router.post(route('logout'));
    };

    const navigation = [
        { name: 'Home', href: '/patient/dashboard', icon: Home },
        { name: 'Appointments', href: '/patient/appointments', icon: Calendar },
        { name: 'Medical Records', href: '/patient/records', icon: FileText },
        { name: 'Test Results', href: '/patient/test-results', icon: TestTube },
        { name: 'Profile', href: '/patient/profile', icon: User },
        { name: 'Services', href: '/patient/services', icon: Info },
        { name: 'Contact', href: '/patient/contact', icon: Phone },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
            <Head title="Patient Portal - St. James Hospital" />
            
            {/* Header */}
            <header className="bg-white shadow-lg border-b border-green-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo and Brand */}
                        <div className="flex items-center">
                            <Link href="/patient/dashboard" className="flex items-center space-x-3">
                                <div className="bg-green-600 rounded-full p-2">
                                    <img 
                                        src="/st-james-logo.png" 
                                        alt="St. James Hospital Logo" 
                                        className="w-8 h-8 object-contain"
                                    />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-xl font-bold text-gray-900">St. James Hospital</h1>
                                    <p className="text-sm text-gray-600">Patient Portal</p>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* Right side - Notifications and Profile */}
                        <div className="flex items-center space-x-4">
                            {/* Notification Bell */}
                            <RealtimeNotificationBell 
                                userRole="patient"
                                initialNotifications={notifications}
                                unreadCount={unreadCount}
                            />

                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <User className="h-4 w-4 text-green-600" />
                                    </div>
                                    <span className="hidden sm:block">{user.name}</span>
                                    <ChevronDown className="h-4 w-4" />
                                </button>

                                {isProfileDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-gray-500">{user.email}</div>
                                            {patient && (
                                                <div className="text-xs text-gray-400">Patient #: {patient.patient_no}</div>
                                            )}
                                        </div>
                                        <Link
                                            href="/patient/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Profile Settings
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-gray-100"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-green-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                            <div className="border-t border-gray-200 pt-2 mt-2">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 w-full text-left px-3 py-2 rounded-md text-base font-medium"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="bg-green-600 rounded-full p-2">
                                    <img 
                                        src="/st-james-logo.png" 
                                        alt="St. James Hospital Logo" 
                                        className="w-8 h-8 object-contain"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">St. James Hospital</h3>
                                    <p className="text-sm text-gray-400">Industrial Clinic and Diagnostic Center</p>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Your health is our priority. We provide comprehensive healthcare services 
                                with state-of-the-art facilities and experienced medical professionals.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                <li><Link href="/patient/appointments" className="text-gray-400 hover:text-white text-sm">My Appointments</Link></li>
                                <li><Link href="/patient/records" className="text-gray-400 hover:text-white text-sm">Medical Records</Link></li>
                                <li><Link href="/patient/test-results" className="text-gray-400 hover:text-white text-sm">Test Results</Link></li>
                                <li><Link href="/patient/services" className="text-gray-400 hover:text-white text-sm">Our Services</Link></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
                            <div className="space-y-2 text-sm text-gray-400">
                                <p>📞 +1 123 456 7890</p>
                                <p>✉️ info@stjameshospital.com</p>
                                <p>📍 123 Medical Center St.</p>
                                <p>🏥 Mon-Fri: 8AM-5PM</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-800 mt-8 pt-4 text-center text-sm text-gray-400">
                        <p>&copy; 2024 St. James Hospital. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

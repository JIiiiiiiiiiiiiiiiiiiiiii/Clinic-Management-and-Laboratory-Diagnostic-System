import React, { useState, useEffect, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import RealtimeNotificationBell from '@/components/RealtimeNotificationBell';
import {
    Menu,
    X,
    User,
    LogIn,
    LogOut,
    Stethoscope,
    ChevronDown,
    Calendar,
    FileText,
    TestTube,
    Phone,
    Shield,
    Heart,
    Receipt
} from 'lucide-react';

interface SharedNavigationProps {
    user?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    currentPath?: string;
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

export default function SharedNavigation({ user, currentPath = '/', notifications = [], unreadCount = 0 }: SharedNavigationProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const isLoggedIn = !!user;
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsUserDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        router.post('/logout');
    };

    const navigation = [
        { name: 'Home', href: '/', current: currentPath === '/' || currentPath === '/patient/home' },
        { name: 'About Us', href: '/about', current: currentPath === '/about' || currentPath === '/patient/about' },
        { name: 'Services', href: '/services', current: currentPath === '/services' || currentPath === '/patient/services' },
        { name: 'Testimonials', href: '/testimonials', current: currentPath === '/testimonials' || currentPath === '/patient/testimonials' },
        { name: 'Contact Us', href: '/contact', current: currentPath === '/contact' || currentPath === '/patient/contact' },
    ];

    const patientDropdownItems = [
        {
            name: 'Dashboard',
            href: '/patient/dashboard',
            icon: Heart,
            description: 'View your health overview',
            category: 'main'
        },
        {
            name: 'Appointments',
            href: '/patient/appointments',
            icon: Calendar,
            description: 'Manage your appointments',
            category: 'main'
        },
        {
            name: 'Book New Appointment',
            href: '/patient/online-appointment',
            icon: Calendar,
            description: 'Schedule a new appointment',
            category: 'actions'
        },
        {
            name: 'Medical Records',
            href: '/patient/records',
            icon: FileText,
            description: 'View your medical history',
            category: 'records'
        },
        {
            name: 'Test Results',
            href: '/patient/test-results',
            icon: TestTube,
            description: 'Check your lab results',
            category: 'records'
        },
        {
            name: 'Billing History',
            href: '/patient/billing',
            icon: Receipt,
            description: 'View your billing history & receipts',
            category: 'records'
        },
        {
            name: 'Profile',
            href: '/patient/profile',
            icon: User,
            description: 'Update your profile',
            category: 'account'
        }
    ];

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                <Stethoscope className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">SJHI Clinic</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`px-3 py-2 text-sm font-medium transition-colors ${
                                    item.current
                                        ? 'text-green-600 border-b-2 border-green-600'
                                        : 'text-gray-700 hover:text-green-600'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isLoggedIn ? (
                            <>
                                {/* Notification Bell */}
                                <RealtimeNotificationBell
                                    initialNotifications={notifications}
                                    userRole="patient"
                                />

                                {/* User Avatar */}
                                <div className="relative" ref={dropdownRef}>
                                <Button
                                    variant="ghost"
                                    className="w-10 h-10 p-0 rounded-full hover:bg-green-50"
                                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                >
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <User className="h-4 w-4 text-green-600" />
                                    </div>
                                </Button>

                                {/* User Dropdown */}
                                {isUserDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                        <div className="py-2">
                                            {/* User Info Header */}
                                            <div className="px-4 py-3 bg-green-50 border-b border-green-100">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                        <User className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="py-2">
                                                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    Quick Actions
                                                </div>
                                                {patientDropdownItems.filter(item => item.category === 'actions').map((item) => (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                                                        onClick={() => setIsUserDropdownOpen(false)}
                                                    >
                                                        <item.icon className="mr-3 h-4 w-4" />
                                                        <div>
                                                            <div className="font-medium">{item.name}</div>
                                                            <div className="text-xs text-gray-500">{item.description}</div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>

                                            {/* Main Portal */}
                                            <div className="py-2">
                                                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    Patient Portal
                                                </div>
                                                {patientDropdownItems.filter(item => item.category === 'main').map((item) => (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                                                        onClick={() => setIsUserDropdownOpen(false)}
                                                    >
                                                        <item.icon className="mr-3 h-4 w-4" />
                                                        <div>
                                                            <div className="font-medium">{item.name}</div>
                                                            <div className="text-xs text-gray-500">{item.description}</div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>

                                            {/* Records & Account */}
                                            <div className="py-2">
                                                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    Records & Account
                                                </div>
                                                {patientDropdownItems.filter(item => ['records', 'account'].includes(item.category)).map((item) => (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                                                        onClick={() => setIsUserDropdownOpen(false)}
                                                    >
                                                        <item.icon className="mr-3 h-4 w-4" />
                                                        <div>
                                                            <div className="font-medium">{item.name}</div>
                                                            <div className="text-xs text-gray-500">{item.description}</div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>

                                            {/* Logout */}
                                            <div className="border-t border-gray-100">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    <LogOut className="mr-3 h-4 w-4" />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/patient/online-appointment">
                                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Book Appointment
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                                    item.current
                                        ? 'text-green-600 bg-green-50'
                                        : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                                }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}

                        <div className="pt-4 pb-3 border-t border-gray-200">
                            <div className="flex flex-col space-y-2 px-3">
                                {isLoggedIn ? (
                                    <>
                                        {/* Mobile User Info */}
                                        <div className="px-3 py-3 bg-green-50 border-b border-green-100">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                    <User className="h-4 w-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mobile Quick Actions */}
                                        <div className="space-y-1">
                                            <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Quick Actions
                                            </div>
                                            {patientDropdownItems.filter(item => item.category === 'actions').map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    <item.icon className="mr-3 h-4 w-4" />
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>

                                        {/* Mobile Patient Portal */}
                                        <div className="space-y-1">
                                            <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Patient Portal
                                            </div>
                                            {patientDropdownItems.filter(item => item.category === 'main').map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    <item.icon className="mr-3 h-4 w-4" />
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>

                                        {/* Mobile Records & Account */}
                                        <div className="space-y-1">
                                            <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Records & Account
                                            </div>
                                            {patientDropdownItems.filter(item => ['records', 'account'].includes(item.category)).map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    <item.icon className="mr-3 h-4 w-4" />
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleLogout}
                                            className="w-full border-red-300 text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login">
                                            <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                                                <LogIn className="mr-2 h-4 w-4" />
                                                Login
                                            </Button>
                                        </Link>
                                        <Link href="/patient/online-appointment">
                                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                Book Appointment
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

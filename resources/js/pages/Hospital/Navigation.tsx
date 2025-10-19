import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowRightLeft,
    BarChart3,
    Calendar,
    CreditCard,
    FileText,
    Hospital,
    LayoutDashboard,
    Package,
    Stethoscope,
    UserCheck,
    UserPlus,
    Users,
} from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

interface NavigationItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    badge?: string;
    badgeColor?: string;
    section?: string;
}

interface HospitalNavigationProps {
    currentPath?: string;
}

export default function HospitalNavigation({ currentPath }: HospitalNavigationProps) {
    const { url } = usePage();
    const currentUrl = currentPath || url;

    const navigationItems: NavigationItem[] = [
        // Main Dashboard
        {
            name: 'Dashboard',
            href: route('hospital.dashboard'),
            icon: LayoutDashboard,
            description: 'Hospital overview and statistics',
            section: 'main',
        },

        // Patient Management Section
        {
            name: 'Patient Management',
            href: route('hospital.patients.index'),
            icon: Users,
            description: 'Manage patient records and information',
            section: 'patients',
        },
        {
            name: 'Add Patient',
            href: route('hospital.patients.create'),
            icon: UserPlus,
            description: 'Register new patients',
            badge: 'New',
            badgeColor: 'bg-green-100 text-green-800',
            section: 'patients',
        },
        {
            name: 'Patient Transfers',
            href: route('hospital.patients.refer'),
            icon: ArrowRightLeft,
            description: 'Transfer patients to clinic',
            badge: 'Transfer',
            badgeColor: 'bg-blue-100 text-blue-800',
            section: 'patients',
        },

        // Reports Section
        {
            name: 'Reports Dashboard',
            href: route('hospital.reports.index'),
            icon: BarChart3,
            description: 'Generate and view reports',
            section: 'reports',
        },
        {
            name: 'Patient Reports',
            href: route('hospital.reports.patients'),
            icon: FileText,
            description: 'Detailed patient analytics',
            section: 'reports',
        },
        {
            name: 'Appointment Reports',
            href: route('hospital.reports.appointments'),
            icon: Calendar,
            description: 'View appointment schedules and analytics',
            section: 'reports',
        },
        {
            name: 'Transfer Reports',
            href: route('hospital.reports.transfers'),
            icon: UserCheck,
            description: 'Patient transfer analytics',
            section: 'reports',
        },
        {
            name: 'Laboratory Reports',
            href: route('hospital.reports.laboratory'),
            icon: Stethoscope,
            description: 'Lab orders and results',
            section: 'reports',
        },
        {
            name: 'Inventory Reports',
            href: route('hospital.reports.inventory'),
            icon: Package,
            description: 'Supply and inventory management',
            section: 'reports',
        },
        {
            name: 'Financial Reports',
            href: route('hospital.reports.billing'),
            icon: CreditCard,
            description: 'Financial transactions and billing',
            section: 'reports',
        },
        {
            name: 'Operations Reports',
            href: route('hospital.reports.clinic.operations'),
            icon: Activity,
            description: 'Hospital operations overview',
            section: 'reports',
        },
    ];

    const isActive = (href: string) => {
        return currentUrl === href || currentUrl.startsWith(href + '/');
    };

    // Group navigation items by section
    const groupedItems = navigationItems.reduce(
        (acc, item) => {
            const section = item.section || 'other';
            if (!acc[section]) {
                acc[section] = [];
            }
            acc[section].push(item);
            return acc;
        },
        {} as Record<string, NavigationItem[]>,
    );

    const sectionTitles = {
        main: 'Main',
        patients: 'Patient Management',
        reports: 'Reports & Analytics',
    };

    return (
        <nav className="space-y-1">
            <div className="px-3 py-2">
                <div className="mb-4 flex items-center gap-2">
                    <Hospital className="h-6 w-6 text-blue-600" />
                    <h2 className="text-lg font-semibold">Saint James Hospital</h2>
                </div>
                <p className="text-sm text-muted-foreground">Hospital staff interface for patient management and operations</p>
            </div>

            <div className="space-y-6">
                {Object.entries(groupedItems).map(([section, items]) => (
                    <div key={section} className="space-y-1">
                        {sectionTitles[section as keyof typeof sectionTitles] && (
                            <div className="px-3 py-1">
                                <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    {sectionTitles[section as keyof typeof sectionTitles]}
                                </h3>
                            </div>
                        )}
                        <div className="space-y-1">
                            {items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                                            isActive(item.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span>{item.name}</span>
                                                {item.badge && (
                                                    <span
                                                        className={cn(
                                                            'rounded-full px-2 py-1 text-xs',
                                                            item.badgeColor || 'bg-gray-100 text-gray-800',
                                                        )}
                                                    >
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 px-3 py-2">
                <div className="rounded-lg bg-blue-50 p-3">
                    <div className="mb-2 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Quick Stats</span>
                    </div>
                    <div className="space-y-1 text-xs text-blue-700">
                        <div className="flex justify-between">
                            <span>Total Patients:</span>
                            <span className="font-medium">1,234</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Active Today:</span>
                            <span className="font-medium">45</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Pending Transfers:</span>
                            <span className="font-medium">12</span>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

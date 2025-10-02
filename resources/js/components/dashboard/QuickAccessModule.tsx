import { Card, CardContent } from '@/components/ui/card';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { Link } from '@inertiajs/react';
import { 
    Calendar, 
    CreditCard, 
    FlaskConical, 
    Package2, 
    Users, 
    UserCheck, 
    Settings,
    Stethoscope,
    FileText,
    Plus,
    Search,
    ClipboardList,
    Shield,
    Activity
} from 'lucide-react';

interface QuickAccessAction {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    bgColor: string;
    permission?: string;
}

const quickAccessActions: QuickAccessAction[] = [
    {
        title: 'Add Patient',
        description: 'Register new patient',
        icon: Plus,
        href: '/admin/patient/create',
        bgColor: 'bg-blue-500',
        permission: 'canAccessPatients'
    },
    {
        title: 'Schedule Appointment',
        description: 'Book new appointment',
        icon: Calendar,
        href: '/admin/appointments/create',
        bgColor: 'bg-purple-500',
        permission: 'canAccessAppointments'
    },
    {
        title: 'Lab Order',
        description: 'Create lab test order',
        icon: FlaskConical,
        href: '/admin/laboratory/orders/create',
        bgColor: 'bg-orange-500',
        permission: 'canAccessLaboratory'
    },
    {
        title: 'Process Payment',
        description: 'Handle billing & payments',
        icon: CreditCard,
        href: '/admin/billing',
        bgColor: 'bg-green-500',
        permission: 'canAccessBilling'
    },
    {
        title: 'View Patients',
        description: 'Browse patient records',
        icon: Users,
        href: '/admin/patient',
        bgColor: 'bg-indigo-500',
        permission: 'canAccessPatients'
    },
    {
        title: 'Lab Results',
        description: 'Enter test results',
        icon: ClipboardList,
        href: '/admin/laboratory/results',
        bgColor: 'bg-red-500',
        permission: 'canAccessLaboratory'
    },
    {
        title: 'Inventory Check',
        description: 'Manage supplies',
        icon: Package2,
        href: '/admin/inventory',
        bgColor: 'bg-yellow-500',
        permission: 'canAccessInventory'
    },
    {
        title: 'Search Records',
        description: 'Find patient data',
        icon: Search,
        href: '/admin/patient?search=',
        bgColor: 'bg-cyan-500',
        permission: 'canAccessPatients'
    },
    {
        title: 'View Reports',
        description: 'Generate analytics',
        icon: Activity,
        href: '/admin/reports',
        bgColor: 'bg-blue-500',
        permission: 'canAccessReports'
    },
    {
        title: 'Manage Doctors',
        description: 'Doctor management',
        icon: Shield,
        href: '/admin/doctors',
        bgColor: 'bg-blue-500',
        permission: 'canAccessInventory'
    },
    {
        title: 'System Settings',
        description: 'Configure system',
        icon: Settings,
        href: '/admin/settings',
        bgColor: 'bg-blue-500',
        permission: 'canAccessSettings'
    },
    {
        title: 'Quick Notes',
        description: 'Add quick notes',
        icon: FileText,
        href: '#',
        bgColor: 'bg-violet-500'
    }
];

export default function QuickAccessModule() {
    const { permissions } = useRoleAccess();

    const filteredActions = quickAccessActions.filter(action => 
        !action.permission || permissions[action.permission as keyof typeof permissions]
    );

    return (
        <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center gap-3 p-6">
                    <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                        <Stethoscope className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">Quick Access</h3>
                        <p className="text-blue-100 mt-1">Fast access to common tasks</p>
                    </div>
                </div>
            </div>
            <CardContent className="p-0">
                {/* All buttons - scrollable, showing 4 at a time */}
                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <div className="p-6">
                        <div className="grid grid-cols-2 gap-4">
                            {filteredActions.map((action, index) => (
                                <Link key={index} href={action.href} className="block">
                                    <div className="holographic-card bg-white shadow-sm cursor-pointer rounded-xl overflow-hidden hover:shadow-md transition-all duration-200">
                                        <div className="flex h-24">
                                            {/* Icon Section - Colored background fills top to bottom */}
                                            <div className={`w-20 h-full ${action.bgColor} flex items-center justify-center rounded-l-xl`}>
                                                <action.icon className="h-8 w-8 text-white" />
                                            </div>
                                            {/* Text Section - All content on the right */}
                                            <div className="flex-1 p-4 flex flex-col justify-center">
                                                <div className="text-lg font-bold text-gray-900">{action.title}</div>
                                                <div className="text-sm text-gray-600">{action.description}</div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Footer - same level as Recent Activities */}
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center">
                        Quick access to common tasks • 
                        <span className="text-blue-600 hover:text-blue-800 cursor-pointer ml-1">
                            View all modules
                        </span>
                    </p>
                </div>
            </CardContent>
        </div>
    );
}

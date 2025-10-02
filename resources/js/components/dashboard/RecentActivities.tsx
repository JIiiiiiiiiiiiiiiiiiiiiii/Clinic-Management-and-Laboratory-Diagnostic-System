import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Calendar, 
    UserPlus, 
    CreditCard, 
    FlaskConical, 
    LogIn, 
    LogOut,
    FileText,
    Clock
} from 'lucide-react';

interface Activity {
    id: number;
    date: string;
    time: string;
    activity: string;
    user: string;
    type: 'patient' | 'appointment' | 'payment' | 'lab' | 'login' | 'logout' | 'other';
    details?: string;
}

// Mock data - in real app this would come from props
const mockActivities: Activity[] = [
    {
        id: 1,
        date: '2025-01-15',
        time: '09:30',
        activity: 'Patient added',
        user: 'Dr. Smith',
        type: 'patient',
        details: 'John Doe registered'
    },
    {
        id: 2,
        date: '2025-01-15',
        time: '10:15',
        activity: 'Appointment scheduled',
        user: 'Nurse Johnson',
        type: 'appointment',
        details: 'Follow-up visit scheduled'
    },
    {
        id: 3,
        date: '2025-01-15',
        time: '11:00',
        activity: 'Payment received',
        user: 'Cashier Brown',
        type: 'payment',
        details: '₱2,500 consultation fee'
    },
    {
        id: 4,
        date: '2025-01-15',
        time: '11:30',
        activity: 'Lab test created',
        user: 'Lab Tech Wilson',
        type: 'lab',
        details: 'Blood test ordered'
    },
    {
        id: 5,
        date: '2025-01-15',
        time: '12:00',
        activity: 'User login',
        user: 'Dr. Davis',
        type: 'login'
    },
    {
        id: 6,
        date: '2025-01-15',
        time: '12:30',
        activity: 'Lab results entered',
        user: 'Lab Tech Wilson',
        type: 'lab',
        details: 'Blood test results completed'
    },
    {
        id: 7,
        date: '2025-01-15',
        time: '13:15',
        activity: 'Patient added',
        user: 'Dr. Smith',
        type: 'patient',
        details: 'Jane Smith registered'
    },
    {
        id: 8,
        date: '2025-01-15',
        time: '14:00',
        activity: 'User logout',
        user: 'Nurse Johnson',
        type: 'logout'
    },
    {
        id: 9,
        date: '2025-01-15',
        time: '14:30',
        activity: 'Appointment completed',
        user: 'Dr. Davis',
        type: 'appointment',
        details: 'Annual check-up completed'
    },
    {
        id: 10,
        date: '2025-01-15',
        time: '15:00',
        activity: 'Payment received',
        user: 'Cashier Brown',
        type: 'payment',
        details: '₱1,800 lab test fee'
    }
];

const getActivityIcon = (type: Activity['type']) => {
    const iconClass = "h-8 w-8 text-white";
    
    switch (type) {
        case 'patient':
            return <UserPlus className={iconClass} />;
        case 'appointment':
            return <Calendar className={iconClass} />;
        case 'payment':
            return <CreditCard className={iconClass} />;
        case 'lab':
            return <FlaskConical className={iconClass} />;
        case 'login':
            return <LogIn className={iconClass} />;
        case 'logout':
            return <LogOut className={iconClass} />;
        default:
            return <FileText className={iconClass} />;
    }
};

const getActivityBadge = (type: Activity['type']) => {
    const badgeConfig = {
        patient: 'bg-blue-100 text-blue-800',
        appointment: 'bg-purple-100 text-purple-800',
        payment: 'bg-green-100 text-green-800',
        lab: 'bg-orange-100 text-orange-800',
        login: 'bg-cyan-100 text-cyan-800',
        logout: 'bg-gray-100 text-gray-800',
        other: 'bg-gray-100 text-gray-800'
    };

    return badgeConfig[type] || 'bg-gray-100 text-gray-800';
};

const getActivityIconBg = (type: Activity['type']) => {
    const bgConfig = {
        patient: 'bg-blue-500',
        appointment: 'bg-purple-500',
        payment: 'bg-green-500',
        lab: 'bg-orange-500',
        login: 'bg-cyan-500',
        logout: 'bg-red-500',
        other: 'bg-gray-500'
    };

    return bgConfig[type] || 'bg-gray-500';
};

export default function RecentActivities() {
    return (
        <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <div className="flex items-center gap-3 p-6">
                    <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                        <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">Recent Activities</h3>
                        <p className="text-purple-100 mt-1">Latest system activities</p>
                    </div>
                </div>
            </div>
            <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-4">
                            {mockActivities.map((activity) => (
                                <div key={activity.id} className="holographic-card bg-white shadow-sm rounded-xl overflow-hidden">
                                    <div className="flex h-24">
                                        {/* Icon Section - Colored background fills top to bottom */}
                                        <div 
                                            className={`w-20 h-full flex items-center justify-center rounded-l-xl ${getActivityIconBg(activity.type)}`}
                                        >
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        {/* Text Section - All content on the right */}
                                        <div className="flex-1 p-4 flex flex-col justify-center">
                                            <div className="text-lg font-bold text-gray-900">{activity.activity}</div>
                                            <div className="text-sm text-gray-600">{activity.user}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {activity.time} • {activity.date}
                                            </div>
                                            {activity.details && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {activity.details}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center">
                        Showing last 10 activities • 
                        <span className="text-blue-600 hover:text-blue-800 cursor-pointer ml-1">
                            View all activities
                        </span>
                    </p>
                </div>
            </CardContent>
        </div>
    );
}

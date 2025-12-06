import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PatientInfoCard } from '@/components/patient/PatientPageLayout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Area, AreaChart, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { useMemo, useState, useCallback } from 'react';
import { formatAppointmentType } from '@/utils/formatAppointmentType';
import { safeFormatDate, safeFormatTime } from '@/utils/dateTime';
import { 
    Users, 
    Calendar, 
    FlaskConical, 
    Package2,
    Stethoscope,
    Coins,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    AlertTriangle,
    Activity,
    UserPlus,
    FileText,
    BarChart3,
    Bell,
    Settings,
    ArrowRight,
    Eye,
    XCircle,
    AlertCircle,
    Plus,
    Edit,
    Trash2,
    Calendar as CalendarIcon,
    User,
    Heart,
    Pill,
    TestTube,
    Receipt,
    ShoppingCart,
    Shield,
    Building2,
    Search,
    Filter,
    Download,
    MoreHorizontal,
    Bed,
    UserCheck,
    Target,
    Zap,
    X
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

export default function Dashboard() {
    const { dashboard, user, diagnosisData, consultationData } = usePage().props as any;
    const stats = dashboard?.stats || {};
    const recent_appointments = dashboard?.recent_appointments || [];
    const today_appointments = dashboard?.today_appointments || [];
    const notifications = dashboard?.notifications || [];
    const analyticsData = dashboard?.analyticsData || {};
    const miniTables = dashboard?.miniTables || {};
    
    // View modal state
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    
    // Handle view appointment
    const handleViewAppointment = useCallback((appointment: any) => {
        setSelectedAppointment(appointment);
        setShowViewModal(true);
    }, []);
    
    // Handle close modals
    const handleCloseModals = useCallback(() => {
        setShowViewModal(false);
        setSelectedAppointment(null);
    }, []);
    
    // Get status badge class
    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    
    // Get type badge class
    const getTypeBadge = (type: string) => {
        if (!type) return 'bg-gray-100 text-gray-800';
        
        switch (type.toLowerCase()) {
            case 'consultation':
            case 'general_consultation':
                return 'bg-purple-100 text-purple-800';
            case 'follow-up':
                return 'bg-indigo-100 text-indigo-800';
            case 'emergency':
                return 'bg-red-100 text-red-800';
            case 'checkup':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Debug logging for chart data - removed for performance

    // Fallback data for charts
    const fallbackDiagnosisData = [
        { month: 'Jan', Hypertension: 15, Diabetes: 12, Cardiovascular: 8, Respiratory: 6, Other: 4 },
        { month: 'Feb', Hypertension: 18, Diabetes: 14, Cardiovascular: 10, Respiratory: 8, Other: 5 },
        { month: 'Mar', Hypertension: 22, Diabetes: 16, Cardiovascular: 12, Respiratory: 10, Other: 6 },
        { month: 'Apr', Hypertension: 20, Diabetes: 18, Cardiovascular: 14, Respiratory: 12, Other: 7 },
        { month: 'May', Hypertension: 25, Diabetes: 20, Cardiovascular: 16, Respiratory: 14, Other: 8 },
        { month: 'Jun', Hypertension: 28, Diabetes: 22, Cardiovascular: 18, Respiratory: 16, Other: 10 }
    ];

    const fallbackConsultationData = {
        'Blood Tests': 25,
        'Urinalysis': 20,
        'X-Ray': 15,
        'ECG': 12,
        'Consultation': 30,
        'Follow-up': 18
    };

    const chartDiagnosisData = diagnosisData && diagnosisData.length > 0 ? diagnosisData : fallbackDiagnosisData;
    const chartConsultationData = consultationData && Object.keys(consultationData).length > 0 ? consultationData : fallbackConsultationData;

    // Role-based quick actions
    const getQuickActions = (role: string) => {
        const baseActions = [
            { title: 'View Patients', href: '/admin/patients', icon: Users, color: 'bg-blue-500' },
            { title: 'Appointments', href: '/admin/appointments', icon: Calendar, color: 'bg-green-500' },
            { title: 'Laboratory', href: '/admin/laboratory', icon: TestTube, color: 'bg-cyan-500' },
            { title: 'Inventory', href: '/admin/inventory', icon: Package2, color: 'bg-orange-500' },
            { title: 'Billing', href: '/admin/billing', icon: Receipt, color: 'bg-red-500' },
            { title: 'Reports', href: '/admin/reports', icon: BarChart3, color: 'bg-purple-500' },
            { title: 'Lab Results', href: '/admin/lab-results', icon: FlaskConical, color: 'bg-indigo-500' },
            { title: 'Transactions', href: '/admin/transactions', icon: Coins, color: 'bg-emerald-500' },
            { title: 'Notifications', href: '/admin/notifications', icon: Bell, color: 'bg-yellow-500' },
            { title: 'System Health', href: '/admin/system-health', icon: Shield, color: 'bg-gray-500' },
        ];

        switch (role) {
            case 'admin':
                return [
                    ...baseActions,
                    { title: 'Settings', href: '/admin/settings', icon: Settings, color: 'bg-slate-500' },
                    { title: 'User Management', href: '/admin/users', icon: UserCheck, color: 'bg-violet-500' },
                    { title: 'Building Management', href: '/admin/building', icon: Building2, color: 'bg-teal-500' },
                ];
            case 'doctor':
                return [
                    ...baseActions,
                    { title: 'My Patients', href: '/admin/patients', icon: Heart, color: 'bg-pink-500' },
                    { title: 'Lab Results', href: '/admin/lab-results', icon: TestTube, color: 'bg-cyan-500' },
                    { title: 'Prescriptions', href: '/admin/prescriptions', icon: Pill, color: 'bg-indigo-500' },
                ];
            case 'nurse':
                return [
                    ...baseActions,
                    { title: 'Patient Care', href: '/admin/patients', icon: Heart, color: 'bg-pink-500' },
                    { title: 'Vital Signs', href: '/admin/vital-signs', icon: Activity, color: 'bg-yellow-500' },
                    { title: 'Medications', href: '/admin/medications', icon: Pill, color: 'bg-indigo-500' },
                ];
            case 'medtech':
                return [
                    { title: 'Lab Orders', href: '/admin/lab-orders', icon: FlaskConical, color: 'bg-purple-500' },
                    { title: 'Lab Results', href: '/admin/lab-results', icon: TestTube, color: 'bg-cyan-500' },
                    { title: 'Lab Tests', href: '/admin/lab-tests', icon: FileText, color: 'bg-blue-500' },
                ];
            case 'cashier':
                return [
                    { title: 'Billing', href: '/admin/billing', icon: Receipt, color: 'bg-red-500' },
                    { title: 'Transactions', href: '/admin/transactions', icon: Coins, color: 'bg-green-500' },
                    { title: 'Payments', href: '/admin/payments', icon: ShoppingCart, color: 'bg-orange-500' },
                ];
            case 'hospital_admin':
            case 'hospital_staff':
                return [
                    ...baseActions,
                    { title: 'Hospital Reports', href: '/hospital/reports', icon: BarChart3, color: 'bg-purple-500' },
                    { title: 'System Health', href: '/admin/system-health', icon: Shield, color: 'bg-gray-500' },
                    { title: 'Building Management', href: '/admin/building', icon: Building2, color: 'bg-indigo-500' },
                ];
            default:
                return baseActions;
        }
    };

    const quickActions = getQuickActions(user?.role || 'admin');

    // Memoize random data to prevent re-renders
    const memoizedRandomData = useMemo(() => {
        const diagnoses = ['Diabetes', 'Hypertension', 'Anxiety Disorder', 'Dermatitis', 'Gastritis'];
        const genders = ['Male', 'Female'];
        const statuses = ['Critical', 'Stable', 'Mild'];
        
        return {
            age: Math.floor(Math.random() * 50) + 20,
            birthDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 30).toLocaleDateString(),
            gender: genders[Math.floor(Math.random() * genders.length)],
            diagnosis: diagnoses[Math.floor(Math.random() * diagnoses.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            isCritical: Math.random() > 0.7,
            isStable: Math.random() > 0.4,
        };
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="min-h-screen bg-gray-50 p-6">

                        {/* Enhanced Statistics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-blue-800">Total Patients</CardTitle>
                                    <UserPlus className="h-5 w-5 text-blue-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-blue-900">{stats.total_patients || 0}</div>
                                    <p className="text-xs text-blue-700 mt-1">
                                        <TrendingUp className="inline h-3 w-3 mr-1" />
                                        {stats.new_patients_today > 0 ? `${stats.new_patients_today} new today` : 'All registered patients'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-green-800">Lab Results</CardTitle>
                                    <TestTube className="h-5 w-5 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-900">{stats.pending_lab_results || 0}</div>
                                    <p className="text-xs text-green-700 mt-1">
                                        <TrendingUp className="inline h-3 w-3 mr-1" />
                                        {stats.completed_lab_results || 0} total verified
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-purple-800">Total Revenue</CardTitle>
                                    <Coins className="h-5 w-5 text-purple-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-purple-900">₱{(stats.total_revenue || 0).toLocaleString()}</div>
                                    <p className="text-xs text-purple-700 mt-1">
                                        <TrendingUp className="inline h-3 w-3 mr-1" />
                                        {stats.today_revenue > 0 ? `₱${(stats.today_revenue || 0).toLocaleString()} today` : 'All paid transactions'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-orange-800">Inventory Alert</CardTitle>
                                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-orange-900">{stats.low_stock_items || 0}</div>
                                    <p className="text-xs text-orange-700 mt-1">
                                        <AlertTriangle className="inline h-3 w-3 mr-1" />
                                        {stats.out_of_stock_items || 0} out of stock
                                    </p>
                                </CardContent>
                            </Card>
                        </div>


                {/* Analytics Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Patient Registration Trend - Full Width on Top */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-green-600" />
                                <div>
                                    <CardTitle className="text-lg font-semibold">Patient Registration Trend</CardTitle>
                                    <p className="text-sm text-gray-600">New patient registrations over time</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {analyticsData.patient_registration_trend?.reduce((sum: number, item: any) => sum + item.patients, 0) || 0}
                                    </div>
                                    <div className="text-xs text-gray-600">Total Patients</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {analyticsData.patient_registration_trend?.length > 0 ? 
                                            Math.round(analyticsData.patient_registration_trend.reduce((sum: number, item: any) => sum + item.patients, 0) / analyticsData.patient_registration_trend.length) : 0
                                        }
                                    </div>
                                    <div className="text-xs text-gray-600">Avg per Period</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {analyticsData.patient_registration_trend?.length > 0 ? 
                                            Math.max(...analyticsData.patient_registration_trend.map((item: any) => item.patients)) : 0
                                        }
                                    </div>
                                    <div className="text-xs text-gray-600">Peak Period</div>
                                </div>
                            </div>
                            <div className="h-64 w-full">
                                {analyticsData.patient_registration_trend && analyticsData.patient_registration_trend.length > 0 ? (
                                    <ChartContainer
                                        config={{
                                            male: {
                                                label: "Male",
                                                color: "hsl(220, 70%, 50%)",
                                            },
                                            female: {
                                                label: "Female",
                                                color: "hsl(142, 76%, 36%)",
                                            },
                                        }}
                                        className="h-full w-full"
                                    >
                                        <LineChart
                                            data={analyticsData.patient_registration_trend}
                                            margin={{
                                                top: 20,
                                                right: 30,
                                                left: 20,
                                                bottom: 20,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <ChartTooltip 
                                                content={<ChartTooltipContent 
                                                    labelFormatter={(label) => `Period: ${label}`}
                                                    formatter={(value: any, name: any) => [
                                                        `${value} patients`,
                                                        name === 'male' ? 'Male' : name === 'female' ? 'Female' : name
                                                    ]}
                                                />} 
                                            />
                                            <Legend />
                                            <Line 
                                                type="monotone" 
                                                dataKey="male" 
                                                stroke="hsl(220, 70%, 50%)" 
                                                strokeWidth={2}
                                                dot={{ fill: 'hsl(220, 70%, 50%)', strokeWidth: 2, r: 4 }}
                                                activeDot={{ r: 6, stroke: 'hsl(220, 70%, 50%)', strokeWidth: 2 }}
                                                name="Male"
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="female" 
                                                stroke="hsl(142, 76%, 36%)" 
                                                strokeWidth={2}
                                                dot={{ fill: 'hsl(142, 76%, 36%)', strokeWidth: 2, r: 4 }}
                                                activeDot={{ r: 6, stroke: 'hsl(142, 76%, 36%)', strokeWidth: 2 }}
                                                name="Female"
                                            />
                                        </LineChart>
                                    </ChartContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                                        <div className="text-center">
                                            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Registration Data</h3>
                                            <p className="text-gray-600">No patient registration data available</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Revenue Trends - Bottom Left */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-2">
                                <Coins className="h-5 w-5 text-green-600" />
                                <div>
                                    <CardTitle className="text-lg font-semibold">Revenue Trends Analysis</CardTitle>
                                    <p className="text-sm text-gray-600">Monthly revenue with growth insights</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-3 pt-2 pb-2 flex flex-col">
                            {(() => {
                                const revenueData = analyticsData.revenue_trends || [];
                                const totalRevenue = revenueData.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0);
                                const avgRevenue = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;
                                const peakRevenue = revenueData.length > 0 ? Math.max(...revenueData.map((item: any) => item.revenue || 0)) : 0;
                                const currentMonth = revenueData[revenueData.length - 1]?.revenue || 0;
                                const previousMonth = revenueData[revenueData.length - 2]?.revenue || 0;
                                const growthRate = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth * 100) : (currentMonth > 0 ? 100 : 0);
                                
                                return (
                                    <>
                                        <div className="mb-2 grid grid-cols-2 gap-2">
                                            <div className="text-center p-2 bg-green-50 rounded-lg">
                                    <div className="text-xl font-bold text-green-600">
                                                    ₱{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                                <div className="text-xs text-gray-600">Total (6M)</div>
                                </div>
                                            <div className="text-center p-2 bg-blue-50 rounded-lg">
                                    <div className="text-xl font-bold text-blue-600">
                                                    ₱{avgRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                                <div className="text-xs text-gray-600">Monthly Average</div>
                                </div>
                            </div>
                                        <div className="mb-2 grid grid-cols-2 gap-2">
                                            <div className="text-center p-1.5 bg-purple-50 rounded-lg">
                                                <div className="text-base font-bold text-purple-600">
                                                    ₱{peakRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                                <div className="text-xs text-gray-600">Peak Month</div>
                                            </div>
                                            <div className="text-center p-1.5 bg-orange-50 rounded-lg">
                                                <div className={`text-base font-bold flex items-center justify-center gap-1 ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {growthRate >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                    {Math.abs(growthRate).toFixed(1)}%
                                                </div>
                                                <div className="text-xs text-gray-600">MoM Growth</div>
                                </div>
                            </div>
                            <div className="flex-1 w-full min-h-0 mb-1">
                                            {revenueData.length > 0 ? (
                                    <ChartContainer
                                        config={{
                                                        revenue: {
                                                            label: "Revenue",
                                                color: "hsl(142, 76%, 36%)",
                                            },
                                        }}
                                        className="h-full w-full"
                                    >
                                                    <AreaChart
                                                        data={revenueData}
                                                        margin={{ top: 10, right: 10, left: 0, bottom: 2 }}
                                                    >
                                                        <defs>
                                                            <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8}/>
                                                                <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.1}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="month" />
                                                        <YAxis 
                                                            tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="revenue"
                                                            stroke="hsl(142, 76%, 36%)"
                                                            strokeWidth={3}
                                                            fill="url(#fillRevenue)"
                                                            fillOpacity={0.4}
                                                            dot={{ fill: 'hsl(142, 76%, 36%)', strokeWidth: 2, r: 4 }}
                                                            activeDot={{ r: 6, stroke: 'hsl(142, 76%, 36%)', strokeWidth: 2 }}
                                                        />
                                                        <ChartTooltip
                                                            content={<ChartTooltipContent 
                                                                labelFormatter={(label) => `Month: ${label}`}
                                                                formatter={(value: any) => [`₱${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']}
                                                            />}
                                                        />
                                                    </AreaChart>
                                                </ChartContainer>
                                            ) : (
                                                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                                                    <div className="text-center">
                                                        <Coins className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Revenue Data</h3>
                                                        <p className="text-gray-600">No revenue data available</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                );
                            })()}
                        </CardContent>
                    </Card>

                    {/* Appointment Types Distribution - Bottom Right */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <div>
                                    <CardTitle className="text-lg font-semibold">Appointment Types Analysis</CardTitle>
                                    <p className="text-sm text-gray-600">Distribution, trends & revenue insights</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {analyticsData.appointment_types_total || 0}
                                    </div>
                                    <div className="text-xs text-gray-600">Total Appointments</div>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {analyticsData.appointment_types_distribution?.length > 0 
                                            ? analyticsData.appointment_types_distribution.length 
                                            : 0}
                                    </div>
                                    <div className="text-xs text-gray-600">Active Types</div>
                                </div>
                            </div>
                            <div className="h-64 w-full mb-4">
                                {analyticsData.appointment_types_distribution && analyticsData.appointment_types_distribution.length > 0 ? (
                                    <ChartContainer
                                        config={analyticsData.appointment_types_distribution.reduce((acc: any, item: any, index: number) => {
                                            const colors = [
                                                "hsl(142, 76%, 36%)",
                                                "hsl(47, 96%, 53%)",
                                                "hsl(220, 70%, 50%)",
                                                "hsl(262, 83%, 58%)",
                                                "hsl(0, 84%, 60%)",
                                                "hsl(30, 70%, 50%)",
                                            ];
                                            acc[item.name.toLowerCase().replace(/\s+/g, '_')] = {
                                                label: item.name,
                                                color: colors[index % colors.length],
                                            };
                                            return acc;
                                        }, {})}
                                        className="h-full w-full"
                                        >
                                        <PieChart>
                                            <Pie
                                                data={analyticsData.appointment_types_distribution}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                innerRadius={40}
                                                label={(entry: any) => {
                                                    const percentage = analyticsData.appointment_types_total > 0 
                                                        ? ((entry.value / analyticsData.appointment_types_total) * 100).toFixed(1)
                                                        : '0';
                                                    return `${entry.name}: ${percentage}%`;
                                                }}
                                                labelLine={false}
                                            >
                                                {analyticsData.appointment_types_distribution.map((entry: any, index: number) => {
                                                    const colors = [
                                                        "hsl(142, 76%, 36%)",
                                                        "hsl(47, 96%, 53%)",
                                                        "hsl(220, 70%, 50%)",
                                                        "hsl(262, 83%, 58%)",
                                                        "hsl(0, 84%, 60%)",
                                                        "hsl(30, 70%, 50%)",
                                                    ];
                                                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                                })}
                                            </Pie>
                                            <ChartTooltip 
                                                content={<ChartTooltipContent 
                                                    formatter={(value: any, name: any, props: any) => [
                                                        `${value} appointments (${props.payload.percentage}%)`,
                                                        name
                                                    ]}
                                                />} 
                                            />
                                        </PieChart>
                                    </ChartContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                                        <div className="text-center">
                                            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointment Data</h3>
                                            <p className="text-gray-600">No appointment type data available</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Detailed breakdown */}
                            {analyticsData.appointment_types_distribution && analyticsData.appointment_types_distribution.length > 0 && (
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {analyticsData.appointment_types_distribution.slice(0, 5).map((item: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="w-3 h-3 rounded-full"
                                                    style={{
                                                        backgroundColor: [
                                                            "hsl(142, 76%, 36%)",
                                                            "hsl(47, 96%, 53%)",
                                                            "hsl(220, 70%, 50%)",
                                                            "hsl(262, 83%, 58%)",
                                                            "hsl(0, 84%, 60%)",
                                                        ][index % 5]
                                                    }}
                                                />
                                                <span className="font-medium">{item.name}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs">
                                                <span className="text-gray-600">{item.value} ({item.percentage}%)</span>
                                                {item.trend !== undefined && (
                                                    <span className={`flex items-center gap-1 ${item.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {item.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                        {Math.abs(item.trend)}%
                                                    </span>
                                                )}
                                                {item.avgPrice > 0 && (
                                                    <span className="text-blue-600">₱{item.avgPrice.toFixed(2)}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Analytics Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Visit Status Trends */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-2">
                                <Stethoscope className="h-5 w-5 text-purple-600" />
                                <div>
                                    <CardTitle className="text-lg font-semibold">Visit Status Trends Analysis</CardTitle>
                                    <p className="text-sm text-gray-600">Visit statuses with completion insights</p>
                            </div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-3 pt-2 pb-2 flex flex-col">
                            {(() => {
                                const visitData = analyticsData.visit_status_trends || [];
                                const totalScheduled = visitData.reduce((sum: number, item: any) => sum + (item.scheduled || 0), 0);
                                const totalInProgress = visitData.reduce((sum: number, item: any) => sum + (item.in_progress || 0), 0);
                                const totalCompleted = visitData.reduce((sum: number, item: any) => sum + (item.completed || 0), 0);
                                const totalCancelled = visitData.reduce((sum: number, item: any) => sum + (item.cancelled || 0), 0);
                                const totalVisits = totalScheduled + totalInProgress + totalCompleted + totalCancelled;
                                const completionRate = totalVisits > 0 ? ((totalCompleted / totalVisits) * 100) : 0;
                                
                                return (
                                    <>
                                        <div className="mb-2 grid grid-cols-2 gap-2">
                                            <div className="text-center p-2 bg-purple-50 rounded-lg">
                                                <div className="text-xl font-bold text-purple-600">
                                                    {totalVisits}
                                                </div>
                                                <div className="text-xs text-gray-600">Total Visits (6M)</div>
                                                    </div>
                                            <div className="text-center p-2 bg-green-50 rounded-lg">
                                                <div className="text-xl font-bold text-green-600">
                                                    {completionRate.toFixed(1)}%
                                                    </div>
                                                <div className="text-xs text-gray-600">Completion Rate</div>
                                                </div>
                                            </div>
                                        <div className="mb-2 grid grid-cols-4 gap-1.5">
                                            <div className="text-center p-1.5 bg-blue-50 rounded-lg">
                                                <div className="text-base font-bold text-blue-600">{totalScheduled}</div>
                                                <div className="text-xs text-gray-600">Scheduled</div>
                                        </div>
                                            <div className="text-center p-1.5 bg-yellow-50 rounded-lg">
                                                <div className="text-base font-bold text-yellow-600">{totalInProgress}</div>
                                                <div className="text-xs text-gray-600">In Progress</div>
                                            </div>
                                            <div className="text-center p-1.5 bg-green-50 rounded-lg">
                                                <div className="text-base font-bold text-green-600">{totalCompleted}</div>
                                                <div className="text-xs text-gray-600">Completed</div>
                                            </div>
                                            <div className="text-center p-1.5 bg-red-50 rounded-lg">
                                                <div className="text-base font-bold text-red-600">{totalCancelled}</div>
                                                <div className="text-xs text-gray-600">Cancelled</div>
                                            </div>
                                        </div>
                                        <div className="flex-1 w-full min-h-0 mb-1">
                                            {visitData.length > 0 ? (
                                                <ChartContainer
                                                    config={{
                                                        scheduled: { label: "Scheduled", color: "hsl(220, 70%, 50%)" },
                                                        in_progress: { label: "In Progress", color: "hsl(47, 96%, 53%)" },
                                                        completed: { label: "Completed", color: "hsl(142, 76%, 36%)" },
                                                        cancelled: { label: "Cancelled", color: "hsl(0, 84%, 60%)" },
                                                    }}
                                                    className="h-full w-full"
                                                >
                                                    <BarChart data={visitData} margin={{ top: 10, right: 10, left: 0, bottom: 2 }}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="month" />
                                                        <YAxis allowDecimals={false} />
                                                        <ChartTooltip
                                                            content={<ChartTooltipContent 
                                                                labelFormatter={(label) => `Month: ${label}`}
                                                                formatter={(value: any, name: any) => [
                                                                    `${value} visits`,
                                                                    name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' ')
                                                                ]}
                                                            />}
                                                        />
                                                        <Legend wrapperStyle={{ paddingTop: '4px', paddingBottom: '2px' }} />
                                                        <Bar dataKey="scheduled" fill="hsl(220, 70%, 50%)" name="Scheduled" />
                                                        <Bar dataKey="in_progress" fill="hsl(47, 96%, 53%)" name="In Progress" />
                                                        <Bar dataKey="completed" fill="hsl(142, 76%, 36%)" name="Completed" />
                                                        <Bar dataKey="cancelled" fill="hsl(0, 84%, 60%)" name="Cancelled" />
                                                    </BarChart>
                                                </ChartContainer>
                                            ) : (
                                                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                                                    <div className="text-center">
                                                        <Stethoscope className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Visit Data</h3>
                                                        <p className="text-gray-600">No visit status data available</p>
                                                    </div>
                                    </div>
                                )}
                            </div>
                                    </>
                                );
                            })()}
                        </CardContent>
                    </Card>

                    {/* Inventory Transaction Trends */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-2">
                                <Package2 className="h-5 w-5 text-orange-600" />
                                <div>
                                    <CardTitle className="text-lg font-semibold">Inventory Transaction Trends</CardTitle>
                                    <p className="text-sm text-gray-600">In vs Out transactions over time</p>
                            </div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-3 pt-2 pb-2 flex flex-col">
                            {(() => {
                                const transactionData = analyticsData.inventory_transaction_trends || [];
                                const totalIn = transactionData.reduce((sum: number, item: any) => sum + (item.in || 0), 0);
                                const totalOut = transactionData.reduce((sum: number, item: any) => sum + (item.out || 0), 0);
                                const totalTransactions = totalIn + totalOut;
                                const avgIn = transactionData.length > 0 ? totalIn / transactionData.length : 0;
                                const avgOut = transactionData.length > 0 ? totalOut / transactionData.length : 0;
                                const currentMonth = transactionData[transactionData.length - 1];
                                const previousMonth = transactionData[transactionData.length - 2];
                                const inGrowthRate = previousMonth?.in > 0 ? ((currentMonth?.in || 0) - (previousMonth?.in || 0)) / (previousMonth?.in || 1) * 100 : ((currentMonth?.in || 0) > 0 ? 100 : 0);
                                const outGrowthRate = previousMonth?.out > 0 ? ((currentMonth?.out || 0) - (previousMonth?.out || 0)) / (previousMonth?.out || 1) * 100 : ((currentMonth?.out || 0) > 0 ? 100 : 0);
                                
                                return (
                                    <>
                                        <div className="mb-2 grid grid-cols-2 gap-2">
                                            <div className="text-center p-2 bg-green-50 rounded-lg">
                                                <div className="text-xl font-bold text-green-600">
                                                    {totalIn}
                                                </div>
                                                <div className="text-xs text-gray-600">Total In (6M)</div>
                                            </div>
                                            <div className="text-center p-2 bg-blue-50 rounded-lg">
                                                <div className="text-xl font-bold text-blue-600">
                                                    {Math.round(avgIn)}
                                                </div>
                                                <div className="text-xs text-gray-600">Monthly Average</div>
                                            </div>
                                        </div>
                                        <div className="mb-2 grid grid-cols-2 gap-2">
                                            <div className="text-center p-1.5 bg-red-50 rounded-lg">
                                                <div className="text-base font-bold text-red-600">
                                                    {totalOut}
                                                </div>
                                                <div className="text-xs text-gray-600">Total Out (6M)</div>
                                            </div>
                                            <div className="text-center p-1.5 bg-orange-50 rounded-lg">
                                                <div className={`text-base font-bold flex items-center justify-center gap-1 ${inGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {inGrowthRate >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                    {Math.abs(inGrowthRate).toFixed(1)}%
                                                </div>
                                                <div className="text-xs text-gray-600">In Growth</div>
                                            </div>
                                        </div>
                                        <div className="flex-1 w-full min-h-0 mb-1">
                                            {transactionData.length > 0 ? (
                                                <ChartContainer
                                                    config={{
                                                        in: { label: "In", color: "hsl(142, 76%, 36%)" },
                                                        out: { label: "Out", color: "hsl(0, 84%, 60%)" },
                                                    }}
                                                    className="h-full w-full"
                                                >
                                                    <LineChart
                                                        data={transactionData}
                                                        margin={{ top: 10, right: 10, left: 0, bottom: 2 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="month" />
                                                        <YAxis allowDecimals={false} />
                                                        <ChartTooltip 
                                                            content={<ChartTooltipContent 
                                                                labelFormatter={(label) => `Period: ${label}`}
                                                                formatter={(value: any, name: any) => [
                                                                    `${value} transactions`,
                                                                    name === 'in' ? 'In' : name === 'out' ? 'Out' : name
                                                                ]}
                                                            />}
                                                        />
                                                        <Legend wrapperStyle={{ paddingTop: '4px', paddingBottom: '2px' }} />
                                                        <Line 
                                                            type="monotone" 
                                                            dataKey="in" 
                                                            stroke="hsl(142, 76%, 36%)" 
                                                            strokeWidth={2}
                                                            dot={{ fill: 'hsl(142, 76%, 36%)', strokeWidth: 2, r: 4 }}
                                                            activeDot={{ r: 6, stroke: 'hsl(142, 76%, 36%)', strokeWidth: 2 }}
                                                            name="In"
                                                        />
                                                        <Line 
                                                            type="monotone" 
                                                            dataKey="out" 
                                                            stroke="hsl(0, 84%, 60%)" 
                                                            strokeWidth={2}
                                                            dot={{ fill: 'hsl(0, 84%, 60%)', strokeWidth: 2, r: 4 }}
                                                            activeDot={{ r: 6, stroke: 'hsl(0, 84%, 60%)', strokeWidth: 2 }}
                                                            name="Out"
                                                        />
                                                    </LineChart>
                                                </ChartContainer>
                                            ) : (
                                                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                                                    <div className="text-center">
                                                        <Package2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Transaction Data</h3>
                                                        <p className="text-gray-600">No inventory transaction data available</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                );
                            })()}
                        </CardContent>
                    </Card>

                    {/* Patient Age Groups */}
                    <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-indigo-600" />
                                <div>
                                    <CardTitle className="text-lg font-semibold">Patient Demographics: Age Groups</CardTitle>
                                    <p className="text-sm text-gray-600">Distribution with percentages & trends</p>
                                </div>
                            </div>
                            </CardHeader>
                            <CardContent>
                            <div className="mb-4 grid grid-cols-3 gap-2">
                                <div className="text-center p-2 bg-indigo-50 rounded-lg">
                                    <div className="text-lg font-bold text-indigo-600">
                                        {analyticsData.patient_total || 0}
                                        </div>
                                    <div className="text-xs text-gray-600">Total</div>
                                        </div>
                                <div className="text-center p-2 bg-green-50 rounded-lg">
                                    <div className="text-lg font-bold text-green-600">
                                        {analyticsData.patient_age_groups?.reduce((sum: number, item: any) => sum + (item.thisMonth || 0), 0) || 0}
                                    </div>
                                    <div className="text-xs text-gray-600">New This Month</div>
                                </div>
                                <div className="text-center p-2 bg-blue-50 rounded-lg">
                                    <div className="text-lg font-bold text-blue-600">
                                        {analyticsData.patient_age_groups?.length > 0 
                                            ? Math.max(...analyticsData.patient_age_groups.map((item: any) => item.value || 0))
                                            : 0}
                                    </div>
                                    <div className="text-xs text-gray-600">Largest Group</div>
                                </div>
                            </div>
                            <div className="h-64 w-full mb-4">
                                {analyticsData.patient_age_groups && analyticsData.patient_age_groups.length > 0 ? (
                                            <ChartContainer
                                        config={analyticsData.patient_age_groups.reduce((acc: any, item: any, index: number) => {
                                            const colors = [
                                                "hsl(220, 70%, 50%)",
                                                "hsl(142, 76%, 36%)",
                                                "hsl(47, 96%, 53%)",
                                                "hsl(262, 83%, 58%)",
                                                "hsl(0, 84%, 60%)",
                                            ];
                                            acc[item.name.replace(/\s+/g, '_').toLowerCase()] = {
                                                label: item.name,
                                                color: colors[index % colors.length],
                                            };
                                            return acc;
                                        }, {})}
                                                className="h-full w-full"
                                            >
                                        <BarChart 
                                            data={analyticsData.patient_age_groups} 
                                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                                    <ChartTooltip
                                                        content={<ChartTooltipContent 
                                                    formatter={(value: any, name: any, props: any) => [
                                                        `${value} patients (${props.payload.percentage}%)`,
                                                                name
                                                            ]}
                                                        />}
                                                    />
                                            <Bar dataKey="value" fill="hsl(220, 70%, 50%)" />
                                        </BarChart>
                                            </ChartContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                                                <div className="text-center">
                                            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Age Data</h3>
                                            <p className="text-gray-600">No patient age data available</p>
                                                </div>
                                            </div>
                                        )}
                            </div>
                            {/* Detailed breakdown */}
                            {analyticsData.patient_age_groups && analyticsData.patient_age_groups.length > 0 && (
                                <div className="grid grid-cols-2 gap-2">
                                    {analyticsData.patient_age_groups.map((item: any, index: number) => (
                                        <div key={index} className="p-2 bg-gray-50 rounded-lg text-sm">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-gray-900">{item.name}</span>
                                                <span className="text-xs font-bold text-indigo-600">{item.percentage}%</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-600">{item.value} patients</span>
                                                {item.thisMonth !== undefined && (
                                                    <span className="text-green-600 flex items-center gap-1">
                                                        <UserPlus className="h-3 w-3" />
                                                        {item.thisMonth} new
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Lab Test Performance */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div className="flex items-center gap-2">
                                <TestTube className="h-5 w-5 text-cyan-600" />
                                <div>
                                    <CardTitle className="text-lg font-semibold">Lab Test Performance Analysis</CardTitle>
                                    <p className="text-sm text-gray-600">Top tests with trends & percentages</p>
                                        </div>
                                        </div>
                        </CardHeader>
                        <CardContent className="px-3 py-2">
                            <div className="mb-2 grid grid-cols-2 gap-2">
                                <div className="text-center p-2 bg-cyan-50 rounded-lg">
                                    <div className="text-xl font-bold text-cyan-600">
                                        {analyticsData.lab_test_total || 0}
                                        </div>
                                    <div className="text-xs text-gray-600">Total Tests (6M)</div>
                                        </div>
                                <div className="text-center p-2 bg-green-50 rounded-lg">
                                    <div className="text-xl font-bold text-green-600">
                                        {analyticsData.lab_test_performance?.length > 0 
                                            ? analyticsData.lab_test_performance.length 
                                            : 0}
                                        </div>
                                    <div className="text-xs text-gray-600">Test Types</div>
                                </div>
                            </div>
                            <div className="h-80 w-full mb-2">
                                {analyticsData.lab_test_performance && analyticsData.lab_test_performance.length > 0 ? (
                                    <ChartContainer
                                        config={analyticsData.lab_test_performance.reduce((acc: any, item: any, index: number) => {
                                            const colors = [
                                                "hsl(220, 70%, 50%)",
                                                "hsl(142, 76%, 36%)",
                                                "hsl(47, 96%, 53%)",
                                                "hsl(262, 83%, 58%)",
                                                "hsl(0, 84%, 60%)",
                                            ];
                                            acc[item.name.toLowerCase().replace(/\s+/g, '_')] = {
                                                label: item.name,
                                                color: colors[index % colors.length],
                                            };
                                            return acc;
                                        }, {})}
                                        className="h-full w-full"
                                    >
                                        <BarChart 
                                            data={analyticsData.lab_test_performance} 
                                            margin={{ top: 10, right: 10, left: 0, bottom: 50 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                            <YAxis />
                                            <ChartTooltip
                                                content={<ChartTooltipContent 
                                                    formatter={(value: any, name: any, props: any) => [
                                                        `${value} tests (${props.payload.percentage}%)`,
                                                        name
                                                    ]}
                                                />}
                                            />
                                            <Bar dataKey="count" fill="hsl(220, 70%, 50%)" />
                                        </BarChart>
                                    </ChartContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                                        <div className="text-center">
                                            <TestTube className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Lab Test Data</h3>
                                            <p className="text-gray-600">No lab test performance data available</p>
                    </div>
                </div>
                                )}
                            </div>
                            {/* Detailed breakdown */}
                            {analyticsData.lab_test_performance && analyticsData.lab_test_performance.length > 0 && (
                                <div className="space-y-1.5 max-h-28 overflow-y-auto">
                                    {analyticsData.lab_test_performance.slice(0, 5).map((item: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <div 
                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                    style={{
                                                        backgroundColor: [
                                                            "hsl(220, 70%, 50%)",
                                                            "hsl(142, 76%, 36%)",
                                                            "hsl(47, 96%, 53%)",
                                                            "hsl(262, 83%, 58%)",
                                                            "hsl(0, 84%, 60%)",
                                                        ][index % 5]
                                                    }}
                                                />
                                                <span className="font-medium truncate">{item.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs flex-shrink-0">
                                                <span className="text-gray-600">{item.count} ({item.percentage}%)</span>
                                                {item.trend !== undefined && (
                                                    <span className={`flex items-center gap-1 ${item.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {item.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                        {Math.abs(item.trend)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Appointment Source Distribution */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-orange-600" />
                                <div>
                                    <CardTitle className="text-lg font-semibold">Appointment Source Analysis</CardTitle>
                                    <p className="text-sm text-gray-600">Online vs Walk-in with revenue insights</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-orange-50 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {analyticsData.appointment_source_total || 0}
                                    </div>
                                    <div className="text-xs text-gray-600">Total Appointments</div>
                                        </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {analyticsData.appointment_source_distribution?.reduce((sum: number, item: any) => sum + (item.thisMonth || 0), 0) || 0}
                                    </div>
                                    <div className="text-xs text-gray-600">This Month</div>
                                </div>
                                </div>
                            <div className="h-64 w-full mb-4">
                                {analyticsData.appointment_source_distribution && analyticsData.appointment_source_distribution.length > 0 ? (
                                            <ChartContainer
                                        config={analyticsData.appointment_source_distribution.reduce((acc: any, item: any, index: number) => {
                                            const colors = [
                                                "hsl(142, 76%, 36%)",
                                                "hsl(47, 96%, 53%)",
                                            ];
                                            acc[item.name.toLowerCase().replace(/\s+/g, '_')] = {
                                                label: item.name,
                                                color: colors[index % colors.length],
                                            };
                                            return acc;
                                        }, {})}
                                                className="h-full w-full"
                                            >
                                        <PieChart>
                                            <Pie
                                                data={analyticsData.appointment_source_distribution}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                innerRadius={40}
                                                label={(entry: any) => {
                                                    const percentage = entry.percentage || 0;
                                                    return `${entry.name}: ${percentage.toFixed(1)}%`;
                                                }}
                                                labelLine={false}
                                            >
                                                {analyticsData.appointment_source_distribution.map((entry: any, index: number) => {
                                                    const colors = [
                                                        "hsl(142, 76%, 36%)",
                                                        "hsl(47, 96%, 53%)",
                                                    ];
                                                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                                })}
                                            </Pie>
                                                    <ChartTooltip
                                                        content={<ChartTooltipContent 
                                                    formatter={(value: any, name: any, props: any) => [
                                                        `${value} appointments (${props.payload.percentage}%)`,
                                                                name
                                                            ]}
                                                        />}
                                                    />
                                        </PieChart>
                                            </ChartContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                                        <div className="text-center">
                                            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Source Data</h3>
                                            <p className="text-gray-600">No appointment source data available</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Detailed breakdown */}
                            {analyticsData.appointment_source_distribution && analyticsData.appointment_source_distribution.length > 0 && (
                                <div className="space-y-2">
                                    {analyticsData.appointment_source_distribution.map((item: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="w-4 h-4 rounded-full"
                                                    style={{
                                                        backgroundColor: [
                                                            "hsl(142, 76%, 36%)",
                                                            "hsl(47, 96%, 53%)",
                                                        ][index % 2]
                                                    }}
                                                />
                                                <div>
                                                    <div className="font-medium text-gray-900">{item.name}</div>
                                                    <div className="text-xs text-gray-500">{item.value} appointments</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-gray-900">{item.percentage}%</div>
                                                <div className="text-xs text-gray-500 space-y-1">
                                                    {item.thisMonth !== undefined && (
                                                        <div className="flex items-center gap-1 justify-end">
                                                            <UserPlus className="h-3 w-3" />
                                                            {item.thisMonth} this month
                                                        </div>
                                                    )}
                                                    {item.trend !== undefined && (
                                                        <div className={`flex items-center gap-1 justify-end ${item.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {item.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                            {Math.abs(item.trend)}% trend
                                                        </div>
                                                    )}
                                                    {item.avgRevenue > 0 && (
                                                        <div className="text-blue-600">₱{item.avgRevenue.toFixed(2)} avg</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Monthly Appointments Trend */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <div>
                                    <CardTitle className="text-lg font-semibold">Monthly Appointments Trend Analysis</CardTitle>
                                    <p className="text-sm text-gray-600">Appointment statuses with performance metrics</p>
                                                </div>
                                                </div>
                        </CardHeader>
                        <CardContent className="px-3 pt-2 pb-2 flex flex-col">
                            {(() => {
                                const trendData = analyticsData.monthly_appointments_trend || [];
                                const totalAppointments = trendData.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
                                const totalCompleted = trendData.reduce((sum: number, item: any) => sum + (item.completed || 0), 0);
                                const totalPending = trendData.reduce((sum: number, item: any) => sum + (item.pending || 0), 0);
                                const totalConfirmed = trendData.reduce((sum: number, item: any) => sum + (item.confirmed || 0), 0);
                                const completionRate = totalAppointments > 0 ? ((totalCompleted / totalAppointments) * 100) : 0;
                                const confirmationRate = totalAppointments > 0 ? ((totalConfirmed / totalAppointments) * 100) : 0;
                                const currentMonth = trendData[trendData.length - 1];
                                const previousMonth = trendData[trendData.length - 2];
                                const growthRate = previousMonth?.total > 0 
                                    ? (((currentMonth?.total || 0) - (previousMonth?.total || 0)) / (previousMonth?.total || 1) * 100) 
                                    : ((currentMonth?.total || 0) > 0 ? 100 : 0);
                                
                                return (
                                    <>
                                        <div className="mb-2 grid grid-cols-2 gap-2">
                                            <div className="text-center p-2 bg-blue-50 rounded-lg">
                                                <div className="text-xl font-bold text-blue-600">
                                                    {totalAppointments}
                                                </div>
                                                <div className="text-xs text-gray-600">Total (6M)</div>
                                                </div>
                                            <div className="text-center p-2 bg-green-50 rounded-lg">
                                                <div className="text-xl font-bold text-green-600">
                                                    {completionRate.toFixed(1)}%
                                                </div>
                                                <div className="text-xs text-gray-600">Completion Rate</div>
                                                </div>
                                            </div>
                                        <div className="mb-2 grid grid-cols-4 gap-1.5">
                                            <div className="text-center p-1.5 bg-blue-50 rounded-lg">
                                                <div className="text-base font-bold text-blue-600">{totalAppointments}</div>
                                                <div className="text-xs text-gray-600">Total</div>
                                        </div>
                                            <div className="text-center p-1.5 bg-green-50 rounded-lg">
                                                <div className="text-base font-bold text-green-600">{totalCompleted}</div>
                                                <div className="text-xs text-gray-600">Completed</div>
                                            </div>
                                            <div className="text-center p-1.5 bg-yellow-50 rounded-lg">
                                                <div className="text-base font-bold text-yellow-600">{totalPending}</div>
                                                <div className="text-xs text-gray-600">Pending</div>
                                            </div>
                                            <div className="text-center p-1.5 bg-purple-50 rounded-lg">
                                                <div className="text-base font-bold text-purple-600">{totalConfirmed}</div>
                                                <div className="text-xs text-gray-600">Confirmed</div>
                                            </div>
                                        </div>
                                        {growthRate !== 0 && (
                                            <div className="mb-2 text-center p-1.5 bg-orange-50 rounded-lg">
                                                <div className={`text-xs font-semibold flex items-center justify-center gap-1 ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {growthRate >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                    Monthly Growth: {Math.abs(growthRate).toFixed(1)}%
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex-1 w-full min-h-0 mb-1">
                                            {trendData.length > 0 ? (
                                                <ChartContainer
                                                    config={{
                                                        total: { label: "Total", color: "hsl(220, 70%, 50%)" },
                                                        completed: { label: "Completed", color: "hsl(142, 76%, 36%)" },
                                                        pending: { label: "Pending", color: "hsl(47, 96%, 53%)" },
                                                        confirmed: { label: "Confirmed", color: "hsl(262, 83%, 58%)" },
                                                    }}
                                                    className="h-full w-full"
                                                >
                                                    <LineChart 
                                                        data={trendData} 
                                                        margin={{ top: 10, right: 10, left: 0, bottom: 2 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="month" />
                                                        <YAxis allowDecimals={false} />
                                                        <ChartTooltip
                                                            content={<ChartTooltipContent 
                                                                labelFormatter={(label) => `Month: ${label}`}
                                                                formatter={(value: any, name: any) => [
                                                                    `${value} appointments`,
                                                                    name.charAt(0).toUpperCase() + name.slice(1)
                                                                ]}
                                                            />}
                                                        />
                                                        <Legend wrapperStyle={{ paddingTop: '4px', paddingBottom: '2px' }} />
                                                        <Line 
                                                            type="monotone" 
                                                            dataKey="total" 
                                                            stroke="hsl(220, 70%, 50%)" 
                                                            strokeWidth={3}
                                                            dot={{ fill: 'hsl(220, 70%, 50%)', strokeWidth: 2, r: 4 }}
                                                            activeDot={{ r: 6, stroke: 'hsl(220, 70%, 50%)', strokeWidth: 2 }}
                                                        />
                                                        <Line 
                                                            type="monotone" 
                                                            dataKey="completed" 
                                                            stroke="hsl(142, 76%, 36%)" 
                                                            strokeWidth={2}
                                                            dot={{ fill: 'hsl(142, 76%, 36%)', strokeWidth: 2, r: 4 }}
                                                            activeDot={{ r: 6, stroke: 'hsl(142, 76%, 36%)', strokeWidth: 2 }}
                                                        />
                                                        <Line 
                                                            type="monotone" 
                                                            dataKey="pending" 
                                                            stroke="hsl(47, 96%, 53%)" 
                                                            strokeWidth={2}
                                                            dot={{ fill: 'hsl(47, 96%, 53%)', strokeWidth: 2, r: 4 }}
                                                            activeDot={{ r: 6, stroke: 'hsl(47, 96%, 53%)', strokeWidth: 2 }}
                                                        />
                                                        <Line 
                                                            type="monotone" 
                                                            dataKey="confirmed" 
                                                            stroke="hsl(262, 83%, 58%)" 
                                                            strokeWidth={2}
                                                            dot={{ fill: 'hsl(262, 83%, 58%)', strokeWidth: 2, r: 4 }}
                                                            activeDot={{ r: 6, stroke: 'hsl(262, 83%, 58%)', strokeWidth: 2 }}
                                                        />
                                                    </LineChart>
                                                </ChartContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                                            <div className="text-center">
                                                        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointment Trend Data</h3>
                                                        <p className="text-gray-600">No monthly appointment trend data available</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                    </>
                                );
                            })()}
                        </CardContent>
                    </Card>
                </div>

                {/* Mini Tables Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Recent Patients */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-green-600" />
                                <CardTitle className="text-lg font-semibold">Recent Patients</CardTitle>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/admin/patient">
                                    View all <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {miniTables.recent_patients && miniTables.recent_patients.length > 0 ? (
                                    miniTables.recent_patients.map((patient: any) => (
                                        <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {patient.first_name} {patient.last_name}
                                            </div>
                                                    <div className="text-sm text-gray-600">
                                                        {new Date(patient.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/admin/patient/${patient.id}`}>
                                                    <Eye className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p>No recent patients</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Appointments */}
                <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-green-600" />
                                <CardTitle className="text-lg font-semibold">Recent Appointments</CardTitle>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/admin/appointments">
                                    View all <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                                </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {miniTables.recent_appointments && miniTables.recent_appointments.length > 0 ? (
                                    miniTables.recent_appointments.map((appointment: any) => (
                                        <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                    <Calendar className="h-4 w-4 text-green-600" />
                            </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {appointment.patient_name}
                        </div>
                                                    <div className="text-sm text-gray-600">
                                                        {appointment.specialist_name} • {new Date(appointment.appointment_date).toLocaleDateString()}
                                </div>
                            </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={
                                                    appointment.status === 'completed' ? 'default' :
                                                    appointment.status === 'pending' ? 'secondary' :
                                                    appointment.status === 'cancelled' ? 'destructive' : 'outline'
                                                }>
                                                    {appointment.status}
                                                </Badge>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleViewAppointment(appointment)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                        </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p>No recent appointments</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* View Appointment Modal */}
                {showViewModal && selectedAppointment && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={handleCloseModals}>
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-[101]" onClick={(e) => e.stopPropagation()}>
                            <Card className="border-0">
                                <CardHeader className="bg-white border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                            <Eye className="h-5 w-5 text-black" />
                                            Appointment Details
                                        </CardTitle>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCloseModals}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        {/* Patient Information */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-black mb-4">Patient Information</h3>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="text-sm text-gray-600">Patient Name</div>
                                                        <div className="font-medium text-black">{selectedAppointment.patient_name || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Contact Number</div>
                                                        <div className="font-medium text-black">{selectedAppointment.contact_number || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Appointment Details */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-black mb-4">Appointment Details</h3>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="text-sm text-gray-600">Doctor</div>
                                                        <div className="font-medium text-black">{selectedAppointment.specialist_name || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Date</div>
                                                        <div className="font-medium text-black">
                                                            {safeFormatDate(selectedAppointment.appointment_date)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Time</div>
                                                        <div className="font-medium text-black">
                                                            {safeFormatTime(selectedAppointment.appointment_time)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Duration</div>
                                                        <div className="font-medium text-black">{selectedAppointment.duration || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Type</div>
                                                        <Badge className={getTypeBadge(selectedAppointment.appointment_type)}>
                                                            {formatAppointmentType(selectedAppointment.appointment_type)}
                                                        </Badge>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Status</div>
                                                        <Badge className={getStatusBadge(selectedAppointment.status)}>
                                                            {selectedAppointment.status || 'N/A'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {selectedAppointment.notes && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-black mb-4">Notes</h3>
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <div className="text-gray-700">{selectedAppointment.notes}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <Button
                                            onClick={handleCloseModals}
                                            variant="outline"
                                            className="px-6 py-2"
                                        >
                                            Close
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                handleCloseModals();
                                                router.visit(`/admin/appointments/${selectedAppointment.id}`);
                                            }}
                                            className="bg-black hover:bg-gray-800 text-white px-6 py-2 flex items-center gap-2"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Edit Appointment
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Main Dashboard Content */}
                <div className="mb-8">
                    {/* Today's Appointments */}
                    <Card className="h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-semibold">Today's Appointments</CardTitle>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/admin/appointments">
                                        View all <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                    </CardHeader>
                    <CardContent>
                                <div className="space-y-4">
                                    {today_appointments.length > 0 ? (
                                        today_appointments.slice(0, 3).map((appointment: any) => (
                                            <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <User className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{appointment.patient_name}</div>
                                                        <div className="text-sm text-gray-600">{appointment.appointment_type}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-gray-900">{appointment.appointment_time}</div>
                                                <Badge 
                                                        variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                                                    className={
                                                            appointment.status === 'confirmed' 
                                                            ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                    }
                                                >
                                                        {appointment.status}
                                                </Badge>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments today</h3>
                                            <p className="text-gray-600">All caught up! Great work.</p>
                                        </div>
                                    )}
                        </div>
                    </CardContent>
                </Card>
                </div>

            </div>

        </AppLayout>
    );
}
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
import { Area, AreaChart, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useMemo } from 'react';
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
    Zap
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
                                    <CardTitle className="text-sm font-medium text-blue-800">New Patients Today</CardTitle>
                                    <UserPlus className="h-5 w-5 text-blue-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-blue-900">{stats.new_patients_today || 0}</div>
                                    <p className="text-xs text-blue-700 mt-1">
                                        <TrendingUp className="inline h-3 w-3 mr-1" />
                                        {stats.new_patients_today > 0 ? 'New registrations today' : 'No new patients today'}
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
                                    <CardTitle className="text-sm font-medium text-purple-800">Revenue Today</CardTitle>
                                    <Coins className="h-5 w-5 text-purple-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-purple-900">₱{(stats.today_revenue || 0).toLocaleString()}</div>
                                    <p className="text-xs text-purple-700 mt-1">
                                        <TrendingUp className="inline h-3 w-3 mr-1" />
                                        Total: ₱{(stats.total_revenue || 0).toLocaleString()}
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Patient Registration Trend */}
                    <Card>
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
                                            patients: {
                                                label: "New Patients",
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
                                            <Line 
                                                type="monotone" 
                                                dataKey="patients" 
                                                stroke="hsl(142, 76%, 36%)" 
                                                strokeWidth={3}
                                                dot={{ fill: 'hsl(142, 76%, 36%)', strokeWidth: 2, r: 4 }}
                                                activeDot={{ r: 6, stroke: 'hsl(142, 76%, 36%)', strokeWidth: 2 }}
                                            />
                                            <ChartTooltip 
                                                content={<ChartTooltipContent 
                                                    labelFormatter={(label) => `Period: ${label}`}
                                                    formatter={(value, name) => [
                                                        `${value} new patients`,
                                                        'Patient Registrations'
                                                    ]}
                                                />} 
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

                    {/* Appointments Summary */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-green-600" />
                                <div>
                                    <CardTitle className="text-lg font-semibold">Appointments Summary</CardTitle>
                                    <p className="text-sm text-gray-600">Distribution of appointment statuses</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {Object.values(analyticsData.appointments_summary || {}).reduce((sum: number, count: any) => sum + Number(count), 0)}
                                    </div>
                                    <div className="text-xs text-gray-600">Total Appointments</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {analyticsData.appointments_summary?.completed || 0}
                                    </div>
                                    <div className="text-xs text-gray-600">Completed</div>
                                </div>
                            </div>
                            <div className="h-64 w-full">
                                {analyticsData.appointments_summary && Object.keys(analyticsData.appointments_summary).length > 0 ? (
                                    <ChartContainer
                                        config={{
                                            completed: {
                                                label: "Completed",
                                                color: "hsl(142, 76%, 36%)",
                                            },
                                            pending: {
                                                label: "Pending",
                                                color: "hsl(47, 96%, 53%)",
                                            },
                                            cancelled: {
                                                label: "Cancelled",
                                                color: "hsl(0, 84%, 60%)",
                                            },
                                            confirmed: {
                                                label: "Confirmed",
                                                color: "hsl(220, 70%, 50%)",
                                            },
                                        }}
                                        className="h-full w-full"
                                    >
                                        <PieChart
                                            data={Object.entries(analyticsData.appointments_summary).map(([status, count]) => ({
                                                name: status.charAt(0).toUpperCase() + status.slice(1),
                                                value: Number(count),
                                            }))}
                                            margin={{
                                                top: 20,
                                                right: 20,
                                                bottom: 20,
                                                left: 20,
                                            }}
                                        >
                                            <Pie
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                innerRadius={30}
                                                fill="#8884d8"
                                                data={Object.entries(analyticsData.appointments_summary).map(([status, count]) => ({
                                                    name: status.charAt(0).toUpperCase() + status.slice(1),
                                                    value: Number(count),
                                                }))}
                                            >
                                                {Object.entries(analyticsData.appointments_summary).map(([status, count], index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={
                                                            status === 'completed' ? 'hsl(142, 76%, 36%)' :
                                                            status === 'pending' ? 'hsl(47, 96%, 53%)' :
                                                            status === 'cancelled' ? 'hsl(0, 84%, 60%)' :
                                                            'hsl(220, 70%, 50%)'
                                                        } 
                                                    />
                                                ))}
                                            </Pie>
                                            <ChartTooltip 
                                                content={<ChartTooltipContent 
                                                    formatter={(value, name) => [
                                                        `${value} appointments`,
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
                                            <p className="text-gray-600">No appointment summary data available</p>
                                        </div>
                                    </div>
                                )}
                            </div>
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
                                <Link href="/admin/patients">
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
                                                <Link href={`/admin/patients/${patient.id}`}>
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
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/admin/appointments/${appointment.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
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

                {/* Main Dashboard Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Today's Appointments */}
                    <div className="lg:col-span-1">
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

                    {/* Patient Diagnosis Trends Chart */}
                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-green-600" />
                                    <CardTitle className="text-lg font-semibold">Patient Diagnosis Trends</CardTitle>
                                </div>
                                <Select defaultValue="this-year">
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="this-year">This Year</SelectItem>
                                        <SelectItem value="last-year">Last Year</SelectItem>
                                        <SelectItem value="this-month">This Month</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Showing diagnosis trends for the last 6 months</p>
                                            <p className="text-xs text-green-600 font-medium">Trending up by 5.2% this month</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">January - June 2024</p>
                                        </div>
                                    </div>
                                    
                                    <div className="h-80 w-full">
                                        {chartDiagnosisData && chartDiagnosisData.length > 0 ? (
                                            <ChartContainer
                                                config={{
                                                    hypertension: {
                                                        label: "Hypertension",
                                                        color: "hsl(142, 76%, 36%)",
                                                    },
                                                    diabetes: {
                                                        label: "Diabetes",
                                                        color: "hsl(47, 96%, 53%)",
                                                    },
                                                    cardiovascular: {
                                                        label: "Cardiovascular",
                                                        color: "hsl(220, 70%, 50%)",
                                                    },
                                                    respiratory: {
                                                        label: "Respiratory",
                                                        color: "hsl(262, 83%, 58%)",
                                                    },
                                                    other: {
                                                        label: "Other",
                                                        color: "hsl(0, 84%, 60%)",
                                                    },
                                                }}
                                                className="h-full w-full"
                                            >
                                                <AreaChart
                                                    accessibilityLayer
                                                    data={chartDiagnosisData}
                                                    margin={{
                                                        top: 20,
                                                        right: 30,
                                                        left: 20,
                                                        bottom: 20,
                                                    }}
                                                >
                                                    <defs>
                                                        <linearGradient id="fillHypertension" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8}/>
                                                            <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.1}/>
                                                        </linearGradient>
                                                        <linearGradient id="fillDiabetes" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="hsl(47, 96%, 53%)" stopOpacity={0.8}/>
                                                            <stop offset="95%" stopColor="hsl(47, 96%, 53%)" stopOpacity={0.1}/>
                                                        </linearGradient>
                                                        <linearGradient id="fillCardiovascular" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="hsl(220, 70%, 50%)" stopOpacity={0.8}/>
                                                            <stop offset="95%" stopColor="hsl(220, 70%, 50%)" stopOpacity={0.1}/>
                                                        </linearGradient>
                                                        <linearGradient id="fillRespiratory" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.8}/>
                                                            <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.1}/>
                                                        </linearGradient>
                                                        <linearGradient id="fillOther" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.8}/>
                                                            <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <Area
                                                        dataKey="Hypertension"
                                                        type="natural"
                                                        fill="url(#fillHypertension)"
                                                        fillOpacity={0.4}
                                                        stroke="hsl(142, 76%, 36%)"
                                                        strokeWidth={2}
                                                    />
                                                    <Area
                                                        dataKey="Diabetes"
                                                        type="natural"
                                                        fill="url(#fillDiabetes)"
                                                        fillOpacity={0.4}
                                                        stroke="hsl(47, 96%, 53%)"
                                                        strokeWidth={2}
                                                    />
                                                    <Area
                                                        dataKey="Cardiovascular"
                                                        type="natural"
                                                        fill="url(#fillCardiovascular)"
                                                        fillOpacity={0.4}
                                                        stroke="hsl(220, 70%, 50%)"
                                                        strokeWidth={2}
                                                    />
                                                    <Area
                                                        dataKey="Respiratory"
                                                        type="natural"
                                                        fill="url(#fillRespiratory)"
                                                        fillOpacity={0.4}
                                                        stroke="hsl(262, 83%, 58%)"
                                                        strokeWidth={2}
                                                    />
                                                    <Area
                                                        dataKey="Other"
                                                        type="natural"
                                                        fill="url(#fillOther)"
                                                        fillOpacity={0.4}
                                                        stroke="hsl(0, 84%, 60%)"
                                                        strokeWidth={2}
                                                    />
                                                    <ChartTooltip
                                                        cursor={false}
                                                        content={<ChartTooltipContent 
                                                            indicator="line" 
                                                            labelFormatter={(label) => `Month: ${label}`}
                                                            formatter={(value, name) => [
                                                                `${value} cases`,
                                                                name
                                                            ]}
                                                        />}
                                                    />
                                                </AreaChart>
                                            </ChartContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                                                <div className="text-center">
                                                    <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Diagnosis Data</h3>
                                                    <p className="text-gray-600">No diagnosis trends available for the selected period</p>
                                                </div>
                                            </div>
                                        )}
                            </div>
                            
                                    <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                            <span className="text-sm text-gray-600">Hypertension</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                            <span className="text-sm text-gray-600">Diabetes</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <span className="text-sm text-gray-600">Cardiovascular</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                            <span className="text-sm text-gray-600">Respiratory</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span className="text-sm text-gray-600">Other</span>
                                        </div>
                            </div>
                        </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Lab Tests & Services Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-2">
                                <TestTube className="h-5 w-5 text-green-600" />
                                <div>
                                    <CardTitle className="text-lg font-semibold">Lab Tests & Services</CardTitle>
                                    <p className="text-sm text-gray-600">Performance across different test types</p>
                                </div>
                            </div>
                            <Select defaultValue="april-2025">
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="april-2025">April 2025</SelectItem>
                                    <SelectItem value="march-2025">March 2025</SelectItem>
                                    <SelectItem value="february-2025">February 2025</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900">{stats.total_lab_orders || 0}</div>
                                        <div className="text-sm text-gray-600">Total Lab Orders</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-green-600 font-semibold">
                                            {stats.completed_lab_results || 0}
                                        </div>
                                        <div className="text-sm text-gray-600">completed results</div>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {stats.pending_lab_orders || 0} pending orders • {stats.pending_lab_results || 0} pending verification
                                </div>
                                <div className="h-64 w-full">
                                    {chartConsultationData && Object.keys(chartConsultationData).length > 0 ? (
                                        <div className="h-full w-full">
                                            <ChartContainer
                                                config={{
                                                    bloodTests: {
                                                        label: "Blood Tests",
                                                        color: "hsl(0, 70%, 50%)",
                                                    },
                                                    urinalysis: {
                                                        label: "Urinalysis", 
                                                        color: "hsl(200, 70%, 50%)",
                                                    },
                                                    xray: {
                                                        label: "X-Ray",
                                                        color: "hsl(120, 70%, 50%)",
                                                    },
                                                    ecg: {
                                                        label: "ECG",
                                                        color: "hsl(60, 70%, 50%)",
                                                    },
                                                    consultation: {
                                                        label: "Consultation",
                                                        color: "hsl(300, 70%, 50%)",
                                                    },
                                                    followup: {
                                                        label: "Follow-up",
                                                        color: "hsl(30, 70%, 50%)",
                                                    },
                                                }}
                                                className="h-full w-full"
                                            >
                                                <RadarChart
                                                    data={Object.entries(chartConsultationData).map(([key, value]) => ({
                                                        subject: key,
                                                        A: Number(value),
                                                        fullMark: Math.max(...Object.values(chartConsultationData).map(v => Number(v)))
                                                    }))}
                                                    width={undefined}
                                                    height={250}
                                                    margin={{
                                                        top: 20,
                                                        right: 20,
                                                        bottom: 20,
                                                        left: 20,
                                                    }}
                                                >
                                                    <PolarGrid />
                                                    <PolarAngleAxis dataKey="subject" />
                                                    <PolarRadiusAxis />
                                                    <Radar
                                                        name="Lab Tests & Services"
                                                        dataKey="A"
                                                        stroke="hsl(0, 70%, 50%)"
                                                        fill="hsl(0, 70%, 50%)"
                                                        fillOpacity={0.4}
                                                        strokeWidth={3}
                                                    />
                                                    <ChartTooltip
                                                        content={<ChartTooltipContent 
                                                            formatter={(value, name) => [
                                                                `${value} tests`,
                                                                name
                                                            ]}
                                                        />}
                                                    />
                                                </RadarChart>
                                            </ChartContainer>
                                            
                                            {/* Legend for Lab Tests & Services */}
                                            <div className="grid grid-cols-3 gap-1 mt-3 px-2">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                    <span className="text-xs text-gray-600">Blood</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    <span className="text-xs text-gray-600">Urine</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span className="text-xs text-gray-600">X-Ray</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                                    <span className="text-xs text-gray-600">ECG</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                    <span className="text-xs text-gray-600">Consult</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                    <span className="text-xs text-gray-600">Follow</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                                            <div className="text-center">
                                                <PieChart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Consultation Data</h3>
                                                <p className="text-gray-600">No consultation trends available for the selected period</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
                                {quickActions.map((action, index) => (
                                    <Button
                                        key={index}
                                        asChild
                                        variant="outline"
                                        className="h-auto p-3 hover:shadow-md transition-all duration-300"
                                    >
                                        <Link href={action.href}>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`p-2 rounded-lg ${action.color}`}>
                                                    <action.icon className="h-4 w-4 text-white" />
                                                </div>
                                                <span className="text-xs font-medium text-center">{action.title}</span>
                                            </div>
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Patients Overview Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold">Patients Overview</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input 
                                        placeholder="Search patient..." 
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Button variant="outline" size="sm">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                            <Select defaultValue="all-status">
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all-status">All Status</SelectItem>
                                    <SelectItem value="stable">Stable</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="mild">Mild</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <input type="checkbox" className="rounded" />
                                        </TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Last appointment</TableHead>
                                        <TableHead>Age</TableHead>
                                        <TableHead>Date of birth</TableHead>
                                        <TableHead>Gender</TableHead>
                                        <TableHead>Diagnosis</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recent_appointments.slice(0, 5).map((appointment: any) => (
                                        <TableRow key={appointment.id} className="hover:bg-gray-50">
                                            <TableCell>
                                                <input type="checkbox" className="rounded" />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <User className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{appointment.patient_name}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                {appointment.appointment_date}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                {memoizedRandomData.age}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                {memoizedRandomData.birthDate}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                {memoizedRandomData.gender}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                {memoizedRandomData.diagnosis}
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={memoizedRandomData.isCritical ? 'destructive' : memoizedRandomData.isStable ? 'default' : 'secondary'}
                                                    className={
                                                        memoizedRandomData.isCritical 
                                                            ? 'bg-red-100 text-red-800' 
                                                            : memoizedRandomData.isStable
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                    }
                                                >
                                                    {memoizedRandomData.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </AppLayout>
    );
}
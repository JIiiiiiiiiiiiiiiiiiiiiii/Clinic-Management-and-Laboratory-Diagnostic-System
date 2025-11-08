import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Calendar,
    Coins,
    FlaskConical,
    Package,
    TrendingUp,
    UserCheck,
    Users,
} from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, XAxis, YAxis } from 'recharts';

interface ReportData {
    id: number;
    name: string;
    type: string;
    dateRange: string;
    generatedBy: string;
    status: string;
    lastGenerated: string;
    downloadUrl: string;
}

interface FilterOptions {
    doctors: Array<{ id: number; name: string }>;
    departments: string[];
    statuses: string[];
    payment_methods: string[];
    hmo_providers: string[];
}

interface ReportMetadata {
    generated_at: string;
    generated_by: string;
    generated_by_role: string;
    system_version: string;
}

interface Props {
    summary: {
        total_patients: number;
        total_appointments: number;
        total_transactions: number;
        total_revenue: number;
        total_expenses: number;
        total_lab_orders: number;
        total_products: number;
    };
    recentReports: ReportData[];
    filterOptions: FilterOptions;
    user: {
        name: string;
        role: string;
    };
    metadata: ReportMetadata;
    chartData: {
        monthlyRevenue: Array<{ month: string; revenue: number; patients: number; appointments: number }>;
        patientDemographics: Array<{ name: string; value: number }>;
        appointmentStatus: Array<{ status: string; count: number }>;
        labTestTypes: Array<{ test: string; count: number }>;
        ageGroups: Array<{ age_group: string; count: number }>;
        paymentMethods: Array<{ method: string; count: number }>;
        dailyAppointments: Array<{ day: string; appointments: number }>;
        labResultsDistribution: Array<{ status: string; count: number }>;
        doctorPerformance: Array<{ doctor: string; appointments: number }>;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/admin/reports' },
];

export default function ReportsDashboard({ summary, recentReports, filterOptions, user, metadata, chartData }: Props) {

    return (
        <AppLayout breadcrumbs={breadcrumbs as any}>
            <Head title="Reports Overview" />
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">

                    {/* Overview Section */}
                    <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{(summary?.total_patients || 0).toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground">
                                            <span className="flex items-center text-green-600">
                                                <ArrowUpRight className="mr-1 h-3 w-3" />
                                                +8.2%
                                            </span>
                                            <span className="ml-1">from last month</span>
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                        <Coins className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">₱{(summary?.total_revenue || 0).toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground">
                                            <span className="flex items-center text-green-600">
                                                <ArrowUpRight className="mr-1 h-3 w-3" />
                                                +12.5%
                                            </span>
                                            <span className="ml-1">from last month</span>
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{(summary?.total_appointments || 0).toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground">
                                            <span className="flex items-center text-green-600">
                                                <ArrowUpRight className="mr-1 h-3 w-3" />
                                                +15.3%
                                            </span>
                                            <span className="ml-1">from last month</span>
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Lab Orders</CardTitle>
                                        <FlaskConical className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{(summary?.total_lab_orders || 0).toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground">
                                            <span className="flex items-center text-red-600">
                                                <ArrowDownRight className="mr-1 h-3 w-3" />
                                                -2.1%
                                            </span>
                                            <span className="ml-1">from last month</span>
                                        </p>
                                    </CardContent>
                                </Card>
                </div>

                            {/* Data Visualization Charts */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Monthly Revenue Trend */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-green-600" />
                                            Monthly Revenue Trend
                            </CardTitle>
                                        <CardDescription>Revenue, patients, and appointments over the last 12 months</CardDescription>
                        </CardHeader>
                                    <CardContent>
                                        <div className="h-[350px]">
                                            <ChartContainer
                                                config={{
                                                    revenue: {
                                                        label: 'Revenue (₱)',
                                                        color: '#10b981',
                                                    },
                                                    patients: {
                                                        label: 'New Patients',
                                                        color: '#3b82f6',
                                                    },
                                                    appointments: {
                                                        label: 'Appointments',
                                                        color: '#8b5cf6',
                                                    },
                                                }}
                                                className="h-full w-full"
                                            >
                                                <AreaChart data={chartData?.monthlyRevenue || []}>
                                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                                                    <XAxis
                                                        dataKey="month"
                                                        className="text-sm"
                                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={60}
                                                    />
                                                    <YAxis
                                                        className="text-sm"
                                                        tick={{ fill: '#6b7280' }}
                                                        tickFormatter={(value) => `₱${value.toLocaleString()}`}
                                                    />
                                                    <ChartTooltip
                                                        content={
                                                            <ChartTooltipContent
                                                                formatter={(value, name) => {
                                                                    if (name === 'revenue') {
                                                                        return [`₱${Number(value).toLocaleString()}`, 'Revenue'];
                                                                    }
                                                                    return [value, name];
                                                                }}
                                                            />
                                                        }
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="revenue"
                                                        stackId="1"
                                                        stroke="#10b981"
                                                        fill="#10b981"
                                                        fillOpacity={0.6}
                                                        strokeWidth={2}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="patients"
                                                        stackId="2"
                                                        stroke="#3b82f6"
                                                        fill="#3b82f6"
                                                        fillOpacity={0.6}
                                                        strokeWidth={2}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="appointments"
                                                        stackId="3"
                                                        stroke="#8b5cf6"
                                                        fill="#8b5cf6"
                                                        fillOpacity={0.6}
                                                        strokeWidth={2}
                                                    />
                                                </AreaChart>
                                            </ChartContainer>
                                </div>
                                    </CardContent>
                                </Card>

                                {/* Patient Demographics */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-blue-600" />
                                            Patient Demographics
                                        </CardTitle>
                                        <CardDescription>Gender distribution of registered patients</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[300px]">
                                            <ChartContainer
                                                config={{
                                                    male: {
                                                        label: 'Male',
                                                        color: '#3b82f6',
                                                    },
                                                    female: {
                                                        label: 'Female',
                                                        color: '#ec4899',
                                                    },
                                                }}
                                                className="h-full w-full"
                                            >
                                                <PieChart>
                                                    <Pie
                                                        data={chartData?.patientDemographics || []}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        {(chartData?.patientDemographics || []).map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#ec4899'} />
                                                        ))}
                                                    </Pie>
                                                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => [value, 'Patients']} />} />
                                                </PieChart>
                                            </ChartContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Appointment Status Distribution */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-purple-600" />
                                            Appointment Status
                                        </CardTitle>
                                        <CardDescription>Distribution of appointment statuses</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[300px]">
                                            <ChartContainer
                                                config={{
                                                    Completed: { label: 'Completed', color: '#10b981' },
                                                    Confirmed: { label: 'Confirmed', color: '#3b82f6' },
                                                    Pending: { label: 'Pending', color: '#f59e0b' },
                                                    Cancelled: { label: 'Cancelled', color: '#ef4444' },
                                                    'No Show': { label: 'No Show', color: '#6b7280' },
                                                }}
                                                className="h-full w-full"
                                            >
                                                <BarChart data={chartData?.appointmentStatus || []}>
                                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                                                    <XAxis dataKey="status" className="text-sm" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                                    <YAxis className="text-sm" tick={{ fill: '#6b7280' }} />
                                                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => [value, 'Appointments']} />} />
                                                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ChartContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Daily Appointments */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Activity className="h-5 w-5 text-orange-600" />
                                            Daily Appointments (Last 7 Days)
                                        </CardTitle>
                                        <CardDescription>Appointment trends over the past week</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[300px]">
                                            <ChartContainer
                                                config={{
                                                    appointments: {
                                                        label: 'Appointments',
                                                        color: '#f97316',
                                                    },
                                                }}
                                                className="h-full w-full"
                                            >
                                                <LineChart data={chartData?.dailyAppointments || []}>
                                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                                                    <XAxis dataKey="day" className="text-sm" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                                    <YAxis className="text-sm" tick={{ fill: '#6b7280' }} />
                                                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => [value, 'Appointments']} />} />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="appointments"
                                                        stroke="#f97316"
                                                        strokeWidth={3}
                                                        dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                                                        activeDot={{ r: 6, stroke: '#f97316', strokeWidth: 2 }}
                                                    />
                                                </LineChart>
                                            </ChartContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Age Group Distribution */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <UserCheck className="h-5 w-5 text-indigo-600" />
                                            Age Group Distribution
                                        </CardTitle>
                                        <CardDescription>Patient age demographics</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[300px]">
                                            <ChartContainer
                                                config={{
                                                    count: {
                                                        label: 'Patients',
                                                        color: '#6366f1',
                                                    },
                                                }}
                                                className="h-full w-full"
                                            >
                                                <BarChart data={chartData?.ageGroups || []}>
                                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                                                    <XAxis dataKey="age_group" className="text-sm" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                                    <YAxis className="text-sm" tick={{ fill: '#6b7280' }} />
                                                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => [value, 'Patients']} />} />
                                                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ChartContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Payment Methods */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Coins className="h-5 w-5 text-green-600" />
                                            Payment Methods
                                        </CardTitle>
                                        <CardDescription>Distribution of payment methods used</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[300px]">
                                            <ChartContainer
                                                config={{
                                                    Cash: { label: 'Cash', color: '#10b981' },
                                                    Card: { label: 'Card', color: '#3b82f6' },
                                                    Insurance: { label: 'Insurance', color: '#8b5cf6' },
                                                    HMO: { label: 'HMO', color: '#f59e0b' },
                                                }}
                                                className="h-full w-full"
                                            >
                                                <PieChart>
                                                    <Pie
                                                        data={chartData?.paymentMethods || []}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="count"
                                                    >
                                                        {(chartData?.paymentMethods || []).map((entry, index) => {
                                                            const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];
                                                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                                        })}
                                                    </Pie>
                                                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => [value, 'Transactions']} />} />
                                                </PieChart>
                                            </ChartContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
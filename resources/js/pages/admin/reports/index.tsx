import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Calendar,
    DollarSign,
    Download,
    FileSpreadsheet,
    FileText,
    FlaskConical,
    Package,
    Printer,
    TrendingUp,
    UserCheck,
    Users,
} from 'lucide-react';
import { useState } from 'react';
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

const breadcrumbs = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Reports', href: '/admin/reports' },
];

export default function ReportsAndAnalytics({ summary, recentReports, filterOptions, user, metadata, chartData }: Props) {
    const [activeTab, setActiveTab] = useState('overview');

    const handleExport = (format: string, reportType: string) => {
        const params = new URLSearchParams({
            type: reportType,
            format: format,
        });
        window.location.href = `/admin/reports/export?${params.toString()}`;
    };

    const reportSections = [
        {
            id: 'patients',
            title: 'Patient Reports',
            description: 'Patient demographics, registration trends, and visit analytics',
            icon: Users,
            color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
            href: '/admin/reports/patients',
            stats: {
                total: summary?.total_patients || 0,
                new: Math.floor((summary?.total_patients || 0) * 0.15),
                active: Math.floor((summary?.total_patients || 0) * 0.85),
            },
        },
        {
            id: 'laboratory',
            title: 'Laboratory Reports',
            description: 'Lab orders, test results, and diagnostic analytics',
            icon: FlaskConical,
            color: 'bg-gradient-to-r from-purple-500 to-pink-500',
            href: '/admin/reports/laboratory',
            stats: {
                total: summary?.total_lab_orders || 0,
                pending: Math.floor((summary?.total_lab_orders || 0) * 0.2),
                completed: Math.floor((summary?.total_lab_orders || 0) * 0.8),
            },
        },
        {
            id: 'appointments',
            title: 'Consultation/Appointment Reports',
            description: 'Appointment scheduling, doctor availability, and consultation analytics',
            icon: Calendar,
            color: 'bg-gradient-to-r from-green-500 to-emerald-500',
            href: '/admin/reports/appointments',
            stats: {
                total: summary?.total_appointments || 0,
                scheduled: Math.floor((summary?.total_appointments || 0) * 0.7),
                completed: Math.floor((summary?.total_appointments || 0) * 0.3),
            },
        },
        {
            id: 'inventory',
            title: 'Inventory Reports',
            description: 'Stock levels, supply usage, and inventory management',
            icon: Package,
            color: 'bg-gradient-to-r from-orange-500 to-red-500',
            href: '/admin/reports/inventory',
            stats: {
                total: summary?.total_products || 0,
                low_stock: Math.floor((summary?.total_products || 0) * 0.1),
                in_stock: Math.floor((summary?.total_products || 0) * 0.9),
            },
        },
        {
            id: 'financial',
            title: 'Financial Reports',
            description: 'Revenue, expenses, billing, and financial analytics',
            icon: DollarSign,
            color: 'bg-gradient-to-r from-green-600 to-teal-600',
            href: '/admin/reports/financial',
            stats: {
                revenue: summary?.total_revenue || 0,
                expenses: summary?.total_expenses || 0,
                profit: (summary?.total_revenue || 0) - (summary?.total_expenses || 0),
            },
        },
        {
            id: 'summary',
            title: 'General Summary / Combined Report',
            description: 'Comprehensive overview of all clinic operations and KPIs',
            icon: TrendingUp,
            color: 'bg-gradient-to-r from-indigo-500 to-purple-600',
            href: '/admin/reports/analytics',
            stats: {
                total_patients: summary?.total_patients || 0,
                total_revenue: summary?.total_revenue || 0,
                total_appointments: summary?.total_appointments || 0,
            },
        },
    ];

    return (
        <AppLayout>
            <Head title="Reports Overview" />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Reports Overview</h1>
                                <p className="mt-2 text-gray-600">Comprehensive reporting system for clinic management and decision support</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => window.print()}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print
                                </Button>
                                <Button variant="outline" onClick={() => handleExport('excel', 'summary')}>
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    Export Excel
                                </Button>
                                <Button variant="outline" onClick={() => handleExport('pdf', 'summary')}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Export PDF
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Report Sections */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="reports">Report Modules</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
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
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
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
                                                    count: {
                                                        label: 'Appointments',
                                                        color: '#8b5cf6',
                                                    },
                                                }}
                                                className="h-full w-full"
                                            >
                                                <BarChart data={chartData?.appointmentStatus || []}>
                                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                                                    <XAxis dataKey="status" className="text-sm" tick={{ fill: '#6b7280' }} />
                                                    <YAxis className="text-sm" tick={{ fill: '#6b7280' }} />
                                                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => [value, 'Appointments']} />} />
                                                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ChartContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Lab Test Types */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FlaskConical className="h-5 w-5 text-orange-600" />
                                            Lab Test Types
                                        </CardTitle>
                                        <CardDescription>Most requested laboratory tests</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[300px]">
                                            <ChartContainer
                                                config={{
                                                    count: {
                                                        label: 'Test Count',
                                                        color: '#f59e0b',
                                                    },
                                                }}
                                                className="h-full w-full"
                                            >
                                                <BarChart data={chartData?.labTestTypes || []} layout="horizontal">
                                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                                                    <XAxis type="number" className="text-sm" tick={{ fill: '#6b7280' }} />
                                                    <YAxis
                                                        dataKey="test"
                                                        type="category"
                                                        width={100}
                                                        className="text-sm"
                                                        tick={{ fill: '#6b7280' }}
                                                    />
                                                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => [value, 'Tests']} />} />
                                                    <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                                                </BarChart>
                                            </ChartContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Enhanced Charts Section */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Age Groups Distribution - Enhanced */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-indigo-600" />
                                            Age Groups Distribution
                                        </CardTitle>
                                        <CardDescription>Detailed patient distribution by age groups</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[350px]">
                                            <ChartContainer
                                                config={{
                                                    count: {
                                                        label: 'Patients',
                                                        color: '#10b981',
                                                    },
                                                }}
                                                className="h-full w-full"
                                            >
                                                <BarChart data={chartData?.ageGroups || []}>
                                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                                                    <XAxis
                                                        dataKey="age_group"
                                                        className="text-sm"
                                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={60}
                                                    />
                                                    <YAxis className="text-sm" tick={{ fill: '#6b7280' }} />
                                                    <ChartTooltip
                                                        content={<ChartTooltipContent formatter={(value) => [value, 'Patients']} />}
                                                        labelFormatter={(label) => `Age Group: ${label}`}
                                                    />
                                                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ChartContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Payment Methods - Enhanced with Pie Chart */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <DollarSign className="h-5 w-5 text-green-600" />
                                            Payment Methods
                                        </CardTitle>
                                        <CardDescription>Distribution of payment methods used</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[350px]">
                                            <ChartContainer
                                                config={{
                                                    count: {
                                                        label: 'Transactions',
                                                        color: '#ef4444',
                                                    },
                                                }}
                                                className="h-full w-full"
                                            >
                                                <PieChart data={chartData?.paymentMethods || []}>
                                                    <Pie
                                                        data={chartData?.paymentMethods || []}
                                                        dataKey="count"
                                                        nameKey="method"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={100}
                                                        fill="#8884d8"
                                                        label={({ method, count }) => `${method}: ${count}`}
                                                    >
                                                        {(chartData?.paymentMethods || []).map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][index % 5]}
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <ChartTooltip
                                                        content={<ChartTooltipContent formatter={(value) => [value, 'Transactions']} />}
                                                        labelFormatter={(label) => `Method: ${label}`}
                                                    />
                                                    <Legend />
                                                </PieChart>
                                            </ChartContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* New Additional Charts */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Daily Appointments Trend */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-blue-600" />
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
                                                        color: '#3b82f6',
                                                    },
                                                }}
                                                className="h-full w-full"
                                            >
                                                <LineChart data={chartData?.dailyAppointments || []}>
                                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                                                    <XAxis dataKey="day" className="text-sm" tick={{ fill: '#6b7280' }} />
                                                    <YAxis className="text-sm" tick={{ fill: '#6b7280' }} />
                                                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => [value, 'Appointments']} />} />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="appointments"
                                                        stroke="#3b82f6"
                                                        strokeWidth={3}
                                                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                                        activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                                                    />
                                                </LineChart>
                                            </ChartContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Lab Results Distribution */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FlaskConical className="h-5 w-5 text-purple-600" />
                                            Lab Results Status
                                        </CardTitle>
                                        <CardDescription>Distribution of lab test results</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[300px]">
                                            <ChartContainer
                                                config={{
                                                    count: {
                                                        label: 'Results',
                                                        color: '#8b5cf6',
                                                    },
                                                }}
                                                className="h-full w-full"
                                            >
                                                <PieChart data={chartData?.labResultsDistribution || []}>
                                                    <Pie
                                                        data={chartData?.labResultsDistribution || []}
                                                        dataKey="count"
                                                        nameKey="status"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        label={({ status, count }) => `${status}: ${count}`}
                                                    >
                                                        {(chartData?.labResultsDistribution || []).map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 5]}
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <ChartTooltip
                                                        content={<ChartTooltipContent formatter={(value) => [value, 'Results']} />}
                                                        labelFormatter={(label) => `Status: ${label}`}
                                                    />
                                                    <Legend />
                                                </PieChart>
                                            </ChartContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Doctor Performance Chart */}
                            <div className="grid grid-cols-1 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <UserCheck className="h-5 w-5 text-orange-600" />
                                            Doctor Performance
                                        </CardTitle>
                                        <CardDescription>Top performing doctors by appointment count</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[300px]">
                                            <ChartContainer
                                                config={{
                                                    appointments: {
                                                        label: 'Appointments',
                                                        color: '#f59e0b',
                                                    },
                                                }}
                                                className="h-full w-full"
                                            >
                                                <BarChart data={chartData?.doctorPerformance || []} layout="horizontal">
                                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                                                    <XAxis type="number" className="text-sm" tick={{ fill: '#6b7280' }} />
                                                    <YAxis
                                                        dataKey="doctor"
                                                        type="category"
                                                        width={120}
                                                        className="text-sm"
                                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                                    />
                                                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => [value, 'Appointments']} />} />
                                                    <Bar dataKey="appointments" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                                                </BarChart>
                                            </ChartContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* System Performance Metrics */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Package className="h-5 w-5 text-purple-600" />
                                            Inventory Status
                                        </CardTitle>
                                        <CardDescription>Current stock levels and alerts</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">In Stock</span>
                                                <span className="text-2xl font-bold text-green-600">156</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Low Stock</span>
                                                <span className="text-2xl font-bold text-yellow-600">12</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Out of Stock</span>
                                                <span className="text-2xl font-bold text-red-600">3</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Activity className="h-5 w-5 text-teal-600" />
                                            System Health
                                        </CardTitle>
                                        <CardDescription>System performance indicators</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Server Uptime</span>
                                                <span className="text-2xl font-bold text-green-600">99.9%</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Database Size</span>
                                                <span className="text-2xl font-bold text-blue-600">2.4GB</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Active Users</span>
                                                <span className="text-2xl font-bold text-purple-600">24</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5 text-indigo-600" />
                                            Quick Stats
                                        </CardTitle>
                                        <CardDescription>Today's activity summary</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">New Patients</span>
                                                <span className="text-2xl font-bold text-green-600">8</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Appointments</span>
                                                <span className="text-2xl font-bold text-blue-600">15</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Lab Orders</span>
                                                <span className="text-2xl font-bold text-orange-600">12</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Recent Reports */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Reports</CardTitle>
                                    <CardDescription>Recently generated reports and their status</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Report Name</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Date Range</TableHead>
                                                <TableHead>Generated By</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Last Generated</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(recentReports || []).map((report) => (
                                                <TableRow key={report.id}>
                                                    <TableCell className="font-medium">{report.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">{report.type}</Badge>
                                                    </TableCell>
                                                    <TableCell>{report.dateRange}</TableCell>
                                                    <TableCell>{report.generatedBy}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={report.status === 'Generated' ? 'default' : 'secondary'}>
                                                            {report.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{report.lastGenerated}</TableCell>
                                                    <TableCell>
                                                        <Button variant="outline" size="sm">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="reports" className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {reportSections.map((section) => (
                                    <Card key={section.id} className="relative overflow-hidden transition-shadow hover:shadow-lg">
                                        <div className={`absolute inset-0 ${section.color} opacity-10`} />
                                        <CardHeader className="relative">
                                            <CardTitle className="flex items-center gap-2">
                                                <section.icon className="h-5 w-5" />
                                                {section.title}
                                            </CardTitle>
                                            <CardDescription>{section.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="relative">
                                            <div className="mb-4 grid grid-cols-2 gap-4">
                                                {Object.entries(section.stats).map(([key, value]) => (
                                                    <div key={key} className="text-center">
                                                        <div className="text-2xl font-bold">
                                                            {typeof value === 'number' ? value.toLocaleString() : value}
                                                        </div>
                                                        <div className="text-xs text-gray-600 capitalize">{key.replace('_', ' ')}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button asChild className="flex-1">
                                                    <a href={section.href}>View Report</a>
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleExport('pdf', section.id)}>
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Footer */}
                    <Card className="mt-8">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <div>
                                    <p>
                                        <strong>Generated:</strong> {metadata?.generated_at || new Date().toLocaleString()}
                                    </p>
                                    <p>
                                        <strong>Generated By:</strong> {metadata?.generated_by || user?.name || 'System'} (
                                        {metadata?.generated_by_role || user?.role || 'User'})
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p>
                                        <strong>System Version:</strong> {metadata?.system_version || '1.0.0'}
                                    </p>
                                    <p>
                                        <strong>Clinic:</strong> St. James Clinic Management System
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

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
    { label: 'Hospital Dashboard', href: '/hospital/dashboard' },
    { label: 'Reports', href: '/hospital/reports' },
];

export default function HospitalReportsDashboard({ summary, recentReports, filterOptions, user, metadata, chartData }: Props) {
    const [activeTab, setActiveTab] = useState('overview');

    const handleExport = (format: string, reportType: string) => {
        const params = new URLSearchParams({
            type: reportType,
            format: format,
        });
        window.location.href = `/hospital/reports/export?${params.toString()}`;
    };

    const reportSections = [
        {
            id: 'patients',
            title: 'Patient Reports',
            description: 'Patient demographics, registration trends, and visit reports',
            icon: Users,
            color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
            href: '/hospital/reports/patients',
            stats: {
                total: summary?.total_patients || 0,
                new: Math.floor((summary?.total_patients || 0) * 0.15),
                active: Math.floor((summary?.total_patients || 0) * 0.85),
            },
        },
        {
            id: 'laboratory',
            title: 'Laboratory Reports',
            description: 'Lab orders, test results, and diagnostic reports',
            icon: FlaskConical,
            color: 'bg-gradient-to-r from-purple-500 to-pink-500',
            href: '/hospital/reports/laboratory',
            stats: {
                total: summary?.total_lab_orders || 0,
                pending: Math.floor((summary?.total_lab_orders || 0) * 0.2),
                completed: Math.floor((summary?.total_lab_orders || 0) * 0.8),
            },
        },
        {
            id: 'appointments',
            title: 'Consultation/Appointment Reports',
            description: 'Appointment scheduling, doctor availability, and consultation reports',
            icon: Calendar,
            color: 'bg-gradient-to-r from-green-500 to-emerald-500',
            href: '/hospital/reports/appointments',
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
            href: '/hospital/reports/inventory',
            stats: {
                total: summary?.total_products || 0,
                low_stock: Math.floor((summary?.total_products || 0) * 0.1),
                in_stock: Math.floor((summary?.total_products || 0) * 0.9),
            },
        },
        {
            id: 'financial',
            title: 'Financial Reports',
            description: 'Revenue, expenses, billing, and financial reports',
            icon: DollarSign,
            color: 'bg-gradient-to-r from-green-600 to-teal-600',
            href: '/hospital/reports/billing',
            stats: {
                revenue: summary?.total_revenue || 0,
                expenses: summary?.total_expenses || 0,
                profit: (summary?.total_revenue || 0) - (summary?.total_expenses || 0),
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs as any}>
            <Head title="Hospital Reports Overview" />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                                    <div>
                                <h1 className="text-3xl font-bold text-gray-900">Hospital Reports Overview</h1>
                                <p className="mt-2 text-gray-600">Comprehensive reporting system for hospital management and decision support</p>
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
                                        <strong>Hospital:</strong> St. James Hospital Management System
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
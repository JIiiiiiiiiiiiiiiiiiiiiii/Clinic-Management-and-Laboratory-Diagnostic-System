import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    Download,
    FileText,
    TrendingUp,
    Users,
    FlaskConical,
    Package,
    DollarSign,
} from 'lucide-react';
import { useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, XAxis, YAxis } from 'recharts';

interface AnalyticsData {
    revenue_analytics: {
        total_revenue: number;
        transaction_count: number;
        average_transaction: number;
        payment_methods: Array<{ payment_method: string; count: number; amount: number }>;
    };
    patient_analytics: {
        total_patients: number;
        new_patients: number;
        gender_distribution: Array<{ sex: string; count: number }>;
        age_groups: Array<{ age_group: string; count: number }>;
    };
    appointment_analytics: {
        total_appointments: number;
        status_distribution: Array<{ status: string; count: number }>;
        daily_appointments: Array<{ date: string; count: number }>;
    };
    lab_analytics: {
        total_orders: number;
        status_distribution: Array<{ status: string; count: number }>;
        test_types: Array<{ test_name: string; count: number }>;
    };
    inventory_analytics: {
        total_products: number;
        low_stock_items: number;
        out_of_stock: number;
        category_distribution: Record<string, number>;
    };
}

interface AnalyticsReportsProps {
    analytics: AnalyticsData;
    chartData: any;
    filterOptions?: any;
    metadata?: {
        generated_at: string;
        generated_by: string;
        generated_by_role: string;
        system_version: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/admin/reports' },
    { title: 'Analytics', href: '/admin/reports/analytics' },
];

export default function AnalyticsReports({ analytics, chartData, filterOptions, metadata }: AnalyticsReportsProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
        try {
            setIsExporting(true);
            const params = new URLSearchParams({
                format,
            });
            window.location.href = `/admin/reports/export?type=analytics&${params.toString()}`;

            setTimeout(() => {
                setIsExporting(false);
            }, 2000);
        } catch (error) {
            console.error('Export failed:', error);
            setIsExporting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs as any}>
            <Head title="Analytics Dashboard" />
            <div className="min-h-screen bg-white p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="mb-4 text-4xl font-semibold text-black">Analytics Dashboard</h1>
                                <p className="mt-1 text-sm text-black">Comprehensive analytics and insights for clinic operations</p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => handleExport('excel')} disabled={isExporting} variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Excel
                                </Button>
                                <Button onClick={() => handleExport('pdf')} disabled={isExporting} variant="outline">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Export PDF
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Analytics Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="revenue">Revenue</TabsTrigger>
                            <TabsTrigger value="patients">Patients</TabsTrigger>
                            <TabsTrigger value="appointments">Appointments</TabsTrigger>
                            <TabsTrigger value="laboratory">Laboratory</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            {/* Key Metrics Cards */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <Card className="rounded-xl border-0 bg-white shadow-lg">
                                    <CardHeader className="border-b border-gray-200 bg-white">
                                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                            <DollarSign className="h-5 w-5 text-green-600" />
                                            Total Revenue
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="text-3xl font-bold text-green-600">
                                            {formatCurrency(analytics.revenue_analytics.total_revenue)}
                                        </div>
                                        <p className="text-sm text-gray-600">All transactions</p>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-xl border-0 bg-white shadow-lg">
                                    <CardHeader className="border-b border-gray-200 bg-white">
                                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                            <Users className="h-5 w-5 text-blue-600" />
                                            Total Patients
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="text-3xl font-bold text-blue-600">
                                            {analytics.patient_analytics.total_patients.toLocaleString()}
                                        </div>
                                        <p className="text-sm text-gray-600">Registered patients</p>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-xl border-0 bg-white shadow-lg">
                                    <CardHeader className="border-b border-gray-200 bg-white">
                                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                            <Activity className="h-5 w-5 text-purple-600" />
                                            Appointments
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="text-3xl font-bold text-purple-600">
                                            {analytics.appointment_analytics.total_appointments.toLocaleString()}
                                        </div>
                                        <p className="text-sm text-gray-600">Total appointments</p>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-xl border-0 bg-white shadow-lg">
                                    <CardHeader className="border-b border-gray-200 bg-white">
                                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                            <FlaskConical className="h-5 w-5 text-orange-600" />
                                            Lab Orders
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="text-3xl font-bold text-orange-600">
                                            {analytics.lab_analytics.total_orders.toLocaleString()}
                                        </div>
                                        <p className="text-sm text-gray-600">Laboratory orders</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Charts Grid */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Revenue Trend */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-green-600" />
                                            Revenue Trend
                                        </CardTitle>
                                        <CardDescription>Monthly revenue over time</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[300px]">
                                            <ChartContainer
                                                config={{
                                                    revenue: {
                                                        label: 'Revenue (₱)',
                                                        color: '#10b981',
                                                    },
                                                }}
                                                className="h-full w-full"
                                            >
                                                <AreaChart data={chartData?.monthlyRevenue || []}>
                                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                                                    <XAxis dataKey="month" className="text-sm" tick={{ fill: '#6b7280' }} />
                                                    <YAxis className="text-sm" tick={{ fill: '#6b7280' }} />
                                                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />} />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="revenue"
                                                        stroke="#10b981"
                                                        fill="#10b981"
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
                                        <CardDescription>Gender distribution of patients</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[300px]">
                                            <ChartContainer
                                                config={{
                                                    count: {
                                                        label: 'Patients',
                                                        color: '#3b82f6',
                                                    },
                                                }}
                                                className="h-full w-full"
                                            >
                                                <PieChart>
                                                    <Pie
                                                        data={analytics.patient_analytics.gender_distribution}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ sex, count }) => `${sex}: ${count}`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="count"
                                                    >
                                                        {analytics.patient_analytics.gender_distribution.map((entry, index) => (
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
                        </TabsContent>

                        <TabsContent value="revenue" className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Revenue Summary</CardTitle>
                                        <CardDescription>Financial performance metrics</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Total Revenue</span>
                                                <span className="font-semibold">{formatCurrency(analytics.revenue_analytics.total_revenue)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Transaction Count</span>
                                                <span className="font-semibold">{analytics.revenue_analytics.transaction_count.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Average Transaction</span>
                                                <span className="font-semibold">{formatCurrency(analytics.revenue_analytics.average_transaction)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Payment Methods</CardTitle>
                                        <CardDescription>Distribution of payment methods</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {analytics.revenue_analytics.payment_methods.map((method, index) => (
                                                <div key={index} className="flex justify-between">
                                                    <span className="text-sm">{method.payment_method}</span>
                                                    <span className="text-sm font-semibold">{method.count} ({formatCurrency(method.amount)})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="patients" className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Patient Summary</CardTitle>
                                        <CardDescription>Patient registration metrics</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Total Patients</span>
                                                <span className="font-semibold">{analytics.patient_analytics.total_patients.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">New Patients</span>
                                                <span className="font-semibold">{analytics.patient_analytics.new_patients.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Age Groups</CardTitle>
                                        <CardDescription>Patient distribution by age</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {analytics.patient_analytics.age_groups.map((group, index) => (
                                                <div key={index} className="flex justify-between">
                                                    <span className="text-sm">{group.age_group}</span>
                                                    <span className="text-sm font-semibold">{group.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="appointments" className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Appointment Status</CardTitle>
                                        <CardDescription>Distribution of appointment statuses</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {analytics.appointment_analytics.status_distribution.map((status, index) => (
                                                <div key={index} className="flex justify-between">
                                                    <span className="text-sm">{status.status}</span>
                                                    <Badge variant="secondary">{status.count}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Daily Appointments</CardTitle>
                                        <CardDescription>Appointment trends by day</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[200px]">
                                            <ChartContainer
                                                config={{
                                                    count: {
                                                        label: 'Appointments',
                                                        color: '#3b82f6',
                                                    },
                                                }}
                                                className="h-full w-full"
                                            >
                                                <LineChart data={analytics.appointment_analytics.daily_appointments}>
                                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                                                    <XAxis dataKey="date" className="text-sm" tick={{ fill: '#6b7280' }} />
                                                    <YAxis className="text-sm" tick={{ fill: '#6b7280' }} />
                                                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => [value, 'Appointments']} />} />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="count"
                                                        stroke="#3b82f6"
                                                        strokeWidth={2}
                                                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                                    />
                                                </LineChart>
                                            </ChartContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="laboratory" className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Lab Order Status</CardTitle>
                                        <CardDescription>Distribution of lab order statuses</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {analytics.lab_analytics.status_distribution.map((status, index) => (
                                                <div key={index} className="flex justify-between">
                                                    <span className="text-sm">{status.status}</span>
                                                    <Badge variant="secondary">{status.count}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Popular Test Types</CardTitle>
                                        <CardDescription>Most requested laboratory tests</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {analytics.lab_analytics.test_types.slice(0, 5).map((test, index) => (
                                                <div key={index} className="flex justify-between">
                                                    <span className="text-sm">{test.test_name}</span>
                                                    <span className="text-sm font-semibold">{test.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>

                </div>
            </div>
        </AppLayout>
    );
}

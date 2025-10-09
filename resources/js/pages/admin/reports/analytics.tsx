import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Activity, ArrowDownRight, ArrowUpRight, BarChart3, Calendar, DollarSign, FlaskConical, TrendingDown, TrendingUp, Users } from 'lucide-react';

interface AnalyticsData {
    patients: {
        total: number;
        new_this_month: number;
        growth_rate: number;
    };
    appointments: {
        total: number;
        this_month: number;
        growth_rate: number;
    };
    revenue: {
        total: number;
        this_month: number;
        growth_rate: number;
    };
    lab_orders: {
        total: number;
        this_month: number;
        growth_rate: number;
    };
}

interface AnalyticsReportsProps {
    analytics: AnalyticsData;
}

const breadcrumbs = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Reports & Analytics', href: '/admin/reports' },
    { label: 'Analytics Dashboard', href: '/admin/reports/analytics' },
];

export default function AnalyticsDashboard({ analytics }: AnalyticsReportsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const getGrowthIcon = (rate: number) => {
        if (rate > 0) {
            return <ArrowUpRight className="h-4 w-4 text-green-600" />;
        } else if (rate < 0) {
            return <ArrowDownRight className="h-4 w-4 text-red-600" />;
        }
        return null;
    };

    const getGrowthColor = (rate: number) => {
        if (rate > 0) return 'text-green-600';
        if (rate < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const metricCards = [
        {
            title: 'Total Patients',
            value: analytics.patients.total.toLocaleString(),
            change: analytics.patients.growth_rate,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Total Appointments',
            value: analytics.appointments.total.toLocaleString(),
            change: analytics.appointments.growth_rate,
            icon: Calendar,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(analytics.revenue.total),
            change: analytics.revenue.growth_rate,
            icon: DollarSign,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            title: 'Lab Orders',
            value: analytics.lab_orders.total.toLocaleString(),
            change: analytics.lab_orders.growth_rate,
            icon: FlaskConical,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
    ];

    const monthlyMetrics = [
        {
            title: 'New Patients This Month',
            value: analytics.patients.new_this_month.toLocaleString(),
            icon: Users,
            color: 'text-blue-600',
        },
        {
            title: 'Appointments This Month',
            value: analytics.appointments.this_month.toLocaleString(),
            icon: Calendar,
            color: 'text-green-600',
        },
        {
            title: 'Revenue This Month',
            value: formatCurrency(analytics.revenue.this_month),
            icon: DollarSign,
            color: 'text-purple-600',
        },
        {
            title: 'Lab Orders This Month',
            value: analytics.lab_orders.this_month.toLocaleString(),
            icon: FlaskConical,
            color: 'text-orange-600',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs as any}>
            <Head title="Analytics Dashboard" />
            <div className="min-h-screen bg-white p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <div>
                            <h1 className="mb-4 text-4xl font-semibold text-black">Analytics Dashboard</h1>
                            <p className="mt-1 text-sm text-black">Comprehensive analytics and insights for clinic performance</p>
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="mb-8">
                        <h2 className="mb-6 text-2xl font-semibold text-black">Key Performance Indicators</h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {metricCards.map((metric, index) => (
                                <Card key={index} className="rounded-xl border-0 bg-white shadow-lg">
                                    <CardHeader className="border-b border-gray-200 bg-white">
                                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                            <div className={`rounded-lg p-2 ${metric.bgColor}`}>
                                                <metric.icon className={`h-5 w-5 ${metric.color}`} />
                                            </div>
                                            {metric.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="mb-2 text-3xl font-bold text-black">{metric.value}</div>
                                        <div className={`flex items-center gap-1 text-sm ${getGrowthColor(metric.change)}`}>
                                            {getGrowthIcon(metric.change)}
                                            <span className="font-medium">
                                                {metric.change > 0 ? '+' : ''}
                                                {metric.change}%
                                            </span>
                                            <span className="text-gray-600">vs last month</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Monthly Performance */}
                    <div className="mb-8">
                        <h2 className="mb-6 text-2xl font-semibold text-black">This Month's Performance</h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {monthlyMetrics.map((metric, index) => (
                                <Card key={index} className="rounded-xl border-0 bg-white shadow-lg">
                                    <CardHeader className="border-b border-gray-200 bg-white">
                                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                            <metric.icon className={`h-5 w-5 ${metric.color}`} />
                                            {metric.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="text-2xl font-bold text-black">{metric.value}</div>
                                        <p className="text-sm text-gray-600">Current month</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Growth Analysis */}
                    <div className="mb-8">
                        <h2 className="mb-6 text-2xl font-semibold text-black">Growth Analysis</h2>
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <Card className="rounded-xl border-0 bg-white shadow-lg">
                                <CardHeader className="border-b border-gray-200 bg-white">
                                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                        <TrendingUp className="h-5 w-5 text-green-600" />
                                        Positive Growth Areas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {Object.entries(analytics).map(([key, data]) => {
                                            if (data.growth_rate > 0) {
                                                return (
                                                    <div key={key} className="flex items-center justify-between">
                                                        <span className="text-black capitalize">{key.replace('_', ' ')}</span>
                                                        <div className="flex items-center gap-1 text-green-600">
                                                            <ArrowUpRight className="h-4 w-4" />
                                                            <span className="font-medium">+{data.growth_rate}%</span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-xl border-0 bg-white shadow-lg">
                                <CardHeader className="border-b border-gray-200 bg-white">
                                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                        <TrendingDown className="h-5 w-5 text-red-600" />
                                        Areas for Improvement
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {Object.entries(analytics).map(([key, data]) => {
                                            if (data.growth_rate < 0) {
                                                return (
                                                    <div key={key} className="flex items-center justify-between">
                                                        <span className="text-black capitalize">{key.replace('_', ' ')}</span>
                                                        <div className="flex items-center gap-1 text-red-600">
                                                            <ArrowDownRight className="h-4 w-4" />
                                                            <span className="font-medium">{data.growth_rate}%</span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                        {Object.values(analytics).every((data) => data.growth_rate >= 0) && (
                                            <div className="text-center text-gray-600">
                                                <Activity className="mx-auto mb-2 h-8 w-8" />
                                                <p>All areas showing positive growth!</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Summary Insights */}
                    <Card className="rounded-xl border-0 bg-white shadow-lg">
                        <CardHeader className="border-b border-gray-200 bg-white">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                <BarChart3 className="h-5 w-5 text-black" />
                                Summary Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <h3 className="mb-4 text-lg font-semibold text-black">Performance Highlights</h3>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li>• Total of {analytics.patients.total.toLocaleString()} patients registered</li>
                                        <li>• {analytics.appointments.total.toLocaleString()} appointments scheduled</li>
                                        <li>• {formatCurrency(analytics.revenue.total)} in total revenue</li>
                                        <li>• {analytics.lab_orders.total.toLocaleString()} lab orders processed</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="mb-4 text-lg font-semibold text-black">This Month's Activity</h3>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li>• {analytics.patients.new_this_month.toLocaleString()} new patients registered</li>
                                        <li>• {analytics.appointments.this_month.toLocaleString()} appointments this month</li>
                                        <li>• {formatCurrency(analytics.revenue.this_month)} revenue this month</li>
                                        <li>• {analytics.lab_orders.this_month.toLocaleString()} lab orders this month</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

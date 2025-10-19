import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Activity, ArrowRightLeft, Calendar, DollarSign, Download, FileText, Filter, Hospital, Stethoscope, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface SummaryStats {
    total_patients: number;
    total_appointments: number;
    total_transactions: number;
    total_revenue: number;
    completed_appointments: number;
    pending_appointments: number;
    active_patients: number;
    transferred_patients: number;
    lab_orders: number;
    inventory_items: number;
}

interface ChartData {
    patientTrends: Record<string, number>;
    appointmentTrends: Record<string, number>;
    revenueTrends: Record<string, number>;
    transferTrends: Record<string, number>;
}

interface RecentActivity {
    type: string;
    description: string;
    date: string;
    icon: string;
}

interface DateRange {
    start: string;
    end: string;
    period: string;
    label: string;
}

interface Props {
    user: any;
    summary: SummaryStats;
    chartData: ChartData;
    recentActivities: RecentActivity[];
    dateRange: DateRange;
}

export default function HospitalReports({ user, summary, chartData, recentActivities, dateRange }: Props) {
    const [selectedPeriod, setSelectedPeriod] = useState(dateRange.period);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Hospital Dashboard', href: route('hospital.dashboard') },
        { title: 'Hospital Reports', href: route('hospital.reports.index') },
    ];

    const handlePeriodChange = (period: string) => {
        setSelectedPeriod(period);
        router.get(
            route('hospital.reports.index'),
            { period },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleCustomDateFilter = () => {
        if (customStartDate && customEndDate) {
            router.get(
                route('hospital.reports.index'),
                {
                    start_date: customStartDate,
                    end_date: customEndDate,
                },
                {
                    preserveState: true,
                    replace: true,
                },
            );
        }
    };

    const exportReport = (type: string) => {
        const params = new URLSearchParams({
            period: selectedPeriod,
            ...(customStartDate && customEndDate
                ? {
                      start_date: customStartDate,
                      end_date: customEndDate,
                  }
                : {}),
        });

        // Create a temporary link element to trigger download
        const link = document.createElement('a');
        link.href = route('hospital.reports.export', type) + '?' + params.toString();
        link.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Hospital Reports - Saint James Hospital" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Hospital Reports</h1>
                        <p className="text-muted-foreground">Comprehensive analytics and reporting for Saint James Hospital</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                            {dateRange.label}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            <Hospital className="mr-1 h-3 w-3" />
                            Hospital Interface
                        </Badge>
                    </div>
                </div>

                {/* Date Range Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Date Range Filters
                        </CardTitle>
                        <CardDescription>Filter reports by daily, monthly, yearly, or custom date ranges</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <Label htmlFor="period">Quick Filters</Label>
                                <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Today</SelectItem>
                                        <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                                        <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                                        <SelectItem value="monthly">This Month</SelectItem>
                                        <SelectItem value="yearly">This Year</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input id="start_date" type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
                            </div>

                            <div>
                                <Label htmlFor="end_date">End Date</Label>
                                <Input id="end_date" type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
                            </div>

                            <div className="flex items-end">
                                <Button onClick={handleCustomDateFilter} className="w-full">
                                    Apply Custom Range
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Statistics */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_patients.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">{summary.active_patients} active patients</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_appointments.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                {summary.completed_appointments} completed, {summary.pending_appointments} pending
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{summary.total_revenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Revenue generated in period</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Patient Transfers</CardTitle>
                            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.transferred_patients.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Transferred to clinic</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Report Types */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="patients">Patients</TabsTrigger>
                        <TabsTrigger value="appointments">Appointments</TabsTrigger>
                        <TabsTrigger value="transfers">Transfers</TabsTrigger>
                        <TabsTrigger value="operations">Operations</TabsTrigger>
                        <TabsTrigger value="financial">Financial</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Recent Activities */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        Recent Activities
                                    </CardTitle>
                                    <CardDescription>Latest activities in the selected period</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {recentActivities.slice(0, 8).map((activity, index) => (
                                            <div key={index} className="flex items-center space-x-3">
                                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                <div className="flex-1">
                                                    <p className="text-sm">{activity.description}</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Quick Actions
                                    </CardTitle>
                                    <CardDescription>Generate and export reports</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button variant="outline" onClick={() => exportReport('patients')} className="flex items-center gap-2">
                                            <Download className="h-4 w-4" />
                                            Export Patients
                                        </Button>
                                        <Button variant="outline" onClick={() => exportReport('appointments')} className="flex items-center gap-2">
                                            <Download className="h-4 w-4" />
                                            Export Appointments
                                        </Button>
                                        <Button variant="outline" onClick={() => exportReport('transfers')} className="flex items-center gap-2">
                                            <Download className="h-4 w-4" />
                                            Export Transfers
                                        </Button>
                                        <Button variant="outline" onClick={() => exportReport('financial')} className="flex items-center gap-2">
                                            <Download className="h-4 w-4" />
                                            Export Financial
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="patients">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Patient Reports
                                </CardTitle>
                                <CardDescription>Comprehensive patient analytics and data</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        View detailed patient reports with filtering and export capabilities
                                    </p>
                                    <div className="flex gap-2">
                                        <Button asChild>
                                            <Link href={route('hospital.reports.patients')}>View Patient Reports</Link>
                                        </Button>
                                        <Button variant="outline" onClick={() => exportReport('patients')}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Export
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="appointments">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Appointment Reports
                                </CardTitle>
                                <CardDescription>Appointment scheduling and management analytics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        View appointment trends, scheduling patterns, and completion rates
                                    </p>
                                    <div className="flex gap-2">
                                        <Button asChild>
                                            <Link href={route('hospital.reports.appointments')}>View Appointment Reports</Link>
                                        </Button>
                                        <Button variant="outline" onClick={() => exportReport('appointments')}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Export
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="transfers">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ArrowRightLeft className="h-5 w-5" />
                                    Transfer Reports
                                </CardTitle>
                                <CardDescription>Patient transfer and referral analytics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">View patient transfer patterns between hospital and clinic</p>
                                    <div className="flex gap-2">
                                        <Button asChild>
                                            <Link href={route('hospital.reports.transfers')}>View Transfer Reports</Link>
                                        </Button>
                                        <Button variant="outline" onClick={() => exportReport('transfers')}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Export
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="operations">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Stethoscope className="h-5 w-5" />
                                    Operations Reports
                                </CardTitle>
                                <CardDescription>Hospital operations and clinical activities</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">View laboratory orders, inventory, and operational metrics</p>
                                    <div className="flex gap-2">
                                        <Button asChild>
                                            <Link href={route('hospital.reports.laboratory')}>View Lab Reports</Link>
                                        </Button>
                                        <Button asChild variant="outline">
                                            <Link href={route('hospital.reports.inventory')}>View Inventory</Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="financial">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Financial Reports
                                </CardTitle>
                                <CardDescription>Financial transactions and revenue analytics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">View transaction history, payment methods, and revenue trends</p>
                                    <div className="flex gap-2">
                                        <Button asChild>
                                            <Link href={route('hospital.reports.billing')}>View Financial Reports</Link>
                                        </Button>
                                        <Button variant="outline" onClick={() => exportReport('financial')}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Export
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

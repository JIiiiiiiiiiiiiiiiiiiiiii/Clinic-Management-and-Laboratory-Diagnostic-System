import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Activity, Calendar, ChevronDown, CreditCard, Download, FileText, Filter, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface SummaryStats {
    total_patients: number;
    total_appointments: number;
    total_transactions: number;
    total_revenue: number;
    completed_appointments: number;
    pending_appointments: number;
}

interface ChartData {
    patientTrends: Record<string, number>;
    appointmentTrends: Record<string, number>;
    revenueTrends: Record<string, number>;
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

export default function HospitalReportsIndex({ user, summary, chartData, recentActivities, dateRange }: Props) {
    const [selectedPeriod, setSelectedPeriod] = useState(dateRange.period);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Hospital Dashboard', href: route('hospital.dashboard') },
        { label: 'Reports', href: route('hospital.reports.index') },
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

    const exportReport = async (type: string) => {
        try {
            const params = new URLSearchParams({
                period: selectedPeriod,
                ...(customStartDate && customEndDate
                    ? {
                          start_date: customStartDate,
                          end_date: customEndDate,
                      }
                    : {}),
            });

            // Use direct URL construction to avoid route helper issues
            const exportUrl = `/hospital/reports/export/${type}?${params.toString()}`;
            console.log('Export URL:', exportUrl);

            // Use fetch with credentials to maintain authentication
            const response = await fetch(exportUrl, {
                method: 'GET',
                credentials: 'same-origin', // This is crucial for maintaining authentication
                headers: {
                    Accept: 'text/csv,application/csv',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error(`Export failed: ${response.status} ${response.statusText}`);
            }

            // Check if we got HTML instead of CSV (authentication issue)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                throw new Error('Authentication failed - got HTML instead of CSV. Please refresh the page and try again.');
            }

            // Get the filename from the response headers
            const contentDisposition = response.headers.get('Content-Disposition');
            const filename = contentDisposition
                ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
                : `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the object URL
            window.URL.revokeObjectURL(url);

            console.log('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed: ' + error.message);
        }
    };

    // Export function with format selection
    const exportReportWithFormat = async (type: string, format: 'csv' | 'pdf' | 'excel') => {
        try {
            const params = new URLSearchParams({
                period: selectedPeriod,
                ...(customStartDate && customEndDate
                    ? {
                          start_date: customStartDate,
                          end_date: customEndDate,
                      }
                    : {}),
            });

            let exportUrl: string;
            let filename: string;
            let acceptHeader: string;

            switch (format) {
                case 'csv':
                    exportUrl = `/hospital/reports/export/${type}?${params.toString()}`;
                    filename = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
                    acceptHeader = 'text/csv,application/csv';
                    break;
                case 'pdf':
                    exportUrl = `/hospital/reports/export-pdf/${type}?${params.toString()}`;
                    filename = `${type}_report_${new Date().toISOString().split('T')[0]}.pdf`;
                    acceptHeader = 'application/pdf';
                    break;
                case 'excel':
                    exportUrl = `/hospital/reports/export-excel/${type}?${params.toString()}`;
                    filename = `${type}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
                    acceptHeader = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    break;
                default:
                    throw new Error('Invalid export format');
            }

            console.log('Export URL:', exportUrl);

            // Use fetch with credentials to maintain authentication
            const response = await fetch(exportUrl, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    Accept: acceptHeader,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error(`Export failed: ${response.status} ${response.statusText}`);
            }

            // Check if we got HTML instead of expected format (authentication issue)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                throw new Error('Authentication failed - got HTML instead of file. Please refresh the page and try again.');
            }

            // Get the filename from the response headers
            const contentDisposition = response.headers.get('Content-Disposition');
            const finalFilename = contentDisposition ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') : filename;

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = finalFilename;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the object URL
            window.URL.revokeObjectURL(url);

            console.log('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed: ' + (error instanceof Error ? error.message : String(error)));
        }
    };

    // Simple test export function
    const testExport = async () => {
        try {
            const testUrl = '/hospital/reports/export/patients';
            console.log('Test export URL:', testUrl);

            // Use fetch with credentials to maintain authentication
            const response = await fetch(testUrl, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    Accept: 'text/csv,application/csv',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error(`Test export failed: ${response.status} ${response.statusText}`);
            }

            // Check if we got HTML instead of CSV (authentication issue)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                throw new Error('Authentication failed - got HTML instead of CSV. Please refresh the page and try again.');
            }

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'test_patients_export.csv';
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the object URL
            window.URL.revokeObjectURL(url);

            console.log('Test export completed successfully');
        } catch (error) {
            console.error('Test export failed:', error);
            alert('Test export failed: ' + error.message);
        }
    };

    // Export dropdown component
    const ExportDropdown = ({ type, label = 'Export' }: { type: string; label?: string }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    {label}
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportReportWithFormat(type, 'csv')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportReportWithFormat(type, 'pdf')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportReportWithFormat(type, 'excel')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as Excel
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Hospital Reports Dashboard" />

            <div className="space-y-6 px-4 md:px-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Hospital Reports</h1>
                        <p className="text-muted-foreground">Comprehensive analytics and reporting for St. James Hospital</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                            {dateRange.label}
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
                            <p className="text-xs text-muted-foreground">Registered in selected period</p>
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
                            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_transactions.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Financial transactions processed</p>
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
                </div>

                {/* Report Types */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="patients">Patient Reports</TabsTrigger>
                        <TabsTrigger value="appointments">Appointment Reports</TabsTrigger>
                        <TabsTrigger value="transactions">Transaction Reports</TabsTrigger>
                        <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
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
                                        {recentActivities.slice(0, 5).map((activity, index) => (
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
                                    <div className="grid grid-cols-1 gap-3">
                                        {/* Patients Export */}
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium">Patients Report</h4>
                                            <ExportDropdown type="patients" />
                                        </div>

                                        {/* Appointments Export */}
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium">Appointments Report</h4>
                                            <ExportDropdown type="appointments" />
                                        </div>

                                        {/* Transactions Export */}
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium">Transactions Report</h4>
                                            <ExportDropdown type="transactions" />
                                        </div>

                                        {/* Inventory Export */}
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium">Inventory Report</h4>
                                            <ExportDropdown type="inventory" />
                                        </div>

                                        {/* Test Export */}
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium">Test Export</h4>
                                            <Button
                                                variant="default"
                                                onClick={testExport}
                                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                            >
                                                <Download className="h-4 w-4" />
                                                Test CSV Export
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="patients">
                        <Card>
                            <CardHeader>
                                <CardTitle>Patient Reports</CardTitle>
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
                                        <ExportDropdown type="patients" label="Export" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="appointments">
                        <Card>
                            <CardHeader>
                                <CardTitle>Appointment Reports</CardTitle>
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
                                        <ExportDropdown type="appointments" label="Export" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="transactions">
                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction Reports</CardTitle>
                                <CardDescription>Financial transactions and revenue analytics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">View transaction history, payment methods, and revenue trends</p>
                                    <div className="flex gap-2">
                                        <Button asChild>
                                            <Link href={route('hospital.reports.transactions')}>View Transaction Reports</Link>
                                        </Button>
                                        <ExportDropdown type="transactions" label="Export" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="inventory">
                        <Card>
                            <CardHeader>
                                <CardTitle>Inventory Reports</CardTitle>
                                <CardDescription>Supply and inventory management analytics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">View inventory levels, transaction history, and supply trends</p>
                                    <div className="flex gap-2">
                                        <Button asChild>
                                            <Link href={route('hospital.reports.inventory')}>View Inventory Reports</Link>
                                        </Button>
                                        <ExportDropdown type="inventory" label="Export" />
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

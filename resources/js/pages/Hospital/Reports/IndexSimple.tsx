import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Activity, Calendar, ChevronDown, CreditCard, Download, FileText, Package, Stethoscope, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { title: 'Reports', href: route('hospital.reports.index') },
];

interface Props {
    user: any;
    summary: any;
    chartData: any;
    recentActivities: any;
    dateRange: {
        start: string;
        end: string;
        period: string;
        label: string;
    };
    activeTab: string;
}

export default function HospitalReportsIndex({ user, summary, chartData, recentActivities, dateRange, activeTab }: Props) {
    const [selectedPeriod, setSelectedPeriod] = useState(activeTab);

    // Export function with format selection
    const exportReportWithFormat = async (type: string, format: 'csv' | 'pdf' | 'excel') => {
        try {
            let exportUrl: string;
            let filename: string;
            let acceptHeader: string;

            switch (format) {
                case 'csv':
                    exportUrl = `/hospital/reports/export/${type}`;
                    filename = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
                    acceptHeader = 'text/csv,application/csv';
                    break;
                case 'pdf':
                    exportUrl = `/hospital/reports/export-pdf/${type}`;
                    filename = `${type}_report_${new Date().toISOString().split('T')[0]}.pdf`;
                    acceptHeader = 'application/pdf';
                    break;
                case 'excel':
                    exportUrl = `/hospital/reports/export-excel/${type}`;
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
                credentials: 'same-origin', // This is crucial for maintaining authentication
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

    const reportCards = [
        {
            title: 'Patient Reports',
            description: 'View patient statistics and demographics',
            href: route('hospital.reports.patients'),
            icon: Users,
            color: 'bg-blue-100 text-blue-800',
        },
        {
            title: 'Appointment Reports',
            description: 'Appointment schedules and analytics',
            href: route('hospital.reports.appointments'),
            icon: Calendar,
            color: 'bg-green-100 text-green-800',
        },
        {
            title: 'Transfer Reports',
            description: 'Patient transfer analytics',
            href: route('hospital.reports.transfers'),
            icon: Activity,
            color: 'bg-purple-100 text-purple-800',
        },
        {
            title: 'Laboratory Reports',
            description: 'Lab orders and results',
            href: route('hospital.reports.laboratory'),
            icon: Stethoscope,
            color: 'bg-orange-100 text-orange-800',
        },
        {
            title: 'Inventory Reports',
            description: 'Supply and inventory management',
            href: route('hospital.reports.inventory'),
            icon: Package,
            color: 'bg-yellow-100 text-yellow-800',
        },
        {
            title: 'Financial Reports',
            description: 'Financial transactions and billing',
            href: route('hospital.reports.billing'),
            icon: CreditCard,
            color: 'bg-red-100 text-red-800',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Hospital Reports" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Hospital Reports</h1>
                        <p className="text-muted-foreground">Comprehensive reporting and analytics for St. James Hospital</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Today</SelectItem>
                                <SelectItem value="weekly">This Week</SelectItem>
                                <SelectItem value="monthly">This Month</SelectItem>
                                <SelectItem value="yearly">This Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary?.total_patients || 0}</div>
                            <p className="text-xs text-muted-foreground">{dateRange.label}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary?.total_appointments || 0}</div>
                            <p className="text-xs text-muted-foreground">{dateRange.label}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{summary?.total_revenue?.toLocaleString() || 0}</div>
                            <p className="text-xs text-muted-foreground">{dateRange.label}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Transfers</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary?.active_transfers || 0}</div>
                            <p className="text-xs text-muted-foreground">Pending transfers</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Report Categories */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {reportCards.map((report, index) => (
                        <Card key={index} className="transition-shadow hover:shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <report.icon className="h-5 w-5" />
                                    <span>{report.title}</span>
                                </CardTitle>
                                <CardDescription>{report.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild className="w-full">
                                    <Link href={report.href}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        View Report
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5" />
                            <span>Quick Actions</span>
                        </CardTitle>
                        <CardDescription>Common reporting tasks and exports</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">All Data Export</h4>
                                <ExportDropdown type="all" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Patients Export</h4>
                                <ExportDropdown type="patients" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Financial Export</h4>
                                <ExportDropdown type="transactions" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

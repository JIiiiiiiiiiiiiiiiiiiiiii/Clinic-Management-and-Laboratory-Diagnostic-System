import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Activity, ArrowLeft, Calendar, CheckCircle, ChevronDown, Clock, DollarSign, Download, FileText, Users } from 'lucide-react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { title: 'Reports', href: route('hospital.reports.index') },
    { title: 'Clinic Operations', href: route('hospital.reports.clinic.operations') },
];

interface Props {
    stats: {
        total_patients: number;
        total_appointments: number;
        completed_appointments: number;
        total_revenue: number;
        average_appointment_duration: number;
        patient_satisfaction_score: number;
    };
    dateRange: {
        start: string;
        end: string;
        period: string;
        label: string;
    };
}

export default function HospitalClinicOperationsReports({ stats, dateRange }: Props) {
    // Export function with format selection
    const exportReportWithFormat = async (format: 'csv' | 'pdf' | 'excel') => {
        try {
            const params = new URLSearchParams({
                start_date: dateRange.start,
                end_date: dateRange.end,
            });

            let exportUrl: string;
            let filename: string;
            let acceptHeader: string;

            switch (format) {
                case 'csv':
                    exportUrl = `/hospital/reports/export/all?${params.toString()}`;
                    filename = `clinic_operations_report_${new Date().toISOString().split('T')[0]}.csv`;
                    acceptHeader = 'text/csv,application/csv';
                    break;
                case 'pdf':
                    exportUrl = `/hospital/reports/export-pdf/all?${params.toString()}`;
                    filename = `clinic_operations_report_${new Date().toISOString().split('T')[0]}.pdf`;
                    acceptHeader = 'application/pdf';
                    break;
                case 'excel':
                    exportUrl = `/hospital/reports/export-excel/all?${params.toString()}`;
                    filename = `clinic_operations_report_${new Date().toISOString().split('T')[0]}.xlsx`;
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
    const ExportDropdown = ({ label = 'Export' }: { label?: string }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    {label}
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportReportWithFormat('csv')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportReportWithFormat('pdf')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportReportWithFormat('excel')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as Excel
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clinic Operations Reports - Hospital" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Clinic Operations Reports</h1>
                        <p className="text-muted-foreground">Clinic operations and performance analytics for {dateRange.label}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportDropdown />
                        <Button asChild>
                            <Link href={route('hospital.reports.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Reports
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_patients || 0}</div>
                            <p className="text-xs text-muted-foreground">Registered patients</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_appointments || 0}</div>
                            <p className="text-xs text-muted-foreground">Scheduled appointments</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats?.completed_appointments || 0}</div>
                            <p className="text-xs text-muted-foreground">Completed appointments</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">₱{stats?.total_revenue?.toLocaleString() || 0}</div>
                            <p className="text-xs text-muted-foreground">Total earnings</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                            <Clock className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats?.average_appointment_duration || 0} min</div>
                            <p className="text-xs text-muted-foreground">Average appointment time</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
                            <Activity className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats?.patient_satisfaction_score || 0}/5</div>
                            <p className="text-xs text-muted-foreground">Patient satisfaction</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Operations Overview */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appointment Performance</CardTitle>
                            <CardDescription>Appointment completion and efficiency metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Completion Rate</span>
                                    <Badge variant="outline">
                                        {stats?.total_appointments > 0
                                            ? Math.round((stats.completed_appointments / stats.total_appointments) * 100)
                                            : 0}
                                        %
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Pending Appointments</span>
                                    <Badge variant="outline">{stats?.total_appointments - stats?.completed_appointments || 0}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Average Duration</span>
                                    <Badge variant="outline">{stats?.average_appointment_duration || 0} minutes</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Patient Satisfaction</CardTitle>
                            <CardDescription>Patient experience and feedback metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Overall Rating</span>
                                    <Badge
                                        variant="outline"
                                        className={
                                            stats?.patient_satisfaction_score >= 4 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }
                                    >
                                        {stats?.patient_satisfaction_score || 0}/5
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Total Patients</span>
                                    <Badge variant="outline">{stats?.total_patients || 0}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Revenue per Patient</span>
                                    <Badge variant="outline">
                                        ₱{stats?.total_patients > 0 ? Math.round((stats.total_revenue / stats.total_patients) * 100) / 100 : 0}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Operations Summary</CardTitle>
                        <CardDescription>Key performance indicators for clinic operations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">{stats?.total_appointments || 0}</div>
                                <p className="text-sm text-muted-foreground">Total Appointments</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600">
                                    {stats?.total_appointments > 0 ? Math.round((stats.completed_appointments / stats.total_appointments) * 100) : 0}%
                                </div>
                                <p className="text-sm text-muted-foreground">Completion Rate</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600">₱{stats?.total_revenue?.toLocaleString() || 0}</div>
                                <p className="text-sm text-muted-foreground">Total Revenue</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

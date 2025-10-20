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
import {
    AlertCircle,
    ArrowRightLeft,
    Calendar,
    CheckCircle,
    ChevronDown,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    FileText,
    Filter,
    Hospital,
    Package,
    Phone,
    Stethoscope,
    TrendingUp,
    Users,
    XCircle,
} from 'lucide-react';
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
    low_stock_items: number;
    pending_transfers: number;
}

interface Patient {
    id: number;
    patient_no: string;
    first_name: string;
    last_name: string;
    full_name: string;
    age: number;
    sex: string;
    mobile_no?: string;
    present_address?: string;
    last_visit?: string;
    status: string;
    created_at: string;
}

interface Appointment {
    id: number;
    patient_name: string;
    appointment_date: string;
    appointment_time: string;
    specialist_name: string;
    specialist_type: string;
    status: string;
    price: number;
    created_at: string;
}

interface Transfer {
    id: number;
    patient_name: string;
    from_hospital: boolean;
    to_clinic: string;
    transfer_reason: string;
    priority: string;
    status: string;
    created_at: string;
}

interface Props {
    user: any;
    summary: SummaryStats;
    recentPatients: Patient[];
    recentAppointments: Appointment[];
    recentTransfers: Transfer[];
    dateRange: {
        start: string;
        end: string;
        period: string;
        label: string;
    };
}

export default function ComprehensiveHospitalReports({ user, summary, recentPatients, recentAppointments, recentTransfers, dateRange }: Props) {
    const [selectedPeriod, setSelectedPeriod] = useState(dateRange.period);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Hospital Dashboard', href: route('hospital.dashboard') },
        { title: 'Comprehensive Reports', href: route('hospital.reports.index') },
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

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'active':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'cancelled':
            case 'inactive':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'pending':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            default:
                return <Clock className="h-4 w-4 text-blue-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            completed: 'default',
            active: 'default',
            cancelled: 'destructive',
            inactive: 'secondary',
            pending: 'secondary',
            transferred: 'outline',
        } as const;

        return <Badge variant={variants[status.toLowerCase() as keyof typeof variants] || 'outline'}>{status}</Badge>;
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
            <Head title="Comprehensive Hospital Reports - Saint James Hospital" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Comprehensive Hospital Reports</h1>
                        <p className="text-muted-foreground">Complete analytics and reporting for Saint James Hospital operations</p>
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
                            <p className="text-xs text-muted-foreground">{summary.pending_transfers} pending transfers</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Lab Orders</CardTitle>
                            <Stethoscope className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.lab_orders.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Laboratory orders processed</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.inventory_items.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">{summary.low_stock_items} items low in stock</p>
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
                            {/* Recent Patients */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Recent Patients
                                    </CardTitle>
                                    <CardDescription>Latest patient registrations and updates</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {recentPatients.slice(0, 5).map((patient) => (
                                            <div key={patient.id} className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-1">
                                                    <div className="font-medium">{patient.full_name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        ID: {patient.patient_no} • {patient.age} years old
                                                    </div>
                                                    {patient.mobile_no && (
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Phone className="h-3 w-3" />
                                                            {patient.mobile_no}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end space-y-1">
                                                    <Badge className={getStatusBadge(patient.status).props.className}>{patient.status}</Badge>
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(patient.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4">
                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href={route('hospital.patients.index')}>View All Patients</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Appointments */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Recent Appointments
                                    </CardTitle>
                                    <CardDescription>Latest appointment bookings and updates</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {recentAppointments.slice(0, 5).map((appointment) => (
                                            <div key={appointment.id} className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-1">
                                                    <div className="font-medium">{appointment.patient_name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {appointment.specialist_name} • {appointment.specialist_type}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(appointment.appointment_date).toLocaleDateString()} at{' '}
                                                        {appointment.appointment_time}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(appointment.status)}
                                                        {getStatusBadge(appointment.status)}
                                                    </div>
                                                    <div className="text-xs font-medium">₱{appointment.price.toLocaleString()}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4">
                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href={route('hospital.reports.appointments')}>View All Appointments</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Transfers */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ArrowRightLeft className="h-5 w-5" />
                                    Recent Patient Transfers
                                </CardTitle>
                                <CardDescription>Latest patient transfers between hospital and clinic</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentTransfers.slice(0, 5).map((transfer) => (
                                        <div key={transfer.id} className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="space-y-1">
                                                <div className="font-medium">{transfer.patient_name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {transfer.from_hospital ? 'Hospital' : 'Clinic'} → {transfer.to_clinic || 'Hospital'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">{transfer.transfer_reason}</div>
                                            </div>
                                            <div className="flex flex-col items-end space-y-1">
                                                <Badge className={getPriorityColor(transfer.priority)}>{transfer.priority}</Badge>
                                                {getStatusBadge(transfer.status)}
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(transfer.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4">
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href={route('hospital.reports.transfers')}>View All Transfers</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
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
                                        <ExportDropdown type="patients" label="Export" />
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
                                        <ExportDropdown type="appointments" label="Export" />
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
                                        <ExportDropdown type="transfers" label="Export" />
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
                                        <ExportDropdown type="transactions" label="Export" />
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

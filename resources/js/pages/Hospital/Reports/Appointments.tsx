import ExportDropdown from '@/components/hospital/ExportDropdown';
import PageHeader from '@/components/hospital/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { formatAppointmentTime } from '@/utils/dateTime';
import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, Calendar, CheckCircle, Clock, DollarSign, Filter, Search, User, XCircle } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface Appointment {
    id: number;
    patient_name: string;
    appointment_date: string;
    appointment_time: string;
    specialist_name: string;
    specialist_type: string;
    appointment_type: string;
    status: string;
    price: number;
    created_at: string;
}

interface AppointmentStats {
    total: number;
    by_status: Record<string, number>;
    by_specialist_type: Record<string, number>;
    total_revenue: number;
}

interface DateRange {
    start: string;
    end: string;
    period: string;
    label: string;
}

interface Props {
    user: any;
    appointments: {
        data: Appointment[];
        links: any[];
        meta: any;
    };
    stats: AppointmentStats;
    dateRange: DateRange;
    filters: {
        search?: string;
        status?: string;
        specialist_type?: string;
    };
}

export default function HospitalAppointmentReports({ user, appointments, stats, dateRange, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [specialistType, setSpecialistType] = useState(filters.specialist_type || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Hospital Dashboard', href: route('hospital.dashboard') },
        { title: 'Reports', href: route('hospital.reports.index') },
        { title: 'Appointment Reports', href: route('hospital.reports.appointments') },
    ];

    const handleFilter = () => {
        router.get(
            route('hospital.reports.appointments'),
            {
                search: search || undefined,
                status: status || undefined,
                specialist_type: specialistType || undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setSpecialistType('');
        router.get(
            route('hospital.reports.appointments'),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    // Export function with format selection
    const exportReportWithFormat = async (format: 'csv' | 'pdf' | 'excel') => {
        try {
            const params = new URLSearchParams({
                search: search || '',
                status: status || '',
                specialist_type: specialistType || '',
            });

            let exportUrl: string;
            let filename: string;
            let acceptHeader: string;

            switch (format) {
                case 'csv':
                    exportUrl = `/hospital/reports/export/appointments?${params.toString()}`;
                    filename = `appointments_report_${new Date().toISOString().split('T')[0]}.csv`;
                    acceptHeader = 'text/csv,application/csv';
                    break;
                case 'pdf':
                    exportUrl = `/hospital/reports/export-pdf/appointments?${params.toString()}`;
                    filename = `appointments_report_${new Date().toISOString().split('T')[0]}.pdf`;
                    acceptHeader = 'application/pdf';
                    break;
                case 'excel':
                    exportUrl = `/hospital/reports/export-excel/appointments?${params.toString()}`;
                    filename = `appointments_report_${new Date().toISOString().split('T')[0]}.xlsx`;
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
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'cancelled':
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
            cancelled: 'destructive',
            pending: 'secondary',
            confirmed: 'outline',
        } as const;

        return <Badge variant={variants[status.toLowerCase() as keyof typeof variants] || 'outline'}>{status}</Badge>;
    };

    // Shared export dropdown (uses shared component)
    const renderExport = () => <ExportDropdown onSelect={(fmt) => exportReportWithFormat(fmt)} />;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appointment Reports - Hospital" />

            <div className="space-y-6 px-4 md:px-6">
                {/* Header */}
                <PageHeader
                    title="Appointment Reports"
                    description={`Appointment scheduling and management analytics for ${dateRange.label}`}
                    badgeText={dateRange.label}
                    trailing={
                        <div className="flex items-center gap-2">
                            {renderExport()}
                            <Button asChild>
                                <Link href={route('hospital.reports.index')}>Back to Dashboard</Link>
                            </Button>
                        </div>
                    }
                />

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Scheduled in selected period</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {Object.entries(stats.by_status).map(([status, count]) => (
                                    <div key={status} className="flex justify-between text-sm">
                                        <span className="capitalize">{status}</span>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Specialist Types</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {Object.entries(stats.by_specialist_type).map(([type, count]) => (
                                    <div key={type} className="flex justify-between text-sm">
                                        <span className="capitalize">{type}</span>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{stats.total_revenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Revenue from appointments</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                        <CardDescription>Filter appointments by various criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Patient name, specialist..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="specialist_type">Specialist Type</Label>
                                <Select value={specialistType} onValueChange={setSpecialistType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Types</SelectItem>
                                        <SelectItem value="doctor">Doctor</SelectItem>
                                        <SelectItem value="specialist">Specialist</SelectItem>
                                        <SelectItem value="consultant">Consultant</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end gap-2">
                                <Button onClick={handleFilter} className="flex-1">
                                    Apply Filters
                                </Button>
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Appointments Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Appointment Records</CardTitle>
                        <CardDescription>{appointments.meta.total} appointments found</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Specialist</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {appointments.data.map((appointment) => (
                                        <TableRow key={appointment.id}>
                                            <TableCell>
                                                <div className="font-medium">{appointment.patient_name}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{new Date(appointment.appointment_date).toLocaleDateString()}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {formatAppointmentTime(appointment.appointment_time)}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{appointment.specialist_name}</div>
                                                    <div className="text-sm text-muted-foreground capitalize">{appointment.specialist_type}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{appointment.appointment_type}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(appointment.status)}
                                                    {getStatusBadge(appointment.status)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">₱{appointment.price.toLocaleString()}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm">
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {appointments.links && appointments.links.length > 3 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {appointments.meta.from} to {appointments.meta.to} of {appointments.meta.total} results
                                </div>
                                <div className="flex gap-1">
                                    {appointments.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

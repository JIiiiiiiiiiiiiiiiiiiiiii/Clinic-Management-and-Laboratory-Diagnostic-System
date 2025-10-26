import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { 
    ArrowLeft, 
    Calendar,
    Download,
    FileText,
    Users,
    BarChart3,
    Eye,
    CalendarDays,
    CalendarRange,
    Clock,
    User,
    Phone,
    Stethoscope,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowUpDown,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';
import { useState } from 'react';
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table';
import * as React from 'react';

type Summary = {
    total_appointments: number;
    pending_appointments: number;
    confirmed_appointments: number;
    completed_appointments: number;
    cancelled_appointments: number;
    total_revenue: number;
    online_appointments: number;
    walk_in_appointments: number;
    doctor_appointments: number;
    medtech_appointments: number;
    nurse_appointments: number;
};

type Appointment = {
    id: number;
    appointment_code: string;
    patient_name: string;
    patient_id: number;
    contact_number: string;
    appointment_type: string;
    specialist_type: string;
    specialist_name: string;
    specialist_id: number;
    appointment_date: string;
    appointment_time: string;
    duration: string;
    price: number;
    status: string;
    source: string;
    created_at: string;
    notes?: string;
    special_requirements?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/admin/reports' },
    { title: 'Appointments', href: '/admin/reports/appointments' },
];

// Column definitions for the appointments table
const columns: ColumnDef<Appointment>[] = [
    {
        accessorKey: 'appointment_code',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Appointment Code
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("appointment_code")}</div>
        ),
    },
    {
        accessorKey: 'patient_name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Patient Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const appointment = row.original;
            return (
                <div>
                    <div className="font-medium">{appointment.patient_name}</div>
                    <div className="text-xs text-gray-500">ID: {appointment.patient_id}</div>
                </div>
            );
        },
    },
    {
        accessorKey: 'contact_number',
        header: "Contact",
        cell: ({ row }) => (
            <div className="text-sm">{row.getValue("contact_number")}</div>
        ),
    },
    {
        accessorKey: 'specialist_name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Specialist
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const appointment = row.original;
            return (
                <div>
                    <div className="font-medium">{appointment.specialist_name}</div>
                    <div className="text-xs text-gray-500">{appointment.specialist_type}</div>
                </div>
            );
        },
    },
    {
        accessorKey: 'appointment_date',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = new Date(row.getValue("appointment_date"));
            return (
                <div className="text-sm">
                    {date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    })}
                </div>
            );
        },
    },
    {
        accessorKey: 'appointment_time',
        header: "Time",
        cell: ({ row }) => (
            <div className="text-sm">{row.getValue("appointment_time")}</div>
        ),
    },
    {
        accessorKey: 'price',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">₱{Number(row.getValue("price") || 0).toFixed(2)}</div>
        ),
    },
    {
        accessorKey: 'status',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const getStatusIcon = (status: string) => {
                switch (status.toLowerCase()) {
                    case 'completed':
                        return <CheckCircle className="h-4 w-4 text-green-500" />;
                    case 'confirmed':
                        return <Clock className="h-4 w-4 text-blue-500" />;
                    case 'pending':
                        return <AlertCircle className="h-4 w-4 text-orange-500" />;
                    case 'cancelled':
                        return <XCircle className="h-4 w-4 text-red-500" />;
                    default:
                        return <AlertCircle className="h-4 w-4 text-gray-500" />;
                }
            };
            const getStatusColor = (status: string) => {
                switch (status.toLowerCase()) {
                    case 'completed':
                        return 'bg-green-100 text-green-800 border-green-200';
                    case 'confirmed':
                        return 'bg-blue-100 text-blue-800 border-blue-200';
                    case 'pending':
                        return 'bg-orange-100 text-orange-800 border-orange-200';
                    case 'cancelled':
                        return 'bg-red-100 text-red-800 border-red-200';
                    default:
                        return 'bg-gray-100 text-gray-800 border-gray-200';
                }
            };
            return (
                <Badge className={`${getStatusColor(status)} border`}>
                    {getStatusIcon(status)}
                    <span className="ml-1">{status}</span>
                </Badge>
            );
        },
    },
    {
        accessorKey: 'source',
        header: "Source",
        cell: ({ row }) => {
            const source = row.getValue("source") as string;
            return (
                <Badge variant="outline" className="capitalize">
                    {source}
                </Badge>
            );
        },
    },
];

export default function AppointmentsSimple({ 
    summary,
    appointments = [],
    filters = {}
}: { 
    summary?: Summary;
    appointments?: Appointment[];
    filters?: any;
}) {
    const [selectedDate, setSelectedDate] = useState(filters?.date || new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState(filters?.month || new Date().toISOString().slice(0, 7));
    const [selectedYear, setSelectedYear] = useState(filters?.year || new Date().getFullYear().toString());
    const [activeTab, setActiveTab] = useState(filters?.report_type || 'monthly');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'all');
    const [selectedSpecialist, setSelectedSpecialist] = useState(filters?.specialist_type || 'all');
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // TanStack Table state
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = React.useState('');

    // Provide default values for summary
    const defaultSummary: Summary = {
        total_appointments: 0,
        pending_appointments: 0,
        confirmed_appointments: 0,
        completed_appointments: 0,
        cancelled_appointments: 0,
        total_revenue: 0,
        online_appointments: 0,
        walk_in_appointments: 0,
        doctor_appointments: 0,
        medtech_appointments: 0,
        nurse_appointments: 0,
    };

    const safeSummary = summary || defaultSummary;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-PH', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'confirmed':
                return <CheckCircle className="h-4 w-4 text-blue-600" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'pending':
                return <AlertCircle className="h-4 w-4 text-yellow-600" />;
            default:
                return <Clock className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleDailyReport = () => {
        router.get('/admin/reports/appointments', {
            date: selectedDate,
            report_type: 'daily',
            status: selectedStatus,
            specialist_type: selectedSpecialist,
        });
    };

    const handleMonthlyReport = () => {
        router.get('/admin/reports/appointments', {
            month: selectedMonth,
            report_type: 'monthly',
            status: selectedStatus,
            specialist_type: selectedSpecialist,
        });
    };

    const handleYearlyReport = () => {
        router.get('/admin/reports/appointments', {
            year: selectedYear,
            report_type: 'yearly',
            status: selectedStatus,
            specialist_type: selectedSpecialist,
        });
    };

    const handleExport = async (reportType: string, format: string) => {
        try {
            setIsExporting(true);
            const params: any = { 
                format, 
                report_type: reportType,
                status: selectedStatus,
                specialist_type: selectedSpecialist
            };
            
            if (reportType === 'daily') {
                params.date = selectedDate;
            } else if (reportType === 'monthly') {
                params.month = selectedMonth;
            } else if (reportType === 'yearly') {
                params.year = selectedYear;
            }

            window.location.href = `/admin/reports/appointments/export?${new URLSearchParams(params).toString()}`;

            setTimeout(() => {
                setIsExporting(false);
            }, 2000);
        } catch (error) {
            console.error('Export failed:', error);
            setIsExporting(false);
        }
    };

    // Initialize table
    const table = useReactTable({
        data: appointments || [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, columnId, value) => {
            const search = value.toLowerCase();
            const appointment = row.original;
            return (
                appointment.patient_name?.toLowerCase().includes(search) ||
                appointment.appointment_code?.toLowerCase().includes(search) ||
                appointment.specialist_name?.toLowerCase().includes(search) ||
                appointment.contact_number?.toLowerCase().includes(search) ||
                appointment.status?.toLowerCase().includes(search) ||
                appointment.source?.toLowerCase().includes(search)
            );
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appointments Report" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button asChild variant="outline" className="h-12 w-12">
                                <Link href="/admin/reports">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <Heading 
                                title="Appointments Report" 
                                description="Comprehensive appointment analytics and reporting system" 
                                icon={Calendar} 
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Button onClick={() => handleExport(activeTab, 'excel')} variant="outline">
                                <Download className="mr-2 h-5 w-5" />
                                Export Excel
                            </Button>
                            <Button onClick={() => handleExport(activeTab, 'pdf')} variant="outline">
                                <Download className="mr-2 h-5 w-5" />
                                Export PDF
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Report Type Tabs */}
                <Card className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <CardContent className="p-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="daily" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Daily Report
                                </TabsTrigger>
                                <TabsTrigger value="monthly" className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4" />
                                    Monthly Report
                                </TabsTrigger>
                                <TabsTrigger value="yearly" className="flex items-center gap-2">
                                    <CalendarRange className="h-4 w-4" />
                                    Yearly Report
                                </TabsTrigger>
                            </TabsList>

                            {/* Daily Report Tab */}
                            <TabsContent value="daily" className="mt-6">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Select Date</Label>
                                            <Input
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                            />
                                        </div>
                                        <Button onClick={handleDailyReport} className="h-12 px-6">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            Generate Daily Report
                                        </Button>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleExport('daily', 'excel')}
                                            className="h-12"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Excel
                                        </Button>
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleExport('daily', 'pdf')}
                                            className="h-12"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export PDF
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Monthly Report Tab */}
                            <TabsContent value="monthly" className="mt-6">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Select Month</Label>
                                            <Input
                                                type="month"
                                                value={selectedMonth}
                                                onChange={(e) => setSelectedMonth(e.target.value)}
                                                className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                            />
                                        </div>
                                        <Button onClick={handleMonthlyReport} className="h-12 px-6">
                                            <CalendarDays className="mr-2 h-4 w-4" />
                                            Generate Monthly Report
                                        </Button>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleExport('monthly', 'excel')}
                                            className="h-12"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Excel
                                        </Button>
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleExport('monthly', 'pdf')}
                                            className="h-12"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export PDF
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Yearly Report Tab */}
                            <TabsContent value="yearly" className="mt-6">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Select Year</Label>
                                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                                <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from({ length: 10 }, (_, i) => {
                                                        const year = new Date().getFullYear() - i;
                                                        return (
                                                            <SelectItem key={year} value={year.toString()}>
                                                                {year}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button onClick={handleYearlyReport} className="h-12 px-6">
                                            <CalendarRange className="mr-2 h-4 w-4" />
                                            Generate Yearly Report
                                        </Button>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleExport('yearly', 'excel')}
                                            className="h-12"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Excel
                                        </Button>
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleExport('yearly', 'pdf')}
                                            className="h-12"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export PDF
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Additional Filters */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Specialist Type</Label>
                                    <Select value={selectedSpecialist} onValueChange={setSelectedSpecialist}>
                                        <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Specialists</SelectItem>
                                            <SelectItem value="doctor">Doctor</SelectItem>
                                            <SelectItem value="medtech">MedTech</SelectItem>
                                            <SelectItem value="nurse">Nurse</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-2 text-gray-600">Loading appointment data...</span>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Calendar className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">{safeSummary.total_appointments}</div>
                                            <div className="text-sm text-gray-600">Total Appointments</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">{safeSummary.completed_appointments}</div>
                                            <div className="text-sm text-gray-600">Completed</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <AlertCircle className="h-6 w-6 text-yellow-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">{safeSummary.pending_appointments}</div>
                                            <div className="text-sm text-gray-600">Pending</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <BarChart3 className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(safeSummary.total_revenue)}</div>
                                            <div className="text-sm text-gray-600">Total Revenue</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Appointments Table */}
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                    <Calendar className="h-5 w-5 text-black" />
                                    Appointments Report
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {/* Table Controls */}
                                <div className="flex items-center py-4">
                                    <Input
                                        placeholder="Search appointments..."
                                        value={globalFilter ?? ""}
                                        onChange={(event) => setGlobalFilter(event.target.value)}
                                        className="max-w-sm"
                                    />
                                    <Button
                                        onClick={() => handleExport(activeTab, 'excel')}
                                        disabled={isExporting}
                                        className="bg-green-600 hover:bg-green-700 text-white ml-4"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Export Excel
                                    </Button>
                                    <Button
                                        onClick={() => handleExport(activeTab, 'pdf')}
                                        disabled={isExporting}
                                        variant="outline"
                                        className="ml-2"
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Export PDF
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="ml-auto">
                                                Columns <ChevronDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                                            {table
                                                .getAllColumns()
                                                .filter((column) => column.getCanHide())
                                                .map((column) => {
                                                    return (
                                                        <DropdownMenuCheckboxItem
                                                            key={column.id}
                                                            className="capitalize"
                                                            checked={column.getIsVisible()}
                                                            onCheckedChange={(value) => {
                                                                column.toggleVisibility(!!value);
                                                            }}
                                                            onSelect={(e) => {
                                                                e.preventDefault();
                                                            }}
                                                        >
                                                            {column.id}
                                                        </DropdownMenuCheckboxItem>
                                                    )
                                                })}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                        
                                {/* Table */}
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            {table.getHeaderGroups().map((headerGroup) => (
                                                <TableRow key={headerGroup.id}>
                                                    {headerGroup.headers.map((header) => {
                                                        return (
                                                            <TableHead key={header.id}>
                                                                {header.isPlaceholder
                                                                    ? null
                                                                    : flexRender(
                                                                        header.column.columnDef.header,
                                                                        header.getContext()
                                                                    )}
                                                            </TableHead>
                                                        )
                                                    })}
                                                </TableRow>
                                            ))}
                                        </TableHeader>
                                        <TableBody>
                                            {table.getRowModel().rows?.length ? (
                                                table.getRowModel().rows.map((row) => (
                                                    <TableRow
                                                        key={row.id}
                                                        data-state={row.getIsSelected() && "selected"}
                                                    >
                                                        {row.getVisibleCells().map((cell) => (
                                                            <TableCell key={cell.id}>
                                                                {flexRender(
                                                                    cell.column.columnDef.cell,
                                                                    cell.getContext()
                                                                )}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={columns.length}
                                                        className="h-24 text-center"
                                                    >
                                                        <div className="flex flex-col items-center">
                                                            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                            <h3 className="mb-2 text-lg font-semibold text-gray-600">No appointments found</h3>
                                                            <p className="text-gray-500">Appointments will appear here when available</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                
                                {/* Pagination */}
                                <div className="flex items-center justify-between px-2 py-4">
                                    <div className="text-muted-foreground flex-1 text-sm">
                                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                                        {table.getFilteredRowModel().rows.length} row(s) selected.
                                    </div>
                                    <div className="flex items-center space-x-6 lg:space-x-8">
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm font-medium">Rows per page</p>
                                            <Select
                                                value={`${table.getState().pagination.pageSize}`}
                                                onValueChange={(value) => {
                                                    table.setPageSize(Number(value))
                                                }}
                                            >
                                                <SelectTrigger className="h-8 w-[70px]">
                                                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                                                </SelectTrigger>
                                                <SelectContent side="top">
                                                    {[10, 20, 30, 40, 50].map((pageSize) => (
                                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                                            {pageSize}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                            Page {table.getState().pagination.pageIndex + 1} of{" "}
                                            {table.getPageCount()}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="hidden size-8 lg:flex"
                                                onClick={() => table.setPageIndex(0)}
                                                disabled={!table.getCanPreviousPage()}
                                            >
                                                <span className="sr-only">Go to first page</span>
                                                <ChevronsLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => table.previousPage()}
                                                disabled={!table.getCanPreviousPage()}
                                            >
                                                <span className="sr-only">Go to previous page</span>
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => table.nextPage()}
                                                disabled={!table.getCanNextPage()}
                                            >
                                                <span className="sr-only">Go to next page</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="hidden size-8 lg:flex"
                                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                                disabled={!table.getCanNextPage()}
                                            >
                                                <span className="sr-only">Go to last page</span>
                                                <ChevronsRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

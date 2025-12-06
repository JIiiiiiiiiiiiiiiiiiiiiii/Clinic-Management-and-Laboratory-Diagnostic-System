import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportDatePicker } from '@/components/ui/report-date-picker';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
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
import { 
    Calendar as CalendarIcon, Coins, Download, FileText, MoreHorizontal, TrendingUp,
    ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, FileDown,
    Users, Clock, CheckCircle, XCircle, AlertCircle, UserCheck, UserX, Globe, MapPin, Stethoscope, Phone, User
} from 'lucide-react';
import { formatAppointmentType } from '@/utils/formatAppointmentType';
import { useState, useEffect } from 'react';

interface Appointment {
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
}

interface Summary {
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
}

interface AppointmentReportsProps {
    filter: string;
    date: string;
    reportType: string;
    data: {
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
        appointment_details: Appointment[];
        period: string;
        start_date: string;
        end_date: string;
    };
    appointments?: {
        data: Appointment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    summary: Summary;
    chartData?: {
        monthly_appointments: Array<{ month: string; appointments: number }>;
        status_distribution: Array<{ status: string; count: number }>;
    };
    filterOptions?: {
        statuses: string[];
        specialist_types: string[];
        sources: string[];
        appointment_types: string[];
    };
    metadata?: {
        generated_at: string;
        generated_by: string;
        generated_by_role: string;
        system_version: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/admin/reports' },
    { title: 'Appointment Reports', href: '/admin/reports/appointments' },
];


// Column definitions for the data table
const createColumns = (): ColumnDef<Appointment>[] => [
    {
        accessorKey: 'appointment_code',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3 text-left justify-start w-full"
                >
                    Appointment Code
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const code = (row.getValue("appointment_code") as string) || (row.original?.id ? `A${String(row.original.id).padStart(4, '0')}` : '');
            return (
                <div className="font-medium text-blue-600 text-left">
                    {code}
                </div>
            );
        },
    },
    {
        accessorKey: 'patient_name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3 text-left justify-start w-full"
                >
                    Patient Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const patientName = row.getValue("patient_name") as string;
            const displayName = patientName || 'Unknown Patient';
            return (
                <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{displayName}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'contact_number',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3 text-left justify-start w-full"
                >
                    Contact
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const contactNumber = row.getValue("contact_number") as string;
            const displayContact = contactNumber || 'N/A';
            return (
                <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{displayContact}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'specialist_name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3 text-left justify-start w-full"
                >
                    Specialist
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const specialist = row.getValue("specialist_name") as string;
            const specialistType = row.original.specialist_type;
            // Display specialist name if available, otherwise show type as fallback
            // Display specialist name, or default to "Paul Henry N. Parrotina, MD." if missing
            const displayName = specialist && specialist !== 'Unknown Specialist' && specialist !== 'Paul Henry N. Parrotina, MD.' 
                ? specialist 
                : 'Paul Henry N. Parrotina, MD.';
            return (
                <div className="flex items-center space-x-2">
                    <Stethoscope className="h-4 w-4 text-gray-400" />
                    <div>
                        <div className="font-medium">{displayName}</div>
                        {specialist && specialist !== 'Unknown Specialist' && specialist !== 'Paul Henry N. Parrotina, MD.' && specialistType && (
                            <div className="text-sm text-gray-500">{specialistType}</div>
                        )}
                    </div>
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
                    className="h-8 px-2 lg:px-3 text-left justify-start w-full"
                >
                    Date & Time
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = row.getValue("appointment_date") as string;
            const time = row.original.appointment_time;
            
            // Format date
            let formattedDate = 'N/A';
            if (date) {
                try {
                    const dateObj = new Date(date);
                    if (!isNaN(dateObj.getTime())) {
                        formattedDate = dateObj.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: '2-digit', 
                            day: '2-digit' 
                        });
                    }
                } catch (e) {
                    formattedDate = date;
                }
            }
            
            // Format time - handle both string and ISO format
            let formattedTime = 'N/A';
            if (time) {
                try {
                    // If time is an ISO string, extract just the time part
                    if (typeof time === 'string' && time.includes('T')) {
                        const timeMatch = time.match(/T(\d{2}):(\d{2}):(\d{2})/);
                        if (timeMatch) {
                            const hours = parseInt(timeMatch[1]);
                            const minutes = timeMatch[2];
                            const ampm = hours >= 12 ? 'PM' : 'AM';
                            const displayHours = hours % 12 || 12;
                            formattedTime = `${displayHours}:${minutes} ${ampm}`;
                        } else {
                            formattedTime = time;
                        }
                    } else if (typeof time === 'string') {
                        // If it's already a time string (HH:MM:SS or HH:MM)
                        const timeParts = time.split(':');
                        if (timeParts.length >= 2) {
                            const hours = parseInt(timeParts[0]);
                            const minutes = timeParts[1];
                            const ampm = hours >= 12 ? 'PM' : 'AM';
                            const displayHours = hours % 12 || 12;
                            formattedTime = `${displayHours}:${minutes} ${ampm}`;
                        } else {
                            formattedTime = time;
                        }
                    } else {
                        formattedTime = String(time);
                    }
                } catch (e) {
                    formattedTime = String(time);
                }
            }
            
            return (
                <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <div>
                        <div className="font-medium">{formattedDate}</div>
                        <div className="text-sm text-gray-500">{formattedTime}</div>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'appointment_type',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3 text-left justify-start w-full"
                >
                    Type
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const type = row.getValue("appointment_type") as string;
            const formattedType = formatAppointmentType(type);
            return (
                <Badge variant="outline">
                    {formattedType}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'price',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3 text-right justify-end w-full"
                >
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const price = parseFloat(String(row.getValue("price") || '0'));
            const formatted = new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
            }).format(price);
            
            return (
                <div className="text-right font-medium text-green-600">
                    {formatted}
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3 text-left justify-start w-full"
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const getStatusIcon = (status: string) => {
                switch (status) {
                    case 'Completed':
                        return <CheckCircle className="h-4 w-4 text-green-500" />;
                    case 'Confirmed':
                        return <UserCheck className="h-4 w-4 text-blue-500" />;
                    case 'Pending':
                        return <Clock className="h-4 w-4 text-yellow-500" />;
                    case 'Cancelled':
                        return <UserX className="h-4 w-4 text-red-500" />;
                    case 'No Show':
                        return <XCircle className="h-4 w-4 text-gray-500" />;
                    default:
                        return <AlertCircle className="h-4 w-4 text-gray-500" />;
                }
            };

            const getStatusVariant = (status: string) => {
                switch (status) {
                    case 'Completed':
                        return 'default';
                    case 'Confirmed':
                        return 'secondary';
                    case 'Pending':
                        return 'outline';
                    case 'Cancelled':
                        return 'destructive';
                    case 'No Show':
                        return 'secondary';
                    default:
                        return 'outline';
                }
            };

            return (
                <div className="flex items-center space-x-2">
                    {getStatusIcon(status)}
                    <Badge variant={getStatusVariant(status)}>
                        {status}
                    </Badge>
                </div>
            );
        },
    },
    {
        accessorKey: 'source',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3 text-left justify-start w-full"
                >
                    Source
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const source = row.getValue("source") as string;
            const getSourceIcon = (source: string) => {
                switch (source) {
                    case 'Online':
                        return <Globe className="h-4 w-4 text-blue-500" />;
                    case 'Walk-in':
                        return <MapPin className="h-4 w-4 text-green-500" />;
                    default:
                        return <AlertCircle className="h-4 w-4 text-gray-500" />;
                }
            };

            return (
                <div className="flex items-center space-x-2">
                    {getSourceIcon(source)}
                    <Badge variant="outline" className="capitalize">
                        {source}
                    </Badge>
                </div>
            );
        },
    },
];

export default function AppointmentReports({ 
    filter,
    date,
    reportType,
    data,
    appointments,
    summary,
    chartData,
    filterOptions,
    metadata,
}: AppointmentReportsProps) {
    const [currentFilter, setCurrentFilter] = useState(filter || 'daily');
    const [currentDate, setCurrentDate] = useState(date || new Date().toISOString().split('T')[0]);
    const [currentReportType, setCurrentReportType] = useState(reportType || 'all');
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Update state when props change (e.g., when URL changes)
    useEffect(() => {
        setCurrentFilter(filter || 'daily');
        setCurrentDate(date || new Date().toISOString().split('T')[0]);
        setCurrentReportType(reportType || 'all');
    }, [filter, date, reportType]);

    // Calculate dynamic data based on current filter and date
    // Use props directly (filter, date, reportType) instead of state to ensure data updates when URL changes
    const getFilteredData = () => {
        // Use data?.appointment_details for summary calculations (all filtered appointments)
        // Use appointments?.data for table display (paginated filtered appointments)
        // Check if appointment_details is empty array and fallback to appointments.data for summary too
        const dataAppointments = data?.appointment_details;
        const hasDataAppointments = Array.isArray(dataAppointments) && dataAppointments.length > 0;
        const allFilteredAppointments = hasDataAppointments ? dataAppointments : (Array.isArray(appointments?.data) ? appointments.data : []);
        const paginatedAppointments = Array.isArray(appointments?.data) ? appointments.data : [];
        
        // Use props directly, not state, to ensure we get the latest values from URL
        const activeFilter = filter || currentFilter;
        const activeDate = date || currentDate;
        const activeReportType = reportType || currentReportType;
        
        // Debug logging
        console.log('getFilteredData - activeFilter (from props):', activeFilter);
        console.log('getFilteredData - activeDate (from props):', activeDate);
        console.log('getFilteredData - activeReportType (from props):', activeReportType);
        console.log('getFilteredData - allFilteredAppointments length:', allFilteredAppointments.length);
        console.log('getFilteredData - paginatedAppointments length:', paginatedAppointments.length);
        console.log('getFilteredData - appointments prop:', appointments);
        console.log('getFilteredData - data prop:', data);
        console.log('getFilteredData - data.appointment_details type:', typeof data?.appointment_details);
        console.log('getFilteredData - data.appointment_details isArray:', Array.isArray(data?.appointment_details));
        
        // Log sample appointments to see what data we're working with
        if (allFilteredAppointments.length > 0) {
            console.log('getFilteredData - sample allFilteredAppointments:', allFilteredAppointments.slice(0, 3).map(apt => ({
                id: apt.id,
                specialist_type: apt.specialist_type,
                source: apt.source,
                appointment_type: apt.appointment_type,
                status: apt.status
            })));
        }
        
        if (paginatedAppointments.length > 0) {
            console.log('getFilteredData - sample paginatedAppointments:', paginatedAppointments.slice(0, 3).map(apt => ({
                id: apt.id,
                specialist_type: apt.specialist_type,
                source: apt.source,
                appointment_type: apt.appointment_type,
                status: apt.status
            })));
        }
        
        // For summary calculations, use all filtered appointments
        const total = allFilteredAppointments.length;
        const pending = allFilteredAppointments.filter(a => a.status === 'Pending').length;
        const confirmed = allFilteredAppointments.filter(a => a.status === 'Confirmed').length;
        const completed = allFilteredAppointments.filter(a => a.status === 'Completed').length;
        const cancelled = allFilteredAppointments.filter(a => a.status === 'Cancelled').length;
        
        // Calculate revenue based on all filtered appointments
        const totalRevenue = allFilteredAppointments.reduce((sum, a) => {
            const amount = typeof a.price === 'string' ? parseFloat(a.price) : (a.price || 0);
            return sum + amount;
        }, 0);
        
        const onlineAppointments = allFilteredAppointments.filter(a => a.source === 'Online').length;
        const walkInAppointments = allFilteredAppointments.filter(a => a.source === 'Walk-in').length;
        const doctorAppointments = allFilteredAppointments.filter(a => a.specialist_type === 'Doctor').length;
        const medtechAppointments = allFilteredAppointments.filter(a => a.specialist_type === 'MedTech').length;
        const nurseAppointments = allFilteredAppointments.filter(a => a.specialist_type === 'Nurse').length;
        
        // Calculate period description
        let period = 'All Appointments';
        if (activeFilter !== 'all') {
            if (activeDate) {
                const dateObj = new Date(activeDate);
                if (activeFilter === 'daily') {
                    period = `Daily Report - ${dateObj.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}`;
                } else if (activeFilter === 'monthly') {
                    period = `Monthly Report - ${dateObj.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                    })}`;
                } else if (activeFilter === 'yearly') {
                    period = `Yearly Report - ${dateObj.getFullYear()}`;
                }
            }
        }
        
        return {
            total_appointments: total,
            pending_appointments: pending,
            confirmed_appointments: confirmed,
            completed_appointments: completed,
            cancelled_appointments: cancelled,
            total_revenue: totalRevenue,
            online_appointments: onlineAppointments,
            walk_in_appointments: walkInAppointments,
            doctor_appointments: doctorAppointments,
            medtech_appointments: medtechAppointments,
            nurse_appointments: nurseAppointments,
            appointment_details: paginatedAppointments, // Use paginated data for table
            period: period,
            start_date: activeDate || new Date().toISOString().split('T')[0],
            end_date: activeDate || new Date().toISOString().split('T')[0]
        };
    };

    // Recalculate filtered data when filter or date changes
    const [filteredData, setFilteredData] = useState(() => {
        try {
            return getFilteredData();
        } catch (error) {
            console.error('Error in initial getFilteredData:', error);
            return {
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
                appointment_details: [],
                period: 'Loading...',
                start_date: currentDate || new Date().toISOString().split('T')[0],
                end_date: currentDate || new Date().toISOString().split('T')[0]
            };
        }
    });

    // Update filtered data when props change (new data from backend or filter/date changes)
    useEffect(() => {
        try {
            setFilteredData(getFilteredData());
        } catch (error) {
            console.error('Error in getFilteredData:', error);
            console.error('Error details:', {
                data: data,
                appointments: appointments,
                currentFilter: currentFilter,
                currentDate: currentDate,
                currentReportType: currentReportType
            });
            // Set empty data to prevent crashes
            setFilteredData({
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
                appointment_details: [],
                period: 'Error loading data',
                start_date: currentDate || new Date().toISOString().split('T')[0],
                end_date: currentDate || new Date().toISOString().split('T')[0]
            });
        }
    }, [data, appointments, currentFilter, currentDate, currentReportType]);

    // TanStack Table state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState('');

    const columns = createColumns();

    const handleFilterChange = (newFilter: string) => {
        setCurrentFilter(newFilter);
        setIsLoading(true);
        router.get('/admin/reports/appointments', {
            filter: newFilter,
            date: currentDate,
            report_type: currentReportType
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false)
        });
    };

    const handleDateChange = (newDate: string) => {
        setCurrentDate(newDate);
        setIsLoading(true);
        router.get('/admin/reports/appointments', {
            filter: currentFilter,
            date: newDate,
            report_type: currentReportType
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false)
        });
    };

    const handleReportTypeChange = (newReportType: string) => {
        console.log('handleReportTypeChange - changing from', currentReportType, 'to', newReportType);
        console.log('Current filter:', currentFilter);
        console.log('Current date:', currentDate);
        console.log('Current data before change:', data);
        console.log('Current filteredData before change:', filteredData);
        setCurrentReportType(newReportType);
        setIsLoading(true);
        router.get('/admin/reports/appointments', {
            filter: currentFilter,
            date: currentDate,
            report_type: newReportType
        }, {
            preserveState: true,
            onFinish: () => {
                setIsLoading(false);
                console.log('Data after report type change:', data);
                console.log('FilteredData after report type change:', filteredData);
            }
        });
    };

    const handleExport = (format: 'excel' | 'pdf') => {
        // Direct file download to avoid Inertia popup/modal overlay
        // Always export ALL appointments (same dataset as /admin/appointments)
        const params = new URLSearchParams({
            report_type: 'all',
            status: 'all',
            specialist_type: 'all',
            format,
        }).toString();
        window.location.href = `/admin/reports/appointments/export?${params}`;
    };

    // Table setup
    const tableData = filteredData.appointment_details || [];
    console.log('Table data for appointments:', tableData);
    console.log('Sample appointment codes:', tableData.slice(0, 3).map(apt => ({
        id: apt.id,
        appointment_code: apt.appointment_code,
        patient_name: apt.patient_name
    })));
    
    const table = useReactTable({
        data: tableData,
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
            <Head title="Appointment Reports" />
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
                    {/* Dynamic Insight Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {currentReportType === 'all' ? (
						<>
							<Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
											<p className="text-gray-500 text-sm font-medium">
                                                    Total Appointments {isLoading && <span className="animate-pulse">⏳</span>}
                                                </p>
                                                <p className="text-3xl font-bold">{(filteredData.total_appointments || 0).toLocaleString()}</p>
											<p className="text-gray-500 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today\'s Count' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
										<CalendarIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

							<Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
											<p className="text-gray-500 text-sm font-medium">Completed</p>
                                                <p className="text-3xl font-bold">{(filteredData.completed_appointments || 0).toLocaleString()}</p>
											<p className="text-gray-500 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
										<CheckCircle className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

							<Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
											<p className="text-gray-500 text-sm font-medium">Pending</p>
                                                <p className="text-3xl font-bold">{(filteredData.pending_appointments || 0).toLocaleString()}</p>
											<p className="text-gray-500 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
										<Clock className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

							<Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
											<p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                                                <p className="text-3xl font-bold">₱{(filteredData.total_revenue || 0).toLocaleString()}</p>
											<p className="text-gray-500 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
										<Coins className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : currentReportType === 'online_only' ? (
						<>
							<Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
											<p className="text-gray-500 text-sm font-medium">Online Appointments</p>
                                                <p className="text-3xl font-bold">{(filteredData.online_appointments || 0).toLocaleString()}</p>
											<p className="text-gray-500 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
										<Globe className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

							<Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
											<p className="text-gray-500 text-sm font-medium">Completed</p>
                                                <p className="text-3xl font-bold">{(filteredData.completed_appointments || 0).toLocaleString()}</p>
											<p className="text-gray-500 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
										<CheckCircle className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

							<Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
											<p className="text-gray-500 text-sm font-medium">Pending</p>
                                                <p className="text-3xl font-bold">{(filteredData.pending_appointments || 0).toLocaleString()}</p>
											<p className="text-gray-500 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
										<Clock className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

							<Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
											<p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                                                <p className="text-3xl font-bold">₱{(filteredData.total_revenue || 0).toLocaleString()}</p>
											<p className="text-gray-500 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
										<Coins className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : currentReportType === 'walkin_only' ? (
						<>
							<Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
											<p className="text-gray-500 text-sm font-medium">Walk-in Appointments</p>
                                                <p className="text-3xl font-bold">{(filteredData.walk_in_appointments || 0).toLocaleString()}</p>
											<p className="text-gray-500 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
										<MapPin className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

							<Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
											<p className="text-gray-500 text-sm font-medium">Completed</p>
                                                <p className="text-3xl font-bold">{(filteredData.completed_appointments || 0).toLocaleString()}</p>
											<p className="text-gray-500 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
										<CheckCircle className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

							<Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
											<p className="text-gray-500 text-sm font-medium">Pending</p>
                                                <p className="text-3xl font-bold">{(filteredData.pending_appointments || 0).toLocaleString()}</p>
											<p className="text-gray-500 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
										<Clock className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

							<Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
											<p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                                                <p className="text-3xl font-bold">₱{(filteredData.total_revenue || 0).toLocaleString()}</p>
											<p className="text-gray-500 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
										<Coins className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
						<>
							<Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
											<p className="text-gray-500 text-sm font-medium">Total Appointments</p>
                                                <p className="text-3xl font-bold">{(filteredData.total_appointments || 0).toLocaleString()}</p>
											<p className="text-gray-500 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
										<CalendarIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

							<Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
											<p className="text-gray-500 text-sm font-medium">Completed</p>
                                                <p className="text-3xl font-bold">{(filteredData.completed_appointments || 0).toLocaleString()}</p>
											<p className="text-gray-500 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
										<CheckCircle className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

							<Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
											<p className="text-gray-500 text-sm font-medium">Pending</p>
                                                <p className="text-3xl font-bold">{(filteredData.pending_appointments || 0).toLocaleString()}</p>
											<p className="text-gray-500 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
										<Clock className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

							<Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
											<p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                                                <p className="text-3xl font-bold">₱{(filteredData.total_revenue || 0).toLocaleString()}</p>
											<p className="text-gray-500 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
										<Coins className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>

                    {/* Filter Controls */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <CalendarIcon className="h-5 w-5" />
                                <span>Filter Controls</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                <div className="space-y-2 w-full">
                                    <Label className="text-sm font-semibold text-gray-800 mb-2 block">
                                        Report Type {isLoading && <span className="text-blue-500">(Loading...)</span>}
                                    </Label>
                                    <select
                                        className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        value={currentReportType}
                                        onChange={(e) => handleReportTypeChange(e.target.value)}
                                        disabled={isLoading}
                                    >
                                            <option value="all">All Appointments</option>
                                        <option value="online_only">Online Appointment</option>
                                        <option value="walkin_only">Walk-in Appointment</option>
                                    </select>
                                </div>

                                <div className="space-y-2 w-full">
                                    <Label className="text-sm font-semibold text-gray-800 mb-2 block">
                                        Time Period {isLoading && <span className="text-blue-500">(Loading...)</span>}
                                    </Label>
                                    <select
                                        className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        value={currentFilter}
                                        onChange={(e) => handleFilterChange(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                                
                                <div className="space-y-2 w-full">
                                    <Label className="text-sm font-semibold text-gray-800 mb-2 block">
                                        Select Date {isLoading && <span className="text-blue-500">(Loading...)</span>}
                                    </Label>
                                    <ReportDatePicker
                                        date={currentDate ? new Date(currentDate) : undefined}
                                        onDateChange={(date: Date | undefined) => {
                                            if (date) {
                                                // Use local date formatting to avoid timezone issues
                                                const year = date.getFullYear();
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const day = String(date.getDate()).padStart(2, '0');
                                                
                                                let formattedDate: string;
                                                if (currentFilter === 'monthly') {
                                                    formattedDate = `${year}-${month}`;
                                                } else if (currentFilter === 'yearly') {
                                                    formattedDate = year.toString();
                                                } else {
                                                    formattedDate = `${year}-${month}-${day}`;
                                                }
                                                
                                                handleDateChange(formattedDate);
                                            } else {
                                                handleDateChange('');
                                            }
                                        }}
                                        filter={currentFilter as 'daily' | 'monthly' | 'yearly'}
                                        placeholder={currentFilter === 'daily' ? 'Select Date' : currentFilter === 'monthly' ? 'Select Month' : 'Select Year'}
                                        disabled={isLoading}
                                    />
                                </div>

                            </div>
                        </CardContent>
                    </Card>

                    <Separator className="my-8" />

                    {/* Report Summary Table */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Summary</h3>
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Pending Appointments</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.pending_appointments || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {(filteredData.total_appointments || 0) > 0 ? (((filteredData.pending_appointments || 0) / (filteredData.total_appointments || 1)) * 100).toFixed(1) : 0}%
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Confirmed Appointments</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.confirmed_appointments || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {(filteredData.total_appointments || 0) > 0 ? (((filteredData.confirmed_appointments || 0) / (filteredData.total_appointments || 1)) * 100).toFixed(1) : 0}%
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Completed Appointments</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.completed_appointments || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {(filteredData.total_appointments || 0) > 0 ? (((filteredData.completed_appointments || 0) / (filteredData.total_appointments || 1)) * 100).toFixed(1) : 0}%
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Cancelled Appointments</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.cancelled_appointments || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {(filteredData.total_appointments || 0) > 0 ? (((filteredData.cancelled_appointments || 0) / (filteredData.total_appointments || 1)) * 100).toFixed(1) : 0}%
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Appointments</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.total_appointments || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">100%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Source Summary Table */}
                    {(filteredData.online_appointments || 0) > 0 || (filteredData.walk_in_appointments || 0) > 0 ? (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Source Summary</h3>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Online</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.online_appointments || 0}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {(filteredData.total_appointments || 0) > 0 ? (((filteredData.online_appointments || 0) / (filteredData.total_appointments || 1)) * 100).toFixed(1) : 0}%
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Walk-in</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.walk_in_appointments || 0}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {(filteredData.total_appointments || 0) > 0 ? (((filteredData.walk_in_appointments || 0) / (filteredData.total_appointments || 1)) * 100).toFixed(1) : 0}%
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : null}

                    {/* Appointments Table */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center space-x-2">
                                    <CalendarIcon className="h-5 w-5" />
                                    <span>Appointments</span>
                                </CardTitle>
                                <div className="flex items-center space-x-2">
                                    <div className="text-sm text-gray-600">
                                        <span>{(filteredData.appointment_details || []).length} appointments found</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="py-16 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                    <div className="text-gray-400 mb-4">
                                        <CalendarIcon className="h-12 w-12 mx-auto animate-pulse" />
                                    </div>
                                    <p className="text-lg font-semibold text-gray-700 mb-2">Loading appointment data...</p>
                                    <p className="text-gray-500">Please wait while we fetch the data</p>
                                </div>
                            ) : (filteredData.appointment_details || []).length === 0 ? (
                                <div className="py-16 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                    <div className="text-gray-400 mb-4">
                                        <CalendarIcon className="h-12 w-12 mx-auto" />
                                    </div>
                                    <p className="text-lg font-semibold text-gray-700 mb-2">No appointments found</p>
                                    <p className="text-gray-500">No appointments found for the selected period and filters</p>
                                </div>
                            ) : (
                                <Card className="bg-white border border-gray-200">
                                    <CardContent className="p-6">
                                        {/* Table Controls */}
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 py-4">
                                            <Input
                                                placeholder="Search appointments..."
                                                value={globalFilter ?? ""}
                                                onChange={(event) => setGlobalFilter(event.target.value)}
                                                className="w-full sm:max-w-sm"
                                            />
                                            <Button
                                                onClick={() => handleExport('excel')}
                                                disabled={isLoading}
                                                className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                <span className="hidden sm:inline">Export Excel</span>
                                                <span className="sm:hidden">Excel</span>
                                            </Button>
                                            <Button
                                                onClick={() => handleExport('pdf')}
                                                disabled={isLoading}
                                                variant="outline"
                                                className="w-full sm:w-auto"
                                            >
                                                <FileDown className="h-4 w-4 mr-2" />
                                                <span className="hidden sm:inline">Export PDF</span>
                                                <span className="sm:hidden">PDF</span>
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" className="w-full sm:w-auto sm:ml-auto">
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
                                        <div className="rounded-md border overflow-x-auto">
                                            <div className="inline-block min-w-full align-middle">
                                                <Table>
                                                    <TableHeader>
                                                        {table.getHeaderGroups().map((headerGroup) => (
                                                            <TableRow key={headerGroup.id}>
                                                                {headerGroup.headers.map((header) => {
                                                                    return (
                                                                        <TableHead key={header.id} className="whitespace-nowrap">
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
                                                                        <TableCell key={cell.id} className="whitespace-nowrap">
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
                                                                    No results.
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>

                                        {/* Pagination */}
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 px-2 py-4">
                                            <div className="text-muted-foreground text-sm text-center sm:text-left">
                                                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                                                {table.getFilteredRowModel().rows.length} row(s) selected.
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => table.setPageIndex(0)}
                                                    disabled={!table.getCanPreviousPage()}
                                                >
                                                    <ChevronsLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => table.previousPage()}
                                                    disabled={!table.getCanPreviousPage()}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => table.nextPage()}
                                                    disabled={!table.getCanNextPage()}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                                    disabled={!table.getCanNextPage()}
                                                >
                                                    <ChevronsRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
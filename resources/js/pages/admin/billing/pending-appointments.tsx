import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { safeFormatDate, safeFormatTime } from '@/utils/dateTime';
import PendingAppointmentViewModal from '@/components/modals/pending-appointment-view-modal';
import PendingAppointmentEditModal from '@/components/modals/pending-appointment-edit-modal';
import PendingAppointmentCreateModal from '@/components/modals/pending-appointment-create-modal';
import PendingAppointmentDeleteModal from '@/components/modals/pending-appointment-delete-modal';
import PendingAppointmentPaymentModal from '@/components/modals/pending-appointment-payment-modal';
import { 
    CheckCircle, 
    Clock, 
    Eye, 
    Plus, 
    Calendar,
    ArrowUpDown,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Users,
    Search,
    Download,
    Edit,
    CreditCard,
    DollarSign,
    Receipt,
    Filter,
    Trash2
} from 'lucide-react';
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
import { useState, useEffect } from 'react';

type PendingAppointment = {
    id: number;
    patient_name: string;
    patient_id: string;
    contact_number?: string;
    appointment_type: string;
    specialist_name: string;
    specialist_id?: string;
    specialist_type?: string;
    appointment_date: string;
    appointment_time: string;
    duration?: string;
    status?: string;
    price: number;
    total_lab_amount: number;
    final_total_amount: number;
    billing_status: string;
    source: string;
    lab_tests_count: number;
    notes?: string;
    special_requirements?: string;
    created_at: string;
    updated_at: string;
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        patient_no: string;
        present_address?: string;
        mobile_no?: string;
        birth_date?: string;
        gender?: string;
    };
    specialist?: {
        id: number;
        name: string;
        role: string;
        employee_id: string;
    };
    labTests?: Array<{
        id: number;
        lab_test_name: string;
        price: number;
        status: string;
    }>;
};

type Doctor = {
    id: number;
    name: string;
    role: string;
    employee_id: string;
};

type Patient = {
    id: number;
    first_name: string;
    last_name: string;
    patient_no: string;
};

type HmoProvider = {
    id: number;
    name: string;
    code: string;
    is_active: boolean;
};

interface PendingAppointmentsProps {
    pendingAppointments: PendingAppointment[];
    doctors: Doctor[];
    patients: Patient[];
    hmoProviders?: HmoProvider[];
    filters?: {
        search?: string;
        status?: string;
        specialist_id?: string;
        source?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Billing Management',
        href: '/admin/billing',
    },
    {
        title: 'Pending Appointments',
        href: '/admin/billing/pending-appointments',
    },
];

// Column definitions for the pending appointments table
const createPendingAppointmentsColumns = (handleViewAppointment: (id: number) => void, handleEditAppointment: (id: number) => void, handleDeleteAppointment: (id: number) => void, handlePaymentAppointment: (id: number) => void): ColumnDef<PendingAppointment>[] => [
    {
        accessorKey: "patient_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Patient
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("patient_name")}</div>
        ),
    },
    {
        accessorKey: "appointment_type",
        header: "Appointment Type",
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize">
                {row.getValue("appointment_type")}
            </Badge>
        ),
    },
    {
        accessorKey: "specialist_name",
        header: "Specialist",
        cell: ({ row }) => (
            <div>{row.getValue("specialist_name")}</div>
        ),
    },
    {
        accessorKey: "appointment_date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Date & Time
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div>
                <div className="font-medium">
                    {safeFormatDate(row.getValue("appointment_date"))}
                </div>
                <div className="text-sm text-gray-500">
                    {safeFormatTime(row.original.appointment_time)}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "price",
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
            <div className="font-semibold text-green-600">
                ₱{(row.original.final_total_amount || row.getValue("price") || 0).toLocaleString()}
            </div>
        ),
    },
    {
        accessorKey: "billing_status",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                {row.getValue("billing_status")}
            </Badge>
        ),
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const appointment = row.original;

            return (
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewAppointment(appointment.id)}
                    >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditAppointment(appointment.id)}
                    >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                    </Button>
                    <Button 
                        size="sm"
                        onClick={() => handlePaymentAppointment(appointment.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Pay Now
                    </Button>
                </div>
            )
        },
    },
];

export default function PendingAppointments({
    pendingAppointments,
    doctors,
    patients,
    hmoProviders = [],
    filters
}: PendingAppointmentsProps) {
    // Debug: Log the data being passed to the component
    console.log('PendingAppointments component received data:', {
        pendingAppointments: pendingAppointments?.length || 0,
        doctors: doctors?.length || 0,
        patients: patients?.length || 0,
        hmoProviders: hmoProviders?.length || 0,
        firstAppointment: pendingAppointments?.[0]
    });
    // Filter state
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [specialistFilter, setSpecialistFilter] = useState(filters?.specialist_id || 'all');
    const [sourceFilter, setSourceFilter] = useState(filters?.source || 'all');
    
    // Debounced search
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    
    // Modal state
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        handleFilter();
    }, [debouncedSearchTerm, statusFilter, specialistFilter, sourceFilter]);
    
    // TanStack Table state
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = React.useState(filters?.search || '');

    // Ensure we have data to work with
    const appointmentsData = pendingAppointments || [];
    
    // View modal handlers
    const handleViewAppointment = (appointmentId: number) => {
        console.log('View appointment clicked with ID:', appointmentId);
        console.log('Appointment data:', appointmentsData.find(apt => apt.id === appointmentId));
        setSelectedAppointmentId(appointmentId);
        setViewModalOpen(true);
    };

    const handleViewModalClose = () => {
        setViewModalOpen(false);
        setSelectedAppointmentId(null);
    };

    // Edit modal handlers
    const handleEditAppointment = (appointmentId: number) => {
        console.log('Edit appointment clicked with ID:', appointmentId);
        console.log('Appointment data:', appointmentsData.find(apt => apt.id === appointmentId));
        setSelectedAppointmentId(appointmentId);
        setEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setEditModalOpen(false);
        setSelectedAppointmentId(null);
    };

    // Delete modal handlers
    const handleDeleteAppointment = (appointmentId: number) => {
        setSelectedAppointmentId(appointmentId);
        setDeleteModalOpen(true);
    };

    const handleDeleteModalClose = () => {
        setDeleteModalOpen(false);
        setSelectedAppointmentId(null);
    };

    // Create modal handlers
    const handleCreateAppointment = () => {
        setCreateModalOpen(true);
    };

    const handleCreateModalClose = () => {
        setCreateModalOpen(false);
    };

    // Payment modal handlers
    const handlePaymentAppointment = (appointmentId: number) => {
        console.log('Payment appointment clicked with ID:', appointmentId);
        console.log('Appointment data:', appointmentsData.find(apt => apt.id === appointmentId));
        setSelectedAppointmentId(appointmentId);
        setPaymentModalOpen(true);
    };

    const handlePaymentModalClose = () => {
        setPaymentModalOpen(false);
        setSelectedAppointmentId(null);
    };

    const handleModalSuccess = () => {
        console.log('Modal success callback triggered, refreshing pending appointments...');
        // Refresh the appointments data
        router.reload({ only: ['pendingAppointments'] });
    };
    
    // Initialize appointments table
    const columns = createPendingAppointmentsColumns(handleViewAppointment, handleEditAppointment, handleDeleteAppointment, handlePaymentAppointment);
    const table = useReactTable({
        data: appointmentsData || [],
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
                appointment.appointment_type?.toLowerCase().includes(search) ||
                appointment.specialist_name?.toLowerCase().includes(search) ||
                appointment.patient_id?.toLowerCase().includes(search)
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

    const handleFilter = () => {
        const params: any = {};
        
        // Only add parameters that are not default values
        if (debouncedSearchTerm && debouncedSearchTerm.trim() !== '') {
            params.search = debouncedSearchTerm;
        }
        if (statusFilter && statusFilter !== 'all') {
            params.status = statusFilter;
        }
        if (specialistFilter && specialistFilter !== 'all') {
            params.specialist_id = specialistFilter;
        }
        if (sourceFilter && sourceFilter !== 'all') {
            params.source = sourceFilter;
        }

        router.get('/admin/billing/pending-appointments', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Calculate statistics
    const totalPending = appointmentsData.length;
    const todayAppointments = appointmentsData.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        const today = new Date();
        return aptDate.toDateString() === today.toDateString();
    }).length;
    const uniquePatients = new Set(appointmentsData.map(apt => apt.patient_id)).size;
    const totalRevenue = appointmentsData.reduce((sum, apt) => {
        const amount = Number(apt.final_total_amount) || Number(apt.price) || 0;
        return sum + amount;
    }, 0);
    
    // Calculate pending amount (same as total revenue for pending appointments)
    const pendingAmount = totalRevenue;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pending Appointments" />
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Pending</p>
                                        <p className="text-3xl font-bold text-gray-900">{totalPending}</p>
                                        <p className="text-sm text-gray-500">Awaiting billing</p>
                                    </div>
                                    <div className="p-3 bg-yellow-100 rounded-full">
                                        <Clock className="h-6 w-6 text-yellow-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                                        <p className="text-3xl font-bold text-gray-900">{todayAppointments}</p>
                                        <p className="text-sm text-gray-500">Scheduled today</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <Calendar className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Patients</p>
                                        <p className="text-3xl font-bold text-gray-900">{uniquePatients}</p>
                                        <p className="text-sm text-gray-500">Unique patients</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <Users className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                                        <p className="text-3xl font-bold text-gray-900">₱{pendingAmount.toLocaleString()}</p>
                                        <p className="text-sm text-gray-500">Awaiting payment</p>
                                    </div>
                                    <div className="p-3 bg-yellow-100 rounded-full">
                                        <Clock className="h-6 w-6 text-yellow-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Data Table */}
                    <Card className="bg-white border border-gray-200">
                        <CardContent className="p-6">
                            {/* Filters and Controls */}
                            <div className="mb-6">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search appointments..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                        />
                                    </div>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="h-12 px-4 border border-gray-200 rounded-xl focus:border-gray-500 focus:ring-gray-500"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    <select
                                        value={specialistFilter}
                                        onChange={(e) => setSpecialistFilter(e.target.value)}
                                        className="h-12 px-4 border border-gray-200 rounded-xl focus:border-gray-500 focus:ring-gray-500"
                                    >
                                        <option value="all">All Specialists</option>
                                        {doctors.map((doctor) => (
                                            <option key={doctor.id} value={doctor.id.toString()}>
                                                {doctor.name}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={sourceFilter}
                                        onChange={(e) => setSourceFilter(e.target.value)}
                                        className="h-12 px-4 border border-gray-200 rounded-xl focus:border-gray-500 focus:ring-gray-500"
                                    >
                                        <option value="all">All Sources</option>
                                        <option value="online">Online</option>
                                        <option value="walk_in">Walk-in</option>
                                        <option value="phone">Phone</option>
                                    </select>
                                    <Button
                                        onClick={handleCreateAppointment}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Appointment
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline">
                                                <Download className="mr-2 h-4 w-4" />
                                                Export
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => window.open('/admin/billing/export?format=excel&type=pending-appointments', '_self')}>
                                                Excel
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => window.open('/admin/billing/export?format=pdf&type=pending-appointments', '_self')}>
                                                PDF
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline">
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
                                                    No results.
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
                </div>
            </div>
            
            {/* Pending Appointment View Modal */}
            <PendingAppointmentViewModal
                isOpen={viewModalOpen}
                onClose={handleViewModalClose}
                appointment={appointmentsData.find(apt => apt.id === selectedAppointmentId) as any || null}
                onEdit={handleEditAppointment}
            />

            {/* Pending Appointment Edit Modal */}
            <PendingAppointmentEditModal
                isOpen={editModalOpen}
                onClose={handleEditModalClose}
                onSuccess={handleModalSuccess}
                appointment={appointmentsData.find(apt => apt.id === selectedAppointmentId) as any || null}
                doctors={doctors}
            />

            {/* Pending Appointment Create Modal */}
            <PendingAppointmentCreateModal
                isOpen={createModalOpen}
                onClose={handleCreateModalClose}
                onSuccess={handleModalSuccess}
                doctors={doctors}
                patients={patients}
            />

            {/* Pending Appointment Delete Modal */}
            <PendingAppointmentDeleteModal
                isOpen={deleteModalOpen}
                onClose={handleDeleteModalClose}
                onSuccess={handleModalSuccess}
                appointmentId={selectedAppointmentId}
                appointmentName={appointmentsData.find(apt => apt.id === selectedAppointmentId)?.patient_name}
            />

            {/* Pending Appointment Payment Modal */}
            <PendingAppointmentPaymentModal
                isOpen={paymentModalOpen}
                onClose={handlePaymentModalClose}
                onSuccess={handleModalSuccess}
                appointment={appointmentsData.find(apt => apt.id === selectedAppointmentId) as any || null}
                doctors={doctors}
                patients={patients}
                hmoProviders={hmoProviders}
            />
        </AppLayout>
    );
}

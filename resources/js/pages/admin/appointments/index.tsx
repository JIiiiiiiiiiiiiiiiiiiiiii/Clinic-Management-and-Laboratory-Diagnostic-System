import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
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
import { safeFormatDate, safeFormatTime } from '@/utils/dateTime';
import { 
    Calendar as CalendarIcon, CheckCircle, Clock, Filter, Plus, Search, Stethoscope, Edit, Eye, UserCheck, Bell, CalendarDays, Users, X, Save, Trash2, TestTube,
    ArrowUpDown, ArrowUp, ArrowDown, ChevronsUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Settings2, EyeOff, MoreHorizontal, ChevronDown,
    ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, CheckCircle2, XCircle, User, AlertCircle
} from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import RealtimeNotificationBell from '@/components/RealtimeNotificationBell';
import { format } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Appointments', href: '/admin/appointments' },
    { title: 'All Appointments', href: '/admin/appointments' },
];

// Time slots for calendar view (8 AM - 5 PM)
const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

// Generate days of week based on current date
const getDaysOfWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Start from Monday
    
    return Array.from({ length: 5 }, (_, i) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        return {
            name: day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
            date: day.getDate().toString(),
            fullDate: day.toISOString().split('T')[0]
        };
    });
};

// Start with empty appointments list - in real app this would come from props
// Cache bust: 2025-01-15 - All mock data removed
const initialAppointments: any[] = [];

// Removed hardcoded sample data - data should be passed from controller

const appointmentTypes = [
    { id: 'consultation', name: 'Consultation', requiresDoctor: true, requiresMedTech: false },
    { id: 'checkup', name: 'Check-up', requiresDoctor: true, requiresMedTech: false },
    { id: 'fecalysis', name: 'Fecalysis', requiresDoctor: false, requiresMedTech: true },
    { id: 'cbc', name: 'CBC (Complete Blood Count)', requiresDoctor: false, requiresMedTech: true },
    { id: 'urinalysis', name: 'Urinalysis', requiresDoctor: false, requiresMedTech: true },
];

// Column definitions for the appointments data table
const createColumns = (handleDeleteAppointment: (appointment: any) => void, handleEditAppointment: (appointment: any) => void, handleViewAppointment: (appointment: any) => void, handleAddLabTests: (appointment: any) => void): ColumnDef<any>[] => [
    {
        accessorKey: "patient_id",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Patient ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium text-center">{row.getValue("patient_id")}</div>
        ),
    },
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
        cell: ({ row }) => {
            const appointment = row.original;
            return (
                <div>
                    <div className="font-medium">{appointment.patient_name}</div>
                    <div className="text-sm text-gray-500">{appointment.contact_number}</div>
                </div>
            );
        },
    },
    {
        accessorKey: "specialist_name",
        header: "Doctor",
        cell: ({ row }) => {
            const appointment = row.original;
            return (
                <div>
                    <div className="font-medium">{appointment.specialist_name}</div>
                    <div className="text-sm text-gray-500">{appointment.duration}</div>
                </div>
            );
        },
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
        cell: ({ row }) => {
            const appointment = row.original;
            return (
                <div>
                    <div className="font-medium">{safeFormatDate(appointment.appointment_date)}</div>
                    <div className="text-sm text-gray-500">{safeFormatTime(appointment.appointment_time)}</div>
                </div>
            );
        },
    },
    {
        accessorKey: "appointment_type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("appointment_type") as string;
            return (
                <Badge className={getTypeBadge(type)}>
                    {type}
                </Badge>
            );
        },
    },
    {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => {
            const source = row.getValue("source") as string;
            return (
                <Badge className={source === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                    {source}
                </Badge>
            );
        },
    },
    {
        accessorKey: "status",
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
            return (
                <Badge className={getStatusBadge(status)}>
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "final_total_amount",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const appointment = row.original;
            return (
                <div className="text-right">
                    <div className="font-medium">
                        ₱{appointment.final_total_amount?.toLocaleString() || appointment.price?.toLocaleString() || '0'}
                    </div>
                    {appointment.total_lab_amount > 0 && (
                        <div className="text-xs text-blue-600">
                            +₱{appointment.total_lab_amount?.toLocaleString()} lab
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => {
            const date = new Date(row.getValue("created_at"));
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
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const appointment = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewAppointment(appointment)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View appointment
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditAppointment(appointment)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit appointment
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddLabTests(appointment)}>
                            <TestTube className="mr-2 h-4 w-4" />
                            Add Lab Tests
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => handleDeleteAppointment(appointment)}
                            className="text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete appointment
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
];

// Helper functions for badge styling
const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Confirmed':
            return 'bg-green-100 text-green-800';
        case 'Pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'Cancelled':
            return 'bg-red-100 text-red-800';
        case 'Completed':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getTypeBadge = (type: string) => {
    switch (type) {
        case 'New Consultation':
            return 'bg-purple-100 text-purple-800';
        case 'Follow-up':
            return 'bg-indigo-100 text-indigo-800';
        case 'Emergency':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

interface AppointmentsIndexProps {
    appointments: {
        data: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        date?: string;
        specialist?: string;
    };
    doctors?: any[];
    medtechs?: any[];
}

export default function AppointmentsIndex({ appointments, filters, nextPatientId, doctors = [], medtechs = [] }: AppointmentsIndexProps & { nextPatientId?: string }) {
    const { permissions } = useRoleAccess();
    const [appointmentsList, setAppointmentsList] = useState(appointments.data);
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list' as 'list' | 'calendar');
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // Filter states
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [dateFilter, setDateFilter] = useState<Date | undefined>(filters?.date ? new Date(filters.date) : undefined);
    const [doctorFilter, setDoctorFilter] = useState(filters?.specialist || 'all');
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(filters?.search || '');

    // Search handler
    const handleSearch = () => {
        console.log('Search triggered with term:', debouncedSearchTerm);
        const params: any = {};
        
        if (debouncedSearchTerm && debouncedSearchTerm.trim() !== '') {
            params.search = debouncedSearchTerm;
        }
        if (statusFilter && statusFilter !== 'all') {
            params.status = statusFilter;
        }
        if (dateFilter) {
            params.date = format(dateFilter, 'yyyy-MM-dd');
        }
        if (doctorFilter && doctorFilter !== 'all') {
            params.specialist = doctorFilter;
        }

        console.log('Search params:', params);
        router.get(route('admin.appointments.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Update local state when props change
    useEffect(() => {
        console.log('Appointments data received:', appointments);
        setAppointmentsList(appointments.data);
    }, [appointments.data]);

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Handle search with server-side filtering
    useEffect(() => {
        if (debouncedSearchTerm !== (filters?.search || '')) {
            handleSearch();
        }
    }, [debouncedSearchTerm]);

    // TanStack Table state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    
    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    
    // Delete confirmation state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [appointmentToDelete, setAppointmentToDelete] = useState<any | null>(null);
    
    // Sorting state - removed custom sorting, using SortableTable instead
    
    // Initialize filters from props
    useEffect(() => {
        if (filters.search) setSearchTerm(filters.search);
        if (filters.status) setStatusFilter(filters.status);
        if (filters.date) setDateFilter(new Date(filters.date));
        if (filters.specialist) setDoctorFilter(filters.specialist);
    }, [filters]);

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showNotifications && !(event.target as Element).closest('.notification-dropdown')) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotifications]);
    const [editForm, setEditForm] = useState({
        patientName: '',
        doctor: '',
        date: '',
        time: '',
        type: '',
        status: '',
        duration: '',
        notes: '',
        contactNumber: ''
    });

    // Calculate price based on appointment type
    const calculatePrice = (appointmentType: string) => {
        const prices: { [key: string]: number } = {
            'consultation': 350,
            'general_consultation': 350,
            'checkup': 300,
            'fecalysis': 90,
            'fecalysis_test': 90,
            'cbc': 245,
            'urinalysis': 140,
            'urinarysis_test': 140,
            'x-ray': 700,
            'ultrasound': 800,
        };
        return prices[appointmentType] || 0;
    };

    // Handle sorting - removed custom sorting, using SortableTable instead

    // Statistics - optimized with useMemo
    const stats = useMemo(() => ({
        totalAppointments: appointmentsList.length,
        confirmedAppointments: appointmentsList.filter(apt => apt.status === 'Confirmed').length,
        onlineBookings: appointmentsList.filter(apt => apt.appointment_source === 'online').length,
        pendingAppointments: appointmentsList.filter(apt => apt.status === 'Pending').length,
        todayAppointments: appointmentsList.filter(apt => apt.appointment_date === new Date().toISOString().split('T')[0]).length,
    }), [appointmentsList]);

    const { totalAppointments, confirmedAppointments, onlineBookings, pendingAppointments, todayAppointments } = stats;

    const handleEditAppointment = useCallback((appointment: any) => {
        setSelectedAppointment(appointment);
        setEditForm({
            patientName: appointment.patient_name,
            doctor: appointment.specialist_name,
            date: appointment.appointment_date,
            time: appointment.appointment_time ? 
                (appointment.appointment_time.includes('T') ? 
                    appointment.appointment_time.split('T')[1]?.substring(0, 5) : 
                    appointment.appointment_time.substring(0, 5)) : '',
            type: appointment.appointment_type,
            status: appointment.status,
            duration: appointment.duration,
            notes: appointment.notes,
            contactNumber: appointment.contact_number
        });
        setShowEditModal(true);
    }, []);

    const handleViewAppointment = useCallback((appointment: any) => {
        setSelectedAppointment(appointment);
        setShowViewModal(true);
    }, []);

    const handleSaveEdit = () => {
        if (!editForm.patientName || !editForm.doctor || !editForm.date || !editForm.time) {
            alert('Please fill in all required fields');
            return;
        }

        // Update appointment via API
        router.put(route('admin.appointments.update', selectedAppointment.id), {
            patient_name: editForm.patientName,
            patient_id: selectedAppointment.patient_id, // Include patient_id
            specialist_name: editForm.doctor,
            specialist_type: selectedAppointment.specialist_type, // Include specialist_type
            specialist_id: selectedAppointment.specialist_id, // Include specialist_id
            appointment_date: editForm.date,
            appointment_time: editForm.time,
            appointment_type: editForm.type,
            status: editForm.status,
            duration: editForm.duration,
            notes: editForm.notes,
            contact_number: editForm.contactNumber,
            special_requirements: selectedAppointment.special_requirements || '', // Include special_requirements
        }, {
            onSuccess: (page) => {
                // Add notification for appointment update
                const updateNotification = {
                    id: Date.now(),
                    type: 'appointment_updated',
                    title: 'Appointment Updated',
                    message: `${editForm.patientName}'s appointment has been updated`,
                    appointmentId: selectedAppointment.id,
                    timestamp: new Date(),
                    read: false
                };
                setNotifications(prev => [updateNotification, ...prev]);
                setUnreadCount(prev => prev + 1);
                
                alert('Appointment updated successfully!');
                setShowEditModal(false);
                setSelectedAppointment(null);
            },
            onError: (errors) => {
                console.error('Error updating appointment:', errors);
                alert('Error updating appointment. Please try again.');
            }
        });
    };

    // Handler functions
    const handleDeleteAppointment = useCallback((appointment: any) => {
        setAppointmentToDelete(appointment);
        setDeleteConfirmOpen(true);
    }, []);

    const confirmDelete = () => {
        if (appointmentToDelete) {
            router.delete(route('admin.appointments.destroy', appointmentToDelete.id), {
                onSuccess: (page) => {
                    // Add notification for appointment deletion
                    const deleteNotification = {
                        id: Date.now(),
                        type: 'appointment_deleted',
                        title: 'Appointment Deleted',
                        message: `${appointmentToDelete.patient_name}'s appointment has been deleted`,
                        appointmentId: appointmentToDelete.id,
                        timestamp: new Date(),
                        read: false
                    };
                    setNotifications(prev => [deleteNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                    
                    setDeleteConfirmOpen(false);
                    setAppointmentToDelete(null);
                },
                onError: (errors) => {
                    console.error('Error deleting appointment:', errors);
                    alert('Error deleting appointment. Please try again.');
                }
            });
        }
    };

    const handleCloseModals = () => {
        setShowEditModal(false);
        setShowViewModal(false);
        setSelectedAppointment(null);
    };

    const handleNewAppointment = () => {
        // Redirect to the shared appointment booking page (explicit path to avoid relative routing issues)
        router.visit('/admin/appointments/walk-in');
    };

    const handleAddLabTests = useCallback((appointment: any) => {
        // Allow lab tests to be added to appointments without requiring existing billing transactions
        // The billing transaction will be created later with the complete total including lab tests
        router.visit(route('admin.appointments.show-add-lab-tests', appointment.id));
    }, []);

    // Calendar helper functions
    const getAppointmentStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 border-green-200 text-green-800';
            case 'cancelled':
            case 'canceled':
                return 'bg-red-100 border-red-200 text-red-800';
            case 'confirmed':
            case 'scheduled':
                return 'bg-blue-100 border-blue-200 text-blue-800';
            case 'pending':
                return 'bg-orange-100 border-orange-200 text-orange-800';
            default:
                return 'bg-gray-100 border-gray-200 text-gray-800';
        }
    };

    const getAppointmentStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return <CheckCircle2 className="h-4 w-4" />;
            case 'cancelled':
            case 'canceled':
                return <XCircle className="h-4 w-4" />;
            case 'confirmed':
            case 'scheduled':
                return <Clock className="h-4 w-4" />;
            case 'pending':
                return <User className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getAppointmentsForDay = (date: string) => {
        return appointmentsList.filter(apt => {
            const appointmentDate = apt.appointment_date;
            if (typeof appointmentDate === 'string') {
                return appointmentDate.split('T')[0] === date;
            }
            return false;
        });
    };

    const getAppointmentAtTime = (date: string, time: string) => {
        const dayAppointments = getAppointmentsForDay(date);
        return dayAppointments.find(apt => {
            const appointmentTime = apt.appointment_time;
            if (typeof appointmentTime === 'string') {
                const timeStr = appointmentTime.includes('T') 
                    ? appointmentTime.split('T')[1]?.substring(0, 5)
                    : appointmentTime.substring(0, 5);
                return timeStr === time;
            }
            return false;
        });
    };

    // Apply additional filters using table's built-in filtering - optimized with useMemo
    const preFilteredData = useMemo(() => {
        return appointmentsList.filter(appointment => {
            const matchesStatus = statusFilter === 'all' || appointment.status?.toLowerCase() === statusFilter.toLowerCase();
            
            // Fix date filtering logic
            let matchesDate = true;
            if (dateFilter) {
                const filterDate = dateFilter.toISOString().split('T')[0];
                const appointmentDate = appointment.appointment_date;
                matchesDate = appointmentDate === filterDate;
            }
            
            const matchesDoctor = doctorFilter === 'all' || appointment.specialist_id === doctorFilter;
            return matchesStatus && matchesDate && matchesDoctor;
        });
    }, [appointmentsList, statusFilter, dateFilter, doctorFilter]);

    // Initialize table - optimized columns with useMemo
    const columns = useMemo(() => 
        createColumns(handleDeleteAppointment, handleEditAppointment, handleViewAppointment, handleAddLabTests), 
        [handleDeleteAppointment, handleEditAppointment, handleViewAppointment, handleAddLabTests]
    );
    const table = useReactTable({
        data: preFilteredData || [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
        onPaginationChange: setPagination,
    });


    const addNotification = (appointment: any) => {
        const notification = {
            id: Date.now(),
            type: 'new_appointment',
            title: 'New Appointment Added',
            message: `${appointment.patient_name} scheduled ${appointment.appointment_type} with ${appointment.specialist_name}`,
            appointmentId: appointment.id,
            timestamp: new Date(),
            read: false
        };
        
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
    };

    const markNotificationAsRead = (notificationId: number) => {
        setNotifications(prev => 
            prev.map(notif => 
                notif.id === notificationId ? { ...notif, read: true } : notif
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => 
            prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
    };

    const removeNotification = (notificationId: number) => {
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appointments" />
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-white border border-gray-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                                    <p className="text-3xl font-bold text-gray-900">{totalAppointments}</p>
                                    <p className="text-sm text-gray-500">All scheduled appointments</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-white border border-gray-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Confirmed</p>
                                    <p className="text-3xl font-bold text-gray-900">{confirmedAppointments}</p>
                                    <p className="text-sm text-gray-500">Confirmed appointments</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-white border border-gray-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-3xl font-bold text-gray-900">{pendingAppointments}</p>
                                    <p className="text-sm text-gray-500">Awaiting confirmation</p>
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
                                    <p className="text-sm font-medium text-gray-600">Online Bookings</p>
                                    <p className="text-3xl font-bold text-gray-900">{onlineBookings}</p>
                                    <p className="text-sm text-gray-500">Patient self-booked</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <CalendarDays className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Controls Section - Always Visible */}
                <Card className="shadow-lg border-0 rounded-xl bg-white mb-6">
                    <CardHeader className="bg-white border-b border-gray-200">
                        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                            <CalendarIcon className="h-5 w-5 text-black" />
                            Appointments ({table.getFilteredRowModel().rows.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {/* Controls */}
                        <div className="flex flex-wrap items-center gap-4 py-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <Input
                                    placeholder="Search patient name, ID, or specialist..."
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    className="max-w-sm"
                                />
                                
                                <Button
                                    onClick={handleNewAppointment}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <CalendarDays className="h-4 w-4 mr-2" />
                                    Walk-in Appointment
                                </Button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={(viewMode as string) === 'list' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('list' as 'list' | 'calendar')}
                                >
                                    List
                                </Button>
                                <Button
                                    variant={(viewMode as string) === 'calendar' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('calendar' as 'list' | 'calendar')}
                                >
                                    Calendar
                                </Button>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {/* Status Filter - Only show in List view */}
                                {viewMode === 'list' && (
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}

                                {/* Date Filter - Only show in List view */}
                                {viewMode === 'list' && (
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={dateFilter ? format(dateFilter, "yyyy-MM-dd") : ""}
                                            onChange={(e) => {
                                                const date = e.target.value ? new Date(e.target.value) : undefined;
                                                setDateFilter(date);
                                            }}
                                            className="w-[180px]"
                                            placeholder="Pick a date"
                                        />
                                    </div>
                                )}

                                {/* Doctor Filter - Only show in List view */}
                                {viewMode === 'list' && (
                                    <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Filter by doctor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Doctors</SelectItem>
                                            {doctors.map(doctor => (
                                                <SelectItem key={doctor.id} value={doctor.id}>{doctor.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                {/* Clear Filters Button - Only show in List view */}
                                {viewMode === 'list' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setStatusFilter('all');
                                            setDateFilter(undefined);
                                            setDoctorFilter('all');
                                        }}
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Clear
                                    </Button>
                                )}

                                {/* Column Visibility - Only show in List view */}
                                {viewMode === 'list' && (
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
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Appointments Table - List View */}
                {viewMode === 'list' && (
                    <Card className="shadow-lg border-0 rounded-xl bg-white">
                        <CardContent className="p-6">
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
                                Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} appointments
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
                )}
                    
                {/* Edit Appointment Modal */}
                {showEditModal && selectedAppointment && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <Card className="border-0">
                                <CardHeader className="bg-white border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                            <Edit className="h-5 w-5 text-black" />
                                            Edit Appointment
                                        </CardTitle>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCloseModals}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-black mb-2">Patient Name</label>
                                            <Input
                                                value={editForm.patientName}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, patientName: e.target.value }))}
                                                placeholder="Enter patient name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-black mb-2">Doctor</label>
                                            <select
                                                value={editForm.doctor}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, doctor: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                            >
                                                <option value="">Select doctor...</option>
                                                {doctors.map(doctor => (
                                                    <option key={doctor.id} value={doctor.name}>{doctor.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-black mb-2">Date</label>
                                            <Input
                                                type="date"
                                                value={editForm.date}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-black mb-2">Time</label>
                                            <Input
                                                type="time"
                                                value={editForm.time}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-black mb-2">Appointment Type</label>
                                            <select
                                                value={editForm.type}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                            >
                                                <option value="">Select type...</option>
                                                <option value="New Consultation">New Consultation</option>
                                                <option value="Follow-up">Follow-up</option>
                                                <option value="Emergency">Emergency</option>
                                                <option value="Routine Checkup">Routine Checkup</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-black mb-2">Status</label>
                                            <select
                                                value={editForm.status}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                            >
                                                <option value="">Select status...</option>
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Pending">Pending</option>
                                                <option value="Cancelled">Cancelled</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-black mb-2">Duration</label>
                                            <select
                                                value={editForm.duration}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, duration: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                            >
                                                <option value="">Select duration...</option>
                                                <option value="30 min">30 minutes</option>
                                                <option value="45 min">45 minutes</option>
                                                <option value="60 min">60 minutes</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-black mb-2">Contact Number</label>
                                            <Input
                                                value={editForm.contactNumber}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, contactNumber: e.target.value }))}
                                                placeholder="Enter contact number"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-black mb-2">Notes</label>
                                            <textarea
                                                value={editForm.notes}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                                                placeholder="Enter appointment notes..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <Button
                                            onClick={handleCloseModals}
                                            variant="outline"
                                            className="px-6 py-2"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSaveEdit}
                                            className="bg-black hover:bg-gray-800 text-white px-6 py-2 flex items-center gap-2"
                                        >
                                            <Save className="h-4 w-4" />
                                            Save Changes
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* View Appointment Modal */}
                {showViewModal && selectedAppointment && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <Card className="border-0">
                        <CardHeader className="bg-white border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                            <Eye className="h-5 w-5 text-black" />
                                            Appointment Details
                            </CardTitle>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCloseModals}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                        </CardHeader>
                        <CardContent className="p-6">
                                    <div className="space-y-6">
                                        {/* Patient Information */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-black mb-4">Patient Information</h3>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="text-sm text-gray-600">Patient Name</div>
                                                        <div className="font-medium text-black">{selectedAppointment.patient_name || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Patient ID</div>
                                                        <div className="font-medium text-black">{selectedAppointment.patient_id || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Contact Number</div>
                                                        <div className="font-medium text-black">{selectedAppointment.contact_number || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Appointment Details */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-black mb-4">Appointment Details</h3>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="text-sm text-gray-600">Doctor</div>
                                                        <div className="font-medium text-black">{selectedAppointment.specialist_name || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Date</div>
                                                        <div className="font-medium text-black">
                                                            {safeFormatDate(selectedAppointment.appointment_date)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Time</div>
                                                        <div className="font-medium text-black">
                                                            {safeFormatTime(selectedAppointment.appointment_time)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Duration</div>
                                                        <div className="font-medium text-black">{selectedAppointment.duration || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Type</div>
                                                        <Badge className={getTypeBadge(selectedAppointment.appointment_type)}>
                                                            {selectedAppointment.appointment_type || 'N/A'}
                                                        </Badge>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Status</div>
                                                        <Badge className={getStatusBadge(selectedAppointment.status)}>
                                                            {selectedAppointment.status || 'N/A'}
                                                        </Badge>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Confirmation Sent</div>
                                                        <div className="flex items-center gap-2">
                                                            {selectedAppointment.confirmation_sent ? (
                                                                <span className="text-black font-medium">Yes</span>
                                                            ) : (
                                                                <span className="text-gray-500">No</span>
                                                            )}
                                                        </div>
                                                    </div>
                                </div>
                                </div>
                                </div>

                                        {/* Notes */}
                                        {selectedAppointment.notes && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-black mb-4">Notes</h3>
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <div className="text-gray-700">{selectedAppointment.notes}</div>
                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <Button
                                            onClick={handleCloseModals}
                                            variant="outline"
                                            className="px-6 py-2"
                                        >
                                            Close
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                handleCloseModals();
                                                handleEditAppointment(selectedAppointment);
                                            }}
                                            className="bg-black hover:bg-gray-800 text-white px-6 py-2 flex items-center gap-2"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Edit Appointment
                                        </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                    </div>
                )}

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete the appointment for <strong>{appointmentToDelete?.patient_name}</strong>? 
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                                Delete Appointment
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Calendar View */}
                {viewMode === 'calendar' && (
                    <div className="mb-6">
                        <Card className="shadow-lg border-0 rounded-xl bg-white">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <div className="min-w-[800px]">
                                        {/* Calendar Header */}
                                        <div className="grid grid-cols-6 border-b border-gray-200">
                                            <div className="p-4 text-sm font-medium text-gray-500">GMT +7</div>
                                            {getDaysOfWeek(currentDate).map((day, index) => (
                                                <div key={index} className="p-4 text-center border-l border-gray-200">
                                                    <div className="text-sm font-medium text-gray-900">{day.name}</div>
                                                    <div className="text-lg font-semibold text-gray-900">{day.date}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Calendar Grid */}
                                        <div className="relative">
                                            {/* Time slots */}
                                            {timeSlots.map((time, timeIndex) => (
                                                <div key={time} className="grid grid-cols-6 border-b border-gray-100">
                                                    {/* Time column */}
                                                    <div className="p-3 text-sm text-gray-500 border-r border-gray-200">
                                                        {time}
                                                    </div>
                                                    
                                                    {/* Day columns */}
                                                    {getDaysOfWeek(currentDate).map((day, dayIndex) => {
                                                        const appointment = getAppointmentAtTime(day.fullDate, time);
                                                        const currentTime = new Date().toLocaleTimeString('en-US', { 
                                                            hour12: false, 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                        });
                                                        const isCurrentTime = time === currentTime.split(':').slice(0, 2).join(':');
                                                        
                                                        return (
                                                            <div 
                                                                key={`${day.fullDate}-${time}`}
                                                                className="relative p-2 border-r border-gray-200 min-h-[60px] hover:bg-gray-50 cursor-pointer"
                                                            >
                                                                {appointment ? (
                                                                    <div className={`p-2 rounded-lg border ${getAppointmentStatusColor(appointment.status)}`}>
                                                                        <div className="flex items-center justify-center gap-1 mb-1">
                                                                            {getAppointmentStatusIcon(appointment.status)}
                                                                            <span className="text-xs font-medium">{appointment.patient_name}</span>
                                                                        </div>
                                                                        <div className="text-xs text-gray-600 text-center">{appointment.appointment_type}</div>
                                                                        <div className="flex items-center justify-between mt-2">
                                                                            <span className="text-xs">{appointment.specialist_name}</span>
                                                                            <div className="flex items-center gap-1">
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-6 w-6 p-0"
                                                                                    onClick={() => handleViewAppointment(appointment)}
                                                                                >
                                                                                    <Eye className="h-3 w-3" />
                                                                                </Button>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-6 w-6 p-0"
                                                                                    onClick={() => handleEditAppointment(appointment)}
                                                                                >
                                                                                    <Edit className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                                                                        {isCurrentTime && (
                                                                            <div className="absolute left-0 right-0 top-0 h-0.5 bg-blue-500">
                                                                                <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
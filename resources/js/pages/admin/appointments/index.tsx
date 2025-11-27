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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { formatAppointmentType } from '@/utils/formatAppointmentType';
import { 
    Calendar as CalendarIcon, CheckCircle, Clock, Filter, Plus, Search, Stethoscope, Edit, Eye, UserCheck, Bell, CalendarDays, Users, X, Save, Trash2, TestTube,
    ArrowUpDown, ArrowUp, ArrowDown, ChevronsUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Settings2, EyeOff, MoreHorizontal, ChevronDown,
    ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, CheckCircle2, XCircle, User, AlertCircle
} from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import RealtimeNotificationBell from '@/components/RealtimeNotificationBell';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
const createColumns = (handleDeleteAppointment: (appointment: any) => void, handleEditAppointment: (appointment: any) => void, handleViewAppointment: (appointment: any) => void, handleAddLabTests: (appointment: any) => void, handleViewVisit: (appointment: any) => void): ColumnDef<any>[] => [
    {
        accessorKey: "patient_id_display",
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
        cell: ({ row }) => {
            const patientIdDisplay = row.getValue("patient_id_display") as string;
            return (
                <div className="font-medium text-center">{patientIdDisplay || row.original.patient_id || 'N/A'}</div>
            );
        },
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
            const formattedType = formatAppointmentType(type);
            return (
                <Badge className={getTypeBadge(type)}>
                    {formattedType}
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
                        {appointment.visit_id && (
                            <DropdownMenuItem onClick={() => handleViewVisit(appointment)}>
                                <Stethoscope className="mr-2 h-4 w-4" />
                                View Visit
                            </DropdownMenuItem>
                        )}
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
    if (!type) return 'bg-gray-100 text-gray-800';
    
    switch (type.toLowerCase()) {
        case 'consultation':
        case 'general_consultation':
        case 'new consultation':
            return 'bg-purple-100 text-purple-800';
        case 'follow-up':
            return 'bg-indigo-100 text-indigo-800';
        case 'emergency':
            return 'bg-red-100 text-red-800';
        case 'checkup':
        case 'routine checkup':
            return 'bg-blue-100 text-blue-800';
        case 'fecalysis':
        case 'fecalysis_test':
        case 'cbc':
        case 'urinalysis':
        case 'urinarysis_test':
            return 'bg-green-100 text-green-800';
        case 'x-ray':
        case 'ultrasound':
            return 'bg-yellow-100 text-yellow-800';
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
    appointmentTypes?: Array<{ value: string; label: string }>;
    patients?: Array<{ id: number; first_name: string; last_name: string; middle_name?: string; patient_no: string }>;
}

export default function AppointmentsIndex({ appointments, filters, nextPatientId, doctors = [], medtechs = [], appointmentTypes = [], patients = [] }: AppointmentsIndexProps & { nextPatientId?: string }) {
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
    const [showWalkInModal, setShowWalkInModal] = useState(false);
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
        specialist_type: 'doctor',
        specialist_id: '',
        date: '',
        time: '',
        type: '',
        status: '',
        duration: '',
        notes: '',
        contactNumber: '',
        additional_info: ''
    });
    
    // Debug: Log editForm changes
    useEffect(() => {
        if (showEditModal) {
            console.log('Edit form state updated:', editForm);
        }
    }, [editForm, showEditModal]);
    const [editAvailableTimeSlots, setEditAvailableTimeSlots] = useState<Array<{ value: string; label: string }>>([]);
    const [isLoadingEditTimeSlots, setIsLoadingEditTimeSlots] = useState(false);

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
        
        // Format date for date input (YYYY-MM-DD format)
        let formattedDate = '';
        if (appointment.appointment_date) {
            if (typeof appointment.appointment_date === 'string') {
                // If it's already a string, check if it's in the right format
                if (appointment.appointment_date.includes('T')) {
                    formattedDate = appointment.appointment_date.split('T')[0];
                } else if (appointment.appointment_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    formattedDate = appointment.appointment_date;
                } else {
                    // Try to parse and format
                    const date = new Date(appointment.appointment_date);
                    if (!isNaN(date.getTime())) {
                        formattedDate = date.toISOString().split('T')[0];
                    }
                }
            } else {
                // If it's a Date object or other format, convert to string
                const date = new Date(appointment.appointment_date);
                if (!isNaN(date.getTime())) {
                    formattedDate = date.toISOString().split('T')[0];
                }
            }
        }
        
        // Format time for time input (HH:MM format)
        let formattedTime = '';
        if (appointment.appointment_time) {
            if (typeof appointment.appointment_time === 'string') {
                if (appointment.appointment_time.includes('T')) {
                    // Extract time from ISO string
                    formattedTime = appointment.appointment_time.split('T')[1]?.substring(0, 5) || '';
                } else if (appointment.appointment_time.match(/^\d{2}:\d{2}/)) {
                    // Already in HH:MM format
                    formattedTime = appointment.appointment_time.substring(0, 5);
                } else {
                    // Try to parse
                    const time = appointment.appointment_time.substring(0, 5);
                    formattedTime = time;
                }
            }
        }
        
        // Determine specialist_type and specialist_id
        let specialistType = appointment.specialist_type || 'doctor';
        let specialistId = appointment.specialist_id || '';
        
        // If we have a specialist relationship, use it
        if (!specialistId && appointment.specialist) {
            specialistId = appointment.specialist.specialist_id || appointment.specialist.id || '';
            specialistType = appointment.specialist.role === 'MedTech' ? 'medtech' : 'doctor';
        }
        
        // Find the specialist in doctors/medtechs arrays to ensure ID matches
        const allSpecialists = [...doctors, ...medtechs];
        let foundSpecialist = null;
        
        if (specialistId) {
            foundSpecialist = allSpecialists.find(s => {
                // Try multiple ways to match
                return s.id?.toString() === specialistId.toString() ||
                       s.specialist_id?.toString() === specialistId.toString();
            });
        }
        
        // If not found by ID, try to find by name
        if (!foundSpecialist && appointment.specialist_name) {
            foundSpecialist = allSpecialists.find(s => 
                s.name === appointment.specialist_name || 
                s.name?.toLowerCase() === appointment.specialist_name?.toLowerCase()
            );
        }
        
        // If found, use the ID from the array (to ensure it matches)
        if (foundSpecialist) {
            specialistId = foundSpecialist.id?.toString() || foundSpecialist.specialist_id?.toString() || '';
            // Determine type based on which array it's in
            if (doctors.find(d => (d.id || d.specialist_id)?.toString() === specialistId)) {
                specialistType = 'doctor';
            } else if (medtechs.find(m => (m.id || m.specialist_id)?.toString() === specialistId)) {
                specialistType = 'medtech';
            }
        } else if (specialistId) {
            // If not found but we have an ID, try to determine type from appointment
            specialistType = appointment.specialist_type === 'medtech' ? 'medtech' : 'doctor';
            console.warn('Specialist not found in doctors/medtechs arrays', {
                specialistId,
                specialistName: appointment.specialist_name,
                availableDoctors: doctors.map(d => ({ id: d.id, name: d.name })),
                availableMedtechs: medtechs.map(m => ({ id: m.id, name: m.name }))
            });
        } else {
            // No specialist ID, default to doctor
            specialistType = 'doctor';
            specialistId = '';
        }
        
        // Format time to 12-hour format for display
        let formattedTimeDisplay = '';
        if (formattedTime) {
            const [hours, minutes] = formattedTime.split(':');
            const date = new Date();
            date.setHours(parseInt(hours), parseInt(minutes || '0'), 0, 0);
            formattedTimeDisplay = date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
            });
        }
        
        // Debug logging
        console.log('Setting edit form with:', {
            specialistType,
            specialistId,
            specialistIdString: specialistId ? specialistId.toString() : 'EMPTY',
            appointment_type: appointment.appointment_type,
            status: appointment.status,
            duration: appointment.duration,
            availableDoctors: doctors.map(d => ({ id: d.id, idString: d.id?.toString(), name: d.name })),
            availableMedtechs: medtechs.map(m => ({ id: m.id, idString: m.id?.toString(), name: m.name }))
        });
        
        // Find matching appointment type from available types
        let matchedAppointmentType = appointment.appointment_type ? String(appointment.appointment_type) : '';
        if (matchedAppointmentType && appointmentTypes.length > 0) {
            // Try to find exact match first
            const exactMatch = appointmentTypes.find(t => t.value === matchedAppointmentType);
            if (!exactMatch) {
                // Try case-insensitive match
                const caseInsensitiveMatch = appointmentTypes.find(t => 
                    t.value.toLowerCase() === matchedAppointmentType.toLowerCase() ||
                    t.label.toLowerCase() === matchedAppointmentType.toLowerCase()
                );
                if (caseInsensitiveMatch) {
                    matchedAppointmentType = caseInsensitiveMatch.value;
                    console.log('Matched appointment type (case-insensitive):', matchedAppointmentType);
                } else {
                    console.warn('Could not find matching appointment type for:', matchedAppointmentType, 'Available:', appointmentTypes.map(t => t.value));
                }
            }
        }
        
        const formData = {
            patientName: appointment.patient_name || '',
            specialist_type: specialistType || 'doctor',
            specialist_id: specialistId ? specialistId.toString() : '',
            date: formattedDate || '',
            time: formattedTimeDisplay || '',
            type: matchedAppointmentType || '',
            status: appointment.status || '',
            duration: appointment.duration || '',
            notes: appointment.notes || appointment.admin_notes || '',
            contactNumber: appointment.contact_number || '',
            additional_info: appointment.additional_info || appointment.special_requirements || ''
        };
        
        setEditForm(formData);
        
        // Open modal immediately - React will batch the state updates
        setShowEditModal(true);
    }, [doctors, medtechs, appointmentTypes]);
    
    // Fetch available time slots for edit modal
    useEffect(() => {
        const fetchEditTimeSlots = async () => {
            if (!editForm.specialist_id || !editForm.date || !showEditModal) {
                setEditAvailableTimeSlots([]);
                return;
            }

            setIsLoadingEditTimeSlots(true);
            try {
                const allSpecialists = [...doctors, ...medtechs];
                const specialist = allSpecialists.find(s => s.id.toString() === editForm.specialist_id);
                if (!specialist || !specialist.schedule_data) {
                    setEditAvailableTimeSlots([]);
                    setIsLoadingEditTimeSlots(false);
                    return;
                }

                const selectedDate = new Date(editForm.date);
                const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                const daySchedule = (specialist.schedule_data as any)[dayOfWeek] || [];
                
                if (daySchedule.length === 0) {
                    setEditAvailableTimeSlots([]);
                    setIsLoadingEditTimeSlots(false);
                    return;
                }

                const response = await fetch(`/admin/appointments/api/check-availability?specialist_id=${editForm.specialist_id}&date=${editForm.date}`);
                const bookedTimes = response.ok ? await response.json() : [];

                const bookedTimeStrings = bookedTimes.map((time: string) => {
                    let hours: number, minutes: number;
                    if (time.includes(':')) {
                        const parts = time.split(':');
                        hours = parseInt(parts[0] || '0');
                        minutes = parseInt(parts[1] || '0');
                    } else {
                        const parsed = new Date(`2000-01-01 ${time}`);
                        if (!isNaN(parsed.getTime())) {
                            hours = parsed.getHours();
                            minutes = parsed.getMinutes();
                        } else {
                            return time;
                        }
                    }
                    const date = new Date();
                    date.setHours(hours, minutes, 0, 0);
                    return date.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit', 
                        hour12: true 
                    });
                });

                const slots = daySchedule
                    .map((time: string) => {
                        const [hours, minutes] = time.split(':');
                        const date = new Date();
                        date.setHours(parseInt(hours), parseInt(minutes || '0'), 0, 0);
                        const timeString = date.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit', 
                            hour12: true 
                        });
                        return {
                            value: timeString,
                            label: timeString,
                            raw: time
                        };
                    })
                    .filter((slot: any) => {
                        // Include current time even if booked, or if not booked
                        return slot.value === editForm.time || !bookedTimeStrings.includes(slot.value);
                    })
                    .map((slot: any) => ({
                        value: slot.value,
                        label: slot.label
                    }));

                setEditAvailableTimeSlots(slots);
            } catch (error) {
                console.error('Error fetching edit time slots:', error);
                setEditAvailableTimeSlots([]);
            } finally {
                setIsLoadingEditTimeSlots(false);
            }
        };

        fetchEditTimeSlots();
    }, [editForm.specialist_id, editForm.date, showEditModal, doctors, medtechs, editForm.time]);

    const handleViewAppointment = useCallback((appointment: any) => {
        // For now, use the appointment data from the list
        // The show route will be used for full page views, not modals
        setSelectedAppointment(appointment);
        setShowViewModal(true);
    }, []);

    const handleViewVisit = useCallback((appointment: any) => {
        if (appointment.visit_id) {
            router.get(`/admin/visits/${appointment.visit_id}/edit`);
        }
    }, []);

    const handleSaveEdit = () => {
        if (!editForm.patientName || !editForm.specialist_id || !editForm.date || !editForm.time) {
            alert('Please fill in all required fields');
            return;
        }

        // Extract patient_id from multiple possible locations
        let patientId = selectedAppointment.patient_id;
        if (!patientId && selectedAppointment.patient) {
            // Try to get from patient relationship
            patientId = selectedAppointment.patient.id || selectedAppointment.patient.patient_id || null;
        }
        
        // Use specialist_id and specialist_type from form
        const specialistId = editForm.specialist_id;
        const specialistType = editForm.specialist_type === 'doctor' ? 'doctor' : 'medtech';
        
        // Convert time from 12-hour format to 24-hour format for database
        let timeForDb = editForm.time;
        if (timeForDb) {
            try {
                const [timePart, period] = timeForDb.split(' ');
                const [hours, minutes] = timePart.split(':');
                let hour24 = parseInt(hours);
                if (period === 'PM' && hour24 !== 12) {
                    hour24 += 12;
                } else if (period === 'AM' && hour24 === 12) {
                    hour24 = 0;
            }
                timeForDb = `${hour24.toString().padStart(2, '0')}:${minutes}:00`;
            } catch (e) {
                console.error('Error converting time format:', e);
            }
        }
        
        // Only include specialist_id if it's not null/undefined
        // NOTE: patient_name, contact_number, and specialist_name are NOT database columns
        // They are derived from relationships and should NOT be sent in the update
        // Also note: 'notes' maps to 'admin_notes' in the database
        // 'special_requirements' maps to 'additional_info' in the database
        const updatePayload: any = {
            patient_id: patientId || undefined, // Send undefined instead of null
            appointment_date: editForm.date,
            appointment_time: timeForDb,
            appointment_type: editForm.type,
            status: editForm.status,
            duration: editForm.duration,
            specialist_id: specialistId,
            specialist_type: specialistType,
        };
        
        // Map notes to admin_notes (database column name)
        if (editForm.notes) {
            updatePayload.admin_notes = editForm.notes;
        }
        
        // Map additional_info
        if (editForm.additional_info !== undefined) {
            updatePayload.additional_info = editForm.additional_info;
        }
        
        console.log('Sending update with:', {
            patient_id: patientId,
            specialist_id: specialistId,
            specialist_type: specialistType,
            appointment_id: selectedAppointment.id,
            payload: updatePayload
        });
        
        // Update appointment via API
        router.put(route('admin.appointments.update', selectedAppointment.id), updatePayload, {
            onSuccess: () => {
                // Show success toast (matching system design)
                toast.success('Appointment updated successfully!');
                
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
                
                // Close modal
                setShowEditModal(false);
                setSelectedAppointment(null);
                
                // Refresh the appointments list to show updated data
                router.reload({ only: ['appointments'] });
            },
            onError: (errors) => {
                console.error('Error updating appointment:', errors);
                // Extract error message from various possible formats
                let errorMessage = 'Failed to update appointment. Please try again.';
                
                // Inertia passes errors as an object with error keys
                if (errors && typeof errors === 'object') {
                    // Check for 'error' key first (most common)
                    if (errors.error) {
                        errorMessage = Array.isArray(errors.error) ? errors.error[0] : errors.error;
                    }
                    // Check for 'message' key
                    else if (errors.message) {
                        errorMessage = Array.isArray(errors.message) ? errors.message[0] : errors.message;
                    }
                    // Check for validation errors object
                    else if (errors.errors && typeof errors.errors === 'object') {
                        const firstError = Object.values(errors.errors)[0];
                        errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
                    }
                    // Check if errors object has string values
                    else {
                        const errorValues = Object.values(errors);
                        if (errorValues.length > 0) {
                            const firstValue = errorValues[0];
                            errorMessage = Array.isArray(firstValue) ? firstValue[0] : String(firstValue);
                        }
                    }
                } else if (typeof errors === 'string') {
                    errorMessage = errors;
                }
                
                toast.error(errorMessage);
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
                    // Show success toast (matching system design)
                    toast.success('Appointment deleted successfully!');
                    
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
                    // Extract error message from various possible formats
                    let errorMessage = 'Failed to delete appointment. Please try again.';
                    if (typeof errors === 'string') {
                        errorMessage = errors;
                    } else if (errors?.error) {
                        errorMessage = errors.error;
                    } else if (errors?.message) {
                        errorMessage = errors.message;
                    } else if (errors?.errors && typeof errors.errors === 'object') {
                        // Handle validation errors
                        const firstError = Object.values(errors.errors)[0];
                        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
                    }
                    toast.error(errorMessage);
                }
            });
        }
    };

    const handleCloseModals = () => {
        setShowEditModal(false);
        setShowViewModal(false);
        setShowWalkInModal(false);
        setSelectedAppointment(null);
    };

    const handleNewAppointment = () => {
        setShowWalkInModal(true);
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
        createColumns(handleDeleteAppointment, handleEditAppointment, handleViewAppointment, handleAddLabTests, handleViewVisit), 
        [handleDeleteAppointment, handleEditAppointment, handleViewAppointment, handleAddLabTests, handleViewVisit]
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
            message: `${appointment.patient_name} scheduled ${formatAppointmentType(appointment.appointment_type)} with ${appointment.specialist_name}`,
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
                    <CardContent className="p-4 sm:p-6">
                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 py-4">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                <Input
                                    placeholder="Search patient name, ID, or specialist..."
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    className="w-full sm:max-w-sm"
                                />
                                
                                <Button
                                    onClick={handleNewAppointment}
                                    className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                                >
                                    <CalendarDays className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Walk-in Appointment</span>
                                    <span className="sm:hidden">Walk-in</span>
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
                                Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} appointments
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:space-x-6 lg:space-x-8">
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
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={handleCloseModals}>
                        <div 
                            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-[101]" 
                            onClick={(e) => e.stopPropagation()}
                        >
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
                                        {/* Patient Name - Read Only */}
                                        <div className="space-y-2">
                                            <Label htmlFor="edit_patient_name">Patient Name</Label>
                                            <Input
                                                value={editForm.patientName}
                                                readOnly
                                                disabled
                                                className="bg-gray-50 cursor-not-allowed"
                                                placeholder="Patient name"
                                            />
                                        </div>
                                        {/* Specialist Type */}
                                        <div className="space-y-2">
                                            <Label htmlFor="edit_specialist_type">Specialist Type *</Label>
                                            <Select
                                                value={editForm.specialist_type}
                                                onValueChange={(value) => {
                                                    setEditForm(prev => ({ ...prev, specialist_type: value, specialist_id: '', time: '' }));
                                                    setEditAvailableTimeSlots([]);
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select specialist type" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[110]" position="item-aligned">
                                                    <SelectItem value="doctor">Doctor</SelectItem>
                                                    <SelectItem value="medtech">MedTech</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        {/* Specialist Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="edit_specialist_id">Attending {editForm.specialist_type === 'doctor' ? 'Physician' : 'MedTech'} *</Label>
                                            <Select
                                                value={editForm.specialist_id}
                                                onValueChange={(value) => {
                                                    setEditForm(prev => ({ ...prev, specialist_id: value, time: '' }));
                                                    setEditAvailableTimeSlots([]);
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={`Select ${editForm.specialist_type === 'doctor' ? 'doctor' : 'medtech'}`} />
                                                </SelectTrigger>
                                                <SelectContent className="z-[110]" position="item-aligned">
                                                    {(editForm.specialist_type === 'doctor' ? doctors : medtechs).length > 0 ? (
                                                        (editForm.specialist_type === 'doctor' ? doctors : medtechs).map((specialist) => (
                                                            <SelectItem key={specialist.id} value={specialist.id.toString()}>
                                                                {specialist.name} {specialist.specialization ? `(${specialist.specialization})` : ''}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="p-2 text-sm text-gray-500">No {editForm.specialist_type === 'doctor' ? 'doctors' : 'medtechs'} available</div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-black mb-2">Date</label>
                                            <Input
                                                type="date"
                                                value={editForm.date}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                                            />
                                        </div>
                                        {/* Appointment Time */}
                                        <div className="space-y-2">
                                            <Label htmlFor="edit_appointment_time">Appointment Time *</Label>
                                            <Select
                                                value={editForm.time}
                                                onValueChange={(value) => setEditForm(prev => ({ ...prev, time: value }))}
                                                disabled={!editForm.specialist_id || !editForm.date || isLoadingEditTimeSlots || editAvailableTimeSlots.length === 0}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={
                                                        !editForm.specialist_id ? "Select specialist first" :
                                                        !editForm.date ? "Select date first" :
                                                        isLoadingEditTimeSlots ? "Loading available times..." :
                                                        editAvailableTimeSlots.length === 0 ? "No available times" :
                                                        "Select time"
                                                    } />
                                                </SelectTrigger>
                                                <SelectContent className="z-[110]" position="item-aligned">
                                                    {editAvailableTimeSlots.length > 0 ? (
                                                        editAvailableTimeSlots.map((slot) => (
                                                            <SelectItem key={slot.value} value={slot.value}>
                                                                {slot.label}
                                                            </SelectItem>
                                                    ))
                                                ) : (
                                                        <div className="p-2 text-sm text-gray-500">
                                                            {!editForm.specialist_id ? "Please select a specialist first" :
                                                             !editForm.date ? "Please select a date first" :
                                                             isLoadingEditTimeSlots ? "Loading..." :
                                                             "No available time slots for this date"}
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {editForm.specialist_id && editForm.date && editAvailableTimeSlots.length === 0 && !isLoadingEditTimeSlots && (
                                                <p className="text-xs text-amber-600">
                                                    No available time slots. The specialist may not have a schedule for this day or all slots are booked.
                                                </p>
                                                )}
                                        </div>
                                        {/* Appointment Type */}
                                        <div className="space-y-2">
                                            <Label htmlFor="edit_appointment_type">Appointment Type *</Label>
                                            <Select
                                                value={editForm.type}
                                                onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select appointment type" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[110]" position="item-aligned">
                                                    {appointmentTypes.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {/* Status */}
                                        <div className="space-y-2">
                                            <Label htmlFor="edit_status">Status *</Label>
                                            <Select
                                                value={editForm.status}
                                                onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[110]" position="item-aligned">
                                                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                                                    <SelectItem value="Pending">Pending</SelectItem>
                                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                                    <SelectItem value="Completed">Completed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {/* Duration */}
                                        <div className="space-y-2">
                                            <Label htmlFor="edit_duration">Duration *</Label>
                                            <Select
                                                value={editForm.duration}
                                                onValueChange={(value) => setEditForm(prev => ({ ...prev, duration: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select duration" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[110]" position="item-aligned">
                                                    <SelectItem value="30 min">30 minutes</SelectItem>
                                                    <SelectItem value="45 min">45 minutes</SelectItem>
                                                    <SelectItem value="60 min">60 minutes</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {/* Contact Number */}
                                        <div className="space-y-2">
                                            <Label htmlFor="edit_contact_number">Contact Number</Label>
                                            <Input
                                                value={editForm.contactNumber}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, contactNumber: e.target.value }))}
                                                placeholder="Enter contact number"
                                            />
                                        </div>
                                        
                                        {/* Additional Notes */}
                                        <div className="md:col-span-2 space-y-2">
                                            <Label htmlFor="edit_additional_info">Additional Notes (Optional)</Label>
                                            <Textarea
                                                value={editForm.additional_info || ''}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, additional_info: e.target.value }))}
                                                placeholder="Enter any additional information or special requirements..."
                                                rows={3}
                                            />
                                        </div>
                                        
                                        {/* Admin Notes */}
                                        <div className="md:col-span-2 space-y-2">
                                            <Label htmlFor="edit_notes">Admin Notes</Label>
                                            <Textarea
                                                value={editForm.notes}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                                                placeholder="Enter admin notes..."
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
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={handleCloseModals}>
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-[101]" onClick={(e) => e.stopPropagation()}>
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
                                                        <div className="font-medium text-black">{selectedAppointment.patient_id_display || selectedAppointment.patient_id || 'N/A'}</div>
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
                                                            {formatAppointmentType(selectedAppointment.appointment_type)}
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
                                        {selectedAppointment.visit_id && (
                                            <Button
                                                onClick={() => {
                                                    handleCloseModals();
                                                    router.get(`/admin/visits/${selectedAppointment.visit_id}/edit`);
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 flex items-center gap-2"
                                            >
                                                <Stethoscope className="h-4 w-4" />
                                                View Visit
                                            </Button>
                                        )}
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
                                                                        <div className="text-xs text-gray-600 text-center">{formatAppointmentType(appointment.appointment_type)}</div>
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

                {/* Walk-in Appointment Modal */}
                <Dialog open={showWalkInModal} onOpenChange={setShowWalkInModal}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <CalendarDays className="h-5 w-5" />
                                Create Walk-in Appointment
                            </DialogTitle>
                            <DialogDescription>
                                Create a new appointment for an existing patient. If the patient doesn't exist, please create their profile first.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <WalkInAppointmentForm
                            patients={patients}
                            doctors={doctors}
                            medtechs={medtechs}
                            appointmentTypes={appointmentTypes}
                            onClose={() => setShowWalkInModal(false)}
                            onSuccess={() => {
                                setShowWalkInModal(false);
                                router.reload({ only: ['appointments'] });
                                toast.success('Walk-in appointment created successfully!');
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

// Walk-in Appointment Form Component
function WalkInAppointmentForm({
    patients,
    doctors,
    medtechs,
    appointmentTypes,
    onClose,
    onSuccess
}: {
    patients: Array<{ id: number; first_name: string; last_name: string; middle_name?: string; patient_no: string; mobile_no?: string; telephone_no?: string; email?: string }>;
    doctors: any[];
    medtechs: any[];
    appointmentTypes: Array<{ value: string; label: string }>;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState({
        patient_id: '',
        appointment_type: '',
        specialist_type: 'doctor',
        specialist_id: '',
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: '',
        additional_info: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableSpecialists, setAvailableSpecialists] = useState<any[]>([]);
    const [availableTimeSlots, setAvailableTimeSlots] = useState<Array<{ value: string; label: string }>>([]);
    const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);

    // Update available specialists when specialist_type changes
    useEffect(() => {
        if (formData.specialist_type === 'doctor') {
            setAvailableSpecialists(doctors);
        } else if (formData.specialist_type === 'medtech') {
            setAvailableSpecialists(medtechs);
        } else {
            setAvailableSpecialists([]);
        }
        // Reset specialist_id and time when type changes
        setFormData(prev => ({ ...prev, specialist_id: '', appointment_time: '' }));
        setAvailableTimeSlots([]);
    }, [formData.specialist_type, doctors, medtechs]);

    // Fetch available time slots based on specialist schedule and existing appointments
    useEffect(() => {
        const fetchAvailableTimeSlots = async () => {
            if (!formData.specialist_id || !formData.appointment_date) {
                setAvailableTimeSlots([]);
                return;
            }

            setIsLoadingTimeSlots(true);
            try {
                // Get selected specialist
                const specialist = availableSpecialists.find(s => s.id.toString() === formData.specialist_id);
                if (!specialist || !specialist.schedule_data) {
                    setAvailableTimeSlots([]);
                    setIsLoadingTimeSlots(false);
                    return;
                }

                // Get day of week from selected date
                const selectedDate = new Date(formData.appointment_date);
                const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                
                // Get available times for that day from specialist's schedule
                const daySchedule = (specialist.schedule_data as any)[dayOfWeek] || [];
                
                if (daySchedule.length === 0) {
                    setAvailableTimeSlots([]);
                    setIsLoadingTimeSlots(false);
                    return;
                }

                // Get existing appointments for this specialist on this date
                const response = await fetch(`/admin/appointments/api/check-availability?specialist_id=${formData.specialist_id}&date=${formData.appointment_date}`);
                const bookedTimes = response.ok ? await response.json() : [];

                // Convert booked times to comparable format
                const bookedTimeStrings = bookedTimes.map((time: string) => {
                    // Handle different time formats: "16:00:00", "16:00", or already formatted
                    let hours: number, minutes: number;
                    if (time.includes(':')) {
                        const parts = time.split(':');
                        hours = parseInt(parts[0] || '0');
                        minutes = parseInt(parts[1] || '0');
                    } else {
                        // Try to parse as formatted time
                        const parsed = new Date(`2000-01-01 ${time}`);
                        if (!isNaN(parsed.getTime())) {
                            hours = parsed.getHours();
                            minutes = parsed.getMinutes();
                        } else {
                            return time; // Return as-is if can't parse
                        }
                    }
                    const date = new Date();
                    date.setHours(hours, minutes, 0, 0);
                    return date.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit', 
                        hour12: true 
                    });
                });

                // Convert schedule times to display format and filter out booked times
                const slots = daySchedule
                    .map((time: string) => {
                        // Convert 24-hour format (e.g., "08:00") to 12-hour format (e.g., "8:00 AM")
                        const [hours, minutes] = time.split(':');
                        const date = new Date();
                        date.setHours(parseInt(hours), parseInt(minutes || '0'), 0, 0);
                        const timeString = date.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit', 
                            hour12: true 
                        });
                        return {
                            value: timeString,
                            label: timeString,
                            raw: time
                        };
                    })
                    .filter((slot: any) => !bookedTimeStrings.includes(slot.value))
                    .map((slot: any) => ({
                        value: slot.value,
                        label: slot.label
                    }));

                setAvailableTimeSlots(slots);
            } catch (error) {
                console.error('Error fetching available time slots:', error);
                setAvailableTimeSlots([]);
            } finally {
                setIsLoadingTimeSlots(false);
            }
        };

        fetchAvailableTimeSlots();
    }, [formData.specialist_id, formData.appointment_date, availableSpecialists]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        router.post('/admin/appointments/walk-in', formData, {
            onSuccess: () => {
                onSuccess();
            },
            onError: (errors) => {
                if (errors && typeof errors === 'object') {
                    setErrors(errors.errors || errors);
                }
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Patient Selection */}
                <div className="space-y-2">
                    <Label htmlFor="patient_id">Patient *</Label>
                    <Select
                        value={formData.patient_id}
                        onValueChange={(value) => {
                            // Find the selected patient
                            const selectedPatient = patients.find(p => p.id.toString() === value);
                            if (selectedPatient) {
                                // Auto-populate contact number (prefer mobile_no, fallback to telephone_no)
                                const contactNumber = selectedPatient.mobile_no || selectedPatient.telephone_no || '';
                                setFormData(prev => ({ 
                                    ...prev, 
                                    patient_id: value,
                                    contact_number: contactNumber
                                }));
                            } else {
                                setFormData(prev => ({ ...prev, patient_id: value }));
                            }
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                        <SelectContent>
                            {patients.length > 0 ? (
                                patients.map((patient) => (
                                    <SelectItem key={patient.id} value={patient.id.toString()}>
                                        {patient.last_name}, {patient.first_name} {patient.middle_name ? patient.middle_name + ' ' : ''}({patient.patient_no})
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="p-2 text-sm text-gray-500">No patients found. Please create a patient profile first.</div>
                            )}
                        </SelectContent>
                    </Select>
                    {errors.patient_id && <p className="text-sm text-red-600">{errors.patient_id}</p>}
                </div>

                {/* Appointment Type */}
                <div className="space-y-2">
                    <Label htmlFor="appointment_type">Appointment Type *</Label>
                    <Select
                        value={formData.appointment_type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, appointment_type: value }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select appointment type" />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                            {appointmentTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.appointment_type && <p className="text-sm text-red-600">{errors.appointment_type}</p>}
                </div>

                {/* Specialist Type */}
                <div className="space-y-2">
                    <Label htmlFor="specialist_type">Specialist Type *</Label>
                    <Select
                        value={formData.specialist_type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, specialist_type: value as 'doctor' | 'medtech' }))}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                            <SelectItem value="doctor">Doctor</SelectItem>
                            <SelectItem value="medtech">MedTech</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.specialist_type && <p className="text-sm text-red-600">{errors.specialist_type}</p>}
                </div>

                {/* Specialist Selection */}
                <div className="space-y-2">
                    <Label htmlFor="specialist_id">Attending {formData.specialist_type === 'doctor' ? 'Physician' : 'MedTech'} *</Label>
                    <Select
                        value={formData.specialist_id}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, specialist_id: value }))}
                        disabled={availableSpecialists.length === 0}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={`Select ${formData.specialist_type === 'doctor' ? 'doctor' : 'medtech'}`} />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                            {availableSpecialists.length > 0 ? (
                                availableSpecialists.map((specialist) => (
                                    <SelectItem key={specialist.id} value={specialist.id.toString()}>
                                        {specialist.name} {specialist.specialization ? `- ${specialist.specialization}` : ''}
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="p-2 text-sm text-gray-500">No {formData.specialist_type === 'doctor' ? 'doctors' : 'medtechs'} available</div>
                            )}
                        </SelectContent>
                    </Select>
                    {errors.specialist_id && <p className="text-sm text-red-600">{errors.specialist_id}</p>}
                </div>

                {/* Appointment Date */}
                <div className="space-y-2">
                    <Label htmlFor="appointment_date">Appointment Date *</Label>
                    <Input
                        id="appointment_date"
                        type="date"
                        value={formData.appointment_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.appointment_date && <p className="text-sm text-red-600">{errors.appointment_date}</p>}
                </div>

                {/* Appointment Time */}
                <div className="space-y-2">
                    <Label htmlFor="appointment_time">Appointment Time *</Label>
                    <Select
                        value={formData.appointment_time}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, appointment_time: value }))}
                        disabled={!formData.specialist_id || !formData.appointment_date || isLoadingTimeSlots || availableTimeSlots.length === 0}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={
                                !formData.specialist_id ? "Select specialist first" :
                                !formData.appointment_date ? "Select date first" :
                                isLoadingTimeSlots ? "Loading available times..." :
                                availableTimeSlots.length === 0 ? "No available times" :
                                "Select time"
                            } />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                            {availableTimeSlots.length > 0 ? (
                                availableTimeSlots.map((slot) => (
                                    <SelectItem key={slot.value} value={slot.value}>
                                        {slot.label}
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="p-2 text-sm text-gray-500">
                                    {!formData.specialist_id ? "Please select a specialist first" :
                                     !formData.appointment_date ? "Please select a date first" :
                                     isLoadingTimeSlots ? "Loading..." :
                                     "No available time slots for this date"}
                                </div>
                            )}
                        </SelectContent>
                    </Select>
                    {errors.appointment_time && <p className="text-sm text-red-600">{errors.appointment_time}</p>}
                    {formData.specialist_id && formData.appointment_date && availableTimeSlots.length === 0 && !isLoadingTimeSlots && (
                        <p className="text-xs text-amber-600">
                            No available time slots. The specialist may not have a schedule for this day or all slots are booked.
                        </p>
                    )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                            <SelectItem value="Confirmed">Confirmed</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                </div>

                {/* Duration */}
                <div className="space-y-2">
                    <Label htmlFor="duration">Duration *</Label>
                    <Select
                        value={formData.duration}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                            <SelectItem value="30 min">30 minutes</SelectItem>
                            <SelectItem value="45 min">45 minutes</SelectItem>
                            <SelectItem value="60 min">60 minutes</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.duration && <p className="text-sm text-red-600">{errors.duration}</p>}
                </div>

                {/* Contact Number */}
                <div className="space-y-2">
                    <Label htmlFor="contact_number">Contact Number</Label>
                    <Input
                        id="contact_number"
                        type="text"
                        value={formData.contact_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))}
                        placeholder="Enter contact number"
                    />
                    {errors.contact_number && <p className="text-sm text-red-600">{errors.contact_number}</p>}
                </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-2">
                <Label htmlFor="additional_info">Additional Notes (Optional)</Label>
                <Textarea
                    id="additional_info"
                    value={formData.additional_info}
                    onChange={(e) => setFormData(prev => ({ ...prev, additional_info: e.target.value }))}
                    placeholder="Enter any additional information or special requirements..."
                    rows={3}
                />
                {errors.additional_info && <p className="text-sm text-red-600">{errors.additional_info}</p>}
            </div>

            {/* Admin Notes */}
            <div className="space-y-2">
                <Label htmlFor="notes">Admin Notes</Label>
                <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Enter admin notes..."
                    rows={3}
                />
                {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || patients.length === 0}>
                    {isSubmitting ? 'Creating...' : 'Create Appointment'}
                </Button>
            </DialogFooter>
        </form>
    );
}
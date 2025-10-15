import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, Link } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, Plus, Search, Stethoscope, Edit, Eye, CalendarDays, Bell, UserCheck, MapPin, Phone, Save, X, AlertCircle, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import RealtimeNotificationBell from '@/components/RealtimeNotificationBell';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/patient/dashboard-simple' },
    { title: 'Appointments', href: '/patient/appointments' },
];

interface PatientAppointmentsProps {
    user: {
        name: string;
        email: string;
        role: string;
    };
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        patient_no: string;
    };
    appointments: Array<{
        id: number;
        type: string;
        specialist: string;
        date: string;
        time: string;
        status: string;
        status_color: string;
        price: string;
        billing_status: string;
    }>;
    available_doctors: Array<{
        id: string;
        name: string;
        specialization: string;
        availability: string;
        nextAvailable: string;
        rating: number;
        experience: string;
    }>;
    notifications?: Array<{
        id: number;
        type: string;
        title: string;
        message: string;
        read: boolean;
        created_at: string;
        data: any;
    }>;
    unreadCount?: number;
}

// Removed hardcoded sample data - using data from controller

const availableTimeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
];

export default function PatientAppointments({ 
    user, 
    patient, 
    appointments = [], 
    available_doctors = [],
    notifications = [],
    unreadCount = 0
}: PatientAppointmentsProps) {
    console.log('PatientAppointments received data:', {
        user,
        patient,
        appointments,
        appointmentsCount: appointments.length,
        available_doctors: available_doctors.length,
        notifications: notifications.length,
        unreadCount
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [appointmentType, setAppointmentType] = useState('');
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [bookingStep, setBookingStep] = useState(1);
    const [sortBy, setSortBy] = useState('created_at'); // 'date', 'time', 'status', 'type', 'created_at'
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
    
    // Real-time state management
    const [appointmentsList, setAppointmentsList] = useState(appointments);
    const [notificationsList, setNotificationsList] = useState(notifications);
    const [unreadCountState, setUnreadCountState] = useState(unreadCount);

    // Real-time updates
    useEffect(() => {
        // Set up real-time listeners for appointment updates
        const setupRealtimeUpdates = () => {
            // Get user ID from props
            const userId = user?.id || 1; // Default to 1 if not available
            
            // Listen for appointment status updates
            (window as any).Echo?.private(`patient.appointments.${userId}`)
                .listen('AppointmentStatusUpdate', (e: any) => {
                    console.log('Appointment status update received:', e);
                    
                    // Force a complete page reload to get fresh data
                    window.location.reload();
                });

            // Listen for new notifications
            (window as any).Echo?.private(`patient.notifications.${userId}`)
                .listen('appointment.status.update', (e: any) => {
                    console.log('Real-time notification received:', e);
                    
                    if (e.notification) {
                        setNotificationsList(prev => [e.notification, ...prev]);
                        setUnreadCountState(prev => prev + 1);
                    }
                });

            // Listen for appointment approval notifications
            (window as any).Echo?.private(`patient.notifications.${userId}`)
                .listen('AppointmentApproved', (e: any) => {
                    console.log('Appointment approved notification received:', e);
                    
                    // Force a complete page reload to get fresh data
                    window.location.reload();
                });
        };

        // Initialize real-time updates
        if ((window as any).Echo) {
            setupRealtimeUpdates();
        }

        // Cleanup on unmount
        return () => {
            const userId = user?.id || 1;
            if ((window as any).Echo) {
                (window as any).Echo.leave(`patient.appointments.${userId}`);
                (window as any).Echo.leave(`patient.notifications.${userId}`);
            }
        };
    }, [user?.id]);

    // Update local state when props change
    useEffect(() => {
        setAppointmentsList(appointments);
        setNotificationsList(notifications);
        setUnreadCountState(unreadCount);
    }, [appointments, notifications, unreadCount]);
    
    // Edit and View Modal States
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    
    // Edit Form State
    const { data: editData, setData: setEditData, put, processing: editProcessing, errors: editErrors } = useForm({
        appointment_type: '',
        specialist_id: '',
        appointment_date: '',
        appointment_time: '',
        notes: ''
    });

    const filteredAppointments = appointmentsList.filter(appointment => {
        const matchesSearch = appointment.specialist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            appointment.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || appointment.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
            case 'date':
                comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                break;
            case 'time':
                comparison = a.time.localeCompare(b.time);
                break;
            case 'status':
                comparison = a.status.localeCompare(b.status);
                break;
            case 'type':
                comparison = a.type.localeCompare(b.type);
                break;
            case 'created_at':
                comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                break;
            default:
                comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    console.log('Filtered appointments:', {
        totalAppointments: appointmentsList.length,
        filteredCount: filteredAppointments.length,
        searchTerm,
        statusFilter,
        sortBy,
        sortOrder,
        firstFewAppointments: filteredAppointments.slice(0, 3)
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Confirmed':
                return 'bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded-full max-w-fit';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-medium rounded-full max-w-fit';
            case 'Cancelled':
                return 'bg-red-100 text-red-800 px-2 py-1 text-xs font-medium rounded-full max-w-fit';
            case 'Completed':
                return 'bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded-full max-w-fit';
            default:
                return 'bg-gray-100 text-gray-800 px-2 py-1 text-xs font-medium rounded-full max-w-fit';
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'New Consultation':
                return 'bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded-full max-w-fit';
            case 'Follow-up':
                return 'bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded-full max-w-fit';
            case 'Emergency':
                return 'bg-red-100 text-red-800 px-2 py-1 text-xs font-medium rounded-full max-w-fit';
            default:
                return 'bg-gray-100 text-gray-800 px-2 py-1 text-xs font-medium rounded-full max-w-fit';
        }
    };

    const handleBookAppointment = () => {
        // In a real app, this would submit the form data
        alert('Appointment booked successfully! You will receive a confirmation email shortly.');
        setShowBookingForm(false);
        setBookingStep(1);
        setSelectedDoctor('');
        setSelectedDate('');
        setSelectedTime('');
        setAppointmentType('');
    };

    const nextStep = () => {
        if (bookingStep < 3) {
            setBookingStep(bookingStep + 1);
        }
    };

    const prevStep = () => {
        if (bookingStep > 1) {
            setBookingStep(bookingStep - 1);
        }
    };

    // Handle View Appointment Details
    const handleViewAppointment = (appointment: any) => {
        setSelectedAppointment(appointment);
        setShowViewModal(true);
    };

    // Handle Edit Appointment
    const handleEditAppointment = (appointment: any) => {
        setSelectedAppointment(appointment);
        setEditData({
            appointment_type: appointment.type,
            specialist_id: appointment.specialist_id || '',
            appointment_date: appointment.date,
            appointment_time: appointment.time,
            notes: appointment.notes || ''
        });
        setShowEditModal(true);
    };

    // Handle Save Edit
    const handleSaveEdit = () => {
        if (selectedAppointment) {
            put(route('patient.appointments.update', selectedAppointment.id), {
                onSuccess: () => {
                    setShowEditModal(false);
                    setSelectedAppointment(null);
                    // Show success message
                    alert('Appointment updated successfully! Admin has been notified of the changes.');
                },
                onError: (errors) => {
                    console.error('Edit errors:', errors);
                }
            });
        }
    };

    // Handle Cancel Edit
    const handleCancelEdit = () => {
        setShowEditModal(false);
        setSelectedAppointment(null);
        setEditData({
            appointment_type: '',
            specialist_id: '',
            appointment_date: '',
            appointment_time: '',
            notes: ''
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Appointments" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="mb-4">
                        <Link href={route('patient.dashboard.simple')} className="inline-flex items-center text-blue-600 hover:text-blue-800">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">My Appointments</h1>
                                <p className="text-sm text-black mt-1">Manage your appointments and book new ones online</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Notification Bell */}
                            <RealtimeNotificationBell 
                                userRole="patient"
                                initialNotifications={notificationsList}
                                unreadCount={unreadCountState}
                            />
                            <Button 
                                onClick={() => router.visit('/patient/register-and-book')}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                            >
                                <CalendarDays className="h-5 w-5" />
                                Book New Appointment
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Online Booking System */}
                {showBookingForm && (
                    <Card className="shadow-lg border-0 rounded-xl bg-white mb-8">
                        <CardHeader className="bg-white border-b border-gray-200">
                            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                <CalendarDays className="h-5 w-5 text-black" />
                                Book New Appointment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Step Indicator */}
                            <div className="flex items-center justify-center mb-8">
                                <div className="flex items-center space-x-4">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${bookingStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                        1
                                    </div>
                                    <div className={`w-16 h-1 ${bookingStep >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${bookingStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                        2
                                    </div>
                                    <div className={`w-16 h-1 ${bookingStep >= 3 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${bookingStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                        3
                                    </div>
                                </div>
                            </div>

                            {/* Step 1: Select Doctor */}
                            {bookingStep === 1 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-black mb-4">Step 1: Choose Your Doctor</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {available_doctors.map(doctor => (
                                            <div 
                                                key={doctor.id} 
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                    selectedDoctor === doctor.id 
                                                        ? 'border-green-500 bg-green-50' 
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                onClick={() => setSelectedDoctor(doctor.id)}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="font-semibold text-black">{doctor.name}</div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-yellow-500">★</span>
                                                        <span className="text-sm text-gray-600">{doctor.rating}</span>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-600 mb-2">{doctor.specialization}</div>
                                                <div className="text-sm text-gray-500 mb-2">{doctor.experience} experience</div>
                                                <div className="text-sm text-gray-500 mb-2">Available: {doctor.availability}</div>
                                                <div className="text-sm text-green-600 font-medium">Next available: {doctor.nextAvailable}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-end mt-6">
                                        <Button 
                                            onClick={nextStep}
                                            disabled={!selectedDoctor}
                                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                                        >
                                            Next Step
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Select Date & Time */}
                            {bookingStep === 2 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-black mb-4">Step 2: Choose Date & Time</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-black mb-2">Select Date</label>
                                            <input 
                                                type="date" 
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-black mb-2">Select Time</label>
                                            <select 
                                                value={selectedTime}
                                                onChange={(e) => setSelectedTime(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            >
                                                <option value="">Choose time...</option>
                                                {availableTimeSlots.map(time => (
                                                    <option key={time} value={time}>{time}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-between mt-6">
                                        <Button 
                                            onClick={prevStep}
                                            variant="outline"
                                            className="px-6 py-2"
                                        >
                                            Previous
                                        </Button>
                                        <Button 
                                            onClick={nextStep}
                                            disabled={!selectedDate || !selectedTime}
                                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                                        >
                                            Next Step
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Confirm Booking */}
                            {bookingStep === 3 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-black mb-4">Step 3: Confirm Your Appointment</h3>
                                    <div className="bg-gray-50 p-6 rounded-lg mb-6">
                                        <h4 className="font-semibold text-black mb-4">Appointment Details</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Doctor:</span>
                                                <span className="font-medium text-black">
                                                    {availableDoctors.find(d => d.id === selectedDoctor)?.name}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Specialization:</span>
                                                <span className="font-medium text-black">
                                                    {availableDoctors.find(d => d.id === selectedDoctor)?.specialization}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Date:</span>
                                                <span className="font-medium text-black">{selectedDate}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Time:</span>
                                                <span className="font-medium text-black">{selectedTime}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Duration:</span>
                                                <span className="font-medium text-black">30 minutes</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-black mb-2">Appointment Type</label>
                                        <select 
                                            value={appointmentType}
                                            onChange={(e) => setAppointmentType(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        >
                                            <option value="">Select type...</option>
                                            <option value="New Consultation">New Consultation</option>
                                            <option value="Follow-up">Follow-up</option>
                                            <option value="Emergency">Emergency</option>
                                        </select>
                                    </div>

                                    <div className="flex justify-between mt-6">
                                        <Button 
                                            onClick={prevStep}
                                            variant="outline"
                                            className="px-6 py-2"
                                        >
                                            Previous
                                        </Button>
                                        <Button 
                                            onClick={handleBookAppointment}
                                            disabled={!appointmentType}
                                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 flex items-center gap-2"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            Confirm Booking
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* My Appointments */}
                <Card className="shadow-lg border-0 rounded-xl bg-white">
                    <CardHeader className="bg-white border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                <Calendar className="h-5 w-5 text-black" />
                                My Appointments ({filteredAppointments.length})
                            </CardTitle>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search appointments..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 w-80"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="pending">Pending</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="completed">Completed</option>
                                </select>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                        <option value="created_at">Sort by Created Date</option>
                        <option value="date">Sort by Appointment Date</option>
                        <option value="time">Sort by Time</option>
                        <option value="status">Sort by Status</option>
                        <option value="type">Sort by Type</option>
                                </select>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="desc">Descending</option>
                                    <option value="asc">Ascending</option>
                                </select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="text-black font-semibold w-1/4">Doctor</TableHead>
                                        <TableHead className="text-black font-semibold w-1/6">Date & Time</TableHead>
                                        <TableHead className="text-black font-semibold w-1/6">Type</TableHead>
                                        <TableHead className="text-black font-semibold w-1/6">Status</TableHead>
                                        <TableHead className="text-black font-semibold w-1/6">Location</TableHead>
                                        <TableHead className="text-black font-semibold w-1/6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAppointments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                No appointments found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredAppointments.map((appointment) => (
                                            <TableRow key={appointment.id} className="hover:bg-gray-50">
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-black">{appointment.specialist}</div>
                                                        <div className="text-sm text-gray-500">{appointment.type}</div>
                                                        <div className="text-sm text-gray-500">Price: {appointment.price}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-black">{appointment.date}</div>
                                                        <div className="text-sm text-gray-500">{appointment.time}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-32">
                                                        <Badge className={getTypeBadge(appointment.type)}>
                                                            <span className="truncate block">
                                                                {appointment.type}
                                                            </span>
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 max-w-32">
                                                        <Badge className={getStatusBadge(appointment.status)}>
                                                            <span className="truncate block">
                                                                {appointment.status}
                                                            </span>
                                                        </Badge>
                                                        {appointment.billing_status && appointment.billing_status !== 'paid' && (
                                                            <span className="text-xs text-gray-500 truncate block">
                                                                Billing: {appointment.billing_status}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <MapPin className="h-4 w-4" />
                                                        St. James Clinic
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewAppointment(appointment)}
                                                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                        {appointment.status === 'Pending' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEditAppointment(appointment)}
                                                                className="text-green-600 border-green-300 hover:bg-green-50"
                                                            >
                                                                <Edit className="h-4 w-4 mr-1" />
                                                                Edit
                                                            </Button>
                                                        )}
                                                        {appointment.status === 'Pending' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-red-600 border-red-300 hover:bg-red-50"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* View Appointment Modal */}
                <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Eye className="h-5 w-5 text-blue-600" />
                                Appointment Details
                            </DialogTitle>
                            <DialogDescription>
                                View detailed information about your appointment
                            </DialogDescription>
                        </DialogHeader>
                        {selectedAppointment && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Doctor</Label>
                                        <p className="text-lg font-semibold">{selectedAppointment.specialist}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Status</Label>
                                        <div className="mt-1">
                                            <Badge className={getStatusBadge(selectedAppointment.status)}>
                                                {selectedAppointment.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Date</Label>
                                        <p className="text-lg">{selectedAppointment.date}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Time</Label>
                                        <p className="text-lg">{selectedAppointment.time}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Type</Label>
                                        <p className="text-lg">{selectedAppointment.type}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Price</Label>
                                        <p className="text-lg font-semibold text-green-600">{selectedAppointment.price}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Location</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <MapPin className="h-4 w-4 text-gray-500" />
                                        <span>St. James Clinic</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowViewModal(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Appointment Modal */}
                <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Edit className="h-5 w-5 text-green-600" />
                                Edit Appointment
                            </DialogTitle>
                            <DialogDescription>
                                Update your appointment details. Admin will be notified of changes.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="appointment_type">Appointment Type</Label>
                                    <Select value={editData.appointment_type} onValueChange={(value) => setEditData('appointment_type', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="consultation">Consultation</SelectItem>
                                            <SelectItem value="checkup">Checkup</SelectItem>
                                            <SelectItem value="fecalysis">Fecalysis</SelectItem>
                                            <SelectItem value="cbc">CBC</SelectItem>
                                            <SelectItem value="urinalysis">Urinalysis</SelectItem>
                                            <SelectItem value="x-ray">X-Ray</SelectItem>
                                            <SelectItem value="ultrasound">Ultrasound</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {editErrors.appointment_type && (
                                        <p className="text-red-500 text-sm mt-1">{editErrors.appointment_type}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <Label htmlFor="specialist_id">Doctor</Label>
                                    <Select value={editData.specialist_id} onValueChange={(value) => setEditData('specialist_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select doctor..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {available_doctors.map((doctor) => (
                                                <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                                    {doctor.name} - {doctor.specialization}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {editErrors.specialist_id && (
                                        <p className="text-red-500 text-sm mt-1">{editErrors.specialist_id}</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="appointment_date">Date</Label>
                                    <Input
                                        id="appointment_date"
                                        type="date"
                                        value={editData.appointment_date}
                                        onChange={(e) => setEditData('appointment_date', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    {editErrors.appointment_date && (
                                        <p className="text-red-500 text-sm mt-1">{editErrors.appointment_date}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <Label htmlFor="appointment_time">Time</Label>
                                    <Select value={editData.appointment_time} onValueChange={(value) => setEditData('appointment_time', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select time..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableTimeSlots.map((time) => (
                                                <SelectItem key={time} value={time}>
                                                    {time}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {editErrors.appointment_time && (
                                        <p className="text-red-500 text-sm mt-1">{editErrors.appointment_time}</p>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <Label htmlFor="notes">Additional Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={editData.notes}
                                    onChange={(e) => setEditData('notes', e.target.value)}
                                    placeholder="Any special requirements or notes..."
                                    rows={3}
                                />
                                {editErrors.notes && (
                                    <p className="text-red-500 text-sm mt-1">{editErrors.notes}</p>
                                )}
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-blue-600" />
                                    <p className="text-blue-800 font-medium">Admin Notification</p>
                                </div>
                                <p className="text-blue-700 text-sm mt-1">
                                    The admin will be automatically notified when you make changes to your appointment.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleCancelEdit}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button onClick={handleSaveEdit} disabled={editProcessing} className="bg-green-600 hover:bg-green-700">
                                <Save className="h-4 w-4 mr-2" />
                                {editProcessing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

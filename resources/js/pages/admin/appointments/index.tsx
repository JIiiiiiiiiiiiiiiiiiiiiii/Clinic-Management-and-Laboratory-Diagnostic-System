import RealtimeNotificationBell from '@/components/RealtimeNotificationBell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Bell, Calendar, CalendarDays, CheckCircle, Clock, Edit, Eye, Plus, Save, Search, Trash2, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Appointments', href: '/admin/appointments' },
];

// Start with empty appointments list - in real app this would come from props
// Cache bust: 2025-01-15 - All mock data removed
const initialAppointments: any[] = [];

const doctors = [
    { id: 'D001', name: 'Dr. Smith', specialization: 'Cardiology', availability: 'Mon-Fri 9AM-5PM' },
    { id: 'D002', name: 'Dr. Johnson', specialization: 'Internal Medicine', availability: 'Mon-Fri 8AM-4PM' },
    { id: 'D003', name: 'Dr. Davis', specialization: 'Emergency Medicine', availability: '24/7' },
    { id: 'D004', name: 'Dr. Wilson', specialization: 'Surgery', availability: 'Mon-Fri 10AM-6PM' },
    { id: 'D005', name: 'Dr. Brown', specialization: 'General Practice', availability: 'Mon-Fri 9AM-5PM' },
];

const medTechs = [
    { id: 'MT001', name: 'Sarah Johnson', specialization: 'Laboratory Technician', availability: 'Mon-Fri 8AM-5PM' },
    { id: 'MT002', name: 'Michael Chen', specialization: 'Medical Technologist', availability: 'Mon-Fri 9AM-6PM' },
    { id: 'MT003', name: 'Emily Rodriguez', specialization: 'Lab Specialist', availability: 'Mon-Fri 7AM-4PM' },
    { id: 'MT004', name: 'David Kim', specialization: 'Clinical Laboratory Scientist', availability: 'Mon-Fri 8AM-5PM' },
];

const appointmentTypes = [
    { id: 'consultation', name: 'Consultation', requiresDoctor: true, requiresMedTech: false },
    { id: 'checkup', name: 'Check-up', requiresDoctor: true, requiresMedTech: false },
    { id: 'fecalysis', name: 'Fecalysis', requiresDoctor: false, requiresMedTech: true },
    { id: 'cbc', name: 'CBC (Complete Blood Count)', requiresDoctor: false, requiresMedTech: true },
    { id: 'urinalysis', name: 'Urinalysis', requiresDoctor: false, requiresMedTech: true },
];

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
}

export default function AppointmentsIndex({ appointments, filters, nextPatientId }: AppointmentsIndexProps & { nextPatientId?: string }) {
    const { permissions } = useRoleAccess();
    const [appointmentsList, setAppointmentsList] = useState(appointments?.data || []);

    // Update local state when props change
    useEffect(() => {
        console.log('Appointments data received:', appointments);
        setAppointmentsList(appointments?.data || []);
    }, [appointments?.data]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [doctorFilter, setDoctorFilter] = useState('all');
    const [showOnlineSchedule, setShowOnlineSchedule] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Initialize filters from props
    useEffect(() => {
        if (filters.search) setSearchTerm(filters.search);
        if (filters.status) setStatusFilter(filters.status);
        if (filters.date) setDateFilter(filters.date);
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
        contactNumber: '',
    });
    const [newAppointmentForm, setNewAppointmentForm] = useState({
        patientName: '',
        patientId: '',
        appointmentType: '',
        specialist: '',
        specialistType: '', // 'doctor' or 'medtech'
        date: '',
        time: '',
        status: 'Pending',
        duration: '30 min',
        notes: '',
        contactNumber: '',
        price: 0,
    });

    // Calculate price based on appointment type
    const calculatePrice = (appointmentType: string) => {
        const prices: { [key: string]: number } = {
            consultation: 300,
            checkup: 300,
            fecalysis: 500,
            cbc: 500,
            urinalysis: 500,
            'x-ray': 700,
            ultrasound: 800,
        };
        return prices[appointmentType] || 0;
    };

    const filteredAppointments = appointmentsList.filter((appointment) => {
        const matchesSearch =
            appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.specialist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.patient_id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || appointment.status.toLowerCase() === statusFilter.toLowerCase();
        const matchesDate = dateFilter === 'all' || appointment.appointment_date === dateFilter;
        const matchesDoctor = doctorFilter === 'all' || appointment.specialist_id === doctorFilter;
        return matchesSearch && matchesStatus && matchesDate && matchesDoctor;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Confirmed':
                return 'bg-gray-100 text-black';
            case 'Pending':
                return 'bg-gray-100 text-black';
            case 'Cancelled':
                return 'bg-gray-100 text-black';
            case 'Completed':
                return 'bg-gray-100 text-black';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'New Consultation':
                return 'bg-gray-100 text-black';
            case 'Follow-up':
                return 'bg-gray-100 text-black';
            case 'Emergency':
                return 'bg-gray-100 text-black';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const todayAppointments = appointmentsList.filter((apt) => apt.appointment_date === new Date().toISOString().split('T')[0]);
    const totalAppointments = appointmentsList.length;
    const confirmedAppointments = appointmentsList.filter((apt) => apt.status === 'Confirmed').length;
    const onlineBookings = 0; // Removed booking method tracking
    const pendingAppointments = appointmentsList.filter((apt) => apt.status === 'Pending').length;

    const handleEditAppointment = (appointment: any) => {
        setSelectedAppointment(appointment);
        setEditForm({
            patientName: appointment.patient_name,
            doctor: appointment.specialist_name,
            date: appointment.appointment_date,
            time: appointment.appointment_time
                ? appointment.appointment_time.includes('T')
                    ? appointment.appointment_time.split('T')[1]?.substring(0, 5)
                    : appointment.appointment_time.substring(0, 5)
                : '',
            type: appointment.appointment_type,
            status: appointment.status,
            duration: appointment.duration,
            notes: appointment.notes,
            contactNumber: appointment.contact_number,
        });
        setShowEditModal(true);
    };

    const handleViewAppointment = (appointment: any) => {
        setSelectedAppointment(appointment);
        setShowViewModal(true);
    };

    const handleSaveEdit = () => {
        if (!editForm.patientName || !editForm.doctor || !editForm.date || !editForm.time) {
            alert('Please fill in all required fields');
            return;
        }

        // Update appointment via API
        router.put(
            route('admin.appointments.update', selectedAppointment.id),
            {
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
            },
            {
                onSuccess: (page) => {
                    // Add notification for appointment update
                    const updateNotification = {
                        id: Date.now(),
                        type: 'appointment_updated',
                        title: 'Appointment Updated',
                        message: `${editForm.patientName}'s appointment has been updated`,
                        appointmentId: selectedAppointment.id,
                        timestamp: new Date(),
                        read: false,
                    };
                    setNotifications((prev) => [updateNotification, ...prev]);
                    setUnreadCount((prev) => prev + 1);

                    alert('Appointment updated successfully!');
                    setShowEditModal(false);
                    setSelectedAppointment(null);
                },
                onError: (errors) => {
                    console.error('Error updating appointment:', errors);
                    alert('Error updating appointment. Please try again.');
                },
            },
        );
    };

    const handleDeleteAppointment = (appointmentId: number) => {
        if (confirm('Are you sure you want to delete this appointment?')) {
            // Get appointment details before deletion
            const appointmentToDelete = appointmentsList.find((apt) => apt.id === appointmentId);

            // Delete appointment via API
            router.delete(route('admin.appointments.destroy', appointmentId), {
                onSuccess: (page) => {
                    // Add notification for appointment deletion
                    if (appointmentToDelete) {
                        const deleteNotification = {
                            id: Date.now(),
                            type: 'appointment_deleted',
                            title: 'Appointment Deleted',
                            message: `${appointmentToDelete.patient_name}'s appointment has been deleted`,
                            appointmentId: appointmentId,
                            timestamp: new Date(),
                            read: false,
                        };
                        setNotifications((prev) => [deleteNotification, ...prev]);
                        setUnreadCount((prev) => prev + 1);
                    }

                    alert('Appointment deleted successfully!');
                },
                onError: (errors) => {
                    console.error('Error deleting appointment:', errors);
                    alert('Error deleting appointment. Please try again.');
                },
            });
        }
    };

    const handleCloseModals = () => {
        setShowEditModal(false);
        setShowViewModal(false);
        setShowNewAppointmentModal(false);
        setSelectedAppointment(null);
    };

    const handleNewAppointment = () => {
        // Use the next available patient ID from backend
        const suggestedPatientId = nextPatientId || 'P001';

        setNewAppointmentForm({
            patientName: '',
            patientId: suggestedPatientId, // Show suggested ID for manual entry
            appointmentType: '',
            specialist: '',
            specialistType: '',
            date: '',
            time: '',
            status: 'Pending',
            duration: '30 min',
            notes: '',
            contactNumber: '',
            price: 0,
        });
        setShowNewAppointmentModal(true);
    };

    const handleSaveNewAppointment = () => {
        console.log('Form data:', newAppointmentForm);

        if (
            !newAppointmentForm.patientName ||
            !newAppointmentForm.specialist ||
            !newAppointmentForm.appointmentType ||
            !newAppointmentForm.date ||
            !newAppointmentForm.time
        ) {
            alert('Please fill in all required fields');
            console.log('Missing fields:', {
                patientName: !newAppointmentForm.patientName,
                specialist: !newAppointmentForm.specialist,
                appointmentType: !newAppointmentForm.appointmentType,
                date: !newAppointmentForm.date,
                time: !newAppointmentForm.time,
            });
            return;
        }

        // Get specialist info
        const selectedType = appointmentTypes.find((t) => t.id === newAppointmentForm.appointmentType);
        const specialistName =
            newAppointmentForm.specialistType === 'doctor'
                ? doctors.find((d) => d.id === newAppointmentForm.specialist)?.name || 'Dr. Unknown'
                : medTechs.find((m) => m.id === newAppointmentForm.specialist)?.name || 'Med Tech Unknown';

        // Create new appointment via API
        const appointmentData = {
            patient_name: newAppointmentForm.patientName,
            patient_id: newAppointmentForm.patientId,
            contact_number: newAppointmentForm.contactNumber,
            appointment_type: newAppointmentForm.appointmentType,
            price: newAppointmentForm.price,
            specialist_type: newAppointmentForm.specialistType,
            specialist_name: specialistName,
            specialist_id: newAppointmentForm.specialist,
            appointment_date: newAppointmentForm.date,
            appointment_time: newAppointmentForm.time,
            duration: newAppointmentForm.duration,
            status: newAppointmentForm.status,
            notes: newAppointmentForm.notes,
            special_requirements: newAppointmentForm.notes, // Use notes as special requirements for now
        };

        console.log('Sending appointment data:', appointmentData);

        router.post(route('admin.appointments.store'), appointmentData, {
            onSuccess: (page) => {
                console.log('Appointment created successfully');
                // Add notification for new appointment
                const newAppointment = {
                    id: Date.now(),
                    patient_name: newAppointmentForm.patientName,
                    patient_id: newAppointmentForm.patientId,
                    specialist_name: specialistName,
                    appointment_type: selectedType?.name || newAppointmentForm.appointmentType,
                    status: newAppointmentForm.status,
                };
                addNotification(newAppointment);

                alert('New appointment created successfully!');
                setShowNewAppointmentModal(false);
                setNewAppointmentForm({
                    patientName: '',
                    patientId: '',
                    appointmentType: '',
                    specialist: '',
                    specialistType: '',
                    date: '',
                    time: '',
                    status: 'Pending',
                    duration: '30 min',
                    notes: '',
                    contactNumber: '',
                    price: 0,
                });
            },
            onError: (errors) => {
                console.error('Error creating appointment:', errors);
                console.error('Validation errors:', errors);
                console.error('Form data sent:', appointmentData);

                // Show user-friendly error messages
                let errorMessage = 'Error creating appointment:\n';
                if (errors.patient_id) {
                    errorMessage += `• Patient ID: ${errors.patient_id}\n`;
                }
                if (errors.appointment_time) {
                    errorMessage += `• Time: ${errors.appointment_time}\n`;
                }
                if (errors.patient_name) {
                    errorMessage += `• Patient Name: ${errors.patient_name}\n`;
                }
                if (errors.appointment_date) {
                    errorMessage += `• Date: ${errors.appointment_date}\n`;
                }
                if (errors.specialist_name) {
                    errorMessage += `• Specialist: ${errors.specialist_name}\n`;
                }
                if (errors.specialist_id) {
                    errorMessage += `• Specialist ID: ${errors.specialist_id}\n`;
                }
                if (errors.appointment_type) {
                    errorMessage += `• Appointment Type: ${errors.appointment_type}\n`;
                }
                if (errors.specialist_type) {
                    errorMessage += `• Specialist Type: ${errors.specialist_type}\n`;
                }
                if (errors.contact_number) {
                    errorMessage += `• Contact Number: ${errors.contact_number}\n`;
                }

                // If no specific field errors, show general error
                if (errorMessage === 'Error creating appointment:\n') {
                    errorMessage += 'Please check all fields and try again.';
                }

                alert(errorMessage);
            },
        });
    };

    const addNotification = (appointment: any) => {
        const notification = {
            id: Date.now(),
            type: 'new_appointment',
            title: 'New Appointment Added',
            message: `${appointment.patient_name} scheduled ${appointment.appointment_type} with ${appointment.specialist_name}`,
            appointmentId: appointment.id,
            timestamp: new Date(),
            read: false,
        };

        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
    };

    const markNotificationAsRead = (notificationId: number) => {
        setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
        setUnreadCount(0);
    };

    const removeNotification = (notificationId: number) => {
        const notification = notifications.find((n) => n.id === notificationId);
        if (notification && !notification.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appointments" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="mb-4 text-4xl font-semibold text-black">Appointments</h1>
                                <p className="mt-1 text-sm text-black">Manage patient appointments and online scheduling</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Real-time Notification Bell */}
                            <RealtimeNotificationBell userRole="admin" initialNotifications={notifications} unreadCount={unreadCount} />

                            <div className="rounded-xl border bg-white px-6 py-4 shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gray-100 p-2">
                                        <Calendar className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-black">{totalAppointments}</div>
                                        <div className="text-sm font-medium text-black">Total Appointments</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <Card className="rounded-xl border-0 bg-white shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-gray-100 p-3">
                                    <CheckCircle className="h-6 w-6 text-black" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-black">{confirmedAppointments}</div>
                                    <div className="text-sm font-medium text-black">Confirmed</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border-0 bg-white shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-gray-100 p-3">
                                    <Clock className="h-6 w-6 text-black" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-black">{pendingAppointments}</div>
                                    <div className="text-sm font-medium text-black">Pending</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border-0 bg-white shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-gray-100 p-3">
                                    <CalendarDays className="h-6 w-6 text-black" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-black">{onlineBookings}</div>
                                    <div className="text-sm font-medium text-black">Online Bookings</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border-0 bg-white shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-gray-100 p-3">
                                    <Users className="h-6 w-6 text-black" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-black">{doctors.length}</div>
                                    <div className="text-sm font-medium text-black">Available Doctors</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card className="mb-6 rounded-xl border-0 bg-white shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                    <Input
                                        placeholder="Search appointments..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-80 pl-10"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:ring-2 focus:ring-black"
                                >
                                    <option value="all">All Status</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="pending">Pending</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="completed">Completed</option>
                                </select>
                                <select
                                    value={doctorFilter}
                                    onChange={(e) => setDoctorFilter(e.target.value)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:ring-2 focus:ring-black"
                                >
                                    <option value="all">All Doctors</option>
                                    {doctors.map((doctor) => (
                                        <option key={doctor.id} value={doctor.id}>
                                            {doctor.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handleNewAppointment}
                                    className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                                >
                                    <CalendarDays className="h-4 w-4" />
                                    Online Schedule
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Appointments Table */}
                <Card className="rounded-xl border-0 bg-white shadow-lg">
                    <CardHeader className="border-b border-gray-200 bg-white">
                        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                            <Calendar className="h-5 w-5 text-black" />
                            Appointments ({filteredAppointments.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="px-6 py-3 font-semibold text-black">Patient</TableHead>
                                        <TableHead className="px-6 py-3 font-semibold text-black">Doctor</TableHead>
                                        <TableHead className="px-6 py-3 font-semibold text-black">Date & Time</TableHead>
                                        <TableHead className="px-6 py-3 font-semibold text-black">Type</TableHead>
                                        <TableHead className="px-6 py-3 font-semibold text-black">Source</TableHead>
                                        <TableHead className="px-6 py-3 font-semibold text-black">Status</TableHead>
                                        <TableHead className="px-6 py-3 font-semibold text-black">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAppointments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                                                {appointmentsList.length === 0
                                                    ? 'No appointments yet. Click "New Appointment" to create your first appointment.'
                                                    : 'No appointments found matching your search criteria.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredAppointments.map((appointment) => (
                                            <TableRow key={appointment.id} className="hover:bg-gray-50">
                                                <TableCell className="px-6 py-4">
                                                    <div>
                                                        <div className="font-medium text-black">{appointment.patient_name}</div>
                                                        <div className="text-sm text-gray-500">{appointment.patient_id}</div>
                                                        <div className="text-sm text-gray-500">{appointment.contactNumber}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <div>
                                                        <div className="font-medium text-black">{appointment.specialist_name}</div>
                                                        <div className="text-sm text-gray-500">{appointment.duration}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <div>
                                                        <div className="font-medium text-black">
                                                            {appointment.appointment_date
                                                                ? new Date(appointment.appointment_date).toLocaleDateString()
                                                                : 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {appointment.appointment_time ? appointment.appointment_time.substring(0, 5) : 'N/A'}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <Badge className={getTypeBadge(appointment.appointment_type)}>
                                                        {appointment.appointment_type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <Badge
                                                        className={
                                                            appointment.appointment_source === 'online'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-green-100 text-green-800'
                                                        }
                                                    >
                                                        {appointment.appointment_source === 'online' ? 'Online' : 'Walk-in'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <Badge className={getStatusBadge(appointment.status)}>{appointment.status}</Badge>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {appointment.confirmationSent && <Bell className="h-4 w-4 text-black" />}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEditAppointment(appointment)}
                                                            className="min-w-[75px] border-gray-300 px-3 text-black hover:bg-gray-50"
                                                        >
                                                            <Edit className="mr-1 h-4 w-4" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewAppointment(appointment)}
                                                            className="min-w-[75px] border-gray-300 px-3 text-black hover:bg-gray-50"
                                                        >
                                                            <Eye className="mr-1 h-4 w-4" />
                                                            View
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDeleteAppointment(appointment.id)}
                                                            className="min-w-[75px] border-gray-300 px-3 text-black hover:bg-gray-50"
                                                        >
                                                            <Trash2 className="mr-1 h-4 w-4" />
                                                            Delete
                                                        </Button>
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

                {/* Edit Appointment Modal */}
                {showEditModal && selectedAppointment && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
                        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
                            <Card className="border-0">
                                <CardHeader className="border-b border-gray-200 bg-white">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                            <Edit className="h-5 w-5 text-black" />
                                            Edit Appointment
                                        </CardTitle>
                                        <Button variant="outline" size="sm" onClick={handleCloseModals} className="text-gray-500 hover:text-gray-700">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-black">Patient Name</label>
                                            <Input
                                                value={editForm.patientName}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, patientName: e.target.value }))}
                                                placeholder="Enter patient name"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-black">Doctor</label>
                                            <select
                                                value={editForm.doctor}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, doctor: e.target.value }))}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-black"
                                            >
                                                <option value="">Select doctor...</option>
                                                {doctors.map((doctor) => (
                                                    <option key={doctor.id} value={doctor.name}>
                                                        {doctor.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-black">Date</label>
                                            <Input
                                                type="date"
                                                value={editForm.date}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-black">Time</label>
                                            <Input
                                                type="time"
                                                value={editForm.time}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, time: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-black">Appointment Type</label>
                                            <select
                                                value={editForm.type}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, type: e.target.value }))}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-black"
                                            >
                                                <option value="">Select type...</option>
                                                <option value="New Consultation">New Consultation</option>
                                                <option value="Follow-up">Follow-up</option>
                                                <option value="Emergency">Emergency</option>
                                                <option value="Routine Checkup">Routine Checkup</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-black">Status</label>
                                            <select
                                                value={editForm.status}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-black"
                                            >
                                                <option value="">Select status...</option>
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Pending">Pending</option>
                                                <option value="Cancelled">Cancelled</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-black">Duration</label>
                                            <select
                                                value={editForm.duration}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, duration: e.target.value }))}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-black"
                                            >
                                                <option value="">Select duration...</option>
                                                <option value="30 min">30 minutes</option>
                                                <option value="45 min">45 minutes</option>
                                                <option value="60 min">60 minutes</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-black">Contact Number</label>
                                            <Input
                                                value={editForm.contactNumber}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, contactNumber: e.target.value }))}
                                                placeholder="Enter contact number"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="mb-2 block text-sm font-medium text-black">Notes</label>
                                            <textarea
                                                value={editForm.notes}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                                                placeholder="Enter appointment notes..."
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-black"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-end gap-3">
                                        <Button onClick={handleCloseModals} variant="outline" className="px-6 py-2">
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSaveEdit}
                                            className="flex items-center gap-2 bg-black px-6 py-2 text-white hover:bg-gray-800"
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
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
                        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
                            <Card className="border-0">
                                <CardHeader className="border-b border-gray-200 bg-white">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                            <Eye className="h-5 w-5 text-black" />
                                            Appointment Details
                                        </CardTitle>
                                        <Button variant="outline" size="sm" onClick={handleCloseModals} className="text-gray-500 hover:text-gray-700">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        {/* Patient Information */}
                                        <div>
                                            <h3 className="mb-4 text-lg font-semibold text-black">Patient Information</h3>
                                            <div className="rounded-lg bg-gray-50 p-4">
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                            <h3 className="mb-4 text-lg font-semibold text-black">Appointment Details</h3>
                                            <div className="rounded-lg bg-gray-50 p-4">
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div>
                                                        <div className="text-sm text-gray-600">Doctor</div>
                                                        <div className="font-medium text-black">{selectedAppointment.specialist_name || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Date</div>
                                                        <div className="font-medium text-black">
                                                            {selectedAppointment.appointment_date
                                                                ? new Date(selectedAppointment.appointment_date).toLocaleDateString()
                                                                : 'N/A'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Time</div>
                                                        <div className="font-medium text-black">
                                                            {selectedAppointment.appointment_time
                                                                ? selectedAppointment.appointment_time.includes('T')
                                                                    ? selectedAppointment.appointment_time.split('T')[1]?.substring(0, 5)
                                                                    : selectedAppointment.appointment_time.substring(0, 5)
                                                                : 'N/A'}
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
                                                                <span className="font-medium text-black">Yes</span>
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
                                                <h3 className="mb-4 text-lg font-semibold text-black">Notes</h3>
                                                <div className="rounded-lg bg-gray-50 p-4">
                                                    <div className="text-gray-700">{selectedAppointment.notes}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-6 flex justify-end gap-3">
                                        <Button onClick={handleCloseModals} variant="outline" className="px-6 py-2">
                                            Close
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                handleCloseModals();
                                                handleEditAppointment(selectedAppointment);
                                            }}
                                            className="flex items-center gap-2 bg-black px-6 py-2 text-white hover:bg-gray-800"
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

                {/* New Appointment Modal */}
                {showNewAppointmentModal && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
                        <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-2xl">
                            <Card className="border-0">
                                <CardHeader className="border-b border-gray-200 bg-white">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                            <Plus className="h-5 w-5 text-black" />
                                            Create New Appointment
                                        </CardTitle>
                                        <Button variant="outline" size="sm" onClick={handleCloseModals} className="text-gray-500 hover:text-gray-700">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        {/* Patient Information Section */}
                                        <div>
                                            <h3 className="mb-4 text-lg font-semibold text-black">Patient Information</h3>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-black">Patient Name *</label>
                                                    <Input
                                                        value={newAppointmentForm.patientName}
                                                        onChange={(e) => setNewAppointmentForm((prev) => ({ ...prev, patientName: e.target.value }))}
                                                        placeholder="Enter patient full name"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-black">Patient ID</label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={newAppointmentForm.patientId}
                                                            onChange={(e) =>
                                                                setNewAppointmentForm((prev) => ({ ...prev, patientId: e.target.value }))
                                                            }
                                                            placeholder="P001, P002, P003..."
                                                            className="flex-1 uppercase"
                                                        />
                                                        <Button
                                                            type="button"
                                                            onClick={() =>
                                                                setNewAppointmentForm((prev) => ({ ...prev, patientId: nextPatientId || 'P001' }))
                                                            }
                                                            variant="outline"
                                                            className="px-3 py-2 text-xs"
                                                        >
                                                            Use Next
                                                        </Button>
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Format: P001, P002, P003, etc. Next available: {nextPatientId || 'P001'}
                                                        <br />
                                                        <span className="text-blue-600">
                                                            💡 Smart: If P001 is deleted, system will suggest P001 again
                                                        </span>
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-black">Contact Number *</label>
                                                    <Input
                                                        value={newAppointmentForm.contactNumber}
                                                        onChange={(e) =>
                                                            setNewAppointmentForm((prev) => ({ ...prev, contactNumber: e.target.value }))
                                                        }
                                                        placeholder="Enter contact number"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Appointment Details Section */}
                                        <div>
                                            <h3 className="mb-4 text-lg font-semibold text-black">Appointment Details</h3>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-black">Appointment Type *</label>
                                                    <select
                                                        value={newAppointmentForm.appointmentType}
                                                        onChange={(e) => {
                                                            const selectedType = appointmentTypes.find((t) => t.id === e.target.value);
                                                            const price = calculatePrice(e.target.value);
                                                            setNewAppointmentForm((prev) => ({
                                                                ...prev,
                                                                appointmentType: e.target.value,
                                                                specialistType: selectedType?.requiresDoctor ? 'doctor' : 'medtech',
                                                                specialist: '',
                                                                price: price,
                                                            }));
                                                        }}
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-black"
                                                        required
                                                    >
                                                        <option value="">Select appointment type...</option>
                                                        {appointmentTypes.map((type) => (
                                                            <option key={type.id} value={type.id}>
                                                                {type.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-black">
                                                        {newAppointmentForm.specialistType === 'doctor'
                                                            ? 'Doctor *'
                                                            : newAppointmentForm.specialistType === 'medtech'
                                                              ? 'Med Tech Specialist *'
                                                              : 'Specialist *'}
                                                    </label>
                                                    <select
                                                        value={newAppointmentForm.specialist}
                                                        onChange={(e) => setNewAppointmentForm((prev) => ({ ...prev, specialist: e.target.value }))}
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-black"
                                                        required
                                                        disabled={!newAppointmentForm.appointmentType}
                                                    >
                                                        <option value="">Select specialist...</option>
                                                        {newAppointmentForm.specialistType === 'doctor' &&
                                                            doctors.map((doctor) => (
                                                                <option key={doctor.id} value={doctor.id}>
                                                                    {doctor.name} - {doctor.specialization}
                                                                </option>
                                                            ))}
                                                        {newAppointmentForm.specialistType === 'medtech' &&
                                                            medTechs.map((medtech) => (
                                                                <option key={medtech.id} value={medtech.id}>
                                                                    {medtech.name} - {medtech.specialization}
                                                                </option>
                                                            ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-black">Price</label>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            value={newAppointmentForm.price || ''}
                                                            readOnly
                                                            className="bg-gray-100 font-semibold text-gray-700"
                                                            placeholder="Auto-calculated"
                                                        />
                                                        <span className="text-sm text-gray-500">₱</span>
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Price is automatically calculated based on appointment type
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-black">Date *</label>
                                                    <Input
                                                        type="date"
                                                        value={newAppointmentForm.date}
                                                        onChange={(e) => setNewAppointmentForm((prev) => ({ ...prev, date: e.target.value }))}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-black">Time *</label>
                                                    <Input
                                                        type="time"
                                                        value={newAppointmentForm.time}
                                                        onChange={(e) => setNewAppointmentForm((prev) => ({ ...prev, time: e.target.value }))}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-black">Duration</label>
                                                    <select
                                                        value={newAppointmentForm.duration}
                                                        onChange={(e) => setNewAppointmentForm((prev) => ({ ...prev, duration: e.target.value }))}
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-black"
                                                    >
                                                        <option value="30 min">30 minutes</option>
                                                        <option value="45 min">45 minutes</option>
                                                        <option value="60 min">60 minutes</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-black">Status</label>
                                                    <select
                                                        value={newAppointmentForm.status}
                                                        onChange={(e) => setNewAppointmentForm((prev) => ({ ...prev, status: e.target.value }))}
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-black"
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Confirmed">Confirmed</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Information Section */}
                                        <div>
                                            <h3 className="mb-4 text-lg font-semibold text-black">Additional Information</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-black">Notes</label>
                                                    <textarea
                                                        value={newAppointmentForm.notes}
                                                        onChange={(e) => setNewAppointmentForm((prev) => ({ ...prev, notes: e.target.value }))}
                                                        placeholder="Enter any additional notes or special requirements..."
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-black"
                                                        rows={3}
                                                    />
                                                </div>
                                                <div className="rounded-lg bg-gray-50 p-4">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <Bell className="h-4 w-4 text-black" />
                                                        <span className="text-sm font-medium text-black">Automatic Notifications</span>
                                                    </div>
                                                    <p className="text-sm text-black">
                                                        The patient will automatically receive a confirmation email and SMS notification once the
                                                        appointment is created.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Form Validation Summary */}
                                        <div className="rounded-lg bg-gray-50 p-4">
                                            <h4 className="mb-2 font-medium text-black">Appointment Summary</h4>
                                            <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Patient:</span>
                                                    <span className="font-medium text-black">
                                                        {newAppointmentForm.patientName || 'Not specified'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Specialist:</span>
                                                    <span className="font-medium text-black">
                                                        {newAppointmentForm.specialistType === 'doctor'
                                                            ? doctors.find((d) => d.id === newAppointmentForm.specialist)?.name || 'Not specified'
                                                            : newAppointmentForm.specialistType === 'medtech'
                                                              ? medTechs.find((m) => m.id === newAppointmentForm.specialist)?.name || 'Not specified'
                                                              : 'Not specified'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Date:</span>
                                                    <span className="font-medium text-black">{newAppointmentForm.date || 'Not specified'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Time:</span>
                                                    <span className="font-medium text-black">{newAppointmentForm.time || 'Not specified'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Type:</span>
                                                    <span className="font-medium text-black">
                                                        {appointmentTypes.find((t) => t.id === newAppointmentForm.appointmentType)?.name ||
                                                            'Not specified'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Status:</span>
                                                    <span className="font-medium text-black">{newAppointmentForm.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <Button onClick={handleCloseModals} variant="outline" className="px-6 py-2">
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSaveNewAppointment}
                                            disabled={
                                                !newAppointmentForm.patientName ||
                                                !newAppointmentForm.specialist ||
                                                !newAppointmentForm.date ||
                                                !newAppointmentForm.time ||
                                                !newAppointmentForm.appointmentType
                                            }
                                            className="flex items-center gap-2 bg-black px-6 py-2 text-white hover:bg-gray-800"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Create Appointment
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

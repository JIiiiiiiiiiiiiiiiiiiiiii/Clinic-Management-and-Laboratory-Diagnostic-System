import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, Filter, Plus, Search, Stethoscope, Edit, Eye, UserCheck, Bell, CalendarDays, Users, X, Save, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import RealtimeNotificationBell from '@/components/RealtimeNotificationBell';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Appointments', href: '/admin/appointments' },
];

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
    
    // Update local state when props change
    useEffect(() => {
        console.log('Appointments data received:', appointments);
        setAppointmentsList(appointments.data);
    }, [appointments.data]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [doctorFilter, setDoctorFilter] = useState('all');
    const [showOnlineSchedule, setShowOnlineSchedule] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
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
        contactNumber: ''
    });

    // Calculate price based on appointment type
    const calculatePrice = (appointmentType: string) => {
        const prices: { [key: string]: number } = {
            'consultation': 300,
            'checkup': 300,
            'fecalysis': 500,
            'cbc': 500,
            'urinalysis': 500,
            'x-ray': 700,
            'ultrasound': 800,
        };
        return prices[appointmentType] || 0;
    };

    const filteredAppointments = appointmentsList.filter(appointment => {
        const matchesSearch = (appointment.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (appointment.specialist_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (appointment.patient_id || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || (appointment.status || '').toLowerCase() === statusFilter.toLowerCase();
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


    const todayAppointments = appointmentsList.filter(apt => apt.appointment_date === new Date().toISOString().split('T')[0]);
    const totalAppointments = appointmentsList.length;
    const confirmedAppointments = appointmentsList.filter(apt => apt.status === 'Confirmed').length;
    const onlineBookings = appointmentsList.filter(apt => apt.appointment_source === 'online').length;
    const pendingAppointments = appointmentsList.filter(apt => apt.status === 'Pending').length;

    const handleEditAppointment = (appointment: any) => {
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

    const handleDeleteAppointment = (appointmentId: number) => {
        if (confirm('Are you sure you want to delete this appointment?')) {
            // Get appointment details before deletion
            const appointmentToDelete = appointmentsList.find(apt => apt.id === appointmentId);
            
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
                            read: false
                        };
                        setNotifications(prev => [deleteNotification, ...prev]);
                        setUnreadCount(prev => prev + 1);
                    }
                    
                    alert('Appointment deleted successfully!');
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
        // Redirect to the shared appointment booking page
        router.visit(route('admin.appointments.walk-in'));
    };


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
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                                    <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Appointments</h1>
                                <p className="text-sm text-black mt-1">Manage patient appointments and online scheduling</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Real-time Notification Bell */}
                            <RealtimeNotificationBell 
                                userRole="admin"
                                initialNotifications={notifications}
                                unreadCount={unreadCount}
                            />
                            
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Calendar className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-black">{totalAppointments}</div>
                                        <div className="text-black text-sm font-medium">Total Appointments</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="shadow-lg border-0 rounded-xl bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-100 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-black" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-black">{confirmedAppointments}</div>
                                    <div className="text-black text-sm font-medium">Confirmed</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="shadow-lg border-0 rounded-xl bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-100 rounded-lg">
                                    <Clock className="h-6 w-6 text-black" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-black">{pendingAppointments}</div>
                                    <div className="text-black text-sm font-medium">Pending</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="shadow-lg border-0 rounded-xl bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-100 rounded-lg">
                                    <CalendarDays className="h-6 w-6 text-black" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-black">{onlineBookings}</div>
                                    <div className="text-black text-sm font-medium">Online Bookings</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="shadow-lg border-0 rounded-xl bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-100 rounded-lg">
                                    <Users className="h-6 w-6 text-black" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-black">{doctors.length}</div>
                                    <div className="text-black text-sm font-medium">Available Doctors</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card className="shadow-lg border-0 rounded-xl bg-white mb-6">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
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
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
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
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                >
                                    <option value="all">All Doctors</option>
                                    {doctors.map(doctor => (
                                        <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button 
                                    onClick={handleNewAppointment}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                >
                                    <CalendarDays className="h-4 w-4" />
                                    Walk-in Appointment
                            </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>


                        {/* Appointments Table */}
                <Card className="shadow-lg border-0 rounded-xl bg-white">
                    <CardHeader className="bg-white border-b border-gray-200">
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
                                        <TableHead className="text-black font-semibold px-6 py-3">Patient</TableHead>
                                        <TableHead className="text-black font-semibold px-6 py-3">Doctor</TableHead>
                                        <TableHead className="text-black font-semibold px-6 py-3">Date & Time</TableHead>
                                        <TableHead className="text-black font-semibold px-6 py-3">Type</TableHead>
                                        <TableHead className="text-black font-semibold px-6 py-3">Source</TableHead>
                                        <TableHead className="text-black font-semibold px-6 py-3">Status</TableHead>
                                        <TableHead className="text-black font-semibold px-6 py-3">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                        {filteredAppointments.length === 0 ? (
                                            <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                {appointmentsList.length === 0 ? 'No appointments yet. Click "New Appointment" to create your first appointment.' : 'No appointments found matching your search criteria.'}
                                            </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredAppointments.map((appointment) => (
                                                <TableRow key={appointment.id} className="hover:bg-gray-50">
                                                    <TableCell className="px-6 py-4">
                                                        <div>
                                                            <div className="font-medium text-black">{appointment.patient_name}</div>
                                                            <div className="text-sm text-gray-500">{appointment.patient?.sequence_number || appointment.patient_id}</div>
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
                                                            <div className="font-medium text-black">{appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString() : 'N/A'}</div>
                                                            <div className="text-sm text-gray-500">{appointment.appointment_time ? appointment.appointment_time.substring(0, 5) : 'N/A'}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4">
                                                        <Badge className={getTypeBadge(appointment.appointment_type)}>
                                                            {appointment.appointment_type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4">
                                                        <Badge className={appointment.source === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                                                            {appointment.source}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4">
                                                        <Badge className={getStatusBadge(appointment.status)}>
                                                            {appointment.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {appointment.confirmationSent && (
                                                                <Bell className="h-4 w-4 text-black" />
                                                            )}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEditAppointment(appointment)}
                                                                className="text-black border-gray-300 hover:bg-gray-50 min-w-[75px] px-3"
                                                            >
                                                                <Edit className="h-4 w-4 mr-1" />
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleViewAppointment(appointment)}
                                                                className="text-black border-gray-300 hover:bg-gray-50 min-w-[75px] px-3"
                                                            >
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                View
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDeleteAppointment(appointment.id)}
                                                                className="text-black border-gray-300 hover:bg-gray-50 min-w-[75px] px-3"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-1" />
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
                                                        <div className="font-medium text-black">{selectedAppointment.appointment_date ? new Date(selectedAppointment.appointment_date).toLocaleDateString() : 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Time</div>
                                                        <div className="font-medium text-black">
                                                            {selectedAppointment.appointment_time ? 
                                                                (selectedAppointment.appointment_time.includes('T') ? 
                                                                    selectedAppointment.appointment_time.split('T')[1]?.substring(0, 5) :
                                                                    selectedAppointment.appointment_time.substring(0, 5)) : 'N/A'}
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

            </div>
        </AppLayout>
    );
}
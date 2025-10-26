import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    Calendar, 
    CheckCircle, 
    Clock, 
    Plus, 
    Search, 
    Stethoscope, 
    Edit, 
    Eye, 
    CalendarDays, 
    Bell, 
    UserCheck, 
    Settings,
    ChevronLeft,
    ChevronRight,
    Filter,
    CheckCircle2,
    XCircle,
    User,
    AlertCircle,
    X,
    Users,
    UserPlus
} from 'lucide-react';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Appointments', href: '/admin/appointments' },
    { title: 'Doctor Availability', href: '/admin/appointments/availability' },
];

// Interface for props
interface DoctorSchedule {
    id: number;
    doctor: string;
    specialization: string;
    status: string;
    availableSlots: number;
    bookedSlots: number;
    totalSlots: number;
    schedule: {
        [key: string]: { start: string; end: string };
    };
    appointments?: Appointment[];
}

interface Appointment {
    id: number;
    patient: string;
    type: string;
    status: 'completed' | 'canceled' | 'scheduled' | 'waiting';
    startTime: string;
    endTime: string;
    date: string;
    notes?: string;
}

interface DoctorAvailabilityProps {
    doctorSchedules: DoctorSchedule[];
    appointments: Appointment[];
    doctors: any[];
}

const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', 
    '15:00', '15:30', '16:00', '16:30', '17:00'
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

export default function DoctorAvailability({ 
    doctorSchedules = [], 
    appointments = [], 
    doctors = [] 
}: DoctorAvailabilityProps) {
    const { permissions } = useRoleAccess();
    const { props } = usePage();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(doctors.length > 0 ? doctors[0].id.toString() : '');
    const [selectedDay, setSelectedDay] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showSchedule, setShowSchedule] = useState(true);

    // Debug logging for appointments data
    useEffect(() => {
        console.log('🔍 All appointments data:', {
            totalAppointments: appointments.length,
            appointments: appointments.map(apt => ({
                id: apt?.id,
                patient: apt?.patient,
                date: apt?.date || apt?.appointment_date,
                startTime: apt?.startTime,
                appointment_time: apt?.appointment_time,
                time: apt?.time,
                specialist_id: apt?.specialist_id,
                specialist_name: apt?.specialist_name,
                rawData: apt // Show complete raw data structure
            }))
        });
        
        // Look specifically for Jehus Cabalejo appointment
        const jehusAppointment = appointments.find(apt => 
            apt?.patient?.toLowerCase().includes('jehus') || 
            apt?.patient?.toLowerCase().includes('cabalejo')
        );
        if (jehusAppointment) {
            console.log('👤 Jehus Cabalejo appointment found:', jehusAppointment);
        }
    }, [appointments]);

    const filteredSchedules = doctorSchedules.filter(schedule => {
        const matchesSearch = (schedule.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                            (schedule.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
        const matchesStatus = statusFilter === 'all' || (schedule.status?.toLowerCase() === statusFilter.toLowerCase() || false);
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-gray-100 text-black';
            case 'On Leave':
                return 'bg-gray-100 text-black';
            case 'Part-time':
                return 'bg-gray-100 text-black';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getAvailabilityColor = (slots: number, total: number) => {
        const percentage = (slots / total) * 100;
        if (percentage >= 80) return 'text-black';
        if (percentage >= 60) return 'text-black';
        return 'text-black';
    };

    const handleSaveSchedule = () => {
        // In a real app, this would save the schedule
        alert('Schedule updated successfully!');
        setShowScheduleForm(false);
        setSelectedDoctor('');
        setSelectedDay('');
        setStartTime('');
        setEndTime('');
    };

    const getAppointmentStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 border-green-200 text-green-800';
            case 'canceled':
                return 'bg-red-100 border-red-200 text-red-800';
            case 'scheduled':
                return 'bg-blue-100 border-blue-200 text-blue-800';
            case 'waiting':
                return 'bg-orange-100 border-orange-200 text-orange-800';
            default:
                return 'bg-gray-100 border-gray-200 text-gray-800';
        }
    };

    const getAppointmentStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="h-4 w-4" />;
            case 'canceled':
                return <XCircle className="h-4 w-4" />;
            case 'scheduled':
                return <Clock className="h-4 w-4" />;
            case 'waiting':
                return <User className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getAppointmentsForDay = (date: string) => {
        const filteredAppointments = appointments.filter(apt => {
            const appointmentDate = apt?.date || apt?.appointment_date;
            const specialistId = apt?.specialist_id;
            
            // Handle both string and number ID comparisons
            const idMatch = specialistId === selectedDoctor || 
                           specialistId === parseInt(selectedDoctor) || 
                           specialistId?.toString() === selectedDoctor;
            
            // Normalize date comparison
            const normalizedAppointmentDate = appointmentDate?.split('T')[0];
            const normalizedTargetDate = date;
            
            return normalizedAppointmentDate === normalizedTargetDate && idMatch;
        });
        
        return filteredAppointments;
    };

    const getAppointmentAtTime = (date: string, time: string) => {
        const dayAppointments = getAppointmentsForDay(date);
        
        const foundAppointment = dayAppointments.find(apt => {
            const appointmentTime = apt?.startTime || apt?.appointment_time || apt?.time;
            if (typeof appointmentTime === 'string') {
                // Handle multiple time formats
                let timeStr = '';
                if (appointmentTime.includes('T')) {
                    // ISO datetime format
                    timeStr = appointmentTime.split('T')[1]?.substring(0, 5);
                } else if (appointmentTime.includes(':')) {
                    // Time format (HH:MM or HH:MM:SS)
                    timeStr = appointmentTime.substring(0, 5);
                } else {
                    // Try parsing as timestamp
                    const parsed = new Date(appointmentTime);
                    if (!isNaN(parsed.getTime())) {
                        timeStr = parsed.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                    }
                }
                
                return timeStr === time;
            }
            return false;
        });
        
        return foundAppointment;
    };

    const getDoctorScheduleForDay = (date: string) => {
        if (!selectedDoctor) return null;
        const selectedDoctorData = doctorSchedules.find(doc => doc.id.toString() === selectedDoctor);
        if (!selectedDoctorData) return null;
        
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        return selectedDoctorData.schedule?.[dayOfWeek];
    };

    const getDoctorScheduleTimes = (date: string) => {
        if (!selectedDoctor) return [];
        const selectedDoctorData = doctorSchedules.find(doc => doc.id.toString() === selectedDoctor);
        if (!selectedDoctorData) return [];
        
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        const schedule = selectedDoctorData.schedule?.[dayOfWeek];
        
        if (!schedule || schedule.start === 'Not Available') return [];
        
        // Convert schedule times to 24-hour format for comparison
        const startTime = convertToMinutes(schedule.start);
        const endTime = convertToMinutes(schedule.end);
        
        // Generate time slots within the doctor's schedule
        const availableTimes = [];
        for (let time of timeSlots) {
            const timeMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
            if (timeMinutes >= startTime && timeMinutes < endTime) {
                availableTimes.push(time);
            }
        }
        
        return availableTimes;
    };

    const isTimeInSchedule = (time: string, schedule: any) => {
        if (!schedule || schedule.start === 'Not Available') return false;
        
        const time24 = time;
        const scheduleStart = schedule.start.includes('AM') || schedule.start.includes('PM') 
            ? schedule.start 
            : schedule.start + ' AM';
        const scheduleEnd = schedule.end.includes('AM') || schedule.end.includes('PM') 
            ? schedule.end 
            : schedule.end + ' PM';
        
        // Convert to 24-hour format for comparison
        const timeMinutes = parseInt(time24.split(':')[0]) * 60 + parseInt(time24.split(':')[1]);
        const startMinutes = convertToMinutes(scheduleStart);
        const endMinutes = convertToMinutes(scheduleEnd);
        
        return timeMinutes >= startMinutes && timeMinutes < endMinutes;
    };

    const convertToMinutes = (timeStr: string) => {
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let totalMinutes = hours * 60 + minutes;
        
        if (period === 'PM' && hours !== 12) {
            totalMinutes += 12 * 60;
        } else if (period === 'AM' && hours === 12) {
            totalMinutes -= 12 * 60;
        }
        
        return totalMinutes;
    };

    const getConsecutiveAvailableSlots = (date: string) => {
        if (!showSchedule) return [];
        
        const doctorSchedule = getDoctorScheduleForDay(date);
        if (!doctorSchedule || doctorSchedule.start === 'Not Available') return [];
        
        const availableSlots = [];
        const bookedSlots = getAppointmentsForDay(date);
        
        // Get all time slots within doctor's schedule
        const scheduleStart = convertToMinutes(doctorSchedule.start);
        const scheduleEnd = convertToMinutes(doctorSchedule.end);
        
        for (let time of timeSlots) {
            const timeMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
            
            if (timeMinutes >= scheduleStart && timeMinutes < scheduleEnd) {
                const isBooked = bookedSlots.some(apt => {
                    const appointmentTime = apt?.startTime || apt?.appointment_time || apt?.time;
                    if (typeof appointmentTime === 'string') {
                        // Handle multiple time formats
                        let timeStr = '';
                        if (appointmentTime.includes('T')) {
                            // ISO datetime format
                            timeStr = appointmentTime.split('T')[1]?.substring(0, 5);
                        } else if (appointmentTime.includes(':')) {
                            // Time format (HH:MM or HH:MM:SS)
                            timeStr = appointmentTime.substring(0, 5);
                        } else {
                            // Try parsing as timestamp
                            const parsed = new Date(appointmentTime);
                            if (!isNaN(parsed.getTime())) {
                                timeStr = parsed.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                            }
                        }
                        return timeStr === time;
                    }
                    return false;
                });
                
                if (!isBooked) {
                    availableSlots.push(time);
                }
            }
        }
        
        // Group consecutive slots
        const consecutiveGroups = [];
        let currentGroup = [];
        
        for (let i = 0; i < availableSlots.length; i++) {
            const currentTime = availableSlots[i];
            const nextTime = availableSlots[i + 1];
            
            currentGroup.push(currentTime);
            
            if (!nextTime || !isConsecutiveTime(currentTime, nextTime)) {
                consecutiveGroups.push([...currentGroup]);
                currentGroup = [];
            }
        }
        
        return consecutiveGroups;
    };

    const isConsecutiveTime = (time1: string, time2: string) => {
        const [h1, m1] = time1.split(':').map(Number);
        const [h2, m2] = time2.split(':').map(Number);
        const minutes1 = h1 * 60 + m1;
        const minutes2 = h2 * 60 + m2;
        return minutes2 - minutes1 === 30; // 30-minute intervals
    };

    const handleEditAppointment = (appointment: any) => {
        // In real app, this would open edit modal
        console.log('Edit appointment:', appointment);
    };

    const handleDeleteAppointment = (appointmentId: number) => {
        if (confirm('Are you sure you want to delete this appointment?')) {
            // In real app, this would make an API call
            router.delete(route('admin.appointments.destroy', appointmentId));
        }
    };

    const handleAddAppointment = (date: string, time: string) => {
        // In real app, this would open add appointment form
        router.visit(route('admin.appointments.walk-in', { date, time }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Doctor Availability" />
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-white border border-gray-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Doctors</p>
                                    <p className="text-3xl font-bold text-gray-900">{doctors.length}</p>
                                    <p className="text-sm text-gray-500">Active doctors</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-white border border-gray-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Available Today</p>
                                    <p className="text-3xl font-bold text-gray-900">{doctorSchedules.filter(s => s.status === 'Active').length}</p>
                                    <p className="text-sm text-gray-500">Doctors on duty</p>
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
                                    <p className="text-sm font-medium text-gray-600">On Leave</p>
                                    <p className="text-3xl font-bold text-gray-900">{doctorSchedules.filter(s => s.status === 'On Leave').length}</p>
                                    <p className="text-sm text-gray-500">Currently unavailable</p>
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
                                    <p className="text-sm font-medium text-gray-600">Part-time</p>
                                    <p className="text-3xl font-bold text-gray-900">{doctorSchedules.filter(s => s.status === 'Part-time').length}</p>
                                    <p className="text-sm text-gray-500">Limited schedule</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <UserPlus className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Schedule Management Form */}
                {showScheduleForm && (
                    <Card className="shadow-lg border-0 rounded-xl bg-white mb-8">
                        <CardHeader className="bg-white border-b border-gray-200">
                            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                <Settings className="h-5 w-5 text-black" />
                                Update Doctor Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Select Doctor</label>
                                    <select 
                                        value={selectedDoctor}
                                        onChange={(e) => setSelectedDoctor(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                    >
                                        <option value="">Choose a doctor...</option>
                                        {doctorSchedules.map(doctor => (
                                            <option key={doctor.id} value={doctor.id}>{doctor.name} - {doctor.specialization}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Select Day</label>
                                    <select 
                                        value={selectedDay}
                                        onChange={(e) => setSelectedDay(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                    >
                                        <option value="">Choose a day...</option>
                                        <option value="monday">Monday</option>
                                        <option value="tuesday">Tuesday</option>
                                        <option value="wednesday">Wednesday</option>
                                        <option value="thursday">Thursday</option>
                                        <option value="friday">Friday</option>
                                        <option value="saturday">Saturday</option>
                                        <option value="sunday">Sunday</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Start Time</label>
                                    <select 
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                    >
                                        <option value="">Select start time...</option>
                                        {timeSlots.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">End Time</label>
                                    <select 
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                    >
                                        <option value="">Select end time...</option>
                                        {timeSlots.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button 
                                    onClick={() => setShowScheduleForm(false)}
                                    variant="outline"
                                    className="px-6 py-2"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleSaveSchedule}
                                    disabled={!selectedDoctor || !selectedDay || !startTime || !endTime}
                                    className="bg-black hover:bg-gray-800 text-white px-6 py-2"
                                >
                                    Update Schedule
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Controls Section - Always Visible */}
                <Card className="shadow-lg border-0 rounded-xl bg-white mb-6">
                    <CardHeader className="bg-white border-b border-gray-200">
                        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                            <Calendar className="h-5 w-5 text-black" />
                            Doctor Schedules ({filteredSchedules.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {/* Controls */}
                        <div className="flex flex-wrap items-center gap-4 py-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <Input
                                    placeholder="Search doctors..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="max-w-sm"
                                />
                                
                                <Button
                                    onClick={() => setShowScheduleForm(!showScheduleForm)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Settings className="h-4 w-4 mr-2" />
                                    Manage Schedules
                                </Button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                >
                                    List
                                </Button>
                                <Button
                                    variant={viewMode === 'calendar' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('calendar')}
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
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="on leave">On Leave</SelectItem>
                                            <SelectItem value="part-time">Part-time</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}

                                {/* Doctor Selection - Only show in Calendar view */}
                                {viewMode === 'calendar' && (
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-700">Doctor:</span>
                                            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                                                <SelectTrigger className="w-64">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {doctors.map(doctor => (
                                                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                                            {doctor.name} - {doctor.specialization}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant={showSchedule ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setShowSchedule(!showSchedule)}
                                                className="flex items-center gap-2"
                                            >
                                                <Calendar className="h-4 w-4" />
                                                {showSchedule ? 'Hide' : 'Show'} Schedule
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Doctor Schedules Table - List View */}
                {viewMode === 'list' && (
                    <Card className="shadow-lg border-0 rounded-xl bg-white">
                        <CardContent className="p-6">
                            {/* Table */}
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="text-black font-semibold">Doctor</TableHead>
                                            <TableHead className="text-black font-semibold">Monday</TableHead>
                                            <TableHead className="text-black font-semibold">Tuesday</TableHead>
                                            <TableHead className="text-black font-semibold">Wednesday</TableHead>
                                            <TableHead className="text-black font-semibold">Thursday</TableHead>
                                            <TableHead className="text-black font-semibold">Friday</TableHead>
                                            <TableHead className="text-black font-semibold">Saturday</TableHead>
                                            <TableHead className="text-black font-semibold">Sunday</TableHead>
                                            <TableHead className="text-black font-semibold">Status</TableHead>
                                            <TableHead className="text-black font-semibold">Availability</TableHead>
                                            <TableHead className="text-black font-semibold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSchedules.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                                                    No schedules found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredSchedules.map((schedule) => (
                                                <TableRow key={schedule.id} className="hover:bg-gray-50">
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium text-black">{schedule.name}</div>
                                                            <div className="text-sm text-gray-500">{schedule.specialization}</div>
                                                            <div className="text-sm text-gray-500">Employee ID: {schedule.employee_id}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm text-gray-600">
                                                            {schedule.schedule?.Monday ? `${schedule.schedule.Monday.start} - ${schedule.schedule.Monday.end}` : 'Not Available'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm text-gray-600">
                                                            {schedule.schedule?.Tuesday ? `${schedule.schedule.Tuesday.start} - ${schedule.schedule.Tuesday.end}` : 'Not Available'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm text-gray-600">
                                                            {schedule.schedule?.Wednesday ? `${schedule.schedule.Wednesday.start} - ${schedule.schedule.Wednesday.end}` : 'Not Available'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm text-gray-600">
                                                            {schedule.schedule?.Thursday ? `${schedule.schedule.Thursday.start} - ${schedule.schedule.Thursday.end}` : 'Not Available'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm text-gray-600">
                                                            {schedule.schedule?.Friday ? `${schedule.schedule.Friday.start} - ${schedule.schedule.Friday.end}` : 'Not Available'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm text-gray-600">
                                                            {schedule.schedule?.Saturday ? `${schedule.schedule.Saturday.start} - ${schedule.schedule.Saturday.end}` : 'Not Available'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm text-gray-600">
                                                            {schedule.schedule?.Sunday ? `${schedule.schedule.Sunday.start} - ${schedule.schedule.Sunday.end}` : 'Not Available'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusBadge(schedule.status)}>
                                                            {schedule.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            <div className={`font-medium ${getAvailabilityColor(schedule.bookedSlots, schedule.totalSlots)}`}>
                                                                {schedule.availableSlots}/{schedule.totalSlots} slots
                                                            </div>
                                                            <div className="text-gray-500">
                                                                {Math.round((schedule.bookedSlots / schedule.totalSlots) * 100)}% booked
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-black border-gray-300 hover:bg-gray-50"
                                                            >
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-black border-gray-300 hover:bg-gray-50"
                                                            >
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View
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
                )}


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
                                                        const consecutiveSlots = getConsecutiveAvailableSlots(day.fullDate);
                                                        const isInConsecutiveSlot = consecutiveSlots.some(group => group.includes(time));
                                                        const currentTime = new Date().toLocaleTimeString('en-US', { 
                                                            hour12: false, 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                        });
                                                        const isCurrentTime = time === currentTime.split(':').slice(0, 2).join(':');
                                                        
                                                        return (
                                                            <div 
                                                                key={`${day.fullDate}-${time}`}
                                                                className={`relative p-2 border-r border-gray-200 min-h-[60px] hover:bg-gray-50 cursor-pointer ${
                                                                    appointment ? 'bg-blue-50 border-blue-200' : 
                                                                    isInConsecutiveSlot ? 'bg-green-50' : ''
                                                                }`}
                                                                onClick={() => !appointment && showSchedule && isInConsecutiveSlot && handleAddAppointment(day.fullDate, time)}
                                                            >
                                                                {appointment ? (
                                                                    <div className="h-full flex items-center justify-center">
                                                                        <div className="text-center w-full">
                                                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                                <span className="text-sm font-medium text-blue-700">Booked</span>
                                                                            </div>
                                                                            <div className="text-xs text-blue-600 truncate font-medium">{appointment.patient_name || appointment.patient}</div>
                                                                            <div className="text-xs text-gray-500">{appointment.appointment_type || 'Appointment'}</div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                                                                        {showSchedule && isInConsecutiveSlot ? (
                                                                            <div className="text-center w-full">
                                                                                <div className="flex items-center justify-center gap-1">
                                                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                                                    <span className="text-green-600 font-medium text-sm">Available</span>
                                                                                </div>
                                                                            </div>
                                                                        ) : null}
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

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, Plus, Search, Stethoscope, Edit, Eye, CalendarDays, Bell, UserCheck, Settings } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Appointments', href: '/admin/appointments' },
    { title: 'Doctor Availability', href: '/admin/appointments/availability' },
];

// Mock data - in real app this would come from props
const doctorSchedules = [
    {
        id: 1,
        doctor: 'Dr. Smith',
        specialization: 'Cardiology',
        monday: '9:00 AM - 5:00 PM',
        tuesday: '9:00 AM - 5:00 PM',
        wednesday: '9:00 AM - 5:00 PM',
        thursday: '9:00 AM - 5:00 PM',
        friday: '9:00 AM - 5:00 PM',
        saturday: 'Closed',
        sunday: 'Closed',
        status: 'Active',
        nextAvailable: '2025-01-15 10:00 AM',
        totalSlots: 16,
        bookedSlots: 12,
        availableSlots: 4,
    },
    {
        id: 2,
        doctor: 'Dr. Johnson',
        specialization: 'Internal Medicine',
        monday: '8:00 AM - 4:00 PM',
        tuesday: '8:00 AM - 4:00 PM',
        wednesday: '8:00 AM - 4:00 PM',
        thursday: '8:00 AM - 4:00 PM',
        friday: '8:00 AM - 4:00 PM',
        saturday: '9:00 AM - 1:00 PM',
        sunday: 'Closed',
        status: 'Active',
        nextAvailable: '2025-01-15 2:00 PM',
        totalSlots: 20,
        bookedSlots: 15,
        availableSlots: 5,
    },
    {
        id: 3,
        doctor: 'Dr. Davis',
        specialization: 'Emergency Medicine',
        monday: '24/7',
        tuesday: '24/7',
        wednesday: '24/7',
        thursday: '24/7',
        friday: '24/7',
        saturday: '24/7',
        sunday: '24/7',
        status: 'Active',
        nextAvailable: '2025-01-15 2:00 PM',
        totalSlots: 48,
        bookedSlots: 20,
        availableSlots: 28,
    },
    {
        id: 4,
        doctor: 'Dr. Wilson',
        specialization: 'Surgery',
        monday: '10:00 AM - 6:00 PM',
        tuesday: '10:00 AM - 6:00 PM',
        wednesday: '10:00 AM - 6:00 PM',
        thursday: '10:00 AM - 6:00 PM',
        friday: '10:00 AM - 6:00 PM',
        saturday: 'Closed',
        sunday: 'Closed',
        status: 'On Leave',
        nextAvailable: '2025-01-20 11:00 AM',
        totalSlots: 16,
        bookedSlots: 8,
        availableSlots: 8,
    },
    {
        id: 5,
        doctor: 'Dr. Brown',
        specialization: 'General Practice',
        monday: '9:00 AM - 5:00 PM',
        tuesday: '9:00 AM - 5:00 PM',
        wednesday: '9:00 AM - 5:00 PM',
        thursday: '9:00 AM - 5:00 PM',
        friday: '9:00 AM - 5:00 PM',
        saturday: '9:00 AM - 2:00 PM',
        sunday: 'Closed',
        status: 'Active',
        nextAvailable: '2025-01-16 3:00 PM',
        totalSlots: 18,
        bookedSlots: 14,
        availableSlots: 4,
    },
];

const timeSlots = [
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
    '5:00 PM', '5:30 PM', '6:00 PM'
];

export default function DoctorAvailability() {
    const { permissions } = useRoleAccess();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedDay, setSelectedDay] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const filteredSchedules = doctorSchedules.filter(schedule => {
        const matchesSearch = schedule.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            schedule.specialization.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || schedule.status.toLowerCase() === statusFilter.toLowerCase();
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Doctor Availability" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Doctor Availability</h1>
                                <p className="text-sm text-black mt-1">Manage doctor schedules and availability for online booking</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <UserCheck className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-black">{doctorSchedules.length}</div>
                                        <div className="text-black text-sm font-medium">Active Doctors</div>
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
                                    <div className="text-2xl font-bold text-black">
                                        {doctorSchedules.filter(s => s.status === 'Active').length}
                                    </div>
                                    <div className="text-black text-sm font-medium">Active Doctors</div>
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
                                    <div className="text-2xl font-bold text-black">
                                        {doctorSchedules.reduce((sum, s) => sum + s.availableSlots, 0)}
                                    </div>
                                    <div className="text-black text-sm font-medium">Available Slots</div>
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
                                    <div className="text-2xl font-bold text-black">
                                        {doctorSchedules.reduce((sum, s) => sum + s.bookedSlots, 0)}
                                    </div>
                                    <div className="text-black text-sm font-medium">Booked Appointments</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="shadow-lg border-0 rounded-xl bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-100 rounded-lg">
                                    <Time className="h-6 w-6 text-black" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-black">
                                        {Math.round(doctorSchedules.reduce((sum, s) => sum + (s.bookedSlots / s.totalSlots), 0) / doctorSchedules.length * 100)}%
                                    </div>
                                    <div className="text-black text-sm font-medium">Average Utilization</div>
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
                                            <option key={doctor.id} value={doctor.id}>{doctor.doctor} - {doctor.specialization}</option>
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

                {/* Search and Filters */}
                <Card className="shadow-lg border-0 rounded-xl bg-white mb-6">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search doctors..."
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
                                    <option value="active">Active</option>
                                    <option value="on leave">On Leave</option>
                                    <option value="part-time">Part-time</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button 
                                    onClick={() => setShowScheduleForm(!showScheduleForm)}
                                    className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                >
                                    <Settings className="h-4 w-4" />
                                    {showScheduleForm ? 'Hide' : 'Manage'} Schedules
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Doctor Schedules Table */}
                <Card className="shadow-lg border-0 rounded-xl bg-white">
                    <CardHeader className="bg-white border-b border-gray-200">
                        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                            <Calendar className="h-5 w-5 text-black" />
                            Doctor Schedules ({filteredSchedules.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
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
                                                        <div className="font-medium text-black">{schedule.doctor}</div>
                                                        <div className="text-sm text-gray-500">{schedule.specialization}</div>
                                                        <div className="text-sm text-gray-500">Next: {schedule.nextAvailable}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-600">{schedule.monday}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-600">{schedule.tuesday}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-600">{schedule.wednesday}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-600">{schedule.thursday}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-600">{schedule.friday}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-600">{schedule.saturday}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-600">{schedule.sunday}</div>
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
            </div>
        </AppLayout>
    );
}

import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin, Phone, Star, Heart, Shield, Users, Stethoscope, Award, Bell, CheckCircle, TrendingUp, Activity, Plus, CalendarDays, ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

interface SimpleDashboardProps {
    user: {
        id: number;
        name: string;
        email: string;
    };
    patient: {
        id: number;
        patient_no: string;
        first_name: string;
        last_name: string;
        mobile_no?: string;
    };
    stats: {
        total_appointments: number;
        upcoming_appointments: number;
        completed_appointments: number;
        total_visits: number;
        pending_lab_results: number;
    };
    recent_appointments: any[];
    recent_lab_orders: any[];
    recent_visits: any[];
    notifications: any[];
    unreadCount: number;
}

export default function SimpleDashboard({ 
    user, 
    patient, 
    stats, 
    recent_appointments, 
    recent_lab_orders, 
    recent_visits, 
    notifications, 
    unreadCount 
}: SimpleDashboardProps) {
    // Appointment form state
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('');
    const [specialistType, setSpecialistType] = useState<'doctor' | 'medtech'>('doctor');
    const [availableTimes, setAvailableTimes] = useState<Array<{value: string, label: string}>>([]);
    
    // Booking form state
    const [bookingStep, setBookingStep] = useState(1);
    const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [appointmentType, setAppointmentType] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        patient_name: patient ? `${patient.first_name} ${patient.last_name}` : '',
        patient_id: patient ? patient.patient_no : 'P001',
        contact_number: patient ? (patient.mobile_no || '') : '',
        appointment_type: '',
        specialist_type: 'doctor',
        specialist_id: '',
        appointment_date: '',
        appointment_time: '',
        notes: '',
        special_requirements: '',
    });

    // Sample data for the form
    const doctors = [
        { id: 1, name: 'Dr. Smith', specialization: 'Cardiology', employee_id: 'D001' },
        { id: 2, name: 'Dr. Johnson', specialization: 'Internal Medicine', employee_id: 'D002' },
        { id: 3, name: 'Dr. Davis', specialization: 'Emergency Medicine', employee_id: 'D003' },
        { id: 4, name: 'Dr. Wilson', specialization: 'Surgery', employee_id: 'D004' },
        { id: 5, name: 'Dr. Brown', specialization: 'General Practice', employee_id: 'D005' },
    ];

    const medtechs = [
        { id: 6, name: 'MedTech Rodriguez', specialization: 'Laboratory', employee_id: 'M001' },
        { id: 7, name: 'MedTech Garcia', specialization: 'Radiology', employee_id: 'M002' },
    ];

    // Available doctors for booking
    const availableDoctors = [
        { id: 1, name: 'Dr. Smith', specialization: 'Cardiology', rating: 4.9, experience: '10 years', availability: 'Mon-Fri', nextAvailable: 'Tomorrow 9:00 AM' },
        { id: 2, name: 'Dr. Johnson', specialization: 'Internal Medicine', rating: 4.8, experience: '8 years', availability: 'Mon-Sat', nextAvailable: 'Today 2:00 PM' },
        { id: 3, name: 'Dr. Davis', specialization: 'Emergency Medicine', rating: 4.9, experience: '12 years', availability: '24/7', nextAvailable: 'Today 1:00 PM' },
        { id: 4, name: 'Dr. Wilson', specialization: 'Surgery', rating: 4.7, experience: '15 years', availability: 'Mon-Fri', nextAvailable: 'Monday 10:00 AM' },
        { id: 5, name: 'Dr. Brown', specialization: 'General Practice', rating: 4.8, experience: '6 years', availability: 'Mon-Sat', nextAvailable: 'Today 3:00 PM' },
    ];

    // Available time slots
    const availableTimeSlots = [
        '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
        '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
    ];

    const appointmentTypes = {
        'consultation': 'Consultation',
        'checkup': 'Checkup',
        'fecalysis': 'Fecalysis',
        'cbc': 'Complete Blood Count (CBC)',
        'urinalysis': 'Urinalysis',
        'x-ray': 'X-Ray',
        'ultrasound': 'Ultrasound',
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would submit to the backend
        alert('Appointment created successfully! You will receive a confirmation email and SMS notification.');
        setShowBookingForm(false);
        // Reset form
        setData({
            patient_name: patient ? `${patient.first_name} ${patient.last_name}` : '',
            patient_id: patient ? patient.patient_no : 'P001',
            contact_number: patient ? (patient.mobile_no || '') : '',
            appointment_type: '',
            specialist_type: 'doctor',
            specialist_id: '',
            appointment_date: '',
            appointment_time: '',
            notes: '',
            special_requirements: '',
        });
        setSelectedType('');
        setSpecialistType('doctor');
    };

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        setData('appointment_type', type);
        
        // Determine specialist type based on appointment type
        const requiresDoctor = ['consultation', 'checkup', 'x-ray', 'ultrasound'].includes(type);
        const newSpecialistType = requiresDoctor ? 'doctor' : 'medtech';
        setSpecialistType(newSpecialistType);
        setData('specialist_type', newSpecialistType);
        setData('specialist_id', ''); // Reset specialist selection
    };

    const handleSpecialistChange = (specialistId: string) => {
        setData('specialist_id', specialistId);
    };

    const handleDateChange = (date: string) => {
        setData('appointment_date', date);
        // Generate available times for demo
        if (date) {
            const times = [
                { value: '09:00:00', label: '9:00 AM' },
                { value: '09:30:00', label: '9:30 AM' },
                { value: '10:00:00', label: '10:00 AM' },
                { value: '10:30:00', label: '10:30 AM' },
                { value: '11:00:00', label: '11:00 AM' },
                { value: '11:30:00', label: '11:30 AM' },
                { value: '14:00:00', label: '2:00 PM' },
                { value: '14:30:00', label: '2:30 PM' },
                { value: '15:00:00', label: '3:00 PM' },
                { value: '15:30:00', label: '3:30 PM' },
                { value: '16:00:00', label: '4:00 PM' },
                { value: '16:30:00', label: '4:30 PM' },
            ];
            setAvailableTimes(times);
        }
    };

    const calculatePrice = (type: string) => {
        const prices: Record<string, number> = {
            'consultation': 500,
            'checkup': 300,
            'fecalysis': 150,
            'cbc': 200,
            'urinalysis': 150,
            'x-ray': 800,
            'ultrasound': 1200,
        };
        return prices[type] || 0;
    };

    const currentPrice = selectedType ? calculatePrice(selectedType) : 0;

    // Booking form functions
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

    const handleBookAppointment = () => {
        // Update form data with appointment details
        setData({
            ...data,
            appointment_date: selectedDate,
            appointment_time: selectedTime,
            appointment_type: appointmentType,
            specialist_id: selectedDoctor?.toString() || '',
        });

        // Submit to backend
        post('/patient/appointments');
        
        // Reset form after submission
        alert('Appointment booked successfully! You will receive a confirmation email and SMS notification.');
        setShowBookingForm(false);
        setBookingStep(1);
        setSelectedDoctor(null);
        setSelectedDate('');
        setSelectedTime('');
        setAppointmentType('');
    };
    return (
        <>
            <Head title="Patient Dashboard" />
            
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
                                <p className="text-gray-600">Welcome back, {patient.first_name}!</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Button variant="outline" size="sm">
                                    <Bell className="h-4 w-4 mr-2" />
                                    Notifications
                                    {unreadCount > 0 && (
                                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card className="text-center p-6 bg-white shadow-lg">
                            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900">{stats.total_appointments}</h3>
                            <p className="text-gray-600">Total Appointments</p>
                        </Card>
                        
                        <Card className="text-center p-6 bg-white shadow-lg">
                            <Clock className="h-8 w-8 text-green-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900">{stats.upcoming_appointments}</h3>
                            <p className="text-gray-600">Upcoming</p>
                        </Card>
                        
                        <Card className="text-center p-6 bg-white shadow-lg">
                            <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900">{stats.completed_appointments}</h3>
                            <p className="text-gray-600">Completed</p>
                        </Card>
                        
                        <Card className="text-center p-6 bg-white shadow-lg">
                            <Activity className="h-8 w-8 text-orange-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900">{stats.total_visits}</h3>
                            <p className="text-gray-600">Total Visits</p>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <Card className="p-6 bg-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Book Appointment</h3>
                                    <p className="text-gray-600">Schedule a new appointment with a doctor</p>
                                </div>
                                <Button 
                                    onClick={() => setShowBookingForm(true)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Book Now
                                </Button>
                            </div>
                        </Card>
                        
                        <Card className="p-6 bg-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">View Appointments</h3>
                                    <p className="text-gray-600">Manage your existing appointments</p>
                                </div>
                                <Link href="/patient/appointments">
                                    <Button variant="outline">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        View All
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </div>

                    {/* Online Booking System */}
                    {showBookingForm && (
                        <Card className="shadow-lg border-0 rounded-xl bg-white mb-8">
                            <CardHeader className="bg-white border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                        <CalendarDays className="h-5 w-5 text-black" />
                                        Book New Appointment
                                    </CardTitle>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setShowBookingForm(false)}
                                    >
                                        ✕
                                    </Button>
                                </div>
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
                                            {availableDoctors.map(doctor => (
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

                    {/* Patient Info */}
                    <Card className="p-6 bg-white shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Patient ID</p>
                                <p className="font-semibold">{patient.patient_no}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="font-semibold">{patient.first_name} {patient.last_name}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}

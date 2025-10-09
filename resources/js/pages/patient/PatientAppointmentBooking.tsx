import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Calendar, Clock, User, Stethoscope, DollarSign, Plus, X, Bell } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patient Dashboard',
        href: '/patient/dashboard',
    },
    {
        title: 'Book Appointment',
        href: '/patient/appointments/create',
    },
];

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
    { id: 'consultation', name: 'Consultation', requiresDoctor: true, requiresMedTech: false, basePrice: 500 },
    { id: 'checkup', name: 'Check-up', requiresDoctor: true, requiresMedTech: false, basePrice: 300 },
    { id: 'fecalysis', name: 'Fecalysis', requiresDoctor: false, requiresMedTech: true, basePrice: 200 },
    { id: 'cbc', name: 'CBC (Complete Blood Count)', requiresDoctor: false, requiresMedTech: true, basePrice: 250 },
    { id: 'urinalysis', name: 'Urinalysis', requiresDoctor: false, requiresMedTech: true, basePrice: 150 },
];

interface PatientAppointmentBookingProps {
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
}

export default function PatientAppointmentBooking({ user, patient }: PatientAppointmentBookingProps) {
    const [appointmentForm, setAppointmentForm] = useState({
        appointmentType: '',
        specialist: '',
        specialistType: '',
        date: '',
        time: '',
        duration: '30 min',
        status: 'Pending',
        notes: '',
        price: 0
    });

    const calculatePrice = (appointmentType: string) => {
        const type = appointmentTypes.find(t => t.id === appointmentType);
        return type?.basePrice || 0;
    };

    const { data, setData, post, processing, errors } = useForm({
        appointment_type: '',
        specialist_id: '',
        specialist_type: '',
        appointment_date: '',
        appointment_time: '',
        duration: '30 min',
        status: 'Pending',
        notes: '',
        price: 0,
    });

    const handleTypeChange = (typeId: string) => {
        const selectedType = appointmentTypes.find(t => t.id === typeId);
        const price = calculatePrice(typeId);
        
        setAppointmentForm(prev => ({
            ...prev,
            appointmentType: typeId,
            specialistType: selectedType?.requiresDoctor ? 'doctor' : 'medtech',
            specialist: '',
            price: price
        }));

        setData({
            ...data,
            appointment_type: selectedType?.name || '',
            specialist_type: selectedType?.requiresDoctor ? 'doctor' : 'medtech',
            specialist_id: '',
            price: price
        });
    };

    const handleSpecialistChange = (specialistId: string) => {
        setAppointmentForm(prev => ({ ...prev, specialist: specialistId }));
        setData(prev => ({ ...prev, specialist_id: specialistId }));
    };

    const handleDateChange = (date: string) => {
        setAppointmentForm(prev => ({ ...prev, date }));
        setData(prev => ({ ...prev, appointment_date: date }));
    };

    const handleTimeChange = (time: string) => {
        setAppointmentForm(prev => ({ ...prev, time }));
        setData(prev => ({ ...prev, appointment_time: time }));
    };

    const handleNotesChange = (notes: string) => {
        setAppointmentForm(prev => ({ ...prev, notes }));
        setData(prev => ({ ...prev, notes }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!appointmentForm.appointmentType || !appointmentForm.specialist || !appointmentForm.date || !appointmentForm.time) {
            alert('Please fill in all required fields');
            return;
        }

        post('/patient/appointments', {
            onSuccess: () => {
                alert('Appointment booked successfully!');
                // Reset form
                setAppointmentForm({
                    appointmentType: '',
                    specialist: '',
                    specialistType: '',
                    date: '',
                    time: '',
                    duration: '30 min',
                    status: 'Pending',
                    notes: '',
                    price: 0
                });
            }
        });
    };

    const getAvailableSpecialists = () => {
        if (appointmentForm.specialistType === 'doctor') {
            return doctors;
        } else if (appointmentForm.specialistType === 'medtech') {
            return medTechs;
        }
        return [];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Book Appointment" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Book New Appointment</h1>
                            <p className="text-gray-600">Schedule your medical appointment with our specialists</p>
                        </div>
                    </div>

                    {/* Appointment Booking Form */}
                    <Card className="max-w-4xl mx-auto">
                        <CardHeader className="bg-white border-b border-gray-200">
                            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                <Plus className="h-5 w-5 text-black" />
                                Create New Appointment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Patient Information Section */}
                                <div>
                                    <h3 className="text-lg font-semibold text-black mb-4">Patient Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="block text-sm font-medium text-black mb-2">Patient Name</Label>
                                            <Input
                                                value={patient ? `${patient.first_name} ${patient.last_name}` : user.name}
                                                readOnly
                                                className="bg-gray-100 text-gray-700"
                                            />
                                        </div>
                                        <div>
                                            <Label className="block text-sm font-medium text-black mb-2">Patient ID</Label>
                                            <Input
                                                value={patient?.patient_no || 'Not assigned'}
                                                readOnly
                                                className="bg-gray-100 text-gray-700"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Appointment Details Section */}
                                <div>
                                    <h3 className="text-lg font-semibold text-black mb-4">Appointment Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="block text-sm font-medium text-black mb-2">Appointment Type *</Label>
                                            <select
                                                value={appointmentForm.appointmentType}
                                                onChange={(e) => handleTypeChange(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                <option value="">Select appointment type...</option>
                                                {appointmentTypes.map(type => (
                                                    <option key={type.id} value={type.id}>{type.name}</option>
                                                ))}
                                            </select>
                                            {errors.appointment_type && (
                                                <p className="text-sm text-red-600 mt-1">{errors.appointment_type}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label className="block text-sm font-medium text-black mb-2">
                                                {appointmentForm.specialistType === 'doctor' ? 'Doctor *' : 
                                                 appointmentForm.specialistType === 'medtech' ? 'Med Tech Specialist *' : 
                                                 'Specialist *'}
                                            </Label>
                                            <select
                                                value={appointmentForm.specialist}
                                                onChange={(e) => handleSpecialistChange(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                                disabled={!appointmentForm.appointmentType}
                                            >
                                                <option value="">Select specialist...</option>
                                                {getAvailableSpecialists().map(specialist => (
                                                    <option key={specialist.id} value={specialist.id}>
                                                        {specialist.name} - {specialist.specialization}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.specialist_id && (
                                                <p className="text-sm text-red-600 mt-1">{errors.specialist_id}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label className="block text-sm font-medium text-black mb-2">Price</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    value={appointmentForm.price || ''}
                                                    readOnly
                                                    className="bg-gray-100 text-gray-700 font-semibold"
                                                    placeholder="Auto-calculated"
                                                />
                                                <span className="text-sm text-gray-500">₱</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Price is automatically calculated based on appointment type
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="block text-sm font-medium text-black mb-2">Date *</Label>
                                            <Input
                                                type="date"
                                                value={appointmentForm.date}
                                                onChange={(e) => handleDateChange(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                required
                                            />
                                            {errors.appointment_date && (
                                                <p className="text-sm text-red-600 mt-1">{errors.appointment_date}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label className="block text-sm font-medium text-black mb-2">Time *</Label>
                                            <Input
                                                type="time"
                                                value={appointmentForm.time}
                                                onChange={(e) => handleTimeChange(e.target.value)}
                                                required
                                            />
                                            {errors.appointment_time && (
                                                <p className="text-sm text-red-600 mt-1">{errors.appointment_time}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label className="block text-sm font-medium text-black mb-2">Duration</Label>
                                            <select
                                                value={appointmentForm.duration}
                                                onChange={(e) => setAppointmentForm(prev => ({ ...prev, duration: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="30 min">30 minutes</option>
                                                <option value="45 min">45 minutes</option>
                                                <option value="60 min">60 minutes</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Information Section */}
                                <div>
                                    <h3 className="text-lg font-semibold text-black mb-4">Additional Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="block text-sm font-medium text-black mb-2">Notes</Label>
                                            <Textarea
                                                value={appointmentForm.notes}
                                                onChange={(e) => handleNotesChange(e.target.value)}
                                                placeholder="Enter any additional notes or special requirements..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Bell className="h-4 w-4 text-black" />
                                                <span className="text-sm font-medium text-black">Automatic Notifications</span>
                                            </div>
                                            <p className="text-sm text-black">
                                                You will automatically receive a confirmation email and SMS notification once the appointment is created.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Validation Summary */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-black mb-2">Appointment Summary</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Patient:</span>
                                            <span className="font-medium text-black">{patient ? `${patient.first_name} ${patient.last_name}` : user.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Specialist:</span>
                                            <span className="font-medium text-black">
                                                {appointmentForm.specialistType === 'doctor' 
                                                    ? doctors.find(d => d.id === appointmentForm.specialist)?.name || 'Not specified'
                                                    : appointmentForm.specialistType === 'medtech'
                                                    ? medTechs.find(m => m.id === appointmentForm.specialist)?.name || 'Not specified'
                                                    : 'Not specified'
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Date:</span>
                                            <span className="font-medium text-black">{appointmentForm.date || 'Not specified'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Time:</span>
                                            <span className="font-medium text-black">{appointmentForm.time || 'Not specified'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Type:</span>
                                            <span className="font-medium text-black">
                                                {appointmentTypes.find(t => t.id === appointmentForm.appointmentType)?.name || 'Not specified'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Status:</span>
                                            <span className="font-medium text-black">{appointmentForm.status}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="px-6 py-2"
                                        onClick={() => window.history.back()}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing || !appointmentForm.appointmentType || !appointmentForm.specialist || !appointmentForm.date || !appointmentForm.time}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        {processing ? 'Booking...' : 'Book Appointment'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

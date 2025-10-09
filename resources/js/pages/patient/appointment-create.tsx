import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, User, Plus, Bell, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface AppointmentCreateProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        patient_no: string;
        mobile_no: string;
    };
    doctors: Array<{
        id: number;
        name: string;
        specialization: string;
        employee_id: string;
    }>;
    medtechs: Array<{
        id: number;
        name: string;
        specialization: string;
        employee_id: string;
    }>;
    appointmentTypes: Record<string, string>;
}

export default function AppointmentCreate({ 
    user, 
    patient, 
    doctors, 
    medtechs, 
    appointmentTypes 
}: AppointmentCreateProps) {
    const [selectedType, setSelectedType] = useState<string>('');
    const [specialistType, setSpecialistType] = useState<'doctor' | 'medtech'>('doctor');
    const [availableTimes, setAvailableTimes] = useState<Array<{value: string, label: string}>>([]);
    const [appointmentPrice, setAppointmentPrice] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        patient_name: patient ? `${patient.first_name} ${patient.last_name}` : '',
        contact_number: patient ? (patient.mobile_no || '') : '',
        appointment_type: '',
        specialist_type: 'doctor',
        specialist_id: '',
        appointment_date: '',
        appointment_time: '',
        notes: '',
        special_requirements: ''
    });

    // Price calculation based on appointment type
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

    // Update price when appointment type changes
    useEffect(() => {
        if (data.appointment_type) {
            setAppointmentPrice(calculatePrice(data.appointment_type));
        }
    }, [data.appointment_type]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('patient.appointments.store'));
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
        // Fetch available times for the selected specialist and date
        if (data.specialist_id && date) {
            fetchAvailableTimes(data.specialist_id, date);
        }
    };

    const fetchAvailableTimes = async (specialistId: string, date: string) => {
        try {
            const response = await fetch(route('patient.appointments.available.times', {
                specialist_id: specialistId,
                date: date
            }));
            const times = await response.json();
            setAvailableTimes(times);
        } catch (error) {
            console.error('Error fetching available times:', error);
        }
    };

    return (
        <>
            <Head title="Create New Appointment" />
        <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                        <Link href={route('patient.dashboard')} className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Appointment</h1>
                </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Patient Information */}
                        <Card>
                        <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="mr-3 h-5 w-5 text-blue-600" />
                                    Patient Information
                            </CardTitle>
                        </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="patient_name">Patient Name *</Label>
                                    <Input
                                        id="patient_name"
                                        type="text"
                                        value={data.patient_name}
                                        onChange={(e) => setData('patient_name', e.target.value)}
                                        placeholder="Enter patient full name"
                                        className="mt-1"
                                    />
                                    {errors.patient_name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.patient_name}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="contact_number">Contact Number *</Label>
                                    <Input
                                        id="contact_number"
                                        type="tel"
                                        value={data.contact_number}
                                        onChange={(e) => setData('contact_number', e.target.value)}
                                        placeholder="Enter contact number"
                                        className="mt-1"
                                    />
                                    {errors.contact_number && (
                                        <p className="text-red-500 text-sm mt-1">{errors.contact_number}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Appointment Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="mr-3 h-5 w-5 text-green-600" />
                                    Appointment Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="appointment_type">Appointment Type *</Label>
                                        <Select value={data.appointment_type} onValueChange={(value) => setData('appointment_type', value)}>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Select appointment type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(appointmentTypes).map(([key, value]) => (
                                                <SelectItem key={key} value={key}>{value}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.appointment_type && (
                                        <p className="text-red-500 text-sm mt-1">{errors.appointment_type}</p>
                                    )}
                                </div>

                                <div>
                                        <Label htmlFor="specialist_id">Specialist *</Label>
                                        <Select value={data.specialist_id} onValueChange={(value) => setData('specialist_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select specialist..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                                {doctors.map((doctor) => (
                                                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                                        {doctor.name} - {doctor.specialization}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.specialist_id && (
                                        <p className="text-red-500 text-sm mt-1">{errors.specialist_id}</p>
                                    )}
                                </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Price</Label>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="text-sm text-gray-600">Auto-calculated</span>
                                            <span className="text-lg font-semibold text-green-600">₱{appointmentPrice}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Price is automatically calculated based on appointment type
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="appointment_date">Date *</Label>
                                        <Input
                                            id="appointment_date"
                                            type="date"
                                            value={data.appointment_date}
                                            onChange={(e) => setData('appointment_date', e.target.value)}
                                            className="mt-1"
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                        {errors.appointment_date && (
                                            <p className="text-red-500 text-sm mt-1">{errors.appointment_date}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="appointment_time">Time *</Label>
                                        <Select value={data.appointment_time} onValueChange={(value) => setData('appointment_time', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="--:-- --" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="09:00">9:00 AM</SelectItem>
                                                <SelectItem value="09:30">9:30 AM</SelectItem>
                                                <SelectItem value="10:00">10:00 AM</SelectItem>
                                                <SelectItem value="10:30">10:30 AM</SelectItem>
                                                <SelectItem value="11:00">11:00 AM</SelectItem>
                                                <SelectItem value="11:30">11:30 AM</SelectItem>
                                                <SelectItem value="14:00">2:00 PM</SelectItem>
                                                <SelectItem value="14:30">2:30 PM</SelectItem>
                                                <SelectItem value="15:00">3:00 PM</SelectItem>
                                                <SelectItem value="15:30">3:30 PM</SelectItem>
                                                <SelectItem value="16:00">4:00 PM</SelectItem>
                                                <SelectItem value="16:30">4:30 PM</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.appointment_time && (
                                            <p className="text-red-500 text-sm mt-1">{errors.appointment_time}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Duration</Label>
                                        <div className="mt-1 p-2 bg-gray-100 rounded-md">
                                            <span className="text-sm">30 minutes</span>
                                    </div>
                                </div>

                                    <div>
                                        <Label>Status</Label>
                                        <div className="mt-1 p-2 bg-yellow-100 rounded-md">
                                            <span className="text-sm text-yellow-800">Pending</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                                {/* Additional Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Info className="mr-3 h-5 w-5 text-purple-600" />
                                    Additional Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                    <div>
                                    <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Enter any additional notes or special requirements..."
                                        className="mt-1"
                                            rows={3}
                                        />
                                    </div>
                            </CardContent>
                        </Card>

                        {/* Automatic Notifications */}
                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center">
                                    <Bell className="mr-3 h-5 w-5 text-blue-600" />
                                    <div>
                                        <h3 className="font-semibold text-blue-900">Automatic Notifications</h3>
                                        <p className="text-sm text-blue-700">
                                            The patient will automatically receive a confirmation email and SMS notification once the appointment is created.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Appointment Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CheckCircle className="mr-3 h-5 w-5 text-green-600" />
                                    Appointment Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Patient:</span>
                                            <span className="font-medium">{data.patient_name || 'Not specified'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Specialist:</span>
                                            <span className="font-medium">
                                                {data.specialist_id ? 
                                                    doctors.find(d => d.id.toString() === data.specialist_id)?.name || 'Not specified' 
                                                    : 'Not specified'
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Date:</span>
                                            <span className="font-medium">{data.appointment_date || 'Not specified'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Time:</span>
                                            <span className="font-medium">{data.appointment_time || 'Not specified'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Type:</span>
                                            <span className="font-medium">
                                                {data.appointment_type ? appointmentTypes[data.appointment_type as keyof typeof appointmentTypes] : 'Not specified'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Status:</span>
                                            <span className="font-medium text-yellow-600">Pending</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4">
                                    <Link href={route('patient.dashboard')}>
                                <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                            <Button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700">
                                {processing ? 'Creating...' : 'Create Appointment'}
                                    </Button>
                                </div>
                            </form>
                </div>
            </div>
        </>
    );
}
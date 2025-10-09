import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, Phone, Mail, MapPin, ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

interface CreateAppointmentProps {
    availableDoctors?: any[];
    availableTimes?: string[];
}

export default function CreateAppointment({ availableDoctors = [], availableTimes = [] }: CreateAppointmentProps) {
    const { data, setData, post, processing, errors } = useForm({
        patient_name: '',
        patient_email: '',
        patient_phone: '',
        appointment_type: '',
        specialist_id: '',
        appointment_date: '',
        appointment_time: '',
        reason: '',
        notes: ''
    });

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('patient.appointments.store'));
    };

    return (
        <>
            <Head title="Book Appointment" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href={route('patient.dashboard')} className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Your Appointment</h1>
                        <p className="text-xl text-gray-600">
                            Schedule your appointment with our experienced medical professionals.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Appointment Form */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Calendar className="mr-3 h-6 w-6 text-blue-600" />
                                        Appointment Details
                                    </CardTitle>
                                    <CardDescription>
                                        Fill in your information to book an appointment
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Patient Information */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold flex items-center">
                                                <User className="mr-2 h-5 w-5" />
                                                Your Information
                                            </h3>
                                            
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="patient_name">Full Name *</Label>
                                                    <Input
                                                        id="patient_name"
                                                        type="text"
                                                        value={data.patient_name}
                                                        onChange={(e) => setData('patient_name', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="Enter your full name"
                                                    />
                                                    {errors.patient_name && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.patient_name}</p>
                                                    )}
                                                </div>
                                                
                                                <div>
                                                    <Label htmlFor="patient_phone">Phone Number *</Label>
                                                    <Input
                                                        id="patient_phone"
                                                        type="tel"
                                                        value={data.patient_phone}
                                                        onChange={(e) => setData('patient_phone', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="Enter your phone number"
                                                    />
                                                    {errors.patient_phone && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.patient_phone}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="patient_email">Email Address</Label>
                                                <Input
                                                    id="patient_email"
                                                    type="email"
                                                    value={data.patient_email}
                                                    onChange={(e) => setData('patient_email', e.target.value)}
                                                    className="mt-1"
                                                    placeholder="Enter your email address"
                                                />
                                                {errors.patient_email && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.patient_email}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Appointment Details */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold flex items-center">
                                                <Clock className="mr-2 h-5 w-5" />
                                                Appointment Details
                                            </h3>
                                            
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="appointment_type">Appointment Type *</Label>
                                                    <Select value={data.appointment_type} onValueChange={(value) => setData('appointment_type', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select appointment type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="consultation">General Consultation</SelectItem>
                                                            <SelectItem value="follow_up">Follow-up Visit</SelectItem>
                                                            <SelectItem value="checkup">Regular Checkup</SelectItem>
                                                            <SelectItem value="emergency">Emergency Visit</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.appointment_type && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.appointment_type}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="specialist_id">Doctor/Specialist</Label>
                                                    <Select value={data.specialist_id} onValueChange={(value) => setData('specialist_id', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a doctor" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="1">Dr. John Smith - General Medicine</SelectItem>
                                                            <SelectItem value="2">Dr. Sarah Johnson - Cardiology</SelectItem>
                                                            <SelectItem value="3">Dr. Michael Brown - Pediatrics</SelectItem>
                                                            <SelectItem value="4">Dr. Emily Davis - Dermatology</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.specialist_id && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.specialist_id}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="appointment_date">Preferred Date *</Label>
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

                                                <div>
                                                    <Label htmlFor="appointment_time">Preferred Time *</Label>
                                                    <Select value={data.appointment_time} onValueChange={(value) => setData('appointment_time', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select time" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="09:00">9:00 AM</SelectItem>
                                                            <SelectItem value="10:00">10:00 AM</SelectItem>
                                                            <SelectItem value="11:00">11:00 AM</SelectItem>
                                                            <SelectItem value="14:00">2:00 PM</SelectItem>
                                                            <SelectItem value="15:00">3:00 PM</SelectItem>
                                                            <SelectItem value="16:00">4:00 PM</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.appointment_time && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.appointment_time}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="reason">Reason for Visit *</Label>
                                                <Textarea
                                                    id="reason"
                                                    value={data.reason}
                                                    onChange={(e) => setData('reason', e.target.value)}
                                                    className="mt-1"
                                                    placeholder="Please describe the reason for your visit"
                                                    rows={3}
                                                />
                                                {errors.reason && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="notes">Additional Notes</Label>
                                                <Textarea
                                                    id="notes"
                                                    value={data.notes}
                                                    onChange={(e) => setData('notes', e.target.value)}
                                                    className="mt-1"
                                                    placeholder="Any additional information you'd like to share"
                                                    rows={2}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-4">
                                            <Link href={route('patient.dashboard')}>
                                                <Button type="button" variant="outline">
                                                    Cancel
                                                </Button>
                                            </Link>
                                            <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                                                {processing ? 'Booking...' : 'Book Appointment'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar Information */}
                        <div className="space-y-6">
                            {/* Clinic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <MapPin className="mr-3 h-5 w-5 text-blue-600" />
                                        Clinic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold">St. James Clinic</h4>
                                        <p className="text-sm text-gray-600">
                                            Medical Center Building<br />
                                            Healthcare District, City
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Phone</h4>
                                        <p className="text-sm text-gray-600">(02) 123-4567</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Email</h4>
                                        <p className="text-sm text-gray-600">info@stjamesclinic.com</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Operating Hours */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Clock className="mr-3 h-5 w-5 text-green-600" />
                                        Operating Hours
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm">Monday - Friday</span>
                                            <span className="text-sm font-semibold">8:00 AM - 6:00 PM</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Saturday</span>
                                            <span className="text-sm font-semibold">9:00 AM - 4:00 PM</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Sunday</span>
                                            <span className="text-sm font-semibold">Closed</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* What to Expect */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>What to Expect</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li>• Arrive 15 minutes early</li>
                                        <li>• Bring valid ID</li>
                                        <li>• Bring insurance card if applicable</li>
                                        <li>• Wear comfortable clothing</li>
                                        <li>• Bring list of current medications</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
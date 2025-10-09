import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Stethoscope, Calendar as CalendarIcon, MapPin, Star, CheckCircle, AlertCircle, Bell, Heart, Award, Shield, Phone } from 'lucide-react';

interface Specialist {
    id: string;
    name: string;
    specialization: string;
    employee_id: string;
    availability: string;
    rating: number;
    experience: string;
    nextAvailable: string;
    description?: string;
    languages?: string[];
    education?: string;
    certifications?: string[];
}

interface TimeSlot {
    value: string;
    label: string;
    available: boolean;
}

interface AppointmentBookingProps {
    user: any;
    patient: any;
    doctors: Specialist[];
    medtechs: Specialist[];
    appointmentTypes: Record<string, string>;
}

export default function EnhancedAppointmentBooking({ user, patient, doctors, medtechs, appointmentTypes }: AppointmentBookingProps) {
    const [selectedSpecialistType, setSelectedSpecialistType] = useState<string>('doctor');
    const [selectedSpecialist, setSelectedSpecialist] = useState<string>('');
    const [price, setPrice] = useState<number>(0);
    const [showDoctorDetails, setShowDoctorDetails] = useState<string | null>(null);
    
    // Patient Information state
    const [patientName, setPatientName] = useState<string>(patient ? `${patient.first_name} ${patient.last_name}` : '');
    const [patientId, setPatientId] = useState<string>(patient?.patient_id || '');
    const [contactNumber, setContactNumber] = useState<string>(patient?.mobile_no || '');

    const { data, setData, post, processing, errors, reset } = useForm({
        appointment_type: '',
        specialist_type: 'doctor',
        specialist_id: '',
        appointment_date: '',
        appointment_time: '',
        notes: '',
        special_requirements: '',
    });

    const specialists = selectedSpecialistType === 'doctor' ? doctors : medtechs;

    // Calculate price based on appointment type
    const calculatePrice = (appointmentType: string) => {
        const prices: { [key: string]: number } = {
            'consultation': 500,
            'checkup': 300,
            'fecalysis': 200,
            'cbc': 300,
            'urinalysis': 250,
            'x-ray': 400,
            'ultrasound': 600,
        };
        return prices[appointmentType] || 0;
    };

    // Update form data when selections change
    useEffect(() => {
        setData('specialist_type', selectedSpecialistType);
    }, [selectedSpecialistType]);

    useEffect(() => {
        setData('specialist_id', selectedSpecialist);
    }, [selectedSpecialist]);

    useEffect(() => {
        const newPrice = calculatePrice(data.appointment_type);
        setPrice(newPrice);
    }, [data.appointment_type]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('patient.appointments.store'), {
            onSuccess: () => {
                reset();
                setSelectedSpecialistType('doctor');
                setSelectedSpecialist('');
                setPrice(0);
            },
        });
    };

    const getSpecialistInfo = (specialistId: string) => {
        return specialists.find(s => s.id === specialistId);
    };

    const selectedSpecialistInfo = getSpecialistInfo(selectedSpecialist);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <Head title="Book Appointment - St. James Hospital" />
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Your Appointment</h1>
                    <p className="text-xl text-gray-600 mb-6">Schedule with our expert medical professionals</p>
                    <div className="flex justify-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            <span>Secure & Confidential</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Real-time Availability</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            <span>Instant Notifications</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Available Doctors/Specialists */}
                    <div className="lg:col-span-1">
                        <Card className="shadow-lg border-0 rounded-xl bg-white">
                            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
                                <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                                    <Stethoscope className="h-5 w-5" />
                                    Available Specialists
                                </CardTitle>
                                <CardDescription className="text-blue-100">
                                    Choose from our team of experienced medical professionals
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {specialists.map((specialist) => (
                                        <div 
                                            key={specialist.id}
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                selectedSpecialist === specialist.id 
                                                    ? 'border-blue-500 bg-blue-50' 
                                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                            }`}
                                            onClick={() => setSelectedSpecialist(specialist.id)}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg text-gray-900">{specialist.name}</h3>
                                                    <p className="text-sm text-gray-600 mb-2">{specialist.specialization}</p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-4 w-4 text-yellow-500" />
                                                            <span>{specialist.rating}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            <span>{specialist.experience}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowDoctorDetails(showDoctorDetails === specialist.id ? null : specialist.id);
                                                    }}
                                                    className="text-xs"
                                                >
                                                    {showDoctorDetails === specialist.id ? 'Hide' : 'Details'}
                                                </Button>
                                            </div>
                                            
                                            {showDoctorDetails === specialist.id && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <div className="space-y-2 text-sm">
                                                        <div>
                                                            <span className="font-medium text-gray-700">Availability:</span>
                                                            <span className="text-gray-600 ml-2">{specialist.availability}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-700">Next Available:</span>
                                                            <span className="text-gray-600 ml-2">{specialist.nextAvailable}</span>
                                                        </div>
                                                        {specialist.languages && (
                                                            <div>
                                                                <span className="font-medium text-gray-700">Languages:</span>
                                                                <span className="text-gray-600 ml-2">{specialist.languages.join(', ')}</span>
                                                            </div>
                                                        )}
                                                        {specialist.certifications && (
                                                            <div>
                                                                <span className="font-medium text-gray-700">Certifications:</span>
                                                                <span className="text-gray-600 ml-2">{specialist.certifications.join(', ')}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="mt-3">
                                                <div className="text-sm text-green-600 font-medium">
                                                    Next available: {specialist.nextAvailable}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Appointment Booking Form */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-lg border-0 rounded-xl bg-white">
                            <CardHeader className="bg-white border-b border-gray-200">
                                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                    <CalendarIcon className="h-5 w-5 text-black" />
                                    Appointment Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Patient Information Section */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-black mb-4">Patient Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="block text-sm font-medium text-black mb-2">Patient Name *</Label>
                                                <input
                                                    type="text"
                                                    value={patientName}
                                                    onChange={(e) => setPatientName(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter patient name"
                                                />
                                            </div>
                                            <div>
                                                <Label className="block text-sm font-medium text-black mb-2">Patient ID</Label>
                                                <input
                                                    type="text"
                                                    value={patientId}
                                                    onChange={(e) => setPatientId(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter patient ID"
                                                />
                                            </div>
                                            <div>
                                                <Label className="block text-sm font-medium text-black mb-2">Contact Number *</Label>
                                                <input
                                                    type="tel"
                                                    value={contactNumber}
                                                    onChange={(e) => setContactNumber(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter contact number"
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
                                                    value={data.appointment_type}
                                                    onChange={(e) => {
                                                        const selectedType = e.target.value;
                                                        setData('appointment_type', selectedType);
                                                        // Auto-determine specialist type based on appointment type
                                                        if (['fecalysis', 'cbc', 'urinalysis', 'x-ray', 'ultrasound'].includes(selectedType)) {
                                                            setSelectedSpecialistType('medtech');
                                                        } else {
                                                            setSelectedSpecialistType('doctor');
                                                        }
                                                        setSelectedSpecialist('');
                                                        setData('specialist_id', '');
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                >
                                                    <option value="">Select appointment type...</option>
                                                    {Object.entries(appointmentTypes).map(([key, value]) => (
                                                        <option key={key} value={key}>{value}</option>
                                                    ))}
                                                </select>
                                                {errors.appointment_type && (
                                                    <p className="text-red-600 text-sm mt-1">{errors.appointment_type}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label className="block text-sm font-medium text-black mb-2">
                                                    {selectedSpecialistType === 'doctor' ? 'Doctor *' : 
                                                     selectedSpecialistType === 'medtech' ? 'Med Tech Specialist *' : 
                                                     'Specialist *'}
                                                </Label>
                                                <select
                                                    value={data.specialist_id}
                                                    onChange={(e) => {
                                                        const specialistId = e.target.value;
                                                        setSelectedSpecialist(specialistId);
                                                        setData('specialist_id', specialistId);
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                    disabled={!data.appointment_type}
                                                >
                                                    <option value="">Select specialist...</option>
                                                    {specialists.map(specialist => (
                                                        <option key={specialist.id} value={specialist.id}>
                                                            {specialist.name} - {specialist.specialization}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.specialist_id && (
                                                    <p className="text-red-600 text-sm mt-1">{errors.specialist_id}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label className="block text-sm font-medium text-black mb-2">Price</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        value={price || ''}
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
                                                <input
                                                    type="date"
                                                    value={data.appointment_date}
                                                    onChange={(e) => setData('appointment_date', e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                />
                                                {errors.appointment_date && (
                                                    <p className="text-red-600 text-sm mt-1">{errors.appointment_date}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label className="block text-sm font-medium text-black mb-2">Time *</Label>
                                                <input
                                                    type="time"
                                                    value={data.appointment_time}
                                                    onChange={(e) => setData('appointment_time', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                />
                                                {errors.appointment_time && (
                                                    <p className="text-red-600 text-sm mt-1">{errors.appointment_time}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label className="block text-sm font-medium text-black mb-2">Duration</Label>
                                                <select
                                                    value="30 min"
                                                    onChange={(e) => {
                                                        // You can add duration to form data if needed
                                                    }}
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
                                                <textarea
                                                    value={data.notes}
                                                    onChange={(e) => setData('notes', e.target.value)}
                                                    placeholder="Enter any additional notes or special requirements..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    rows={3}
                                                />
                                            </div>
                                            <div>
                                                <Label className="block text-sm font-medium text-black mb-2">Special Requirements</Label>
                                                <textarea
                                                    value={data.special_requirements}
                                                    onChange={(e) => setData('special_requirements', e.target.value)}
                                                    placeholder="Any special accommodations or requirements..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Bell className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm font-medium text-blue-800">Real-time Notifications</span>
                                                </div>
                                                <p className="text-sm text-blue-700">
                                                    Your appointment request will be reviewed by our staff. You will receive instant notifications once approved or if any changes are needed.
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
                                                <span className="font-medium text-black">{patientName || 'Not specified'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Service:</span>
                                                <span className="font-medium text-black">{data.appointment_type ? appointmentTypes[data.appointment_type] : 'Not selected'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Specialist:</span>
                                                <span className="font-medium text-black">{selectedSpecialistInfo?.name || 'Not selected'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Date:</span>
                                                <span className="font-medium text-black">{data.appointment_date || 'Not selected'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Time:</span>
                                                <span className="font-medium text-black">{data.appointment_time || 'Not selected'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Price:</span>
                                                <span className="font-medium text-black">₱{price}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end gap-3 mt-6">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => window.history.back()}
                                            className="px-6 py-2"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 flex items-center gap-2"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            {processing ? 'Booking...' : 'Book Appointment'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

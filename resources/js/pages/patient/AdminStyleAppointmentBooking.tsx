import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Calendar, Clock, User, Stethoscope, DollarSign, CheckCircle } from 'lucide-react';
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

interface AdminStyleAppointmentBookingProps {
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
    doctors: Array<{
        id: number;
        name: string;
        specialization: string;
        consultation_fee: number;
        is_available: boolean;
    }>;
    medtechs: Array<{
        id: number;
        name: string;
        specialization: string;
        consultation_fee: number;
        is_available: boolean;
    }>;
    appointmentTypes: Array<{
        id: number;
        name: string;
        description: string;
        base_price: number;
    }>;
}

export default function AdminStyleAppointmentBooking({ 
    user, 
    patient, 
    doctors, 
    medtechs, 
    appointmentTypes 
}: AdminStyleAppointmentBookingProps) {
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedSpecialist, setSelectedSpecialist] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

    const { data, setData, post, processing, errors } = useForm({
        appointment_type: '',
        specialist_id: '',
        specialist_type: '',
        appointment_date: '',
        appointment_time: '',
        chief_complaint: '',
        notes: '',
        price: 0,
    });

    const handleTypeChange = (typeId: string) => {
        setSelectedType(typeId);
        const type = appointmentTypes.find(t => t.id.toString() === typeId);
        if (type) {
            setData('appointment_type', type.name);
            setData('price', type.base_price);
            setCalculatedPrice(type.base_price);
        }
        setSelectedSpecialist('');
        setData('specialist_id', '');
        setData('specialist_type', '');
    };

    const handleSpecialistChange = (specialistId: string, specialistType: string) => {
        setSelectedSpecialist(specialistId);
        setData('specialist_id', specialistId);
        setData('specialist_type', specialistType);
        
        const specialist = specialistType === 'doctor' 
            ? doctors.find(d => d.id.toString() === specialistId)
            : medtechs.find(m => m.id.toString() === specialistId);
            
        if (specialist) {
            const totalPrice = calculatedPrice + specialist.consultation_fee;
            setData('price', totalPrice);
        }
    };

    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        setData('appointment_date', date);
        setSelectedTime('');
        setData('appointment_time', '');
    };

    const handleTimeChange = (time: string) => {
        setSelectedTime(time);
        setData('appointment_time', time);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/patient/appointments', {
            onSuccess: () => {
                // Reset form
                setSelectedType('');
                setSelectedSpecialist('');
                setSelectedDate('');
                setSelectedTime('');
                setCalculatedPrice(0);
            }
        });
    };

    const availableTimes = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    const getAvailableSpecialists = () => {
        if (selectedType === '1') { // Consultation
            return doctors.filter(d => d.is_available);
        } else if (selectedType === '2') { // Lab Test
            return medtechs.filter(m => m.is_available);
        }
        return [];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Book Appointment" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Book New Appointment</h1>
                        <p className="text-gray-600">Schedule your medical appointment with our specialists</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Booking Form */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Appointment Details
                                    </CardTitle>
                                    <CardDescription>
                                        Fill in the details for your appointment
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Appointment Type */}
                                        <div className="space-y-2">
                                            <Label htmlFor="appointment_type">Appointment Type</Label>
                                            <Select value={selectedType} onValueChange={handleTypeChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select appointment type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {appointmentTypes.map((type) => (
                                                        <SelectItem key={type.id} value={type.id.toString()}>
                                                            <div className="flex items-center justify-between w-full">
                                                                <span>{type.name}</span>
                                                                <Badge variant="outline" className="ml-2">
                                                                    ₱{type.base_price}
                                                                </Badge>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.appointment_type && (
                                                <p className="text-sm text-red-600">{errors.appointment_type}</p>
                                            )}
                                        </div>

                                        {/* Specialist Selection */}
                                        {selectedType && (
                                            <div className="space-y-2">
                                                <Label htmlFor="specialist">Specialist</Label>
                                                <Select value={selectedSpecialist} onValueChange={(value) => {
                                                    const specialistType = selectedType === '1' ? 'doctor' : 'medtech';
                                                    handleSpecialistChange(value, specialistType);
                                                }}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select specialist" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {getAvailableSpecialists().map((specialist) => (
                                                            <SelectItem key={specialist.id} value={specialist.id.toString()}>
                                                                <div className="flex items-center justify-between w-full">
                                                                    <div>
                                                                        <div className="font-medium">{specialist.name}</div>
                                                                        <div className="text-sm text-muted-foreground">{specialist.specialization}</div>
                                                                    </div>
                                                                    <Badge variant="outline" className="ml-2">
                                                                        ₱{specialist.consultation_fee}
                                                                    </Badge>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.specialist_id && (
                                                    <p className="text-sm text-red-600">{errors.specialist_id}</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Date and Time */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="appointment_date">Date</Label>
                                                <Input
                                                    id="appointment_date"
                                                    type="date"
                                                    value={selectedDate}
                                                    onChange={(e) => handleDateChange(e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                                {errors.appointment_date && (
                                                    <p className="text-sm text-red-600">{errors.appointment_date}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="appointment_time">Time</Label>
                                                <Select value={selectedTime} onValueChange={handleTimeChange}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select time" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableTimes.map((time) => (
                                                            <SelectItem key={time} value={time}>
                                                                {time}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.appointment_time && (
                                                    <p className="text-sm text-red-600">{errors.appointment_time}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Chief Complaint */}
                                        <div className="space-y-2">
                                            <Label htmlFor="chief_complaint">Chief Complaint</Label>
                                            <Textarea
                                                id="chief_complaint"
                                                value={data.chief_complaint}
                                                onChange={(e) => setData('chief_complaint', e.target.value)}
                                                placeholder="Describe your symptoms or reason for the appointment"
                                                rows={3}
                                            />
                                            {errors.chief_complaint && (
                                                <p className="text-sm text-red-600">{errors.chief_complaint}</p>
                                            )}
                                        </div>

                                        {/* Additional Notes */}
                                        <div className="space-y-2">
                                            <Label htmlFor="notes">Additional Notes (Optional)</Label>
                                            <Textarea
                                                id="notes"
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                placeholder="Any additional information you'd like to share"
                                                rows={2}
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <Button 
                                            type="submit" 
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                            disabled={processing}
                                        >
                                            {processing ? 'Booking...' : 'Book Appointment'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Price Summary */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Price Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {selectedType && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span>Base Price:</span>
                                                <span>₱{calculatedPrice}</span>
                                            </div>
                                            {selectedSpecialist && (
                                                <div className="flex justify-between">
                                                    <span>Consultation Fee:</span>
                                                    <span>₱{getAvailableSpecialists().find(s => s.id.toString() === selectedSpecialist)?.consultation_fee || 0}</span>
                                                </div>
                                            )}
                                            <hr />
                                            <div className="flex justify-between font-semibold">
                                                <span>Total:</span>
                                                <span>₱{data.price}</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {!selectedType && (
                                        <div className="text-center py-8">
                                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-muted-foreground">Select appointment type to see pricing</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Available Specialists Info */}
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Stethoscope className="h-5 w-5" />
                                        Available Specialists
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-medium mb-2">Doctors</h4>
                                            <div className="space-y-2">
                                                {doctors.filter(d => d.is_available).map((doctor) => (
                                                    <div key={doctor.id} className="flex items-center justify-between p-2 border rounded">
                                                        <div>
                                                            <div className="font-medium text-sm">{doctor.name}</div>
                                                            <div className="text-xs text-muted-foreground">{doctor.specialization}</div>
                                                        </div>
                                                        <Badge variant="outline" className="text-xs">
                                                            ₱{doctor.consultation_fee}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h4 className="font-medium mb-2">Medical Technologists</h4>
                                            <div className="space-y-2">
                                                {medtechs.filter(m => m.is_available).map((medtech) => (
                                                    <div key={medtech.id} className="flex items-center justify-between p-2 border rounded">
                                                        <div>
                                                            <div className="font-medium text-sm">{medtech.name}</div>
                                                            <div className="text-xs text-muted-foreground">{medtech.specialization}</div>
                                                        </div>
                                                        <Badge variant="outline" className="text-xs">
                                                            ₱{medtech.consultation_fee}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

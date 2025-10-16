import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, ArrowLeft, Save } from 'lucide-react';

interface Appointment {
    id: number;
    patient_name: string;
    appointment_type: string;
    specialist_name?: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    reason: string;
    notes?: string;
    created_at: string;
}

interface Doctor {
    id: number;
    name: string;
    specialization: string;
}

interface PatientAppointmentEditProps {
    appointment: Appointment;
    patient: any;
    doctors: Doctor[];
    medtechs: Doctor[];
    appointmentTypes: Record<string, string>;
}

export default function PatientAppointmentEdit({ 
    appointment, 
    patient, 
    doctors, 
    medtechs, 
    appointmentTypes 
}: PatientAppointmentEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        appointment_type: appointment.appointment_type,
        specialist_type: appointment.specialist_name ? 'doctor' : 'medtech',
        specialist_id: '',
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        notes: appointment.notes || '',
        special_requirements: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('patient.appointments.update', appointment.id));
    };

    const getAvailableSpecialists = () => {
        return data.specialist_type === 'doctor' ? doctors : medtechs;
    };

    return (
        <>
            <Head title={`Edit Appointment - ${appointment.appointment_type}`} />
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href={route('patient.appointments.show', appointment.id)}>
                            <Button variant="outline" className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Appointment
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Appointment</h1>
                        <p className="text-gray-600 mt-2">Update your appointment details</p>
                    </div>

                    {/* Edit Form */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl">Appointment Information</CardTitle>
                            <CardDescription>
                                Update your appointment details below
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Appointment Type */}
                                    <div className="space-y-2">
                                        <Label htmlFor="appointment_type">Appointment Type</Label>
                                        <Select
                                            value={data.appointment_type}
                                            onValueChange={(value) => setData('appointment_type', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select appointment type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(appointmentTypes).map(([key, value]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {value}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.appointment_type && (
                                            <p className="text-sm text-red-600">{errors.appointment_type}</p>
                                        )}
                                    </div>

                                    {/* Specialist Type */}
                                    <div className="space-y-2">
                                        <Label htmlFor="specialist_type">Specialist Type</Label>
                                        <Select
                                            value={data.specialist_type}
                                            onValueChange={(value) => setData('specialist_type', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select specialist type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="doctor">Doctor</SelectItem>
                                                <SelectItem value="medtech">Medical Technologist</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.specialist_type && (
                                            <p className="text-sm text-red-600">{errors.specialist_type}</p>
                                        )}
                                    </div>

                                    {/* Specialist */}
                                    <div className="space-y-2">
                                        <Label htmlFor="specialist_id">Specialist</Label>
                                        <Select
                                            value={data.specialist_id}
                                            onValueChange={(value) => setData('specialist_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select specialist" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getAvailableSpecialists().map((specialist) => (
                                                    <SelectItem key={specialist.id} value={specialist.id.toString()}>
                                                        {specialist.name} - {specialist.specialization}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.specialist_id && (
                                            <p className="text-sm text-red-600">{errors.specialist_id}</p>
                                        )}
                                    </div>

                                    {/* Appointment Date */}
                                    <div className="space-y-2">
                                        <Label htmlFor="appointment_date">Appointment Date</Label>
                                        <Input
                                            id="appointment_date"
                                            type="date"
                                            value={data.appointment_date}
                                            onChange={(e) => setData('appointment_date', e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                        {errors.appointment_date && (
                                            <p className="text-sm text-red-600">{errors.appointment_date}</p>
                                        )}
                                    </div>

                                    {/* Appointment Time */}
                                    <div className="space-y-2">
                                        <Label htmlFor="appointment_time">Appointment Time</Label>
                                        <Input
                                            id="appointment_time"
                                            type="time"
                                            value={data.appointment_time}
                                            onChange={(e) => setData('appointment_time', e.target.value)}
                                        />
                                        {errors.appointment_time && (
                                            <p className="text-sm text-red-600">{errors.appointment_time}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Additional Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Any additional notes or concerns..."
                                        rows={3}
                                    />
                                    {errors.notes && (
                                        <p className="text-sm text-red-600">{errors.notes}</p>
                                    )}
                                </div>

                                {/* Special Requirements */}
                                <div className="space-y-2">
                                    <Label htmlFor="special_requirements">Special Requirements</Label>
                                    <Textarea
                                        id="special_requirements"
                                        value={data.special_requirements}
                                        onChange={(e) => setData('special_requirements', e.target.value)}
                                        placeholder="Any special requirements or accommodations needed..."
                                        rows={3}
                                    />
                                    {errors.special_requirements && (
                                        <p className="text-sm text-red-600">{errors.special_requirements}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end space-x-4">
                                    <Link href={route('patient.appointments.show', appointment.id)}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700">
                                        <Save className="mr-2 h-4 w-4" />
                                        {processing ? 'Updating...' : 'Update Appointment'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}





import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function UpdatedOnlineAppointmentForm({ 
    user, 
    patient, 
    doctors, 
    medtechs, 
    appointmentTypes, 
    isExistingPatient,
    cache_bust 
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
    const [submitMessage, setSubmitMessage] = useState('');
    const [selectedSpecialistType, setSelectedSpecialistType] = useState('');
    const [availableSpecialists, setAvailableSpecialists] = useState([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        // Appointment data
        appointment_type: '',
        specialist_type: '',
        specialist_id: '',
        appointment_date: '',
        appointment_time: '',
        notes: '',
        special_requirements: '',
        
        // Patient data (only if new patient)
        last_name: patient?.last_name || '',
        first_name: patient?.first_name || '',
        middle_name: patient?.middle_name || '',
        birthdate: patient?.birthdate || '',
        age: patient?.age || '',
        sex: patient?.sex || '',
        nationality: patient?.nationality || '',
        civil_status: patient?.civil_status || '',
        address: patient?.address || '',
        telephone_no: patient?.telephone_no || '',
        mobile_no: patient?.mobile_no || '',
        emergency_name: patient?.emergency_name || '',
        emergency_relation: patient?.emergency_relation || '',
        insurance_company: patient?.insurance_company || '',
        hmo_name: patient?.hmo_name || '',
        hmo_id_no: patient?.hmo_id_no || '',
        approval_code: patient?.approval_code || '',
        validity: patient?.validity || '',
        drug_allergies: patient?.drug_allergies || '',
        past_medical_history: patient?.past_medical_history || '',
        family_history: patient?.family_history || '',
        social_history: patient?.social_history || '',
        obgyn_history: patient?.obgyn_history || '',
    });

    // Update available specialists when specialist type changes
    useEffect(() => {
        if (selectedSpecialistType === 'doctor') {
            setAvailableSpecialists(doctors);
        } else if (selectedSpecialistType === 'medtech') {
            setAvailableSpecialists(medtechs);
        } else {
            setAvailableSpecialists([]);
        }
        
        // Reset specialist selection when type changes
        setData('specialist_id', '');
    }, [selectedSpecialistType, doctors, medtechs]);

    const handleSpecialistTypeChange = (value) => {
        setSelectedSpecialistType(value);
        setData('specialist_type', value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        setSubmitStatus(null);
        setSubmitMessage('');

        try {
            // Validate required fields
            if (!data.appointment_type || !data.specialist_type || !data.specialist_id || 
                !data.appointment_date || !data.appointment_time) {
                throw new Error('Please fill in all required fields.');
            }

            // If new patient, validate patient data
            if (!isExistingPatient) {
                if (!data.last_name || !data.first_name || !data.mobile_no) {
                    throw new Error('Please fill in all required patient information.');
                }
            }

            // Show loading state
            setSubmitMessage('Submitting appointment request...');

            // Submit form using Inertia
            post(route('patient.online.appointment.store'), {
                onSuccess: (page) => {
                    setSubmitStatus('success');
                    setSubmitMessage('Appointment request submitted successfully! Your appointment is pending admin approval.');
                    
                    // Reset form after successful submission
                    setTimeout(() => {
                        reset();
                        setSelectedSpecialistType('');
                        setAvailableSpecialists([]);
                    }, 2000);
                },
                onError: (errors) => {
                    setSubmitStatus('error');
                    setSubmitMessage('Failed to submit appointment request. Please check your information and try again.');
                    console.error('Form errors:', errors);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                }
            });

        } catch (error) {
            setSubmitStatus('error');
            setSubmitMessage(error.message);
            setIsSubmitting(false);
        }
    };

    const formatTimeForDisplay = (time) => {
        return time ? new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }) : '';
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Online Appointment Booking</CardTitle>
                    <CardDescription>
                        {isExistingPatient 
                            ? 'Book an appointment with your existing patient profile.'
                            : 'Create a new patient profile and book an appointment.'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Appointment Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Appointment Details</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="appointment_type">Appointment Type *</Label>
                                    <Select
                                        value={data.appointment_type}
                                        onValueChange={(value) => setData('appointment_type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select appointment type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(appointmentTypes).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.appointment_type && (
                                        <p className="text-sm text-red-600 mt-1">{errors.appointment_type}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="specialist_type">Specialist Type *</Label>
                                    <Select
                                        value={selectedSpecialistType}
                                        onValueChange={handleSpecialistTypeChange}
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
                                        <p className="text-sm text-red-600 mt-1">{errors.specialist_type}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="specialist_id">Specialist *</Label>
                                    <Select
                                        value={data.specialist_id}
                                        onValueChange={(value) => setData('specialist_id', value)}
                                        disabled={!selectedSpecialistType}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select specialist" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableSpecialists.map((specialist) => (
                                                <SelectItem key={specialist.staff_id} value={specialist.staff_id.toString()}>
                                                    {specialist.name} - {specialist.specialization}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.specialist_id && (
                                        <p className="text-sm text-red-600 mt-1">{errors.specialist_id}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="appointment_date">Appointment Date *</Label>
                                    <Input
                                        id="appointment_date"
                                        type="date"
                                        value={data.appointment_date}
                                        onChange={(e) => setData('appointment_date', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    {errors.appointment_date && (
                                        <p className="text-sm text-red-600 mt-1">{errors.appointment_date}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="appointment_time">Appointment Time *</Label>
                                    <Input
                                        id="appointment_time"
                                        type="time"
                                        value={data.appointment_time}
                                        onChange={(e) => setData('appointment_time', e.target.value)}
                                    />
                                    {errors.appointment_time && (
                                        <p className="text-sm text-red-600 mt-1">{errors.appointment_time}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="notes">Additional Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Any additional information or special requirements..."
                                    rows={3}
                                />
                                {errors.notes && (
                                    <p className="text-sm text-red-600 mt-1">{errors.notes}</p>
                                )}
                            </div>
                        </div>

                        {/* Patient Information (only for new patients) */}
                        {!isExistingPatient && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Patient Information</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="last_name">Last Name *</Label>
                                        <Input
                                            id="last_name"
                                            value={data.last_name}
                                            onChange={(e) => setData('last_name', e.target.value)}
                                        />
                                        {errors.last_name && (
                                            <p className="text-sm text-red-600 mt-1">{errors.last_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="first_name">First Name *</Label>
                                        <Input
                                            id="first_name"
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                        />
                                        {errors.first_name && (
                                            <p className="text-sm text-red-600 mt-1">{errors.first_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="middle_name">Middle Name</Label>
                                        <Input
                                            id="middle_name"
                                            value={data.middle_name}
                                            onChange={(e) => setData('middle_name', e.target.value)}
                                        />
                                        {errors.middle_name && (
                                            <p className="text-sm text-red-600 mt-1">{errors.middle_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="birthdate">Birthdate</Label>
                                        <Input
                                            id="birthdate"
                                            type="date"
                                            value={data.birthdate}
                                            onChange={(e) => setData('birthdate', e.target.value)}
                                        />
                                        {errors.birthdate && (
                                            <p className="text-sm text-red-600 mt-1">{errors.birthdate}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="age">Age</Label>
                                        <Input
                                            id="age"
                                            type="number"
                                            value={data.age}
                                            onChange={(e) => setData('age', e.target.value)}
                                        />
                                        {errors.age && (
                                            <p className="text-sm text-red-600 mt-1">{errors.age}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="sex">Sex</Label>
                                        <Select
                                            value={data.sex}
                                            onValueChange={(value) => setData('sex', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select sex" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.sex && (
                                            <p className="text-sm text-red-600 mt-1">{errors.sex}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="mobile_no">Mobile Number *</Label>
                                        <Input
                                            id="mobile_no"
                                            value={data.mobile_no}
                                            onChange={(e) => setData('mobile_no', e.target.value)}
                                        />
                                        {errors.mobile_no && (
                                            <p className="text-sm text-red-600 mt-1">{errors.mobile_no}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="address">Address</Label>
                                        <Textarea
                                            id="address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            rows={2}
                                        />
                                        {errors.address && (
                                            <p className="text-sm text-red-600 mt-1">{errors.address}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Status */}
                        {submitStatus && (
                            <Alert className={submitStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                                <div className="flex items-center">
                                    {submitStatus === 'success' ? (
                                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-600 mr-2" />
                                    )}
                                    <AlertDescription className={submitStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
                                        {submitMessage}
                                    </AlertDescription>
                                </div>
                            </Alert>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || processing}
                                className="min-w-[120px]"
                            >
                                {isSubmitting || processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Appointment'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}


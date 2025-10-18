import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Calendar, Clock, User, Phone, Mail } from 'lucide-react';

export default function CompleteOnlineAppointmentForm() {
    const [formData, setFormData] = useState({
        // Patient Information
        last_name: '',
        first_name: '',
        middle_name: '',
        birthdate: '',
        age: '',
        sex: '',
        nationality: 'Filipino',
        civil_status: '',
        address: '',
        telephone_no: '',
        mobile_no: '',
        emergency_name: '',
        emergency_relation: '',
        insurance_company: '',
        hmo_name: '',
        hmo_id_no: '',
        approval_code: '',
        validity: '',
        drug_allergies: 'NONE',
        past_medical_history: '',
        family_history: '',
        social_history: '',
        obgyn_history: '',
        
        // Appointment Information
        appointment_type: '',
        specialist_type: 'Doctor',
        specialist_id: '',
        appointment_date: '',
        appointment_time: '',
        duration: '30 min',
        price: '',
        additional_info: '',
        
        // Existing patient option
        existing_patient_id: null,
        is_existing_patient: false
    });
    
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
    const [submitMessage, setSubmitMessage] = useState('');
    const [existingPatients, setExistingPatients] = useState([]);
    const [isLoadingPatients, setIsLoadingPatients] = useState(false);
    const [specialists, setSpecialists] = useState([]);
    const [isLoadingSpecialists, setIsLoadingSpecialists] = useState(false);
    
    // Load specialists and existing patients
    useEffect(() => {
        loadSpecialists();
        if (formData.mobile_no && formData.mobile_no.length >= 10) {
            loadExistingPatients();
        }
    }, [formData.mobile_no]);
    
    const loadSpecialists = async () => {
        setIsLoadingSpecialists(true);
        try {
            const response = await fetch('/patient/staff');
            const data = await response.json();
            if (data.success) {
                setSpecialists(data.data || []);
            }
        } catch (error) {
            console.error('Error loading specialists:', error);
        } finally {
            setIsLoadingSpecialists(false);
        }
    };
    
    const loadExistingPatients = async () => {
        setIsLoadingPatients(true);
        try {
            const response = await fetch(`/api/patient/appointments?mobile_no=${formData.mobile_no}`);
            const data = await response.json();
            if (data.success) {
                setExistingPatients(data.data || []);
            }
        } catch (error) {
            console.error('Error loading existing patients:', error);
        } finally {
            setIsLoadingPatients(false);
        }
    };
    
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };
    
    const handleExistingPatientSelect = (patient) => {
        setFormData(prev => ({
            ...prev,
            existing_patient_id: patient.patient_id,
            is_existing_patient: true,
            last_name: patient.last_name,
            first_name: patient.first_name,
            middle_name: patient.middle_name,
            birthdate: patient.birthdate,
            age: patient.age,
            sex: patient.sex,
            nationality: patient.nationality,
            civil_status: patient.civil_status,
            address: patient.address,
            telephone_no: patient.telephone_no,
            mobile_no: patient.mobile_no,
            emergency_name: patient.emergency_name,
            emergency_relation: patient.emergency_relation,
            insurance_company: patient.insurance_company,
            hmo_name: patient.hmo_name,
            hmo_id_no: patient.hmo_id_no,
            approval_code: patient.approval_code,
            validity: patient.validity,
            drug_allergies: patient.drug_allergies,
            past_medical_history: patient.past_medical_history,
            family_history: patient.family_history,
            social_history: patient.social_history,
            obgyn_history: patient.obgyn_history
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);
        setSubmitMessage('');
        setErrors({});
        
        try {
            const response = await fetch('/patient/online-appointment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                setSubmitStatus('success');
                setSubmitMessage(`Appointment request submitted successfully! Reference: ${data.data.appointment_code}`);
                
                // Reset form
                setFormData({
                    last_name: '',
                    first_name: '',
                    middle_name: '',
                    birthdate: '',
                    age: '',
                    sex: '',
                    nationality: 'Filipino',
                    civil_status: '',
                    address: '',
                    telephone_no: '',
                    mobile_no: '',
                    emergency_name: '',
                    emergency_relation: '',
                    insurance_company: '',
                    hmo_name: '',
                    hmo_id_no: '',
                    approval_code: '',
                    validity: '',
                    drug_allergies: 'NONE',
                    past_medical_history: '',
                    family_history: '',
                    social_history: '',
                    obgyn_history: '',
                    appointment_type: '',
                    specialist_type: 'Doctor',
                    appointment_date: '',
                    appointment_time: '',
                    duration: '30 min',
                    price: '',
                    additional_info: '',
                    existing_patient_id: null,
                    is_existing_patient: false
                });
                setExistingPatients([]);
            } else {
                setSubmitStatus('error');
                setSubmitMessage(data.message || 'Failed to submit appointment request');
                
                if (data.errors) {
                    setErrors(data.errors);
                }
            }
        } catch (error) {
            console.error('Submission error:', error);
            setSubmitStatus('error');
            setSubmitMessage('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <Head title="Online Appointment Booking" />
            
            <div className="container mx-auto px-4 max-w-4xl">
                <Card className="shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <CardTitle className="text-2xl font-bold flex items-center">
                            <Calendar className="mr-3" />
                            Online Appointment Booking
                        </CardTitle>
                        <p className="text-blue-100 mt-2">
                            Fill out the form below to request an appointment. We'll review your request and confirm the appointment.
                        </p>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                        {/* Status Messages */}
                        {submitStatus && (
                            <Alert className={`mb-6 ${submitStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                {submitStatus === 'success' ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                )}
                                <AlertDescription className={submitStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
                                    {submitMessage}
                                </AlertDescription>
                            </Alert>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Existing Patient Selection */}
                            {existingPatients.length > 0 && !formData.is_existing_patient && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-yellow-800 mb-3">Existing Patients Found</h3>
                                    <div className="space-y-2">
                                        {existingPatients.map((patient) => (
                                            <button
                                                key={patient.patient_id}
                                                type="button"
                                                onClick={() => handleExistingPatientSelect(patient)}
                                                className="w-full text-left p-3 bg-white border border-yellow-300 rounded-lg hover:bg-yellow-50 transition-colors"
                                            >
                                                <div className="font-medium">{patient.first_name} {patient.last_name}</div>
                                                <div className="text-sm text-gray-600">ID: {patient.patient_code} | Mobile: {patient.mobile_no}</div>
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, is_existing_patient: false }))}
                                        className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        Create new patient instead
                                    </button>
                                </div>
                            )}
                            
                            {/* Patient Information */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <User className="mr-2" />
                                    Patient Information
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="last_name">Last Name *</Label>
                                        <Input
                                            id="last_name"
                                            value={formData.last_name}
                                            onChange={(e) => handleInputChange('last_name', e.target.value)}
                                            className={errors.last_name ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name[0]}</p>}
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="first_name">First Name *</Label>
                                        <Input
                                            id="first_name"
                                            value={formData.first_name}
                                            onChange={(e) => handleInputChange('first_name', e.target.value)}
                                            className={errors.first_name ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name[0]}</p>}
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="middle_name">Middle Name</Label>
                                        <Input
                                            id="middle_name"
                                            value={formData.middle_name}
                                            onChange={(e) => handleInputChange('middle_name', e.target.value)}
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <Label htmlFor="birthdate">Birthdate</Label>
                                        <Input
                                            id="birthdate"
                                            type="date"
                                            value={formData.birthdate}
                                            onChange={(e) => handleInputChange('birthdate', e.target.value)}
                                        />
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="age">Age</Label>
                                        <Input
                                            id="age"
                                            type="number"
                                            value={formData.age}
                                            onChange={(e) => handleInputChange('age', e.target.value)}
                                        />
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="sex">Sex</Label>
                                        <Select value={formData.sex} onValueChange={(value) => handleInputChange('sex', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select sex" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="civil_status">Civil Status</Label>
                                        <Select value={formData.civil_status} onValueChange={(value) => handleInputChange('civil_status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Single">Single</SelectItem>
                                                <SelectItem value="Married">Married</SelectItem>
                                                <SelectItem value="Widowed">Widowed</SelectItem>
                                                <SelectItem value="Divorced">Divorced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                
                                <div>
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        rows={2}
                                    />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="telephone_no">Telephone Number</Label>
                                        <Input
                                            id="telephone_no"
                                            value={formData.telephone_no}
                                            onChange={(e) => handleInputChange('telephone_no', e.target.value)}
                                        />
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="mobile_no">Mobile Number *</Label>
                                        <Input
                                            id="mobile_no"
                                            value={formData.mobile_no}
                                            onChange={(e) => handleInputChange('mobile_no', e.target.value)}
                                            className={errors.mobile_no ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.mobile_no && <p className="text-red-500 text-sm mt-1">{errors.mobile_no[0]}</p>}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Appointment Information */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <Calendar className="mr-2" />
                                    Appointment Information
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="appointment_type">Appointment Type *</Label>
                                        <Input
                                            id="appointment_type"
                                            value={formData.appointment_type}
                                            onChange={(e) => handleInputChange('appointment_type', e.target.value)}
                                            className={errors.appointment_type ? 'border-red-500' : ''}
                                            placeholder="e.g., General Consultation, CBC, etc."
                                            required
                                        />
                                        {errors.appointment_type && <p className="text-red-500 text-sm mt-1">{errors.appointment_type[0]}</p>}
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="specialist_type">Specialist Type *</Label>
                                        <Select value={formData.specialist_type} onValueChange={(value) => {
                                            handleInputChange('specialist_type', value);
                                            handleInputChange('specialist_id', ''); // Clear specialist selection when type changes
                                        }}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Doctor">Doctor</SelectItem>
                                                <SelectItem value="MedTech">Medical Technologist</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="specialist_id">Select Specialist *</Label>
                                        <Select 
                                            value={formData.specialist_id} 
                                            onValueChange={(value) => handleInputChange('specialist_id', value)}
                                            disabled={isLoadingSpecialists}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={isLoadingSpecialists ? "Loading specialists..." : "Choose a specialist"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {specialists
                                                    .filter(specialist => specialist.role === formData.specialist_type)
                                                    .map((specialist) => (
                                                        <SelectItem key={specialist.staff_id} value={specialist.staff_id.toString()}>
                                                            {specialist.name} - {specialist.specialization || 'General'}
                                                        </SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                        {errors.specialist_id && <p className="text-red-500 text-sm mt-1">{errors.specialist_id[0]}</p>}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="appointment_date">Preferred Date *</Label>
                                        <Input
                                            id="appointment_date"
                                            type="date"
                                            value={formData.appointment_date}
                                            onChange={(e) => handleInputChange('appointment_date', e.target.value)}
                                            className={errors.appointment_date ? 'border-red-500' : ''}
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                        {errors.appointment_date && <p className="text-red-500 text-sm mt-1">{errors.appointment_date[0]}</p>}
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="appointment_time">Preferred Time *</Label>
                                        <Input
                                            id="appointment_time"
                                            type="time"
                                            value={formData.appointment_time}
                                            onChange={(e) => handleInputChange('appointment_time', e.target.value)}
                                            className={errors.appointment_time ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.appointment_time && <p className="text-red-500 text-sm mt-1">{errors.appointment_time[0]}</p>}
                                    </div>
                                </div>
                                
                                <div>
                                    <Label htmlFor="additional_info">Additional Information</Label>
                                    <Textarea
                                        id="additional_info"
                                        value={formData.additional_info}
                                        onChange={(e) => handleInputChange('additional_info', e.target.value)}
                                        rows={3}
                                        placeholder="Any special requirements or notes..."
                                    />
                                </div>
                            </div>
                            
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
                                    disabled={isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Calendar className="mr-2 h-4 w-4" />
                                            Submit Appointment Request
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

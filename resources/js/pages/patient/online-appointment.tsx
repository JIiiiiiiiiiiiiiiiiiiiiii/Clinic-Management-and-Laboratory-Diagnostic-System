import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PatientPageLayout, PatientActionButton, PatientFormSection, PatientInfoCard } from '@/components/patient/PatientPageLayout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CreatePatientItem } from '@/types/patients';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    Save, User, Calendar, Phone, MapPin, Heart, Shield, FileText, Activity, 
    Stethoscope, Plus, CheckCircle, AlertCircle, 
    Building, CreditCard, History, Users, Clock, Mail, 
    GraduationCap, Home, Briefcase, Globe, UserCheck, Zap,
    ChevronRight, ChevronLeft, Star, Award, Sparkles, Target,
    ArrowRight, ArrowLeft, UserPlus, ClipboardList, FileText as FileTextIcon,
    TrendingUp, BarChart3, PieChart, LineChart, CalendarDays, Clock3,
    Bell, BellRing, CheckCircle2, XCircle, Info, AlertTriangle
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patient Portal',
        href: '/patient/dashboard',
    },
    {
        title: 'Online Appointment',
        href: '/patient/online-appointment',
    },
];

type Doctor = { 
    id: number; 
    name: string; 
    specialization: string; 
    employee_id: string;
    availability: string;
    rating: number;
    experience: string;
    nextAvailable: string;
};

type Medtech = { 
    id: number; 
    name: string; 
    specialization: string; 
    employee_id: string;
    availability: string;
    rating: number;
    experience: string;
    nextAvailable: string;
};

interface OnlineAppointmentProps {
    user: any;
    patient?: any;
    doctors: Doctor[];
    medtechs: Medtech[];
    appointmentTypes: Record<string, string>;
    isExistingPatient?: boolean;
}

export default function OnlineAppointment({ 
    user, 
    patient,
    doctors = [], 
    medtechs = [], 
    appointmentTypes = {},
    isExistingPatient = false
}: OnlineAppointmentProps) {
    const page = usePage();
    const flash = (page.props as any).flash || {};
    const duplicate = flash?.duplicate_patient as
        | { id: number; patient_no?: string; last_name: string; first_name: string; birthdate?: string; mobile_no?: string }
        | undefined;

    const { data, setData, processing, errors, reset, post } = useForm<CreatePatientItem & { 
        force_create?: boolean;
        // Appointment fields
        appointment_type: string;
        specialist_type: 'doctor' | 'medtech';
        specialist_id: string;
        appointment_date: string;
        appointment_time: string;
        notes: string;
        special_requirements: string;
    }>({
        // Patient Identification
        last_name: '',
        first_name: '',
        middle_name: '',
        birthdate: '',
        age: 0,
        sex: 'male',

        // Demographics
        occupation: '',
        religion: '',
        civil_status: 'single',
        nationality: 'Filipino',

        // Contact Information
        present_address: '',
        telephone_no: '',
        mobile_no: '',

        // Emergency Contact
        informant_name: '',
        relationship: '',

        // Financial/Insurance
        company_name: '',
        hmo_name: '',
        hmo_company_id_no: '',
        validation_approval_code: '',
        validity: '',

        // Medical History & Allergies
        drug_allergies: 'NONE',
        food_allergies: 'NONE',
        past_medical_history: '',
        family_history: '',
        social_personal_history: '',
        obstetrics_gynecology_history: '',
        force_create: false,

        // Appointment fields
        appointment_type: '',
        specialist_type: 'doctor',
        specialist_id: '',
        appointment_date: '',
        appointment_time: '',
        notes: '',
        special_requirements: '',
    });

    const [showMissingModal, setShowMissingModal] = useState(false);
    const [missingFields, setMissingFields] = useState<string[]>([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedSpecialist, setSelectedSpecialist] = useState<Doctor | Medtech | null>(null);
    const [availableTimes, setAvailableTimes] = useState<Array<{value: string, label: string}>>([]);
    const [appointmentPrice, setAppointmentPrice] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const totalSteps = 6; // 5 patient steps + 1 appointment step

    // Compute age from birthdate
    const onBirthdateChange = (value: string) => {
        setData('birthdate', value);
        if (value) {
            const today = new Date();
            const b = new Date(value);
            let age = today.getFullYear() - b.getFullYear();
            const m = today.getMonth() - b.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
            setData('age', Math.max(0, age));
        } else {
            setData('age', 0);
        }
    };

    // Price calculation based on appointment type
    const calculatePrice = (type: string) => {
        const prices: Record<string, number> = {
            'general_consultation': 300,
            'consultation': 300,
            'checkup': 300,
            'fecalysis': 500,
            'fecalysis_test': 500,
            'cbc': 500,
            'urinalysis': 500,
            'urinarysis_test': 500,
            'x-ray': 700,
            'ultrasound': 800,
        };
        return prices[type] || 300;
    };

    // Update price and specialist type when appointment type changes
    useEffect(() => {
        if (data.appointment_type) {
            setAppointmentPrice(calculatePrice(data.appointment_type));
            
            // Automatically set specialist type based on appointment type
            if (data.appointment_type === 'general_consultation') {
                setData('specialist_type', 'doctor');
            } else if (['fecalysis', 'fecalysis_test', 'cbc', 'urinalysis', 'urinarysis_test', 'x-ray', 'ultrasound'].includes(data.appointment_type)) {
                setData('specialist_type', 'medtech');
            }
            
            // Clear specialist selection when type changes
            setData('specialist_id', '');
            setSelectedSpecialist(null);
        }
    }, [data.appointment_type]);

    // Pre-fill form data for existing patients
    useEffect(() => {
        if (isExistingPatient && patient) {
            setData({
                ...data,
                last_name: patient.last_name || '',
                first_name: patient.first_name || '',
                middle_name: patient.middle_name || '',
                birthdate: patient.birthdate ? new Date(patient.birthdate).toISOString().split('T')[0] : '',
                age: patient.age || 0,
                sex: patient.sex || 'male',
                occupation: patient.occupation || '',
                religion: patient.religion || '',
                civil_status: patient.civil_status || 'single',
                nationality: patient.nationality || 'Filipino',
                present_address: patient.present_address || '',
                telephone_no: patient.telephone_no || '',
                mobile_no: patient.mobile_no || '',
                informant_name: patient.informant_name || '',
                relationship: patient.relationship || '',
                company_name: patient.company_name || '',
                hmo_name: patient.hmo_name || '',
                hmo_company_id_no: patient.hmo_company_id_no || '',
                validation_approval_code: patient.validation_approval_code || '',
                validity: patient.validity || '',
                drug_allergies: patient.drug_allergies || 'NONE',
                food_allergies: patient.food_allergies || 'NONE',
                past_medical_history: patient.past_medical_history || '',
                family_history: patient.family_history || '',
                social_personal_history: patient.social_personal_history || '',
                obstetrics_gynecology_history: patient.obstetrics_gynecology_history || '',
            });
        }
    }, [isExistingPatient, patient]);

    // Generate available time slots
    useEffect(() => {
        if (data.appointment_date && data.specialist_id) {
            generateTimeSlots();
        }
    }, [data.appointment_date, data.specialist_id]);

    const generateTimeSlots = () => {
        const slots = [];
        const startHour = 8;
        const endHour = 17;
        
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = new Date();
                time.setHours(hour, minute, 0, 0);
                const timeString = time.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit', 
                    hour12: true 
                });
                slots.push({
                    value: timeString,
                    label: timeString
                });
            }
        }
        setAvailableTimes(slots);
    };

    const submit: React.FormEventHandler = (e) => {
        e.preventDefault();
        
        // For new patients, only validate and submit on the final step
        if (!isExistingPatient && currentStep < totalSteps) {
            nextStep();
            return;
        }

        // On the final step, call handleFinalSubmit
        if (currentStep === totalSteps) {
            handleFinalSubmit(e);
        }
    };

    const proceedDuplicate = () => {
        setData('force_create', true as any);
        post(route('patient.online.appointment.force'), { preserveScroll: true, preserveState: true });
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleFinalSubmit = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }
        
        // Prevent multiple submissions
        if (isProcessing) {
            return;
        }
        
        // Validate appointment fields
        const requiredChecks = [
            { key: 'appointment_type', label: 'Appointment Type', isValid: (v: any) => Boolean(v) },
            { key: 'specialist_type', label: 'Specialist Type', isValid: (v: any) => Boolean(v) },
            { key: 'specialist_id', label: 'Specialist', isValid: (v: any) => Boolean(v) },
            { key: 'appointment_date', label: 'Appointment Date', isValid: (v: any) => Boolean(v) },
            { key: 'appointment_time', label: 'Appointment Time', isValid: (v: any) => Boolean(v) },
        ];

        const missing = requiredChecks.filter((c) => !c.isValid((data as any)[c.key]));
        if (missing.length > 0) {
            console.log('Missing fields:', missing);
            setMissingFields(missing.map((m) => m.label));
            setShowMissingModal(true);
            return;
        }

        // For new patients, also validate required patient fields
        if (!isExistingPatient) {
            const patientRequiredChecks = [
                { key: 'last_name', label: 'Last Name', isValid: (v: any) => Boolean(v) },
                { key: 'first_name', label: 'First Name', isValid: (v: any) => Boolean(v) },
                { key: 'birthdate', label: 'Birthdate', isValid: (v: any) => Boolean(v) },
                { key: 'age', label: 'Age', isValid: (v: any) => Number(v) > 0 },
                { key: 'sex', label: 'Sex', isValid: (v: any) => Boolean(v) },
                { key: 'civil_status', label: 'Civil Status', isValid: (v: any) => Boolean(v) },
                { key: 'present_address', label: 'Present Address', isValid: (v: any) => Boolean(v) },
                { key: 'mobile_no', label: 'Mobile No.', isValid: (v: any) => Boolean(v) },
                { key: 'informant_name', label: 'Informant Name', isValid: (v: any) => Boolean(v) },
                { key: 'relationship', label: 'Relationship', isValid: (v: any) => Boolean(v) },
            ];

            const patientMissing = patientRequiredChecks.filter((c) => !c.isValid((data as any)[c.key]));
            if (patientMissing.length > 0) {
                setMissingFields(patientMissing.map((m) => m.label));
                setShowMissingModal(true);
                return;
            }
        }

        // Prepare request body for new API
        const requestBody = {
            existingPatientId: isExistingPatient && patient ? patient.id : 0,
            patient: !isExistingPatient ? {
                last_name: data.last_name,
                first_name: data.first_name,
                middle_name: data.middle_name,
                birthdate: data.birthdate,
                age: data.age,
                sex: data.sex,
                nationality: data.nationality,
                civil_status: data.civil_status,
                address: data.present_address,
                telephone_no: data.telephone_no,
                mobile_no: data.mobile_no,
                email: data.email_address,
                emergency_name: data.informant_name,
                emergency_relation: data.relationship,
                insurance_company: data.insurance_company,
                hmo_name: data.hmo_name,
                hmo_id_no: data.hmo_id_no,
                approval_code: data.approval_code,
                validity: data.validity,
                drug_allergies: data.drug_allergies,
                past_medical_history: data.past_medical_history,
                family_history: data.family_history,
                social_history: data.social_history,
                obgyn_history: data.obgyn_history,
            } : undefined,
            appointment: {
                appointment_type: data.appointment_type,
                specialist_type: data.specialist_type === 'doctor' ? 'Doctor' : 'MedTech',
                specialist_id: parseInt(data.specialist_id),
                date: data.appointment_date,
                time: data.appointment_time,
                duration: '30 min',
                price: appointmentPrice,
                additional_info: `${data.notes || ''}${data.special_requirements ? '\nSpecial Requirements: ' + data.special_requirements : ''}`.trim(),
            },
        };

        try {
            setIsProcessing(true);
            
            const response = await fetch('/api/appointments/online', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(requestBody),
            });

            const result = await response.json();

            if (result.success) {
                // Show success message
                alert(`✅ Appointment Created Successfully!\n\nPatient Code: ${result.patient_code}\nAppointment Code: ${result.appointment_code}\n\nYour appointment request has been sent to admin for approval. You will be notified once it's confirmed.`);
                
                // Redirect to appointments page
                window.location.href = '/patient/appointments';
            } else {
                // Show error message
                const errorMsg = result.message || result.error || 'Failed to create appointment';
                const errors = result.errors ? '\n\n' + Object.values(result.errors).flat().join('\n') : '';
                alert('❌ Error: ' + errorMsg + errors);
                setIsProcessing(false);
            }
        } catch (error) {
            console.error('Error creating appointment:', error);
            alert('❌ Failed to create appointment. Please check your internet connection and try again.');
            setIsProcessing(false);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const getStepTitle = (step: number) => {
        switch (step) {
            case 1: return 'Personal Information';
            case 2: return 'Contact Details';
            case 3: return 'Emergency Contact';
            case 4: return 'Insurance & Financial';
            case 5: return 'Medical History';
            case 6: return 'Appointment Booking';
            default: return '';
        }
    };

    const getStepIcon = (step: number) => {
        switch (step) {
            case 1: return <User className="h-5 w-5" />;
            case 2: return <Phone className="h-5 w-5" />;
            case 3: return <Heart className="h-5 w-5" />;
            case 4: return <CreditCard className="h-5 w-5" />;
            case 5: return <Activity className="h-5 w-5" />;
            case 6: return <CalendarDays className="h-5 w-5" />;
            default: return <User className="h-5 w-5" />;
        }
    };

    const handleSpecialistChange = (specialistId: string) => {
        setData('specialist_id', specialistId);
        const specialist = [...doctors, ...medtechs].find(s => s.id.toString() === specialistId);
        setSelectedSpecialist(specialist || null);
    };

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        return maxDate.toISOString().split('T')[0];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Online Appointment" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="@container/main flex flex-1 flex-col gap-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-4xl font-bold text-black">
                                    {isExistingPatient ? 'Book New Appointment' : 'Online Appointment'}
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    {isExistingPatient 
                                        ? 'You are already registered. Book your appointment below.'
                                        : 'Complete your registration and submit an appointment request for admin approval'
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                asChild
                                className="hover:bg-gray-50"
                            >
                                <Link href="/patient/dashboard">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Dashboard
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Progress Stepper */}
                    <Card className="holographic-card shadow-lg overflow-hidden rounded-xl bg-white/70 backdrop-blur-md border border-white/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <Activity className="h-5 w-5 text-black" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-900">Online Appointment Progress</CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">Step {currentStep} of {totalSteps} • {getStepTitle(currentStep)}</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-gray-50 text-black border-gray-200">
                                    {(() => {
                                        if (currentStep === totalSteps && (!data.appointment_type || !data.specialist_type || !data.specialist_id || !data.appointment_date || !data.appointment_time)) {
                                            return '83% Complete';
                                        }
                                        return `${Math.round((currentStep / totalSteps) * 100)}% Complete`;
                                    })()}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                                    <div key={step} className="flex items-center">
                                        <div className={`
                                            flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                                            ${step <= currentStep 
                                                ? 'bg-gray-600 border-gray-600 text-white' 
                                                : 'bg-white border-gray-300 text-gray-400'
                                            }
                                        `}>
                                            {step < currentStep ? (
                                                <CheckCircle className="h-5 w-5" />
                                            ) : (
                                                <span className="text-sm font-semibold">{step}</span>
                                            )}
                                        </div>
                                        {step < totalSteps && (
                                            <div className={`
                                                w-16 h-1 mx-2 transition-all duration-300
                                                ${step < currentStep ? 'bg-gray-600' : 'bg-gray-300'}
                                            `} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error alert / Duplicate confirmation */}
                    {duplicate ? (
                        <div className="rounded-md border border-gray-300 bg-gray-50 p-4 text-sm text-black">
                            <div className="mb-2 font-medium">Possible duplicate found</div>
                            <div>
                                {duplicate.last_name}, {duplicate.first_name}
                                {duplicate.birthdate ? ` • ${duplicate.birthdate}` : ''}
                                {duplicate.mobile_no ? ` • ${duplicate.mobile_no}` : ''}
                                {duplicate.patient_no ? ` • Patient No: ${duplicate.patient_no}` : ''}
                            </div>
                            <div className="mt-3 flex gap-2">
                                <Button variant="secondary" asChild>
                                    <Link href={`/admin/patient/${duplicate.id}`}>View Existing</Link>
                                </Button>
                                <Button variant="destructive" onClick={proceedDuplicate}>
                                    Create Anyway
                                </Button>
                            </div>
                        </div>
                    ) : (
                        (flash?.error as string | undefined) && (
                            <div className="rounded-md border border-gray-300 bg-gray-50 p-4 text-sm text-black">{String(flash?.error as string)}</div>
                        )
                    )}

                    {/* Information Card about the Process */}
                    {!isExistingPatient && (
                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <BellRing className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-blue-900 mb-2">How the Online Appointment Process Works</h3>
                                        <div className="text-blue-800 text-sm space-y-2">
                                            <p>1. <strong>Complete Registration:</strong> Fill out all your personal and medical information</p>
                                            <p>2. <strong>Book Appointment:</strong> Select your preferred specialist, date, and time</p>
                                            <p>3. <strong>Admin Review:</strong> Your appointment request will be sent to our admin team for approval</p>
                                            <p>4. <strong>Notification:</strong> You'll receive a notification once your appointment is approved or if any changes are needed</p>
                                            <p className="font-medium text-blue-900 mt-2">⏰ Typical approval time: 1-2 business hours</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Required fields missing modal */}
                    <AlertDialog open={showMissingModal} onOpenChange={setShowMissingModal}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Missing required information</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Please complete the following required field(s):
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <ul className="list-disc pl-6 text-sm">
                                {missingFields.map((f) => (
                                    <li key={f}>{f}</li>
                                ))}
                            </ul>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Close</AlertDialogCancel>
                                <AlertDialogAction onClick={() => setShowMissingModal(false)}>OK</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Success Modal */}
                    <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    Appointment Request Submitted Successfully!
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    {isExistingPatient 
                                        ? 'Your appointment request has been submitted and is pending admin approval. You will receive a notification once it\'s approved.'
                                        : 'Your registration and appointment request has been submitted and is pending admin approval. You will receive a notification once it\'s approved.'
                                    }
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div className="flex items-start gap-3">
                                    <Bell className="h-5 w-5 text-green-600 mt-0.5" />
                                    <div className="text-green-800 text-sm">
                                        <p className="font-medium mb-1">What happens next?</p>
                                        <ul className="space-y-1">
                                            <li>• Admin will review your request within 1-2 business hours</li>
                                            <li>• You'll receive a notification when approved</li>
                                            <li>• Check your appointments in the sidebar for updates</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogAction onClick={() => window.location.href = route('patient.dashboard')}>
                                    Go to Dashboard
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Step 1: Personal Information */}
                        {currentStep === 1 && (
                            <PatientInfoCard
                                title="Personal Information"
                                icon={getStepIcon(1)}
                            >
                                <div className="space-y-6">
                                    {/* Name Section */}
                                    <div className="space-y-3">
                                        <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-1">Full Name</h3>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="last_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    Last Name *
                                                </Label>
                                                <Input
                                                    id="last_name"
                                                    name="last_name"
                                                    autoComplete="family-name"
                                                    value={data.last_name}
                                                    onChange={(e) => setData('last_name', e.target.value)}
                                                    className={`h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.last_name ? 'border-gray-500' : ''}`}
                                                    placeholder="Enter last name"
                                                />
                                                {errors.last_name && <p className="text-sm text-black">{errors.last_name}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="first_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    First Name *
                                                </Label>
                                                <Input
                                                    id="first_name"
                                                    name="first_name"
                                                    autoComplete="given-name"
                                                    value={data.first_name}
                                                    onChange={(e) => setData('first_name', e.target.value)}
                                                    className={`h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.first_name ? 'border-gray-500' : ''}`}
                                                    placeholder="Enter first name"
                                                />
                                                {errors.first_name && <p className="text-sm text-black">{errors.first_name}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="middle_name" className="text-sm font-semibold text-gray-700">Middle Name</Label>
                                                <Input
                                                    id="middle_name"
                                                    name="middle_name"
                                                    autoComplete="additional-name"
                                                    value={data.middle_name}
                                                    onChange={(e) => setData('middle_name', e.target.value)}
                                                    className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                                    placeholder="Enter middle name"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Personal Details Section */}
                                    <div className="space-y-3">
                                        <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-1">Personal Details</h3>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-700" />
                                                    <span className="text-sm font-semibold text-gray-700">Birthdate *</span>
                                                </div>
                                                <Input
                                                    type="date"
                                                    value={data.birthdate}
                                                    onChange={(e) => onBirthdateChange(e.target.value)}
                                                    className={`w-full ${errors.birthdate ? 'border-red-500' : ''}`}
                                                />
                                                {errors.birthdate && <p className="text-sm text-black">{errors.birthdate}</p>}
                                            </div>
                                            <div className="space-y-2 flex flex-col w-full">
                                                <Label htmlFor="age" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Heart className="h-4 w-4" />
                                                    Age *
                                                </Label>
                                                <Input
                                                    id="age"
                                                    name="age"
                                                    type="number"
                                                    value={data.age}
                                                    onChange={(e) => setData('age', Number(e.target.value))}
                                                    className={`w-full h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.age ? 'border-gray-500' : ''}`}
                                                    placeholder="Enter age"
                                                    style={{ width: '100%', minWidth: '0' }}
                                                />
                                                {errors.age && <p className="text-sm text-black">{errors.age}</p>}
                                            </div>
                                            <div className="space-y-2 flex flex-col w-full">
                                                <Label htmlFor="sex" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Heart className="h-4 w-4" />
                                                    Sex *
                                                </Label>
                                                <Select onValueChange={(value: 'male' | 'female') => setData('sex', value)} defaultValue={data.sex}>
                                                    <SelectTrigger id="sex" className={`w-full h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.sex ? 'border-gray-500' : ''}`} style={{ width: '100%', minWidth: '0' }}>
                                                        <SelectValue placeholder="Select sex" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.sex && <p className="text-sm text-black">{errors.sex}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Demographics Section */}
                                    <div className="space-y-3">
                                        <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-1">Demographics</h3>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="nationality" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Globe className="h-4 w-4" />
                                                    Nationality
                                                </Label>
                                                <Input
                                                    id="nationality"
                                                    name="nationality"
                                                    autoComplete="country-name"
                                                    value={data.nationality}
                                                    onChange={(e) => setData('nationality', e.target.value)}
                                                    className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                                    placeholder="Enter nationality"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="civil_status" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Heart className="h-4 w-4" />
                                                    Civil Status *
                                                </Label>
                                                <Select onValueChange={(value: 'single' | 'married' | 'widowed' | 'divorced' | 'separated') => setData('civil_status', value)} defaultValue={data.civil_status}>
                                                    <SelectTrigger id="civil_status" className={`w-full h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.civil_status ? 'border-gray-500' : ''}`}>
                                                        <SelectValue placeholder="Select civil status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="single">Single</SelectItem>
                                                        <SelectItem value="married">Married</SelectItem>
                                                        <SelectItem value="widowed">Widowed</SelectItem>
                                                        <SelectItem value="divorced">Divorced</SelectItem>
                                                        <SelectItem value="separated">Separated</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.civil_status && <p className="text-sm text-black">{errors.civil_status}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </PatientInfoCard>
                        )}

                        {/* Step 2: Contact Details */}
                        {currentStep === 2 && (
                            <PatientInfoCard
                                title="Contact Details"
                                icon={getStepIcon(2)}
                            >
                                <div className="space-y-6">
                                    {/* Address Section */}
                                    <div className="space-y-3">
                                        <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-1">Address Information</h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="present_address" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Present Address *
                                            </Label>
                                            <Textarea
                                                id="present_address"
                                                name="present_address"
                                                autoComplete="street-address"
                                                value={data.present_address}
                                                onChange={(e) => setData('present_address', e.target.value)}
                                                placeholder="Enter complete address"
                                                className={`min-h-[100px] border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.present_address ? 'border-gray-500' : ''}`}
                                            />
                                            {errors.present_address && <p className="text-sm text-black">{errors.present_address}</p>}
                                        </div>
                                    </div>

                                    {/* Contact Numbers Section */}
                                    <div className="space-y-3">
                                        <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-1">Contact Numbers</h3>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="telephone_no" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Phone className="h-4 w-4" />
                                                    Telephone No.
                                                </Label>
                                                <Input
                                                    id="telephone_no"
                                                    name="telephone_no"
                                                    autoComplete="tel"
                                                    value={data.telephone_no}
                                                    onChange={(e) => setData('telephone_no', e.target.value)}
                                                    className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                                    placeholder="Enter telephone number"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="mobile_no" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Phone className="h-4 w-4" />
                                                    Mobile No. *
                                                </Label>
                                                <Input
                                                    id="mobile_no"
                                                    name="mobile_no"
                                                    autoComplete="tel"
                                                    value={data.mobile_no}
                                                    onChange={(e) => setData('mobile_no', e.target.value)}
                                                    className={`h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.mobile_no ? 'border-gray-500' : ''}`}
                                                    placeholder="Enter mobile number"
                                                />
                                                {errors.mobile_no && <p className="text-sm text-black">{errors.mobile_no}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </PatientInfoCard>
                        )}

                        {/* Step 3: Emergency Contact */}
                        {currentStep === 3 && (
                            <PatientInfoCard
                                title="Emergency Contact"
                                icon={getStepIcon(3)}
                            >
                                <div className="space-y-6">
                                    {/* Emergency Contact Information */}
                                    <div className="space-y-3">
                                        <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-1">Emergency Contact Information</h3>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="informant_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <UserCheck className="h-4 w-4" />
                                                    Informant Name *
                                                </Label>
                                                <Input
                                                    id="informant_name"
                                                    value={data.informant_name}
                                                    onChange={(e) => setData('informant_name', e.target.value)}
                                                    className={`h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.informant_name ? 'border-gray-500' : ''}`}
                                                    placeholder="Enter informant name"
                                                />
                                                {errors.informant_name && <p className="text-sm text-black">{errors.informant_name}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="relationship" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Heart className="h-4 w-4" />
                                                    Relationship *
                                                </Label>
                                                <Input
                                                    id="relationship"
                                                    value={data.relationship}
                                                    onChange={(e) => setData('relationship', e.target.value)}
                                                    className={`h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.relationship ? 'border-gray-500' : ''}`}
                                                    placeholder="Enter relationship"
                                                />
                                                {errors.relationship && <p className="text-sm text-black">{errors.relationship}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </PatientInfoCard>
                        )}

                        {/* Step 4: Insurance & Financial */}
                        {currentStep === 4 && (
                            <PatientInfoCard
                                title="Insurance & Financial"
                                icon={getStepIcon(4)}
                            >
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <Label htmlFor="company_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            Company Name
                                        </Label>
                                        <Input
                                            id="company_name"
                                            name="company_name"
                                            value={data.company_name}
                                            onChange={(e) => setData('company_name', e.target.value)}
                                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                            placeholder="Enter company name"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="hmo_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            HMO Name
                                        </Label>
                                        <Input
                                            id="hmo_name"
                                            name="hmo_name"
                                            value={data.hmo_name}
                                            onChange={(e) => setData('hmo_name', e.target.value)}
                                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                            placeholder="Enter HMO name"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 grid gap-6 md:grid-cols-3">
                                    <div className="space-y-3">
                                        <Label htmlFor="hmo_company_id_no" className="text-sm font-semibold text-gray-700">HMO/Company ID No.</Label>
                                        <Input
                                            id="hmo_company_id_no"
                                            name="hmo_company_id_no"
                                            value={data.hmo_company_id_no}
                                            onChange={(e) => setData('hmo_company_id_no', e.target.value)}
                                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                            placeholder="Enter ID number"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="validation_approval_code" className="text-sm font-semibold text-gray-700">Validation/Approval Code</Label>
                                        <Input
                                            id="validation_approval_code"
                                            name="validation_approval_code"
                                            value={data.validation_approval_code}
                                            onChange={(e) => setData('validation_approval_code', e.target.value)}
                                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                            placeholder="Enter approval code"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="validity" className="text-sm font-semibold text-gray-700">Validity</Label>
                                        <Input
                                            id="validity"
                                            name="validity"
                                            value={data.validity}
                                            onChange={(e) => setData('validity', e.target.value)}
                                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                            placeholder="Enter validity period"
                                        />
                                    </div>
                                </div>
                            </PatientInfoCard>
                        )}

                        {/* Step 5: Medical History */}
                        {currentStep === 5 && (
                            <PatientInfoCard
                                title="Medical History"
                                icon={getStepIcon(5)}
                            >
                                <div className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-3">
                                            <Label htmlFor="drug_allergies" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                Drug Allergies
                                            </Label>
                                            <Input
                                                id="drug_allergies"
                                                name="drug_allergies"
                                                value={data.drug_allergies}
                                                onChange={(e) => setData('drug_allergies', e.target.value)}
                                                className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                                placeholder="Enter allergies or NONE"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="food_allergies" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                Food Allergies
                                            </Label>
                                            <Input
                                                id="food_allergies"
                                                name="food_allergies"
                                                value={data.food_allergies}
                                                onChange={(e) => setData('food_allergies', e.target.value)}
                                                className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                                placeholder="Enter allergies or NONE"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="past_medical_history" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <History className="h-4 w-4" />
                                            Past Medical History
                                        </Label>
                                        <Textarea
                                            id="past_medical_history"
                                            name="past_medical_history"
                                            value={data.past_medical_history}
                                            onChange={(e) => setData('past_medical_history', e.target.value)}
                                            placeholder="Previous medical conditions, surgeries, hospitalizations"
                                            className="min-h-[100px] border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="family_history" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            Family History
                                        </Label>
                                        <Textarea
                                            id="family_history"
                                            name="family_history"
                                            value={data.family_history}
                                            onChange={(e) => setData('family_history', e.target.value)}
                                            placeholder="Family medical history, hereditary conditions"
                                            className="min-h-[100px] border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="social_personal_history" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Briefcase className="h-4 w-4" />
                                            Social/Personal History
                                        </Label>
                                        <Textarea
                                            id="social_personal_history"
                                            name="social_personal_history"
                                            value={data.social_personal_history}
                                            onChange={(e) => setData('social_personal_history', e.target.value)}
                                            placeholder="Lifestyle, habits, occupation, social factors"
                                            className="min-h-[100px] border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="obstetrics_gynecology_history" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Heart className="h-4 w-4" />
                                            Obstetrics & Gynecology History (Female Patients)
                                        </Label>
                                        <Textarea
                                            id="obstetrics_gynecology_history"
                                            name="obstetrics_gynecology_history"
                                            value={data.obstetrics_gynecology_history}
                                            onChange={(e) => setData('obstetrics_gynecology_history', e.target.value)}
                                            placeholder="Pregnancy history, menstrual history, gynecological conditions"
                                            className="min-h-[100px] border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                        />
                                    </div>
                                </div>
                            </PatientInfoCard>
                        )}

                        {/* Step 6: Appointment Booking */}
                        {currentStep === 6 && (
                            <PatientInfoCard
                                title="Appointment Booking"
                                icon={getStepIcon(6)}
                            >
                                <div className="space-y-6">
                                    {/* Appointment Type Selection */}
                                    <div className="space-y-3">
                                        <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-1">Appointment Type</h3>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="appointment_type" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Stethoscope className="h-4 w-4" />
                                                    Appointment Type *
                                                </Label>
                                                <Select onValueChange={(value) => setData('appointment_type', value)}>
                                                    <SelectTrigger id="appointment_type" className={`w-full h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.appointment_type ? 'border-gray-500' : ''}`}>
                                                        <SelectValue placeholder="Select appointment type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(appointmentTypes).map(([value, label]) => (
                                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.appointment_type && <p className="text-sm text-black">{errors.appointment_type}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="specialist_type" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    Specialist Type *
                                                </Label>
                                                <div className="w-full h-12 border border-gray-300 rounded-xl shadow-sm bg-gray-50 flex items-center px-3">
                                                    <span className="text-gray-700 font-medium">
                                                        {data.specialist_type === 'doctor' ? 'Doctor' : data.specialist_type === 'medtech' ? 'Medical Technologist' : 'Select appointment type first'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Specialist type is automatically determined based on your appointment selection
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Specialist Selection */}
                                    <div className="space-y-3">
                                        <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-1">Select Specialist</h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="specialist_id" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                {data.specialist_type === 'doctor' ? 'Doctor' : 'Medical Technologist'} *
                                            </Label>
                                            <Select onValueChange={handleSpecialistChange} disabled={!data.specialist_type}>
                                                <SelectTrigger id="specialist_id" className={`w-full h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.specialist_id ? 'border-gray-500' : ''} ${!data.specialist_type ? 'bg-gray-50' : ''}`}>
                                                    <SelectValue placeholder={data.specialist_type ? `Select ${data.specialist_type === 'doctor' ? 'doctor' : 'medical technologist'}` : 'Select appointment type first'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(data.specialist_type === 'doctor' ? doctors : medtechs).map((specialist) => (
                                                        <SelectItem key={specialist.id} value={specialist.id.toString()}>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{specialist.name}</span>
                                                                <span className="text-sm text-gray-500">{specialist.specialization}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.specialist_id && <p className="text-sm text-black">{errors.specialist_id}</p>}
                                        </div>

                                        {/* Selected Specialist Info */}
                                        {selectedSpecialist && (
                                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 rounded-full">
                                                        <User className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-blue-900">{selectedSpecialist.name}</h4>
                                                        <p className="text-sm text-blue-700">{selectedSpecialist.specialization}</p>
                                                        <div className="flex items-center gap-4 mt-2 text-xs text-blue-600">
                                                            <span className="flex items-center gap-1">
                                                                <Star className="h-3 w-3" />
                                                                {selectedSpecialist.rating}
                                                            </span>
                                                            <span>{selectedSpecialist.experience}</span>
                                                            <span>{selectedSpecialist.availability}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Date and Time Selection */}
                                    <div className="space-y-3">
                                        <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-1">Schedule</h3>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="appointment_date" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    Appointment Date *
                                                </Label>
                                                <Input
                                                    type="date"
                                                    id="appointment_date"
                                                    value={data.appointment_date}
                                                    onChange={(e) => setData('appointment_date', e.target.value)}
                                                    min={getMinDate()}
                                                    max={getMaxDate()}
                                                    className={`h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.appointment_date ? 'border-gray-500' : ''}`}
                                                />
                                                {errors.appointment_date && <p className="text-sm text-black">{errors.appointment_date}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="appointment_time" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Clock3 className="h-4 w-4" />
                                                    Appointment Time *
                                                </Label>
                                                <Select onValueChange={(value) => setData('appointment_time', value)}>
                                                    <SelectTrigger id="appointment_time" className={`w-full h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.appointment_time ? 'border-gray-500' : ''}`}>
                                                        <SelectValue placeholder="Select time" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableTimes.map((time) => (
                                                            <SelectItem key={time.value} value={time.value}>{time.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.appointment_time && <p className="text-sm text-black">{errors.appointment_time}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Information */}
                                    <div className="space-y-3">
                                        <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-1">Additional Information</h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    Notes
                                                </Label>
                                                <Textarea
                                                    id="notes"
                                                    value={data.notes}
                                                    onChange={(e) => setData('notes', e.target.value)}
                                                    placeholder="Any additional notes or concerns"
                                                    className="min-h-[80px] border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="special_requirements" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <AlertCircle className="h-4 w-4" />
                                                    Special Requirements
                                                </Label>
                                                <Textarea
                                                    id="special_requirements"
                                                    value={data.special_requirements}
                                                    onChange={(e) => setData('special_requirements', e.target.value)}
                                                    placeholder="Any special requirements or accommodations needed"
                                                    className="min-h-[80px] border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price Summary */}
                                    {appointmentPrice > 0 && (
                                        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-5 w-5 text-green-600" />
                                                    <span className="font-semibold text-green-900">Estimated Cost</span>
                                                </div>
                                                <span className="text-lg font-bold text-green-900">₱{appointmentPrice.toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm text-green-700 mt-1">
                                                Payment will be collected at the clinic on the day of your appointment.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </PatientInfoCard>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-6">
                            <div className="flex items-center gap-3">
                                {currentStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={prevStep}
                                        className="px-6 py-3 h-12 border-gray-300 hover:bg-gray-50 rounded-xl text-lg font-semibold"
                                    >
                                        <ArrowLeft className="mr-2 h-5 w-5" />
                                        Previous
                                    </Button>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {(() => {
                                    // If not on final step, show Next Step button
                                    if (currentStep < totalSteps) {
                                        return (
                                            <Button
                                                type="button"
                                                onClick={nextStep}
                                                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 h-12 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-lg font-semibold"
                                            >
                                                Next Step
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        );
                                    }
                                    
                                    // If on final step but appointment fields are not filled, show a helpful message
                                    if (currentStep === totalSteps && (!data.appointment_type || !data.specialist_type || !data.specialist_id || !data.appointment_date || !data.appointment_time)) {
                                        return (
                                            <div className="flex items-center gap-3">
                                                <div className="text-sm text-gray-600 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
                                                    Please fill out all appointment fields above to continue
                                                </div>
                                            </div>
                                        );
                                    }
                                    
                                    // Show complete button when all fields are filled
                                    return (
                                        <Button 
                                            disabled={isProcessing} 
                                            type="submit"
                                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 h-12 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-lg font-semibold"
                                        >
                                            <Save className="mr-3 h-6 w-6" />
                                            {isProcessing ? 'Submitting Request...' : 'Submit Online Appointment Request'}
                                        </Button>
                                    );
                                })()}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

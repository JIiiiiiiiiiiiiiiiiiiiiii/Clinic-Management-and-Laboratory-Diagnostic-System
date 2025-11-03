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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import TermsAndConditionsModal from '@/components/TermsAndConditionsModal';
import { type BreadcrumbItem } from '@/types';
import { CreatePatientItem } from '@/types/patients';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
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
import { useState, useEffect } from 'react';

type Doctor = { 
    id: number; 
    name: string; 
    specialization: string; 
    employee_id: string;
    availability: string;
    rating: number;
    experience: string;
    nextAvailable: string;
    schedule_data?: {
        monday?: string[];
        tuesday?: string[];
        wednesday?: string[];
        thursday?: string[];
        friday?: string[];
        saturday?: string[];
        sunday?: string[];
    };
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
    schedule_data?: {
        monday?: string[];
        tuesday?: string[];
        wednesday?: string[];
        thursday?: string[];
        friday?: string[];
        saturday?: string[];
        sunday?: string[];
    };
};

interface AppointmentBookingProps {
    user: any;
    patient?: any;
    doctors: Doctor[];
    medtechs: Medtech[];
    appointmentTypes: Record<string, string>;
    isExistingPatient?: boolean;
    isAdmin?: boolean;
    nextPatientId?: string;
    backUrl?: string;
    debug?: string;
}

export default function AppointmentBooking({ 
    user, 
    patient,
    doctors = [], 
    medtechs = [], 
    appointmentTypes = {},
    isExistingPatient = false,
    isAdmin = false,
    nextPatientId = 'P001',
    backUrl,
    debug
}: AppointmentBookingProps) {
    const page = usePage();
    const flash = (page.props as any).flash || {};
    const duplicate = flash?.duplicate_patient as
        | { id: number; patient_no?: string; last_name: string; first_name: string; birthdate?: string; mobile_no?: string }
        | undefined;

    const { data, setData, processing, errors, reset, post } = useForm<CreatePatientItem & { 
        force_create?: boolean;
        email_address?: string;
        insurance_company?: string;
        hmo_id_no?: string;
        approval_code?: string;
        social_history?: string;
        obgyn_history?: string;
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
        email_address: '',

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

    const { auth } = usePage().props as any;
    const currentUserId = auth?.user?.id ?? 'guest';

    const [showMissingModal, setShowMissingModal] = useState(false);
    const [missingFields, setMissingFields] = useState<string[]>([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedSpecialist, setSelectedSpecialist] = useState<Doctor | Medtech | null>(null);
    const [availableTimes, setAvailableTimes] = useState<Array<{value: string, label: string}>>([]);
    const [appointmentPrice, setAppointmentPrice] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const storageKeyWalkin = `terms_accepted_walkin_${currentUserId}`;
    const [showTermsModal, setShowTermsModal] = useState(() => {
        return !sessionStorage.getItem(storageKeyWalkin);
    });
    const [termsAccepted, setTermsAccepted] = useState(() => {
        return !!sessionStorage.getItem(storageKeyWalkin);
    });

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
            'general_consultation': 350,
            'consultation': 350,
            'cbc': 245,
            'fecalysis_test': 90,
            'fecalysis': 90,
            'urinarysis_test': 140,
            'urinalysis': 140,
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
            } else if (['cbc', 'fecalysis_test', 'urinarysis_test'].includes(data.appointment_type)) {
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
                email_address: patient.email_address || '',
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
        if (!data.specialist_id || !data.appointment_date) {
            setAvailableTimes([]);
            return;
        }

        // Get selected specialist
        const specialist = [...doctors, ...medtechs].find(s => s.id.toString() === data.specialist_id);
        if (!specialist || !specialist.schedule_data) {
            setAvailableTimes([]);
            return;
        }

        // Get day of week from selected date
        const selectedDate = new Date(data.appointment_date);
        const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        
        // Get available times for that day from specialist's schedule
        const daySchedule = (specialist.schedule_data as any)[dayOfWeek] || [];
        
        // Convert times to display format
        const slots = daySchedule.map((time: string) => {
            // Convert 24-hour format to 12-hour format
            const [hours, minutes] = time.split(':');
            const date = new Date();
            date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            const timeString = date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
            });
            return {
                value: timeString,
                label: timeString
            };
        });

        setAvailableTimes(slots);
    };

    const submit: React.FormEventHandler = (e) => {
        e.preventDefault();
        
        // For all cases, if not on final step, just go to next step
        if (currentStep < totalSteps) {
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
        
        // Only run validation if we're actually on the final step
        if (currentStep !== totalSteps) {
            console.log('handleFinalSubmit called but not on final step', { currentStep, totalSteps });
            return;
        }
        
        // Prevent multiple submissions
        if (isProcessing) {
            console.log('Form already processing, ignoring submission');
            return;
        }
        
        console.log('Form submission started', { data, isExistingPatient });
        
        // Validate appointment fields (only on step 6)
        const requiredChecks = [
            { key: 'appointment_type', label: 'Appointment Type', isValid: (v: any) => Boolean(v) },
            { key: 'specialist_type', label: 'Specialist Type', isValid: (v: any) => Boolean(v) },
            { key: 'specialist_id', label: 'Specialist', isValid: (v: any) => Boolean(v) },
            { key: 'appointment_date', label: 'Appointment Date', isValid: (v: any) => Boolean(v) },
            { key: 'appointment_time', label: 'Appointment Time', isValid: (v: any) => Boolean(v) },
        ];

        const missing = requiredChecks.filter((c) => !c.isValid((data as any)[c.key]));
        if (missing.length > 0) {
            console.log('Missing appointment fields:', missing);
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

        // Prepare request body for new API (matching online form structure)
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
            
            // Use different API endpoints based on context
            const apiEndpoint = isAdmin ? '/api/appointments/walk-in' : '/api/appointments/online';
            
            const response = await fetch(apiEndpoint, {
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
                const successMessage = isAdmin 
                    ? `✅ Walk-in Appointment Created Successfully!\n\nPatient Code: ${result.patient_code}\nAppointment Code: ${result.appointment_code}`
                    : `✅ Appointment Created Successfully!\n\nPatient Code: ${result.patient_code}\nAppointment Code: ${result.appointment_code}\n\nYour appointment request has been sent to admin for approval. You will be notified once it's confirmed.`;
                
                alert(successMessage);
                
                // Redirect based on context
                if (isAdmin) {
                    window.location.href = '/admin/appointments';
                } else {
                    window.location.href = '/patient/appointments';
                }
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

    // Helper function to get specialist schedule information
    const getSpecialistScheduleInfo = (specialist: Doctor | Medtech) => {
        // For now, return mock data - this will be replaced with actual schedule data
        const scheduleData = specialist.schedule_data || {};
        
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        const availableDays: string[] = [];
        const allTimes: string[] = [];
        
        days.forEach((day, index) => {
            const daySchedule = (scheduleData as any)[day];
            if (daySchedule && daySchedule.length > 0) {
                availableDays.push(dayNames[index]);
                allTimes.push(...daySchedule);
            }
        });
        
        const uniqueTimes = [...new Set(allTimes)].sort();
        
        return {
            availableDays: availableDays.length > 0 ? availableDays.join(', ') : 'Not scheduled',
            availableTimes: uniqueTimes.length > 0 ? uniqueTimes.join(', ') : 'Not available',
            nextAvailable: availableDays.length > 0 ? `${availableDays[0]} ${uniqueTimes[0] || ''}` : null
        };
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: isAdmin ? 'Appointments' : 'Patient Portal',
            href: isAdmin ? '/admin/appointments' : '/patient/dashboard',
        },
        {
            title: isAdmin ? 'All Appointments' : 'Online Appointment',
            href: isAdmin ? '/admin/appointments' : '/patient/online-appointment',
        },
        {
            title: isAdmin ? 'Walk-in Appointment' : 'Online Appointment',
            href: isAdmin ? '/admin/appointments/walk-in' : '/patient/online-appointment',
        },
    ];

    const steps = [
        { id: 1, title: 'Patient Information', description: 'Basic patient details' },
        { id: 2, title: 'Contact Details', description: 'Address and contact information' },
        { id: 3, title: 'Emergency Contact', description: 'Emergency contact information' },
        { id: 4, title: 'Insurance & Financial', description: 'Insurance and financial details' },
        { id: 5, title: 'Medical History', description: 'Medical history and allergies' },
        { id: 6, title: 'Appointment Booking', description: 'Select specialist and schedule' },
    ];

    const handleTermsAccept = () => {
        setTermsAccepted(true);
        setShowTermsModal(false);
    };

    // Block form access if terms not accepted
    if (!termsAccepted) {
        return (
            <>
                <AppLayout breadcrumbs={breadcrumbs}>
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Please Accept Terms and Conditions</h2>
                            <p className="text-gray-600">You must accept the terms and conditions to continue.</p>
                        </div>
                    </div>
                </AppLayout>
                <TermsAndConditionsModal 
                    open={showTermsModal} 
                    onAccept={handleTermsAccept}
                    formType="walkin"
                    storageKey={storageKeyWalkin}
                />
            </>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isAdmin ? "Create Walk-in Appointment" : "Create New Appointment"} />
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
                    {/* Header Section - Hidden for Admin */}
                    {!isAdmin && (
                        <div className="mb-6 flex items-center justify-between">
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
                                    <Link href={backUrl || "/patient/dashboard"}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Dashboard
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Progress Stepper */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                {steps.map((step, index) => (
                                    <div key={step.id} className="flex items-center">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                            currentStep >= step.id 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {currentStep > step.id ? (
                                                <CheckCircle className="h-5 w-5" />
                                            ) : (
                                                <span className="text-sm font-medium">{step.id}</span>
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <p className={`text-sm font-medium ${
                                                currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                                            }`}>
                                                {step.title}
                                            </p>
                                            <p className="text-xs text-gray-500">{step.description}</p>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className={`w-16 h-0.5 mx-4 ${
                                                currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                                            }`} />
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
                    {!isExistingPatient && !isAdmin && (
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
                                <AlertDialogAction onClick={() => window.location.href = route(isAdmin ? 'admin.appointments.index' : 'patient.dashboard')}>
                                    Go to {isAdmin ? 'Appointments' : 'Dashboard'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                {steps[currentStep - 1].title}
                            </CardTitle>
                            <CardDescription>
                                {steps[currentStep - 1].description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit}>
                                {/* Step 1: Personal Information */}
                                {currentStep === 1 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
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
                                                    className="mt-1"
                                                    required
                                                />
                                                {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
                                            </div>
                                            <div>
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
                                                    className="mt-1"
                                                    required
                                                />
                                                {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="middle_name" className="text-sm font-semibold text-gray-700">Middle Name</Label>
                                                <Input
                                                    id="middle_name"
                                                    name="middle_name"
                                                    autoComplete="additional-name"
                                                    value={data.middle_name}
                                                    onChange={(e) => setData('middle_name', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="birthdate" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    Date of Birth *
                                                </Label>
                                                <Input
                                                    type="date"
                                                    value={data.birthdate}
                                                    onChange={(e) => onBirthdateChange(e.target.value)}
                                                    className="mt-1"
                                                    required
                                                />
                                                {errors.birthdate && <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="age" className="text-sm font-semibold text-gray-700">Age *</Label>
                                                <Input
                                                    id="age"
                                                    name="age"
                                                    type="number"
                                                    value={data.age}
                                                    onChange={(e) => setData('age', Number(e.target.value))}
                                                    className="mt-1"
                                                    required
                                                />
                                                {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="sex" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Heart className="h-4 w-4" />
                                                    Sex *
                                                </Label>
                                                <Select value={data.sex} onValueChange={(value: 'male' | 'female') => setData('sex', value)}>
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.sex && <p className="text-red-500 text-sm mt-1">{errors.sex}</p>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="occupation" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Briefcase className="h-4 w-4" />
                                                    Occupation
                                                </Label>
                                                <Input
                                                    id="occupation"
                                                    name="occupation"
                                                    autoComplete="organization-title"
                                                    value={data.occupation}
                                                    onChange={(e) => setData('occupation', e.target.value)}
                                                    className="mt-1"
                                                    placeholder="Enter occupation"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="religion" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Globe className="h-4 w-4" />
                                                    Religion
                                                </Label>
                                                <Input
                                                    id="religion"
                                                    name="religion"
                                                    value={data.religion}
                                                    onChange={(e) => setData('religion', e.target.value)}
                                                    className="mt-1"
                                                    placeholder="Enter religion"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="civil_status" className="text-sm font-semibold text-gray-700">Civil Status *</Label>
                                                <Select value={data.civil_status} onValueChange={(value: 'single' | 'married' | 'widowed' | 'divorced' | 'separated') => setData('civil_status', value)}>
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="single">Single</SelectItem>
                                                        <SelectItem value="married">Married</SelectItem>
                                                        <SelectItem value="widowed">Widowed</SelectItem>
                                                        <SelectItem value="divorced">Divorced</SelectItem>
                                                        <SelectItem value="separated">Separated</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.civil_status && <p className="text-red-500 text-sm mt-1">{errors.civil_status}</p>}
                                            </div>
                                            <div>
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
                                                    className="mt-1"
                                                    placeholder="Enter nationality"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Contact Details */}
                                {currentStep === 2 && (
                                    <div className="space-y-6">
                                        <div>
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
                                                className="mt-1"
                                                rows={3}
                                                required
                                            />
                                            {errors.present_address && <p className="text-red-500 text-sm mt-1">{errors.present_address}</p>}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="telephone_no" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Phone className="h-4 w-4" />
                                                    Telephone Number
                                                </Label>
                                                <Input
                                                    id="telephone_no"
                                                    name="telephone_no"
                                                    autoComplete="tel"
                                                    value={data.telephone_no}
                                                    onChange={(e) => setData('telephone_no', e.target.value)}
                                                    className="mt-1"
                                                    placeholder="Enter telephone number"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="mobile_no" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Phone className="h-4 w-4" />
                                                    Mobile Number *
                                                </Label>
                                                <Input
                                                    id="mobile_no"
                                                    name="mobile_no"
                                                    autoComplete="tel"
                                                    value={data.mobile_no}
                                                    onChange={(e) => setData('mobile_no', e.target.value)}
                                                    className="mt-1"
                                                    placeholder="Enter mobile number"
                                                    required
                                                />
                                                {errors.mobile_no && <p className="text-red-500 text-sm mt-1">{errors.mobile_no}</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="email_address" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                Email Address
                                            </Label>
                                            <Input
                                                id="email_address"
                                                name="email_address"
                                                type="email"
                                                autoComplete="email"
                                                value={data.email_address}
                                                onChange={(e) => setData('email_address', e.target.value)}
                                                className="mt-1"
                                                placeholder="Enter email address"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Emergency Contact */}
                                {currentStep === 3 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="informant_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    Emergency Contact Name
                                                </Label>
                                                <Input
                                                    id="informant_name"
                                                    value={data.informant_name}
                                                    onChange={(e) => setData('informant_name', e.target.value)}
                                                    className="mt-1"
                                                    placeholder="Enter informant name"
                                                />
                                                {errors.informant_name && <p className="text-red-500 text-sm mt-1">{errors.informant_name}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="relationship" className="text-sm font-semibold text-gray-700">Relationship</Label>
                                                <Input
                                                    id="relationship"
                                                    value={data.relationship}
                                                    onChange={(e) => setData('relationship', e.target.value)}
                                                    className="mt-1"
                                                    placeholder="Enter relationship"
                                                />
                                                {errors.relationship && <p className="text-red-500 text-sm mt-1">{errors.relationship}</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Insurance & Financial */}
                                {currentStep === 4 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="company_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Building className="h-4 w-4" />
                                                    Company Name
                                                </Label>
                                                <Input
                                                    id="company_name"
                                                    name="company_name"
                                                    value={data.company_name}
                                                    onChange={(e) => setData('company_name', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="hmo_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Shield className="h-4 w-4" />
                                                    HMO Name
                                                </Label>
                                                <Input
                                                    id="hmo_name"
                                                    name="hmo_name"
                                                    value={data.hmo_name}
                                                    onChange={(e) => setData('hmo_name', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="hmo_company_id_no" className="text-sm font-semibold text-gray-700">HMO ID Number</Label>
                                                <Input
                                                    id="hmo_company_id_no"
                                                    name="hmo_company_id_no"
                                                    value={data.hmo_company_id_no}
                                                    onChange={(e) => setData('hmo_company_id_no', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="validation_approval_code" className="text-sm font-semibold text-gray-700">Approval Code</Label>
                                                <Input
                                                    id="validation_approval_code"
                                                    name="validation_approval_code"
                                                    value={data.validation_approval_code}
                                                    onChange={(e) => setData('validation_approval_code', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 5: Medical History */}
                                {currentStep === 5 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="drug_allergies" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <AlertCircle className="h-4 w-4" />
                                                    Drug Allergies
                                                </Label>
                                                <Input
                                                    id="drug_allergies"
                                                    name="drug_allergies"
                                                    value={data.drug_allergies}
                                                    onChange={(e) => setData('drug_allergies', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="food_allergies" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <AlertCircle className="h-4 w-4" />
                                                    Food Allergies
                                                </Label>
                                                <Input
                                                    id="food_allergies"
                                                    name="food_allergies"
                                                    value={data.food_allergies}
                                                    onChange={(e) => setData('food_allergies', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="past_medical_history" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                Past Medical History
                                            </Label>
                                            <Textarea
                                                id="past_medical_history"
                                                name="past_medical_history"
                                                value={data.past_medical_history}
                                                onChange={(e) => setData('past_medical_history', e.target.value)}
                                                className="mt-1"
                                                rows={3}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="family_history" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                Family History
                                            </Label>
                                            <Textarea
                                                id="family_history"
                                                name="family_history"
                                                value={data.family_history}
                                                onChange={(e) => setData('family_history', e.target.value)}
                                                className="mt-1"
                                                rows={3}
                                                placeholder="Family medical history, hereditary conditions"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="social_personal_history" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <Briefcase className="h-4 w-4" />
                                                Social/Personal History
                                            </Label>
                                            <Textarea
                                                id="social_personal_history"
                                                name="social_personal_history"
                                                value={data.social_personal_history}
                                                onChange={(e) => setData('social_personal_history', e.target.value)}
                                                className="mt-1"
                                                rows={3}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="obstetrics_gynecology_history" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <Heart className="h-4 w-4" />
                                                Obstetrics & Gynecology History
                                            </Label>
                                            <Textarea
                                                id="obstetrics_gynecology_history"
                                                name="obstetrics_gynecology_history"
                                                value={data.obstetrics_gynecology_history}
                                                onChange={(e) => setData('obstetrics_gynecology_history', e.target.value)}
                                                className="mt-1"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 6: Appointment Booking */}
                                {currentStep === 6 && (
                                    <div className="space-y-6">
                                        {/* Appointment Type Selection */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="appointment_type" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Stethoscope className="h-4 w-4" />
                                                    Appointment Type *
                                                </Label>
                                                <Select 
                                                    value={data.appointment_type} 
                                                    onValueChange={(value) => setData('appointment_type', value)}
                                                >
                                                    <SelectTrigger id="appointment_type" className={`mt-1 ${errors.appointment_type ? 'border-red-500' : ''}`}>
                                                        <SelectValue placeholder="Select appointment type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(appointmentTypes).map(([value, label]) => (
                                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.appointment_type && <p className="text-red-500 text-sm mt-1">{errors.appointment_type}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="specialist_type" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    Specialist Type *
                                                </Label>
                                                <div className="w-full border border-gray-300 rounded bg-gray-50 flex items-center px-3 py-2 mt-1">
                                                    <span className="text-gray-700 font-medium">
                                                        {data.specialist_type === 'doctor' ? 'Doctor' : data.specialist_type === 'medtech' ? 'Medical Technologist' : 'Select appointment type first'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Specialist type is automatically determined based on your appointment selection
                                                </p>
                                            </div>
                                        </div>

                                        {/* Specialist Selection - Checkbox Style */}
                                        <div className="space-y-4">
                                            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                {data.specialist_type === 'doctor' ? 'Available Doctors' : 'Available Medical Technologists'} *
                                            </Label>
                                            
                                            {/* Specialist Checkboxes */}
                                            <div className="grid gap-4">
                                                {(data.specialist_type === 'doctor' ? doctors : medtechs).map((specialist) => {
                                                    const isSelected = data.specialist_id === specialist.id.toString();
                                                    const scheduleInfo = getSpecialistScheduleInfo(specialist);
                                                    
                                                    return (
                                                        <div key={specialist.id} className={`border-2 rounded-lg p-4 transition-all duration-200 ${
                                                            isSelected 
                                                                ? 'border-blue-500 bg-blue-50' 
                                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                                        }`}>
                                                            <div className="flex items-start space-x-3">
                                                                <input
                                                                    type="radio"
                                                                    id={`specialist-${specialist.id}`}
                                                                    name="specialist_id"
                                                                    value={specialist.id.toString()}
                                                                    checked={isSelected}
                                                                    onChange={(e) => {
                                                                        setData('specialist_id', e.target.value);
                                                                        const selectedSpecialist = [...doctors, ...medtechs].find(s => s.id.toString() === e.target.value);
                                                                        setSelectedSpecialist(selectedSpecialist || null);
                                                                    }}
                                                                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                                                />
                                                                <div className="flex-1">
                                                                    <label htmlFor={`specialist-${specialist.id}`} className="cursor-pointer">
                                                                        <div className="flex items-center justify-between">
                                                                            <div>
                                                                                <h4 className="font-semibold text-gray-900">{specialist.name}</h4>
                                                                                <p className="text-sm text-gray-600">{specialist.specialization}</p>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                                <Star className="h-3 w-3" />
                                                                                {specialist.rating}
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        {/* Schedule Information */}
                                                                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                                                <Calendar className="h-4 w-4" />
                                                                                <span className="font-medium">Available:</span>
                                                                                <span>{scheduleInfo.availableDays}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                                                                <Clock className="h-4 w-4" />
                                                                                <span>Times: {scheduleInfo.availableTimes}</span>
                                                                            </div>
                                                                            {scheduleInfo.nextAvailable && (
                                                                                <div className="text-xs text-blue-600 mt-1">
                                                                                    Next Available: {scheduleInfo.nextAvailable}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            
                                            {errors.specialist_id && <p className="text-red-500 text-sm mt-1">{errors.specialist_id}</p>}
                                        </div>

                                        {/* Date and Time Selection */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
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
                                                    className={`mt-1 ${errors.appointment_date ? 'border-red-500' : ''}`}
                                                />
                                                {errors.appointment_date && <p className="text-red-500 text-sm mt-1">{errors.appointment_date}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="appointment_time" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Clock3 className="h-4 w-4" />
                                                    Appointment Time *
                                                </Label>
                                                <Select 
                                                    value={data.appointment_time} 
                                                    onValueChange={(value) => setData('appointment_time', value)}
                                                >
                                                    <SelectTrigger id="appointment_time" className={`mt-1 ${errors.appointment_time ? 'border-red-500' : ''}`}>
                                                        <SelectValue placeholder="Select time" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableTimes.map((time) => (
                                                            <SelectItem key={time.value} value={time.value}>{time.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.appointment_time && <p className="text-red-500 text-sm mt-1">{errors.appointment_time}</p>}
                                            </div>
                                        </div>

                                        {/* Additional Information */}
                                        <div className="space-y-6">
                                            <div>
                                                <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    Notes
                                                </Label>
                                                <Textarea
                                                    id="notes"
                                                    value={data.notes}
                                                    onChange={(e) => setData('notes', e.target.value)}
                                                    placeholder="Any additional notes or concerns"
                                                    className="mt-1"
                                                    rows={3}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="special_requirements" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <AlertCircle className="h-4 w-4" />
                                                    Special Requirements
                                                </Label>
                                                <Textarea
                                                    id="special_requirements"
                                                    value={data.special_requirements}
                                                    onChange={(e) => setData('special_requirements', e.target.value)}
                                                    placeholder="Any special requirements or accommodations needed"
                                                    className="mt-1"
                                                    rows={3}
                                                />
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
                                )}

                                <Separator className="my-6" />
                                
                                <div className="flex justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={prevStep}
                                        disabled={currentStep === 1}
                                    >
                                        <ChevronLeft className="mr-2 h-4 w-4" />
                                        Previous
                                    </Button>
                                    
                                    {currentStep < totalSteps ? (
                                        <Button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                nextStep();
                                            }}
                                        >
                                            Next
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={isProcessing}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    {isAdmin ? 'Create Walk-in Appointment' : 'Submit Online Appointment Request'}
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
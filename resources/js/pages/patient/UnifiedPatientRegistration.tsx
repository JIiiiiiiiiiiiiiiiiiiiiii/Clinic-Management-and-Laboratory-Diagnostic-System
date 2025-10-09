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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomDatePicker } from '@/components/ui/date-picker';
import { PatientPageLayout, PatientActionButton, PatientFormSection, PatientInfoCard } from '@/components/patient/PatientPageLayout';
import AppLayout from '@/layouts/app-layout';
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
    TrendingUp, BarChart3, PieChart, LineChart, Bell, DollarSign
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patient Dashboard',
        href: '/patient/dashboard',
    },
    {
        title: 'Register & Book Appointment',
        href: '/patient/register-and-book',
    },
];

interface Doctor {
    id: number;
    name: string;
    specialization: string;
    employee_id: string;
    availability: string;
    rating: number;
    experience: string;
    nextAvailable: string;
}

interface MedTech {
    id: number;
    name: string;
    specialization: string;
    employee_id: string;
    availability: string;
    rating: number;
    experience: string;
    nextAvailable: string;
}

interface UnifiedPatientRegistrationProps {
    user: {
        name: string;
        email: string;
        role: string;
    };
    doctors?: Doctor[];
    medtechs?: MedTech[];
    appointmentTypes?: Record<string, string>;
}

const appointmentTypes = [
    { id: 'consultation', name: 'Consultation', requiresDoctor: true, requiresMedTech: false, basePrice: 500 },
    { id: 'checkup', name: 'Check-up', requiresDoctor: true, requiresMedTech: false, basePrice: 300 },
    { id: 'fecalysis', name: 'Fecalysis', requiresDoctor: false, requiresMedTech: true, basePrice: 200 },
    { id: 'cbc', name: 'CBC (Complete Blood Count)', requiresDoctor: false, requiresMedTech: true, basePrice: 250 },
    { id: 'urinalysis', name: 'Urinalysis', requiresDoctor: false, requiresMedTech: true, basePrice: 150 },
    { id: 'x-ray', name: 'X-Ray', requiresDoctor: false, requiresMedTech: true, basePrice: 400 },
    { id: 'ultrasound', name: 'Ultrasound', requiresDoctor: false, requiresMedTech: true, basePrice: 600 },
];

export default function UnifiedPatientRegistration({ 
    user, 
    doctors = [], 
    medtechs = [], 
    appointmentTypes: appointmentTypesProp = {} 
}: UnifiedPatientRegistrationProps) {
    const page = usePage();
    const flash = (page.props as any).flash || {};
    
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 6;
    const [showMissingModal, setShowMissingModal] = useState(false);
    const [missingFields, setMissingFields] = useState<string[]>([]);
    
    // Appointment-specific state
    const [selectedAppointmentType, setSelectedAppointmentType] = useState('');
    const [selectedSpecialist, setSelectedSpecialist] = useState('');
    const [selectedSpecialistType, setSelectedSpecialistType] = useState('doctor');
    const [appointmentPrice, setAppointmentPrice] = useState(0);

    const { data, setData, processing, errors, reset, post } = useForm<CreatePatientItem & {
        // Appointment fields
        appointment_type: string;
        specialist_type: string;
        specialist_id: string;
        appointment_date: string;
        appointment_time: string;
        duration: string;
        notes: string;
        special_requirements: string;
        price: number;
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

        // Appointment fields
        appointment_type: '',
        specialist_type: 'doctor',
        specialist_id: '',
        appointment_date: '',
        appointment_time: '',
        duration: '30 min',
        notes: '',
        special_requirements: '',
        price: 0,
    });

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

    // Calculate appointment price
    const calculatePrice = (appointmentType: string) => {
        const type = appointmentTypes.find(t => t.id === appointmentType);
        return type?.basePrice || 0;
    };

    // Handle appointment type change
    const handleAppointmentTypeChange = (typeId: string) => {
        setSelectedAppointmentType(typeId);
        setData('appointment_type', typeId);
        
        const selectedType = appointmentTypes.find(t => t.id === typeId);
        const price = calculatePrice(typeId);
        
        setAppointmentPrice(price);
        setData('price', price);
        
        if (selectedType) {
            const specialistType = selectedType.requiresDoctor ? 'doctor' : 'medtech';
            setSelectedSpecialistType(specialistType);
            setData('specialist_type', specialistType);
            setSelectedSpecialist('');
            setData('specialist_id', '');
        }
    };

    // Handle specialist selection
    const handleSpecialistChange = (specialistId: string) => {
        setSelectedSpecialist(specialistId);
        setData('specialist_id', specialistId);
    };

    const submit: React.FormEventHandler = (e) => {
        e.preventDefault();
        
        // Client-side required validation
        const requiredChecks: Array<{ key: keyof typeof data; label: string; isValid: (v: any) => boolean }> = [
            { key: 'last_name', label: 'Last Name', isValid: (v) => Boolean(v) },
            { key: 'first_name', label: 'First Name', isValid: (v) => Boolean(v) },
            { key: 'birthdate', label: 'Birthdate', isValid: (v) => Boolean(v) },
            { key: 'age', label: 'Age', isValid: (v) => Number(v) > 0 },
            { key: 'sex', label: 'Sex', isValid: (v) => Boolean(v) },
            { key: 'civil_status', label: 'Civil Status', isValid: (v) => Boolean(v) },
            { key: 'present_address', label: 'Present Address', isValid: (v) => Boolean(v) },
            { key: 'mobile_no', label: 'Mobile No.', isValid: (v) => Boolean(v) },
            { key: 'informant_name', label: 'Informant Name', isValid: (v) => Boolean(v) },
            { key: 'relationship', label: 'Relationship', isValid: (v) => Boolean(v) },
            { key: 'appointment_type', label: 'Appointment Type', isValid: (v) => Boolean(v) },
            { key: 'specialist_id', label: 'Specialist', isValid: (v) => Boolean(v) },
            { key: 'appointment_date', label: 'Appointment Date', isValid: (v) => Boolean(v) },
            { key: 'appointment_time', label: 'Appointment Time', isValid: (v) => Boolean(v) },
        ];
        
        const missing = requiredChecks.filter((c) => !c.isValid((data as any)[c.key]));
        if (missing.length > 0) {
            setMissingFields(missing.map((m) => m.label));
            setShowMissingModal(true);
            const firstKey = missing[0].key as string;
            const el = document.getElementById(firstKey);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.focus();
            return;
        }

        post('/patient/register-and-book', {
            preserveScroll: true,
            preserveState: true,
            onError: (errs) => {
                const keys = Object.keys(errs || {});
                if (keys.length > 0) {
                    const el = document.getElementById(keys[0]);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.focus();
                }
            },
            onSuccess: () => {
                // Let backend redirect; no extra navigation here to avoid jump
            },
        });
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
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
            case 6: return 'Appointment Details';
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
            case 6: return <Calendar className="h-5 w-5" />;
            default: return <User className="h-5 w-5" />;
        }
    };

    const getAvailableSpecialists = () => {
        if (selectedSpecialistType === 'doctor') {
            return doctors;
        } else if (selectedSpecialistType === 'medtech') {
            return medtechs;
        }
        return [];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register & Book Appointment" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="@container/main flex flex-1 flex-col gap-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-4xl font-bold text-black">Register & Book Appointment</h1>
                                <p className="text-sm text-gray-600 mt-1">Complete your patient registration and book your appointment in one process</p>
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
                                    <CardTitle className="text-lg font-semibold text-gray-900">Registration & Booking Progress</CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">Step {currentStep} of {totalSteps} • {getStepTitle(currentStep)}</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-gray-50 text-black border-gray-200">
                                {Math.round((currentStep / totalSteps) * 100)}% Complete
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

                    {/* Error alert */}
                    {(flash?.error as string | undefined) && (
                        <div className="rounded-md border border-gray-300 bg-gray-50 p-4 text-sm text-black">{String(flash?.error as string)}</div>
                    )}

                    {/* Required fields missing modal */}
                    <AlertDialog open={showMissingModal} onOpenChange={setShowMissingModal}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Missing required information</AlertDialogTitle>
                            </AlertDialogHeader>
                            <p className="text-sm" data-slot="description">
                                Please complete the following required field(s):
                            </p>
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
                                                <CustomDatePicker
                                                    value={data.birthdate}
                                                    onChange={(date) => onBirthdateChange(date ? date.toISOString().split('T')[0] : '')}
                                                    placeholder="Select birthdate"
                                                    variant="responsive"
                                                    className={`w-full ${errors.birthdate ? 'border-gray-500' : ''}`}
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
                                                <Label htmlFor="civil_status" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Heart className="h-4 w-4" />
                                                    Civil Status *
                                                </Label>
                                                <Select onValueChange={(value: string) => setData('civil_status', value)} defaultValue={data.civil_status}>
                                                    <SelectTrigger id="civil_status" className={`w-full h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.civil_status ? 'border-gray-500' : ''}`}>
                                                        <SelectValue placeholder="Select civil status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="single">Single</SelectItem>
                                                        <SelectItem value="married">Married</SelectItem>
                                                        <SelectItem value="widowed">Widowed</SelectItem>
                                                        <SelectItem value="divorced">Divorced</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.civil_status && <p className="text-sm text-black">{errors.civil_status}</p>}
                                            </div>
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

                        {/* Step 6: Appointment Details */}
                        {currentStep === 6 && (
                            <PatientInfoCard
                                title="Appointment Details"
                                icon={getStepIcon(6)}
                            >
                                <div className="space-y-6">
                                    {/* Appointment Type and Specialist */}
                                    <div className="space-y-3">
                                        <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-1">Appointment Information</h3>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="appointment_type" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Stethoscope className="h-4 w-4" />
                                                    Appointment Type *
                                                </Label>
                                                <Select onValueChange={handleAppointmentTypeChange} value={selectedAppointmentType}>
                                                    <SelectTrigger id="appointment_type" className={`w-full h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.appointment_type ? 'border-gray-500' : ''}`}>
                                                        <SelectValue placeholder="Select appointment type..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {appointmentTypes.map(type => (
                                                            <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.appointment_type && <p className="text-sm text-black">{errors.appointment_type}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="specialist_id" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    {selectedSpecialistType === 'doctor' ? 'Doctor *' : 
                                                     selectedSpecialistType === 'medtech' ? 'Med Tech Specialist *' : 
                                                     'Specialist *'}
                                                </Label>
                                                <Select onValueChange={handleSpecialistChange} value={selectedSpecialist} disabled={!selectedAppointmentType}>
                                                    <SelectTrigger id="specialist_id" className={`w-full h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.specialist_id ? 'border-gray-500' : ''}`}>
                                                        <SelectValue placeholder="Select specialist..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {getAvailableSpecialists().map(specialist => (
                                                            <SelectItem key={specialist.id} value={specialist.id.toString()}>
                                                                {specialist.name} - {specialist.specialization}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.specialist_id && <p className="text-sm text-black">{errors.specialist_id}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price and Schedule */}
                                    <div className="space-y-3">
                                        <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-1">Schedule & Pricing</h3>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="price" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4" />
                                                    Price
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        id="price"
                                                        value={appointmentPrice || ''}
                                                        readOnly
                                                        className="bg-gray-100 text-gray-700 font-semibold h-12 border-gray-300 rounded-xl shadow-sm"
                                                        placeholder="Auto-calculated"
                                                    />
                                                    <span className="text-sm text-gray-500">₱</span>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Price is automatically calculated based on appointment type
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="appointment_date" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    Date *
                                                </Label>
                                                <Input
                                                    id="appointment_date"
                                                    type="date"
                                                    value={data.appointment_date}
                                                    onChange={(e) => setData('appointment_date', e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className={`h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.appointment_date ? 'border-gray-500' : ''}`}
                                                    required
                                                />
                                                {errors.appointment_date && <p className="text-sm text-black">{errors.appointment_date}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="appointment_time" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    Time *
                                                </Label>
                                                <Input
                                                    id="appointment_time"
                                                    type="time"
                                                    value={data.appointment_time}
                                                    onChange={(e) => setData('appointment_time', e.target.value)}
                                                    className={`h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.appointment_time ? 'border-gray-500' : ''}`}
                                                    required
                                                />
                                                {errors.appointment_time && <p className="text-sm text-black">{errors.appointment_time}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Duration and Additional Information */}
                                    <div className="space-y-3">
                                        <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-1">Additional Information</h3>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="duration" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    Duration
                                                </Label>
                                                <Select onValueChange={(value: string) => setData('duration', value)} defaultValue={data.duration}>
                                                    <SelectTrigger id="duration" className="w-full h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm">
                                                        <SelectValue placeholder="Select duration" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="30 min">30 minutes</SelectItem>
                                                        <SelectItem value="45 min">45 minutes</SelectItem>
                                                        <SelectItem value="60 min">60 minutes</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                Additional Notes
                                            </Label>
                                            <Textarea
                                                id="notes"
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                placeholder="Enter any additional notes or special requirements..."
                                                className="min-h-[100px] border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
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
                                                placeholder="Any special accommodations or requirements..."
                                                className="min-h-[100px] border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Automatic Notifications */}
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Bell className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-800">Automatic Notifications</span>
                                        </div>
                                        <p className="text-sm text-blue-700">
                                            The patient will automatically receive a confirmation email and SMS notification once the appointment is created.
                                        </p>
                                    </div>

                                    {/* Appointment Summary */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-black mb-2">Appointment Summary</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Patient:</span>
                                                <span className="font-medium text-black">{data.first_name} {data.last_name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Specialist:</span>
                                                <span className="font-medium text-black">
                                                    {selectedSpecialist ? 
                                                        getAvailableSpecialists().find(s => s.id.toString() === selectedSpecialist)?.name || 'Not specified' 
                                                        : 'Not specified'
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Date:</span>
                                                <span className="font-medium text-black">{data.appointment_date || 'Not specified'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Time:</span>
                                                <span className="font-medium text-black">{data.appointment_time || 'Not specified'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Type:</span>
                                                <span className="font-medium text-black">
                                                    {appointmentTypes.find(t => t.id === selectedAppointmentType)?.name || 'Not specified'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <span className="font-medium text-black">Pending</span>
                                            </div>
                                        </div>
                                    </div>
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
                                {currentStep < totalSteps ? (
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 h-12 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-lg font-semibold"
                                    >
                                        Next Step
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                ) : (
                                    <Button 
                                        disabled={processing} 
                                        type="submit"
                                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 h-12 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-lg font-semibold"
                                    >
                                        <Save className="mr-3 h-6 w-6" />
                                        {processing ? 'Creating Patient & Booking...' : 'Complete Registration & Book Appointment'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}



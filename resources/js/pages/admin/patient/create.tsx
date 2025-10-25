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
// import { CustomDatePicker } from '@/components/ui/date-picker';
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
    TrendingUp, BarChart3, PieChart, LineChart
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patient Management',
        href: '/admin/patient',
    },
    {
        title: 'Add Patient',
        href: '/admin/patient/register',
    },
];

type Doctor = { id: number; name: string };

export default function RegisterPatient({ doctors = [] as Doctor[], next_patient_no = '' }: { doctors?: Doctor[]; next_patient_no?: string }) {
    const page = usePage();
    const flash = (page.props as any).flash || {};
    const duplicate = flash?.duplicate_patient as
        | { id: number; patient_no?: string; last_name: string; first_name: string; birthdate?: string; mobile_no?: string }
        | undefined;
    const { data, setData, processing, errors, reset, post } = useForm<CreatePatientItem & { force_create?: boolean }>({
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
    });
    const [showMissingModal, setShowMissingModal] = useState(false);
    const [missingFields, setMissingFields] = useState<string[]>([]);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5;

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

    const submit: React.FormEventHandler = (e) => {
        e.preventDefault();
        // Client-side required validation
        const requiredChecks: Array<{ key: keyof CreatePatientItem; label: string; isValid: (v: any) => boolean }> = [
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

        post('/admin/patient', {
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

    const proceedDuplicate = () => {
        setData('force_create', true as any);
        post('/admin/patient', { preserveScroll: true, preserveState: true });
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
            default: return <User className="h-5 w-5" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register New Patient" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="@container/main flex flex-1 flex-col gap-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                {/* Header content removed as requested */}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Back button removed as requested */}
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
                                    <CardTitle className="text-lg font-semibold text-gray-900">Registration Progress</CardTitle>
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
                                                <Label htmlFor="patient_no" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Shield className="h-4 w-4" />
                                                    Patient No.
                                                </Label>
                                                <Input 
                                                    id="patient_no" 
                                                    name="patient_no" 
                                                    value={next_patient_no} 
                                                    readOnly 
                                                    disabled 
                                                    className="h-12 bg-gray-100 border-gray-300 rounded-xl shadow-sm"
                                                />
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
                                        className="bg-gray-600 hover:bg-gray-700blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 h-12 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-lg font-semibold"
                                    >
                                        Next Step
                                        <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                                    </Button>
                                ) : (
                                    <Button 
                                        disabled={processing} 
                                        type="submit"
                                        className="bg-gray-600 hover:bg-gray-700green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 h-12 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-lg font-semibold"
                                    >
                                        <Save className="mr-3 h-6 w-6" />
                                        {processing ? 'Creating Patient...' : 'Complete Registration'}
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

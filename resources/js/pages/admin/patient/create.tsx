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
import { PatientPageLayout, PatientActionButton, PatientFormSection } from '@/components/patient/PatientPageLayout';
import { CardDescription } from '@/components/ui/card';
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
        email: '',

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

    const steps = [
        { id: 1, title: 'Patient Information', description: 'Basic patient details' },
        { id: 2, title: 'Contact Details', description: 'Address and contact information' },
        { id: 3, title: 'Emergency Contact', description: 'Emergency contact information' },
        { id: 4, title: 'Insurance & Financial', description: 'Insurance and financial details' },
        { id: 5, title: 'Medical History', description: 'Medical history and allergies' },
    ];

    const renderStep = (step: number) => {
        switch (step) {
            case 1:
                return (
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
                                <Select onValueChange={(value: 'male' | 'female') => setData('sex', value)} value={data.sex}>
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
                );

            case 2:
                return (
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
                            <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="mt-1"
                                placeholder="Enter email address"
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>
                    </div>
                );

            case 3:
                return (
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
                );

            case 4:
                return (
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
                );

            case 5:
                return (
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
                                placeholder="Lifestyle, habits, occupation, social factors"
                            />
                        </div>
                        <div>
                            <Label htmlFor="obstetrics_gynecology_history" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Heart className="h-4 w-4" />
                                Obstetrics & Gynecology History (Female Patients)
                            </Label>
                            <Textarea
                                id="obstetrics_gynecology_history"
                                name="obstetrics_gynecology_history"
                                value={data.obstetrics_gynecology_history}
                                onChange={(e) => setData('obstetrics_gynecology_history', e.target.value)}
                                className="mt-1"
                                rows={3}
                                placeholder="Pregnancy history, menstrual history, gynecological conditions"
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register New Patient" />
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
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
                        <div className="rounded-md border border-gray-300 bg-gray-50 p-4 text-sm text-black mb-6">
                            <div className="mb-2 font-medium">Possible duplicate found</div>
                            <div>
                                {duplicate.last_name}, {duplicate.first_name}
                                {duplicate.birthdate ? ` • ${duplicate.birthdate}` : ''}
                                {duplicate.mobile_no ? ` • ${duplicate.mobile_no}` : ''}
                                {duplicate.patient_no ? ` • Patient No: ${duplicate.patient_no}` : ''}
                            </div>
                            <div className="mt-3 flex gap-2">
                                <Button variant="secondary" asChild className="bg-green-600 hover:bg-green-700 text-white">
                                    <Link href={`/admin/patient/${duplicate.id}`}>View Existing</Link>
                                </Button>
                                <Button variant="destructive" onClick={proceedDuplicate}>
                                    Create Anyway
                                </Button>
                            </div>
                        </div>
                    ) : (
                        (flash?.error as string | undefined) && (
                            <div className="rounded-md border border-gray-300 bg-gray-50 p-4 text-sm text-black mb-6">{String(flash?.error as string)}</div>
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
                                {renderStep(currentStep)}
                                
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
                                            onClick={nextStep}
                                        >
                                            Next
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {processing ? (
                                                <>
                                                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Submit Registration
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

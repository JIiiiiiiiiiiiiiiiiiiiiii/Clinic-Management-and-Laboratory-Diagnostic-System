import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { type BreadcrumbItem } from '@/types';
import { CreatePatientItem } from '@/types/patients';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Save, User, Calendar, Phone, MapPin, Heart, Shield, FileText, Activity, Stethoscope, Plus } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patient Management',
        href: '/admin/patient',
    },
    {
        title: 'Create Patient',
        href: '/admin/patient/create',
    },
];

type Doctor = { id: number; name: string };

export default function CreatePatient({ doctors = [] as Doctor[], next_patient_no = '' }: { doctors?: Doctor[]; next_patient_no?: string }) {
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
        // patient_no is not included in form data - backend generates it

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

    // No autofill needed for patient registration

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Patient" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <Heading title="Register New Patient" description="ST. JAMES HOSPITAL INC. Patient Registration Form" icon={User} />
                </div>

                {/* Error alert / Duplicate confirmation */}
                {duplicate ? (
                    <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
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
                        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">{String(flash?.error as string)}</div>
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

                <form onSubmit={submit} className="space-y-8">
                    {/* Patient Identification */}
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        {/* Header Section - No gaps */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Patient Identification</h3>
                                    <p className="text-blue-100 mt-1">Enter basic patient information</p>
                                </div>
                            </div>
                        </div>
                        {/* Content Section - Seamlessly connected */}
                        <div className="px-6 py-6 bg-gradient-to-br from-blue-50 to-blue-100">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label htmlFor="last_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Last Name *
                                    </Label>
                                    <Input
                                        id="last_name"
                                        name="last_name"
                                        autoComplete="family-name"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        className={`h-12 !border-0 !border-none hover:!border-0 focus:!border-0 focus:!ring-0 rounded-xl shadow-sm ${errors.last_name ? 'border-red-500' : ''}`}
                                        style={{ border: 'none', outline: 'none' }}
                                        placeholder="Enter last name"
                                    />
                                    {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="first_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        First Name *
                                    </Label>
                                    <Input
                                        id="first_name"
                                        name="first_name"
                                        autoComplete="given-name"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        className={`h-12 !border-0 !border-none hover:!border-0 focus:!border-0 focus:!ring-0 rounded-xl shadow-sm ${errors.first_name ? 'border-red-500' : ''}`}
                                        style={{ border: 'none', outline: 'none' }}
                                        placeholder="Enter first name"
                                    />
                                    {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
                                </div>
                            </div>
                            <div className="mt-6 grid gap-6 md:grid-cols-3">
                                <div className="space-y-3">
                                    <Label htmlFor="middle_name" className="text-sm font-semibold text-gray-700">Middle Name</Label>
                                    <Input
                                        id="middle_name"
                                        name="middle_name"
                                        autoComplete="additional-name"
                                        value={data.middle_name}
                                        onChange={(e) => setData('middle_name', e.target.value)}
                                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                                        placeholder="Enter middle name"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="birthdate" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Birthdate *
                                    </Label>
                                    <Input
                                        id="birthdate"
                                        name="birthdate"
                                        autoComplete="bday"
                                        type="date"
                                        value={data.birthdate}
                                        onChange={(e) => onBirthdateChange(e.target.value)}
                                        className={`h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm ${errors.birthdate ? 'border-red-500' : ''}`}
                                    />
                                    {errors.birthdate && <p className="text-sm text-red-500">{errors.birthdate}</p>}
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="age" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Heart className="h-5 w-5" />
                                        Age *
                                    </Label>
                                    <Input
                                        id="age"
                                        name="age"
                                        type="number"
                                        value={data.age}
                                        onChange={(e) => setData('age', Number(e.target.value))}
                                        className={`h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm ${errors.age ? 'border-red-500' : ''}`}
                                        placeholder="Enter age"
                                    />
                                    {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
                                </div>
                            </div>
                            <div className="mt-6 grid gap-6 md:grid-cols-3">
                                <div className="space-y-3">
                                    <Label htmlFor="sex" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Heart className="h-5 w-5" />
                                        Sex *
                                    </Label>
                                    <Select onValueChange={(value: 'male' | 'female') => setData('sex', value)} defaultValue={data.sex}>
                                        <SelectTrigger id="sex" className={`h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm ${errors.sex ? 'border-red-500' : ''}`}>
                                            <SelectValue placeholder="Select sex" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.sex && <p className="text-sm text-red-500">{errors.sex}</p>}
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="patient_no" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Patient No.
                                    </Label>
                                    <Input 
                                        id="patient_no" 
                                        name="patient_no" 
                                        value={next_patient_no} 
                                        readOnly 
                                        disabled 
                                        className="h-12 bg-gray-100 !border-0 !border-none hover:!border-0 rounded-xl shadow-sm"
                                        style={{ border: 'none', outline: 'none' }}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="nationality" className="text-sm font-semibold text-gray-700">Nationality</Label>
                                    <Input
                                        id="nationality"
                                        name="nationality"
                                        autoComplete="country-name"
                                        value={data.nationality}
                                        onChange={(e) => setData('nationality', e.target.value)}
                                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                                        placeholder="Enter nationality"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Demographics */}
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        {/* Header Section - No gaps */}
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Activity className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Demographics</h3>
                                    <p className="text-purple-100 mt-1">Personal and social information</p>
                                </div>
                            </div>
                        </div>
                        {/* Content Section - Seamlessly connected */}
                        <div className="px-6 py-6 bg-gradient-to-br from-purple-50 to-purple-100">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label htmlFor="occupation" className="text-sm font-semibold text-gray-700">Occupation</Label>
                                    <Input
                                        id="occupation"
                                        name="occupation"
                                        value={data.occupation}
                                        onChange={(e) => setData('occupation', e.target.value)}
                                        className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm"
                                        placeholder="Enter occupation"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="religion" className="text-sm font-semibold text-gray-700">Religion</Label>
                                    <Input
                                        id="religion"
                                        name="religion"
                                        value={data.religion}
                                        onChange={(e) => setData('religion', e.target.value)}
                                        className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm"
                                        placeholder="Enter religion"
                                    />
                                </div>
                            </div>
                            <div className="mt-6">
                                <div className="space-y-3">
                                    <Label htmlFor="civil_status" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Heart className="h-5 w-5" />
                                        Civil Status *
                                    </Label>
                                    <Select onValueChange={(value: any) => setData('civil_status', value)} defaultValue={data.civil_status}>
                                        <SelectTrigger id="civil_status" className={`h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm ${errors.civil_status ? 'border-red-500' : ''}`}>
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
                                    {errors.civil_status && <p className="text-sm text-red-500">{errors.civil_status}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        {/* Header Section - No gaps */}
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Contact Information</h3>
                                    <p className="text-green-100 mt-1">Address and communication details</p>
                                </div>
                            </div>
                        </div>
                        {/* Content Section - Seamlessly connected */}
                        <div className="px-6 py-6 bg-gradient-to-br from-green-50 to-green-100">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="present_address" className="text-sm font-semibold text-gray-700">Present Address *</Label>
                                    <Textarea
                                        id="present_address"
                                        name="present_address"
                                        autoComplete="street-address"
                                        value={data.present_address}
                                        onChange={(e) => setData('present_address', e.target.value)}
                                        placeholder="Enter complete address"
                                        className={errors.present_address ? 'border-red-500' : ''}
                                    />
                                    {errors.present_address && <p className="text-sm text-red-500">{errors.present_address}</p>}
                                </div>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="telephone_no" className="text-sm font-semibold text-gray-700">Telephone No.</Label>
                                        <Input
                                            id="telephone_no"
                                            name="telephone_no"
                                            autoComplete="tel"
                                            value={data.telephone_no}
                                            onChange={(e) => setData('telephone_no', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="mobile_no" className="text-sm font-semibold text-gray-700">Mobile No. *</Label>
                                        <Input
                                            id="mobile_no"
                                            name="mobile_no"
                                            autoComplete="tel"
                                            value={data.mobile_no}
                                            onChange={(e) => setData('mobile_no', e.target.value)}
                                            className={errors.mobile_no ? 'border-red-500' : ''}
                                        />
                                        {errors.mobile_no && <p className="text-sm text-red-500">{errors.mobile_no}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        {/* Header Section - No gaps */}
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Heart className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Emergency Contact</h3>
                                    <p className="text-orange-100 mt-1">Emergency contact person details</p>
                                </div>
                            </div>
                        </div>
                        {/* Content Section - Seamlessly connected */}
                        <div className="px-6 py-6 bg-gradient-to-br from-orange-50 to-orange-100">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="informant_name" className="text-sm font-semibold text-gray-700">Informant Name *</Label>
                                    <Input
                                        id="informant_name"
                                        value={data.informant_name}
                                        onChange={(e) => setData('informant_name', e.target.value)}
                                        className={errors.informant_name ? 'border-red-500' : ''}
                                    />
                                    {errors.informant_name && <p className="text-sm text-red-500">{errors.informant_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="relationship" className="text-sm font-semibold text-gray-700">Relationship *</Label>
                                    <Input
                                        id="relationship"
                                        value={data.relationship}
                                        onChange={(e) => setData('relationship', e.target.value)}
                                        className={errors.relationship ? 'border-red-500' : ''}
                                    />
                                    {errors.relationship && <p className="text-sm text-red-500">{errors.relationship}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial/Insurance */}
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        {/* Header Section - No gaps */}
                        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Financial/Insurance Information</h3>
                                    <p className="text-indigo-100 mt-1">Insurance and payment details</p>
                                </div>
                            </div>
                        </div>
                        {/* Content Section - Seamlessly connected */}
                        <div className="px-6 py-6 bg-gradient-to-br from-indigo-50 to-indigo-100">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="company_name" className="text-sm font-semibold text-gray-700">Company Name</Label>
                                    <Input
                                        id="company_name"
                                        name="company_name"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hmo_name" className="text-sm font-semibold text-gray-700">HMO Name</Label>
                                    <Input
                                        id="hmo_name"
                                        name="hmo_name"
                                        value={data.hmo_name}
                                        onChange={(e) => setData('hmo_name', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="mt-6 grid gap-6 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="hmo_company_id_no" className="text-sm font-semibold text-gray-700">HMO/Company ID No.</Label>
                                    <Input
                                        id="hmo_company_id_no"
                                        name="hmo_company_id_no"
                                        value={data.hmo_company_id_no}
                                        onChange={(e) => setData('hmo_company_id_no', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="validation_approval_code" className="text-sm font-semibold text-gray-700">Validation/Approval Code</Label>
                                    <Input
                                        id="validation_approval_code"
                                        name="validation_approval_code"
                                        value={data.validation_approval_code}
                                        onChange={(e) => setData('validation_approval_code', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="validity" className="text-sm font-semibold text-gray-700">Validity</Label>
                                    <Input
                                        id="validity"
                                        name="validity"
                                        value={data.validity}
                                        onChange={(e) => setData('validity', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medical History & Allergies */}
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        {/* Header Section - No gaps */}
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Heart className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Medical History & Allergies</h3>
                                    <p className="text-red-100 mt-1">Medical background and allergy information</p>
                                </div>
                            </div>
                        </div>
                        {/* Content Section - Seamlessly connected */}
                        <div className="px-6 py-6 bg-gradient-to-br from-red-50 to-red-100">
                            <div className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="drug_allergies" className="text-sm font-semibold text-gray-700">Drug Allergies</Label>
                                        <Input
                                            id="drug_allergies"
                                            name="drug_allergies"
                                            value={data.drug_allergies}
                                            onChange={(e) => setData('drug_allergies', e.target.value)}
                                            placeholder="Enter allergies or NONE"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="food_allergies" className="text-sm font-semibold text-gray-700">Food Allergies</Label>
                                        <Input
                                            id="food_allergies"
                                            name="food_allergies"
                                            value={data.food_allergies}
                                            onChange={(e) => setData('food_allergies', e.target.value)}
                                            placeholder="Enter allergies or NONE"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="past_medical_history" className="text-sm font-semibold text-gray-700">Past Medical History</Label>
                                    <Textarea
                                        id="past_medical_history"
                                        name="past_medical_history"
                                        value={data.past_medical_history}
                                        onChange={(e) => setData('past_medical_history', e.target.value)}
                                        placeholder="Previous medical conditions, surgeries, hospitalizations"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="family_history" className="text-sm font-semibold text-gray-700">Family History</Label>
                                    <Textarea
                                        id="family_history"
                                        name="family_history"
                                        value={data.family_history}
                                        onChange={(e) => setData('family_history', e.target.value)}
                                        placeholder="Family medical history, hereditary conditions"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="social_personal_history" className="text-sm font-semibold text-gray-700">Social/Personal History</Label>
                                    <Textarea
                                        id="social_personal_history"
                                        name="social_personal_history"
                                        value={data.social_personal_history}
                                        onChange={(e) => setData('social_personal_history', e.target.value)}
                                        placeholder="Lifestyle, habits, occupation, social factors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="obstetrics_gynecology_history" className="text-sm font-semibold text-gray-700">Obstetrics & Gynecology History (Female Patients)</Label>
                                    <Textarea
                                        id="obstetrics_gynecology_history"
                                        name="obstetrics_gynecology_history"
                                        value={data.obstetrics_gynecology_history}
                                        onChange={(e) => setData('obstetrics_gynecology_history', e.target.value)}
                                        placeholder="Pregnancy history, menstrual history, gynecological conditions"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-6">
                        <Button asChild variant="secondary" className="px-8 py-4 h-14 border-gray-300 hover:bg-gray-50 rounded-xl text-lg font-semibold">
                            <Link href="/admin/patient">Cancel</Link>
                        </Button>
                        <Button 
                            disabled={processing} 
                            type="submit"
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 h-14 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-lg font-semibold"
                        >
                            <Save className="mr-3 h-6 w-6" />
                            {processing ? 'Creating...' : 'Create Patient'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

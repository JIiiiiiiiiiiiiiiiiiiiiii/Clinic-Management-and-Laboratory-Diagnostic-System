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
import { type BreadcrumbItem } from '@/types';
import { PatientItem } from '@/types/patients';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, User, Activity, Phone, Heart, Shield, Edit, Calendar, Stethoscope, Clock, MapPin } from 'lucide-react';
import Heading from '@/components/heading';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patient Management',
        href: '/admin/patient',
    },
    {
        title: 'Edit Patient',
        href: '/admin/patient/edit',
    },
];

type Doctor = { id: number; name: string };

interface EditPatientProps {
    patient: PatientItem;
    doctors?: Doctor[];
}

export default function EditPatient({ patient, doctors = [] }: EditPatientProps) {
    const normalizeDate = (value: string | null | undefined) => (value ? String(value).slice(0, 10) : '');
    const normalizeTime = (value: string | null | undefined) => {
        if (!value) return '';
        const str = String(value);
        const match = str.match(/\d{2}:\d{2}/);
        return match ? match[0] : str;
    };
    const nv = (v?: string | null) => v ?? '';
    const nn = (v?: number | null) => v ?? 0;
    const { data, setData, processing, errors, reset } = useForm({
        // Patient Identification
        last_name: nv(patient.last_name),
        first_name: nv(patient.first_name),
        middle_name: nv(patient.middle_name),
        birthdate: normalizeDate(patient.birthdate),
        age: patient.age,
        sex: patient.sex,
        patient_no: nv(patient.patient_no),

        // Demographics
        occupation: nv(patient.occupation),
        religion: nv(patient.religion),
        civil_status: nv(patient.civil_status),
        nationality: nv(patient.nationality),

        // Contact Information
        present_address: nv(patient.present_address),
        telephone_no: nv(patient.telephone_no),
        mobile_no: nv(patient.mobile_no),

        // Emergency Contact
        informant_name: nv(patient.informant_name),
        relationship: nv(patient.relationship),

        // Financial/Insurance
        company_name: nv(patient.company_name),
        hmo_name: nv(patient.hmo_name),
        hmo_company_id_no: nv(patient.hmo_company_id_no),
        validation_approval_code: nv(patient.validation_approval_code),
        validity: nv(patient.validity),

        // Medical History & Allergies
        drug_allergies: nv(patient.drug_allergies),
        food_allergies: nv(patient.food_allergies),
        past_medical_history: nv(patient.past_medical_history),
        family_history: nv(patient.family_history),
        social_personal_history: nv(patient.social_personal_history),
        obstetrics_gynecology_history: nv(patient.obstetrics_gynecology_history),
    });

    // Keep age consistent if birthdate changes
    const onBirthdateChange = (value: string) => {
        setData('birthdate', value);
        if (value) {
            const today = new Date();
            const b = new Date(value);
            let age = today.getFullYear() - b.getFullYear();
            const m = today.getMonth() - b.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
            setData('age', Math.max(0, age));
        }
    };

    const [showMissingModal, setShowMissingModal] = useState(false);
    const [missingFields, setMissingFields] = useState<string[]>([]);

    const submit: React.FormEventHandler = (e) => {
        e.preventDefault();
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
        ];
        const missing = requiredChecks.filter((c) => !c.isValid((data as any)[c.key]));
        if (missing.length > 0) {
            setMissingFields(missing.map((m) => m.label));
            setShowMissingModal(true);
            const el = document.getElementById(missing[0].key as string);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.focus();
            return;
        }
        router.put(`/admin/patient/${patient.id}`, data, {
            onError: (errs) => {
                const keys = Object.keys(errs || {});
                if (keys.length > 0) {
                    const el = document.getElementById(keys[0]);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.focus();
                }
            },
            onSuccess: () => {
                router.visit('/admin/patient');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Patient" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button asChild variant="ghost" size="icon" className="bg-white hover:bg-gray-50 shadow-md">
                                <Link href="/admin/patient">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Heading 
                                title="Edit Patient" 
                                description="ST. JAMES HOSPITAL INC. Emergency Department Patient Data Sheet" 
                                icon={Edit} 
                            />
                        </div>
                    </div>
                </div>

                {/* Error alert */}
                {((usePage().props as any).flash?.error as string | undefined) && (
                    <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                        {String((usePage().props as any).flash?.error as string)}
                    </div>
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
                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Patient Identification</h3>
                                    <p className="text-blue-100 mt-1">Basic patient information and demographics</p>
                                </div>
                            </div>
                        </div>
                        {/* Content Section */}
                        <div className="px-6 py-6 bg-gradient-to-br from-blue-50 to-blue-100">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="last_name" className="text-base font-bold text-gray-700">Last Name *</Label>
                                    <Input
                                        id="last_name"
                                        name="last_name"
                                        autoComplete="family-name"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        className={errors.last_name ? 'border-red-500' : ''}
                                    />
                                    {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="first_name" className="text-base font-bold text-gray-700">First Name *</Label>
                                    <Input
                                        id="first_name"
                                        name="first_name"
                                        autoComplete="given-name"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        className={errors.first_name ? 'border-red-500' : ''}
                                    />
                                    {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
                                </div>
                            </div>
                            <div className="mt-6 grid gap-6 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="middle_name" className="text-base font-bold text-gray-700">Middle Name</Label>
                                    <Input
                                        id="middle_name"
                                        name="middle_name"
                                        autoComplete="additional-name"
                                        value={data.middle_name}
                                        onChange={(e) => setData('middle_name', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="birthdate" className="text-base font-bold text-gray-700">Birthdate *</Label>
                                    <Input
                                        id="birthdate"
                                        name="birthdate"
                                        autoComplete="bday"
                                        type="date"
                                        value={data.birthdate}
                                        onChange={(e) => onBirthdateChange(e.target.value)}
                                        className={errors.birthdate ? 'border-red-500' : ''}
                                    />
                                    {errors.birthdate && <p className="text-sm text-red-500">{errors.birthdate}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="age" className="text-base font-bold text-gray-700">Age *</Label>
                                    <Input
                                        id="age"
                                        name="age"
                                        type="number"
                                        value={data.age}
                                        onChange={(e) => setData('age', Number(e.target.value))}
                                        className={errors.age ? 'border-red-500' : ''}
                                    />
                                    {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
                                </div>
                            </div>
                            <div className="mt-6 grid gap-6 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="sex" className="text-base font-bold text-gray-700">Sex *</Label>
                                    <Select onValueChange={(value: 'male' | 'female') => setData('sex', value)} defaultValue={data.sex}>
                                        <SelectTrigger id="sex" className={errors.sex ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select sex" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.sex && <p className="text-sm text-red-500">{errors.sex}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="patient_no" className="text-base font-bold text-gray-700">Patient No.</Label>
                                    <Input
                                        id="patient_no"
                                        name="patient_no"
                                        value={data.patient_no}
                                        onChange={(e) => setData('patient_no', e.target.value)}
                                        className={errors.patient_no ? 'border-red-500' : ''}
                                    />
                                    {errors.patient_no && <p className="text-sm text-red-500">{errors.patient_no}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nationality" className="text-base font-bold text-gray-700">Nationality</Label>
                                    <Input
                                        id="nationality"
                                        name="nationality"
                                        autoComplete="country-name"
                                        value={data.nationality}
                                        onChange={(e) => setData('nationality', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Demographics */}
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                    <Activity className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Demographics</h3>
                                    <p className="text-purple-100 mt-1">Personal and social information</p>
                                </div>
                            </div>
                        </div>
                        {/* Content Section */}
                        <div className="px-6 py-6 bg-gradient-to-br from-purple-50 to-purple-100">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="occupation" className="text-base font-bold text-gray-700">Occupation</Label>
                                    <Input
                                        id="occupation"
                                        name="occupation"
                                        value={data.occupation}
                                        onChange={(e) => setData('occupation', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="religion" className="text-base font-bold text-gray-700">Religion</Label>
                                    <Input
                                        id="religion"
                                        name="religion"
                                        value={data.religion}
                                        onChange={(e) => setData('religion', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="mt-6 grid gap-6 md:grid-cols-1">
                                <div className="space-y-2">
                                    <Label htmlFor="civil_status" className="text-base font-bold text-gray-700">Civil Status *</Label>
                                    <Select onValueChange={(value: any) => setData('civil_status', value)} defaultValue={data.civil_status}>
                                        <SelectTrigger id="civil_status" className={errors.civil_status ? 'border-red-500' : ''}>
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
                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Contact Information</h3>
                                    <p className="text-emerald-100 mt-1">Address and communication details</p>
                                </div>
                            </div>
                        </div>
                        {/* Content Section */}
                        <div className="px-6 py-6 bg-gradient-to-br from-emerald-50 to-emerald-100">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="present_address" className="text-base font-bold text-gray-700">Present Address *</Label>
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
                                        <Label htmlFor="telephone_no" className="text-base font-bold text-gray-700">Telephone No.</Label>
                                        <Input
                                            id="telephone_no"
                                            name="telephone_no"
                                            autoComplete="tel"
                                            value={data.telephone_no}
                                            onChange={(e) => setData('telephone_no', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="mobile_no" className="text-base font-bold text-gray-700">Mobile No. *</Label>
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
                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                    <Heart className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Emergency Contact</h3>
                                    <p className="text-orange-100 mt-1">Emergency contact person details</p>
                                </div>
                            </div>
                        </div>
                        {/* Content Section */}
                        <div className="px-6 py-6 bg-gradient-to-br from-orange-50 to-orange-100">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="informant_name" className="text-base font-bold text-gray-700">Informant Name *</Label>
                                    <Input
                                        id="informant_name"
                                        value={data.informant_name}
                                        onChange={(e) => setData('informant_name', e.target.value)}
                                        className={errors.informant_name ? 'border-red-500' : ''}
                                    />
                                    {errors.informant_name && <p className="text-sm text-red-500">{errors.informant_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="relationship" className="text-base font-bold text-gray-700">Relationship *</Label>
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
                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Financial/Insurance Information</h3>
                                    <p className="text-indigo-100 mt-1">Insurance and financial details</p>
                                </div>
                            </div>
                        </div>
                        {/* Content Section */}
                        <div className="px-6 py-6 bg-gradient-to-br from-indigo-50 to-indigo-100">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="company_name" className="text-base font-bold text-gray-700">Company Name</Label>
                                    <Input id="company_name" value={data.company_name} onChange={(e) => setData('company_name', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hmo_name" className="text-base font-bold text-gray-700">HMO Name</Label>
                                    <Input id="hmo_name" value={data.hmo_name} onChange={(e) => setData('hmo_name', e.target.value)} />
                                </div>
                            </div>
                            <div className="mt-6 grid gap-6 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="hmo_company_id_no" className="text-base font-bold text-gray-700">HMO/Company ID No.</Label>
                                    <Input
                                        id="hmo_company_id_no"
                                        value={data.hmo_company_id_no}
                                        onChange={(e) => setData('hmo_company_id_no', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="validation_approval_code" className="text-base font-bold text-gray-700">Validation/Approval Code</Label>
                                    <Input
                                        id="validation_approval_code"
                                        value={data.validation_approval_code}
                                        onChange={(e) => setData('validation_approval_code', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="validity" className="text-base font-bold text-gray-700">Validity</Label>
                                    <Input id="validity" value={data.validity} onChange={(e) => setData('validity', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medical History & Allergies */}
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                    <Stethoscope className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Medical History & Allergies</h3>
                                    <p className="text-yellow-100 mt-1">Medical background and allergy information</p>
                                </div>
                            </div>
                        </div>
                        {/* Content Section */}
                        <div className="px-6 py-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="drug_allergies" className="text-base font-bold text-gray-700">Drug Allergies</Label>
                                    <Input
                                        id="drug_allergies"
                                        value={data.drug_allergies}
                                        onChange={(e) => setData('drug_allergies', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="food_allergies" className="text-base font-bold text-gray-700">Food Allergies</Label>
                                    <Input
                                        id="food_allergies"
                                        value={data.food_allergies}
                                        onChange={(e) => setData('food_allergies', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* No vital signs or visit assessment in patient edit */}

                    {/* No visit assessment in patient edit */}

                    {/* Action Buttons */}
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                    <Save className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Save Changes</h3>
                                    <p className="text-gray-100 mt-1">Update patient information</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6 bg-gradient-to-br from-gray-50 to-gray-100">
                            <div className="flex items-center justify-end gap-6">
                                <Button asChild className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl">
                                    <Link href="/admin/patient">Cancel</Link>
                                </Button>
                                <Button disabled={processing} type="submit" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-lg font-semibold">
                                    <Save className="mr-3 h-6 w-6" />
                                    {processing ? 'Updating...' : 'Update Patient'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

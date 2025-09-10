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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CreatePatientItem } from '@/types/patients';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
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
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="icon">
                            <Link href="/admin/patient">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Register New Patient</h1>
                            <p className="text-muted-foreground">ST. JAMES HOSPITAL INC. Patient Registration Form</p>
                        </div>
                    </div>
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
                            <Button variant="outline" asChild>
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

                <form onSubmit={submit} className="space-y-6">
                    {/* Patient Identification */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Patient Identification</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last Name *</Label>
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
                                    <Label htmlFor="first_name">First Name *</Label>
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
                                    <Label htmlFor="middle_name">Middle Name</Label>
                                    <Input
                                        id="middle_name"
                                        name="middle_name"
                                        autoComplete="additional-name"
                                        value={data.middle_name}
                                        onChange={(e) => setData('middle_name', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="birthdate">Birthdate *</Label>
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
                                    <Label htmlFor="age">Age *</Label>
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
                                    <Label htmlFor="sex">Sex *</Label>
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
                                    <Label htmlFor="patient_no">Patient No.</Label>
                                    <Input id="patient_no" name="patient_no" value={next_patient_no} readOnly disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nationality">Nationality</Label>
                                    <Input
                                        id="nationality"
                                        name="nationality"
                                        autoComplete="country-name"
                                        value={data.nationality}
                                        onChange={(e) => setData('nationality', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Demographics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Demographics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="occupation">Occupation</Label>
                                    <Input
                                        id="occupation"
                                        name="occupation"
                                        value={data.occupation}
                                        onChange={(e) => setData('occupation', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="religion">Religion</Label>
                                    <Input
                                        id="religion"
                                        name="religion"
                                        value={data.religion}
                                        onChange={(e) => setData('religion', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="mt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="civil_status">Civil Status *</Label>
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
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="present_address">Present Address *</Label>
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
                                        <Label htmlFor="telephone_no">Telephone No.</Label>
                                        <Input
                                            id="telephone_no"
                                            name="telephone_no"
                                            autoComplete="tel"
                                            value={data.telephone_no}
                                            onChange={(e) => setData('telephone_no', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="mobile_no">Mobile No. *</Label>
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
                        </CardContent>
                    </Card>

                    {/* Emergency Contact */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Emergency Contact</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="informant_name">Informant Name *</Label>
                                    <Input
                                        id="informant_name"
                                        value={data.informant_name}
                                        onChange={(e) => setData('informant_name', e.target.value)}
                                        className={errors.informant_name ? 'border-red-500' : ''}
                                    />
                                    {errors.informant_name && <p className="text-sm text-red-500">{errors.informant_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="relationship">Relationship *</Label>
                                    <Input
                                        id="relationship"
                                        value={data.relationship}
                                        onChange={(e) => setData('relationship', e.target.value)}
                                        className={errors.relationship ? 'border-red-500' : ''}
                                    />
                                    {errors.relationship && <p className="text-sm text-red-500">{errors.relationship}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial/Insurance */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial/Insurance Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="company_name">Company Name</Label>
                                    <Input
                                        id="company_name"
                                        name="company_name"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hmo_name">HMO Name</Label>
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
                                    <Label htmlFor="hmo_company_id_no">HMO/Company ID No.</Label>
                                    <Input
                                        id="hmo_company_id_no"
                                        name="hmo_company_id_no"
                                        value={data.hmo_company_id_no}
                                        onChange={(e) => setData('hmo_company_id_no', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="validation_approval_code">Validation/Approval Code</Label>
                                    <Input
                                        id="validation_approval_code"
                                        name="validation_approval_code"
                                        value={data.validation_approval_code}
                                        onChange={(e) => setData('validation_approval_code', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="validity">Validity</Label>
                                    <Input
                                        id="validity"
                                        name="validity"
                                        value={data.validity}
                                        onChange={(e) => setData('validity', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Medical History & Allergies */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Medical History & Allergies</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="drug_allergies">Drug Allergies</Label>
                                        <Input
                                            id="drug_allergies"
                                            name="drug_allergies"
                                            value={data.drug_allergies}
                                            onChange={(e) => setData('drug_allergies', e.target.value)}
                                            placeholder="Enter allergies or NONE"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="food_allergies">Food Allergies</Label>
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
                                    <Label htmlFor="past_medical_history">Past Medical History</Label>
                                    <Textarea
                                        id="past_medical_history"
                                        name="past_medical_history"
                                        value={data.past_medical_history}
                                        onChange={(e) => setData('past_medical_history', e.target.value)}
                                        placeholder="Previous medical conditions, surgeries, hospitalizations"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="family_history">Family History</Label>
                                    <Textarea
                                        id="family_history"
                                        name="family_history"
                                        value={data.family_history}
                                        onChange={(e) => setData('family_history', e.target.value)}
                                        placeholder="Family medical history, hereditary conditions"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="social_personal_history">Social/Personal History</Label>
                                    <Textarea
                                        id="social_personal_history"
                                        name="social_personal_history"
                                        value={data.social_personal_history}
                                        onChange={(e) => setData('social_personal_history', e.target.value)}
                                        placeholder="Lifestyle, habits, occupation, social factors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="obstetrics_gynecology_history">Obstetrics & Gynecology History (Female Patients)</Label>
                                    <Textarea
                                        id="obstetrics_gynecology_history"
                                        name="obstetrics_gynecology_history"
                                        value={data.obstetrics_gynecology_history}
                                        onChange={(e) => setData('obstetrics_gynecology_history', e.target.value)}
                                        placeholder="Pregnancy history, menstrual history, gynecological conditions"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-4">
                        <Button asChild variant="outline">
                            <Link href="/admin/patient">Cancel</Link>
                        </Button>
                        <Button disabled={processing} type="submit">
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Creating...' : 'Create Patient'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CreatePatientItem } from '@/types/patients';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useEffect } from 'react';

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

export default function CreatePatient({ doctors = [] as Doctor[] }: { doctors?: Doctor[] }) {
    const { data, setData, processing, errors, reset } = useForm<CreatePatientItem>({
        // Arrival Information
        arrival_date: '',
        arrival_time: '',

        // Patient Identification
        last_name: '',
        first_name: '',
        middle_name: '',
        birthdate: '',
        age: 0,
        sex: 'male',
        patient_no: '',

        // Demographics
        occupation: '',
        religion: '',
        attending_physician: '',
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

        // Emergency Staff Nurse Section
        mode_of_arrival: '',
        drug_allergies: 'NONE',
        food_allergies: 'NONE',

        // Vital Signs
        blood_pressure: '',
        heart_rate: '',
        respiratory_rate: '',
        temperature: '',
        weight_kg: 0,
        height_cm: 0,
        pain_assessment_scale: '',
        oxygen_saturation: '',

        // Medical Assessment
        reason_for_consult: '',
        time_seen: '',
        history_of_present_illness: '',
        pertinent_physical_findings: '',
        plan_management: '',
        past_medical_history: '',
        family_history: '',
        social_personal_history: '',
        obstetrics_gynecology_history: '',
        lmp: '',
        assessment_diagnosis: '',
    });

    // Autofill arrival date/time on mount using local time
    useEffect(() => {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        if (!data.arrival_date) setData('arrival_date', date);
        if (!data.arrival_time) setData('arrival_time', time);
        if (!data.time_seen) setData('time_seen', time);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        router.post(
            '/admin/patient',
            { ...data },
            {
                onError: (errs) => {
                    const keys = Object.keys(errs || {});
                    if (keys.length > 0) {
                        const el = document.getElementById(keys[0]);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.focus();
                    }
                },
                onSuccess: () => {
                    reset();
                },
            },
        );
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
                            <h1 className="text-2xl font-bold tracking-tight">Create New Patient</h1>
                            <p className="text-muted-foreground">ST. JAMES HOSPITAL INC. Emergency Department Patient Data Sheet</p>
                        </div>
                    </div>
                </div>

                {/* Error alert */}
                {((usePage().props as any).flash?.error as string | undefined) && (
                    <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                        {String((usePage().props as any).flash?.error as string)}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    {/* Arrival Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Arrival Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="arrival_date">Arrival Date *</Label>
                                    <Input
                                        id="arrival_date"
                                        type="date"
                                        value={data.arrival_date}
                                        onChange={(e) => setData('arrival_date', e.target.value)}
                                        className={errors.arrival_date ? 'border-red-500' : ''}
                                    />
                                    {errors.arrival_date && <p className="text-sm text-red-500">{errors.arrival_date}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="arrival_time">Arrival Time *</Label>
                                    <Input
                                        id="arrival_time"
                                        type="time"
                                        value={data.arrival_time}
                                        onChange={(e) => setData('arrival_time', e.target.value)}
                                        className={errors.arrival_time ? 'border-red-500' : ''}
                                    />
                                    {errors.arrival_time && <p className="text-sm text-red-500">{errors.arrival_time}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

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
                            <div className="mt-6 grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="attending_physician">Attending Physician *</Label>
                                    {doctors.length > 0 ? (
                                        <Select
                                            onValueChange={(value: string) => setData('attending_physician', value)}
                                            defaultValue={data.attending_physician || undefined}
                                        >
                                            <SelectTrigger id="attending_physician" className={errors.attending_physician ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select doctor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {doctors.map((d) => (
                                                    <SelectItem key={d.id} value={d.name}>
                                                        {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            id="attending_physician"
                                            name="attending_physician"
                                            value={data.attending_physician}
                                            onChange={(e) => setData('attending_physician', e.target.value)}
                                            className={errors.attending_physician ? 'border-red-500' : ''}
                                        />
                                    )}
                                    {errors.attending_physician && <p className="text-sm text-red-500">{errors.attending_physician}</p>}
                                </div>
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

                    {/* Emergency Staff Nurse Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Emergency Staff Nurse Section</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="mode_of_arrival">Mode of Arrival</Label>
                                    <Input
                                        id="mode_of_arrival"
                                        name="mode_of_arrival"
                                        value={data.mode_of_arrival}
                                        onChange={(e) => setData('mode_of_arrival', e.target.value)}
                                        placeholder="e.g., Ambulance, Walk-in, Private vehicle"
                                        className={errors.mode_of_arrival ? 'border-red-500' : ''}
                                    />
                                    {errors.mode_of_arrival && <p className="text-sm text-red-500">{errors.mode_of_arrival}</p>}
                                </div>
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
                            </div>
                            <div className="mt-6">
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
                        </CardContent>
                    </Card>

                    {/* Vital Signs */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Initial Vital Signs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="blood_pressure">Blood Pressure</Label>
                                    <Input
                                        id="blood_pressure"
                                        value={data.blood_pressure}
                                        onChange={(e) => setData('blood_pressure', e.target.value)}
                                        placeholder="e.g., 120/80"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="heart_rate">Heart Rate</Label>
                                    <Input
                                        id="heart_rate"
                                        value={data.heart_rate}
                                        onChange={(e) => setData('heart_rate', e.target.value)}
                                        placeholder="bpm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="respiratory_rate">Respiratory Rate</Label>
                                    <Input
                                        id="respiratory_rate"
                                        value={data.respiratory_rate}
                                        onChange={(e) => setData('respiratory_rate', e.target.value)}
                                        placeholder="breaths/min"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="temperature">Temperature</Label>
                                    <Input
                                        id="temperature"
                                        value={data.temperature}
                                        onChange={(e) => setData('temperature', e.target.value)}
                                        placeholder="°C"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 grid gap-6 md:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="weight_kg">Weight (kg)</Label>
                                    <Input
                                        id="weight_kg"
                                        type="number"
                                        step="0.1"
                                        value={data.weight_kg}
                                        onChange={(e) => setData('weight_kg', Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="height_cm">Height (cm)</Label>
                                    <Input
                                        id="height_cm"
                                        type="number"
                                        step="0.1"
                                        value={data.height_cm}
                                        onChange={(e) => setData('height_cm', Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pain_assessment_scale">Pain Assessment Scale</Label>
                                    <Input
                                        id="pain_assessment_scale"
                                        value={data.pain_assessment_scale}
                                        onChange={(e) => setData('pain_assessment_scale', e.target.value)}
                                        placeholder="0-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="oxygen_saturation">O2 Saturation</Label>
                                    <Input
                                        id="oxygen_saturation"
                                        value={data.oxygen_saturation}
                                        onChange={(e) => setData('oxygen_saturation', e.target.value)}
                                        placeholder="%"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Medical Assessment */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Medical Assessment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="reason_for_consult">Reason for Consult</Label>
                                        <Textarea
                                            id="reason_for_consult"
                                            name="reason_for_consult"
                                            value={data.reason_for_consult}
                                            onChange={(e) => setData('reason_for_consult', e.target.value)}
                                            placeholder="Primary reason for seeking medical attention"
                                            className={errors.reason_for_consult ? 'border-red-500' : ''}
                                        />
                                        {errors.reason_for_consult && <p className="text-sm text-red-500">{errors.reason_for_consult}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="time_seen">Time Seen *</Label>
                                        <Input
                                            id="time_seen"
                                            name="time_seen"
                                            type="time"
                                            value={data.time_seen}
                                            onChange={(e) => setData('time_seen', e.target.value)}
                                            className={errors.time_seen ? 'border-red-500' : ''}
                                        />
                                        {errors.time_seen && <p className="text-sm text-red-500">{errors.time_seen}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="history_of_present_illness">History of Present Illness</Label>
                                    <Textarea
                                        id="history_of_present_illness"
                                        name="history_of_present_illness"
                                        value={data.history_of_present_illness}
                                        onChange={(e) => setData('history_of_present_illness', e.target.value)}
                                        placeholder="Detailed history of current symptoms"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pertinent_physical_findings">Pertinent Physical Findings</Label>
                                    <Textarea
                                        id="pertinent_physical_findings"
                                        name="pertinent_physical_findings"
                                        value={data.pertinent_physical_findings}
                                        onChange={(e) => setData('pertinent_physical_findings', e.target.value)}
                                        placeholder="Physical examination findings"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="plan_management">Plan/Management</Label>
                                    <Textarea
                                        id="plan_management"
                                        name="plan_management"
                                        value={data.plan_management}
                                        onChange={(e) => setData('plan_management', e.target.value)}
                                        placeholder="Treatment plan and management"
                                    />
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="past_medical_history">Past Medical History</Label>
                                        <Textarea
                                            id="past_medical_history"
                                            name="past_medical_history"
                                            value={data.past_medical_history}
                                            onChange={(e) => setData('past_medical_history', e.target.value)}
                                            placeholder="Previous medical conditions"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="family_history">Family History</Label>
                                        <Textarea
                                            id="family_history"
                                            name="family_history"
                                            value={data.family_history}
                                            onChange={(e) => setData('family_history', e.target.value)}
                                            placeholder="Family medical history"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="social_personal_history">Social/Personal History</Label>
                                    <Textarea
                                        id="social_personal_history"
                                        name="social_personal_history"
                                        value={data.social_personal_history}
                                        onChange={(e) => setData('social_personal_history', e.target.value)}
                                        placeholder="Lifestyle, habits, social factors"
                                    />
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="obstetrics_gynecology_history">Obstetrics & Gynecology History (Female Patients)</Label>
                                        <Textarea
                                            id="obstetrics_gynecology_history"
                                            name="obstetrics_gynecology_history"
                                            value={data.obstetrics_gynecology_history}
                                            onChange={(e) => setData('obstetrics_gynecology_history', e.target.value)}
                                            placeholder="Pregnancy history, menstrual history"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lmp">Last Menstrual Period (LMP)</Label>
                                        <Input
                                            id="lmp"
                                            name="lmp"
                                            value={data.lmp}
                                            onChange={(e) => setData('lmp', e.target.value)}
                                            placeholder="Date of last period"
                                        />
                                        {errors.lmp && <p className="text-sm text-red-500">{errors.lmp}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="assessment_diagnosis">Assessment/Diagnosis</Label>
                                    <Textarea
                                        id="assessment_diagnosis"
                                        name="assessment_diagnosis"
                                        value={data.assessment_diagnosis}
                                        onChange={(e) => setData('assessment_diagnosis', e.target.value)}
                                        placeholder="Clinical assessment and diagnosis"
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

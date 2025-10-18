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
import { CustomDatePicker } from '@/components/ui/date-picker';
import { PatientPageLayout, PatientActionButton, PatientInfoCard } from '@/components/patient/PatientPageLayout';
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

    const { processing } = usePage().props as any;
    const [showMissingModal, setShowMissingModal] = useState(false);

    const { data, setData, submit, errors } = useForm({
        // Patient Identification
        last_name: patient.last_name || '',
        first_name: patient.first_name || '',
        middle_name: patient.middle_name || '',
        birthdate: normalizeDate(patient.birthdate),
        sex: patient.sex || '',
        civil_status: patient.civil_status || '',
        nationality: patient.nationality || '',

        // Demographics
        occupation: patient.occupation || '',
        religion: patient.religion || '',

        // Contact Information
        present_address: patient.present_address || '',
        telephone_no: patient.telephone_no || '',
        mobile_no: patient.mobile_no || '',

        // Emergency Contact
        emergency_name: patient.emergency_name || '',
        emergency_relation: patient.emergency_relation || '',

        // Financial/Insurance
        company_name: patient.company_name || '',
        hmo_name: patient.hmo_name || '',
        hmo_company_id_no: patient.hmo_company_id_no || '',
        validation_approval_code: patient.validation_approval_code || '',
        validity: patient.validity || '',

        // Medical History
        drug_allergies: patient.drug_allergies || '',
        food_allergies: patient.food_allergies || '',
        past_medical_history: patient.past_medical_history || '',
        family_history: patient.family_history || '',
        social_personal_history: patient.social_personal_history || '',
        obstetrics_gynecology_history: patient.obstetrics_gynecology_history || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check for required fields
        const requiredFields = [
            'last_name', 'first_name', 'birth_date', 'sex', 'civil_status',
            'present_address', 'contact_number', 'informant_name', 'informant_relationship', 'informant_contact'
        ];
        
        const missingFields = requiredFields.filter(field => !data[field as keyof typeof data]);
        
        if (missingFields.length > 0) {
            setShowMissingModal(true);
            return;
        }
        
        submit('put', `/admin/patient/${patient.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Patient" />
            <PatientPageLayout
                title="Edit Patient"
                description={`Patient No: ${patient.patient_no}`}
                icon={<Edit className="h-6 w-6" />}
                actions={
                    <PatientActionButton
                        variant="outline"
                        icon={<ArrowLeft className="h-4 w-4" />}
                        label="Back to Patients"
                        href="/admin/patient"
                    />
                }
            >
                <AlertDialog open={showMissingModal} onOpenChange={setShowMissingModal}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Missing Required Fields</AlertDialogTitle>
                        </AlertDialogHeader>
                        <div className="py-4">
                            <p className="text-sm text-gray-600">
                                Please fill in all required fields before submitting the form.
                            </p>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogAction onClick={() => setShowMissingModal(false)}>OK</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Patient Identification */}
                    <PatientInfoCard
                        title="Patient Identification"
                        icon={<User className="h-5 w-5 text-black" />}
                    >
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="last_name" className="text-base font-bold text-gray-700">Last Name *</Label>
                                    <Input
                                        id="last_name"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        className="w-full"
                                        required
                                    />
                                    {errors.last_name && <p className="text-black text-sm">{errors.last_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="first_name" className="text-base font-bold text-gray-700">First Name *</Label>
                                    <Input
                                        id="first_name"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        className="w-full"
                                        required
                                    />
                                    {errors.first_name && <p className="text-black text-sm">{errors.first_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="middle_name" className="text-base font-bold text-gray-700">Middle Name</Label>
                                    <Input
                                        id="middle_name"
                                        value={data.middle_name}
                                        onChange={(e) => setData('middle_name', e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="birthdate" className="text-base font-bold text-gray-700">Birth Date *</Label>
                                    <CustomDatePicker
                                        value={data.birthdate}
                                        onChange={(date) => setData('birthdate', date ? date.toISOString().split('T')[0] : '')}
                                        placeholder="Select birthdate"
                                        variant="responsive"
                                        className="w-full"
                                    />
                                    {errors.birthdate && <p className="text-black text-sm">{errors.birthdate}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sex" className="text-base font-bold text-gray-700">Sex *</Label>
                                    <Select value={data.sex} onValueChange={(value) => setData('sex', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select sex" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.sex && <p className="text-black text-sm">{errors.sex}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="civil_status" className="text-base font-bold text-gray-700">Civil Status *</Label>
                                    <Select value={data.civil_status} onValueChange={(value) => setData('civil_status', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select civil status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Single">Single</SelectItem>
                                            <SelectItem value="Married">Married</SelectItem>
                                            <SelectItem value="Widowed">Widowed</SelectItem>
                                            <SelectItem value="Divorced">Divorced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.civil_status && <p className="text-black text-sm">{errors.civil_status}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nationality" className="text-base font-bold text-gray-700">Nationality</Label>
                                    <Input
                                        id="nationality"
                                        value={data.nationality}
                                        onChange={(e) => setData('nationality', e.target.value)}
                                        className="w-full"
                                        autoComplete="country-name"
                                    />
                                </div>
                            </div>
                    </PatientInfoCard>

                    {/* Demographics */}
                    <PatientInfoCard
                        title="Demographics"
                        icon={<Activity className="h-5 w-5 text-black" />}
                    >
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="occupation" className="text-base font-bold text-gray-700">Occupation</Label>
                                    <Input
                                        id="occupation"
                                        value={data.occupation}
                                        onChange={(e) => setData('occupation', e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="religion" className="text-base font-bold text-gray-700">Religion</Label>
                                    <Input
                                        id="religion"
                                        value={data.religion}
                                        onChange={(e) => setData('religion', e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="educational_attainment" className="text-base font-bold text-gray-700">Educational Attainment</Label>
                                    <Select value={data.educational_attainment} onValueChange={(value) => setData('educational_attainment', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select educational attainment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Elementary">Elementary</SelectItem>
                                            <SelectItem value="High School">High School</SelectItem>
                                            <SelectItem value="College">College</SelectItem>
                                            <SelectItem value="Graduate">Graduate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                    </PatientInfoCard>

                    {/* Contact Information */}
                    <PatientInfoCard
                        title="Contact Information"
                        icon={<Phone className="h-5 w-5 text-black" />}
                    >
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="present_address" className="text-base font-bold text-gray-700">Present Address *</Label>
                                    <Textarea
                                        id="present_address"
                                        value={data.present_address}
                                        onChange={(e) => setData('present_address', e.target.value)}
                                        className="w-full"
                                        rows={3}
                                        required
                                    />
                                    {errors.present_address && <p className="text-black text-sm">{errors.present_address}</p>}
                                </div>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="telephone_no" className="text-base font-bold text-gray-700">Telephone Number</Label>
                                        <Input
                                            id="telephone_no"
                                            value={data.telephone_no}
                                            onChange={(e) => setData('telephone_no', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="mobile_no" className="text-base font-bold text-gray-700">Mobile Number *</Label>
                                        <Input
                                            id="mobile_no"
                                            value={data.mobile_no}
                                            onChange={(e) => setData('mobile_no', e.target.value)}
                                            className="w-full"
                                            required
                                        />
                                        {errors.mobile_no && <p className="text-black text-sm">{errors.mobile_no}</p>}
                                    </div>
                                </div>
                            </div>
                    </PatientInfoCard>

                    {/* Emergency Contact */}
                    <PatientInfoCard
                        title="Emergency Contact"
                        icon={<Heart className="h-5 w-5 text-black" />}
                    >
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_name" className="text-base font-bold text-gray-700">Informant Name *</Label>
                                    <Input
                                        id="emergency_name"
                                        value={data.emergency_name}
                                        onChange={(e) => setData('emergency_name', e.target.value)}
                                        className="w-full"
                                        required
                                    />
                                    {errors.emergency_name && <p className="text-black text-sm">{errors.emergency_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_relation" className="text-base font-bold text-gray-700">Relationship *</Label>
                                    <Input
                                        id="emergency_relation"
                                        value={data.emergency_relation}
                                        onChange={(e) => setData('emergency_relation', e.target.value)}
                                        className="w-full"
                                        required
                                    />
                                    {errors.emergency_relation && <p className="text-black text-sm">{errors.emergency_relation}</p>}
                                </div>
                            </div>
                    </PatientInfoCard>

                    {/* Financial/Insurance */}
                    <PatientInfoCard
                        title="Financial/Insurance Information"
                        icon={<Shield className="h-5 w-5 text-black" />}
                    >
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="company_name" className="text-base font-bold text-gray-700">Company Name</Label>
                                    <Input id="company_name" value={data.company_name} onChange={(e) => setData('company_name', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hmo_name" className="text-base font-bold text-gray-700">HMO Name</Label>
                                    <Input id="hmo_name" value={data.hmo_name} onChange={(e) => setData('hmo_name', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hmo_company_id_no" className="text-base font-bold text-gray-700">HMO Company ID No</Label>
                                    <Input id="hmo_company_id_no" value={data.hmo_company_id_no} onChange={(e) => setData('hmo_company_id_no', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="validation_approval_code" className="text-base font-bold text-gray-700">Validation Approval Code</Label>
                                    <Input id="validation_approval_code" value={data.validation_approval_code} onChange={(e) => setData('validation_approval_code', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="validity" className="text-base font-bold text-gray-700">Validity</Label>
                                    <Input id="validity" value={data.validity} onChange={(e) => setData('validity', e.target.value)} />
                                </div>
                            </div>
                    </PatientInfoCard>

                    {/* Medical History & Allergies */}
                    <PatientInfoCard
                        title="Medical History & Allergies"
                        icon={<Stethoscope className="h-5 w-5 text-black" />}
                    >
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="drug_allergies" className="text-base font-bold text-gray-700">Drug Allergies</Label>
                                    <Input
                                        id="drug_allergies"
                                        value={data.drug_allergies}
                                        onChange={(e) => setData('drug_allergies', e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="food_allergies" className="text-base font-bold text-gray-700">Food Allergies</Label>
                                    <Input
                                        id="food_allergies"
                                        value={data.food_allergies}
                                        onChange={(e) => setData('food_allergies', e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="past_medical_history" className="text-base font-bold text-gray-700">Past Medical History</Label>
                                    <Textarea
                                        id="past_medical_history"
                                        value={data.past_medical_history}
                                        onChange={(e) => setData('past_medical_history', e.target.value)}
                                        className="w-full"
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="family_history" className="text-base font-bold text-gray-700">Family History</Label>
                                    <Textarea
                                        id="family_history"
                                        value={data.family_history}
                                        onChange={(e) => setData('family_history', e.target.value)}
                                        className="w-full"
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="social_personal_history" className="text-base font-bold text-gray-700">Social/Personal History</Label>
                                    <Textarea
                                        id="social_personal_history"
                                        value={data.social_personal_history}
                                        onChange={(e) => setData('social_personal_history', e.target.value)}
                                        className="w-full"
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="obstetrics_gynecology_history" className="text-base font-bold text-gray-700">OB-GYN History</Label>
                                    <Textarea
                                        id="obstetrics_gynecology_history"
                                        value={data.obstetrics_gynecology_history}
                                        onChange={(e) => setData('obstetrics_gynecology_history', e.target.value)}
                                        className="w-full"
                                        rows={3}
                                    />
                                </div>
                            </div>
                    </PatientInfoCard>

                    {/* Action Buttons */}
                    <PatientInfoCard
                        title="Save Changes"
                        icon={<Save className="h-5 w-5 text-black" />}
                    >
                        <div className="flex items-center justify-end gap-6">
                            <Button asChild variant="outline" className="px-8 py-4 text-lg font-semibold rounded-xl">
                                <Link href="/admin/patient">Cancel</Link>
                            </Button>
                            <Button disabled={processing} type="submit" variant="default" className="px-8 py-4 text-lg font-semibold rounded-xl">
                                <Save className="mr-3 h-6 w-6" />
                                {processing ? 'Updating Patient...' : 'Update Patient'}
                            </Button>
                        </div>
                    </PatientInfoCard>
                </form>
            </PatientPageLayout>
        </AppLayout>
    );
}
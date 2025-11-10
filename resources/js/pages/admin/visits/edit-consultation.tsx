import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Edit, ArrowLeft, Save, X, User, FileText, Activity, Heart, Stethoscope, ClipboardList, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Visits', href: '/admin/visits' },
    { title: 'Edit Consultation', href: '#' },
];

interface PatientData {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    patient_no: string;
    birthdate?: string;
    age?: number;
    sex?: 'male' | 'female';
    occupation?: string;
    religion?: string;
    civil_status?: string;
    nationality?: string;
    present_address?: string;
    telephone_no?: string;
    mobile_no?: string;
    informant_name?: string;
    relationship?: string;
    hmo_name?: string;
    hmo_company_id_no?: string;
    validation_approval_code?: string;
    validity?: string;
    drug_allergies?: string;
    food_allergies?: string;
}

interface VisitEditProps {
    visit: {
        id: number;
        visit_date_time_time?: string;
        purpose?: string;
        notes?: string;
        status: string;
        visit_type?: string;
        // Clinical fields
        arrival_date?: string;
        arrival_time?: string;
        mode_of_arrival?: string;
        blood_pressure?: string;
        heart_rate?: string;
        respiratory_rate?: string;
        temperature?: string;
        weight_kg?: number;
        height_cm?: number;
        pain_assessment_scale?: string;
        oxygen_saturation?: string;
        reason_for_consult?: string;
        time_seen?: string;
        history_of_present_illness?: string;
        pertinent_physical_findings?: string;
        assessment_diagnosis?: string;
        plan_management?: string;
        attending_staff?: {
            id: number;
            name: string;
            role: string;
        };
    };
    patient: PatientData;
    staff: Array<{
        id: number;
        name: string;
        role: string;
    }>;
}

export default function VisitEditConsultation({ visit, patient, staff }: VisitEditProps) {
    const { hasPermission } = useRoleAccess();
    
    // Format time for input (HH:mm)
    const formatTime = (time: string | undefined) => {
        if (!time) return '';
        if (time.includes(':')) {
            return time.substring(0, 5); // Return HH:mm
        }
        return time;
    };
    
    const [formData, setFormData] = useState({
        // Arrival Information
        arrival_date: visit.arrival_date || (visit.visit_date_time_time ? visit.visit_date_time_time.split('T')[0] : ''),
        arrival_time: formatTime(visit.arrival_time),
        mode_of_arrival: visit.mode_of_arrival || '',
        
        // Attending Physician
        attending_staff_id: visit.attending_staff?.id?.toString() || '',
        
        // Vital Signs
        blood_pressure: visit.blood_pressure || '',
        heart_rate: visit.heart_rate || '',
        respiratory_rate: visit.respiratory_rate || '',
        temperature: visit.temperature || '',
        weight_kg: visit.weight_kg?.toString() || '',
        height_cm: visit.height_cm?.toString() || '',
        pain_assessment_scale: visit.pain_assessment_scale || '',
        oxygen_saturation: visit.oxygen_saturation || '',
        
        // Clinical Information
        reason_for_consult: visit.reason_for_consult || '',
        time_seen: formatTime(visit.time_seen),
        history_of_present_illness: visit.history_of_present_illness || '',
        pertinent_physical_findings: visit.pertinent_physical_findings || '',
        assessment_diagnosis: visit.assessment_diagnosis || '',
        plan_management: visit.plan_management || '',
        
        // Transfer Information
        transfer_required: visit.transfer_required || false,
        transfer_reason_notes: visit.transfer_reason_notes || '',
        
        // Basic Visit Info
        status: visit.status,
        notes: visit.notes || '',
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        router.put(`/admin/visits/${visit.id}`, formData, {
            onSuccess: () => {
                // Success handled by controller redirect
            },
            onError: (errors) => {
                setErrors(errors);
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Consultation - ${patient.first_name} ${patient.last_name}`} />
            
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="@container/main flex flex-1 flex-col gap-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Stethoscope className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-2">Emergency Department Consultation</h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    {patient.first_name} {patient.last_name} - {patient.patient_no}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href={`/admin/visits/${visit.id}`}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Visit
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Patient Information Card (Read-Only) */}
                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Patient Information (From Patient Record)
                            </CardTitle>
                            <CardDescription>Basic patient information is pre-filled from the patient record</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <Label className="text-xs text-gray-500">Name</Label>
                                    <p className="font-semibold">{patient.first_name} {patient.middle_name} {patient.last_name}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Patient No.</Label>
                                    <p className="font-semibold">{patient.patient_no}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Birthdate</Label>
                                    <p className="font-semibold">{patient.birthdate ? new Date(patient.birthdate).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Age / Sex</Label>
                                    <p className="font-semibold">{patient.age || 'N/A'} / {patient.sex ? patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1) : 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Occupation</Label>
                                    <p className="font-semibold">{patient.occupation || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Religion</Label>
                                    <p className="font-semibold">{patient.religion || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Civil Status</Label>
                                    <p className="font-semibold">{patient.civil_status || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Nationality</Label>
                                    <p className="font-semibold">{patient.nationality || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-xs text-gray-500">Address</Label>
                                    <p className="font-semibold">{patient.present_address || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Mobile No.</Label>
                                    <p className="font-semibold">{patient.mobile_no || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Telephone No.</Label>
                                    <p className="font-semibold">{patient.telephone_no || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Emergency Contact</Label>
                                    <p className="font-semibold">{patient.informant_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Relationship</Label>
                                    <p className="font-semibold">{patient.relationship || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">HMO Name</Label>
                                    <p className="font-semibold">{patient.hmo_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">HMO ID No.</Label>
                                    <p className="font-semibold">{patient.hmo_company_id_no || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Drug Allergies</Label>
                                    <p className="font-semibold text-red-600">{patient.drug_allergies || 'NONE'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Food Allergies</Label>
                                    <p className="font-semibold text-red-600">{patient.food_allergies || 'NONE'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Arrival Information Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Arrival Information
                                </CardTitle>
                                <CardDescription>TO BE FILLED OUT BY EMERGENCY STAFF NURSE</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="arrival_date">Arrival Date *</Label>
                                        <Input
                                            id="arrival_date"
                                            type="date"
                                            value={formData.arrival_date}
                                            onChange={(e) => handleInputChange('arrival_date', e.target.value)}
                                            className={errors.arrival_date ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.arrival_date && (
                                            <p className="text-sm text-red-500 mt-1">{errors.arrival_date}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="arrival_time">Arrival Time *</Label>
                                        <Input
                                            id="arrival_time"
                                            type="time"
                                            value={formData.arrival_time}
                                            onChange={(e) => handleInputChange('arrival_time', e.target.value)}
                                            className={errors.arrival_time ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.arrival_time && (
                                            <p className="text-sm text-red-500 mt-1">{errors.arrival_time}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="mode_of_arrival">Mode of Arrival</Label>
                                        <Input
                                            id="mode_of_arrival"
                                            value={formData.mode_of_arrival}
                                            onChange={(e) => handleInputChange('mode_of_arrival', e.target.value)}
                                            placeholder="e.g., Ambulance, Walk-in, etc."
                                            className={errors.mode_of_arrival ? 'border-red-500' : ''}
                                        />
                                        {errors.mode_of_arrival && (
                                            <p className="text-sm text-red-500 mt-1">{errors.mode_of_arrival}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Attending Physician Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Stethoscope className="h-5 w-5" />
                                    Attending Physician
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="attending_staff_id">Attending Physician *</Label>
                                    <Select
                                        value={formData.attending_staff_id}
                                        onValueChange={(value) => handleInputChange('attending_staff_id', value)}
                                    >
                                        <SelectTrigger className={errors.attending_staff_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select attending physician" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {staff.map((s) => (
                                                <SelectItem key={s.id} value={s.id.toString()}>
                                                    {s.name} ({s.role})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.attending_staff_id && (
                                        <p className="text-sm text-red-500 mt-1">{errors.attending_staff_id}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vital Signs Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Initial Vital Signs
                                </CardTitle>
                                <CardDescription>TO BE FILLED OUT BY EMERGENCY STAFF NURSE</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="blood_pressure">BP (mmHg)</Label>
                                        <Input
                                            id="blood_pressure"
                                            value={formData.blood_pressure}
                                            onChange={(e) => handleInputChange('blood_pressure', e.target.value)}
                                            placeholder="e.g., 120/80"
                                            className={errors.blood_pressure ? 'border-red-500' : ''}
                                        />
                                        {errors.blood_pressure && (
                                            <p className="text-sm text-red-500 mt-1">{errors.blood_pressure}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="heart_rate">HR (bpm)</Label>
                                        <Input
                                            id="heart_rate"
                                            value={formData.heart_rate}
                                            onChange={(e) => handleInputChange('heart_rate', e.target.value)}
                                            placeholder="e.g., 72"
                                            className={errors.heart_rate ? 'border-red-500' : ''}
                                        />
                                        {errors.heart_rate && (
                                            <p className="text-sm text-red-500 mt-1">{errors.heart_rate}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="respiratory_rate">RR (breaths/min)</Label>
                                        <Input
                                            id="respiratory_rate"
                                            value={formData.respiratory_rate}
                                            onChange={(e) => handleInputChange('respiratory_rate', e.target.value)}
                                            placeholder="e.g., 16"
                                            className={errors.respiratory_rate ? 'border-red-500' : ''}
                                        />
                                        {errors.respiratory_rate && (
                                            <p className="text-sm text-red-500 mt-1">{errors.respiratory_rate}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="temperature">T (°C)</Label>
                                        <Input
                                            id="temperature"
                                            value={formData.temperature}
                                            onChange={(e) => handleInputChange('temperature', e.target.value)}
                                            placeholder="e.g., 37.0"
                                            className={errors.temperature ? 'border-red-500' : ''}
                                        />
                                        {errors.temperature && (
                                            <p className="text-sm text-red-500 mt-1">{errors.temperature}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="weight_kg">Weight (kg)</Label>
                                        <Input
                                            id="weight_kg"
                                            type="number"
                                            step="0.1"
                                            value={formData.weight_kg}
                                            onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                                            placeholder="e.g., 70.5"
                                            className={errors.weight_kg ? 'border-red-500' : ''}
                                        />
                                        {errors.weight_kg && (
                                            <p className="text-sm text-red-500 mt-1">{errors.weight_kg}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="height_cm">Height (cm)</Label>
                                        <Input
                                            id="height_cm"
                                            type="number"
                                            step="0.1"
                                            value={formData.height_cm}
                                            onChange={(e) => handleInputChange('height_cm', e.target.value)}
                                            placeholder="e.g., 170"
                                            className={errors.height_cm ? 'border-red-500' : ''}
                                        />
                                        {errors.height_cm && (
                                            <p className="text-sm text-red-500 mt-1">{errors.height_cm}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="pain_assessment_scale">Pain Assessment Scale</Label>
                                        <Input
                                            id="pain_assessment_scale"
                                            value={formData.pain_assessment_scale}
                                            onChange={(e) => handleInputChange('pain_assessment_scale', e.target.value)}
                                            placeholder="e.g., 0-10"
                                            className={errors.pain_assessment_scale ? 'border-red-500' : ''}
                                        />
                                        {errors.pain_assessment_scale && (
                                            <p className="text-sm text-red-500 mt-1">{errors.pain_assessment_scale}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="oxygen_saturation">O2 Saturation (%)</Label>
                                        <Input
                                            id="oxygen_saturation"
                                            value={formData.oxygen_saturation}
                                            onChange={(e) => handleInputChange('oxygen_saturation', e.target.value)}
                                            placeholder="e.g., 98"
                                            className={errors.oxygen_saturation ? 'border-red-500' : ''}
                                        />
                                        {errors.oxygen_saturation && (
                                            <p className="text-sm text-red-500 mt-1">{errors.oxygen_saturation}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Clinical Information Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5" />
                                    Clinical Information
                                </CardTitle>
                                <CardDescription>TO BE FILLED OUT BY RESIDENT ON DUTY</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="reason_for_consult">Reason for Consult *</Label>
                                        <Textarea
                                            id="reason_for_consult"
                                            value={formData.reason_for_consult}
                                            onChange={(e) => handleInputChange('reason_for_consult', e.target.value)}
                                            placeholder="Primary reason for this consultation"
                                            className={errors.reason_for_consult ? 'border-red-500' : ''}
                                            rows={3}
                                            required
                                        />
                                        {errors.reason_for_consult && (
                                            <p className="text-sm text-red-500 mt-1">{errors.reason_for_consult}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="time_seen">Time Seen</Label>
                                        <Input
                                            id="time_seen"
                                            type="time"
                                            value={formData.time_seen}
                                            onChange={(e) => handleInputChange('time_seen', e.target.value)}
                                            className={errors.time_seen ? 'border-red-500' : ''}
                                        />
                                        {errors.time_seen && (
                                            <p className="text-sm text-red-500 mt-1">{errors.time_seen}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="history_of_present_illness">History of Present Illness</Label>
                                    <Textarea
                                        id="history_of_present_illness"
                                        value={formData.history_of_present_illness}
                                        onChange={(e) => handleInputChange('history_of_present_illness', e.target.value)}
                                        placeholder="Detailed history of the current illness"
                                        className={errors.history_of_present_illness ? 'border-red-500' : ''}
                                        rows={5}
                                    />
                                    {errors.history_of_present_illness && (
                                        <p className="text-sm text-red-500 mt-1">{errors.history_of_present_illness}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pertinent_physical_findings">Pertinent Physical Findings</Label>
                                    <Textarea
                                        id="pertinent_physical_findings"
                                        value={formData.pertinent_physical_findings}
                                        onChange={(e) => handleInputChange('pertinent_physical_findings', e.target.value)}
                                        placeholder="Physical examination findings"
                                        className={errors.pertinent_physical_findings ? 'border-red-500' : ''}
                                        rows={5}
                                    />
                                    {errors.pertinent_physical_findings && (
                                        <p className="text-sm text-red-500 mt-1">{errors.pertinent_physical_findings}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="assessment_diagnosis">Assessment / Diagnosis</Label>
                                    <Textarea
                                        id="assessment_diagnosis"
                                        value={formData.assessment_diagnosis}
                                        onChange={(e) => handleInputChange('assessment_diagnosis', e.target.value)}
                                        placeholder="Medical assessment and diagnosis"
                                        className={errors.assessment_diagnosis ? 'border-red-500' : ''}
                                        rows={4}
                                    />
                                    {errors.assessment_diagnosis && (
                                        <p className="text-sm text-red-500 mt-1">{errors.assessment_diagnosis}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="plan_management">Plan / Management</Label>
                                    <Textarea
                                        id="plan_management"
                                        value={formData.plan_management}
                                        onChange={(e) => handleInputChange('plan_management', e.target.value)}
                                        placeholder="Treatment plan and management strategy"
                                        className={errors.plan_management ? 'border-red-500' : ''}
                                        rows={4}
                                    />
                                    {errors.plan_management && (
                                        <p className="text-sm text-red-500 mt-1">{errors.plan_management}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Transfer Decision */}
                        <Card className="border-orange-200 bg-orange-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ArrowRightLeft className="h-5 w-5 text-orange-600" />
                                    Transfer Decision
                                </CardTitle>
                                <CardDescription>
                                    Mark if this patient needs to be transferred based on your evaluation
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="transfer_required"
                                        checked={formData.transfer_required}
                                        onCheckedChange={(checked) => handleInputChange('transfer_required', checked === true)}
                                    />
                                    <Label htmlFor="transfer_required" className="text-base font-medium cursor-pointer">
                                        Patient requires transfer
                                    </Label>
                                </div>
                                
                                {formData.transfer_required && (
                                    <div className="space-y-2 pl-6 border-l-2 border-orange-300">
                                        <Label htmlFor="transfer_reason_notes">Transfer Reason / Physician's Remarks *</Label>
                                        <Textarea
                                            id="transfer_reason_notes"
                                            value={formData.transfer_reason_notes}
                                            onChange={(e) => handleInputChange('transfer_reason_notes', e.target.value)}
                                            placeholder="Provide the reason why this patient needs to be transferred based on your consultation and assessment..."
                                            className={errors.transfer_reason_notes ? 'border-red-500' : ''}
                                            rows={4}
                                            required={formData.transfer_required}
                                        />
                                        {errors.transfer_reason_notes && (
                                            <p className="text-sm text-red-500 mt-1">{errors.transfer_reason_notes}</p>
                                        )}
                                        <p className="text-xs text-gray-600">
                                            This information will be used when creating the patient transfer record.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Additional Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Additional Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        placeholder="Any additional notes about this visit"
                                        className={errors.notes ? 'border-red-500' : ''}
                                        rows={3}
                                    />
                                    {errors.notes && (
                                        <p className="text-sm text-red-500 mt-1">{errors.notes}</p>
                                    )}
                                </div>

                                <div className="mt-4 space-y-2">
                                    <Label htmlFor="status">Visit Status *</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => handleInputChange('status', value)}
                                    >
                                        <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-red-500 mt-1">{errors.status}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Form Actions */}
                        <div className="flex items-center gap-4 pt-4">
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                {isSubmitting ? 'Saving...' : 'Save Consultation'}
                            </Button>
                            
                            <Link href={`/admin/visits/${visit.id}`}>
                                <Button type="button" variant="outline" className="flex items-center gap-2">
                                    <X className="h-4 w-4" />
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}


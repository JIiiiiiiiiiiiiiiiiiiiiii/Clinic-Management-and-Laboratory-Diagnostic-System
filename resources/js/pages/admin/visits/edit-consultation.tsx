import { Badge } from '@/components/ui/badge';
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
import { useState, useEffect } from 'react';

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

interface LabOrder {
    id: number;
    status: string;
    notes?: string;
    created_at: string;
    ordered_by?: {
        name: string;
    } | null;
    tests: Array<{
        id: number;
        name: string;
        code: string;
    }>;
}

interface LabTest {
    id: number;
    name: string;
    code: string;
    price: number;
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
        attending_staff_id?: number;
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
    labOrders?: LabOrder[];
    transfers?: Array<{
        id: number;
        transfer_type: string;
        status: string;
        requested_at: string;
        requested_by?: string;
        approved_by?: string;
    }>;
    availableLabTests?: LabTest[];
}

export default function VisitEditConsultation({ visit, patient, staff, labOrders = [], transfers = [], availableLabTests = [] }: VisitEditProps) {
    const { hasPermission } = useRoleAccess();
    
    // Format time for input (HH:mm)
    const formatTime = (time: string | undefined) => {
        if (!time) return '';
        if (time.includes(':')) {
            return time.substring(0, 5); // Return HH:mm
        }
        return time;
    };
    
    // Normalize mode of arrival to match dropdown values
    const normalizeModeOfArrival = (mode: string | undefined): string => {
        if (!mode) return '';
        const normalized = mode.toLowerCase().trim();
        // Map common variations to dropdown values
        if (normalized.includes('walk') || normalized === 'walk-in') return 'walk-in';
        if (normalized.includes('online') || normalized === 'online') return 'online';
        if (normalized.includes('ambulance') || normalized.includes('emergency')) return 'ambulance';
        if (normalized.includes('referral')) return 'referral';
        if (normalized.includes('appointment')) return 'appointment';
        if (normalized.includes('other')) return 'other';
        // If it matches one of our values exactly, return it
        if (['walk-in', 'online', 'ambulance', 'referral', 'appointment', 'other'].includes(normalized)) {
            return normalized;
        }
        return mode; // Return original if no match
    };

    // Helper function to extract doctor's remarks from notes (remove "Attending Physician: ..." prefix)
    const extractDoctorRemarks = (notes: string | undefined | null): string => {
        if (!notes) return '';
        // Remove "Attending Physician: ..." prefix if present (handles both with and without newline)
        const attendingPhysicianPattern = /^Attending Physician:\s*[^\n]+\n?/i;
        const cleaned = notes.replace(attendingPhysicianPattern, '').trim();
        return cleaned;
    };

    // Helper function to get attending physician from notes
    const getAttendingPhysicianFromNotes = (notes: string | undefined | null): string | null => {
        if (!notes) return null;
        // Match "Attending Physician: [name]" at the start, optionally followed by newline
        const match = notes.match(/^Attending Physician:\s*([^\n]+)/i);
        return match ? match[1].trim() : null;
    };

    const [formData, setFormData] = useState({
        // Arrival Information
        arrival_date: visit.arrival_date || (visit.visit_date_time_time ? visit.visit_date_time_time.split('T')[0] : ''),
        arrival_time: formatTime(visit.arrival_time),
        mode_of_arrival: normalizeModeOfArrival(visit.mode_of_arrival),
        
        // Attending Physician - check both attending_staff_id and attending_staff.id
        attending_staff_id: visit.attending_staff_id?.toString() || visit.attending_staff?.id?.toString() || '',
        
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
    
    // State for lab test selection
    const [selectedLabTests, setSelectedLabTests] = useState<number[]>([]);
    const [labTestNotes, setLabTestNotes] = useState('');
    const [isAddingLabTests, setIsAddingLabTests] = useState(false);
    

    // Update formData when visit prop changes (e.g., after page refresh or data update)
    useEffect(() => {
        setFormData({
            // Arrival Information
            arrival_date: visit.arrival_date || (visit.visit_date_time_time ? visit.visit_date_time_time.split('T')[0] : ''),
            arrival_time: formatTime(visit.arrival_time),
            mode_of_arrival: normalizeModeOfArrival(visit.mode_of_arrival),
            
            // Attending Physician
            attending_staff_id: visit.attending_staff_id?.toString() || visit.attending_staff?.id?.toString() || '',
            
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
    }, [visit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const submitData = {
            ...formData,
            // Include lab test requests if any are selected
            lab_test_ids: selectedLabTests.length > 0 ? selectedLabTests : undefined,
            lab_test_notes: selectedLabTests.length > 0 ? labTestNotes : undefined,
        };

        router.put(`/admin/visits/${visit.id}`, submitData, {
            onSuccess: () => {
                // Clear lab test selections after successful save
                setSelectedLabTests([]);
                setLabTestNotes('');
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

    const handleLabTestToggle = (testId: number) => {
        setSelectedLabTests(prev => 
            prev.includes(testId) 
                ? prev.filter(id => id !== testId)
                : [...prev, testId]
        );
    };

    const handleAddLabTests = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
        }
        
        if (selectedLabTests.length === 0) {
            console.warn('No lab tests selected');
            return;
        }

        console.log('Submitting lab tests:', {
            visitId: visit.id,
            labTestIds: selectedLabTests,
            notes: labTestNotes
        });

        setIsAddingLabTests(true);

        router.post(route('admin.visits.add-lab-tests.store', visit.id), {
            lab_test_ids: selectedLabTests,
            notes: labTestNotes
        }, {
            preserveScroll: true,
            onSuccess: (page) => {
                console.log('Lab tests added successfully');
                // Clear selections after successful addition
                setSelectedLabTests([]);
                setLabTestNotes('');
                setIsAddingLabTests(false);
                // The page will reload with updated lab orders automatically via Inertia
            },
            onError: (errors) => {
                console.error('Error adding lab tests:', errors);
                setIsAddingLabTests(false);
            },
            onFinish: () => {
                setIsAddingLabTests(false);
            }
        });
    };

    const calculateTotalPrice = () => {
        return availableLabTests
            .filter(test => selectedLabTests.includes(test.id))
            .reduce((sum, test) => {
                const price = typeof test.price === 'number' ? test.price : parseFloat(test.price || 0);
                return sum + price;
            }, 0);
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
                                        <Select
                                            value={formData.mode_of_arrival || ''}
                                            onValueChange={(value) => handleInputChange('mode_of_arrival', value)}
                                        >
                                            <SelectTrigger className={errors.mode_of_arrival ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select mode of arrival">
                                                    {formData.mode_of_arrival ? 
                                                        (formData.mode_of_arrival === 'walk-in' ? 'Walk-in' :
                                                         formData.mode_of_arrival === 'online' ? 'Online' :
                                                         formData.mode_of_arrival === 'ambulance' ? 'Ambulance/Emergency' :
                                                         formData.mode_of_arrival === 'referral' ? 'Referral' :
                                                         formData.mode_of_arrival === 'appointment' ? 'Appointment' :
                                                         formData.mode_of_arrival === 'other' ? 'Other' :
                                                         formData.mode_of_arrival)
                                                        : 'Select mode of arrival'}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="walk-in">Walk-in</SelectItem>
                                                <SelectItem value="online">Online</SelectItem>
                                                <SelectItem value="ambulance">Ambulance/Emergency</SelectItem>
                                                <SelectItem value="referral">Referral</SelectItem>
                                                <SelectItem value="appointment">Appointment</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                            <CardContent className="space-y-4">
                                {/* Display Current Attending Physician */}
                                {visit.attending_staff && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <Label className="text-xs text-gray-600 mb-2 block">Current Attending Physician</Label>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {visit.attending_staff.name} <span className="text-sm font-normal text-gray-500">({visit.attending_staff.role})</span>
                                        </p>
                                    </div>
                                )}
                                
                                {/* Select New Attending Physician */}
                                <div className="space-y-2">
                                    <Label htmlFor="attending_staff_id">Change Attending Physician *</Label>
                                    <Select
                                        value={formData.attending_staff_id || visit.attending_staff?.id?.toString() || ''}
                                        onValueChange={(value) => handleInputChange('attending_staff_id', value)}
                                    >
                                        <SelectTrigger className={errors.attending_staff_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select attending physician">
                                                {formData.attending_staff_id 
                                                    ? staff.find(s => s.id.toString() === formData.attending_staff_id)?.name + ' (' + staff.find(s => s.id.toString() === formData.attending_staff_id)?.role + ')'
                                                    : visit.attending_staff 
                                                        ? `${visit.attending_staff.name} (${visit.attending_staff.role})`
                                                        : 'Select attending physician'}
                                            </SelectValue>
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

                        {/* Lab Tests Section */}
                        <Card className="border-blue-200 bg-blue-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5 text-blue-600" />
                                    Laboratory Tests
                                </CardTitle>
                                <CardDescription>
                                    Request laboratory tests if needed based on your consultation
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Existing Lab Orders */}
                                {labOrders && labOrders.length > 0 ? (
                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold text-gray-700">Existing Lab Orders</Label>
                                        {labOrders.map((order) => (
                                            <div key={order.id} className="bg-white border border-blue-200 rounded-lg p-4 space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Label className="font-semibold text-gray-900">
                                                                Lab Order #{order.id}
                                                            </Label>
                                                            <Badge variant="outline" className="text-xs">
                                                                {order.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-sm text-gray-600 space-y-1">
                                                            {order.tests.length > 0 && (
                                                                <div>
                                                                    <span className="font-medium">Tests: </span>
                                                                    {order.tests.map((test, idx) => (
                                                                        <span key={test.id}>
                                                                            {test.name}{idx < order.tests.length - 1 ? ', ' : ''}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {order.ordered_by && (
                                                                <div>
                                                                    <span className="font-medium">Ordered by: </span>
                                                                    {order.ordered_by.name}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <span className="font-medium">Date: </span>
                                                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Remarks for this lab order (Read-only) */}
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-gray-700">
                                                        Doctor's Remarks for this Order
                                                    </Label>
                                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                        {order.notes ? (
                                                            <div className="space-y-2">
                                                                {getAttendingPhysicianFromNotes(order.notes) && (
                                                                    <p className="text-xs font-medium text-gray-600">
                                                                        Attending Physician: {getAttendingPhysicianFromNotes(order.notes)}
                                                                    </p>
                                                                )}
                                                                {extractDoctorRemarks(order.notes) ? (
                                                                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                                                        {extractDoctorRemarks(order.notes)}
                                                                    </p>
                                                                ) : (
                                                                    <p className="text-sm text-gray-500 italic">
                                                                        No additional remarks provided.
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-500 italic">
                                                                No remarks available for this order.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500 mb-2">No lab orders have been requested for this visit yet.</p>
                                    </div>
                                )}

                                {/* Request New Lab Tests */}
                                <div className={labOrders && labOrders.length > 0 ? 'border-t pt-4 mt-4' : ''}>
                                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                                        {labOrders && labOrders.length > 0 ? 'Request Additional Lab Tests' : 'Request Lab Tests'}
                                    </Label>
                                    
                                    {availableLabTests && availableLabTests.length > 0 ? (
                                        <div className="space-y-4">
                                            {/* Lab Test Selection */}
                                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white">
                                                <div className="space-y-2">
                                                    {availableLabTests.map(test => (
                                                        <div key={test.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                                                            <Checkbox
                                                                id={`lab-test-${test.id}`}
                                                                checked={selectedLabTests.includes(test.id)}
                                                                onCheckedChange={() => handleLabTestToggle(test.id)}
                                                            />
                                                            <label htmlFor={`lab-test-${test.id}`} className="flex-1 cursor-pointer">
                                                                <div className="flex justify-between items-center">
                                                                    <div>
                                                                        <span className="font-medium text-gray-900">{test.name}</span>
                                                                        <p className="text-xs text-gray-500">{test.code}</p>
                                                                    </div>
                                                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                                                        ₱{typeof test.price === 'number' ? test.price.toFixed(2) : parseFloat(test.price || 0).toFixed(2)}
                                                                    </Badge>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Remarks */}
                                            <div>
                                                <Label htmlFor="lab-test-notes" className="text-sm font-medium text-gray-700 mb-2 block">
                                                    Remarks (Optional)
                                                </Label>
                                                <Textarea
                                                    id="lab-test-notes"
                                                    value={labTestNotes}
                                                    onChange={(e) => setLabTestNotes(e.target.value)}
                                                    placeholder="Add remarks about why these tests are needed..."
                                                    className="w-full text-sm"
                                                    rows={2}
                                                />
                                            </div>

                                            {/* Total Price */}
                                            {selectedLabTests.length > 0 && (
                                                <div className="bg-blue-50 p-3 rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-medium text-gray-700">
                                                            Selected Tests: {selectedLabTests.length}
                                                        </span>
                                                        <span className="text-lg font-bold text-blue-700">
                                                            Total: ₱{calculateTotalPrice().toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-gray-500 mb-2">
                                                {labOrders && labOrders.length > 0 
                                                    ? 'All available lab tests have already been requested for this visit.'
                                                    : 'No lab tests available'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Patient Transfers Section */}
                        {transfers && transfers.length > 0 && (
                            <Card className="border-orange-200 bg-orange-50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ArrowRightLeft className="h-5 w-5 text-orange-600" />
                                        Patient Transfers
                                    </CardTitle>
                                    <CardDescription>
                                        Transfer records associated with this patient
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {transfers.map((transfer) => (
                                        <div key={transfer.id} className="bg-white border border-orange-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <p className="font-medium">Transfer #{transfer.id}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(transfer.requested_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {transfer.status}
                                                </Badge>
                                            </div>
                                            <div className="space-y-1 text-sm">
                                                <p><strong>Type:</strong> {transfer.transfer_type}</p>
                                                {transfer.requested_by && (
                                                    <p><strong>Requested by:</strong> {transfer.requested_by}</p>
                                                )}
                                                {transfer.approved_by && (
                                                    <p><strong>Approved by:</strong> {transfer.approved_by}</p>
                                                )}
                                            </div>
                                            <div className="mt-3">
                                                <Link href={`/admin/patient-transfers/transfers/${transfer.id}`}>
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        View Transfer Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

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


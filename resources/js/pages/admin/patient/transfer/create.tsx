import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { 
    Save, 
    User, 
    AlertCircle,
    FileText
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Patient {
    id: number;
    first_name: string;
    last_name: string;
    patient_no: string;
}

interface Visit {
    id: number;
    visit_code: string;
    visit_date_time: string;
    appointment_date?: string;
    appointment_time?: string;
    doctor_name: string;
    reason_for_consult?: string;
    assessment_diagnosis?: string;
    plan_management?: string;
    transfer_required?: boolean;
    transfer_reason_notes?: string;
}

interface Props {
    patient?: Patient | null;
    patients: Patient[];
    visits?: Visit[];
}

const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];

export default function PatientTransferCreate({ patient, patients, visits: initialVisits = [] }: Props) {
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patient || null);
    const [visits, setVisits] = useState<Visit[]>(initialVisits);
    const [loadingVisits, setLoadingVisits] = useState(false);
    const { flash } = usePage().props as any;

    const { data, setData, processing, errors, post } = useForm({
        patient_id: patient?.id || '',
        visit_id: '',
        transfer_reason: '',
        priority: 'medium',
        notes: '',
        transfer_date: new Date().toISOString().split('T')[0], // Today's date
    });

    // Handle flash messages and show toasts
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Patient Management', href: '/admin/patient' },
        { title: 'Patient Transfer', href: '/admin/patient-transfers/transfers' },
        { title: 'Create', href: '/admin/patient-transfers/transfers/create' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // IMPORTANT: This only transfers an existing patient - it does NOT create a new patient
        post('/admin/patient-transfers/transfers', {
            onSuccess: () => {
                toast.success('Patient transfer created successfully!');
            },
            onError: (errors) => {
                if (errors.general) {
                    toast.error(errors.general);
                } else {
                    toast.error('Failed to create patient transfer. Please check the form for errors.');
                }
            },
        });
    };

    const handlePatientSelect = async (patientId: string) => {
        // Select an EXISTING patient from the list - no new patients are created here
        const patient = patients.find(p => p.id.toString() === patientId);
        setSelectedPatient(patient || null);
        setData('patient_id', patientId);
        setData('visit_id', ''); // Reset visit selection when patient changes
        setData('transfer_reason', ''); // Reset transfer reason when patient changes
        
        // Fetch visits for the selected patient
        if (patientId) {
            setLoadingVisits(true);
            try {
                const response = await fetch(`/admin/patient-transfers/transfers/visits?patient_id=${patientId}`);
                const result = await response.json();
                console.log('Fetched visits result:', result);
                console.log('Visits count:', result.visits?.length || 0);
                setVisits(result.visits || []);
            } catch (error) {
                console.error('Error fetching visits:', error);
                setVisits([]);
            } finally {
                setLoadingVisits(false);
            }
        } else {
            setVisits([]);
        }
    };

    // Auto-select visit marked for transfer and pre-fill transfer reason
    useEffect(() => {
        if (selectedPatient && visits.length > 0 && !data.visit_id) {
            // Find visit marked for transfer
            const transferVisit = visits.find(v => v.transfer_required === true);
            if (transferVisit) {
                setData('visit_id', transferVisit.id.toString());
                // Pre-fill transfer reason from visit's transfer_reason_notes or assessment
                if (transferVisit.transfer_reason_notes) {
                    setData('transfer_reason', transferVisit.transfer_reason_notes);
                } else if (transferVisit.assessment_diagnosis) {
                    setData('transfer_reason', `Based on consultation: ${transferVisit.assessment_diagnosis}`);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPatient, visits]);

    // Pre-fill transfer reason from visit when visit is selected
    useEffect(() => {
        if (data.visit_id && visits.length > 0 && !data.transfer_reason) {
            const selectedVisit = visits.find(v => v.id.toString() === data.visit_id.toString());
            if (selectedVisit?.transfer_reason_notes) {
                setData('transfer_reason', selectedVisit.transfer_reason_notes);
            } else if (selectedVisit?.assessment_diagnosis) {
                setData('transfer_reason', `Based on consultation: ${selectedVisit.assessment_diagnosis}`);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.visit_id]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Patient Transfer" />

            <div className="p-6 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Patient Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Patient Information
                                </CardTitle>
                                <CardDescription>
                                    Select an existing patient from the records to transfer
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm text-blue-800">
                                            <p className="font-medium mb-1">Transfer Requirements (Existing Patients Only):</p>
                                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                                                <li>Patient must already exist in the system</li>
                                                <li>Patient must have existing visit/consultation records</li>
                                                <li>Patient must have been consulted by an attending physician (doctor)</li>
                                                <li>Patients marked for transfer by doctors will appear first in the list</li>
                                                <li>If a visit is marked for transfer, it will be auto-selected when you choose the patient</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="patient_id">Select Existing Patient *</Label>
                                    <p className="text-xs text-gray-500 mb-2">
                                        Choose from existing patient records that have been consulted by a doctor
                                    </p>
                                    <Select 
                                        value={data.patient_id.toString()} 
                                        onValueChange={handlePatientSelect}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an existing patient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {patients.length > 0 ? (
                                                patients.map((patient) => (
                                                    <SelectItem key={patient.id} value={patient.id.toString()}>
                                                        <div className="flex items-center gap-2">
                                                            <span>{patient.first_name} {patient.last_name} ({patient.patient_no})</span>
                                                            {(patient as any).transfer_required_count > 0 && (
                                                                <span className="px-1.5 py-0.5 text-xs font-semibold bg-orange-100 text-orange-800 rounded">
                                                                    Transfer Required
                                                                </span>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-2 text-sm text-gray-500">No eligible patients found</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.patient_id && (
                                        <p className="text-red-600 text-sm mt-1">{errors.patient_id}</p>
                                    )}
                                    {patients.length === 0 && (
                                        <p className="text-amber-600 text-sm mt-1">
                                            No patients available. Patients must have been consulted by a doctor before they can be transferred.
                                        </p>
                                    )}
                                </div>

                                {selectedPatient && (
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">Selected Patient</h4>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <div><strong>Name:</strong> {selectedPatient.first_name} {selectedPatient.last_name}</div>
                                            <div><strong>Patient No:</strong> {selectedPatient.patient_no}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Visit Selection */}
                                {selectedPatient && (
                                    <div>
                                        <Label htmlFor="visit_id">Select Consultation/Visit *</Label>
                                        <p className="text-xs text-gray-500 mb-2">
                                            Select the specific visit/consultation where the doctor evaluated the need for transfer
                                        </p>
                                        {loadingVisits ? (
                                            <div className="p-3 text-sm text-gray-500">Loading visits...</div>
                                        ) : visits.length > 0 ? (
                                            <Select 
                                                value={data.visit_id.toString()} 
                                                onValueChange={(value) => setData('visit_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a consultation/visit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {visits.map((visit) => (
                                                        <SelectItem key={visit.id} value={visit.id.toString()}>
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium">
                                                                        {visit.visit_code} - {visit.appointment_date ? new Date(visit.appointment_date).toLocaleDateString() : 'N/A'}
                                                                    </span>
                                                                    {visit.transfer_required && (
                                                                        <span className="px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-800 rounded">
                                                                            Transfer Required
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-gray-500">
                                                                    Dr. {visit.doctor_name} {visit.appointment_time ? `- ${visit.appointment_time}` : ''}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                                                No doctor consultations found for this patient. The patient must have at least one visit with a doctor consultation.
                                            </div>
                                        )}
                                        {errors.visit_id && (
                                            <p className="text-red-600 text-sm mt-1">{errors.visit_id}</p>
                                        )}
                                        
                                        {/* Show selected visit details */}
                                        {data.visit_id && visits.find(v => v.id.toString() === data.visit_id.toString()) && (() => {
                                            const selectedVisit = visits.find(v => v.id.toString() === data.visit_id.toString());
                                            const isTransferRequired = selectedVisit?.transfer_required === true;
                                            return (
                                                <div className={`mt-3 p-4 rounded-lg border-2 ${isTransferRequired ? 'bg-orange-50 border-orange-300' : 'bg-blue-50 border-blue-200'}`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-medium text-gray-900">Selected Visit Details</h4>
                                                        {isTransferRequired && (
                                                            <span className="px-2 py-1 text-xs font-semibold bg-orange-200 text-orange-900 rounded">
                                                                ✓ Marked for Transfer
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1 text-sm text-gray-700">
                                                        <div><strong>Visit Code:</strong> {selectedVisit?.visit_code}</div>
                                                        <div><strong>Date:</strong> {selectedVisit?.appointment_date ? new Date(selectedVisit.appointment_date).toLocaleDateString() : 'N/A'}</div>
                                                        <div><strong>Doctor:</strong> {selectedVisit?.doctor_name}</div>
                                                        {selectedVisit?.reason_for_consult && (
                                                            <div><strong>Reason for Consult:</strong> {selectedVisit.reason_for_consult}</div>
                                                        )}
                                                        {selectedVisit?.assessment_diagnosis && (
                                                            <div><strong>Assessment/Diagnosis:</strong> {selectedVisit.assessment_diagnosis}</div>
                                                        )}
                                                        {selectedVisit?.plan_management && (
                                                            <div><strong>Plan/Management:</strong> {selectedVisit.plan_management}</div>
                                                        )}
                                                        {isTransferRequired && selectedVisit?.transfer_reason_notes && (
                                                            <div className="mt-2 pt-2 border-t border-orange-300">
                                                                <div><strong className="text-orange-800">Transfer Reason (from consultation):</strong></div>
                                                                <div className="text-orange-900 italic">{selectedVisit.transfer_reason_notes}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Transfer Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Transfer Details
                                </CardTitle>
                                <CardDescription>
                                    Provide transfer details and priority
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="priority">Priority *</Label>
                                    <Select 
                                        value={data.priority} 
                                        onValueChange={(value) => setData('priority', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {priorityOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.priority && (
                                        <p className="text-red-600 text-sm mt-1">{errors.priority}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="transfer_date">Transfer Date *</Label>
                                    <Input
                                        id="transfer_date"
                                        type="date"
                                        value={data.transfer_date}
                                        onChange={(e) => setData('transfer_date', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    {errors.transfer_date && (
                                        <p className="text-red-600 text-sm mt-1">{errors.transfer_date}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Transfer Reason */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                Transfer Information
                            </CardTitle>
                            <CardDescription>
                                Provide detailed information about the transfer
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="transfer_reason">Transfer Reason (Physician's Remarks) *</Label>
                                <p className="text-sm text-gray-600 mb-2">
                                    Provide the attending physician's reason for transferring this patient. This should be based on the doctor's consultation and assessment from the selected visit above. The reason should explain why the patient needs to be transferred based on the consultation findings.
                                </p>
                                <Textarea
                                    id="transfer_reason"
                                    value={data.transfer_reason}
                                    onChange={(e) => setData('transfer_reason', e.target.value)}
                                    placeholder="Enter the attending physician's reason for transfer based on the consultation findings..."
                                    rows={4}
                                />
                                {errors.transfer_reason && (
                                    <p className="text-red-600 text-sm mt-1">{errors.transfer_reason}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="notes">Additional Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Any additional information about the transfer..."
                                    rows={3}
                                />
                                {errors.notes && (
                                    <p className="text-red-600 text-sm mt-1">{errors.notes}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Link
                            href="/admin/patient-transfers/transfers"
                            className="px-4 py-2 text-gray-600 hover:text-gray-900"
                        >
                            Cancel
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {processing ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    Create Transfer
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

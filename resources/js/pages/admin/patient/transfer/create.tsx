import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, 
    ArrowRightLeft, 
    Calendar, 
    Save, 
    User, 
    AlertCircle,
    FileText
} from 'lucide-react';
import { useState } from 'react';

interface Patient {
    id: number;
    first_name: string;
    last_name: string;
    patient_no: string;
}

interface Props {
    patient?: Patient | null;
    patients: Patient[];
}

const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];

export default function PatientTransferCreate({ patient, patients }: Props) {
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patient || null);

    const { data, setData, processing, errors, post } = useForm({
        patient_id: patient?.id || '',
        transfer_reason: '',
        priority: 'medium',
        notes: '',
        transfer_date: new Date().toISOString().split('T')[0], // Today's date
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Patient Management', href: '/admin/patient' },
        { label: 'Patient Transfers', href: '/admin/patient-transfers' },
        { label: 'New Transfer', href: '/admin/patient-transfers/create' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/patient-transfers');
    };

    const handlePatientSelect = (patientId: string) => {
        const patient = patients.find(p => p.id.toString() === patientId);
        setSelectedPatient(patient || null);
        setData('patient_id', patientId);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Patient Transfer" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/patient-transfers"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Transfers
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <ArrowRightLeft className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create Patient Transfer</h1>
                        <p className="text-gray-600 mt-1">
                            Transfer a patient between hospital and clinic
                        </p>
                    </div>
                </div>

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
                                    Select the patient to transfer
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="patient_id">Patient *</Label>
                                    <Select 
                                        value={data.patient_id.toString()} 
                                        onValueChange={handlePatientSelect}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a patient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {patients.map((patient) => (
                                                <SelectItem key={patient.id} value={patient.id.toString()}>
                                                    {patient.first_name} {patient.last_name} ({patient.patient_no})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.patient_id && (
                                        <p className="text-red-600 text-sm mt-1">{errors.patient_id}</p>
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
                                <Label htmlFor="transfer_reason">Transfer Reason *</Label>
                                <Textarea
                                    id="transfer_reason"
                                    value={data.transfer_reason}
                                    onChange={(e) => setData('transfer_reason', e.target.value)}
                                    placeholder="Explain why the patient needs to be transferred..."
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
                            href="/admin/patient-transfers"
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

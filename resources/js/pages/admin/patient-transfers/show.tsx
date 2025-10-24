import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, XCircle, User, Calendar, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface PatientTransfer {
    id: number;
    patient_data: {
        first_name: string;
        last_name: string;
        middle_name?: string;
        birthdate: string;
        age: number;
        sex: string;
        civil_status: string;
        nationality: string;
        present_address: string;
        telephone_no?: string;
        mobile_no: string;
        informant_name?: string;
        relationship?: string;
        company_name?: string;
        hmo_name?: string;
        hmo_company_id_no?: string;
        validation_approval_code?: string;
        validity?: string;
        drug_allergies?: string;
        food_allergies?: string;
        past_medical_history?: string;
        family_history?: string;
        social_personal_history?: string;
        obstetrics_gynecology_history?: string;
    };
    registration_type: 'admin' | 'hospital';
    approval_status: 'pending' | 'approved' | 'rejected';
    requested_by: {
        id: number;
        name: string;
        role: string;
    };
    approved_by?: {
        id: number;
        name: string;
        role: string;
    };
    created_at: string;
    approval_date?: string;
    approval_notes?: string;
    transfer_history: Array<{
        id: number;
        action: string;
        action_by_role: string;
        action_by_user: {
            id: number;
            name: string;
        };
        notes?: string;
        action_date: string;
    }>;
}

interface Props {
    transfer: PatientTransfer;
}

export default function ShowPatientTransfer({ transfer }: Props) {
    const [approvalNotes, setApprovalNotes] = React.useState('');
    const [rejectionNotes, setRejectionNotes] = React.useState('');

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'approved':
                return <Badge variant="outline" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getRegistrationTypeBadge = (type: string) => {
        switch (type) {
            case 'admin':
                return <Badge variant="secondary">Admin Registration</Badge>;
            case 'hospital':
                return <Badge variant="default">Hospital Registration</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'created':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800"><FileText className="w-3 h-3 mr-1" />Created</Badge>;
            case 'accepted':
                return <Badge variant="outline" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            case 'completed':
                return <Badge variant="outline" className="bg-purple-100 text-purple-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
            default:
                return <Badge variant="outline">{action}</Badge>;
        }
    };

    const handleApprove = () => {
        if (confirm('Are you sure you want to approve this patient registration?')) {
            router.post(route('admin.patient.transfer.registrations.approve', transfer.id), {
                notes: approvalNotes
            });
        }
    };

    const handleReject = () => {
        if (!rejectionNotes.trim()) {
            alert('Please provide a reason for rejection.');
            return;
        }
        if (confirm('Are you sure you want to reject this patient registration?')) {
            router.post(route('admin.patient.transfer.registrations.reject', transfer.id), {
                notes: rejectionNotes
            });
        }
    };

    return (
        <AppLayout
            title="Patient Transfer Details"
            renderHeader={() => (
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Patient Transfer Details</h2>
                        <p className="text-sm text-gray-600">
                            {transfer.patient_data.first_name} {transfer.patient_data.last_name} - {getStatusBadge(transfer.approval_status)}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Button>
                    </div>
                </div>
            )}
        >
            <Head title="Patient Transfer Details" />

            <div className="py-6">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Patient Information */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Patient Information</CardTitle>
                                    <CardDescription>
                                        {getRegistrationTypeBadge(transfer.registration_type)} - 
                                        Requested by {transfer.requested_by.name} ({transfer.requested_by.role})
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                                            <p className="text-sm">
                                                {transfer.patient_data.first_name} {transfer.patient_data.middle_name} {transfer.patient_data.last_name}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Birthdate & Age</Label>
                                            <p className="text-sm">
                                                {format(new Date(transfer.patient_data.birthdate), 'MMM dd, yyyy')} ({transfer.patient_data.age} years old)
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Sex</Label>
                                            <p className="text-sm capitalize">{transfer.patient_data.sex}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Civil Status</Label>
                                            <p className="text-sm capitalize">{transfer.patient_data.civil_status}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Nationality</Label>
                                            <p className="text-sm">{transfer.patient_data.nationality}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Mobile Number</Label>
                                            <p className="text-sm">{transfer.patient_data.mobile_no}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label className="text-sm font-medium text-gray-500">Present Address</Label>
                                            <p className="text-sm">{transfer.patient_data.present_address}</p>
                                        </div>
                                        {transfer.patient_data.telephone_no && (
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Telephone Number</Label>
                                                <p className="text-sm">{transfer.patient_data.telephone_no}</p>
                                            </div>
                                        )}
                                        {transfer.patient_data.informant_name && (
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Emergency Contact</Label>
                                                <p className="text-sm">
                                                    {transfer.patient_data.informant_name} ({transfer.patient_data.relationship})
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Medical Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Medical Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Drug Allergies</Label>
                                            <p className="text-sm">{transfer.patient_data.drug_allergies || 'None'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Food Allergies</Label>
                                            <p className="text-sm">{transfer.patient_data.food_allergies || 'None'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Past Medical History</Label>
                                            <p className="text-sm">{transfer.patient_data.past_medical_history || 'None'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Family History</Label>
                                            <p className="text-sm">{transfer.patient_data.family_history || 'None'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Social/Personal History</Label>
                                            <p className="text-sm">{transfer.patient_data.social_personal_history || 'None'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Obstetrics/Gynecology History</Label>
                                            <p className="text-sm">{transfer.patient_data.obstetrics_gynecology_history || 'None'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Actions & History */}
                        <div className="space-y-6">
                            {/* Actions */}
                            {transfer.approval_status === 'pending' && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Actions</CardTitle>
                                        <CardDescription>Approve or reject this patient registration</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="approval_notes">Approval Notes (Optional)</Label>
                                            <Textarea
                                                id="approval_notes"
                                                value={approvalNotes}
                                                onChange={(e) => setApprovalNotes(e.target.value)}
                                                placeholder="Add any notes for approval..."
                                                rows={3}
                                            />
                                        </div>
                                        <Button
                                            onClick={handleApprove}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Approve Registration
                                        </Button>
                                        
                                        <div>
                                            <Label htmlFor="rejection_notes">Rejection Reason (Required)</Label>
                                            <Textarea
                                                id="rejection_notes"
                                                value={rejectionNotes}
                                                onChange={(e) => setRejectionNotes(e.target.value)}
                                                placeholder="Please provide a reason for rejection..."
                                                rows={3}
                                            />
                                        </div>
                                        <Button
                                            onClick={handleReject}
                                            variant="outline"
                                            className="w-full text-red-600 hover:text-red-800 border-red-300"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Reject Registration
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Transfer History */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Transfer History</CardTitle>
                                    <CardDescription>All actions performed on this transfer</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {transfer.transfer_history.map((history) => (
                                            <div key={history.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-shrink-0">
                                                    {getActionBadge(history.action)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <User className="w-3 h-3 text-gray-500" />
                                                        <span className="font-medium">{history.action_by_user.name}</span>
                                                        <span className="text-gray-500">({history.action_by_role})</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {format(new Date(history.action_date), 'MMM dd, yyyy HH:mm')}
                                                    </div>
                                                    {history.notes && (
                                                        <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    ArrowLeft, User, Calendar, MapPin, Phone, Mail, FileText, 
    CheckCircle, XCircle, Clock, Heart, Stethoscope, AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patient Management',
        href: '/admin/patient',
    },
    {
        title: 'Patient Transfer',
        href: '/admin/patient-transfers',
    },
    {
        title: 'Transfer Details',
        href: '#',
    },
];

interface PatientTransfer {
    id: number;
    patient_data?: {
        first_name?: string;
        last_name?: string;
        middle_name?: string;
        birthdate?: string;
        age?: number;
        sex?: string;
        civil_status?: string;
        nationality?: string;
        present_address?: string;
        telephone_no?: string;
        mobile_no?: string;
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
    registration_type: string;
    approval_status: string;
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
    transfer_reason?: string;
    priority?: string;
    status?: string;
}

interface TransferHistory {
    id: number;
    action: string;
    action_date: string;
    notes?: string;
    action_by_user?: {
        id: number;
        name: string;
        role: string;
    };
}

interface Props {
    transfer: PatientTransfer;
    transferHistory?: TransferHistory[];
}

export default function PatientTransferShow({ transfer, transferHistory = [] }: Props) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'approved':
                return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'hospital':
                return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Hospital Registration</Badge>;
            case 'admin':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Admin Registration</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high':
                return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">High Priority</Badge>;
            case 'medium':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium Priority</Badge>;
            case 'low':
                return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Low Priority</Badge>;
            default:
                return <Badge variant="outline">{priority}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patient Transfer Details" />
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Patient Information */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Patient Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Full Name</label>
                                            <p className="text-sm font-semibold">
                                                {transfer.patient_data?.first_name} {transfer.patient_data?.middle_name} {transfer.patient_data?.last_name}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Age & Gender</label>
                                            <p className="text-sm font-semibold">
                                                {transfer.patient_data?.age} years old, {transfer.patient_data?.sex}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Birthdate</label>
                                            <p className="text-sm font-semibold">
                                                {transfer.patient_data?.birthdate ? format(new Date(transfer.patient_data.birthdate), 'MMM dd, yyyy') : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Civil Status</label>
                                            <p className="text-sm font-semibold">{transfer.patient_data?.civil_status || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Nationality</label>
                                            <p className="text-sm font-semibold">{transfer.patient_data?.nationality || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            Address
                                        </label>
                                        <p className="text-sm font-semibold mt-1">{transfer.patient_data?.present_address || 'N/A'}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                                <Phone className="h-4 w-4" />
                                                Mobile Number
                                            </label>
                                            <p className="text-sm font-semibold mt-1">{transfer.patient_data?.mobile_no || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Telephone</label>
                                            <p className="text-sm font-semibold">{transfer.patient_data?.telephone_no || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Informant Name</label>
                                            <p className="text-sm font-semibold">{transfer.patient_data?.informant_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Relationship</label>
                                            <p className="text-sm font-semibold">{transfer.patient_data?.relationship || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {transfer.patient_data?.company_name && (
                                        <>
                                            <Separator />
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Company</label>
                                                <p className="text-sm font-semibold">{transfer.patient_data.company_name}</p>
                                            </div>
                                        </>
                                    )}

                                    {(transfer.patient_data?.hmo_name || transfer.patient_data?.hmo_company_id_no) && (
                                        <>
                                            <Separator />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">HMO Name</label>
                                                    <p className="text-sm font-semibold">{transfer.patient_data?.hmo_name || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">HMO ID</label>
                                                    <p className="text-sm font-semibold">{transfer.patient_data?.hmo_company_id_no || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Medical Information */}
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Stethoscope className="h-5 w-5" />
                                        Medical Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {(transfer.patient_data?.drug_allergies || transfer.patient_data?.food_allergies) && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                                Allergies
                                            </label>
                                            <div className="mt-1 space-y-1">
                                                {transfer.patient_data?.drug_allergies && (
                                                    <p className="text-sm"><strong>Drug Allergies:</strong> {transfer.patient_data.drug_allergies}</p>
                                                )}
                                                {transfer.patient_data?.food_allergies && (
                                                    <p className="text-sm"><strong>Food Allergies:</strong> {transfer.patient_data.food_allergies}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {transfer.patient_data?.past_medical_history && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Past Medical History</label>
                                            <p className="text-sm mt-1">{transfer.patient_data.past_medical_history}</p>
                                        </div>
                                    )}

                                    {transfer.patient_data?.family_history && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Family History</label>
                                            <p className="text-sm mt-1">{transfer.patient_data.family_history}</p>
                                        </div>
                                    )}

                                    {transfer.patient_data?.social_personal_history && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Social/Personal History</label>
                                            <p className="text-sm mt-1">{transfer.patient_data.social_personal_history}</p>
                                        </div>
                                    )}

                                    {transfer.patient_data?.obstetrics_gynecology_history && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Obstetrics/Gynecology History</label>
                                            <p className="text-sm mt-1">{transfer.patient_data.obstetrics_gynecology_history}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Transfer Information */}
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Transfer Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Transfer ID</label>
                                        <p className="text-sm font-semibold">#{transfer.id}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Registration Type</label>
                                        <div className="mt-1">{getTypeBadge(transfer.registration_type)}</div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Status</label>
                                        <div className="mt-1">{getStatusBadge(transfer.approval_status)}</div>
                                    </div>

                                    {transfer.priority && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Priority</label>
                                            <div className="mt-1">{getPriorityBadge(transfer.priority)}</div>
                                        </div>
                                    )}

                                    <Separator />

                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Requested By</label>
                                        <p className="text-sm font-semibold">{transfer.requested_by.name}</p>
                                        <p className="text-xs text-gray-500">{transfer.requested_by.role}</p>
                                    </div>

                                    {transfer.approved_by && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Approved By</label>
                                            <p className="text-sm font-semibold">{transfer.approved_by.name}</p>
                                            <p className="text-xs text-gray-500">{transfer.approved_by.role}</p>
                                        </div>
                                    )}

                                    <Separator />

                                    <div>
                                        <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            Created Date
                                        </label>
                                        <p className="text-sm font-semibold mt-1">
                                            {format(new Date(transfer.created_at), 'MMM dd, yyyy HH:mm')}
                                        </p>
                                    </div>

                                    {transfer.approval_date && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Approval Date</label>
                                            <p className="text-sm font-semibold">
                                                {format(new Date(transfer.approval_date), 'MMM dd, yyyy HH:mm')}
                                            </p>
                                        </div>
                                    )}

                                    {transfer.transfer_reason && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Transfer Reason</label>
                                            <p className="text-sm mt-1">{transfer.transfer_reason}</p>
                                        </div>
                                    )}

                                    {transfer.approval_notes && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Approval Notes</label>
                                            <p className="text-sm mt-1">{transfer.approval_notes}</p>
                                        </div>
                                    )}

                                    {transfer.patient_id && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Patient ID</label>
                                            <p className="text-sm font-semibold">#{transfer.patient_id}</p>
                                        </div>
                                    )}

                                    {transfer.transferred_by && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Transferred By</label>
                                            <p className="text-sm font-semibold">User ID: {transfer.transferred_by}</p>
                                        </div>
                                    )}

                                    {transfer.transfer_date && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Transfer Date</label>
                                            <p className="text-sm font-semibold">
                                                {format(new Date(transfer.transfer_date), 'MMM dd, yyyy HH:mm')}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Transfer History */}
                            {transferHistory && transferHistory.length > 0 && (
                                <Card className="mt-6">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Transfer History
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {transferHistory.map((history, index) => (
                                                <div key={history.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-xs font-semibold text-blue-600">
                                                            {index + 1}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-semibold text-gray-900 capitalize">
                                                                {history.action.replace('_', ' ')}
                                                            </h4>
                                                            <span className="text-xs text-gray-500">
                                                                {format(new Date(history.action_date), 'MMM dd, yyyy HH:mm')}
                                                            </span>
                                                        </div>
                                                        {history.action_by_user && (
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                By: {history.action_by_user.name} ({history.action_by_user.role})
                                                            </p>
                                                        )}
                                                        {history.notes && (
                                                            <p className="text-sm text-gray-700 mt-2 p-2 bg-white rounded border">
                                                                {history.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
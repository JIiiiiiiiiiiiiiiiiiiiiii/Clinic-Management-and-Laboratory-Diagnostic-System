import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, 
    ArrowRightLeft, 
    Calendar, 
    CheckCircle, 
    Clock, 
    Edit, 
    Trash2, 
    User, 
    XCircle,
    AlertCircle,
    FileText
} from 'lucide-react';
import { useState } from 'react';

interface PatientTransfer {
    id: number;
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        patient_no: string;
    };
    transfer_reason: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'completed' | 'cancelled';
    notes: string | null;
    transferred_by: {
        id: number;
        name: string;
    };
    accepted_by: {
        id: number;
        name: string;
    } | null;
    transfer_date: string;
    completion_date: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    transfer: PatientTransfer;
}

const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
};

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

const statusIcons = {
    pending: Clock,
    completed: CheckCircle,
    cancelled: XCircle,
};

export default function PatientTransferShow({ transfer }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { data, setData, processing, put, delete: destroy } = useForm({
        status: transfer.status,
        notes: transfer.notes || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Patient Management', href: '/admin/patient' },
        { label: 'Patient Transfers', href: '/admin/patient-transfers' },
        { label: `Transfer #${transfer.id}`, href: `/admin/patient-transfers/${transfer.id}` },
    ];

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/patient-transfers/${transfer.id}`, {
            onSuccess: () => setIsEditing(false),
        });
    };

    const handleDelete = () => {
        destroy(`/admin/patient-transfers/${transfer.id}`, {
            onSuccess: () => {
                // Redirect will be handled by the controller
            },
        });
    };

    const handleComplete = () => {
        put(`/admin/patient-transfers/${transfer.id}/complete`);
    };

    const handleCancel = () => {
        put(`/admin/patient-transfers/${transfer.id}/cancel`);
    };

    const StatusIcon = statusIcons[transfer.status];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Patient Transfer #${transfer.id}`} />

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
                    <div className="flex items-center gap-2">
                        {transfer.status === 'pending' && (
                            <>
                                <Button
                                    onClick={handleComplete}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Complete
                                </Button>
                                <Button
                                    onClick={handleCancel}
                                    variant="outline"
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                            </>
                        )}
                        <Button
                            onClick={() => setIsEditing(!isEditing)}
                            variant="outline"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            {isEditing ? 'Cancel Edit' : 'Edit'}
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <ArrowRightLeft className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Patient Transfer #{transfer.id}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Transfer details and status
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Transfer Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Patient Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Patient Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Patient Name</label>
                                        <p className="text-lg font-medium">
                                            {transfer.patient.first_name} {transfer.patient.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Patient Number</label>
                                        <p className="text-lg font-medium">{transfer.patient.patient_no}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Transfer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Transfer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Transfer Reason</label>
                                    <p className="text-gray-900 mt-1">{transfer.transfer_reason}</p>
                                </div>

                                {transfer.notes && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Notes</label>
                                        <p className="text-gray-900 mt-1">{transfer.notes}</p>
                                    </div>
                                )}

                                {isEditing && (
                                    <form onSubmit={handleUpdate} className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Status</label>
                                            <Select 
                                                value={data.status} 
                                                onValueChange={(value) => setData('status', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Notes</label>
                                            <Textarea
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                rows={3}
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                {processing ? 'Updating...' : 'Update Transfer'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsEditing(false)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Status and Actions */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <StatusIcon className="w-5 h-5" />
                                    Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Badge className={statusColors[transfer.status]}>
                                        {transfer.status}
                                    </Badge>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Badge className={priorityColors[transfer.priority]}>
                                        {transfer.priority} priority
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Transfer Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Transfer Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Transfer Date</label>
                                    <p className="text-gray-900">
                                        {new Date(transfer.transfer_date).toLocaleDateString()}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Transferred By</label>
                                    <p className="text-gray-900">{transfer.transferred_by.name}</p>
                                </div>

                                {transfer.accepted_by && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Accepted By</label>
                                        <p className="text-gray-900">{transfer.accepted_by.name}</p>
                                    </div>
                                )}

                                {transfer.completion_date && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Completion Date</label>
                                        <p className="text-gray-900">
                                            {new Date(transfer.completion_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link
                                    href={`/admin/patient/${transfer.patient.id}`}
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    <User className="w-4 h-4" />
                                    View Patient
                                </Link>

                                {transfer.status === 'pending' && (
                                    <>
                                        <Button
                                            onClick={handleComplete}
                                            className="w-full bg-green-600 hover:bg-green-700"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Mark Complete
                                        </Button>
                                        <Button
                                            onClick={handleCancel}
                                            variant="outline"
                                            className="w-full border-red-300 text-red-600 hover:bg-red-50"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Cancel Transfer
                                        </Button>
                                    </>
                                )}

                                <Button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    variant="outline"
                                    className="w-full border-red-300 text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Transfer
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-600">
                                    <AlertCircle className="w-5 h-5" />
                                    Confirm Delete
                                </CardTitle>
                                <CardDescription>
                                    Are you sure you want to delete this patient transfer? This action cannot be undone.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex gap-2">
                                <Button
                                    onClick={handleDelete}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Delete
                                </Button>
                                <Button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Calendar, 
    Clock, 
    User, 
    Phone, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    FileText,
    DollarSign
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Pending Appointments', href: '/admin/pending-appointments' },
    { title: 'Appointment Details', href: '/admin/pending-appointments/show' },
];

interface PendingAppointment {
    id: number;
    patient_name: string;
    patient_id: string;
    contact_number: string;
    appointment_type: string;
    specialist_type: string;
    specialist_name: string;
    specialist_id: string;
    appointment_date: string;
    appointment_time: string;
    duration: string;
    price: string;
    notes: string | null;
    special_requirements: string | null;
    booking_method: string;
    status_approval: string;
    created_at: string;
}

interface PendingAppointmentShowProps {
    pendingAppointment: PendingAppointment;
}

export default function PendingAppointmentShow({ 
    pendingAppointment 
}: PendingAppointmentShowProps) {
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const { data: approveData, setData: setApproveData, post: approvePost, processing: approveProcessing, errors: approveErrors } = useForm({
        admin_notes: '',
    });

    const { data: rejectData, setData: setRejectData, post: rejectPost, processing: rejectProcessing, errors: rejectErrors } = useForm({
        admin_notes: '',
    });

    const handleApprove = () => {
        if (isProcessing) return; // Prevent multiple clicks
        
        setIsProcessing(true);
        approvePost(route('admin.pending-appointments.approve', pendingAppointment.id), {
            onSuccess: () => {
                setShowApproveDialog(false);
                setApproveData({ admin_notes: '' });
                setIsProcessing(false);
                // Use Inertia router for proper navigation
                router.visit(route('admin.pending-appointments.index'), {
                    method: 'get',
                    onFinish: () => {
                        // Show success message
                        alert('Appointment approved successfully! Patient has been notified.');
                    }
                });
            },
            onError: (errors) => {
                console.error('Approval errors:', errors);
                setIsProcessing(false);
                
                // If appointment already approved, just close popup and redirect
                if (errors.error && (errors.error.includes('already been approved') || errors.code === 'already_approved')) {
                    setShowApproveDialog(false);
                    setApproveData({ admin_notes: '' });
                    router.visit(route('admin.pending-appointments.index'), {
                        method: 'get',
                        onFinish: () => {
                            // Show a brief, friendly message
                            alert('This appointment has already been approved. You have been redirected to the updated list.');
                        }
                    });
                } else {
                    alert('Error approving appointment. Please try again.');
                }
            }
        });
    };

    const handleReject = () => {
        if (isProcessing) return; // Prevent multiple clicks
        
        setIsProcessing(true);
        rejectPost(route('admin.pending-appointments.reject', pendingAppointment.id), {
            onSuccess: () => {
                setShowRejectDialog(false);
                setRejectData({ admin_notes: '' });
                setIsProcessing(false);
                // Use Inertia router for proper navigation
                router.visit(route('admin.pending-appointments.index'), {
                    method: 'get',
                    onFinish: () => {
                        // Show success message
                        alert('Appointment rejected. Patient has been notified.');
                    }
                });
            },
            onError: (errors) => {
                console.error('Rejection errors:', errors);
                setIsProcessing(false);
                alert('Error rejecting appointment. Please try again.');
            }
        });
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'consultation':
                return 'bg-blue-100 text-blue-800';
            case 'checkup':
                return 'bg-green-100 text-green-800';
            case 'fecalysis':
                return 'bg-yellow-100 text-yellow-800';
            case 'cbc':
                return 'bg-purple-100 text-purple-800';
            case 'urinalysis':
                return 'bg-orange-100 text-orange-800';
            case 'x-ray':
                return 'bg-red-100 text-red-800';
            case 'ultrasound':
                return 'bg-indigo-100 text-indigo-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pending Appointment ${pendingAppointment.id}`} />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button asChild variant="outline" className="h-12 w-12">
                                <Link href="/admin/pending-appointments">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-2">Appointment Request Details</h1>
                                <p className="text-sm text-black">Review appointment request and approve or reject</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Pending Approval
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Patient Information */}
                        <Card className="shadow-lg border-0 rounded-xl">
                            <CardHeader className="bg-white border-b border-gray-200">
                                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                    <User className="h-5 w-5 text-black" />
                                    Patient Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Patient Name</Label>
                                        <p className="text-lg font-semibold text-black">{pendingAppointment.patient_name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Patient ID</Label>
                                        <p className="text-lg font-semibold text-black">{pendingAppointment.patient_id}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Contact Number</Label>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-500" />
                                            <p className="text-lg font-semibold text-black">{pendingAppointment.contact_number}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Booking Method</Label>
                                        <p className="text-lg font-semibold text-black">{pendingAppointment.booking_method}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Appointment Details */}
                        <Card className="shadow-lg border-0 rounded-xl">
                            <CardHeader className="bg-white border-b border-gray-200">
                                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                    <Calendar className="h-5 w-5 text-black" />
                                    Appointment Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Appointment Type</Label>
                                        <div className="mt-1">
                                            <Badge className={getTypeBadge(pendingAppointment.appointment_type)}>
                                                {pendingAppointment.appointment_type}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Specialist</Label>
                                        <p className="text-lg font-semibold text-black">{pendingAppointment.specialist_name}</p>
                                        <p className="text-sm text-gray-600">{pendingAppointment.specialist_type}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Date</Label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <p className="text-lg font-semibold text-black">{pendingAppointment.appointment_date}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Time</Label>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-500" />
                                            <p className="text-lg font-semibold text-black">{pendingAppointment.appointment_time}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Duration</Label>
                                        <p className="text-lg font-semibold text-black">{pendingAppointment.duration}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Price</Label>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            <p className="text-lg font-semibold text-green-600">{pendingAppointment.price}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Information */}
                        {(pendingAppointment.notes || pendingAppointment.special_requirements) && (
                            <Card className="shadow-lg border-0 rounded-xl">
                                <CardHeader className="bg-white border-b border-gray-200">
                                    <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                        <FileText className="h-5 w-5 text-black" />
                                        Additional Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {pendingAppointment.notes && (
                                        <div className="mb-4">
                                            <Label className="text-sm font-medium text-gray-600">Patient Notes</Label>
                                            <p className="text-black mt-1 p-3 bg-gray-50 rounded-lg">{pendingAppointment.notes}</p>
                                        </div>
                                    )}
                                    {pendingAppointment.special_requirements && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Special Requirements</Label>
                                            <p className="text-black mt-1 p-3 bg-gray-50 rounded-lg">{pendingAppointment.special_requirements}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Action Panel */}
                    <div className="space-y-6">
                        {/* Approval Actions */}
                        <Card className="shadow-lg border-0 rounded-xl">
                            <CardHeader className="bg-white border-b border-gray-200">
                                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    Admin Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <Button
                                        onClick={() => setShowApproveDialog(true)}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve Appointment
                                    </Button>
                                    <Button
                                        onClick={() => setShowRejectDialog(true)}
                                        variant="destructive"
                                        className="w-full"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject Request
                                    </Button>
                                </div>
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Note:</strong> Approved appointments will be added to the main appointments table and the patient will be notified.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Request Information */}
                        <Card className="shadow-lg border-0 rounded-xl">
                            <CardHeader className="bg-white border-b border-gray-200">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <Clock className="h-5 w-5 text-gray-600" />
                                    Request Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Requested On</Label>
                                        <p className="text-black">{pendingAppointment.created_at}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Status</Label>
                                        <Badge className="bg-yellow-100 text-yellow-800">
                                            Pending Approval
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Approve Dialog */}
                <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                Approve Appointment
                            </DialogTitle>
                            <DialogDescription>
                                This will create the appointment and notify the patient. You can add optional admin notes.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="admin_notes">Admin Notes (Optional)</Label>
                                <Textarea
                                    id="admin_notes"
                                    value={approveData.admin_notes}
                                    onChange={(e) => setApproveData('admin_notes', e.target.value)}
                                    placeholder="Add any notes for the patient..."
                                    rows={3}
                                />
                                {approveErrors.admin_notes && (
                                    <p className="text-red-500 text-sm mt-1">{approveErrors.admin_notes}</p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleApprove} 
                                disabled={approveProcessing || isProcessing}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {(approveProcessing || isProcessing) ? 'Approving...' : 'Confirm Approval'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Reject Dialog */}
                <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-red-600" />
                                Reject Appointment Request
                            </DialogTitle>
                            <DialogDescription>
                                Please provide a reason for rejection. The patient will be notified with this reason.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="reject_notes">Reason for Rejection *</Label>
                                <Textarea
                                    id="reject_notes"
                                    value={rejectData.admin_notes}
                                    onChange={(e) => setRejectData('admin_notes', e.target.value)}
                                    placeholder="Please provide a reason for rejection..."
                                    rows={3}
                                    required
                                />
                                {rejectErrors.admin_notes && (
                                    <p className="text-red-500 text-sm mt-1">{rejectErrors.admin_notes}</p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleReject} 
                                disabled={rejectProcessing || isProcessing || !rejectData.admin_notes.trim()}
                                variant="destructive"
                            >
                                {(rejectProcessing || isProcessing) ? 'Rejecting...' : 'Confirm Rejection'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

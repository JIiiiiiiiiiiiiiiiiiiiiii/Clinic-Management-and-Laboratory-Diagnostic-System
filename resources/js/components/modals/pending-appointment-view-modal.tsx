import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { safeFormatDate, safeFormatTime } from '@/utils/dateTime';
import { 
    Edit,
    Printer,
    User,
    Calendar,
    Clock,
    DollarSign,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    X,
    Stethoscope,
    TestTube,
    CreditCard,
    Phone,
    MapPin,
    Mail
} from 'lucide-react';
import { router } from '@inertiajs/react';

type PendingAppointment = {
    id: number;
    patient_name: string;
    patient_id: string;
    contact_number?: string;
    appointment_type: string;
    specialist_name: string;
    specialist_id?: string;
    specialist_type?: string;
    appointment_date: string;
    appointment_time: string;
    duration?: string;
    status?: string;
    price: number;
    total_lab_amount: number;
    final_total_amount: number;
    billing_status: string;
    source: string;
    lab_tests_count: number;
    notes?: string;
    special_requirements?: string;
    created_at: string;
    updated_at: string;
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        patient_no: string;
        present_address?: string;
        mobile_no?: string;
        birth_date?: string;
        gender?: string;
    };
    specialist?: {
        id: number;
        name: string;
        role: string;
        employee_id: string;
    };
    labTests?: Array<{
        id: number;
        lab_test_name: string;
        price: number;
        status: string;
        source?: 'appointment' | 'visit';
        ordered_by?: string;
        lab_order_id?: number;
    }>;
    visit?: {
        id: number;
        visit_code: string;
        visit_date_time_time: string;
        status: string;
        attending_staff?: {
            id: number;
            name: string;
            role: string;
        };
    };
    visit_lab_orders?: Array<{
        id: number;
        status: string;
        ordered_by: string;
        notes: string;
        created_at: string;
    }>;
};

interface PendingAppointmentViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: PendingAppointment | null;
    onEdit?: (appointmentId: number) => void;
}

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
    completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    default: { label: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
};

const sourceConfig = {
    online: { label: 'Online', color: 'bg-blue-100 text-blue-800' },
    walk_in: { label: 'Walk-in', color: 'bg-green-100 text-green-800' },
    phone: { label: 'Phone', color: 'bg-purple-100 text-purple-800' },
    default: { label: 'Unknown', color: 'bg-gray-100 text-gray-800' },
};

export default function PendingAppointmentViewModal({
    isOpen,
    onClose,
    appointment,
    onEdit
}: PendingAppointmentViewModalProps) {
    
    const handleEdit = (appointmentId: number) => {
        onClose();
        if (onEdit) {
            onEdit(appointmentId);
        }
    };

    const handleCreateTransaction = (appointmentId: number) => {
        router.visit(`/admin/billing/create-from-appointments?appointment_id=${appointmentId}`);
    };

    const getStatusBadge = (status: string) => {
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.default;
        const Icon = config.icon;
        
        return (
            <Badge className={config.color}>
                <Icon className="mr-1 h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getSourceBadge = (source: string) => {
        const config = sourceConfig[source as keyof typeof sourceConfig] || sourceConfig.default;
        return (
            <Badge className={config.color}>
                {config.label}
            </Badge>
        );
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-[1000px] sm:max-w-none h-[90vh] max-h-none overflow-y-auto p-0" hideCloseButton={true}>
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6 px-6 pt-6 border-b bg-gradient-to-r from-gray-50 to-white">
                    <div>
                        <DialogTitle className="text-3xl font-bold text-gray-900">
                            Appointment Details #{appointment?.id}
                        </DialogTitle>
                        <p className="text-gray-600 mt-1 text-sm">
                            View appointment information and billing details
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-gray-200">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                {appointment ? (
                    <div className="p-6">
                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 mb-6">
                            <Button 
                                onClick={() => handleEdit(appointment.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Appointment
                            </Button>
                            <Button 
                                onClick={() => handleCreateTransaction(appointment.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Create Transaction
                            </Button>
                            <Button variant="outline">
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                            </Button>
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* Patient Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Patient Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Patient Name</label>
                                                <p className="text-lg font-semibold">{appointment.patient_name}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Patient ID</label>
                                                <p className="text-lg font-semibold">{appointment.patient_id}</p>
                                            </div>
                                            {appointment.contact_number && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Contact Number</label>
                                                    <p className="text-lg font-semibold flex items-center gap-2">
                                                        <Phone className="h-4 w-4" />
                                                        {appointment.contact_number}
                                                    </p>
                                                </div>
                                            )}
                                            {appointment.patient?.present_address && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Address</label>
                                                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                                        <MapPin className="h-4 w-4 inline mr-1" />
                                                        {appointment.patient.present_address}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Appointment Details */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Appointment Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Appointment Type</label>
                                                <p className="text-lg font-semibold">{appointment.appointment_type.replace(/_/g, ' ').toUpperCase()}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Specialist</label>
                                                <p className="text-lg font-semibold flex items-center gap-2">
                                                    <Stethoscope className="h-4 w-4" />
                                                    {appointment.specialist_name}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Date & Time</label>
                                                <p className="text-lg font-semibold flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {safeFormatDate(appointment.appointment_date)} at {safeFormatTime(appointment.appointment_time)}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Duration</label>
                                                <p className="text-lg font-semibold flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    {appointment.duration || '30 minutes'}
                                                </p>
                                            </div>
                                            <div className="flex gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Source</label>
                                                    <div className="mt-1">
                                                        {getSourceBadge(appointment.source || 'default')}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                                    <div className="mt-1">
                                                        {getStatusBadge(appointment.billing_status || 'default')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Timestamps */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Clock className="h-5 w-5" />
                                            Timestamps
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Created At</label>
                                                <p className="text-sm text-gray-700">{safeFormatDate(appointment.created_at)} {safeFormatTime(appointment.created_at)}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                                <p className="text-sm text-gray-700">{safeFormatDate(appointment.updated_at)} {safeFormatTime(appointment.updated_at)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Billing Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <DollarSign className="h-5 w-5" />
                                            Billing Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Base Price</label>
                                                <p className="text-lg font-semibold text-green-600">₱{appointment.price.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Lab Tests Amount</label>
                                                <p className="text-lg font-semibold text-blue-600">₱{appointment.total_lab_amount.toLocaleString()}</p>
                                            </div>
                                            <div className="border-t pt-3">
                                                <label className="text-sm font-medium text-gray-500">Total Amount</label>
                                                <p className="text-xl font-bold text-green-600">₱{appointment.final_total_amount.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Visit Information */}
                                {appointment.visit && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Stethoscope className="h-5 w-5" />
                                                Visit Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Visit Code</label>
                                                    <p className="text-lg font-semibold">{appointment.visit.visit_code}</p>
                                                </div>
                                                {appointment.visit.visit_date_time_time && (
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Visit Date & Time</label>
                                                        <p className="text-sm text-gray-700">{safeFormatDate(appointment.visit.visit_date_time_time)} {safeFormatTime(appointment.visit.visit_date_time_time)}</p>
                                                    </div>
                                                )}
                                                {appointment.visit.attending_staff && (
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Attending Staff</label>
                                                        <p className="text-sm text-gray-700">{appointment.visit.attending_staff.name} ({appointment.visit.attending_staff.role})</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Visit Status</label>
                                                    <div className="mt-1">
                                                        <Badge className="bg-blue-100 text-blue-800">{appointment.visit.status}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Lab Tests Breakdown */}
                                {appointment.labTests && appointment.labTests.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <TestTube className="h-5 w-5" />
                                                Lab Tests Breakdown ({appointment.lab_tests_count})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {/* Lab Tests from Appointment */}
                                            {appointment.labTests.filter((test: any) => test.source === 'appointment').length > 0 && (
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">From Appointment</h4>
                                            <div className="space-y-2">
                                                        {appointment.labTests.filter((test: any) => test.source === 'appointment').map((test: any) => (
                                                    <div key={test.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                                <div className="flex-1">
                                                        <span className="font-medium text-sm">{test.lab_test_name}</span>
                                                                </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm">₱{test.price.toLocaleString()}</span>
                                                            <Badge variant="outline" className="text-xs">{test.status}</Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Lab Tests from Visit (Ordered by Doctors) */}
                                            {appointment.labTests.filter((test: any) => test.source === 'visit').length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">From Visit Consultation (Ordered by Doctor/Staff)</h4>
                                                    <div className="space-y-2">
                                                        {appointment.labTests.filter((test: any) => test.source === 'visit').map((test: any) => (
                                                            <div key={test.id} className="flex justify-between items-start p-2 bg-blue-50 rounded border border-blue-200">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium text-sm">{test.lab_test_name}</span>
                                                                        <Badge className="bg-blue-100 text-blue-800 text-xs">Visit</Badge>
                                                                    </div>
                                                                    {test.ordered_by && (
                                                                        <p className="text-xs text-gray-600 mt-1">Ordered by: {test.ordered_by}</p>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-semibold">₱{test.price.toLocaleString()}</span>
                                                                    <Badge variant="outline" className="text-xs">{test.status}</Badge>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Total Lab Amount */}
                                            <div className="mt-4 pt-4 border-t">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-semibold text-gray-700">Total Lab Tests Amount</span>
                                                    <span className="text-lg font-bold text-blue-600">₱{appointment.total_lab_amount.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Notes and Requirements */}
                                {(appointment.notes || appointment.special_requirements) && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="h-5 w-5" />
                                                Additional Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {appointment.notes && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Notes</label>
                                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{appointment.notes}</p>
                                                </div>
                                            )}
                                            {appointment.special_requirements && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Special Requirements</label>
                                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{appointment.special_requirements}</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No appointment data available</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

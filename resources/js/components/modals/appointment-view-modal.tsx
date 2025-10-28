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
    CreditCard
} from 'lucide-react';
import { router } from '@inertiajs/react';

type Appointment = {
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
    }>;
};

interface AppointmentViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment | null;
    onEdit?: (appointmentId: number) => void;
}

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
    completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
};

const sourceConfig = {
    online: { label: 'Online', color: 'bg-blue-100 text-blue-800' },
    walk_in: { label: 'Walk-in', color: 'bg-green-100 text-green-800' },
    phone: { label: 'Phone', color: 'bg-purple-100 text-purple-800' },
};

export default function AppointmentViewModal({
    isOpen,
    onClose,
    appointment,
    onEdit
}: AppointmentViewModalProps) {
    const handleEdit = (appointmentId: number) => {
        onClose();
        if (onEdit) {
            onEdit(appointmentId);
        }
    };

    const handleCreateTransaction = (appointmentId: number) => {
        router.visit(`/admin/billing/create-from-appointments?appointment_id=${appointmentId}`);
    };

    const getStatusBadge = (status: keyof typeof statusConfig) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        
        return (
            <Badge className={config.color}>
                <Icon className="mr-1 h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getSourceBadge = (source: keyof typeof sourceConfig) => {
        const config = sourceConfig[source];
        return (
            <Badge className={config.color}>
                {config.label}
            </Badge>
        );
    };

    if (!isOpen) return null;

    if (!appointment) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-[1200px] h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Appointment Not Found</DialogTitle>
                    </DialogHeader>
                    <div className="p-6 text-center">
                        <p className="text-gray-500">No appointment data available.</p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-[1200px] sm:max-w-none h-[90vh] max-h-none overflow-y-auto p-0" hideCloseButton={true}>
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6 px-6 pt-6 border-b bg-gradient-to-r from-gray-50 to-white">
                    <div>
                        <DialogTitle className="text-3xl font-bold text-gray-900">
                            Appointment #{appointment.id}
                        </DialogTitle>
                        <p className="text-gray-600 mt-1 text-sm">
                            Complete appointment details and information
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-gray-200">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                {appointment ? (
                    <div className="p-6 space-y-6">
                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
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
                            <Button 
                                variant="outline"
                                onClick={() => window.print()}
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                            </Button>
                        </div>

                        {/* Main Information Grid - 2 columns */}
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
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Patient Name</p>
                                                <p className="text-sm font-medium">{appointment.patient_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Patient ID</p>
                                                <p className="text-sm">{appointment.patient_id}</p>
                                            </div>
                                        </div>
                                        {appointment.patient && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Mobile Number</p>
                                                    <p className="text-sm">{appointment.patient.mobile_no || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Gender</p>
                                                    <p className="text-sm">{appointment.patient.gender || 'N/A'}</p>
                                                </div>
                                            </div>
                                        )}
                                        {appointment.patient && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Address</p>
                                                <p className="text-sm">{appointment.patient.present_address || 'N/A'}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Financial Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <DollarSign className="h-5 w-5" />
                                            Financial Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm font-medium text-gray-500">Base Price</p>
                                                <p className="text-xl font-bold text-gray-900">₱{appointment.price.toLocaleString()}</p>
                                            </div>
                                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                <p className="text-sm font-medium text-gray-500">Lab Tests Amount</p>
                                                <p className="text-xl font-bold text-blue-600">₱{(appointment.total_lab_amount || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                                                <p className="text-xl font-bold text-green-600">₱{(appointment.final_total_amount || appointment.price).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Appointment Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Appointment Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Appointment Type</p>
                                                <Badge variant="outline" className="capitalize">
                                                    {appointment.appointment_type}
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Source</p>
                                                {getSourceBadge(appointment.source as keyof typeof sourceConfig)}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Date</p>
                                                <p className="text-sm">{safeFormatDate(appointment.appointment_date)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Time</p>
                                                <p className="text-sm">{safeFormatTime(appointment.appointment_time)}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Specialist</p>
                                            <p className="text-sm">{appointment.specialist_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Status</p>
                                            {getStatusBadge(appointment.billing_status as keyof typeof statusConfig)}
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
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Created At</p>
                                                <p className="text-sm">{safeFormatDate(appointment.created_at)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                                                <p className="text-sm">{safeFormatDate(appointment.updated_at)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Lab Tests */}
                        {appointment.labTests && appointment.labTests.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TestTube className="h-5 w-5" />
                                        Lab Tests ({appointment.labTests.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Test Name</TableHead>
                                                    <TableHead>Price</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {appointment.labTests.map((test) => (
                                                    <TableRow key={test.id}>
                                                        <TableCell className="font-medium">{test.lab_test_name}</TableCell>
                                                        <TableCell>₱{test.price.toLocaleString()}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="capitalize">
                                                                {test.status}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Notes and Requirements - Side by side */}
                        {(appointment.notes || appointment.special_requirements) && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {appointment.notes && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="h-5 w-5" />
                                                Notes
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm bg-gray-50 p-3 rounded-lg">{appointment.notes}</p>
                                        </CardContent>
                                    </Card>
                                )}
                                {appointment.special_requirements && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="h-5 w-5" />
                                                Special Requirements
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm bg-yellow-50 p-3 rounded-lg">{appointment.special_requirements}</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        {/* Timestamps */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Timestamps
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Created At</p>
                                        <p className="text-sm">{safeFormatDate(appointment.created_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Last Updated</p>
                                        <p className="text-sm">{safeFormatDate(appointment.updated_at)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No appointment data available</p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

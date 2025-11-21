import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { safeFormatDate, safeFormatTime } from '@/utils/dateTime';
import { 
    Edit,
    User,
    Calendar,
    Clock,
    DollarSign,
    FileText,
    X,
    Stethoscope,
    Save,
    AlertCircle,
    TestTube,
    Phone,
    MapPin
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';

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

type Doctor = {
    id: number;
    name: string;
    role: string;
    employee_id: string;
};

interface PendingAppointmentEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    appointment: PendingAppointment | null;
    doctors: Doctor[];
}

const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' },
];

const sourceOptions = [
    { value: 'online', label: 'Online' },
    { value: 'walk_in', label: 'Walk-in' },
    { value: 'phone', label: 'Phone' },
];

const appointmentTypeOptions = [
    { value: 'general_consultation', label: 'Consultation' },
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'check_up', label: 'Check-up' },
    { value: 'specialist_consultation', label: 'Specialist Consultation' },
];

export default function PendingAppointmentEditModal({
    isOpen,
    onClose,
    onSuccess,
    appointment,
    doctors
}: PendingAppointmentEditModalProps) {
    const [appointmentData, setAppointmentData] = useState<PendingAppointment | null>(null);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const { data, setData, put, processing, errors } = useForm({
        patient_name: '',
        patient_id: '',
        appointment_type: '',
        specialist_name: '',
        specialist_id: '',
        appointment_date: '',
        appointment_time: '',
        price: 0,
        billing_status: 'pending',
        source: 'online',
        notes: '',
        special_requirements: '',
    });

    // Update form data when appointment changes - AUTO-FETCH all data from appointment
    useEffect(() => {
        if (appointment) {
            setAppointmentData(appointment);
            // CRITICAL: Auto-fetch all data from appointment object to ensure consistency with view modal
            setData({
                patient_name: appointment.patient_name || (appointment.patient?.first_name && appointment.patient?.last_name 
                    ? `${appointment.patient.first_name} ${appointment.patient.last_name}`.trim() 
                    : ''),
                patient_id: appointment.patient_id?.toString() || appointment.patient?.patient_no || appointment.patient_id || '',
                appointment_type: appointment.appointment_type || '',
                specialist_name: appointment.specialist_name || appointment.specialist?.name || '',
                specialist_id: appointment.specialist?.id?.toString() || appointment.specialist_id?.toString() || '',
                appointment_date: appointment.appointment_date || '',
                appointment_time: appointment.appointment_time || '',
                price: appointment.price || 0,
                billing_status: appointment.billing_status || 'pending',
                source: appointment.source || 'online',
                notes: appointment.notes || '',
                special_requirements: appointment.special_requirements || '',
            });
        }
    }, [appointment, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors([]);

        if (!appointmentData) {
            setValidationErrors(['No appointment data available']);
            return;
        }

        put(`/admin/billing/pending-appointments/${appointmentData.id}`, {
            onSuccess: () => {
                onSuccess();
                onClose();
            },
            onError: (errors: any) => {
                console.error('Update failed:', errors);
                if (errors.errors) {
                    setValidationErrors(Object.values(errors.errors).flat());
                } else {
                    setValidationErrors([errors.message || 'Update failed']);
                }
            },
        });
    };

    const handleSpecialistChange = (specialistId: string) => {
        const selectedDoctor = doctors.find(doctor => doctor.id.toString() === specialistId);
        if (selectedDoctor) {
            setData('specialist_name', selectedDoctor.name);
            setData('specialist_id', specialistId);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-[900px] sm:max-w-none h-[90vh] max-h-none overflow-y-auto p-0" hideCloseButton={true}>
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6 px-6 pt-6 border-b bg-gradient-to-r from-gray-50 to-white">
                    <div>
                        <DialogTitle className="text-3xl font-bold text-gray-900">
                            Edit Appointment #{appointment?.id}
                        </DialogTitle>
                        <p className="text-gray-600 mt-1 text-sm">
                            Update appointment details and information
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-gray-200">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                            </div>
                            <ul className="text-sm text-red-700 list-disc list-inside">
                                {validationErrors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

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
                                    <div>
                                        <Label htmlFor="patient_name">Patient Name</Label>
                                        <Input
                                            id="patient_name"
                                            value={data.patient_name}
                                            onChange={(e) => setData('patient_name', e.target.value)}
                                            className="mt-1"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="patient_id">Patient ID</Label>
                                        <Input
                                            id="patient_id"
                                            value={data.patient_id}
                                            onChange={(e) => setData('patient_id', e.target.value)}
                                            className="mt-1"
                                            required
                                        />
                                    </div>
                                    {appointment?.contact_number && (
                                        <div>
                                            <Label>Contact Number</Label>
                                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-1 flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                {appointment.contact_number}
                                            </p>
                                        </div>
                                    )}
                                    {appointment?.patient?.present_address && (
                                        <div>
                                            <Label>Address</Label>
                                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-1 flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                {appointment.patient.present_address}
                                            </p>
                                        </div>
                                    )}
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
                                    <div>
                                        <Label htmlFor="appointment_type">Appointment Type</Label>
                                        <Select value={data.appointment_type} onValueChange={(value) => setData('appointment_type', value)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select appointment type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {appointmentTypeOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="specialist_id">Specialist</Label>
                                        <Select value={data.specialist_id} onValueChange={handleSpecialistChange}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select specialist" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {doctors.map((doctor) => (
                                                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                                        {doctor.name} - {doctor.role}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="appointment_date">Date</Label>
                                            <Input
                                                id="appointment_date"
                                                type="date"
                                                value={data.appointment_date}
                                                onChange={(e) => setData('appointment_date', e.target.value)}
                                                className="mt-1"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="appointment_time">Time</Label>
                                            <Input
                                                id="appointment_time"
                                                type="time"
                                                value={data.appointment_time}
                                                onChange={(e) => setData('appointment_time', e.target.value)}
                                                className="mt-1"
                                                required
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Status & Source */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Status & Source
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="source">Source</Label>
                                        <Select value={data.source} onValueChange={(value) => setData('source', value)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select source" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sourceOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="billing_status">Status</Label>
                                        <Select value={data.billing_status} onValueChange={(value) => setData('billing_status', value)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Billing Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Billing Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="price">Base Price (₱)</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.price}
                                            onChange={(e) => setData('price', parseFloat(e.target.value) || 0)}
                                            className="mt-1"
                                            required
                                        />
                                    </div>
                                    {appointment && (
                                        <>
                                            <div>
                                                <Label>Lab Tests Amount</Label>
                                                <p className="text-lg font-semibold text-blue-600 mt-1">
                                                    ₱{appointment.total_lab_amount?.toLocaleString() || '0.00'}
                                                </p>
                                            </div>
                                            <div className="border-t pt-3">
                                                <Label>Total Amount</Label>
                                                <p className="text-xl font-bold text-green-600 mt-1">
                                                    ₱{((data.price || 0) + (appointment.total_lab_amount || 0)).toLocaleString()}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Visit Information */}
                            {appointment?.visit && (
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
                                                <p className="text-sm font-semibold">{appointment.visit.visit_code}</p>
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
                                                <p className="text-sm text-gray-700">{appointment.visit.status}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Lab Tests Breakdown */}
                            {appointment?.labTests && appointment.labTests.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TestTube className="h-5 w-5" />
                                            Lab Tests Breakdown ({appointment.labTests.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {/* Lab Tests from Appointment */}
                                            {appointment.labTests.filter((test: any) => test.source === 'appointment').length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-semibold text-gray-600 mb-2">From Appointment</h4>
                                                    <div className="space-y-2">
                                                        {appointment.labTests.filter((test: any) => test.source === 'appointment').map((test: any) => (
                                                            <div key={test.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                                <span className="text-sm">{test.lab_test_name}</span>
                                                                <span className="text-sm font-semibold">₱{test.price.toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Lab Tests from Visit */}
                                            {appointment.labTests.filter((test: any) => test.source === 'visit').length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-semibold text-gray-600 mb-2">From Visit Consultation (Ordered by Doctor/Staff)</h4>
                                                    <div className="space-y-2">
                                                        {appointment.labTests.filter((test: any) => test.source === 'visit').map((test: any) => (
                                                            <div key={test.id} className="flex justify-between items-start p-2 bg-blue-50 rounded border border-blue-200">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-medium">{test.lab_test_name}</span>
                                                                        <Badge className="bg-blue-100 text-blue-800 text-xs">Visit</Badge>
                                                                    </div>
                                                                    {test.ordered_by && (
                                                                        <p className="text-xs text-gray-600 mt-1">Ordered by: {test.ordered_by}</p>
                                                                    )}
                                                                </div>
                                                                <span className="text-sm font-semibold">₱{test.price.toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Total Lab Amount */}
                                            <div className="pt-3 border-t">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-semibold text-gray-700">Total Lab Tests Amount:</span>
                                                    <span className="text-base font-bold text-blue-600">₱{appointment.total_lab_amount.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Additional Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Additional Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            className="mt-1"
                                            rows={3}
                                            placeholder="Enter any additional notes..."
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="special_requirements">Special Requirements</Label>
                                        <Textarea
                                            id="special_requirements"
                                            value={data.special_requirements}
                                            onChange={(e) => setData('special_requirements', e.target.value)}
                                            className="mt-1"
                                            rows={3}
                                            placeholder="Enter any special requirements..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Timestamps */}
                            {appointment && (
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
                                                <Label>Created At</Label>
                                                <p className="text-sm text-gray-700 mt-1">
                                                    {safeFormatDate(appointment.created_at)} {safeFormatTime(appointment.created_at)}
                                                </p>
                                            </div>
                                            <div>
                                                <Label>Last Updated</Label>
                                                <p className="text-sm text-gray-700 mt-1">
                                                    {safeFormatDate(appointment.updated_at)} {safeFormatTime(appointment.updated_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t mt-6">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {processing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Update Appointment
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

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
    TestTube,
    Save,
    AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';

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

type Doctor = {
    id: number;
    name: string;
    role: string;
    employee_id: string;
};

interface AppointmentEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    appointment: Appointment | null;
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

export default function AppointmentEditModal({
    isOpen,
    onClose,
    onSuccess,
    appointment,
    doctors
}: AppointmentEditModalProps) {
    const [appointmentData, setAppointmentData] = useState<Appointment | null>(null);
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

    // Update form data when appointment changes
    useEffect(() => {
        if (appointment) {
            setAppointmentData(appointment);
            setData({
                patient_name: appointment.patient_name || '',
                patient_id: appointment.patient_id || '',
                appointment_type: appointment.appointment_type || '',
                specialist_name: appointment.specialist_name || '',
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
    }, [appointment]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors([]);

        if (!appointmentData) {
            setValidationErrors(['No appointment data available']);
            return;
        }

        put(`/admin/appointments/${appointmentData.id}`, {
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
        setData({
            ...data,
            specialist_id: specialistId,
            specialist_name: selectedDoctor?.name || '',
        });
    };

    if (!isOpen) return null;

    if (!appointment) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-[1000px] h-[90vh] overflow-y-auto">
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
            <DialogContent className="w-[95vw] max-w-[1000px] sm:max-w-none h-[90vh] max-h-none overflow-y-auto p-0" hideCloseButton={true}>
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6 px-6 pt-6 border-b bg-gradient-to-r from-gray-50 to-white">
                    <div>
                        <DialogTitle className="text-3xl font-bold text-gray-900">
                            Edit Appointment #{appointment.id}
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

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Validation Errors */}
                        {validationErrors.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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

                        {/* Main Form Grid - 2 columns */}
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
                                        <div className="space-y-2">
                                            <Label htmlFor="patient_name">Patient Name</Label>
                                            <Input
                                                id="patient_name"
                                                value={data.patient_name}
                                                onChange={(e) => setData('patient_name', e.target.value)}
                                                placeholder="Enter patient name"
                                                required
                                            />
                                            {errors.patient_name && (
                                                <p className="text-sm text-red-600">{errors.patient_name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="patient_id">Patient ID</Label>
                                            <Input
                                                id="patient_id"
                                                value={data.patient_id}
                                                onChange={(e) => setData('patient_id', e.target.value)}
                                                placeholder="Enter patient ID"
                                                required
                                            />
                                            {errors.patient_id && (
                                                <p className="text-sm text-red-600">{errors.patient_id}</p>
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
                                        <div className="space-y-2">
                                            <Label htmlFor="appointment_type">Appointment Type</Label>
                                            <Select value={data.appointment_type} onValueChange={(value) => setData('appointment_type', value)}>
                                                <SelectTrigger>
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
                                            {errors.appointment_type && (
                                                <p className="text-sm text-red-600">{errors.appointment_type}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="specialist_id">Specialist</Label>
                                            <Select value={data.specialist_id} onValueChange={handleSpecialistChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select specialist" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {doctors.map((doctor) => (
                                                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                                            {doctor.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.specialist_id && (
                                                <p className="text-sm text-red-600">{errors.specialist_id}</p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="appointment_date">Appointment Date</Label>
                                                <Input
                                                    id="appointment_date"
                                                    type="date"
                                                    value={data.appointment_date}
                                                    onChange={(e) => setData('appointment_date', e.target.value)}
                                                    required
                                                />
                                                {errors.appointment_date && (
                                                    <p className="text-sm text-red-600">{errors.appointment_date}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="appointment_time">Appointment Time</Label>
                                                <Input
                                                    id="appointment_time"
                                                    type="time"
                                                    value={data.appointment_time}
                                                    onChange={(e) => setData('appointment_time', e.target.value)}
                                                    required
                                                />
                                                {errors.appointment_time && (
                                                    <p className="text-sm text-red-600">{errors.appointment_time}</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Financial & Status Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <DollarSign className="h-5 w-5" />
                                            Financial & Status
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Price (₱)</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.price}
                                                onChange={(e) => setData('price', parseFloat(e.target.value) || 0)}
                                                required
                                            />
                                            {errors.price && (
                                                <p className="text-sm text-red-600">{errors.price}</p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="billing_status">Billing Status</Label>
                                                <Select value={data.billing_status} onValueChange={(value) => setData('billing_status', value)}>
                                                    <SelectTrigger>
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
                                                {errors.billing_status && (
                                                    <p className="text-sm text-red-600">{errors.billing_status}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="source">Source</Label>
                                                <Select value={data.source} onValueChange={(value) => setData('source', value)}>
                                                    <SelectTrigger>
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
                                                {errors.source && (
                                                    <p className="text-sm text-red-600">{errors.source}</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Additional Information - Side by side */}
                                <div className="grid grid-cols-1 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="h-5 w-5" />
                                                Notes
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <Label htmlFor="notes">Notes</Label>
                                                <Textarea
                                                    id="notes"
                                                    value={data.notes}
                                                    onChange={(e) => setData('notes', e.target.value)}
                                                    placeholder="Enter any additional notes..."
                                                    rows={4}
                                                />
                                                {errors.notes && (
                                                    <p className="text-sm text-red-600">{errors.notes}</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="h-5 w-5" />
                                                Special Requirements
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <Label htmlFor="special_requirements">Special Requirements</Label>
                                                <Textarea
                                                    id="special_requirements"
                                                    value={data.special_requirements}
                                                    onChange={(e) => setData('special_requirements', e.target.value)}
                                                    placeholder="Enter any special requirements..."
                                                    rows={4}
                                                />
                                                {errors.special_requirements && (
                                                    <p className="text-sm text-red-600">{errors.special_requirements}</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>


                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
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
                </div>
            </DialogContent>
        </Dialog>
    );
}

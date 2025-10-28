import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
    CreditCard,
    DollarSign,
    Receipt,
    X,
    Save,
    AlertCircle,
    User,
    Calendar,
    Clock,
    FileText,
    CheckCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { safeFormatDate, safeFormatTime } from '@/utils/dateTime';

type Doctor = {
    id: number;
    name: string;
    role: string;
    employee_id: string;
};

type Patient = {
    id: number;
    first_name: string;
    last_name: string;
    patient_no: string;
};

type HmoProvider = {
    id: number;
    name: string;
    code: string;
    is_active: boolean;
};

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
    total_lab_amount?: number;
    final_total_amount?: number;
    billing_status: string;
    source: string;
    lab_tests_count: number;
    notes?: string;
    special_requirements?: string;
    created_at: string;
    updated_at: string;
    patient?: Patient;
    specialist?: Doctor;
    labTests?: Array<{
        id: number;
        lab_test_name: string;
        price: number;
        status: string;
    }>;
};

interface AppointmentPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    appointment: Appointment | null;
    doctors: Doctor[];
    patients: Patient[];
    hmoProviders?: HmoProvider[];
}

export default function AppointmentPaymentModal({
    isOpen,
    onClose,
    onSuccess,
    appointment,
    doctors,
    patients,
    hmoProviders = []
}: AppointmentPaymentModalProps) {
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    
    // Form state - matching the original page exactly
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentReference, setPaymentReference] = useState('');
    const [hmoProvider, setHmoProvider] = useState('');
    const [hmoReferenceNumber, setHmoReferenceNumber] = useState('');
    const [isSeniorCitizen, setIsSeniorCitizen] = useState(false);
    const [notes, setNotes] = useState('');

    // Calculate amounts - matching the original page logic exactly
    const totalAmount = appointment ? (() => {
        if (appointment.final_total_amount && appointment.final_total_amount > 0) {
            return Number(appointment.final_total_amount);
        }
        // Fallback: calculate from price + lab tests
        const labAmount = Number(appointment.total_lab_amount) || 0;
        return (Number(appointment.price) || 0) + labAmount;
    })() : 0;
    
    // Calculate senior citizen discount (20% on consultation appointments including lab tests)
    const isConsultation = appointment && (
        appointment.appointment_type === 'consultation' || 
        appointment.appointment_type === 'general_consultation'
    );
    
    // Calculate senior citizen discount - only apply to consultation portion (not lab tests)
    const consultationAmount = isConsultation ? (Number(appointment?.price) || 0) : 0;
    const seniorDiscountAmount = isSeniorCitizen && paymentMethod !== 'hmo' ? (consultationAmount * 0.20) : 0;
    const finalAmount = totalAmount - seniorDiscountAmount;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors([]);
        
        console.log('=== PAYMENT MODAL FORM SUBMISSION STARTED ===');
        console.log('Appointment:', appointment);
        console.log('Payment method:', paymentMethod);
        console.log('Payment reference:', paymentReference);
        console.log('HMO provider:', hmoProvider);
        console.log('HMO reference number:', hmoReferenceNumber);
        console.log('Is senior citizen:', isSeniorCitizen);
        console.log('Notes:', notes);
        console.log('Final amount:', finalAmount);

        if (!appointment) {
            setValidationErrors(['No appointment data available']);
            return;
        }

        console.log('Submitting to: /admin/billing/create-from-appointments');
        
        // Use the same endpoint and data structure as the original page
        const formData = {
            appointment_ids: [appointment.id],
            payment_method: paymentMethod,
            payment_reference: paymentReference,
            hmo_provider: hmoProvider,
            hmo_reference_number: hmoReferenceNumber,
            is_senior_citizen: isSeniorCitizen,
            notes: notes,
        };

        console.log('Form data:', formData);

        fetch('/admin/billing/create-from-appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (response.ok) {
                console.log('Payment submission successful');
                onSuccess();
                onClose();
            } else {
                return response.json().then(data => {
                    console.error('Payment submission failed:', data);
                    if (data.errors) {
                        setValidationErrors(Object.values(data.errors).flat());
                    } else {
                        setValidationErrors([data.message || 'Payment submission failed']);
                    }
                });
            }
        })
        .catch(error => {
            console.error('Payment submission error:', error);
            setValidationErrors(['Failed to process payment. Please try again.']);
        });
    };

    if (!isOpen) return null;

    if (!appointment) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-[900px] h-[90vh] overflow-y-auto">
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
                            Create Payment Transaction
                        </DialogTitle>
                        <p className="text-gray-600 mt-1 text-sm">
                            Process payment for appointment #{appointment.id}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-gray-200">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                {/* Transaction Summary - matching original page */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Receipt className="h-5 w-5" />
                                            Transaction Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Selected Appointments:</span>
                                            <span className="font-semibold">1</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Subtotal:</span>
                                            <span className="text-lg font-semibold">₱{Number(totalAmount || 0).toFixed(2)}</span>
                                        </div>
                                        
                                        {isSeniorCitizen && seniorDiscountAmount > 0 && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-blue-600">Senior Citizen Discount (20%):</span>
                                                <span className="text-lg font-semibold text-blue-600">-₱{Number(seniorDiscountAmount).toFixed(2)}</span>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between border-t pt-2">
                                            <span className="text-sm font-medium">Total Amount:</span>
                                            <span className="text-lg font-bold text-green-600">₱{Number(finalAmount || 0).toFixed(2)}</span>
                                        </div>
                                        
                                        {appointment && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Selected Appointment:</Label>
                                                <div className="p-2 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium">{appointment.patient_name}</div>
                                                            <div className="text-xs text-gray-500">{appointment.appointment_type}</div>
                                                        </div>
                                                        <div className="text-sm font-semibold">₱{Number(appointment.final_total_amount || appointment.price || 0).toFixed(2)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Appointment Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Appointment Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Patient Name</p>
                                                <p className="text-sm font-medium">{appointment?.patient_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Patient ID</p>
                                                <p className="text-sm">{appointment?.patient_id}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Appointment Type</p>
                                                <Badge variant="outline" className="capitalize">
                                                    {appointment?.appointment_type}
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Specialist</p>
                                                <p className="text-sm">{appointment?.specialist_name}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Date</p>
                                                <p className="text-sm">{appointment?.appointment_date ? safeFormatDate(appointment.appointment_date) : 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Time</p>
                                                <p className="text-sm">{appointment?.appointment_time ? safeFormatTime(appointment.appointment_time) : 'N/A'}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Payment Details - matching original page exactly */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CreditCard className="h-5 w-5" />
                                            Payment Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="payment_method">Payment Method</Label>
                                                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select payment method" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="cash">Cash</SelectItem>
                                                            <SelectItem value="hmo">HMO</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="payment_reference">Payment Reference</Label>
                                                    <Input
                                                        id="payment_reference"
                                                        value={paymentReference}
                                                        onChange={(e) => setPaymentReference(e.target.value)}
                                                        placeholder="Reference number (optional)"
                                                    />
                                                </div>
                                            </div>

                                            {paymentMethod === 'hmo' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="hmo_provider">HMO Provider</Label>
                                                        <Select value={hmoProvider} onValueChange={setHmoProvider}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select HMO provider" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {hmoProviders.map((provider) => (
                                                                    <SelectItem key={provider.id} value={provider.name}>
                                                                        {provider.name} ({provider.code})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="hmo_reference_number">HMO Reference Number</Label>
                                                        <Input
                                                            id="hmo_reference_number"
                                                            value={hmoReferenceNumber}
                                                            onChange={(e) => setHmoReferenceNumber(e.target.value)}
                                                            placeholder="Enter HMO reference number"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Senior Citizen Discount - matching original page exactly */}
                                            <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id="is_senior_citizen"
                                                        checked={isSeniorCitizen}
                                                        onChange={(e) => setIsSeniorCitizen(e.target.checked)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <Label htmlFor="is_senior_citizen" className="text-sm font-medium text-gray-700">
                                                        Senior Citizen (20% discount on consultation)
                                                    </Label>
                                                </div>
                                                {isSeniorCitizen && (
                                                    <div className="text-sm text-blue-700 bg-blue-100 p-3 rounded-lg">
                                                        <strong>Senior Citizen Discount Applied:</strong> 20% discount will be applied to consultation appointments only.
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="notes">Notes</Label>
                                                <Textarea
                                                    id="notes"
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    placeholder="Additional notes (optional)"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Create Transaction
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

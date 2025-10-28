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
    CreditCard,
    DollarSign,
    User,
    Calendar,
    Clock,
    FileText,
    X,
    Save,
    AlertCircle,
    CheckCircle,
    Receipt
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
    }>;
};

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

interface PendingAppointmentPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    appointment: PendingAppointment | null;
    doctors: Doctor[];
    patients: Patient[];
    hmoProviders?: HmoProvider[];
}

const paymentTypeOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'health_card', label: 'Health Card' },
    { value: 'discount', label: 'Discount' },
];

const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'hmo', label: 'HMO' },
];

export default function PendingAppointmentPaymentModal({
    isOpen,
    onClose,
    onSuccess,
    appointment,
    doctors,
    patients,
    hmoProviders = []
}: PendingAppointmentPaymentModalProps) {
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [isSeniorCitizen, setIsSeniorCitizen] = useState(false);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [seniorDiscountAmount, setSeniorDiscountAmount] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        patient_id: '',
        doctor_id: '',
        payment_type: 'cash',
        total_amount: 0,
        amount: 0,
        discount_amount: 0,
        discount_percentage: 0,
        is_senior_citizen: false,
        senior_discount_amount: 0,
        senior_discount_percentage: 20,
        hmo_provider: '',
        hmo_reference: '',
        hmo_reference_number: '',
        payment_reference: '',
        description: '',
        notes: '',
        transaction_date: new Date().toISOString().split('T')[0],
        due_date: '',
        status: 'pending',
    });

    // Update form data when appointment changes
    useEffect(() => {
        if (appointment) {
            const totalAmount = appointment.final_total_amount || appointment.price || 0;
            setData({
                patient_id: appointment.patient?.id?.toString() || appointment.patient_id || '',
                doctor_id: appointment.specialist?.id?.toString() || appointment.specialist_id?.toString() || '',
                total_amount: totalAmount,
                amount: totalAmount,
                description: `Payment for appointment #${appointment.id} - ${appointment.appointment_type}`,
                notes: appointment.notes || '',
            });
            setDiscountAmount(0);
            setSeniorDiscountAmount(0);
        }
    }, [appointment]);

    // Calculate senior citizen discount
    useEffect(() => {
        if (isSeniorCitizen && data.total_amount > 0) {
            const seniorDiscount = data.total_amount * 0.20; // 20% discount
            setSeniorDiscountAmount(seniorDiscount);
            setData('senior_discount_amount', seniorDiscount);
            setData('senior_discount_percentage', 20);
        } else {
            setSeniorDiscountAmount(0);
            setData('senior_discount_amount', 0);
            setData('senior_discount_percentage', 0);
        }
    }, [isSeniorCitizen, data.total_amount]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors([]);

        if (!appointment) {
            setValidationErrors(['No appointment data available']);
            return;
        }

        post('/admin/billing/transactions', {
            onSuccess: () => {
                onSuccess();
                onClose();
            },
            onError: (errors: any) => {
                console.error('Payment processing failed:', errors);
                if (errors.errors) {
                    setValidationErrors(Object.values(errors.errors).flat());
                } else {
                    setValidationErrors([errors.message || 'Payment processing failed']);
                }
            },
        });
    };

    const handleDiscountChange = (value: string) => {
        const discount = parseFloat(value) || 0;
        setDiscountAmount(discount);
        setData('discount_amount', discount);
        
        if (data.total_amount > 0) {
            const percentage = (discount / data.total_amount) * 100;
            setData('discount_percentage', percentage);
        }
    };

    const calculateFinalAmount = () => {
        let finalAmount = data.total_amount;
        finalAmount -= discountAmount;
        finalAmount -= seniorDiscountAmount;
        return Math.max(0, finalAmount);
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-[1000px] sm:max-w-none h-[90vh] max-h-none overflow-y-auto p-0" hideCloseButton={true}>
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6 px-6 pt-6 border-b bg-gradient-to-r from-green-50 to-white">
                    <div>
                        <DialogTitle className="text-3xl font-bold text-green-900">
                            Process Payment
                        </DialogTitle>
                        <p className="text-green-600 mt-1 text-sm">
                            Create billing transaction for appointment #{appointment?.id}
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
                            {/* Appointment Summary */}
                            {appointment && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Receipt className="h-5 w-5" />
                                            Appointment Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Patient</label>
                                                <p className="text-lg font-semibold">{appointment.patient_name}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Appointment Type</label>
                                                <p className="text-lg font-semibold">{appointment.appointment_type.replace(/_/g, ' ').toUpperCase()}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Date & Time</label>
                                                <p className="text-lg font-semibold">
                                                    {safeFormatDate(appointment.appointment_date)} at {safeFormatTime(appointment.appointment_time)}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Specialist</label>
                                                <p className="text-lg font-semibold">{appointment.specialist_name}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Payment Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Payment Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="payment_type">Payment Type</Label>
                                            <Select value={data.payment_type} onValueChange={(value) => setData('payment_type', value)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select payment type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {paymentTypeOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="payment_method">Payment Method</Label>
                                            <Select value={data.payment_method || 'cash'} onValueChange={(value) => setData('payment_method', value)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select payment method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {paymentMethodOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="total_amount">Total Amount (₱)</Label>
                                            <Input
                                                id="total_amount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.total_amount}
                                                onChange={(e) => setData('total_amount', parseFloat(e.target.value) || 0)}
                                                className="mt-1"
                                                required
                                                readOnly
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="discount_amount">Discount Amount (₱)</Label>
                                            <Input
                                                id="discount_amount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={discountAmount}
                                                onChange={(e) => handleDiscountChange(e.target.value)}
                                                className="mt-1"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    {/* Senior Citizen Discount */}
                                    <div className="border rounded-lg p-4 bg-blue-50">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Checkbox
                                                id="is_senior_citizen"
                                                checked={isSeniorCitizen}
                                                onCheckedChange={(checked) => {
                                                    setIsSeniorCitizen(checked as boolean);
                                                    setData('is_senior_citizen', checked as boolean);
                                                }}
                                            />
                                            <Label htmlFor="is_senior_citizen" className="text-sm font-medium">
                                                Senior Citizen (20% discount)
                                            </Label>
                                        </div>
                                        {isSeniorCitizen && (
                                            <div className="text-sm text-blue-700">
                                                <p>Senior Citizen Discount: ₱{seniorDiscountAmount.toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* HMO Information */}
                            {data.payment_method === 'hmo' && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5" />
                                            HMO Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="hmo_provider">HMO Provider</Label>
                                            <Select value={data.hmo_provider} onValueChange={(value) => setData('hmo_provider', value)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select HMO provider" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {hmoProviders.map((provider) => (
                                                        <SelectItem key={provider.id} value={provider.id.toString()}>
                                                            {provider.name} ({provider.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="hmo_reference">HMO Reference</Label>
                                            <Input
                                                id="hmo_reference"
                                                value={data.hmo_reference}
                                                onChange={(e) => setData('hmo_reference', e.target.value)}
                                                className="mt-1"
                                                placeholder="HMO reference number"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Final Amount Display */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Final Amount
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-medium text-green-800">Total:</span>
                                            <span className="text-2xl font-bold text-green-900">₱{calculateFinalAmount().toLocaleString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Additional Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Additional Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="transaction_date">Transaction Date</Label>
                                            <Input
                                                id="transaction_date"
                                                type="date"
                                                value={data.transaction_date}
                                                onChange={(e) => setData('transaction_date', e.target.value)}
                                                className="mt-1"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="payment_reference">Payment Reference</Label>
                                            <Input
                                                id="payment_reference"
                                                value={data.payment_reference}
                                                onChange={(e) => setData('payment_reference', e.target.value)}
                                                className="mt-1"
                                                placeholder="Payment reference number"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            className="mt-1"
                                            rows={3}
                                            placeholder="Additional notes for this transaction..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t mt-6">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700 text-white">
                            {processing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Process Payment
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

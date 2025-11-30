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
    Receipt,
    Stethoscope,
    TestTube
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { toast } from 'sonner';

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
        is_senior_citizen?: boolean;
        age?: number;
        company_name?: string;
        hmo_name?: string;
        hmo_company_id_no?: string;
        validation_approval_code?: string;
        hmo_id_no?: string;
        approval_code?: string;
        validity?: string;
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
    const [amountPaid, setAmountPaid] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        patient_id: '',
        doctor_id: '',
        payment_method: 'cash',
        total_amount: 0,
        amount: 0,
        amount_paid: 0,
        discount_amount: 0,
        discount_percentage: 0,
        is_senior_citizen: false,
        senior_discount_amount: 0,
        senior_discount_percentage: 20,
        hmo_provider: '',
        hmo_reference: '',
        hmo_reference_number: '',
        description: '',
        notes: '',
        transaction_date: new Date().toISOString().split('T')[0],
        due_date: '',
        status: 'pending',
        items: [],
    });

    // Update form data when appointment changes
    useEffect(() => {
        if (appointment) {
            // Calculate base consultation price (not including lab tests)
            const baseConsultationPrice = appointment.price || 0;
            
            // Auto-detect senior citizen status from patient
            const patientIsSenior = appointment.patient?.is_senior_citizen ?? false;
            setIsSeniorCitizen(patientIsSenior);
            setData('is_senior_citizen', patientIsSenior);
            
            // NOTE: HMO information will be auto-filled when payment method is changed to "HMO"
            // This ensures it only populates when HMO payment is actually selected
            if (appointment.patient?.approval_code) {
                // Approval code is read-only, shown in the form but not sent in form data
            }
            
            // Create items array for the billing transaction
            const items = [
                {
                    item_type: 'consultation',
                    item_name: `${appointment.appointment_type.replace(/_/g, ' ').toUpperCase()} Appointment`,
                    item_description: `Appointment for ${appointment.patient_name} on ${appointment.appointment_date} at ${appointment.appointment_time}`,
                    quantity: 1,
                    unit_price: baseConsultationPrice,
                    total_price: baseConsultationPrice,
                }
            ];

            // Add lab test items if they exist (from both appointment and visit)
            if (appointment.labTests && appointment.labTests.length > 0) {
                appointment.labTests.forEach((labTest: any) => {
                    const description = labTest.source === 'visit' 
                        ? `Lab test from visit consultation: ${labTest.lab_test_name}${labTest.ordered_by ? ` (Ordered by: ${labTest.ordered_by})` : ''}`
                        : `Laboratory test: ${labTest.lab_test_name}`;
                    
                    items.push({
                        item_type: 'laboratory',
                        item_name: labTest.lab_test_name,
                        item_description: description,
                        quantity: 1,
                        unit_price: labTest.price,
                        total_price: labTest.price,
                        lab_test_id: labTest.id,
                    } as any);
                });
            }
            
            // Calculate total amount including all lab tests (ensure it's a number)
            const totalAmount = Number(items.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0));

            setData('patient_id', appointment.patient?.id?.toString() || appointment.patient_id || '');
            setData('doctor_id', appointment.specialist?.id?.toString() || appointment.specialist_id?.toString() || '');
            setData('total_amount', totalAmount);
            setData('amount', totalAmount);
            setData('amount_paid', totalAmount); // Default amount paid equals total
            setData('description', `Payment for appointment #${appointment.id} - ${appointment.appointment_type}`);
            setData('notes', appointment.notes || '');
            setData('items', items as any);
            setDiscountAmount(0);
            setSeniorDiscountAmount(0);
            setAmountPaid(totalAmount);
        }
    }, [appointment]);

    // Calculate senior citizen discount
    useEffect(() => {
        const totalAmount = Number(data.total_amount) || 0;
        if (isSeniorCitizen && totalAmount > 0 && data.payment_method !== 'hmo') {
            const seniorDiscount = totalAmount * 0.20; // 20% discount
            setSeniorDiscountAmount(seniorDiscount);
            setData('senior_discount_amount', seniorDiscount);
            setData('senior_discount_percentage', 20);
        } else {
            setSeniorDiscountAmount(0);
            setData('senior_discount_amount', 0);
            setData('senior_discount_percentage', 0);
        }
    }, [isSeniorCitizen, data.total_amount, data.payment_method]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors([]);

        if (!appointment) {
            setValidationErrors(['No appointment data available']);
            return;
        }

        // Validate HMO provider and reference when payment method is HMO
        if (data.payment_method === 'hmo') {
            const hmoErrors: string[] = [];
            if (!data.hmo_provider || data.hmo_provider.trim() === '') {
                hmoErrors.push('HMO Provider is required when payment method is HMO');
            }
            if (!data.hmo_reference_number || data.hmo_reference_number.trim() === '') {
                hmoErrors.push('HMO Reference Number is required when payment method is HMO');
            }
            if (hmoErrors.length > 0) {
                setValidationErrors(hmoErrors);
            return;
            }
        }

        // Ensure required fields are set before submission
        const totalAmount = Number(data.total_amount) || 0;
        const discount = Number(discountAmount) || 0;
        const seniorDiscount = Number(seniorDiscountAmount) || 0;
        const finalAmount = Math.max(0, totalAmount - discount - seniorDiscount);
        const paid = Number(amountPaid) || 0;
        
        if (paid <= 0) {
            setValidationErrors(['Amount Paid must be greater than 0']);
            return;
        }
        
        // For pending appointments, use the create-from-appointments endpoint
        // This properly handles existing appointments without creating duplicate manual_transaction appointments
        const formData: any = {
            appointment_ids: [appointment.id], // Send appointment ID(s) as array
            payment_method: data.payment_method,
            amount_paid: paid,
            hmo_provider: data.hmo_provider || null,
            hmo_reference_number: data.hmo_reference_number || null,
            // CRITICAL: Senior citizen discount is NOT available for HMO payments
            is_senior_citizen: data.payment_method === 'hmo' ? false : isSeniorCitizen,
            notes: data.notes || null,
        };
        
        // Remove payment_reference - will be auto-generated by backend after payment
        delete formData.payment_reference;

        router.post('/admin/billing/create-from-appointments', formData, {
            onSuccess: (page) => {
                console.log('Transaction created successfully, updating appointment status...');
                
                // Show success toast
                toast.success('Payment processed successfully! Transaction created.');
                    
                // Call onSuccess to refresh the pending appointments list
                    onSuccess();
                    onClose();
                    
                // Redirect to transactions page to show the new transaction
                router.visit('/admin/billing/transactions', {
                    preserveState: false,
                    preserveScroll: false,
                });
            },
            onError: (errors: any) => {
                console.error('Payment processing failed:', errors);
                
                // Show error toast
                const errorMessage = errors.message || (errors.errors ? Object.values(errors.errors).flat().join(', ') : 'Payment processing failed');
                toast.error(errorMessage);
                
                if (errors.errors) {
                    setValidationErrors(Object.values(errors.errors).flat() as string[]);
                } else {
                    setValidationErrors([errors.message || 'Payment processing failed']);
                }
            },
        });
    };

    const handleDiscountChange = (value: string) => {
        const discount = Number(parseFloat(value) || 0);
        setDiscountAmount(discount);
        setData('discount_amount', discount);
        
        const totalAmount = Number(data.total_amount) || 0;
        if (totalAmount > 0) {
            const percentage = (discount / totalAmount) * 100;
            setData('discount_percentage', percentage);
        }
    };

    const calculateFinalAmount = () => {
        const totalAmount = Number(data.total_amount) || 0;
        const discount = Number(discountAmount) || 0;
        const seniorDiscount = Number(seniorDiscountAmount) || 0;
        const finalAmount = totalAmount - discount - seniorDiscount;
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
                                            <Label htmlFor="payment_method">Payment Method *</Label>
                                            <Select value={data.payment_method || 'cash'} onValueChange={(value) => {
                                                setData('payment_method', value);
                                                
                                                if (value === 'hmo') {
                                                    // Reset senior citizen discount if HMO is selected
                                                    setIsSeniorCitizen(false);
                                                    setData('is_senior_citizen', false);
                                                    setSeniorDiscountAmount(0);
                                                    setData('senior_discount_amount', 0);
                                                    setData('senior_discount_percentage', 0);
                                                    
                                                    // CRITICAL: Auto-generate/populate HMO information from patient record
                                                    // Automatically fetch and populate HMO fields from patient's stored information
                                                    if (appointment?.patient) {
                                                        // Auto-generate HMO Provider from patient's hmo_name
                                                        if (appointment.patient.hmo_name) {
                                                            setData('hmo_provider', appointment.patient.hmo_name);
                                                        } else {
                                                            setData('hmo_provider', '');
                                                        }
                                                        
                                                        // HMO Reference Number should be manually input by admin/cashier
                                                        // Don't auto-populate it, let admin/cashier enter it manually
                                                            setData('hmo_reference_number', '');
                                                    } else {
                                                        // No patient data available
                                                        setData('hmo_provider', '');
                                                        setData('hmo_reference_number', '');
                                                    }
                                                } else {
                                                    // If switching away from HMO, clear HMO fields
                                                    setData('hmo_provider', '');
                                                    setData('hmo_reference_number', '');
                                                }
                                            }}>
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
                                            <Label htmlFor="total_amount">Total Amount Due (₱)</Label>
                                            <Input
                                                id="total_amount"
                                                type="text"
                                                value={`₱${Number(data.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                                className="mt-1 bg-gray-50 font-semibold"
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
                                        <div>
                                            <Label htmlFor="amount_paid">Amount Paid (₱) *</Label>
                                            <Input
                                                id="amount_paid"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={amountPaid}
                                                onChange={(e) => {
                                                    const paid = Number(parseFloat(e.target.value) || 0);
                                                    setAmountPaid(paid);
                                                    setData('amount_paid', paid);
                                                }}
                                                className="mt-1"
                                                placeholder="0.00"
                                                required
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Enter the amount the patient is paying
                                            </p>
                                        </div>
                                    </div>

                                    {/* Senior Citizen Discount */}
                                    <div className={`border rounded-lg p-4 ${data.payment_method === 'hmo' ? 'bg-gray-50' : 'bg-blue-50'}`}>
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Checkbox
                                                id="is_senior_citizen"
                                                checked={isSeniorCitizen}
                                                disabled={data.payment_method === 'hmo'}
                                                onCheckedChange={(checked) => {
                                                    if (data.payment_method !== 'hmo') {
                                                    setIsSeniorCitizen(checked as boolean);
                                                    setData('is_senior_citizen', checked as boolean);
                                                    }
                                                }}
                                            />
                                            <Label htmlFor="is_senior_citizen" className={`text-sm font-medium ${data.payment_method === 'hmo' ? 'text-gray-400' : ''}`}>
                                                Senior Citizen (20% discount)
                                            </Label>
                                        </div>
                                        {data.payment_method === 'hmo' && (
                                            <div className="text-xs text-amber-600 mb-2">
                                                ⚠ Senior citizen discount is not available for HMO payments
                                            </div>
                                        )}
                                        {appointment?.patient?.is_senior_citizen && data.payment_method !== 'hmo' && (
                                            <div className="text-xs text-blue-600 mb-2">
                                                ✓ Auto-detected from patient record
                                            </div>
                                        )}
                                        {isSeniorCitizen && data.payment_method !== 'hmo' && (
                                            <div className="text-sm text-blue-700">
                                                <p>Senior Citizen Discount: ₱{Number(seniorDiscountAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
                                        {/* Auto-generated fields from patient record */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                                <Label htmlFor="company_name">Company Name</Label>
                                                <Input
                                                    id="company_name"
                                                    value={appointment?.patient?.company_name || ''}
                                                    className="mt-1 bg-gray-50"
                                                    readOnly
                                                />
                                                {appointment?.patient?.company_name ? (
                                                    <p className="text-xs text-blue-600 mt-1">
                                                        ✓ Auto-generated from patient record
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        No company name in patient record
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="hmo_provider">HMO Name *</Label>
                                            <Input
                                                id="hmo_provider"
                                                value={data.hmo_provider || appointment?.patient?.hmo_name || ''}
                                                onChange={(e) => setData('hmo_provider', e.target.value)}
                                                className="mt-1 bg-gray-50"
                                                    placeholder="HMO name from patient record"
                                                readOnly={!!appointment?.patient?.hmo_name}
                                                required
                                            />
                                            {appointment?.patient?.hmo_name ? (
                                                <p className="text-xs text-blue-600 mt-1">
                                                    ✓ Auto-generated from patient record
                                                </p>
                                            ) : (
                                                <p className="text-xs text-amber-600 mt-1">
                                                        ⚠ No HMO name found in patient record
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                                <Label htmlFor="hmo_company_id_no">HMO Company ID No</Label>
                                            <Input
                                                    id="hmo_company_id_no"
                                                    value={appointment?.patient?.hmo_company_id_no || ''}
                                                className="mt-1 bg-gray-50"
                                                    readOnly
                                            />
                                                {appointment?.patient?.hmo_company_id_no ? (
                                                <p className="text-xs text-blue-600 mt-1">
                                                    ✓ Auto-generated from patient record
                                                </p>
                                            ) : (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        No HMO Company ID in patient record
                                                </p>
                                            )}
                                        </div>
                                            <div>
                                                <Label htmlFor="validation_approval_code">Validation Approval Code</Label>
                                                <Input
                                                    id="validation_approval_code"
                                                    value={appointment?.patient?.validation_approval_code || ''}
                                                    className="mt-1 bg-gray-50"
                                                    readOnly
                                                />
                                                {appointment?.patient?.validation_approval_code ? (
                                                    <p className="text-xs text-blue-600 mt-1">
                                                        ✓ Auto-generated from patient record
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        No validation code in patient record
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="validity">Validity</Label>
                                                <Input
                                                    id="validity"
                                                    value={appointment?.patient?.validity || ''}
                                                    className="mt-1 bg-gray-50"
                                                    readOnly
                                                />
                                                {appointment?.patient?.validity ? (
                                                    <p className="text-xs text-blue-600 mt-1">
                                                        ✓ Auto-generated from patient record
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        No validity date in patient record
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Manual input field for HMO Reference Number */}
                                        <div className="border-t pt-4">
                                            <div>
                                                <Label htmlFor="hmo_reference_number">HMO Reference Number *</Label>
                                                <Input
                                                    id="hmo_reference_number"
                                                    value={data.hmo_reference_number || ''}
                                                    onChange={(e) => setData('hmo_reference_number', e.target.value)}
                                                    className="mt-1 bg-white"
                                                    placeholder="Enter HMO reference number from provider"
                                                    required
                                                />
                                                <p className="text-xs text-amber-600 mt-1">
                                                    ⚠ Must be manually entered by admin/cashier (comes from HMO provider)
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Visit Information */}
                            {appointment?.visit && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Stethoscope className="h-5 w-5" />
                                            Visit Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
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
                                    </CardContent>
                                </Card>
                            )}

                            {/* Billing Breakdown */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Receipt className="h-5 w-5" />
                                        Billing Breakdown
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {/* Consultation */}
                                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                            <div>
                                                <span className="font-medium text-sm">Consultation Fee</span>
                                                <p className="text-xs text-gray-600">{appointment?.appointment_type.replace(/_/g, ' ').toUpperCase()}</p>
                                            </div>
                                            <span className="text-sm font-semibold">₱{appointment?.price.toLocaleString() || '0'}</span>
                                        </div>

                                        {/* Lab Tests from Appointment */}
                                        {appointment?.labTests && appointment.labTests.filter((test: any) => test.source === 'appointment').length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-semibold text-gray-600 mb-2">Lab Tests from Appointment</h4>
                                                {appointment.labTests.filter((test: any) => test.source === 'appointment').map((test: any, index: number) => (
                                                    <div key={`appointment-test-${test.id || index}`} className="flex justify-between items-center p-2 bg-gray-50 rounded mb-2">
                                                        <span className="text-sm">{test.lab_test_name}</span>
                                                        <span className="text-sm font-semibold">₱{test.price.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Lab Tests from Visit */}
                                        {appointment?.labTests && appointment.labTests.filter((test: any) => test.source === 'visit').length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-semibold text-gray-600 mb-2">Lab Tests from Visit (Ordered by Doctor/Staff)</h4>
                                                {appointment.labTests.filter((test: any) => test.source === 'visit').map((test: any, index: number) => (
                                                    <div key={`visit-test-${test.lab_order_id || test.id || index}`} className="flex justify-between items-start p-2 bg-blue-50 rounded mb-2 border border-blue-200">
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
                                        )}

                                        {/* Totals */}
                                        <div className="border-t pt-3 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-700">Consultation Fee:</span>
                                                <span className="text-sm font-semibold">₱{Number(appointment?.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            {appointment?.total_lab_amount > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-gray-700">Lab Tests:</span>
                                                    <span className="text-sm font-semibold">₱{Number(appointment.total_lab_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center pt-2 border-t">
                                                <span className="text-base font-bold text-gray-900">Subtotal:</span>
                                                <span className="text-base font-bold text-gray-900">₱{Number(data.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            {discountAmount > 0 && (
                                                <div className="flex justify-between items-center text-red-600">
                                                    <span className="text-sm font-medium">Discount:</span>
                                                    <span className="text-sm font-semibold">-₱{Number(discountAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                            )}
                                            {seniorDiscountAmount > 0 && (
                                                <div className="flex justify-between items-center text-blue-600">
                                                    <span className="text-sm font-medium">Senior Citizen Discount (20%):</span>
                                                    <span className="text-sm font-semibold">-₱{Number(seniorDiscountAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Final Amount Display */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Final Amount
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-green-100 border border-green-200 rounded-lg p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-medium text-green-800">Total Amount Due:</span>
                                            <span className="text-2xl font-bold text-green-900">₱{Number(calculateFinalAmount()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-green-300">
                                            <span className="text-base font-medium text-green-800">Amount Paid:</span>
                                            <span className="text-xl font-bold text-green-900">₱{Number(amountPaid || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        {amountPaid > 0 && calculateFinalAmount() > 0 && (
                                            <div className="flex items-center justify-between pt-2 border-t border-green-300">
                                                <span className={`text-base font-medium ${amountPaid >= calculateFinalAmount() ? 'text-green-800' : 'text-orange-800'}`}>
                                                    {amountPaid >= calculateFinalAmount() ? 'Change:' : 'Balance:'}
                                                </span>
                                                <span className={`text-xl font-bold ${amountPaid >= calculateFinalAmount() ? 'text-green-900' : 'text-orange-900'}`}>
                                                    ₱{Math.abs(Number(amountPaid) - Number(calculateFinalAmount())).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        )}
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
                                        <div>
                                        <Label htmlFor="transaction_date">Transaction Date *</Label>
                                            <Input
                                                id="transaction_date"
                                                type="date"
                                                value={data.transaction_date}
                                                onChange={(e) => setData('transaction_date', e.target.value)}
                                                className="mt-1"
                                                required
                                            />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Payment reference will be auto-generated after payment is processed
                                        </p>
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

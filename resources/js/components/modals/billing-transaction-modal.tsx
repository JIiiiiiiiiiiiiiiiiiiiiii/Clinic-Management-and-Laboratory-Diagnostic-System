import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ReportDatePicker } from '@/components/ui/report-date-picker';
import { useForm, router } from '@inertiajs/react';
import { 
    Plus, 
    Minus, 
    CreditCard,
    Calculator,
    Receipt,
    Save,
    X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

type Patient = {
    id: number;
    first_name: string;
    last_name: string;
    patient_no: string;
};

type Doctor = {
    specialist_id: number;
    name: string;
};

type LabTest = {
    id: number;
    name: string;
    code: string;
    price: number;
};

type HmoProvider = {
    id: number;
    name: string;
    code: string;
    is_active: boolean;
};

type BillingItem = {
    id: string;
    item_type: string;
    item_name: string;
    item_description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    lab_test_id?: number;
};

type BillingTransactionModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    patients: Patient[];
    doctors: Doctor[];
    labTests: LabTest[];
    hmoProviders?: HmoProvider[];
};

export default function BillingTransactionModal({
    isOpen,
    onClose,
    onSuccess,
    patients,
    doctors,
    labTests,
    hmoProviders = []
}: BillingTransactionModalProps) {
    // Debug logging
    console.log('BillingTransactionModal props:', {
        patients_count: patients.length,
        patients: patients.slice(0, 3), // Show first 3 patients for debugging
        doctors_count: doctors.length,
        labTests_count: labTests.length
    });
    const [items, setItems] = useState<BillingItem[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [transactionDate, setTransactionDate] = useState<Date | undefined>(new Date());
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // Transaction types with pricing (same as online appointment system)
    const transactionTypes = {
        'general_consultation': { name: 'Consultation', price: 350, type: 'consultation' },
        'consultation': { name: 'Consultation', price: 350, type: 'consultation' },
        'cbc': { name: 'Complete Blood Count (CBC)', price: 245, type: 'laboratory' },
        'fecalysis_test': { name: 'Fecalysis Test', price: 90, type: 'laboratory' },
        'fecalysis': { name: 'Fecalysis Test', price: 90, type: 'laboratory' },
        'urinarysis_test': { name: 'Urinalysis Test', price: 140, type: 'laboratory' },
        'urinalysis': { name: 'Urinalysis Test', price: 140, type: 'laboratory' },
    };

    const { data, setData, post, processing, errors, reset } = useForm({
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
        items: [] as BillingItem[],
    });
    
    const [amountPaid, setAmountPaid] = useState(0);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            reset();
            setItems([]);
            setSelectedPatient(null);
            setSelectedDoctor(null);
            setTransactionDate(new Date());
            setDueDate(undefined);
            setValidationErrors([]);
            setAmountPaid(0);
        }
    }, [isOpen, reset]);
    
    // Update amountPaid when total changes
    useEffect(() => {
        if (items.length > 0) {
            const total = items.reduce((sum, item) => sum + item.total_price, 0);
            const discount = data.discount_percentage > 0 ? (total * data.discount_percentage) / 100 : 0;
            const consultationItems = items.filter(item => item.item_type === 'consultation');
            const consultationTotal = consultationItems.reduce((sum, item) => sum + item.total_price, 0);
            const seniorDiscount = data.is_senior_citizen ? (consultationTotal * data.senior_discount_percentage) / 100 : 0;
            const final = total - discount - seniorDiscount;
            if (amountPaid === 0 && final > 0) {
                setAmountPaid(final);
            }
        }
    }, [items, data.discount_percentage, data.is_senior_citizen, data.senior_discount_percentage]);

    const addItem = () => {
        const newItem: BillingItem = {
            id: Date.now().toString(),
            item_type: 'consultation',
            item_name: '',
            item_description: '',
            quantity: 1,
            unit_price: 0,
            total_price: 0,
        };
        setItems([...items, newItem]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: string, field: keyof BillingItem, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                if (field === 'quantity' || field === 'unit_price') {
                    updatedItem.total_price = updatedItem.quantity * updatedItem.unit_price;
                }
                return updatedItem;
            }
            return item;
        }));
    };

    // Add transaction type item
    const addTransactionTypeItem = (type: string) => {
        const transaction = transactionTypes[type as keyof typeof transactionTypes];
        if (transaction) {
            const newItem: BillingItem = {
                id: Date.now().toString(),
                item_type: transaction.type,
                item_name: transaction.name,
                item_description: '',
                quantity: 1,
                unit_price: transaction.price,
                total_price: transaction.price,
            };
            setItems([...items, newItem]);
        }
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.total_price, 0);
    };

    const calculateDiscount = () => {
        if (data.discount_percentage > 0) {
            return (calculateTotal() * data.discount_percentage) / 100;
        }
        return 0;
    };

    const calculateSeniorDiscount = () => {
        if (data.is_senior_citizen) {
            const consultationItems = items.filter(item => item.item_type === 'consultation');
            const consultationTotal = consultationItems.reduce((sum, item) => sum + item.total_price, 0);
            return (consultationTotal * data.senior_discount_percentage) / 100;
        }
        return 0;
    };

    const calculateFinalTotal = () => {
        const total = calculateTotal();
        const regularDiscount = calculateDiscount();
        const seniorDiscount = calculateSeniorDiscount();
        return total - regularDiscount - seniorDiscount;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear previous validation errors
        setValidationErrors([]);
        const errors: string[] = [];
        
        // Debug logging
        console.log('Form submission data:', {
            patient_id: data.patient_id,
            patients_count: patients.length,
            items_count: items.length,
            selected_patient: selectedPatient
        });
        
        // If patient_id is empty but we have a selected patient, use it
        if (!data.patient_id && selectedPatient) {
            setData('patient_id', selectedPatient.id.toString());
            console.log('Using selected patient ID:', selectedPatient.id.toString());
        }
        
        // Validate required fields
        if (!data.patient_id || data.patient_id === '') {
            errors.push('Patient is required');
        }
        
        if (items.length === 0) {
            errors.push('At least one item is required');
        }
        
        // Validate items
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.item_name || item.item_name.trim() === '') {
                errors.push(`Item ${i + 1}: Item name is required`);
            }
            if (item.unit_price < 0) {
                errors.push(`Item ${i + 1}: Unit price cannot be negative`);
            }
            if (!item.quantity || item.quantity <= 0) {
                errors.push(`Item ${i + 1}: Quantity must be greater than 0`);
            }
        }
        
        // If there are validation errors, show them and stop submission
        if (errors.length > 0) {
            setValidationErrors(errors);
            console.error('Validation errors:', errors);
            return;
        }
        
        // Calculate final amounts
        const totalAmount = calculateTotal();
        const discountAmount = calculateDiscount();
        const seniorDiscountAmount = calculateSeniorDiscount();
        const finalAmount = totalAmount - discountAmount - seniorDiscountAmount;
        
        // Validate amount paid
        if (amountPaid <= 0) {
            errors.push('Amount Paid must be greater than 0');
        }
        
        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }
        
        // Prepare the form data for submission
        const formData: any = {
            patient_id: data.patient_id,
            doctor_id: data.doctor_id || null,
            payment_method: data.payment_method,
            total_amount: totalAmount,
            amount: finalAmount,
            amount_paid: amountPaid,
            discount_amount: discountAmount,
            discount_percentage: data.discount_percentage,
            is_senior_citizen: data.is_senior_citizen,
            senior_discount_amount: seniorDiscountAmount,
            senior_discount_percentage: data.senior_discount_percentage,
            hmo_provider: data.hmo_provider,
            hmo_reference: data.hmo_reference,
            hmo_reference_number: data.hmo_reference_number,
            description: data.description,
            notes: data.notes,
            transaction_date: transactionDate ? transactionDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            due_date: dueDate ? dueDate.toISOString().split('T')[0] : null,
            items: items.map(item => ({
                item_type: item.item_type,
                item_name: item.item_name,
                item_description: item.item_description || '',
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.total_price,
                lab_test_id: item.lab_test_id || null,
            })),
        };
        
        // Remove payment_reference - will be auto-generated by backend
        delete formData.payment_reference;
        
        console.log('Submitting form data:', formData);
        console.log('Items being sent:', items);
        console.log('Items length:', items.length);
        console.log('Form data items field:', formData.items);
        console.log('Form data items length:', formData.items.length);
        
        // Use router.post directly with the prepared data
        router.post('/admin/billing', formData, {
            onSuccess: (page) => {
                console.log('Transaction created successfully', page);
                // Show success toast
                toast.success("Billing transaction created successfully!");
                // Call success callback and close modal
                onSuccess();
                onClose();
            },
            onError: (errors: any) => {
                console.error('Transaction creation failed:', errors);
                // Show error toast
                toast.error("Failed to create billing transaction. Please check the errors below.");
                // Handle validation errors from backend
                if (errors && typeof errors === 'object') {
                    // Check if it's a single error message
                    if (errors.error) {
                        setValidationErrors([errors.error]);
                    } else {
                        // Handle traditional Laravel validation errors
                        const backendErrors = Object.values(errors).flat() as string[];
                        setValidationErrors(backendErrors);
                    }
                } else if (typeof errors === 'string') {
                    setValidationErrors([errors]);
                }
            },
            onFinish: () => {
                console.log('Form submission finished');
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-[1600px] sm:max-w-none h-[95vh] max-h-none overflow-y-auto p-0" hideCloseButton={true}>
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6 px-6 pt-6 border-b bg-gradient-to-r from-gray-50 to-white">
                    <div>
                        <DialogTitle className="text-3xl font-bold text-gray-900">
                            Create Billing Transaction
                        </DialogTitle>
                        <p className="text-gray-600 mt-1 text-sm">
                            Create a new billing transaction for patient services
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-gray-200">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <form id="billing-transaction-form" onSubmit={handleSubmit} className="space-y-4">
                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-4 w-4 text-red-600">⚠️</div>
                                <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                            </div>
                            <ul className="text-sm text-red-700 space-y-1">
                                {validationErrors.map((error, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="text-red-500">•</span>
                                        <span>{error}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Transaction Details */}
                        <div className="space-y-4">
                            {/* Basic Information Card */}
                            <Card className="border border-gray-200 bg-white shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                                        <Receipt className="h-4 w-4 text-blue-600" />
                                        Transaction Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    {/* Patient, Doctor, and Payment Type Selection */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {/* Patient Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="patient_id" className="text-sm font-medium text-gray-700">
                                                Patient *
                                            </Label>
                                            <Select
                                                value={data.patient_id}
                                                onValueChange={(value) => {
                                                    console.log('Patient selected:', value, 'from patients:', patients);
                                                    setData('patient_id', value);
                                                    const patient = patients.find(p => p.id.toString() === value);
                                                    setSelectedPatient(patient || null);
                                                    console.log('Patient ID set to:', value, 'Patient found:', patient);
                                                }}
                                            >
                                                <SelectTrigger className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                                    <SelectValue placeholder="Select patient" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {patients.map((patient) => (
                                                        <SelectItem key={patient.id} value={patient.id.toString()}>
                                                            {patient.last_name}, {patient.first_name} ({patient.patient_no})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.patient_id && <p className="text-xs text-red-600">{errors.patient_id}</p>}
                                        </div>

                                        {/* Doctor Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="doctor_id" className="text-sm font-medium text-gray-700">
                                                Doctor
                                            </Label>
                                            <Select
                                                value={data.doctor_id}
                                                onValueChange={(value) => {
                                                    setData('doctor_id', value);
                                                    const doctor = doctors.find(d => d.specialist_id.toString() === value);
                                                    setSelectedDoctor(doctor || null);
                                                }}
                                            >
                                                <SelectTrigger className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                                    <SelectValue placeholder="Select doctor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {doctors.map((doctor) => (
                                                        <SelectItem key={doctor.specialist_id} value={doctor.specialist_id.toString()}>
                                                            {doctor.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.doctor_id && <p className="text-xs text-red-600">{errors.doctor_id}</p>}
                                        </div>

                                        {/* Payment Method Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="payment_method" className="text-sm font-medium text-gray-700">
                                                Payment Method *
                                            </Label>
                                            <Select
                                                value={data.payment_method}
                                                onValueChange={(value) => setData('payment_method', value)}
                                            >
                                                <SelectTrigger className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cash">Cash</SelectItem>
                                                    <SelectItem value="hmo">HMO</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.payment_method && <p className="text-xs text-red-600">{errors.payment_method}</p>}
                                        </div>
                                    </div>

                                    {/* HMO Information */}
                                    {data.payment_method === 'hmo' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="hmo_provider" className="text-sm font-medium text-gray-700">
                                                    HMO Provider
                                                </Label>
                                                <Select
                                                    value={data.hmo_provider}
                                                    onValueChange={(value) => setData('hmo_provider', value)}
                                                >
                                                    <SelectTrigger className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
                                                {errors.hmo_provider && <p className="text-xs text-red-600">{errors.hmo_provider}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="hmo_reference_number" className="text-sm font-medium text-gray-700">
                                                    HMO Reference Number
                                                </Label>
                                                <Input
                                                    id="hmo_reference_number"
                                                    value={data.hmo_reference_number}
                                                    onChange={(e) => setData('hmo_reference_number', e.target.value)}
                                                    placeholder="Enter HMO reference number"
                                                    className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                />
                                                {errors.hmo_reference_number && <p className="text-xs text-red-600">{errors.hmo_reference_number}</p>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Date Information */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="transaction_date" className="text-sm font-medium text-gray-700">
                                                Transaction Date *
                                            </Label>
                                            <ReportDatePicker
                                                date={transactionDate}
                                                onDateChange={setTransactionDate}
                                                filter="daily"
                                                placeholder="Select transaction date"
                                            />
                                            {errors.transaction_date && <p className="text-xs text-red-600">{errors.transaction_date}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="due_date" className="text-sm font-medium text-gray-700">
                                                Due Date
                                            </Label>
                                            <ReportDatePicker
                                                date={dueDate}
                                                onDateChange={setDueDate}
                                                filter="daily"
                                                placeholder="Select due date (optional)"
                                            />
                                            {errors.due_date && <p className="text-xs text-red-600">{errors.due_date}</p>}
                                        </div>
                                    </div>
                                    
                                    {/* Amount Paid */}
                                    <div className="space-y-2">
                                        <Label htmlFor="amount_paid" className="text-sm font-medium text-gray-700">
                                            Amount Paid (₱) *
                                        </Label>
                                        <Input
                                            id="amount_paid"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={amountPaid}
                                            onChange={(e) => {
                                                const paid = Number(parseFloat(e.target.value) || 0);
                                                setAmountPaid(paid);
                                            }}
                                            placeholder="0.00"
                                            className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        <p className="text-xs text-gray-500">
                                            Enter the amount the patient is paying. Payment reference will be auto-generated after payment is processed.
                                        </p>
                                    </div>

                                    {/* Senior Citizen Discount */}
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="is_senior_citizen"
                                                checked={data.is_senior_citizen}
                                                onChange={(e) => setData('is_senior_citizen', e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <Label htmlFor="is_senior_citizen" className="text-sm font-medium text-gray-700">
                                                Senior Citizen (20% discount on consultation)
                                            </Label>
                                        </div>
                                        {data.is_senior_citizen && (
                                            <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded mt-2">
                                                <strong>Senior Citizen Discount Applied:</strong> 20% discount will be applied to consultation items only.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Additional Information Card */}
                            <Card className="border border-gray-200 bg-white shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                                        <Receipt className="h-4 w-4 text-blue-600" />
                                        Additional Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Enter transaction description"
                                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            rows={3}
                                        />
                                        {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                                            Notes
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Enter additional notes"
                                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            rows={3}
                                        />
                                        {errors.notes && <p className="text-xs text-red-600">{errors.notes}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Quick Add Services & Transaction Items */}
                        <div className="space-y-4">
                            {/* Quick Add Services */}
                            <Card className="border border-gray-200 bg-white shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                                        <Calculator className="h-4 w-4 text-blue-600" />
                                        Quick Add Services
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {Object.entries(transactionTypes).map(([key, transaction]) => (
                                            <Button
                                                key={key}
                                                type="button"
                                                variant="outline"
                                                className="h-12 flex flex-col items-center justify-center p-2 hover:bg-blue-50 hover:border-blue-300"
                                                onClick={() => addTransactionTypeItem(key)}
                                            >
                                                <div className="text-xs font-medium text-gray-900 text-center mb-1">
                                                    {transaction.name}
                                                </div>
                                                <div className="text-sm font-bold text-blue-600">
                                                    ₱{transaction.price}
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="mt-3 text-xs text-gray-600">
                                        <p>Click on any service above to automatically add it to your transaction.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Transaction Items */}
                            <Card className="border border-gray-200 bg-white shadow-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                                            <Calculator className="h-4 w-4 text-blue-600" />
                                            Transaction Items
                                        </CardTitle>
                                        <Button type="button" onClick={addItem} className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white">
                                            <Plus className="mr-1 h-3 w-3" />
                                            Add Item
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    {items.length === 0 ? (
                                        <div className="text-center py-6">
                                            <Calculator className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                                            <h3 className="mb-1 text-sm font-semibold text-gray-600">No items added</h3>
                                            <p className="text-xs text-gray-500 mb-3">Add items to this transaction</p>
                                            <Button type="button" onClick={addItem} className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white">
                                                <Plus className="mr-1 h-3 w-3" />
                                                Add First Item
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {items.map((item, index) => (
                                                <div key={item.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-sm font-medium text-gray-900">Item {index + 1}</h4>
                                                        <Button
                                                            type="button"
                                                            onClick={() => removeItem(item.id)}
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            <div className="space-y-1">
                                                                <Label className="text-xs font-medium text-gray-700">Item Type</Label>
                                                                <Select
                                                                    value={item.item_type}
                                                                    onValueChange={(value) => updateItem(item.id, 'item_type', value)}
                                                                >
                                                                    <SelectTrigger className="h-8 text-xs">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="consultation">Consultation</SelectItem>
                                                                        <SelectItem value="laboratory">Laboratory</SelectItem>
                                                                        <SelectItem value="medicine">Medicine</SelectItem>
                                                                        <SelectItem value="procedure">Procedure</SelectItem>
                                                                        <SelectItem value="other">Other</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <Label className="text-xs font-medium text-gray-700">Item Name *</Label>
                                                                <Input
                                                                    value={item.item_name}
                                                                    onChange={(e) => updateItem(item.id, 'item_name', e.target.value)}
                                                                    placeholder="Enter item name"
                                                                    className="h-8 text-xs"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            <div className="space-y-1">
                                                                <Label className="text-xs font-medium text-gray-700">Quantity *</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.quantity}
                                                                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                                                    className="h-8 text-xs"
                                                                />
                                                            </div>

                                                            <div className="space-y-1">
                                                                <Label className="text-xs font-medium text-gray-700">Unit Price *</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={item.unit_price}
                                                                    onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                                                                    className="h-8 text-xs"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <Label className="text-xs font-medium text-gray-700">Description</Label>
                                                            <Textarea
                                                                value={item.item_description}
                                                                onChange={(e) => updateItem(item.id, 'item_description', e.target.value)}
                                                                placeholder="Enter item description"
                                                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-xs"
                                                                rows={2}
                                                            />
                                                        </div>

                                                        <div className="flex justify-end">
                                                            <div className="text-right">
                                                                <div className="text-xs text-gray-600">Total: <span className="font-semibold text-gray-900">₱{item.total_price.toFixed(2)}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Transaction Summary */}
                            {items.length > 0 && (
                                <Card className="border border-gray-200 bg-white shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                                            <Calculator className="h-4 w-4 text-blue-600" />
                                            Transaction Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Subtotal:</span>
                                                <span className="font-semibold">₱{calculateTotal().toFixed(2)}</span>
                                            </div>
                                            
                                            {data.discount_percentage > 0 && (
                                                <div className="flex justify-between items-center text-red-600">
                                                    <span className="text-sm">Discount ({data.discount_percentage}%):</span>
                                                    <span>-₱{calculateDiscount().toFixed(2)}</span>
                                                </div>
                                            )}
                                            
                                            {data.is_senior_citizen && (
                                                <div className="flex justify-between items-center text-blue-600">
                                                    <span className="text-sm">Senior Citizen Discount (20%):</span>
                                                    <span>-₱{calculateSeniorDiscount().toFixed(2)}</span>
                                                </div>
                                            )}
                                            
                                            <div className="border-t pt-2 space-y-2">
                                                <div className="flex justify-between items-center text-base font-bold">
                                                    <span>Total Amount Due:</span>
                                                    <span className="text-green-600">₱{calculateFinalTotal().toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm font-medium">
                                                    <span>Amount Paid:</span>
                                                    <span className="text-gray-900">₱{Number(amountPaid || 0).toFixed(2)}</span>
                                                </div>
                                                {amountPaid > 0 && calculateFinalTotal() > 0 && (
                                                    <div className="flex justify-between items-center text-sm font-medium border-t pt-2">
                                                        <span className={amountPaid >= calculateFinalTotal() ? 'text-green-800' : 'text-orange-800'}>
                                                            {amountPaid >= calculateFinalTotal() ? 'Change:' : 'Balance:'}
                                                        </span>
                                                        <span className={amountPaid >= calculateFinalTotal() ? 'text-green-900 font-bold' : 'text-orange-900 font-bold'}>
                                                            ₱{Math.abs(Number(amountPaid) - Number(calculateFinalTotal())).toFixed(2)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                        </form>
                    </div>

                    {/* Action Buttons Section */}
                    <div className="border-t border-gray-200 bg-gray-50 px-6 py-6 mt-6">
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={processing}
                                className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                form="billing-transaction-form"
                                disabled={processing || items.length === 0}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Creating...' : 'Create Transaction'}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
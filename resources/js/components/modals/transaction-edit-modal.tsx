import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ReportDatePicker } from '@/components/ui/report-date-picker';
import { useForm, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { 
    Plus, 
    Minus,
    CreditCard,
    Calculator,
    Receipt,
    Save,
    X,
    Edit
} from 'lucide-react';
import { useState, useEffect } from 'react';

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

type BillingTransaction = {
    id: number;
    transaction_id: string;
    patient_id: number;
    doctor_id: number | null;
    payment_type: string;
    payment_method: string;
    total_amount: number;
    discount_amount: number;
    discount_percentage: number | null;
    hmo_provider: string | null;
    hmo_reference: string | null;
    payment_reference: string | null;
    status: string;
    description: string | null;
    notes: string | null;
    transaction_date: string;
    due_date: string | null;
    items: BillingItem[];
};

interface TransactionEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    transactionId: number | null;
    patients: Patient[];
    doctors: Doctor[];
    labTests: LabTest[];
    hmoProviders?: HmoProvider[];
}

export default function TransactionEditModal({
    isOpen,
    onClose,
    onSuccess,
    transactionId,
    patients,
    doctors,
    labTests,
    hmoProviders = []
}: TransactionEditModalProps) {
    const [transaction, setTransaction] = useState<BillingTransaction | null>(null);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<BillingItem[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [transactionDate, setTransactionDate] = useState<Date>(new Date());
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const { data, setData, put, processing, errors } = useForm({
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
        items: [] as BillingItem[],
        status: 'pending', // Add status field to initial form data
    });

    // Fetch transaction data when modal opens
    useEffect(() => {
        if (isOpen && transactionId && transactionId > 0) {
            fetchTransaction();
        }
    }, [isOpen, transactionId]);

    const fetchTransaction = async () => {
        if (!transactionId || transactionId <= 0) {
            console.error('Invalid transaction ID:', transactionId);
            return;
        }
        
        setLoading(true);
        try {
            const response = await fetch(`/admin/billing/${transactionId}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                const transactionData = result.transaction;
                console.log('Transaction data received:', transactionData);
                setTransaction(transactionData);
                
                // Set form data with safe conversions
                setData({
                    patient_id: transactionData.patient_id ? transactionData.patient_id.toString() : '',
                    doctor_id: transactionData.doctor_id ? transactionData.doctor_id.toString() : '',
                    payment_type: transactionData.payment_type || 'cash',
                    total_amount: transactionData.total_amount || 0,
                    amount: transactionData.total_amount || 0,
                    discount_amount: transactionData.discount_amount || 0,
                    discount_percentage: transactionData.discount_percentage || 0,
                    is_senior_citizen: transactionData.is_senior_citizen || false,
                    senior_discount_amount: transactionData.senior_discount_amount || 0,
                    senior_discount_percentage: transactionData.senior_discount_percentage || 20,
                    hmo_provider: transactionData.hmo_provider || '',
                    hmo_reference: transactionData.hmo_reference || '',
                    hmo_reference_number: transactionData.hmo_reference_number || '',
                    payment_reference: transactionData.payment_reference || '',
                    description: transactionData.description || '',
                    notes: transactionData.notes || '',
                    transaction_date: transactionData.transaction_date ? transactionData.transaction_date.split('T')[0] : new Date().toISOString().split('T')[0],
                    due_date: transactionData.due_date || '',
                    items: transactionData.items || [],
                    status: transactionData.status || 'pending', // Set status field
                });

                // Set items state
                setItems(transactionData.items || []);

                // Set selected patient and doctor
                const patient = patients.find(p => p.id === transactionData.patient_id);
                const doctor = doctors.find(d => d.specialist_id === transactionData.doctor_id);
                setSelectedPatient(patient || null);
                setSelectedDoctor(doctor || null);
            } else {
                toast.error('Failed to load transaction details');
            }
        } catch (error) {
            console.error('Error fetching transaction:', error);
            toast.error('Failed to load transaction details');
        } finally {
            setLoading(false);
        }
    };

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

    const removeItem = (itemId: string) => {
        setItems(items.filter(item => item.id !== itemId));
    };

    const updateItem = (itemId: string, field: keyof BillingItem, value: any) => {
        const updatedItems = items.map(item => {
            if (item.id === itemId) {
                const updatedItem = { ...item, [field]: value };
                if (field === 'quantity' || field === 'unit_price') {
                    updatedItem.total_price = updatedItem.quantity * updatedItem.unit_price;
                }
                return updatedItem;
            }
            return item;
        });
        setItems(updatedItems);
    };

    const addLabTest = (labTest: LabTest) => {
        const newItem: BillingItem = {
            id: Date.now().toString(),
            item_type: 'laboratory',
            item_name: labTest.name,
            item_description: `Lab Test: ${labTest.code}`,
            quantity: 1,
            unit_price: labTest.price,
            total_price: labTest.price,
            lab_test_id: labTest.id,
        };
        setItems([...items, newItem]);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.total_price, 0);
    };

    const calculateDiscount = () => {
        if (data.discount_percentage > 0) {
            return (calculateTotal() * data.discount_percentage) / 100;
        }
        return data.discount_amount;
    };

    const calculateSeniorDiscount = () => {
        if (data.is_senior_citizen) {
            const consultationItems = items.filter(item => item.item_type === 'consultation');
            const consultationTotal = consultationItems.reduce((sum, item) => sum + item.total_price, 0);
            return (consultationTotal * data.senior_discount_percentage) / 100;
        }
        return 0;
    };

    const calculateNetAmount = () => {
        const total = calculateTotal();
        const regularDiscount = calculateDiscount();
        const seniorDiscount = calculateSeniorDiscount();
        return total - regularDiscount - seniorDiscount;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!transactionId || transactionId <= 0) {
            console.error('Invalid transaction ID for submission:', transactionId);
            toast.error('Invalid transaction ID');
            return;
        }
        
        // Clear previous validation errors
        setValidationErrors([]);
        
        console.log('Transaction object:', transaction);
        console.log('Transaction status:', transaction?.status);
        
        const formData = {
            ...data,
            total_amount: calculateNetAmount(), // Use net amount for total_amount
            discount_amount: calculateDiscount(),
            items: items,
            // Handle date conversion like in create modal
            transaction_date: transactionDate ? transactionDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            due_date: dueDate ? dueDate.toISOString().split('T')[0] : null,
            // Ensure doctor_id is null if empty string
            doctor_id: data.doctor_id === '' ? null : data.doctor_id,
        };
        
        console.log('Form data before submission:', formData);
        console.log('Status field value:', formData.status);
        
        router.put(`/admin/billing/${transactionId}`, formData, {
            onSuccess: () => {
                console.log('Transaction updated successfully');
                toast.success("Transaction updated successfully!");
                onSuccess();
                onClose();
            },
            onError: (errors: any) => {
                console.error('Transaction update failed:', errors);
                toast.error("Failed to update transaction. Please check the errors below.");
                
                // Handle validation errors from backend
                if (errors && typeof errors === 'object') {
                    if (errors.error) {
                        setValidationErrors([errors.error]);
                    } else {
                        const backendErrors = Object.values(errors).flat() as string[];
                        setValidationErrors(backendErrors);
                    }
                } else if (typeof errors === 'string') {
                    setValidationErrors([errors]);
                }
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-[1600px] sm:max-w-none h-[95vh] max-h-none overflow-y-auto p-0" hideCloseButton={true}>
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6 px-6 pt-6 border-b bg-gradient-to-r from-gray-50 to-white">
                    <div>
                        <DialogTitle className="text-3xl font-bold text-gray-900">
                            Edit Transaction {transaction?.transaction_id || 'Loading...'}
                        </DialogTitle>
                        <p className="text-gray-600 mt-1 text-sm">
                            {transaction ? `Update transaction details and information` : 'Loading transaction details...'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-gray-200">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 text-lg">Loading transaction details...</p>
                        </div>
                    </div>
                ) : transaction ? (
                    <div className="p-6">
                        {/* Validation Errors */}
                        {validationErrors.length > 0 && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <X className="h-5 w-5 text-red-600" />
                                    <h3 className="text-red-800 font-semibold">Please fix the following errors:</h3>
                                </div>
                                <ul className="list-disc list-inside text-red-700 space-y-1">
                                    {validationErrors.map((error, index) => (
                                        <li key={index}>• {error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Form */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Patient & Doctor Selection */}
                                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                            <Receipt className="h-5 w-5 text-black" />
                                            Transaction Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="patient_id" className="text-sm font-medium text-gray-700">
                                                    Patient *
                                                </Label>
                                                <Select
                                                    value={data.patient_id}
                                                    onValueChange={(value) => {
                                                        setData('patient_id', value);
                                                        const patient = patients.find(p => p.id.toString() === value);
                                                        setSelectedPatient(patient || null);
                                                    }}
                                                >
                                                    <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                                        <SelectValue placeholder="Select patient" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {patients.filter(patient => patient.id).map((patient) => (
                                                            <SelectItem key={patient.id} value={patient.id.toString()}>
                                                                {patient.last_name}, {patient.first_name} ({patient.patient_no})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.patient_id && <p className="text-sm text-red-600">{errors.patient_id}</p>}
                                            </div>

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
                                                    <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                                        <SelectValue placeholder="Select doctor" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {doctors.filter(doctor => doctor.specialist_id).map((doctor) => (
                                                            <SelectItem key={doctor.specialist_id} value={doctor.specialist_id.toString()}>
                                                                {doctor.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.doctor_id && <p className="text-sm text-red-600">{errors.doctor_id}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="payment_type" className="text-sm font-medium text-gray-700">
                                                    Payment Type *
                                                </Label>
                                                <Select
                                                    value={data.payment_type}
                                                    onValueChange={(value) => setData('payment_type', value)}
                                                >
                                                    <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="cash">Cash</SelectItem>
                                                        <SelectItem value="health_card">Health Card (HMO)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.payment_type && <p className="text-sm text-red-600">{errors.payment_type}</p>}
                                            </div>
                                        </div>

                                        {/* HMO Information */}
                                        {data.payment_type === 'health_card' && (
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
                                                                <SelectItem key={provider.id} value={provider.id.toString()}>
                                                                    {provider.name}
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

                                        {/* Senior Citizen Discount */}
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="is_senior_citizen"
                                                    checked={data.is_senior_citizen}
                                                    onChange={(e) => setData('is_senior_citizen', e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <Label htmlFor="is_senior_citizen" className="text-sm font-medium text-gray-700">
                                                    Senior Citizen (20% discount)
                                                </Label>
                                            </div>
                                            {errors.is_senior_citizen && <p className="text-xs text-red-600">{errors.is_senior_citizen}</p>}
                                        </div>

                                        {/* Transaction Date */}
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

                                        {/* Due Date */}
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

                                        <div className="space-y-2">
                                            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                                                Description
                                            </Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Enter transaction description"
                                                className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                                rows={3}
                                            />
                                            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
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
                                                className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                                rows={3}
                                            />
                                            {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Items Section */}
                                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                                <Calculator className="h-5 w-5 text-black" />
                                                Transaction Items
                                            </CardTitle>
                                            <Button onClick={addItem} className="h-10 bg-green-600 hover:bg-green-700 text-white">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Item
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        {items.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Calculator className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                <h3 className="mb-2 text-lg font-semibold text-gray-600">No items added</h3>
                                                <p className="text-gray-500 mb-4">Add items to this transaction</p>
                                                <Button onClick={addItem}>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add First Item
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {items.map((item, index) => (
                                                    <div key={item.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                                                            <Button
                                                                onClick={() => removeItem(item.id)}
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium text-gray-700">Item Type</Label>
                                                                <Select
                                                                    value={item.item_type}
                                                                    onValueChange={(value) => updateItem(item.id, 'item_type', value)}
                                                                >
                                                                    <SelectTrigger className="h-10">
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

                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium text-gray-700">Item Name *</Label>
                                                                <Input
                                                                    value={item.item_name}
                                                                    onChange={(e) => updateItem(item.id, 'item_name', e.target.value)}
                                                                    placeholder="Enter item name"
                                                                    className="h-10"
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium text-gray-700">Quantity *</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.quantity}
                                                                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                                                    className="h-10"
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium text-gray-700">Unit Price *</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={item.unit_price}
                                                                    onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                                                                    className="h-10"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="mt-4">
                                                            <Label className="text-sm font-medium text-gray-700">Description</Label>
                                                            <Textarea
                                                                value={item.item_description}
                                                                onChange={(e) => updateItem(item.id, 'item_description', e.target.value)}
                                                                placeholder="Enter item description"
                                                                className="mt-1 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                                                rows={2}
                                                            />
                                                        </div>

                                                        <div className="mt-4 flex justify-end">
                                                            <div className="text-lg font-semibold text-gray-900">
                                                                Total: ₱{(item.total_price || 0).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Summary Sidebar */}
                            <div className="space-y-6">
                                {/* Quick Lab Tests */}
                                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Quick Lab Tests</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-2">
                                            {labTests.slice(0, 5).map((labTest) => (
                                                <Button
                                                    key={labTest.id}
                                                    variant="outline"
                                                    className="w-full justify-start h-10"
                                                    onClick={() => addLabTest(labTest)}
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    {labTest.name} - ₱{labTest.price}
                                                </Button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Transaction Summary */}
                                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                            <Calculator className="h-5 w-5 text-black" />
                                            Transaction Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal:</span>
                                            <span className="font-semibold">₱{calculateTotal().toLocaleString()}</span>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Discount</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={data.discount_amount}
                                                    onChange={(e) => setData('discount_amount', parseFloat(e.target.value) || 0)}
                                                    placeholder="Amount"
                                                    className="h-10"
                                                />
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={data.discount_percentage}
                                                    onChange={(e) => setData('discount_percentage', parseFloat(e.target.value) || 0)}
                                                    placeholder="%"
                                                    className="h-10 w-20"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Discount:</span>
                                            <span className="font-semibold text-red-600">-₱{calculateDiscount().toLocaleString()}</span>
                                        </div>

                                        {calculateSeniorDiscount() > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Senior Citizen Discount (20%):</span>
                                                <span className="font-semibold text-red-600">-₱{calculateSeniorDiscount().toLocaleString()}</span>
                                            </div>
                                        )}

                                        <div className="border-t pt-4">
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Total Amount:</span>
                                                <span>₱{calculateNetAmount().toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Update Button Section */}
                        <div className="border-t border-gray-200 bg-gray-50 px-6 py-6 mt-6">
                            <div className="flex justify-end gap-3">
                                <Button 
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={processing}
                                    className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleSubmit} 
                                    disabled={processing || items.length === 0}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Updating...' : 'Update Transaction'}
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <div className="bg-red-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                                <X className="h-6 w-6 text-red-600" />
                            </div>
                            <p className="text-red-600 text-lg font-medium">Transaction not found</p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

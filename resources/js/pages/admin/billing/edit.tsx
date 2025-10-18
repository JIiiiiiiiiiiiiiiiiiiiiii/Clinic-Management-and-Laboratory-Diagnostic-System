import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import { 
    ArrowLeft, 
    Plus, 
    Minus, 
    CreditCard,
    Calculator,
    Receipt,
    Save,
    X
} from 'lucide-react';
import { useState } from 'react';

type Patient = {
    id: number;
    first_name: string;
    last_name: string;
    patient_no: string;
};

type Doctor = {
    id: number;
    name: string;
};

type LabTest = {
    id: number;
    name: string;
    code: string;
    price: number;
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Edit Transaction', href: '/admin/billing/edit' },
];

export default function BillingEdit({ 
    transaction,
    patients, 
    doctors, 
    labTests 
}: { 
    transaction: BillingTransaction;
    patients: Patient[];
    doctors: Doctor[];
    labTests: LabTest[];
}) {
    const [items, setItems] = useState<BillingItem[]>(transaction.items || []);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
        patients.find(p => p.id === transaction.patient_id) || null
    );
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(
        doctors.find(d => d.id === transaction.doctor_id) || null
    );

    const { data, setData, put, processing, errors } = useForm({
        patient_id: transaction.patient_id?.toString() || '',
        doctor_id: transaction.doctor_id?.toString() || '',
        payment_type: transaction.payment_type,
        payment_method: transaction.payment_method,
        total_amount: transaction.total_amount,
        discount_amount: transaction.discount_amount,
        discount_percentage: transaction.discount_percentage || 0,
        hmo_provider: transaction.hmo_provider || '',
        hmo_reference: transaction.hmo_reference || '',
        payment_reference: transaction.payment_reference || '',
        status: transaction.status,
        description: transaction.description || '',
        notes: transaction.notes || '',
        transaction_date: transaction.transaction_date.split('T')[0],
        due_date: transaction.due_date || '',
        items: items,
    });

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
        const total = calculateTotal();
        if (data.discount_percentage > 0) {
            return (total * data.discount_percentage) / 100;
        }
        return data.discount_amount;
    };

    const calculateNetAmount = () => {
        return calculateTotal() - calculateDiscount();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = {
            ...data,
            total_amount: calculateTotal(),
            discount_amount: calculateDiscount(),
            items: items,
        };
        
        put(`/admin/billing/${transaction.id}`, formData);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Billing Transaction" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button asChild variant="outline" className="h-12 w-12">
                                <Link href="/admin/billing">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <Heading title="Edit Billing Transaction" description="Update transaction details" icon={CreditCard} />
                        </div>
                    </div>
                </div>

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
                                                {patients.map((patient) => (
                                                    <SelectItem key={patient.patient_id} value={patient.patient_id.toString()}>
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
                                                const doctor = doctors.find(d => d.id.toString() === value);
                                                setSelectedDoctor(doctor || null);
                                            }}
                                        >
                                            <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                                <SelectValue placeholder="Select doctor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {doctors.map((doctor) => (
                                                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
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
                                                <SelectItem value="discount">Discount</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.payment_type && <p className="text-sm text-red-600">{errors.payment_type}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="payment_method" className="text-sm font-medium text-gray-700">
                                            Payment Method *
                                        </Label>
                                        <Select
                                            value={data.payment_method}
                                            onValueChange={(value) => setData('payment_method', value)}
                                        >
                                            <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="hmo">HMO</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.payment_method && <p className="text-sm text-red-600">{errors.payment_method}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                                            Status *
                                        </Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) => setData('status', value)}
                                        >
                                            <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                                <SelectItem value="refunded">Refunded</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="transaction_date" className="text-sm font-medium text-gray-700">
                                            Transaction Date *
                                        </Label>
                                        <Input
                                            id="transaction_date"
                                            type="date"
                                            value={data.transaction_date}
                                            onChange={(e) => setData('transaction_date', e.target.value)}
                                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                        />
                                        {errors.transaction_date && <p className="text-sm text-red-600">{errors.transaction_date}</p>}
                                    </div>
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
                                    <Button onClick={addItem} className="h-10">
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

                                <div className="border-t pt-4">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total Amount:</span>
                                        <span>₱{calculateNetAmount().toLocaleString()}</span>
                                    </div>
                                </div>

                                <Button 
                                    onClick={handleSubmit} 
                                    disabled={processing || items.length === 0}
                                    className="w-full h-12"
                                >
                                    <Save className="mr-2 h-5 w-5" />
                                    {processing ? 'Updating...' : 'Update Transaction'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}


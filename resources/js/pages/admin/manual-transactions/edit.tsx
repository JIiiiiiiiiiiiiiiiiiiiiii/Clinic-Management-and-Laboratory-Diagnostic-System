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
    CreditCard,
    Calculator,
    Receipt,
    Save,
    User,
    Stethoscope,
    Microscope,
    Scan
} from 'lucide-react';
import { useState, useEffect } from 'react';

type Patient = {
    id: number;
    first_name: string;
    last_name: string;
    patient_no: string;
};

type Specialist = {
    id: number;
    name: string;
    role: string;
    specialization: string;
};

type HmoProvider = {
    id: number;
    name: string;
    code: string;
};

type ManualTransaction = {
    id: number;
    transaction_id: string;
    patient_id: number;
    specialist_id?: number;
    transaction_type: string;
    specialist_type: string;
    amount: number;
    payment_method: string;
    payment_type: string;
    hmo_provider?: string;
    hmo_reference_number?: string;
    payment_reference?: string;
    is_senior_citizen: boolean;
    discount_amount: number;
    discount_percentage: number;
    description?: string;
    notes?: string;
    transaction_date: string;
    due_date?: string;
    status: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Manual Transactions', href: '/admin/manual-transactions' },
    { title: 'Edit Transaction', href: '#' },
];

export default function ManualTransactionEdit({ 
    transaction,
    patients, 
    specialists,
    hmoProviders = []
}: { 
    transaction: ManualTransaction;
    patients: Patient[];
    specialists: Specialist[];
    hmoProviders?: HmoProvider[];
}) {
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
    const [filteredSpecialists, setFilteredSpecialists] = useState<Specialist[]>(specialists);

    const { data, setData, put, processing, errors } = useForm({
        patient_id: transaction.patient_id.toString(),
        transaction_type: transaction.transaction_type,
        specialist_id: transaction.specialist_id?.toString() || '',
        specialist_type: transaction.specialist_type,
        amount: transaction.amount,
        payment_method: transaction.payment_method,
        payment_type: transaction.payment_type,
        hmo_provider: transaction.hmo_provider || '',
        hmo_reference_number: transaction.hmo_reference_number || '',
        payment_reference: transaction.payment_reference || '',
        is_senior_citizen: transaction.is_senior_citizen,
        discount_amount: transaction.discount_amount,
        discount_percentage: transaction.discount_percentage,
        description: transaction.description || '',
        notes: transaction.notes || '',
        transaction_date: transaction.transaction_date,
        due_date: transaction.due_date || '',
        status: transaction.status,
    });

    // Filter specialists based on transaction type
    useEffect(() => {
        if (data.transaction_type === 'consultation') {
            setFilteredSpecialists(specialists.filter(s => s.role === 'Doctor'));
            setData('specialist_type', 'doctor');
        } else if (data.transaction_type === 'laboratory') {
            setFilteredSpecialists(specialists.filter(s => s.role === 'MedTech'));
            setData('specialist_type', 'medtech');
        } else if (data.transaction_type === 'radiology') {
            setFilteredSpecialists(specialists.filter(s => s.role === 'MedTech'));
            setData('specialist_type', 'medtech');
        } else {
            setFilteredSpecialists(specialists);
            setData('specialist_type', '');
        }
    }, [data.transaction_type]);

    // Update selected specialist when specialist_id changes
    useEffect(() => {
        if (data.specialist_id) {
            const specialist = filteredSpecialists.find(s => s.id.toString() === data.specialist_id);
            setSelectedSpecialist(specialist || null);
        } else {
            setSelectedSpecialist(null);
        }
    }, [data.specialist_id, filteredSpecialists]);

    // Update selected patient when patient_id changes
    useEffect(() => {
        if (data.patient_id) {
            const patient = patients.find(p => p.id.toString() === data.patient_id);
            setSelectedPatient(patient || null);
        } else {
            setSelectedPatient(null);
        }
    }, [data.patient_id, patients]);

    const calculateSeniorDiscount = () => {
        if (!data.is_senior_citizen || data.payment_method === 'hmo') return 0;
        if (data.transaction_type === 'consultation') {
            return data.amount * 0.20; // 20% senior citizen discount
        }
        return 0;
    };

    const calculateRegularDiscount = () => {
        if (data.discount_percentage > 0) {
            return (data.amount * data.discount_percentage) / 100;
        }
        return data.discount_amount;
    };

    const calculateFinalAmount = () => {
        const seniorDiscount = calculateSeniorDiscount();
        const regularDiscount = calculateRegularDiscount();
        return data.amount - seniorDiscount - regularDiscount;
    };

    const getTransactionTypeIcon = (type: string) => {
        switch (type) {
            case 'consultation':
                return <Stethoscope className="h-4 w-4" />;
            case 'laboratory':
                return <Microscope className="h-4 w-4" />;
            case 'radiology':
                return <Scan className="h-4 w-4" />;
            default:
                return <Receipt className="h-4 w-4" />;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = {
            ...data,
            final_amount: calculateFinalAmount(),
            senior_discount_amount: calculateSeniorDiscount(),
            discount_amount: calculateRegularDiscount(),
        };
        
        put(`/admin/manual-transactions/${transaction.id}`, formData);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Transaction ${transaction.transaction_id}`} />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button asChild variant="outline" className="h-12 w-12">
                                <Link href={`/admin/manual-transactions/${transaction.id}`}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <Heading title={`Edit Transaction ${transaction.transaction_id}`} description="Update manual transaction details" icon={CreditCard} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Transaction Details */}
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
                                            onValueChange={(value) => setData('patient_id', value)}
                                        >
                                            <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
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
                                        {errors.patient_id && <p className="text-sm text-red-600">{errors.patient_id}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="transaction_type" className="text-sm font-medium text-gray-700">
                                            Transaction Type *
                                        </Label>
                                        <Select
                                            value={data.transaction_type}
                                            onValueChange={(value) => setData('transaction_type', value)}
                                        >
                                            <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="consultation">
                                                    <div className="flex items-center gap-2">
                                                        <Stethoscope className="h-4 w-4" />
                                                        Consultation
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="laboratory">
                                                    <div className="flex items-center gap-2">
                                                        <Microscope className="h-4 w-4" />
                                                        Laboratory
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="radiology">
                                                    <div className="flex items-center gap-2">
                                                        <Scan className="h-4 w-4" />
                                                        Radiology
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="other">
                                                    <div className="flex items-center gap-2">
                                                        <Receipt className="h-4 w-4" />
                                                        Other
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.transaction_type && <p className="text-sm text-red-600">{errors.transaction_type}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="specialist_id" className="text-sm font-medium text-gray-700">
                                            Specialist
                                        </Label>
                                        <Select
                                            value={data.specialist_id}
                                            onValueChange={(value) => setData('specialist_id', value)}
                                        >
                                            <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                                <SelectValue placeholder="Select specialist" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredSpecialists.map((specialist) => (
                                                    <SelectItem key={specialist.id} value={specialist.id.toString()}>
                                                        {specialist.name} ({specialist.role})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.specialist_id && <p className="text-sm text-red-600">{errors.specialist_id}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                                            Amount *
                                        </Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', parseFloat(e.target.value) || 0)}
                                            placeholder="Enter amount"
                                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                        />
                                        {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                    <div className="space-y-2">
                                        <Label htmlFor="due_date" className="text-sm font-medium text-gray-700">
                                            Due Date
                                        </Label>
                                        <Input
                                            id="due_date"
                                            type="date"
                                            value={data.due_date}
                                            onChange={(e) => setData('due_date', e.target.value)}
                                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                        />
                                        {errors.due_date && <p className="text-sm text-red-600">{errors.due_date}</p>}
                                    </div>
                                </div>

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
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
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

                        {/* Payment Details */}
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                    <CreditCard className="h-5 w-5 text-black" />
                                    Payment Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                    <div className="space-y-2">
                                        <Label htmlFor="payment_reference" className="text-sm font-medium text-gray-700">
                                            Payment Reference
                                        </Label>
                                        <Input
                                            id="payment_reference"
                                            value={data.payment_reference}
                                            onChange={(e) => setData('payment_reference', e.target.value)}
                                            placeholder="Reference number (optional)"
                                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                        />
                                        {errors.payment_reference && <p className="text-sm text-red-600">{errors.payment_reference}</p>}
                                    </div>
                                </div>

                                {data.payment_method === 'hmo' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="hmo_provider" className="text-sm font-medium text-gray-700">
                                                HMO Provider
                                            </Label>
                                            <Select
                                                value={data.hmo_provider}
                                                onValueChange={(value) => setData('hmo_provider', value)}
                                            >
                                                <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
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
                                            {errors.hmo_provider && <p className="text-sm text-red-600">{errors.hmo_provider}</p>}
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
                                                className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                            />
                                            {errors.hmo_reference_number && <p className="text-sm text-red-600">{errors.hmo_reference_number}</p>}
                                        </div>
                                    </div>
                                )}

                                {/* Senior Citizen Discount */}
                                <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
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
                                        <div className="text-sm text-blue-700 bg-blue-100 p-3 rounded-lg">
                                            <strong>Senior Citizen Discount Applied:</strong> 20% discount will be applied to consultation transactions only.
                                        </div>
                                    )}
                                </div>

                                {/* Regular Discount */}
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
                            </CardContent>
                        </Card>
                    </div>

                    {/* Transaction Summary */}
                    <div className="space-y-6">
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
                                    <span className="font-semibold">₱{data.amount.toLocaleString()}</span>
                                </div>

                                {data.is_senior_citizen && calculateSeniorDiscount() > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 text-blue-600">Senior Citizen Discount (20%):</span>
                                        <span className="font-semibold text-blue-600">-₱{calculateSeniorDiscount().toLocaleString()}</span>
                                    </div>
                                )}

                                {calculateRegularDiscount() > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 text-red-600">Regular Discount:</span>
                                        <span className="font-semibold text-red-600">-₱{calculateRegularDiscount().toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="border-t pt-4">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total Amount:</span>
                                        <span>₱{calculateFinalAmount().toLocaleString()}</span>
                                    </div>
                                </div>

                                <Button 
                                    onClick={handleSubmit} 
                                    disabled={processing || !data.patient_id || !data.transaction_type || data.amount <= 0}
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

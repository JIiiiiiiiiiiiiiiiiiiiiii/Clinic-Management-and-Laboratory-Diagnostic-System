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
    Scan,
    Plus,
    Minus
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Create Transaction', href: '/admin/billing/create' },
];

export default function ManualTransactionCreate({ 
    patients, 
    specialists,
    hmoProviders = []
}: { 
    patients: Patient[];
    specialists: Specialist[];
    hmoProviders?: HmoProvider[];
}) {
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
    const [filteredSpecialists, setFilteredSpecialists] = useState<Specialist[]>(specialists);
    const [selectedServices, setSelectedServices] = useState<{[key: string]: number}>({});

    // Transaction types with pricing (same as online appointment system)
    const transactionTypes = {
        'general_consultation': { name: 'General Consultation', price: 300, type: 'consultation' },
        'cbc': { name: 'Complete Blood Count (CBC)', price: 500, type: 'laboratory' },
        'fecalysis_test': { name: 'Fecalysis Test', price: 500, type: 'laboratory' },
        'urinarysis_test': { name: 'Urinarysis Test', price: 500, type: 'laboratory' },
    };

    // Calculate price based on transaction type
    const calculateTransactionPrice = (type: string) => {
        return transactionTypes[type as keyof typeof transactionTypes]?.price || 0;
    };

    // Calculate total amount from selected services
    const calculateTotalFromServices = () => {
        return Object.entries(selectedServices).reduce((total, [serviceType, quantity]) => {
            const price = calculateTransactionPrice(serviceType);
            return total + (price * quantity);
        }, 0);
    };

    // Update service selection
    const updateServiceSelection = (serviceType: string, quantity: number) => {
        if (quantity <= 0) {
            const newServices = { ...selectedServices };
            delete newServices[serviceType];
            setSelectedServices(newServices);
        } else {
            setSelectedServices(prev => ({
                ...prev,
                [serviceType]: quantity
            }));
        }
    };

    const { data, setData, post, processing, errors } = useForm({
        patient_id: '',
        transaction_type: 'consultation',
        specialist_id: '',
        specialist_type: '',
        amount: 0,
        payment_method: 'cash',
        payment_type: 'cash',
        hmo_provider: '',
        hmo_reference_number: '',
        payment_reference: '',
        is_senior_citizen: false,
        discount_amount: 0,
        discount_percentage: 0,
        description: '',
        notes: '',
        transaction_date: new Date().toISOString().split('T')[0],
        due_date: '',
    });

    // Auto-set amount when selected services change
    useEffect(() => {
        const totalAmount = calculateTotalFromServices();
        setData('amount', totalAmount);
    }, [selectedServices]);

    // Filter specialists based on selected services
    useEffect(() => {
        const hasConsultation = selectedServices['general_consultation'] > 0;
        const hasLaboratory = ['cbc', 'fecalysis_test', 'urinarysis_test'].some(service => selectedServices[service] > 0);
        
        if (hasConsultation && hasLaboratory) {
            // If both consultation and lab services are selected, show all specialists
            setFilteredSpecialists(specialists);
            setData('specialist_type', '');
        } else if (hasConsultation) {
            // Only consultation services
            setFilteredSpecialists(specialists.filter(s => s.role === 'Doctor'));
            setData('specialist_type', 'doctor');
        } else if (hasLaboratory) {
            // Only laboratory services
            setFilteredSpecialists(specialists.filter(s => s.role === 'MedTech'));
            setData('specialist_type', 'medtech');
        } else {
            // No services selected
            setFilteredSpecialists(specialists);
            setData('specialist_type', '');
        }
        
        // Clear specialist selection when services change
        setData('specialist_id', '');
        setSelectedSpecialist(null);
    }, [selectedServices]);

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
        
        // Calculate senior discount only on consultation services
        const consultationAmount = selectedServices['general_consultation'] 
            ? (selectedServices['general_consultation'] * transactionTypes['general_consultation'].price)
            : 0;
        return consultationAmount * 0.20; // 20% senior citizen discount only on consultation
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
        
        // Validate that at least one service is selected
        if (Object.keys(selectedServices).length === 0) {
            return;
        }
        
        // Determine primary transaction type based on selected services
        const hasConsultation = selectedServices['general_consultation'] > 0;
        const hasLaboratory = ['cbc', 'fecalysis_test', 'urinarysis_test'].some(service => selectedServices[service] > 0);
        
        let primaryTransactionType = 'consultation';
        if (hasLaboratory && !hasConsultation) {
            primaryTransactionType = 'laboratory';
        } else if (hasConsultation && hasLaboratory) {
            primaryTransactionType = 'consultation'; // Default to consultation if both
        }
        
        const formData = {
            ...data,
            transaction_type: primaryTransactionType,
            amount: data.amount,
            selected_services: selectedServices, // Include for potential future use
        };
        
        
        post('/admin/billing', formData);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Manual Transaction" />
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
                            <Heading title="Create Manual Transaction" description="Add a new manual payment transaction" icon={CreditCard} />
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
                                        <Label className="text-sm font-medium text-gray-700">
                                            Services Required *
                                        </Label>
                                        <div className="space-y-3">
                                            {Object.entries(transactionTypes).map(([key, service]) => (
                                                <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            id={key}
                                                            checked={selectedServices[key] > 0}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    updateServiceSelection(key, 1);
                                                                } else {
                                                                    updateServiceSelection(key, 0);
                                                                }
                                                            }}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            {service.type === 'consultation' ? (
                                                                <Stethoscope className="h-4 w-4 text-blue-600" />
                                                            ) : (
                                                                <Microscope className="h-4 w-4 text-green-600" />
                                                            )}
                                                            <span className="font-medium text-gray-900">{service.name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg font-bold text-blue-600">₱{service.price}</span>
                                                        {selectedServices[key] > 0 && (
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => updateServiceSelection(key, Math.max(0, selectedServices[key] - 1))}
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Minus className="h-3 w-3" />
                                                                </Button>
                                                                <span className="w-8 text-center font-medium">{selectedServices[key]}</span>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => updateServiceSelection(key, selectedServices[key] + 1)}
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {Object.keys(selectedServices).length === 0 && (
                                            <p className="text-sm text-red-600">Please select at least one service</p>
                                        )}
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
                                            <strong>Senior Citizen Discount Applied:</strong> 20% discount will be applied to consultation services only.
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
                                {/* Service Breakdown */}
                                {Object.keys(selectedServices).length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-gray-900">Selected Services:</h4>
                                        {Object.entries(selectedServices).map(([serviceType, quantity]) => {
                                            const service = transactionTypes[serviceType as keyof typeof transactionTypes];
                                            const total = service.price * quantity;
                                            return (
                                                <div key={serviceType} className="flex justify-between text-sm">
                                                    <span className="text-gray-600">
                                                        {service.name} x{quantity}
                                                    </span>
                                                    <span className="font-medium">₱{total.toLocaleString()}</span>
                                                </div>
                                            );
                                        })}
                                        <div className="border-t pt-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 font-medium">Subtotal:</span>
                                                <span className="font-semibold">₱{data.amount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {Object.keys(selectedServices).length === 0 && (
                                    <div className="text-center py-4 text-gray-500">
                                        <p>No services selected</p>
                                    </div>
                                )}

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
                                    disabled={processing || !data.patient_id || Object.keys(selectedServices).length === 0 || data.amount <= 0}
                                    className="w-full h-12"
                                >
                                    <Save className="mr-2 h-5 w-5" />
                                    {processing ? 'Creating...' : 'Create Transaction'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

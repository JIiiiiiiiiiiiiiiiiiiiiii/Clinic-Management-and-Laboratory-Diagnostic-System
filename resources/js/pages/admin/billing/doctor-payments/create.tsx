import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem } from '@/types';
import { 
    ArrowLeft, 
    Check, 
    Users,
    Calculator,
    Save,
    CreditCard,
    TrendingUp,
    AlertCircle
} from 'lucide-react';

interface Doctor {
    id: number;
    name: string;
    specialization?: string;
}

interface CreateDoctorPaymentProps {
    doctors: Doctor[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Doctor Payments', href: '/admin/billing/doctor-payments' },
    { title: 'Create Payment', href: '/admin/billing/doctor-payments/create' },
];

export default function CreateDoctorPayment({ doctors }: CreateDoctorPaymentProps) {
    const { data, setData, post, processing, errors } = useForm({
        doctor_id: '',
        incentives: '',
        payment_date: new Date().toISOString().split('T')[0], // Default to today
        status: 'pending',
        notes: '',
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    // Calculate total payment amount
    const calculateTotalAmount = () => {
        const incentives = parseFloat(data.incentives) || 0;
        return incentives;
    };

    // Calculate net payment (same as incentives for simplified version)
    const calculateNetPayment = () => {
        return calculateTotalAmount();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSubmitting || processing) {
            return;
        }
        
        setIsSubmitting(true);
        
        // Validate required fields
        if (!data.doctor_id) {
            alert('Please select a doctor');
            setIsSubmitting(false);
            return;
        }
        
        if (!data.incentives || parseFloat(data.incentives) <= 0) {
            alert('Please enter a valid incentives amount');
            setIsSubmitting(false);
            return;
        }
        
        // Submit to the main route
        post('/admin/billing/doctor-payments/simple', {
            onSuccess: (page: any) => {
                alert('Doctor payment created successfully!');
                window.location.href = '/admin/billing/doctor-payments';
            },
            onError: (errors: any) => {
                console.error('Form submission errors:', errors);
                alert('Error creating doctor payment: ' + (errors.error || 'Unknown error'));
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const handleMarkAsPaid = () => {
        // Validate required fields first
        if (!data.doctor_id) {
            alert('Please select a doctor');
            return;
        }
        
        if (!data.incentives || parseFloat(data.incentives) <= 0) {
            alert('Please enter a valid incentives amount');
            return;
        }
        
        // Submit the form with paid status
        setData('status', 'paid');
        
        post('/admin/billing/doctor-payments/simple', {
            onSuccess: (page: any) => {
                alert('Doctor payment created and marked as paid!');
                window.location.href = '/admin/billing/doctor-payments';
            },
            onError: (errors: any) => {
                console.error('Form submission errors:', errors);
                alert('Error creating doctor payment: ' + (errors.error || 'Unknown error'));
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Doctor Payment" />
            <div className="min-h-screen bg-white p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Doctor Selection */}
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                    <Users className="h-5 w-5 text-black" />
                                    Doctor Selection
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="doctor_id" className="text-sm font-medium text-gray-700">
                                        Doctor *
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
                                            <SelectValue placeholder="Select a doctor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {doctors.map((doctor) => (
                                                <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{doctor.name}</span>
                                                        {doctor.specialization && (
                                                            <span className="text-sm text-gray-500">{doctor.specialization}</span>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.doctor_id && <p className="text-sm text-red-600">{errors.doctor_id}</p>}
                                </div>

                                {selectedDoctor && (
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-full">
                                                <Users className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-blue-900">{selectedDoctor.name}</h4>
                                                {selectedDoctor.specialization && (
                                                    <p className="text-sm text-blue-700">{selectedDoctor.specialization}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                                        <Label htmlFor="incentives" className="text-sm font-medium text-gray-700">
                                            Incentives Amount *
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                                            <Input
                                                id="incentives"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.incentives}
                                                onChange={(e) => setData('incentives', e.target.value)}
                                                placeholder="0.00"
                                                className="h-12 pl-8 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                            />
                                        </div>
                                        {errors.incentives && <p className="text-sm text-red-600">{errors.incentives}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="payment_date" className="text-sm font-medium text-gray-700">
                                            Payment Date *
                                        </Label>
                                        <Input
                                            id="payment_date"
                                            type="date"
                                            value={data.payment_date}
                                            onChange={(e) => setData('payment_date', e.target.value)}
                                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                        />
                                        {errors.payment_date && <p className="text-sm text-red-600">{errors.payment_date}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                                        Payment Status
                                    </Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) => setData('status', value as 'pending' | 'paid' | 'cancelled')}
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
                                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                                        Notes
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Enter any additional notes about this payment"
                                        className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                        rows={4}
                                    />
                                    {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="space-y-6">
                        {/* Payment Summary */}
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                    <Calculator className="h-5 w-5 text-black" />
                                    Payment Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Incentives:</span>
                                    <span className="font-semibold">₱{calculateTotalAmount().toLocaleString()}</span>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Net Payment:</span>
                                        <span>₱{calculateNetPayment().toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Button 
                                        onClick={handleSubmit} 
                                        disabled={processing || isSubmitting || !data.doctor_id || !data.incentives}
                                        className="w-full h-12"
                                    >
                                        <Save className="mr-2 h-5 w-5" />
                                        {processing || isSubmitting ? 'Creating...' : 'Create Payment'}
                                    </Button>
                                    
                                    {data.status === 'pending' && (
                                        <Button 
                                            onClick={handleMarkAsPaid}
                                            disabled={processing || isSubmitting || !data.doctor_id || !data.incentives}
                                            className="w-full h-12 bg-green-600 hover:bg-green-700"
                                        >
                                            <Check className="mr-2 h-5 w-5" />
                                            Create & Mark as Paid
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <Button asChild variant="outline" className="w-full justify-start h-10">
                                        <Link href="/admin/billing/doctor-payments">
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back to Payments
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="w-full justify-start h-10">
                                        <Link href="/admin/billing/doctor-summary">
                                            <TrendingUp className="mr-2 h-4 w-4" />
                                            View Summary Report
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Information */}
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                    <AlertCircle className="h-5 w-5 text-blue-600" />
                                    Payment Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3 text-sm text-gray-600">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                        <p>Doctor payments are processed independently from patient billing transactions.</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                        <p>Incentives represent the total amount to be paid to the doctor.</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                        <p>Payments marked as "paid" will be recorded in daily transactions.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem } from '@/types';
import Heading from '@/components/heading';
import { ArrowLeft, Calculator, DollarSign } from 'lucide-react';

interface Doctor {
    id: number;
    name: string;
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
        basic_salary: '',
        deductions: '',
        holiday_pay: '',
        incentives: '',
        payment_date: '',
        status: 'pending',
        notes: '',
    });

    const [netPayment, setNetPayment] = useState(0);

    const calculateNetPayment = () => {
        const basicSalary = parseFloat(data.basic_salary) || 0;
        const deductions = parseFloat(data.deductions) || 0;
        const holidayPay = parseFloat(data.holiday_pay) || 0;
        const incentives = parseFloat(data.incentives) || 0;
        
        const net = basicSalary + holidayPay + incentives - deductions;
        setNetPayment(net);
        return net;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Calculate net payment before submission
        const net = calculateNetPayment();
        
        console.log('Submitting doctor payment form...');
        console.log('Form data:', data);
        console.log('Calculated net payment:', net);
        
        // Let Inertia handle the validation through the backend
        // Remove client-side validation that blocks submission
        post('/admin/billing/doctor-payments', {
            onSuccess: (page) => {
                console.log('Form submitted successfully');
                console.log('Response:', page);
            },
            onError: (errors) => {
                console.error('Form submission errors:', errors);
                // Focus on first error field
                const firstErrorField = Object.keys(errors)[0];
                if (firstErrorField) {
                    const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
                    if (element) {
                        element.focus();
                    }
                }
            },
            onFinish: () => {
                console.log('Form submission finished');
            }
        });
    };

    // Update net payment when form data changes
    React.useEffect(() => {
        calculateNetPayment();
    }, [data.basic_salary, data.deductions, data.holiday_pay, data.incentives]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Doctor Payment" />
            
            <div className="min-h-screen bg-white p-6">
                <div className="mb-8">
                    <div className="flex items-center gap-6">
                        <Button asChild variant="outline" className="h-12 w-12">
                            <a href="/admin/billing/doctor-payments">
                                <ArrowLeft className="h-5 w-5" />
                            </a>
                        </Button>
                        <Heading title="Create Doctor Payment" description="Add a new doctor payment record" icon={DollarSign} />
                    </div>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Doctor Payment Details</CardTitle>
                        <CardDescription>
                            Enter the payment information for the selected doctor
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Doctor Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="doctor_id">Doctor *</Label>
                                <Select
                                    value={data.doctor_id}
                                    onValueChange={(value) => setData('doctor_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a doctor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors.map((doctor) => (
                                            <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                                {doctor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.doctor_id && (
                                    <p className="text-sm text-red-600">{errors.doctor_id}</p>
                                )}
                            </div>

                            {/* Basic Salary */}
                            <div className="space-y-2">
                                <Label htmlFor="basic_salary">Basic Salary *</Label>
                                <Input
                                    id="basic_salary"
                                    type="number"
                                    step="0.01"
                                    value={data.basic_salary}
                                    onChange={(e) => setData('basic_salary', e.target.value)}
                                    placeholder="Enter basic salary amount"
                                />
                                {errors.basic_salary && (
                                    <p className="text-sm text-red-600">{errors.basic_salary}</p>
                                )}
                            </div>

                            {/* Deductions */}
                            <div className="space-y-2">
                                <Label htmlFor="deductions">Deductions</Label>
                                <Input
                                    id="deductions"
                                    type="number"
                                    step="0.01"
                                    value={data.deductions}
                                    onChange={(e) => setData('deductions', e.target.value)}
                                    placeholder="Enter deductions amount"
                                />
                                {errors.deductions && (
                                    <p className="text-sm text-red-600">{errors.deductions}</p>
                                )}
                            </div>

                            {/* Holiday Pay */}
                            <div className="space-y-2">
                                <Label htmlFor="holiday_pay">Holiday Pay</Label>
                                <Input
                                    id="holiday_pay"
                                    type="number"
                                    step="0.01"
                                    value={data.holiday_pay}
                                    onChange={(e) => setData('holiday_pay', e.target.value)}
                                    placeholder="Enter holiday pay amount"
                                />
                                {errors.holiday_pay && (
                                    <p className="text-sm text-red-600">{errors.holiday_pay}</p>
                                )}
                            </div>

                            {/* Incentives */}
                            <div className="space-y-2">
                                <Label htmlFor="incentives">Incentives</Label>
                                <Input
                                    id="incentives"
                                    type="number"
                                    step="0.01"
                                    value={data.incentives}
                                    onChange={(e) => setData('incentives', e.target.value)}
                                    placeholder="Enter incentives amount"
                                />
                                {errors.incentives && (
                                    <p className="text-sm text-red-600">{errors.incentives}</p>
                                )}
                            </div>

                            {/* Net Payment Display */}
                            <div className="space-y-2">
                                <Label>Net Payment (Calculated)</Label>
                                <div className="p-3 bg-muted rounded-md">
                                    <span className="text-lg font-semibold">
                                        ₱{netPayment.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Date */}
                            <div className="space-y-2">
                                <Label htmlFor="payment_date">Payment Date *</Label>
                                <Input
                                    id="payment_date"
                                    type="date"
                                    value={data.payment_date}
                                    onChange={(e) => setData('payment_date', e.target.value)}
                                />
                                {errors.payment_date && (
                                    <p className="text-sm text-red-600">{errors.payment_date}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value) => setData('status', value as 'pending' | 'paid' | 'cancelled')}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <p className="text-sm text-red-600">{errors.status}</p>
                                )}
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Enter any additional notes"
                                    rows={3}
                                />
                                {errors.notes && (
                                    <p className="text-sm text-red-600">{errors.notes}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-4">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1"
                                >
                                    {processing ? 'Creating...' : 'Create Payment'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
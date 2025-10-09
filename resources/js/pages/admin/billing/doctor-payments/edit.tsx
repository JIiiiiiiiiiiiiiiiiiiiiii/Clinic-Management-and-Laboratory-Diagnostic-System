import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calculator } from 'lucide-react';

interface Doctor {
    id: number;
    name: string;
}

interface DoctorPayment {
    id: number;
    doctor_id: number;
    basic_salary: number;
    deductions: number;
    holiday_pay: number;
    incentives: number;
    net_payment: number;
    payment_date: string;
    status: 'pending' | 'paid' | 'cancelled';
    notes: string | null;
}

interface EditDoctorPaymentProps {
    payment: DoctorPayment;
    doctors: Doctor[];
}

export default function EditDoctorPayment({ payment, doctors }: EditDoctorPaymentProps) {
    const { data, setData, put, processing, errors } = useForm({
        doctor_id: payment.doctor_id.toString(),
        basic_salary: payment.basic_salary.toString(),
        deductions: payment.deductions.toString(),
        holiday_pay: payment.holiday_pay.toString(),
        incentives: payment.incentives.toString(),
        payment_date: payment.payment_date,
        status: payment.status,
        notes: payment.notes || '',
    });

    const [netPayment, setNetPayment] = useState(payment.net_payment);

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
        
        console.log('Updating doctor payment...');
        console.log('Form data:', data);
        console.log('Calculated net payment:', net);
        
        // Let Inertia handle the validation through the backend
        // Remove client-side validation that blocks submission
        put(`/admin/billing/doctor-payments/${payment.id}`, {
            onSuccess: (page) => {
                console.log('Payment updated successfully');
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
        <AppLayout>
            <Head title="Edit Doctor Payment" />
            
            <div className="container mx-auto py-6">
                <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Button asChild variant="outline" className="h-12 w-12">
                            <a href="/admin/billing/doctor-payments">
                                <ArrowLeft className="h-5 w-5" />
                            </a>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Edit Doctor Payment</h1>
                            <p className="text-muted-foreground">Modify the payment information</p>
                        </div>
                    </div>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Payment Details</CardTitle>
                        <CardDescription>
                            Update the payment information for the selected doctor
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
                                <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                                    <Calculator className="h-4 w-4" />
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
                                    {processing ? 'Updating...' : 'Update Payment'}
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
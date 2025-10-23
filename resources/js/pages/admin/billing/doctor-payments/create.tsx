import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem } from '@/types';
import Heading from '@/components/heading';
import { ArrowLeft, DollarSign, Check } from 'lucide-react';

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSubmitting || processing) {
            console.log('Form already submitting, ignoring duplicate submission');
            return;
        }
        
        setIsSubmitting(true);
        
        console.log('=== FORM SUBMISSION STARTED ===');
        console.log('Processing state:', processing);
        console.log('Form data:', data);
        
        // Prevent multiple submissions
        if (processing) {
            console.log('Form is already processing, skipping submission');
            return;
        }
        
        // Validate required fields
        if (!data.doctor_id) {
            console.log('Validation failed: No doctor selected');
            alert('Please select a doctor');
            return;
        }
        
        if (!data.incentives || parseFloat(data.incentives) <= 0) {
            console.log('Validation failed: Invalid incentives amount');
            alert('Please enter a valid incentives amount');
            return;
        }
        
        // Data is already in the correct format for submission
        
        console.log('Submitting form data:', data);
        console.log('About to submit to:', '/admin/billing/doctor-payments/simple');
        
        // Submit to the main route
        post('/admin/billing/doctor-payments/simple', {
            onSuccess: (page: any) => {
                console.log('Form submitted successfully');
                console.log('Success response:', page);
                alert('Doctor payment created successfully!');
                // Redirect to doctor payments index
                window.location.href = '/admin/billing/doctor-payments';
            },
            onError: (errors: any) => {
                console.error('Form submission errors:', errors);
                console.error('Error details:', JSON.stringify(errors, null, 2));
                alert('Error creating doctor payment: ' + (errors.error || 'Unknown error'));
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

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
                                {errors.doctor_id && (
                                    <p className="text-sm text-red-600">{errors.doctor_id}</p>
                                )}
                            </div>

                            {/* Incentives */}
                            <div className="space-y-2">
                                <Label htmlFor="incentives">Incentives *</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                                    <Input
                                        id="incentives"
                                        type="number"
                                        step="0.01"
                                        value={data.incentives}
                                        onChange={(e) => setData('incentives', e.target.value)}
                                        placeholder="0.00"
                                        className="pl-8"
                                    />
                                </div>
                                {errors.incentives && (
                                    <p className="text-sm text-red-600">{errors.incentives}</p>
                                )}
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
                                        disabled={processing || isSubmitting}
                                        className="flex-1"
                                    >
                                        {(processing || isSubmitting) ? 'Creating Payment...' : 'Create Payment'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                                
                                {/* Mark as Paid Button - Only show if status is pending */}
                                {data.status === 'pending' && (
                                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-yellow-800">Payment Created</h4>
                                                <p className="text-sm text-yellow-600">This payment is currently pending. You can mark it as paid now.</p>
                                            </div>
                                            <Button
                                                type="button"
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => {
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
                                                    
                                                    console.log('Submitting form data (Mark as Paid):', data);
                                                    
                                                    post('/admin/billing/doctor-payments/simple', {
                                                        onSuccess: (page: any) => {
                                                            console.log('Form submitted successfully (Mark as Paid)');
                                                            console.log('Success response:', page);
                                                            alert('Doctor payment created and marked as paid!');
                                                            window.location.href = '/admin/billing?tab=transactions';
                                                        },
                                                        onError: (errors: any) => {
                                                            console.error('Form submission errors:', errors);
                                                            console.error('Error details:', JSON.stringify(errors, null, 2));
                                                            alert('Error creating doctor payment: ' + (errors.error || 'Unknown error'));
                                                        }
                                                    });
                                                }}
                                            >
                                                <Check className="mr-2 h-4 w-4" />
                                                Mark as Paid
                                            </Button>
                                        </div>
                                    </div>
                                )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
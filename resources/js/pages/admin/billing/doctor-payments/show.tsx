import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
    ArrowLeft, 
    Edit, 
    Trash2, 
    Receipt, 
    CheckCircle, 
    Clock, 
    XCircle,
    User,
    Calendar,
    DollarSign,
    FileText,
    Plus,
    Minus
} from 'lucide-react';

interface Doctor {
    id: number;
    name: string;
}

interface CreatedBy {
    id: number;
    name: string;
}

interface BillingTransaction {
    id: number;
    amount: number;
    status: string;
    created_at: string;
}

interface BillingLink {
    id: number;
    payment_amount: number;
    status: string;
    billing_transaction: BillingTransaction;
}

interface DoctorPayment {
    id: number;
    doctor: Doctor;
    basic_salary: number;
    deductions: number;
    holiday_pay: number;
    incentives: number;
    net_payment: number;
    payment_date: string;
    status: 'pending' | 'paid' | 'cancelled';
    paid_date: string | null;
    notes: string | null;
    created_at: string;
    created_by: CreatedBy;
    updated_by: CreatedBy | null;
    billing_links: BillingLink[];
}

interface ShowDoctorPaymentProps {
    payment: DoctorPayment;
}

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
    paid: { label: 'Paid', color: 'bg-green-500', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
};

export default function ShowDoctorPayment({ payment }: ShowDoctorPaymentProps) {
    const getStatusBadge = (status: keyof typeof statusConfig) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        
        const variantMap = {
            pending: 'warning',
            paid: 'success',
            cancelled: 'destructive'
        };
        
        return (
            <Badge variant={variantMap[status] as any}>
                <Icon className="mr-1 h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const handleAddToTransactions = () => {
        router.post(`/admin/billing/doctor-payments/${payment.id}/add-to-transactions`, {}, {
            onSuccess: () => {
                router.reload();
            }
        });
    };

    const handleMarkAsPaid = () => {
        router.post(`/admin/billing/doctor-payments/${payment.id}/mark-as-paid`, {}, {
            onSuccess: () => {
                router.reload();
            }
        });
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this payment?')) {
            router.delete(`/admin/billing/doctor-payments/${payment.id}`);
        }
    };

    return (
        <AppLayout>
            <Head title={`Doctor Payment - ${payment.doctor.name}`} />
            
            <div className="container mx-auto py-6">
                <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Button asChild variant="outline" className="h-12 w-12">
                            <Link href="/admin/billing/doctor-payments">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Doctor Payment Details</h1>
                            <p className="text-muted-foreground">View and manage payment information</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Payment Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Payment Information
                                        </CardTitle>
                                        <CardDescription>
                                            Payment details for {payment.doctor.name}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(payment.status)}
                                        {payment.status === 'pending' && (
                                            <Button
                                                size="sm"
                                                onClick={handleAddToTransactions}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Receipt className="mr-1 h-3 w-3" />
                                                Add to Transactions
                                            </Button>
                                        )}
                                        {payment.status === 'pending' && (
                                            <Button
                                                size="sm"
                                                onClick={handleMarkAsPaid}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                Mark as Paid
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Payment Breakdown */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600">Basic Salary</Label>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-green-600" />
                                                <span className="text-lg font-semibold text-green-600">
                                                    ₱{payment.basic_salary.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600">Deductions</Label>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Minus className="h-4 w-4 text-red-600" />
                                                <span className="text-lg font-semibold text-red-600">
                                                    -₱{payment.deductions.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600">Holiday Pay</Label>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Plus className="h-4 w-4 text-green-600" />
                                                <span className="text-lg font-semibold text-green-600">
                                                    +₱{payment.holiday_pay.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600">Incentives</Label>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Plus className="h-4 w-4 text-green-600" />
                                                <span className="text-lg font-semibold text-green-600">
                                                    +₱{payment.incentives.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Net Payment */}
                                <div className="border-t pt-4">
                                    <div className="space-y-2">
                                        <Label className="text-lg font-medium">Net Payment</Label>
                                        <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-6 w-6 text-blue-600" />
                                                <span className="text-2xl font-bold text-blue-600">
                                                    ₱{payment.net_payment.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600">Payment Date</Label>
                                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                            <Calendar className="h-4 w-4 text-gray-600" />
                                            <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    {payment.paid_date && (
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-600">Paid Date</Label>
                                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                                <Calendar className="h-4 w-4 text-gray-600" />
                                                <span>{new Date(payment.paid_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Notes */}
                                {payment.notes && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600">Notes</Label>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-gray-700">{payment.notes}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Billing Transactions */}
                        {payment.billing_links && payment.billing_links.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Receipt className="h-5 w-5" />
                                        Related Transactions
                                    </CardTitle>
                                    <CardDescription>
                                        Billing transactions linked to this payment
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {payment.billing_links.map((link) => (
                                            <div key={link.id} className="p-4 border rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">Transaction #{link.billing_transaction.id}</p>
                                                        <p className="text-sm text-gray-600">
                                                            Amount: ₱{link.payment_amount.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <Badge variant={link.status === 'paid' ? 'success' : 'warning'}>
                                                        {link.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {payment.status === 'pending' && (
                                    <Button asChild className="w-full">
                                        <Link href={`/admin/billing/doctor-payments/${payment.id}/edit`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Payment
                                        </Link>
                                    </Button>
                                )}
                                {payment.status === 'pending' && (
                                    <Button
                                        onClick={handleDelete}
                                        variant="destructive"
                                        className="w-full"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Payment
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Created by:</span>
                                    <span className="text-sm font-medium">{payment.created_by.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Created:</span>
                                    <span className="text-sm font-medium">
                                        {new Date(payment.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                {payment.updated_by && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Updated by:</span>
                                        <span className="text-sm font-medium">{payment.updated_by.name}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
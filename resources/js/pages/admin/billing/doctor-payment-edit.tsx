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
    Save,
    Users,
    Calendar,
    DollarSign
} from 'lucide-react';

type Doctor = {
    id: number;
    name: string;
};

type DoctorPayment = {
    id: number;
    doctor_id: number;
    payment_period_from: string;
    payment_period_to: string;
    amount_paid: number;
    payment_method: string;
    payment_reference: string | null;
    remarks: string | null;
    status: string;
    payment_date: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Doctor Payments', href: '/admin/billing/doctor-payments' },
    { title: 'Edit Payment', href: '/admin/billing/doctor-payments/edit' },
];

export default function DoctorPaymentEdit({ 
    payment,
    doctors 
}: { 
    payment: DoctorPayment;
    doctors: Doctor[];
}) {
    const { data, setData, put, processing, errors } = useForm({
        doctor_id: payment.doctor_id.toString(),
        payment_period_from: payment.payment_period_from,
        payment_period_to: payment.payment_period_to,
        amount_paid: payment.amount_paid,
        payment_method: payment.payment_method,
        payment_reference: payment.payment_reference || '',
        remarks: payment.remarks || '',
        status: payment.status,
        payment_date: payment.payment_date.split('T')[0],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/billing/doctor-payments/${payment.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Doctor Payment" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button asChild variant="outline" className="h-12 w-12">
                                <Link href="/admin/billing/doctor-payments">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <Heading title="Edit Doctor Payment" description="Update doctor payment record" icon={Users} />
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                <Users className="h-5 w-5 text-black" />
                                Doctor Payment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="doctor_id" className="text-sm font-medium text-gray-700">
                                            Doctor *
                                        </Label>
                                        <Select
                                            value={data.doctor_id}
                                            onValueChange={(value) => setData('doctor_id', value)}
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

                                    <div className="space-y-2">
                                        <Label htmlFor="amount_paid" className="text-sm font-medium text-gray-700">
                                            Amount Paid *
                                        </Label>
                                        <Input
                                            id="amount_paid"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.amount_paid}
                                            onChange={(e) => setData('amount_paid', parseFloat(e.target.value) || 0)}
                                            placeholder="Enter amount"
                                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                        />
                                        {errors.amount_paid && <p className="text-sm text-red-600">{errors.amount_paid}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="payment_period_from" className="text-sm font-medium text-gray-700">
                                            Payment Period From *
                                        </Label>
                                        <Input
                                            id="payment_period_from"
                                            type="date"
                                            value={data.payment_period_from}
                                            onChange={(e) => setData('payment_period_from', e.target.value)}
                                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                        />
                                        {errors.payment_period_from && <p className="text-sm text-red-600">{errors.payment_period_from}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="payment_period_to" className="text-sm font-medium text-gray-700">
                                            Payment Period To *
                                        </Label>
                                        <Input
                                            id="payment_period_to"
                                            type="date"
                                            value={data.payment_period_to}
                                            onChange={(e) => setData('payment_period_to', e.target.value)}
                                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                        />
                                        {errors.payment_period_to && <p className="text-sm text-red-600">{errors.payment_period_to}</p>}
                                    </div>
                                </div>

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
                                                <SelectItem value="card">Card</SelectItem>
                                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="check">Check</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.payment_method && <p className="text-sm text-red-600">{errors.payment_method}</p>}
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="payment_reference" className="text-sm font-medium text-gray-700">
                                            Payment Reference
                                        </Label>
                                        <Input
                                            id="payment_reference"
                                            value={data.payment_reference}
                                            onChange={(e) => setData('payment_reference', e.target.value)}
                                            placeholder="Enter payment reference"
                                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                        />
                                        {errors.payment_reference && <p className="text-sm text-red-600">{errors.payment_reference}</p>}
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
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="remarks" className="text-sm font-medium text-gray-700">
                                        Remarks
                                    </Label>
                                    <Textarea
                                        id="remarks"
                                        value={data.remarks}
                                        onChange={(e) => setData('remarks', e.target.value)}
                                        placeholder="Enter remarks or notes"
                                        className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                        rows={4}
                                    />
                                    {errors.remarks && <p className="text-sm text-red-600">{errors.remarks}</p>}
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button asChild variant="outline" className="h-12 px-8">
                                        <Link href="/admin/billing/doctor-payments">
                                            Cancel
                                        </Link>
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={processing}
                                        className="h-12 px-8"
                                    >
                                        <Save className="mr-2 h-5 w-5" />
                                        {processing ? 'Updating...' : 'Update Payment'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
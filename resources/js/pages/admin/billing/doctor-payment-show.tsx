import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { 
    ArrowLeft, 
    Edit,
    Users,
    Calendar,
    DollarSign,
    CreditCard,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    MoreHorizontal
} from 'lucide-react';

type DoctorPayment = {
    id: number;
    doctor: {
        id: number;
        name: string;
    };
    payment_period_from: string;
    payment_period_to: string;
    amount_paid: number;
    payment_method: 'cash' | 'card' | 'bank_transfer' | 'check';
    payment_reference: string | null;
    remarks: string | null;
    status: 'draft' | 'pending' | 'paid' | 'cancelled';
    payment_date: string;
    created_at: string;
    updated_at: string;
    created_by?: {
        id: number;
        name: string;
    };
    updated_by?: {
        id: number;
        name: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Doctor Payments', href: '/admin/billing/doctor-payments' },
    { title: 'Payment Details', href: '/admin/billing/doctor-payments/show' },
];

const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-500', icon: Clock },
    pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
    paid: { label: 'Paid', color: 'bg-green-500', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
};

const paymentMethodConfig = {
    cash: { label: 'Cash', color: 'bg-green-100 text-green-800' },
    card: { label: 'Card', color: 'bg-blue-100 text-blue-800' },
    bank_transfer: { label: 'Bank Transfer', color: 'bg-purple-100 text-purple-800' },
    check: { label: 'Check', color: 'bg-yellow-100 text-yellow-800' },
};

export default function DoctorPaymentShow({ 
    payment 
}: { 
    payment: DoctorPayment;
}) {
    const getStatusBadge = (status: keyof typeof statusConfig) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        
        const variantMap = {
            draft: 'secondary',
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

    const getPaymentMethodBadge = (method: keyof typeof paymentMethodConfig) => {
        const config = paymentMethodConfig[method];
        return (
            <Badge className={config.color}>
                {config.label}
            </Badge>
        );
    };

    const handleStatusUpdate = (newStatus: string) => {
        router.put(
            `/admin/billing/doctor-payments/${payment.id}/status`,
            { status: newStatus },
            {
                onError: (errors) => {
                    console.error('Status update failed:', errors);
                },
            },
        );
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this payment?')) {
            router.delete(`/admin/billing/doctor-payments/${payment.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Doctor Payment Details" />
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
                            <Heading title="Doctor Payment Details" description="View and manage doctor payment" icon={Users} />
                        </div>
                        <div className="flex items-center gap-3">
                            <Button asChild>
                                <Link href={`/admin/billing/doctor-payments/${payment.id}/edit`}>
                                    <Edit className="mr-2 h-5 w-5" />
                                    Edit Payment
                                </Link>
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {payment.status === 'pending' && (
                                        <DropdownMenuItem onClick={() => handleStatusUpdate('paid')}>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Mark as Paid
                                        </DropdownMenuItem>
                                    )}
                                    {payment.status === 'paid' && (
                                        <DropdownMenuItem onClick={() => handleStatusUpdate('pending')}>
                                            <Clock className="mr-2 h-4 w-4" />
                                            Mark as Pending
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem 
                                        onClick={handleDelete}
                                        className="text-red-600"
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Delete Payment
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    {/* Payment Overview */}
                    <Card className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                <DollarSign className="h-5 w-5 text-black" />
                                Payment Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <div className="text-sm text-gray-600">Doctor</div>
                                            <div className="font-semibold text-gray-900">{payment.doctor.name}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <div className="text-sm text-gray-600">Amount Paid</div>
                                            <div className="font-semibold text-gray-900">₱{payment.amount_paid.toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <div className="text-sm text-gray-600">Payment Method</div>
                                            <div className="mt-1">{getPaymentMethodBadge(payment.payment_method)}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <div className="text-sm text-gray-600">Payment Date</div>
                                            <div className="font-semibold text-gray-900">
                                                {new Date(payment.payment_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <div className="text-sm text-gray-600">Status</div>
                                            <div className="mt-1">{getStatusBadge(payment.status)}</div>
                                        </div>
                                    </div>
                                    {payment.payment_reference && (
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <div className="text-sm text-gray-600">Payment Reference</div>
                                                <div className="font-semibold text-gray-900">{payment.payment_reference}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Period */}
                    <Card className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                <Calendar className="h-5 w-5 text-black" />
                                Payment Period
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">From</div>
                                    <div className="font-semibold text-gray-900">
                                        {new Date(payment.payment_period_from).toLocaleDateString()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">To</div>
                                    <div className="font-semibold text-gray-900">
                                        {new Date(payment.payment_period_to).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Information */}
                    {(payment.remarks || payment.created_by || payment.updated_by) && (
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                    <FileText className="h-5 w-5 text-black" />
                                    Additional Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {payment.remarks && (
                                        <div>
                                            <div className="text-sm text-gray-600 mb-1">Remarks</div>
                                            <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                                                {payment.remarks}
                                            </div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {payment.created_by && (
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">Created By</div>
                                                <div className="font-semibold text-gray-900">{payment.created_by.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(payment.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                        )}
                                        {payment.updated_by && (
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">Last Updated By</div>
                                                <div className="font-semibold text-gray-900">{payment.updated_by.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(payment.updated_at).toLocaleString()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { safeFormatDate } from '@/utils/dateTime';
import { 
    ArrowLeft, 
    Edit,
    Printer,
    CreditCard,
    User,
    Calendar,
    DollarSign,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle
} from 'lucide-react';

type BillingTransaction = {
    id: number;
    transaction_id: string;
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        patient_no: string;
        present_address: string;
        mobile_no: string;
    };
    doctor: {
        id: number;
        name: string;
        role: string;
        employee_id: string;
    } | null;
    payment_type: 'cash' | 'health_card' | 'discount';
    total_amount: number;
    amount: number;
    discount_amount: number;
    discount_percentage: number | null;
    is_senior_citizen: boolean;
    senior_discount_amount: number;
    senior_discount_percentage: number;
    hmo_provider: string | null;
    hmo_reference: string | null;
    hmo_reference_number: string | null;
    payment_method: 'cash' | 'card' | 'bank_transfer' | 'check' | 'hmo';
    payment_reference: string | null;
    status: 'draft' | 'pending' | 'paid' | 'cancelled' | 'refunded';
    description: string | null;
    notes: string | null;
    transaction_date: string;
    due_date: string | null;
    created_at: string;
    items: Array<{
        id: number;
        item_type: string;
        item_name: string;
        item_description: string;
        quantity: number;
        unit_price: number;
        total_price: number;
    }>;
    createdBy: {
        id: number;
        name: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Transaction Details', href: '/admin/billing/show' },
];

const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-500', icon: FileText },
    pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
    paid: { label: 'Paid', color: 'bg-green-500', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
    refunded: { label: 'Refunded', color: 'bg-orange-500', icon: AlertCircle },
};

const paymentMethodConfig = {
    cash: { label: 'Cash', color: 'bg-green-100 text-green-800' },
    card: { label: 'Card', color: 'bg-blue-100 text-blue-800' },
    bank_transfer: { label: 'Bank Transfer', color: 'bg-purple-100 text-purple-800' },
    check: { label: 'Check', color: 'bg-yellow-100 text-yellow-800' },
    hmo: { label: 'HMO', color: 'bg-indigo-100 text-indigo-800' },
};

export default function BillingShow({ 
    transaction 
}: { 
    transaction: BillingTransaction;
}) {
    const getStatusBadge = (status: keyof typeof statusConfig) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        
        const variantMap = {
            draft: 'secondary',
            pending: 'warning',
            paid: 'success',
            cancelled: 'destructive',
            refunded: 'destructive'
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

    const calculateSubtotal = () => {
        // Use total_amount from transaction for accurate subtotal
        return typeof transaction.total_amount === 'string' ? parseFloat(transaction.total_amount) : transaction.total_amount || 0;
    };

    const calculateSeniorDiscount = () => {
        const seniorDiscountAmount = typeof transaction.senior_discount_amount === 'string' ? parseFloat(transaction.senior_discount_amount) : transaction.senior_discount_amount;
        return isNaN(seniorDiscountAmount) ? 0 : seniorDiscountAmount;
    };

    const calculateTotalDiscount = () => {
        const regularDiscount = typeof transaction.discount_amount === 'string' ? parseFloat(transaction.discount_amount) : transaction.discount_amount || 0;
        const seniorDiscount = calculateSeniorDiscount();
        return regularDiscount + seniorDiscount;
    };

    const calculateNetAmount = () => {
        // Use the final amount from the transaction, not calculated
        return typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount || 0;
    };

    const handleStatusUpdate = (newStatus: string) => {
        router.put(
            `/admin/billing/${transaction.id}/status`,
            { status: newStatus },
            {
                onError: (errors) => {
                    console.error('Status update failed:', errors);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Transaction ${transaction.transaction_id}`} />
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
                            <Heading title={`Transaction ${transaction.transaction_id}`} description="View transaction details" icon={CreditCard} />
                        </div>
                        <div className="flex items-center gap-4">
                            {transaction.status === 'pending' && (
                                <Button onClick={() => handleStatusUpdate('paid')}>
                                    <CheckCircle className="mr-2 h-5 w-5" />
                                    Mark as Paid
                                </Button>
                            )}
                            <Button asChild variant="outline">
                                <Link href={`/admin/billing/${transaction.id}/edit`}>
                                    <Edit className="mr-2 h-5 w-5" />
                                    Edit
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href={`/admin/billing/${transaction.id}/receipt`}>
                                    <Printer className="mr-2 h-5 w-5" />
                                    Print Receipt
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Transaction Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Patient & Doctor Information */}
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                    <User className="h-5 w-5 text-black" />
                                    Patient & Doctor Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Details</h3>
                                        {transaction.patient ? (
                                            <div className="space-y-2 text-sm">
                                                <div><span className="font-medium">Name:</span> {transaction.patient.last_name}, {transaction.patient.first_name}</div>
                                                <div><span className="font-medium">Patient No:</span> {transaction.patient.patient_no}</div>
                                                <div><span className="font-medium">Address:</span> {transaction.patient.present_address}</div>
                                                <div><span className="font-medium">Contact:</span> {transaction.patient.mobile_no}</div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 text-sm text-gray-500">
                                                <div><span className="font-medium">Name:</span> Loading patient information...</div>
                                                <div><span className="font-medium">Patient No:</span> Loading...</div>
                                                <div><span className="font-medium">Address:</span> Loading...</div>
                                                <div><span className="font-medium">Contact:</span> Loading...</div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Specialist Details</h3>
                                        {transaction.doctor ? (
                                            <div className="space-y-2 text-sm">
                                                <div><span className="font-medium">Name:</span> {transaction.doctor.name}</div>
                                                <div><span className="font-medium">Type:</span> {transaction.doctor.role === 'doctor' ? 'Doctor' : 'Med Tech Specialist'}</div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">No specialist assigned</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Transaction Items */}
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                    <FileText className="h-5 w-5 text-black" />
                                    Transaction Items
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
                                            <TableRow className="hover:bg-gray-50">
                                                <TableHead className="font-semibold text-gray-700">Item</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Description</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Qty</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Unit Price</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transaction.items.map((item) => (
                                                <TableRow key={item.id} className="hover:bg-gray-50">
                                                    <TableCell className="font-medium">{item.item_name}</TableCell>
                                                    <TableCell className="text-sm text-gray-600">{item.item_description}</TableCell>
                                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                                    <TableCell className="text-right">₱{(item.unit_price || 0).toLocaleString()}</TableCell>
                                                    <TableCell className="text-right font-semibold">₱{(item.total_price || 0).toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Description and Notes */}
                        {(transaction.description || transaction.notes) && (
                            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                        <FileText className="h-5 w-5 text-black" />
                                        Additional Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {transaction.description && (
                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                                            <p className="text-gray-700">{transaction.description}</p>
                                        </div>
                                    )}
                                    {transaction.notes && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                                            <p className="text-gray-700">{transaction.notes}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Transaction Summary */}
                    <div className="space-y-6">
                        {/* Transaction Status */}
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                    <CreditCard className="h-5 w-5 text-black" />
                                    Transaction Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Status:</span>
                                        {getStatusBadge(transaction.status)}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Payment Method:</span>
                                        {getPaymentMethodBadge(transaction.payment_method)}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Payment Type:</span>
                                        <span className="capitalize">{transaction.payment_type.replace('_', ' ')}</span>
                                    </div>
                                    {transaction.payment_reference && (
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Reference:</span>
                                            <span>{transaction.payment_reference}</span>
                                        </div>
                                    )}
                                    {transaction.hmo_provider && (
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">HMO Provider:</span>
                                            <span>{transaction.hmo_provider}</span>
                                        </div>
                                    )}
                                    {transaction.hmo_reference_number && (
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">HMO Reference:</span>
                                            <span>{transaction.hmo_reference_number}</span>
                                        </div>
                                    )}
                                    {transaction.is_senior_citizen && (
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Senior Citizen:</span>
                                            <span className="text-green-600 font-semibold">Yes (20% discount applied)</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Financial Summary */}
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                    <DollarSign className="h-5 w-5 text-black" />
                                    Financial Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-semibold">₱{(calculateSubtotal() || 0).toLocaleString()}</span>
                                    </div>
                                    
                                    {transaction.discount_amount > 0 && (
                                        <div className="flex justify-between text-red-600">
                                            <span>Regular Discount {transaction.discount_percentage ? `(${transaction.discount_percentage}%)` : ''}:</span>
                                            <span className="font-semibold">-₱{(transaction.discount_amount || 0).toLocaleString()}</span>
                                        </div>
                                    )}

                                    {calculateSeniorDiscount() > 0 && (
                                        <div className="flex justify-between text-red-600">
                                            <span>Senior Citizen Discount (20%):</span>
                                            <span className="font-semibold">-₱{calculateSeniorDiscount().toLocaleString()}</span>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-300 pt-3">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total Amount:</span>
                                            <span>₱{(calculateNetAmount() || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Transaction Dates */}
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                    <Calendar className="h-5 w-5 text-black" />
                                    Transaction Dates
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Transaction Date:</span>
                                        <span>{safeFormatDate(transaction.transaction_date)}</span>
                                    </div>
                                    {transaction.due_date && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Due Date:</span>
                                            <span>{safeFormatDate(transaction.due_date)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="font-medium">Created:</span>
                                        <span>{safeFormatDate(transaction.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Created By:</span>
                                        <span>{transaction.createdBy?.name || 'N/A'}</span>
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


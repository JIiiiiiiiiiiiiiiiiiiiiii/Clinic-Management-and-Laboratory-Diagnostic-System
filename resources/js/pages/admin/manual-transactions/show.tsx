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
    Coins,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle
} from 'lucide-react';

type ManualTransaction = {
    id: number;
    transaction_id: string;
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        patient_no: string;
    };
    specialist: {
        id: number;
        name: string;
        role: string;
    } | null;
    amount: number;
    final_amount: number;
    payment_method: string;
    payment_type: string;
    is_senior_citizen: boolean;
    senior_discount_amount: number;
    senior_discount_percentage: number;
    discount_amount: number;
    discount_percentage: number;
    status: string;
    description: string | null;
    notes: string | null;
    transaction_date: string;
    due_date: string | null;
    created_at: string;
    creator: {
        id: number;
        name: string;
    };
};

type BillingTransaction = {
    id: number;
    transaction_id: string;
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        patient_no: string;
    };
    doctor: {
        id: number;
        name: string;
    } | null;
    total_amount: number;
    amount: number;
    discount_amount: number;
    discount_percentage: number | null;
    is_senior_citizen: boolean;
    senior_discount_amount: number;
    senior_discount_percentage: number;
    payment_method: string;
    status: string;
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
    { title: 'Manual Transaction', href: '/admin/billing' },
];

const statusConfig = {
    pending: { label: 'Pending', icon: Clock, color: 'text-yellow-600' },
    paid: { label: 'Paid', icon: CheckCircle, color: 'text-green-600' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600' },
};

const paymentMethodConfig = {
    cash: { label: 'Cash', color: 'bg-green-100 text-green-800' },
    card: { label: 'Card', color: 'bg-blue-100 text-blue-800' },
    bank_transfer: { label: 'Bank Transfer', color: 'bg-purple-100 text-purple-800' },
    check: { label: 'Check', color: 'bg-orange-100 text-orange-800' },
    hmo: { label: 'HMO', color: 'bg-indigo-100 text-indigo-800' },
};

export default function ManualTransactionShow({ 
    transaction,
    billingTransaction
}: { 
    transaction: ManualTransaction;
    billingTransaction: BillingTransaction | null;
}) {
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

    const getPaymentMethodBadge = (method: keyof typeof paymentMethodConfig) => {
        const config = paymentMethodConfig[method];
        return (
            <Badge className={config.color}>
                {config.label}
            </Badge>
        );
    };

    const calculateSubtotal = () => {
        if (billingTransaction) {
            return typeof billingTransaction.total_amount === 'string' ? parseFloat(billingTransaction.total_amount) : billingTransaction.total_amount || 0;
        }
        return transaction.amount;
    };

    const calculateSeniorDiscount = () => {
        if (billingTransaction) {
            const seniorDiscountAmount = typeof billingTransaction.senior_discount_amount === 'string' ? parseFloat(billingTransaction.senior_discount_amount) : billingTransaction.senior_discount_amount;
            return isNaN(seniorDiscountAmount) ? 0 : seniorDiscountAmount;
        }
        return transaction.senior_discount_amount;
    };

    const calculateTotalDiscount = () => {
        if (billingTransaction) {
            const regularDiscount = typeof billingTransaction.discount_amount === 'string' ? parseFloat(billingTransaction.discount_amount) : billingTransaction.discount_amount || 0;
            const seniorDiscount = calculateSeniorDiscount();
            return regularDiscount + seniorDiscount;
        }
        const regularDiscount = transaction.discount_amount;
        const seniorDiscount = calculateSeniorDiscount();
        return regularDiscount + seniorDiscount;
    };

    const calculateNetAmount = () => {
        if (billingTransaction) {
            return typeof billingTransaction.amount === 'string' ? parseFloat(billingTransaction.amount) : billingTransaction.amount || 0;
        }
        return transaction.final_amount;
    };

    const handleStatusUpdate = (newStatus: string) => {
        router.put(`/admin/billing/manual-transactions/${transaction.id}/status`, {
            status: newStatus
        });
    };

    const handlePrint = () => {
        window.open(`/admin/billing/${billingTransaction?.id}/receipt`, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Manual Transaction - ${transaction.transaction_id}`} />
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
                            <Heading title={`Manual Transaction - ${transaction.transaction_id}`} description="View transaction details" icon={CreditCard} />
                        </div>
                        <div className="flex items-center gap-4">
                            <Button asChild variant="outline" className="h-12">
                                <Link href={`/admin/billing/manual-transactions/${transaction.id}/edit`}>
                                    <Edit className="mr-2 h-5 w-5" />
                                    Edit
                                </Link>
                            </Button>
                            {billingTransaction && (
                                <Button onClick={handlePrint} className="h-12">
                                    <Printer className="mr-2 h-5 w-5" />
                                    Print Receipt
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Transaction Details */}
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                    <CreditCard className="h-5 w-5 text-black" />
                                    Transaction Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Transaction ID</Label>
                                            <p className="text-lg font-semibold text-gray-900">{transaction.transaction_id}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Status</Label>
                                            <div className="mt-1">
                                                {getStatusBadge(transaction.status as keyof typeof statusConfig)}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Payment Method</Label>
                                            <div className="mt-1">
                                                {getPaymentMethodBadge(transaction.payment_method as keyof typeof paymentMethodConfig)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Transaction Date</Label>
                                            <p className="text-lg font-semibold text-gray-900">{safeFormatDate(transaction.transaction_date)}</p>
                                        </div>
                                        {transaction.due_date && (
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                                                <p className="text-lg font-semibold text-gray-900">{safeFormatDate(transaction.due_date)}</p>
                                            </div>
                                        )}
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Created By</Label>
                                            <p className="text-lg font-semibold text-gray-900">{transaction.creator?.name || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Patient Information */}
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                    <User className="h-5 w-5 text-black" />
                                    Patient Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {transaction.patient ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Patient Name</Label>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {transaction.patient.last_name}, {transaction.patient.first_name}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Patient Number</Label>
                                            <p className="text-lg font-semibold text-gray-900">{transaction.patient.patient_no}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No patient information available</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Specialist Information */}
                        {transaction.specialist && (
                            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                        <User className="h-5 w-5 text-black" />
                                        Specialist Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Specialist Name</Label>
                                            <p className="text-lg font-semibold text-gray-900">{transaction.specialist.name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Role</Label>
                                            <p className="text-lg font-semibold text-gray-900">{transaction.specialist.role}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Transaction Items */}
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                    <FileText className="h-5 w-5 text-black" />
                                    Transaction Items
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {billingTransaction && billingTransaction.items && billingTransaction.items.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Item</TableHead>
                                                    <TableHead>Description</TableHead>
                                                    <TableHead className="text-center">Qty</TableHead>
                                                    <TableHead className="text-right">Unit Price</TableHead>
                                                    <TableHead className="text-right">Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {billingTransaction.items.map((item) => (
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
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p>No transaction items found</p>
                                        <p className="text-sm mt-2">
                                            {!billingTransaction ? 'Billing transaction not found' : 'Items not available'}
                                        </p>
                                    </div>
                                )}
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
                                <CardContent className="p-6 space-y-4">
                                    {transaction.description && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Description</Label>
                                            <p className="text-gray-900 mt-1">{transaction.description}</p>
                                        </div>
                                    )}
                                    {transaction.notes && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Notes</Label>
                                            <p className="text-gray-900 mt-1">{transaction.notes}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Summary Sidebar */}
                    <div className="space-y-6">
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                    <Coins className="h-5 w-5 text-black" />
                                    Financial Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-semibold">₱{calculateSubtotal().toLocaleString()}</span>
                                </div>
                                
                                {calculateSeniorDiscount() > 0 && (
                                    <div className="flex justify-between text-red-600">
                                        <span>Senior Citizen Discount (20%):</span>
                                        <span className="font-semibold">-₱{calculateSeniorDiscount().toLocaleString()}</span>
                                    </div>
                                )}

                                {transaction.discount_amount > 0 && (
                                    <div className="flex justify-between text-red-600">
                                        <span>Regular Discount:</span>
                                        <span className="font-semibold">-₱{transaction.discount_amount.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="border-t pt-4">
                                    <div className="flex justify-between text-xl font-bold">
                                        <span>Total Amount:</span>
                                        <span>₱{calculateNetAmount().toLocaleString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status Actions */}
                        {transaction.status === 'pending' && (
                            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gray-900">Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-3">
                                    <Button 
                                        onClick={() => handleStatusUpdate('paid')}
                                        className="w-full"
                                        variant="default"
                                    >
                                        <CheckCircle className="mr-2 h-5 w-5" />
                                        Mark as Paid
                                    </Button>
                                    <Button 
                                        onClick={() => handleStatusUpdate('cancelled')}
                                        className="w-full"
                                        variant="destructive"
                                    >
                                        <XCircle className="mr-2 h-5 w-5" />
                                        Cancel Transaction
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
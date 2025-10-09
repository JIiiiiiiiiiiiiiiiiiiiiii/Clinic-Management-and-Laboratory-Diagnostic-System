import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { 
    ArrowLeft, 
    Edit,
    FileText,
    Calendar,
    DollarSign,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle
} from 'lucide-react';

type Expense = {
    id: number;
    expense_category: string;
    expense_name: string;
    description: string | null;
    amount: number;
    expense_date: string;
    payment_method: 'cash' | 'card' | 'bank_transfer' | 'check';
    payment_reference: string | null;
    vendor_name: string | null;
    vendor_contact: string | null;
    receipt_number: string | null;
    status: 'draft' | 'pending' | 'approved' | 'cancelled';
    notes: string | null;
    created_at: string;
    createdBy: {
        id: number;
        name: string;
    };
    updatedBy: {
        id: number;
        name: string;
    } | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Expenses', href: '/admin/billing/expenses' },
    { title: 'Expense Details', href: '/admin/billing/expense-show' },
];

const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-500', icon: Clock },
    pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
    approved: { label: 'Approved', color: 'bg-green-500', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
};

const categoryConfig = {
    office_supplies: { label: 'Office Supplies', color: 'bg-blue-100 text-blue-800' },
    medical_supplies: { label: 'Medical Supplies', color: 'bg-green-100 text-green-800' },
    equipment: { label: 'Equipment', color: 'bg-purple-100 text-purple-800' },
    utilities: { label: 'Utilities', color: 'bg-yellow-100 text-yellow-800' },
    rent: { label: 'Rent', color: 'bg-red-100 text-red-800' },
    maintenance: { label: 'Maintenance', color: 'bg-orange-100 text-orange-800' },
    marketing: { label: 'Marketing', color: 'bg-pink-100 text-pink-800' },
    other: { label: 'Other', color: 'bg-gray-100 text-gray-800' },
};

const paymentMethodConfig = {
    cash: { label: 'Cash', color: 'bg-green-100 text-green-800' },
    card: { label: 'Card', color: 'bg-blue-100 text-blue-800' },
    bank_transfer: { label: 'Bank Transfer', color: 'bg-purple-100 text-purple-800' },
    check: { label: 'Check', color: 'bg-yellow-100 text-yellow-800' },
};

export default function ExpenseShow({ 
    expense 
}: { 
    expense: Expense;
}) {
    const getStatusBadge = (status: keyof typeof statusConfig) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        
        const variantMap = {
            draft: 'secondary',
            pending: 'warning',
            approved: 'success',
            cancelled: 'destructive'
        };
        
        return (
            <Badge variant={variantMap[status] as any}>
                <Icon className="mr-1 h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getCategoryBadge = (category: keyof typeof categoryConfig) => {
        const config = categoryConfig[category];
        return (
            <Badge className={config.color}>
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
            `/admin/billing/expenses/${expense.id}/status`,
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
            <Head title={`Expense - ${expense.expense_name}`} />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button asChild variant="outline" className="h-12 w-12">
                                <Link href="/admin/billing/expenses">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <Heading title={`Expense - ${expense.expense_name}`} description="View expense details" icon={FileText} />
                        </div>
                        <div className="flex items-center gap-4">
                            {expense.status === 'pending' && (
                                <Button onClick={() => handleStatusUpdate('approved')}>
                                    <CheckCircle className="mr-2 h-5 w-5" />
                                    Approve
                                </Button>
                            )}
                            <Button asChild variant="outline">
                                <Link href={`/admin/billing/expenses/${expense.id}/edit`}>
                                    <Edit className="mr-2 h-5 w-5" />
                                    Edit
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Expense Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                    <FileText className="h-5 w-5 text-black" />
                                    Expense Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Expense Name</h3>
                                        <p className="text-gray-700">{expense.expense_name}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Category</h3>
                                        {getCategoryBadge(expense.expense_category)}
                                    </div>
                                    {expense.description && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                                            <p className="text-gray-700">{expense.description}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Financial Details */}
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                    <DollarSign className="h-5 w-5 text-black" />
                                    Financial Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Amount:</span>
                                        <span className="text-2xl font-bold text-red-600">₱{expense.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Payment Method:</span>
                                        {getPaymentMethodBadge(expense.payment_method)}
                                    </div>
                                    {expense.payment_reference && (
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Payment Reference:</span>
                                            <span>{expense.payment_reference}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Expense Date:</span>
                                        <span>{new Date(expense.expense_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vendor Information */}
                        {(expense.vendor_name || expense.vendor_contact) && (
                            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                        <FileText className="h-5 w-5 text-black" />
                                        Vendor Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-2 text-sm">
                                        {expense.vendor_name && (
                                            <div><span className="font-medium">Vendor Name:</span> {expense.vendor_name}</div>
                                        )}
                                        {expense.vendor_contact && (
                                            <div><span className="font-medium">Vendor Contact:</span> {expense.vendor_contact}</div>
                                        )}
                                        {expense.receipt_number && (
                                            <div><span className="font-medium">Receipt Number:</span> {expense.receipt_number}</div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Notes */}
                        {expense.notes && (
                            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                        <FileText className="h-5 w-5 text-black" />
                                        Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <p className="text-gray-700">{expense.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Expense Summary */}
                    <div className="space-y-6">
                        {/* Expense Status */}
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                    <CheckCircle className="h-5 w-5 text-black" />
                                    Expense Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Status:</span>
                                        {getStatusBadge(expense.status)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Expense History */}
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                    <Calendar className="h-5 w-5 text-black" />
                                    Expense History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Created:</span>
                                        <span>{new Date(expense.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Created By:</span>
                                        <span>{expense.createdBy.name}</span>
                                    </div>
                                    {expense.updatedBy && (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="font-medium">Last Updated:</span>
                                                <span>{new Date(expense.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium">Updated By:</span>
                                                <span>{expense.updatedBy.name}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}




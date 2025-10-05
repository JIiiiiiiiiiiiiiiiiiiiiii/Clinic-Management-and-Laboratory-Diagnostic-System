import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowDown, ArrowLeft, ArrowUp, Calendar, CheckCircle, Edit, Package, User, XCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory',
        href: '/admin/inventory',
    },
    {
        title: 'Item Movements',
        href: '/admin/inventory/transactions',
    },
    {
        title: 'Transaction Details',
        href: '/admin/inventory/transactions/show',
    },
];

interface Transaction {
    id: number;
    type: string;
    subtype: string;
    quantity: number;
    unit_cost?: number;
    total_cost?: number;
    lot_number?: string;
    expiry_date?: string;
    date_opened?: string;
    transaction_date: string;
    transaction_time?: string;
    approval_status: string;
    usage_location?: string;
    usage_purpose?: string;
    notes?: string;
    reference_number?: string;
    created_at: string;
    updated_at: string;
    product: {
        id: number;
        name: string;
        code: string;
        unit_of_measure?: string;
    };
    user: {
        id: number;
        name: string;
    };
    approved_by?: {
        id: number;
        name: string;
    };
    charged_to?: {
        id: number;
        name: string;
    };
}

interface ShowTransactionProps {
    transaction: Transaction;
}

export default function ShowTransaction({ transaction }: ShowTransactionProps) {
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            approved: 'bg-green-100 text-green-800 border-green-200',
            rejected: 'bg-red-100 text-red-800 border-red-200',
        };
        return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getTypeIcon = (type: string) => {
        return type === 'in' ? (
            <ArrowUp className="h-6 w-6 text-green-500" />
        ) : (
            <ArrowDown className="h-6 w-6 text-red-500" />
        );
    };

    const getTypeColor = (type: string) => {
        return type === 'in' ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaction Details" />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button 
                                variant="secondary" 
                                onClick={() => router.visit('/admin/inventory/transactions')}
                                className="h-12 w-12"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <Heading 
                                title={`Transaction #${transaction.id}`} 
                                description="View detailed transaction information" 
                                icon={transaction.type === 'in' ? ArrowUp : ArrowDown} 
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge 
                                className={`${getStatusBadge(transaction.approval_status)} border px-4 py-2 text-sm font-semibold`}
                            >
                                {transaction.approval_status.toUpperCase()}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Transaction Details */}
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        <div className={`bg-gradient-to-r ${getTypeColor(transaction.type)} text-white`}>
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    {getTypeIcon(transaction.type)}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">
                                        Transaction Details
                                    </h3>
                                    <p className="text-white/80 mt-1">
                                        {transaction.subtype.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6 bg-gradient-to-br from-slate-50 to-slate-100">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                                        <p className="text-lg font-semibold text-gray-900">#{transaction.id}</p>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Type</label>
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(transaction.type)}
                                            <span className="text-lg font-semibold text-gray-900 capitalize">
                                                {transaction.type}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Subtype</label>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {transaction.subtype.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Quantity</label>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {transaction.type === 'in' ? '+' : ''}{transaction.quantity}
                                            {transaction.product.unit_of_measure && ` ${transaction.product.unit_of_measure}`}
                                        </p>
                                    </div>

                                    {transaction.unit_cost && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-500">Unit Cost</label>
                                            <p className="text-lg font-semibold text-gray-900">
                                                ₱{Number(transaction.unit_cost).toFixed(2)}
                                            </p>
                                        </div>
                                    )}

                                    {transaction.total_cost && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-500">Total Cost</label>
                                            <p className="text-lg font-semibold text-gray-900">
                                                ₱{Number(transaction.total_cost).toFixed(2)}
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Date</label>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {new Date(transaction.transaction_date).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {transaction.transaction_time && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-500">Time</label>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {transaction.transaction_time}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Information */}
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Package className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">
                                        Product Information
                                    </h3>
                                    <p className="text-blue-100 mt-1">
                                        Item details and specifications
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6 bg-gradient-to-br from-blue-50 to-blue-100">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Product Name</label>
                                    <p className="text-lg font-semibold text-gray-900">{transaction.product.name}</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Product Code</label>
                                    <p className="text-lg font-semibold text-gray-900">{transaction.product.code}</p>
                                </div>

                                {transaction.product.unit_of_measure && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Unit of Measure</label>
                                        <p className="text-lg font-semibold text-gray-900">{transaction.product.unit_of_measure}</p>
                                    </div>
                                )}

                                {transaction.lot_number && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Lot Number</label>
                                        <p className="text-lg font-semibold text-gray-900">{transaction.lot_number}</p>
                                    </div>
                                )}

                                {transaction.expiry_date && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Expiry Date</label>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {new Date(transaction.expiry_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                {transaction.date_opened && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Date Opened</label>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {new Date(transaction.date_opened).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* User Information */}
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <User className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">
                                        User Information
                                    </h3>
                                    <p className="text-purple-100 mt-1">
                                        Transaction creator and approver details
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6 bg-gradient-to-br from-purple-50 to-purple-100">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Created By</label>
                                    <p className="text-lg font-semibold text-gray-900">{transaction.user.name}</p>
                                </div>

                                {transaction.approved_by && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Approved By</label>
                                        <p className="text-lg font-semibold text-gray-900">{transaction.approved_by.name}</p>
                                    </div>
                                )}

                                {transaction.charged_to && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Charged To</label>
                                        <p className="text-lg font-semibold text-gray-900">{transaction.charged_to.name}</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Created At</label>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {new Date(transaction.created_at).toLocaleString()}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {new Date(transaction.updated_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Calendar className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">
                                        Additional Information
                                    </h3>
                                    <p className="text-emerald-100 mt-1">
                                        Usage details and notes
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6 bg-gradient-to-br from-emerald-50 to-emerald-100">
                            <div className="space-y-6">
                                {transaction.reference_number && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Reference Number</label>
                                        <p className="text-lg font-semibold text-gray-900">{transaction.reference_number}</p>
                                    </div>
                                )}

                                {transaction.usage_location && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Usage Location</label>
                                        <p className="text-lg font-semibold text-gray-900">{transaction.usage_location}</p>
                                    </div>
                                )}

                                {transaction.usage_purpose && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Usage Purpose</label>
                                        <p className="text-lg font-semibold text-gray-900">{transaction.usage_purpose}</p>
                                    </div>
                                )}

                                {transaction.notes && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Notes</label>
                                        <p className="text-lg font-semibold text-gray-900">{transaction.notes}</p>
                                    </div>
                                )}

                                {!transaction.reference_number && !transaction.usage_location && !transaction.usage_purpose && !transaction.notes && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">No additional information available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex items-center justify-end gap-4">
                    <Button 
                        variant="secondary" 
                        onClick={() => router.visit('/admin/inventory/transactions')} 
                        className="rounded-xl px-8 py-3 text-lg font-semibold"
                    >
                        Back to Transactions
                    </Button>
                    {transaction.approval_status === 'pending' && (
                        <>
                            <Button 
                                onClick={() => router.post(`/admin/inventory/transactions/${transaction.id}/approve`)}
                                className="rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-green-700 hover:shadow-xl"
                            >
                                <CheckCircle className="mr-3 h-5 w-5" />
                                Approve Transaction
                            </Button>
                            <Button 
                                onClick={() => router.post(`/admin/inventory/transactions/${transaction.id}/reject`)}
                                className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:from-red-600 hover:to-red-700 hover:shadow-xl"
                            >
                                <XCircle className="mr-3 h-5 w-5" />
                                Reject Transaction
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}


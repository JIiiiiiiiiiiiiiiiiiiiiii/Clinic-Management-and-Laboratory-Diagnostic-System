import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { 
    Calculator, 
    CreditCard, 
    Download, 
    CheckCircle, 
    Clock,
    FileText,
    FlaskConical,
    User,
    Circle
} from 'lucide-react';

interface BillingItem {
    id: number;
    item_type: 'consultation' | 'lab_test' | 'follow_up' | 'procedure';
    item_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    visit?: {
        id: number;
        visit_code: string;
    };
}

interface BillingTransaction {
    id: number;
    transaction_id: string;
    total_amount: number;
    status: 'pending' | 'paid' | 'cancelled' | 'refunded';
    payment_method?: string;
    payment_reference?: string;
    created_at: string;
}

interface BillingItemBreakdownProps {
    billingTransaction: BillingTransaction;
    billingItems?: BillingItem[];
    showDetails?: boolean;
    onPaymentProcessed?: () => void;
}

export default function BillingItemBreakdown({ 
    billingTransaction, 
    billingItems = [],
    showDetails = true,
    onPaymentProcessed 
}: BillingItemBreakdownProps) {
    
    // Debug: Log what we're receiving
    console.log('BillingItemBreakdown Debug:', {
        billingTransaction: billingTransaction ? 'EXISTS' : 'NULL',
        billingItems: billingItems,
        billingItemsLength: billingItems ? billingItems.length : 'NULL',
        billingItemsType: typeof billingItems,
        billingItemsIsArray: Array.isArray(billingItems)
    });
    
    const getItemTypeIcon = (itemType: string) => {
        switch (itemType) {
            case 'consultation':
                return <User className="h-4 w-4" />;
            case 'lab_test':
                return <FlaskConical className="h-4 w-4" />;
            case 'follow_up':
                return <FileText className="h-4 w-4" />;
            case 'procedure':
                return <Calculator className="h-4 w-4" />;
            default:
                return <Circle className="h-4 w-4" />;
        }
    };

    const getItemTypeLabel = (itemType: string) => {
        switch (itemType) {
            case 'consultation':
                return 'Consultation';
            case 'lab_test':
                return 'Lab Test';
            case 'follow_up':
                return 'Follow-up Visit';
            case 'procedure':
                return 'Procedure';
            default:
                return itemType;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            'paid': 'default',
            'pending': 'secondary',
            'cancelled': 'destructive',
            'refunded': 'outline'
        } as const;

        // Safety check for undefined or null status
        if (!status || typeof status !== 'string') {
            return (
                <Badge variant="secondary">
                    Unknown
                </Badge>
            );
        }

        return (
            <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'cancelled':
                return <Circle className="h-4 w-4 text-red-600" />;
            default:
                return <Circle className="h-4 w-4 text-gray-600" />;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate totals by type
    const totalsByType = (billingItems || []).reduce((acc, item) => {
        if (!acc[item.item_type]) {
            acc[item.item_type] = 0;
        }
        acc[item.item_type] += item.total_price;
        return acc;
    }, {} as Record<string, number>);

    const grandTotal = (billingItems || []).reduce((sum, item) => sum + item.total_price, 0);

    // Safety check for billingTransaction
    if (!billingTransaction) {
        return (
            <Card className="w-full">
                <CardContent className="text-center py-8 text-gray-500">
                    <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No billing information available</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-blue-600" />
                        <CardTitle>Billing Breakdown</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusIcon(billingTransaction.status)}
                        {getStatusBadge(billingTransaction.status)}
                    </div>
                </div>
                <p className="text-sm text-gray-600">
                    Transaction: {billingTransaction.transaction_id} | 
                    Created: {formatDate(billingTransaction.created_at)}
                </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
                {/* Billing Items Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>Visit</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(billingItems || []).length > 0 ? (billingItems || []).map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getItemTypeIcon(item.item_type)}
                                            <span className="text-sm">
                                                {getItemTypeLabel(item.item_type)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{item.item_name}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {item.visit && (
                                            <Badge variant="outline" className="text-xs">
                                                {item.visit.visit_code}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.quantity}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(item.unit_price)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(item.total_price)}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                        No billing items found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Totals by Type */}
                {showDetails && Object.keys(totalsByType).length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">Summary by Type</h4>
                        <div className="space-y-2">
                            {Object.entries(totalsByType).map(([type, total]) => (
                                <div key={type} className="flex justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        {getItemTypeIcon(type)}
                                        {getItemTypeLabel(type)}:
                                    </span>
                                    <span className="font-medium">
                                        {formatCurrency(total)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Grand Total */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total Amount:</span>
                        <span className="text-2xl font-bold text-blue-600">
                            {formatCurrency(billingTransaction.total_amount)}
                        </span>
                    </div>
                </div>

                {/* Payment Information */}
                {billingTransaction.payment_method && (
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-800">Payment Information</span>
                        </div>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>Payment Method:</span>
                                <span className="font-medium">{billingTransaction.payment_method}</span>
                            </div>
                            {billingTransaction.payment_reference && (
                                <div className="flex justify-between">
                                    <span>Reference:</span>
                                    <span className="font-medium">{billingTransaction.payment_reference}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Receipt
                    </Button>
                    {billingTransaction.status === 'pending' && onPaymentProcessed && (
                        <Button 
                            onClick={onPaymentProcessed}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Process Payment
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

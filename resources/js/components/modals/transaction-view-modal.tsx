import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { safeFormatDate } from '@/utils/dateTime';
import { 
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
    AlertCircle,
    X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

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

interface TransactionViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactionId: number | null;
    onEdit?: (transactionId: number) => void;
}

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

export default function TransactionViewModal({
    isOpen,
    onClose,
    transactionId,
    onEdit
}: TransactionViewModalProps) {
    const [transaction, setTransaction] = useState<BillingTransaction | null>(null);
    const [loading, setLoading] = useState(false);
    const [isMarkingAsPaid, setIsMarkingAsPaid] = useState(false);

    useEffect(() => {
        if (isOpen && transactionId) {
            fetchTransaction();
        }
    }, [isOpen, transactionId]);

    const fetchTransaction = async () => {
        if (!transactionId) return;
        
        setLoading(true);
        try {
            const response = await fetch(`/admin/billing/${transactionId}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Transaction response:', data);
                if (data.transaction) {
                    console.log('Setting transaction:', data.transaction);
                setTransaction(data.transaction);
                } else {
                    console.error('Transaction data not found in response:', data);
                    setTransaction(null);
                }
            } else {
                const errorText = await response.text();
                console.error('Failed to fetch transaction:', response.status, errorText);
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: 'Transaction not found' };
                }
                console.error('Error data:', errorData);
                setTransaction(null);
            }
        } catch (error) {
            console.error('Failed to fetch transaction:', error);
            setTransaction(null);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = (transactionId: number) => {
        if (isMarkingAsPaid) return;
        
        setIsMarkingAsPaid(true);
        
        router.put(`/admin/billing/${transactionId}/mark-paid`, {
            payment_method: transaction?.payment_method || 'cash',
            payment_reference: transaction?.payment_reference || '',
            notes: transaction?.notes || ''
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Refresh the transaction data after successful payment
                fetchTransaction();
                // Show success message
                alert('Transaction marked as paid successfully!');
            },
            onError: (errors) => {
                console.error('Error marking transaction as paid:', errors);
                const errorMessage = errors?.message || errors?.error || 'Failed to mark transaction as paid. Please try again.';
                alert(errorMessage);
            },
            onFinish: () => {
                setIsMarkingAsPaid(false);
            }
        });
    };

    const handleEdit = (transactionId: number) => {
        // Close the view modal and open edit modal
        onClose();
        if (onEdit) {
            onEdit(transactionId);
        }
    };

    const handlePrintReceipt = (transactionId: number) => {
        // Navigate to print receipt page
        router.visit(`/admin/billing/${transactionId}/receipt`);
    };

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
        if (!transaction) return 0;
        return typeof transaction.total_amount === 'string' ? parseFloat(transaction.total_amount) : transaction.total_amount || 0;
    };

    const calculateSeniorDiscount = () => {
        if (!transaction) return 0;
        const seniorDiscountAmount = typeof transaction.senior_discount_amount === 'string' ? parseFloat(transaction.senior_discount_amount) : transaction.senior_discount_amount;
        return isNaN(seniorDiscountAmount) ? 0 : seniorDiscountAmount;
    };

    const calculateTotalDiscount = () => {
        if (!transaction) return 0;
        const regularDiscount = typeof transaction.discount_amount === 'string' ? parseFloat(transaction.discount_amount) : transaction.discount_amount || 0;
        const seniorDiscount = calculateSeniorDiscount();
        return regularDiscount + seniorDiscount;
    };

    const calculateNetAmount = () => {
        if (!transaction) return 0;
        return typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount || 0;
    };

    const handleStatusUpdate = (newStatus: string) => {
        if (!transaction) return;
        
        router.put(
            `/admin/billing/${transaction.id}/status`,
            { status: newStatus },
            {
                onSuccess: () => {
                    // Refresh the transaction data
                    fetchTransaction();
                },
                onError: (errors) => {
                    console.error('Status update failed:', errors);
                },
            },
        );
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[90vw] max-w-[1400px] sm:max-w-none h-[90vh] max-h-none overflow-y-auto p-0" hideCloseButton={true}>
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6 px-6 pt-6 border-b bg-gradient-to-r from-gray-50 to-white">
                    <div>
                        <DialogTitle className="text-3xl font-bold text-gray-900">
                            Transaction {transaction?.transaction_id || 'Loading...'}
                        </DialogTitle>
                        <p className="text-gray-600 mt-1 text-sm">
                            {transaction ? `Complete transaction details and information` : 'Loading transaction details...'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-gray-200">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 text-lg">Loading transaction details...</p>
                        </div>
                    </div>
                ) : transaction ? (
                    <div className="p-6 space-y-8">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            {/* Transaction Details */}
                            <div className="xl:col-span-2 space-y-8">
                                {/* Patient & Doctor Information */}
                                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                            <User className="h-6 w-6 text-blue-600" />
                                            Patient & Doctor Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Patient Details</h3>
                                                {transaction.patient ? (
                                                    <div className="space-y-3 text-sm">
                                                        <div className="flex justify-between"><span className="font-medium text-gray-600">Name:</span> <span className="text-gray-900">{transaction.patient.last_name}, {transaction.patient.first_name}</span></div>
                                                        <div className="flex justify-between"><span className="font-medium text-gray-600">Patient No:</span> <span className="text-gray-900">{transaction.patient.patient_no}</span></div>
                                                        <div className="flex justify-between"><span className="font-medium text-gray-600">Address:</span> <span className="text-gray-900">{transaction.patient.present_address}</span></div>
                                                        <div className="flex justify-between"><span className="font-medium text-gray-600">Contact:</span> <span className="text-gray-900">{transaction.patient.mobile_no}</span></div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3 text-sm text-gray-500">
                                                        <div className="flex justify-between"><span className="font-medium">Name:</span> <span>Loading patient information...</span></div>
                                                        <div className="flex justify-between"><span className="font-medium">Patient No:</span> <span>Loading...</span></div>
                                                        <div className="flex justify-between"><span className="font-medium">Address:</span> <span>Loading...</span></div>
                                                        <div className="flex justify-between"><span className="font-medium">Contact:</span> <span>Loading...</span></div>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Specialist Details</h3>
                                                {transaction.doctor ? (
                                                    <div className="space-y-3 text-sm">
                                                        <div className="flex justify-between"><span className="font-medium text-gray-600">Name:</span> <span className="text-gray-900">{transaction.doctor.name}</span></div>
                                                        <div className="flex justify-between"><span className="font-medium text-gray-600">Type:</span> <span className="text-gray-900">{transaction.doctor.role && (transaction.doctor.role.toLowerCase() === 'doctor' || transaction.doctor.role === 'Doctor') ? 'Doctor' : transaction.doctor.role || 'N/A'}</span></div>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500">No specialist assigned</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Transaction Items */}
                                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                            <FileText className="h-6 w-6 text-blue-600" />
                                            Transaction Items
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                                            <Table>
                                                <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                                                    <TableRow className="hover:bg-gray-100">
                                                        <TableHead className="font-semibold text-gray-700 py-4">Item</TableHead>
                                                        <TableHead className="font-semibold text-gray-700 py-4">Description</TableHead>
                                                        <TableHead className="font-semibold text-gray-700 py-4 text-center">Qty</TableHead>
                                                        <TableHead className="font-semibold text-gray-700 py-4 text-right">Unit Price</TableHead>
                                                        <TableHead className="font-semibold text-gray-700 py-4 text-right">Total</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {transaction.items.map((item) => (
                                                        <TableRow key={item.id} className="hover:bg-gray-50 border-b border-gray-100">
                                                            <TableCell className="font-medium py-4">{item.item_name}</TableCell>
                                                            <TableCell className="text-sm text-gray-600 py-4">{item.item_description}</TableCell>
                                                            <TableCell className="text-center py-4 font-medium">{item.quantity}</TableCell>
                                                            <TableCell className="text-right py-4">₱{(item.unit_price || 0).toLocaleString()}</TableCell>
                                                            <TableCell className="text-right font-semibold py-4 text-blue-600">₱{(item.total_price || 0).toLocaleString()}</TableCell>
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
                            <div className="space-y-8">
                                {/* Transaction Status */}
                                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                            <CreditCard className="h-6 w-6 text-blue-600" />
                                            Transaction Status
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                <span className="font-medium text-gray-600">Status:</span>
                                                {getStatusBadge(transaction.status)}
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                <span className="font-medium text-gray-600">Payment Method:</span>
                                                {transaction.payment_method ? (
                                                    <span className="capitalize text-gray-900">{(transaction.payment_method || '').replace(/_/g, ' ')}</span>
                                                ) : (
                                                    <span className="text-gray-400">N/A</span>
                                                )}
                                            </div>
                                            {transaction.payment_reference && (
                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                    <span className="font-medium text-gray-600">Reference:</span>
                                                    <span className="text-gray-900">{transaction.payment_reference}</span>
                                                </div>
                                            )}
                                            {transaction.hmo_provider && (
                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                    <span className="font-medium text-gray-600">HMO Provider:</span>
                                                    <span className="text-gray-900">{transaction.hmo_provider}</span>
                                                </div>
                                            )}
                                            {transaction.hmo_reference_number && (
                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                    <span className="font-medium text-gray-600">HMO Reference:</span>
                                                    <span className="text-gray-900">{transaction.hmo_reference_number}</span>
                                                </div>
                                            )}
                                            {transaction.is_senior_citizen && (
                                                <div className="flex justify-between items-center py-2">
                                                    <span className="font-medium text-gray-600">Senior Citizen:</span>
                                                    <span className="text-green-600 font-semibold">Yes (20% discount applied)</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Financial Summary */}
                                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                            <DollarSign className="h-6 w-6 text-blue-600" />
                                            Financial Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                                <span className="text-gray-600 font-medium">Subtotal:</span>
                                                <span className="font-semibold text-gray-900">₱{(calculateSubtotal() || 0).toLocaleString()}</span>
                                            </div>
                                            
                                            {transaction.discount_amount > 0 && (
                                                <div className="flex justify-between text-red-600 py-2 border-b border-gray-100">
                                                    <span className="font-medium">Regular Discount {transaction.discount_percentage ? `(${transaction.discount_percentage}%)` : ''}:</span>
                                                    <span className="font-semibold">-₱{(transaction.discount_amount || 0).toLocaleString()}</span>
                                                </div>
                                            )}

                                            {calculateSeniorDiscount() > 0 && (
                                                <div className="flex justify-between text-red-600 py-2 border-b border-gray-100">
                                                    <span className="font-medium">Senior Citizen Discount (20%):</span>
                                                    <span className="font-semibold">-₱{calculateSeniorDiscount().toLocaleString()}</span>
                                                </div>
                                            )}

                                            <div className="border-t border-gray-300 pt-4">
                                                <div className="flex justify-between text-lg font-bold text-blue-600">
                                                    <span>Total Amount:</span>
                                                    <span>₱{(calculateNetAmount() || 0).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Transaction Dates */}
                                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                            <Calendar className="h-6 w-6 text-blue-600" />
                                            Transaction Dates
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                                <span className="font-medium text-gray-600">Transaction Date:</span>
                                                <span className="text-gray-900">{safeFormatDate(transaction.transaction_date)}</span>
                                            </div>
                                            {transaction.due_date && (
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="font-medium text-gray-600">Due Date:</span>
                                                    <span className="text-gray-900">{safeFormatDate(transaction.due_date)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                                <span className="font-medium text-gray-600">Created:</span>
                                                <span className="text-gray-900">{safeFormatDate(transaction.created_at)}</span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="font-medium text-gray-600">Created By:</span>
                                                <span className="text-gray-900">{transaction.createdBy?.name || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Action Buttons Section */}
                        <div className="border-t border-gray-200 bg-gray-50 px-6 py-6 mt-6">
                            <div className="flex justify-end gap-3">
                                <Button 
                                    variant="outline"
                                    onClick={onClose}
                                    className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Close
                                </Button>
                                {transaction.status === 'pending' && (
                                    <Button 
                                        onClick={() => handleMarkAsPaid(transaction.id)}
                                        disabled={isMarkingAsPaid}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 disabled:opacity-50"
                                    >
                                        {isMarkingAsPaid ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Mark as Paid
                                            </>
                                        )}
                                    </Button>
                                )}
                                <Button 
                                    onClick={() => handleEdit(transaction.id)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                                <Button 
                                    onClick={() => handlePrintReceipt(transaction.id)}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2"
                                >
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print Receipt
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <div className="bg-red-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <p className="text-red-600 text-lg font-medium">Transaction not found</p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

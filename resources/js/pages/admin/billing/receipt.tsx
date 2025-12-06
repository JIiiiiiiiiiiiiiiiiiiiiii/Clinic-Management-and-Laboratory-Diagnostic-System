import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { safeFormatDate, safeFormatTime } from '@/utils/dateTime';
import { 
    ArrowLeft, 
    Printer,
    Download,
    Receipt,
    Calendar,
    User,
    CreditCard,
    DollarSign,
    FileText
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
    notes_display?: string;
    transaction_date: string;
    due_date: string | null;
    created_at: string;
    consultation_amount?: number | null;
    lab_amount?: number | null;
    follow_up_amount?: number | null;
    total_visits?: number | null;
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
    { title: 'Transaction', href: '/admin/billing/transactions' },
    { title: 'Receipt', href: '/admin/billing/receipt' },
];

export default function BillingReceipt({ 
    transaction 
}: { 
    transaction: BillingTransaction;
}) {
    // Debug logging
    console.log('Transaction data:', transaction);
    console.log('Items:', transaction.items);
    console.log('Items with prices:', transaction.items.map(item => ({
        name: item.item_name,
        unit_price: item.unit_price,
        total_price: item.total_price,
        unit_price_type: typeof item.unit_price,
        total_price_type: typeof item.total_price
    })));

    const handlePrint = () => {
        window.print();
    };

    const calculateSubtotal = () => {
        // Calculate subtotal from items (before discounts)
        if (transaction.items && Array.isArray(transaction.items) && transaction.items.length > 0) {
            return transaction.items.reduce((sum: number, item: any) => {
                const price = typeof item.total_price === 'string' 
                    ? parseFloat(item.total_price) 
                    : (typeof item.total_price === 'number' ? item.total_price : 0);
                return sum + (isNaN(price) ? 0 : price);
            }, 0);
        }
        // Fallback to total_amount if items not available
        return typeof transaction.total_amount === 'string' ? parseFloat(transaction.total_amount) : transaction.total_amount || 0;
    };

    const calculateDiscount = () => {
        // Method 1: Use discount_amount if available (check for existence, not truthiness)
        let discountAmount = 0;
        if (transaction.discount_amount !== undefined && transaction.discount_amount !== null) {
            discountAmount = typeof transaction.discount_amount === 'string' 
                ? parseFloat(transaction.discount_amount) 
                : (typeof transaction.discount_amount === 'number' ? transaction.discount_amount : 0);
            if (isNaN(discountAmount)) discountAmount = 0;
        }
        
        // Method 2: Calculate from discount_percentage if no direct amount
        if (discountAmount === 0 && transaction.discount_percentage && transaction.discount_percentage > 0) {
            discountAmount = (calculateSubtotal() * transaction.discount_percentage) / 100;
        }
        
        // Method 3: Calculate from difference if discount not saved (fallback for old transactions)
        // Only use this if we haven't found a discount yet
        if (discountAmount === 0) {
            const subtotal = calculateSubtotal();
            const seniorDiscount = calculateSeniorDiscount();
            // Get the stored amount (before our calculation fix)
            const storedAmount = transaction.amount || transaction.total_amount || 0;
            const parsedStored = typeof storedAmount === 'string' ? parseFloat(storedAmount) : (typeof storedAmount === 'number' ? storedAmount : 0);
            const calculatedDiscount = subtotal - seniorDiscount - parsedStored;
            
            console.log('Receipt - Discount calculation fallback:', {
                subtotal,
                seniorDiscount,
                storedAmount: parsedStored,
                calculatedDiscount,
                transaction_discount_amount: transaction.discount_amount,
                transaction_discount_percentage: transaction.discount_percentage,
                transaction_amount: transaction.amount,
                transaction_total_amount: transaction.total_amount
            });
            
            // Only use calculated discount if it's positive and makes sense
            if (calculatedDiscount > 0.01 && parsedStored < subtotal) {
                discountAmount = calculatedDiscount;
            }
        }
        
        console.log('Receipt - Final discount amount:', discountAmount, {
            from_discount_amount: transaction.discount_amount,
            from_percentage: transaction.discount_percentage,
            subtotal: calculateSubtotal(),
            stored_amount: transaction.amount || transaction.total_amount || 0
        });
        
        return discountAmount;
    };

    const calculateSeniorDiscount = () => {
        const seniorDiscountAmount = typeof transaction.senior_discount_amount === 'string' ? parseFloat(transaction.senior_discount_amount) : transaction.senior_discount_amount;
        return isNaN(seniorDiscountAmount) ? 0 : seniorDiscountAmount;
    };

    const calculateTotalDiscount = () => {
        return calculateDiscount() + calculateSeniorDiscount();
    };

    const calculateNetAmount = () => {
        if (!transaction) return 0;
        // Calculate net amount from subtotal minus all discounts
        // Calculate discount inline to avoid circular dependency
        const subtotal = calculateSubtotal();
        const regularDiscount = (() => {
            let discount = 0;
            if (transaction.discount_amount !== undefined && transaction.discount_amount !== null) {
                discount = typeof transaction.discount_amount === 'string' 
                    ? parseFloat(transaction.discount_amount) 
                    : (typeof transaction.discount_amount === 'number' ? transaction.discount_amount : 0);
                if (isNaN(discount)) discount = 0;
            } else if (transaction.discount_percentage && transaction.discount_percentage > 0) {
                discount = (subtotal * transaction.discount_percentage) / 100;
            }
            return discount;
        })();
        const seniorDiscount = calculateSeniorDiscount();
        const calculatedNet = subtotal - regularDiscount - seniorDiscount;
        
        // Use calculated net if it differs from stored amount (for data integrity)
        // Otherwise use stored amount
        const storedAmount = transaction.amount || transaction.total_amount || 0;
        const parsedStored = typeof storedAmount === 'string' ? parseFloat(storedAmount) : (typeof storedAmount === 'number' ? storedAmount : 0);
        
        // If calculated net differs significantly from stored, use calculated (more accurate)
        if (Math.abs(calculatedNet - parsedStored) > 0.01) {
            console.log('Receipt - Net amount mismatch - using calculated:', {
                calculated: calculatedNet,
                stored: parsedStored,
                difference: Math.abs(calculatedNet - parsedStored)
            });
            return isNaN(calculatedNet) ? 0 : calculatedNet;
        }
        
        return isNaN(parsedStored) ? 0 : parsedStored;
    };

    const getPaymentMethodLabel = (method: string) => {
        const methods = {
            cash: 'Cash',
            card: 'Credit/Debit Card',
            bank_transfer: 'Bank Transfer',
            check: 'Check',
            hmo: 'HMO/Health Card'
        };
        return methods[method as keyof typeof methods] || method;
    };

    const getStatusLabel = (status: string) => {
        const statuses = {
            draft: 'Draft',
            pending: 'Pending',
            paid: 'Paid',
            cancelled: 'Cancelled',
            refunded: 'Refunded'
        };
        return statuses[status as keyof typeof statuses] || status;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Receipt - ${transaction.transaction_id}`} />
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
                            <Heading title="Transaction Receipt" description={`Receipt for ${transaction.transaction_id}`} icon={Receipt} />
                        </div>
                        <div className="flex items-center gap-4">
                            <Button onClick={handlePrint} className="h-12">
                                <Printer className="mr-2 h-5 w-5" />
                                Print Receipt
                            </Button>
                            <Button variant="outline" className="h-12">
                                <Download className="mr-2 h-5 w-5" />
                                Download PDF
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Receipt Content */}
                <div className="max-w-4xl mx-auto">
                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm print:shadow-none">
                        <CardContent className="p-0">
                            {/* Receipt Header */}
                            <div className="bg-gray-50 p-8 text-center border-b border-gray-200">
                                <div className="mb-4">
                                    <h1 className="text-3xl font-bold text-gray-900">St. James Clinic</h1>
                                    <p className="text-gray-600 mt-2">Laboratory & Diagnostic Center</p>
                                    <p className="text-sm text-gray-500">123 Medical Street, Health City, Philippines</p>
                                    <p className="text-sm text-gray-500">Tel: (02) 123-4567 | Email: info@stjamesclinic.com</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg inline-block">
                                    <h2 className="text-2xl font-bold text-gray-900">OFFICIAL RECEIPT</h2>
                                    <p className="text-gray-600">Transaction ID: {transaction.transaction_id}</p>
                                </div>
                            </div>

                            {/* Receipt Body */}
                            <div className="p-8">
                                {/* Transaction Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Patient Information
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            {transaction.patient ? (
                                                <>
                                                    <div><span className="font-medium">Name:</span> {transaction.patient.last_name}, {transaction.patient.first_name}</div>
                                                    <div><span className="font-medium">Patient No:</span> {transaction.patient.patient_no}</div>
                                                    <div><span className="font-medium">Address:</span> {transaction.patient.present_address}</div>
                                                    <div><span className="font-medium">Contact:</span> {transaction.patient.mobile_no}</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div><span className="font-medium">Name:</span> N/A</div>
                                                    <div><span className="font-medium">Patient No:</span> N/A</div>
                                                    <div><span className="font-medium">Address:</span> N/A</div>
                                                    <div><span className="font-medium">Contact:</span> N/A</div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Transaction Details
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div><span className="font-medium">Date:</span> {safeFormatDate(transaction.transaction_date)}</div>
                                            <div><span className="font-medium">Time:</span> {safeFormatTime(transaction.transaction_date)}</div>
                                            {transaction.doctor && (
                                                <div><span className="font-medium">Doctor:</span> {transaction.doctor.name}</div>
                                            )}
                                            <div><span className="font-medium">Status:</span> {getStatusLabel(transaction.status)}</div>
                                            {transaction.due_date && (
                                                <div><span className="font-medium">Due Date:</span> {safeFormatDate(transaction.due_date)}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Payment Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="font-medium">Payment Method:</span> {getPaymentMethodLabel(transaction.payment_method)}</div>
                                        {transaction.payment_reference && (
                                            <div><span className="font-medium">Reference:</span> {transaction.payment_reference}</div>
                                        )}
                                        {transaction.hmo_provider && (
                                            <div><span className="font-medium">HMO Provider:</span> {transaction.hmo_provider}</div>
                                        )}
                                        {transaction.hmo_reference_number && (
                                            <div><span className="font-medium">HMO Reference Number:</span> {transaction.hmo_reference_number}</div>
                                        )}
                                        {transaction.is_senior_citizen && (
                                            <div><span className="font-medium">Senior Citizen:</span> Yes (20% discount applied)</div>
                                        )}
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Itemized Services
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse border border-gray-300">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Item</th>
                                                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Description</th>
                                                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">Qty</th>
                                                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">Unit Price</th>
                                                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transaction.items.map((item, index) => (
                                                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        <td className="border border-gray-300 px-4 py-3 font-medium">{item.item_name}</td>
                                                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">{item.item_description}</td>
                                                        <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                                                        <td className="border border-gray-300 px-4 py-3 text-right">₱{Number(item.unit_price).toLocaleString()}</td>
                                                        <td className="border border-gray-300 px-4 py-3 text-right font-semibold">₱{Number(item.total_price).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="flex justify-end">
                                    <div className="w-full max-w-md">
                                        <div className="space-y-3">
                                            {/* Services Applied - Computed from transaction items */}
                                            {(() => {
                                                if (!transaction.items || !Array.isArray(transaction.items) || transaction.items.length === 0) {
                                                    return null;
                                                }
                                                
                                                // Group items by type and calculate totals
                                                const serviceTotals: Record<string, number> = {};
                                                
                                                transaction.items.forEach((item: any) => {
                                                    const itemType = item.item_type || 'other';
                                                    const totalPrice = typeof item.total_price === 'string' 
                                                        ? parseFloat(item.total_price) 
                                                        : (typeof item.total_price === 'number' ? item.total_price : 0);
                                                    
                                                    if (!isNaN(totalPrice) && totalPrice > 0) {
                                                        serviceTotals[itemType] = (serviceTotals[itemType] || 0) + totalPrice;
                                                    }
                                                });
                                                
                                                // Map item types to display labels
                                                const typeLabels: Record<string, string> = {
                                                    'consultation': 'Consultation',
                                                    'laboratory': 'Laboratory Test',
                                                    'medicine': 'Medicine',
                                                    'procedure': 'Procedure',
                                                    'other': 'Other Services'
                                                };
                                                
                                                // Sort by common order: consultation, laboratory, then others
                                                const orderedTypes = ['consultation', 'laboratory', 'medicine', 'procedure', 'other'];
                                                const sortedServices = orderedTypes
                                                    .filter(type => serviceTotals[type] > 0)
                                                    .map(type => ({
                                                        type,
                                                        label: typeLabels[type] || type,
                                                        total: serviceTotals[type]
                                                    }));
                                                
                                                if (sortedServices.length === 0) return null;
                                                
                                                return (
                                                    <div className="space-y-2 pb-3 border-b border-gray-300">
                                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Services Applied:</h4>
                                                        {sortedServices.map((service) => (
                                                            <div key={service.type} className="flex justify-between text-sm">
                                                                <span className="text-gray-600">{service.label}:</span>
                                                                <span className="font-medium text-gray-900">₱{service.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                            
                                            <div className="flex justify-between text-lg">
                                                <span className="font-medium">Subtotal:</span>
                                                <span className="font-semibold">₱{calculateSubtotal().toLocaleString()}</span>
                                            </div>
                                            
                                            {(() => {
                                                const discount = calculateDiscount();
                                                // CRITICAL: Also check discount_amount directly from transaction
                                                const directDiscount = transaction.discount_amount !== undefined && transaction.discount_amount !== null
                                                    ? (typeof transaction.discount_amount === 'string' ? parseFloat(transaction.discount_amount) : transaction.discount_amount)
                                                    : 0;
                                                
                                                // Use the larger of calculated or direct discount
                                                const finalDiscount = Math.max(discount, directDiscount);
                                                
                                                return finalDiscount > 0.01 ? (
                                                    <div className="flex justify-between text-lg text-red-600">
                                                        <span className="font-medium">
                                                            Regular Discount {transaction.discount_percentage ? `(${transaction.discount_percentage}%)` : ''}:
                                                        </span>
                                                        <span className="font-semibold">-₱{finalDiscount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                    </div>
                                                ) : null;
                                            })()}

                                            {calculateSeniorDiscount() > 0 && (
                                                <div className="flex justify-between text-lg text-red-600">
                                                    <span className="font-medium">
                                                        Senior Citizen Discount (20%):
                                                    </span>
                                                    <span className="font-semibold">-₱{calculateSeniorDiscount().toLocaleString()}</span>
                                                </div>
                                            )}

                                            <div className="border-t border-gray-300 pt-3">
                                                <div className="flex justify-between text-xl font-bold">
                                                    <span>Total Amount:</span>
                                                    <span>₱{calculateNetAmount().toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                {transaction.description && (
                                    <div className="mt-8">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                                        <p className="text-gray-700">{transaction.description}</p>
                                    </div>
                                )}

                                {/* Notes */}
                                {(transaction.notes_display || transaction.notes) && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                                        <p className="text-gray-700">{transaction.notes_display || transaction.notes}</p>
                                    </div>
                                )}
                            </div>

                            {/* Receipt Footer */}
                            <div className="bg-gray-50 p-8 text-center border-t border-gray-200">
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600">Thank you for choosing St. James Clinic!</p>
                                    <p className="text-sm text-gray-500 mt-2">This is an official receipt. Please keep this for your records.</p>
                                </div>
                                <div className="text-xs text-gray-500">
                                    <p>Generated on: {new Date().toLocaleString()}</p>
                                    <p>Generated by: {transaction.createdBy?.name || 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <style>{`
                @media print {
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }
                    
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
        </AppLayout>
    );
}


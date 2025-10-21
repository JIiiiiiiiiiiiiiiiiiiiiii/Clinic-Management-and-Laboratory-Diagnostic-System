import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
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
    discount_amount: number;
    discount_percentage: number | null;
    hmo_provider: string | null;
    hmo_reference: string | null;
    payment_method: 'cash' | 'card' | 'bank_transfer' | 'check' | 'hmo';
    payment_reference: string | null;
    status: 'draft' | 'pending' | 'paid' | 'cancelled' | 'refunded';
    description: string | null;
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
    { title: 'Receipt', href: '/admin/billing/receipt' },
];

export default function BillingReceipt({ 
    transaction 
}: { 
    transaction: BillingTransaction;
}) {
    const handlePrint = () => {
        window.print();
    };

    const calculateSubtotal = () => {
        return transaction.items.reduce((sum, item) => sum + item.total_price, 0);
    };

    const calculateDiscount = () => {
        if (transaction.discount_percentage) {
            return (calculateSubtotal() * transaction.discount_percentage) / 100;
        }
        return transaction.discount_amount;
    };

    const calculateNetAmount = () => {
        return calculateSubtotal() - calculateDiscount();
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
                                            <div><span className="font-medium">Date:</span> {new Date(transaction.transaction_date).toLocaleDateString()}</div>
                                            <div><span className="font-medium">Time:</span> {new Date(transaction.transaction_date).toLocaleTimeString()}</div>
                                            {transaction.doctor && (
                                                <div><span className="font-medium">Doctor:</span> {transaction.doctor.name}</div>
                                            )}
                                            <div><span className="font-medium">Status:</span> {getStatusLabel(transaction.status)}</div>
                                            {transaction.due_date && (
                                                <div><span className="font-medium">Due Date:</span> {new Date(transaction.due_date).toLocaleDateString()}</div>
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
                                        {transaction.hmo_reference && (
                                            <div><span className="font-medium">HMO Reference:</span> {transaction.hmo_reference}</div>
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
                                                        <td className="border border-gray-300 px-4 py-3 text-right">₱{item.unit_price.toLocaleString()}</td>
                                                        <td className="border border-gray-300 px-4 py-3 text-right font-semibold">₱{item.total_price.toLocaleString()}</td>
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
                                            <div className="flex justify-between text-lg">
                                                <span className="font-medium">Subtotal:</span>
                                                <span className="font-semibold">₱{calculateSubtotal().toLocaleString()}</span>
                                            </div>
                                            
                                            {calculateDiscount() > 0 && (
                                                <div className="flex justify-between text-lg text-red-600">
                                                    <span className="font-medium">
                                                        Discount {transaction.discount_percentage ? `(${transaction.discount_percentage}%)` : ''}:
                                                    </span>
                                                    <span className="font-semibold">-₱{calculateDiscount().toLocaleString()}</span>
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
                                {transaction.notes && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                                        <p className="text-gray-700">{transaction.notes}</p>
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

            <style jsx>{`
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


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
    FileText,
    Calendar,
    DollarSign
} from 'lucide-react';

type Expense = {
    id: number;
    expense_category: string;
    expense_name: string;
    description: string | null;
    amount: number;
    expense_date: string;
    payment_method: string;
    payment_reference: string | null;
    vendor_name: string | null;
    vendor_contact: string | null;
    receipt_number: string | null;
    status: string;
    notes: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Expenses', href: '/admin/billing/expenses' },
    { title: 'Edit Expense', href: '/admin/billing/expense-edit' },
];

export default function ExpenseEdit({ 
    expense 
}: { 
    expense: Expense;
}) {
    const { data, setData, put, processing, errors } = useForm({
        expense_category: expense.expense_category,
        expense_name: expense.expense_name,
        description: expense.description || '',
        amount: expense.amount,
        expense_date: expense.expense_date,
        payment_method: expense.payment_method,
        payment_reference: expense.payment_reference || '',
        vendor_name: expense.vendor_name || '',
        vendor_contact: expense.vendor_contact || '',
        receipt_number: expense.receipt_number || '',
        status: expense.status,
        notes: expense.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/billing/expenses/${expense.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Expense" />
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
                            <Heading title="Edit Expense" description="Update expense details" icon={FileText} />
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                <FileText className="h-5 w-5 text-black" />
                                Expense Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="expense_category" className="text-sm font-medium text-gray-700">
                                            Expense Category *
                                        </Label>
                                        <Select
                                            value={data.expense_category}
                                            onValueChange={(value) => setData('expense_category', value)}
                                        >
                                            <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="office_supplies">Office Supplies</SelectItem>
                                                <SelectItem value="medical_supplies">Medical Supplies</SelectItem>
                                                <SelectItem value="equipment">Equipment</SelectItem>
                                                <SelectItem value="utilities">Utilities</SelectItem>
                                                <SelectItem value="rent">Rent</SelectItem>
                                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                                <SelectItem value="marketing">Marketing</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.expense_category && <p className="text-sm text-red-600">{errors.expense_category}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="expense_name" className="text-sm font-medium text-gray-700">
                                            Expense Name *
                                        </Label>
                                        <Input
                                            id="expense_name"
                                            value={data.expense_name}
                                            onChange={(e) => setData('expense_name', e.target.value)}
                                            placeholder="Enter expense name"
                                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                        />
                                        {errors.expense_name && <p className="text-sm text-red-600">{errors.expense_name}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Enter expense description"
                                        className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                        rows={3}
                                    />
                                    {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                                            Amount *
                                        </Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', parseFloat(e.target.value) || 0)}
                                            placeholder="Enter amount"
                                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                        />
                                        {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="expense_date" className="text-sm font-medium text-gray-700">
                                            Expense Date *
                                        </Label>
                                        <Input
                                            id="expense_date"
                                            type="date"
                                            value={data.expense_date}
                                            onChange={(e) => setData('expense_date', e.target.value)}
                                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                        />
                                        {errors.expense_date && <p className="text-sm text-red-600">{errors.expense_date}</p>}
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
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="vendor_name" className="text-sm font-medium text-gray-700">
                                            Vendor Name
                                        </Label>
                                        <Input
                                            id="vendor_name"
                                            value={data.vendor_name}
                                            onChange={(e) => setData('vendor_name', e.target.value)}
                                            placeholder="Enter vendor name"
                                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                        />
                                        {errors.vendor_name && <p className="text-sm text-red-600">{errors.vendor_name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="vendor_contact" className="text-sm font-medium text-gray-700">
                                            Vendor Contact
                                        </Label>
                                        <Input
                                            id="vendor_contact"
                                            value={data.vendor_contact}
                                            onChange={(e) => setData('vendor_contact', e.target.value)}
                                            placeholder="Enter vendor contact"
                                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                        />
                                        {errors.vendor_contact && <p className="text-sm text-red-600">{errors.vendor_contact}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="receipt_number" className="text-sm font-medium text-gray-700">
                                            Receipt Number
                                        </Label>
                                        <Input
                                            id="receipt_number"
                                            value={data.receipt_number}
                                            onChange={(e) => setData('receipt_number', e.target.value)}
                                            placeholder="Enter receipt number"
                                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                        />
                                        {errors.receipt_number && <p className="text-sm text-red-600">{errors.receipt_number}</p>}
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
                                                <SelectItem value="approved">Approved</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                                        Notes
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Enter additional notes"
                                        className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                        rows={4}
                                    />
                                    {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button asChild variant="outline" className="h-12 px-8">
                                        <Link href="/admin/billing/expenses">
                                            Cancel
                                        </Link>
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={processing}
                                        className="h-12 px-8"
                                    >
                                        <Save className="mr-2 h-5 w-5" />
                                        {processing ? 'Updating...' : 'Update Expense'}
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




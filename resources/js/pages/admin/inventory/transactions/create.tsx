import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowLeft, ArrowUp, Save, Users } from 'lucide-react';
import { useEffect, useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Supply Management',
        href: '/admin/inventory',
    },
    {
        title: 'Supply Movements',
        href: '/admin/inventory/transactions',
    },
    {
        title: 'Record Movement',
        href: '/admin/inventory/transactions/create',
    },
];

interface Product {
    id: number;
    name: string;
    code: string;
    unit_of_measure?: string;
    unit_cost: number;
    requires_lot_tracking: boolean;
    requires_expiry_tracking: boolean;
}

interface User {
    id: number;
    name: string;
}

interface CreateTransactionProps {
    products: Product[];
    users: User[];
    type?: string;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function CreateTransaction({ products, users, type = 'out', flash }: CreateTransactionProps) {
    const firstInputRef = useRef<HTMLSelectElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: '',
        type: type,
        subtype: '',
        quantity: '',
        unit_cost: '',
        lot_number: '',
        expiry_date: '',
        date_opened: '',
        notes: '',
        reference_number: '',
        transaction_date: new Date().toISOString().split('T')[0],
        transaction_time: new Date().toTimeString().slice(0, 5),
        usage_location: '',
        usage_purpose: '',
        charged_to: '',
    });

    useEffect(() => {
        if (firstInputRef.current) {
            firstInputRef.current.focus();
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/inventory/transactions', {
            onSuccess: () => {
                reset();
            },
            onError: (errors) => {
                console.error('Form errors:', errors);
                // Focus on first error field
                const firstErrorField = Object.keys(errors)[0];
                if (firstErrorField) {
                    const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
                    if (element) {
                        element.focus();
                    }
                }
            },
        });
    };

    const selectedProduct = products.find((p) => p.id.toString() === data.product_id);

    const getSubtypeOptions = () => {
        switch (data.type) {
            case 'in':
                return [
                    { value: 'received', label: 'Received from Main Hospital' },
                    { value: 'purchase', label: 'Purchase' },
                    { value: 'transfer_in', label: 'Transfer In' },
                    { value: 'adjustment_in', label: 'Adjustment (Increase)' },
                ];
            case 'out':
                return [
                    { value: 'consumed', label: 'Consumed' },
                    { value: 'used', label: 'Used' },
                    { value: 'transfer_out', label: 'Transfer Out' },
                    { value: 'adjustment_out', label: 'Adjustment (Decrease)' },
                    { value: 'rejected', label: 'Rejected/Damaged' },
                ];
            case 'adjustment':
                return [
                    { value: 'adjustment_in', label: 'Stock Increase' },
                    { value: 'adjustment_out', label: 'Stock Decrease' },
                ];
            default:
                return [];
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Transaction" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.visit('/admin/inventory/transactions')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Record Supply Movement</h1>
                            <p className="text-muted-foreground">Record incoming or outgoing supply movement</p>
                        </div>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">{flash.success}</p>
                            </div>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">{flash.error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Transaction Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {data.type === 'in' ? (
                                        <ArrowUp className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <ArrowDown className="h-5 w-5 text-red-500" />
                                    )}
                                    Movement Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="product_id">
                                        Product <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        id="product_id"
                                        name="product_id"
                                        value={data.product_id}
                                        onChange={(e) => setData('product_id', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        ref={firstInputRef}
                                    >
                                        <option value="">Select a product</option>
                                        {products.map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.name} ({product.code})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.product_id && <p className="text-sm text-red-600">{errors.product_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">
                                        Movement Type <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        id="type"
                                        name="type"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="in">Incoming</option>
                                        <option value="out">Outgoing</option>
                                        <option value="adjustment">Adjustment</option>
                                    </select>
                                    {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subtype">
                                        Subtype <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        id="subtype"
                                        name="subtype"
                                        value={data.subtype}
                                        onChange={(e) => setData('subtype', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Select subtype</option>
                                        {getSubtypeOptions().map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.subtype && <p className="text-sm text-red-600">{errors.subtype}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="quantity">
                                        Quantity <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="quantity"
                                            name="quantity"
                                            type="number"
                                            min="1"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', e.target.value)}
                                            className={errors.quantity ? 'border-red-500' : ''}
                                            placeholder="0"
                                        />
                                        {selectedProduct?.unit_of_measure && (
                                            <span className="flex items-center text-sm text-muted-foreground">{selectedProduct.unit_of_measure}</span>
                                        )}
                                    </div>
                                    {errors.quantity && <p className="text-sm text-red-600">{errors.quantity}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unit_cost">Unit Cost (₱)</Label>
                                    <Input
                                        id="unit_cost"
                                        name="unit_cost"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.unit_cost}
                                        onChange={(e) => setData('unit_cost', e.target.value)}
                                        className={errors.unit_cost ? 'border-red-500' : ''}
                                        placeholder={selectedProduct?.unit_cost?.toString() || '0.00'}
                                    />
                                    {errors.unit_cost && <p className="text-sm text-red-600">{errors.unit_cost}</p>}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="transaction_date">
                                            Movement Date <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="transaction_date"
                                            name="transaction_date"
                                            type="date"
                                            value={data.transaction_date}
                                            onChange={(e) => setData('transaction_date', e.target.value)}
                                            className={errors.transaction_date ? 'border-red-500' : ''}
                                        />
                                        {errors.transaction_date && <p className="text-sm text-red-600">{errors.transaction_date}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="transaction_time">Movement Time</Label>
                                        <Input
                                            id="transaction_time"
                                            name="transaction_time"
                                            type="time"
                                            value={data.transaction_time}
                                            onChange={(e) => setData('transaction_time', e.target.value)}
                                            className={errors.transaction_time ? 'border-red-500' : ''}
                                        />
                                        {errors.transaction_time && <p className="text-sm text-red-600">{errors.transaction_time}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Additional Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedProduct?.requires_lot_tracking && (
                                    <div className="space-y-2">
                                        <Label htmlFor="lot_number">Lot Number</Label>
                                        <Input
                                            id="lot_number"
                                            name="lot_number"
                                            type="text"
                                            value={data.lot_number}
                                            onChange={(e) => setData('lot_number', e.target.value)}
                                            className={errors.lot_number ? 'border-red-500' : ''}
                                            placeholder="Enter lot number"
                                        />
                                        {errors.lot_number && <p className="text-sm text-red-600">{errors.lot_number}</p>}
                                    </div>
                                )}

                                {selectedProduct?.requires_expiry_tracking && (
                                    <div className="space-y-2">
                                        <Label htmlFor="expiry_date">Expiry Date</Label>
                                        <Input
                                            id="expiry_date"
                                            name="expiry_date"
                                            type="date"
                                            value={data.expiry_date}
                                            onChange={(e) => setData('expiry_date', e.target.value)}
                                            className={errors.expiry_date ? 'border-red-500' : ''}
                                        />
                                        {errors.expiry_date && <p className="text-sm text-red-600">{errors.expiry_date}</p>}
                                    </div>
                                )}

                                {data.type === 'out' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="usage_location">Usage Location</Label>
                                            <Input
                                                id="usage_location"
                                                name="usage_location"
                                                type="text"
                                                value={data.usage_location}
                                                onChange={(e) => setData('usage_location', e.target.value)}
                                                className={errors.usage_location ? 'border-red-500' : ''}
                                                placeholder="e.g., Emergency Department"
                                            />
                                            {errors.usage_location && <p className="text-sm text-red-600">{errors.usage_location}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="usage_purpose">Usage Purpose</Label>
                                            <Input
                                                id="usage_purpose"
                                                name="usage_purpose"
                                                type="text"
                                                value={data.usage_purpose}
                                                onChange={(e) => setData('usage_purpose', e.target.value)}
                                                className={errors.usage_purpose ? 'border-red-500' : ''}
                                                placeholder="e.g., Patient wound dressing"
                                            />
                                            {errors.usage_purpose && <p className="text-sm text-red-600">{errors.usage_purpose}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="charged_to">Charged To</Label>
                                            <select
                                                id="charged_to"
                                                name="charged_to"
                                                value={data.charged_to}
                                                onChange={(e) => setData('charged_to', e.target.value)}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="">Select user</option>
                                                {users.map((user) => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.charged_to && <p className="text-sm text-red-600">{errors.charged_to}</p>}
                                        </div>
                                    </>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="reference_number">Reference Number</Label>
                                    <Input
                                        id="reference_number"
                                        name="reference_number"
                                        type="text"
                                        value={data.reference_number}
                                        onChange={(e) => setData('reference_number', e.target.value)}
                                        className={errors.reference_number ? 'border-red-500' : ''}
                                        placeholder="e.g., PO-2024-001"
                                    />
                                    {errors.reference_number && <p className="text-sm text-red-600">{errors.reference_number}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        name="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className={errors.notes ? 'border-red-500' : ''}
                                        placeholder="Additional notes or comments"
                                        rows={3}
                                    />
                                    {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit('/admin/inventory/transactions')} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Create Transaction
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

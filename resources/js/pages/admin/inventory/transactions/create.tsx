import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CustomDatePicker } from '@/components/ui/date-picker';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowLeft, ArrowUp, Save, Users } from 'lucide-react';
import { useEffect, useRef } from 'react';

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
    available_stock?: number;
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

export default function CreateTransaction({
    products,
    users,
    type = 'out',
    flash,
}: CreateTransactionProps) {
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
                    const element = document.querySelector(
                        `[name="${firstErrorField}"]`,
                    ) as HTMLElement;
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
                            <Heading title="Record Item Movement" description="Record incoming or outgoing item movement" icon={data.type === 'in' ? ArrowUp : ArrowDown} />
                        </div>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="rounded-md bg-gray-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm font-medium text-black">
                                    {flash.success}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="rounded-md bg-gray-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm font-medium text-black">{flash.error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid gap-8 md:grid-cols-2" data-layout="fixed-columns" style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem'}}>
                        {/* Transaction Details */}
                        <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                            <div className="bg-white border-b border-gray-200 text-black">
                                <div className="flex items-center gap-3 p-6">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        {data.type === 'in' ? (
                                            <ArrowUp className="h-8 w-8" />
                                        ) : (
                                            <ArrowDown className="h-8 w-8" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">
                                            Movement Details
                                        </h3>
                                        <p className="text-gray-100 mt-1">
                                            Basic transaction information
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-6 bg-white">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="product_id">
                                            Item <span className="text-black">*</span>
                                        </Label>
                                        <select
                                            id="product_id"
                                            name="product_id"
                                            value={data.product_id}
                                            onChange={(e) => setData('product_id', e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            ref={firstInputRef}
                                        >
                                            <option value="">Select an item</option>
                                            {products.map((product) => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name} ({product.code})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.product_id && (
                                            <p className="text-sm text-black">
                                                {errors.product_id}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="type">
                                            Movement Type <span className="text-black">*</span>
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
                                        {errors.type && (
                                            <p className="text-sm text-black">{errors.type}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subtype">
                                            Subtype <span className="text-black">*</span>
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
                                        {errors.subtype && (
                                            <p className="text-sm text-black">{errors.subtype}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="quantity">
                                            Quantity <span className="text-black">*</span>
                                        </Label>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Input
                                                id="quantity"
                                                name="quantity"
                                                type="number"
                                                min="1"
                                                value={data.quantity}
                                                onChange={(e) =>
                                                    setData('quantity', e.target.value)
                                                }
                                                className={errors.quantity ? 'border-gray-500' : ''}
                                                placeholder="0"
                                            />
                                            {selectedProduct?.unit_of_measure && (
                                                <span className="text-sm text-muted-foreground">
                                                    {selectedProduct.unit_of_measure}
                                                </span>
                                            )}
                                            {selectedProduct && (
                                                <span className="text-xs text-muted-foreground">
                                                    Available:{' '}
                                                    {selectedProduct.available_stock ?? '—'}
                                                </span>
                                            )}
                                        </div>
                                        {errors.quantity && (
                                            <p className="text-sm text-black">
                                                {errors.quantity}
                                            </p>
                                        )}
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
                                            className={errors.unit_cost ? 'border-gray-500' : ''}
                                            placeholder={
                                                selectedProduct?.unit_cost?.toString() || '0.00'
                                            }
                                        />
                                        {errors.unit_cost && (
                                            <p className="text-sm text-black">
                                                {errors.unit_cost}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="transaction_date" className="mb-1 block">
                                            Movement Date{' '}
                                            <span className="text-black">*</span>
                                        </Label>
                                        <CustomDatePicker
                                            value={data.transaction_date}
                                            onChange={(date) => setData('transaction_date', date ? date.toISOString().split('T')[0] : '')}
                                            placeholder="Select transaction date"
                                            variant="responsive"
                                            className={`w-full ${errors.transaction_date ? 'border-gray-500' : ''}`}
                                        />
                                        {errors.transaction_date && (
                                            <p className="text-sm text-black">
                                                {errors.transaction_date}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="transaction_time">Movement Time</Label>
                                        <Input
                                            id="transaction_time"
                                            name="transaction_time"
                                            type="time"
                                            value={data.transaction_time}
                                            onChange={(e) =>
                                                setData('transaction_time', e.target.value)
                                            }
                                            className={
                                                errors.transaction_time ? 'border-gray-500' : ''
                                            }
                                        />
                                        {errors.transaction_time && (
                                            <p className="text-sm text-black">
                                                {errors.transaction_time}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                            <div className="bg-white border-b border-gray-200 text-black">
                                <div className="flex items-center gap-3 p-6">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Users className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">
                                            Additional Information
                                        </h3>
                                        <p className="text-gray-100 mt-1">
                                            Optional details and tracking
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-6 bg-white">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedProduct?.requires_lot_tracking && (
                                        <div className="space-y-2">
                                            <Label htmlFor="lot_number">Lot Number</Label>
                                            <Input
                                                id="lot_number"
                                                name="lot_number"
                                                type="text"
                                                value={data.lot_number}
                                                onChange={(e) =>
                                                    setData('lot_number', e.target.value)
                                                }
                                                className={
                                                    errors.lot_number ? 'border-gray-500' : ''
                                                }
                                                placeholder="Enter lot number"
                                            />
                                            {errors.lot_number && (
                                                <p className="text-sm text-black">
                                                    {errors.lot_number}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {selectedProduct?.requires_expiry_tracking && (
                                        <div>
                                            <Label htmlFor="expiry_date" className="mb-1 block">Expiry Date</Label>
                                            <CustomDatePicker
                                                value={data.expiry_date}
                                                onChange={(date) => setData('expiry_date', date ? date.toISOString().split('T')[0] : '')}
                                                placeholder="Select expiry date"
                                                variant="responsive"
                                                className={`w-full ${errors.expiry_date ? 'border-gray-500' : ''}`}
                                            />
                                            {errors.expiry_date && (
                                                <p className="text-sm text-black">
                                                    {errors.expiry_date}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {data.type === 'out' && (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="usage_location">
                                                    Usage Location
                                                </Label>
                                                <Input
                                                    id="usage_location"
                                                    name="usage_location"
                                                    type="text"
                                                    value={data.usage_location}
                                                    onChange={(e) =>
                                                        setData(
                                                            'usage_location',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={
                                                        errors.usage_location
                                                            ? 'border-gray-500'
                                                            : ''
                                                    }
                                                    placeholder="e.g., Emergency Department"
                                                />
                                                {errors.usage_location && (
                                                    <p className="text-sm text-black">
                                                        {errors.usage_location}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="usage_purpose">
                                                    Usage Purpose
                                                </Label>
                                                <Input
                                                    id="usage_purpose"
                                                    name="usage_purpose"
                                                    type="text"
                                                    value={data.usage_purpose}
                                                    onChange={(e) =>
                                                        setData('usage_purpose', e.target.value)
                                                    }
                                                    className={
                                                        errors.usage_purpose
                                                            ? 'border-gray-500'
                                                            : ''
                                                    }
                                                    placeholder="e.g., Patient wound dressing"
                                                />
                                                {errors.usage_purpose && (
                                                    <p className="text-sm text-black">
                                                        {errors.usage_purpose}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="charged_to">Charged To</Label>
                                                <select
                                                    id="charged_to"
                                                    name="charged_to"
                                                    value={data.charged_to}
                                                    onChange={(e) =>
                                                        setData('charged_to', e.target.value)
                                                    }
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="">Select user</option>
                                                    {users.map((user) => (
                                                        <option key={user.id} value={user.id}>
                                                            {user.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.charged_to && (
                                                    <p className="text-sm text-black">
                                                        {errors.charged_to}
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="reference_number">
                                            Reference Number
                                        </Label>
                                        <Input
                                            id="reference_number"
                                            name="reference_number"
                                            type="text"
                                            value={data.reference_number}
                                            onChange={(e) =>
                                                setData('reference_number', e.target.value)
                                            }
                                            className={
                                                errors.reference_number ? 'border-gray-500' : ''
                                            }
                                            placeholder="e.g., PO-2024-001"
                                        />
                                        {errors.reference_number && (
                                            <p className="text-sm text-black">
                                                {errors.reference_number}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            name="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            className={errors.notes ? 'border-gray-500' : ''}
                                            placeholder="Additional notes or comments"
                                            rows={3}
                                        />
                                        {errors.notes && (
                                            <p className="text-sm text-black">
                                                {errors.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={() => router.visit('/admin/inventory/transactions')} 
                            disabled={processing}
                            className="rounded-xl px-8 py-3 text-lg font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="rounded-xl bg-white border border-gray-300 hover:bg-gray-50 px-8 py-3 text-lg font-semibold text-black shadow-lg transition-all duration-300 hover:shadow-xl"
                        >
                            {processing ? (
                                <>
                                    <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-3 h-5 w-5" />
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Package, Save } from 'lucide-react';
import { useEffect, useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Supply Management',
        href: '/admin/inventory',
    },
    {
        title: 'Items',
        href: '/admin/inventory/products',
    },
    {
        title: 'Edit Item',
        href: '/admin/inventory/products/edit',
    },
];

interface Product {
    id: number;
    name: string;
    code: string;
    description?: string;
    category?: string;
    unit_of_measure?: string;
    unit_cost: number;
    minimum_stock_level: number;
    maximum_stock_level: number;
    requires_lot_tracking: boolean;
    requires_expiry_tracking: boolean;
    is_active: boolean;
}

interface EditProductProps {
    product: Product;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function EditProduct({ product, flash }: EditProductProps) {
    const firstInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        name: product.name,
        code: product.code,
        description: product.description || '',
        category: product.category || '',
        unit_of_measure: product.unit_of_measure || '',
        unit_cost: product.unit_cost.toString(),
        minimum_stock_level: product.minimum_stock_level.toString(),
        maximum_stock_level: product.maximum_stock_level.toString(),
        requires_lot_tracking: product.requires_lot_tracking,
        requires_expiry_tracking: product.requires_expiry_tracking,
        is_active: product.is_active,
    });

    useEffect(() => {
        if (firstInputRef.current) {
            firstInputRef.current.focus();
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/inventory/products/${product.id}`, {
            onSuccess: () => {
                // Success handled by flash message
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Item - ${product.name}`} />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 pb-12">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button 
                                variant="outline" 
                                onClick={() => router.visit('/admin/inventory/products')}
                                className="h-12 w-12"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <Heading title="Edit Item" description="Update item information and settings" icon={Package} />
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
                        {/* Basic Information */}
                        <div className="holographic-card shadow-xl border-0 overflow-hidden rounded-2xl bg-white hover:shadow-2xl transition-all duration-300">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                <div className="flex items-center gap-2 text-xl p-6">
                                    <Package className="h-5 w-5" />
                                    Basic Information
                                </div>
                            </div>
                            <div className="px-6 py-8 space-y-4 bg-gradient-to-br from-blue-50 to-blue-100">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Item Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={errors.name ? 'border-red-500' : ''}
                                        placeholder="Enter item name"
                                        ref={firstInputRef}
                                        autoComplete="off"
                                    />
                                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="code">
                                        Item Code <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        type="text"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        className={errors.code ? 'border-red-500' : ''}
                                        placeholder="Enter item code"
                                        autoComplete="off"
                                    />
                                    {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className={errors.description ? 'border-red-500' : ''}
                                        placeholder="Enter item description"
                                        rows={3}
                                    />
                                    {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Select category</option>
                                        <option value="Medical Supplies">Medical Supplies</option>
                                        <option value="Equipment">Equipment</option>
                                        <option value="Medications">Medications</option>
                                        <option value="Consumables">Consumables</option>
                                        <option value="Personal Protective Equipment">Personal Protective Equipment</option>
                                        <option value="Laboratory Supplies">Laboratory Supplies</option>
                                    </select>
                                    {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unit_of_measure">Unit of Measure</Label>
                                    <select
                                        id="unit_of_measure"
                                        name="unit_of_measure"
                                        value={data.unit_of_measure}
                                        onChange={(e) => setData('unit_of_measure', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Select unit</option>
                                        <option value="pcs">Pieces</option>
                                        <option value="boxes">Boxes</option>
                                        <option value="rolls">Rolls</option>
                                        <option value="bottles">Bottles</option>
                                        <option value="tubes">Tubes</option>
                                        <option value="packs">Packs</option>
                                        <option value="ml">Milliliters (ml)</option>
                                        <option value="l">Liters (L)</option>
                                        <option value="mg">Milligrams (mg)</option>
                                        <option value="g">Grams (g)</option>
                                        <option value="kg">Kilograms (kg)</option>
                                    </select>
                                    {errors.unit_of_measure && <p className="text-sm text-red-600">{errors.unit_of_measure}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Stock */}
                        <div className="holographic-card shadow-xl border-0 overflow-hidden rounded-2xl bg-white hover:shadow-2xl transition-all duration-300">
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                                <div className="flex items-center gap-2 text-xl p-6">
                                    <Package className="h-5 w-5" />
                                    Pricing & Stock Management
                                </div>
                            </div>
                            <div className="px-6 py-8 space-y-4 bg-gradient-to-br from-purple-50 to-purple-100">
                                <div className="space-y-2">
                                    <Label htmlFor="unit_cost">
                                        Unit Cost (₱) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="unit_cost"
                                        name="unit_cost"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.unit_cost}
                                        onChange={(e) => setData('unit_cost', e.target.value)}
                                        className={errors.unit_cost ? 'border-red-500' : ''}
                                        placeholder="0.00"
                                    />
                                    {errors.unit_cost && <p className="text-sm text-red-600">{errors.unit_cost}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="minimum_stock_level">
                                        Minimum Stock Level <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="minimum_stock_level"
                                        name="minimum_stock_level"
                                        type="number"
                                        min="0"
                                        value={data.minimum_stock_level}
                                        onChange={(e) => setData('minimum_stock_level', e.target.value)}
                                        className={errors.minimum_stock_level ? 'border-red-500' : ''}
                                        placeholder="0"
                                    />
                                    {errors.minimum_stock_level && <p className="text-sm text-red-600">{errors.minimum_stock_level}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="maximum_stock_level">
                                        Maximum Stock Level <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="maximum_stock_level"
                                        name="maximum_stock_level"
                                        type="number"
                                        min="0"
                                        value={data.maximum_stock_level}
                                        onChange={(e) => setData('maximum_stock_level', e.target.value)}
                                        className={errors.maximum_stock_level ? 'border-red-500' : ''}
                                        placeholder="0"
                                    />
                                    {errors.maximum_stock_level && <p className="text-sm text-red-600">{errors.maximum_stock_level}</p>}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            id="requires_lot_tracking"
                                            name="requires_lot_tracking"
                                            type="checkbox"
                                            checked={data.requires_lot_tracking}
                                            onChange={(e) => setData('requires_lot_tracking', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor="requires_lot_tracking">Requires Lot Tracking</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            id="requires_expiry_tracking"
                                            name="requires_expiry_tracking"
                                            type="checkbox"
                                            checked={data.requires_expiry_tracking}
                                            onChange={(e) => setData('requires_expiry_tracking', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor="requires_expiry_tracking">Requires Expiry Tracking</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            id="is_active"
                                            name="is_active"
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor="is_active">Active</Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => router.visit('/admin/inventory/products')} 
                            disabled={processing}
                            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
                        >
                            <ArrowLeft className="mr-3 h-6 w-6" />
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
                        >
                            {processing ? (
                                <>
                                    <div className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-3 h-6 w-6" />
                                    Update Item
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

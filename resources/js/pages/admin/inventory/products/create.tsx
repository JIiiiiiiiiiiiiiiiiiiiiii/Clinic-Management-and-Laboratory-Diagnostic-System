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
        title: 'Create Item',
        href: '/admin/inventory/products/create',
    },
];

interface CreateProductProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function CreateProduct({ flash }: CreateProductProps) {
    const firstInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        code: '',
        description: '',
        category: '',
        unit_of_measure: '',
        unit_cost: '',
        minimum_stock_level: '',
        maximum_stock_level: '',
        requires_lot_tracking: false,
        requires_expiry_tracking: false,
    });

    useEffect(() => {
        if (firstInputRef.current) {
            firstInputRef.current.focus();
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/inventory/products', {
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

    const generateCode = () => {
        const name = data.name.trim();
        if (name) {
            const code = name.toUpperCase().replace(/\s+/g, '').substring(0, 8);
            setData('code', code + '-' + Math.random().toString(36).substr(2, 3).toUpperCase());
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Item" />
            <div className="min-h-screen bg-white p-6 pb-12">
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
                            <Heading title="Create New Item" description="Add a new product to the inventory" icon={Package} />
                        </div>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="rounded-md bg-gray-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm font-medium text-black">{flash.success}</p>
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
                        {/* Basic Information */}
                        <div className="holographic-card overflow-hidden rounded-lg border-0 bg-white shadow-lg">
                            <div className="bg-white border-b border-gray-200 text-black">
                                <div className="flex items-center gap-3 p-6">
                                    <div className="rounded-lg bg-white/20 p-2">
                                        <Package className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">
                                            Basic Information
                                        </h3>
                                        <p className="mt-1 text-gray-100">
                                            Essential product details
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white px-6 py-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            Item Name <span className="text-black">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className={errors.name ? 'border-gray-500' : ''}
                                            placeholder="Enter product name"
                                            ref={firstInputRef}
                                            autoComplete="off"
                                        />
                                        {errors.name && <p className="text-sm text-black">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="code">
                                            Item Code <span className="text-black">*</span>
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="code"
                                                name="code"
                                                type="text"
                                                value={data.code}
                                                onChange={(e) => setData('code', e.target.value)}
                                                className={errors.code ? 'border-gray-500' : ''}
                                                placeholder="Enter product code"
                                                autoComplete="off"
                                            />
                                            <Button type="button" variant="outline" onClick={generateCode}>
                                                Generate
                                            </Button>
                                        </div>
                                        {errors.code && <p className="text-sm text-black">{errors.code}</p>}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className={errors.description ? 'border-gray-500' : ''}
                                            placeholder="Enter product description"
                                            rows={3}
                                        />
                                        {errors.description && <p className="text-sm text-black">{errors.description}</p>}
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
                                        {errors.category && <p className="text-sm text-black">{errors.category}</p>}
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
                                        {errors.unit_of_measure && <p className="text-sm text-black">{errors.unit_of_measure}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Stock */}
                        <div className="holographic-card overflow-hidden rounded-lg border-0 bg-white shadow-lg">
                            <div className="bg-white border-b border-gray-200 text-black">
                                <div className="flex items-center gap-3 p-6">
                                    <div className="rounded-lg bg-white/20 p-2">
                                        <Package className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">
                                            Pricing & Stock Management
                                        </h3>
                                        <p className="mt-1 text-gray-100">
                                            Cost and inventory settings
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white px-6 py-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="unit_cost">
                                            Unit Cost (₱) <span className="text-black">*</span>
                                        </Label>
                                        <Input
                                            id="unit_cost"
                                            name="unit_cost"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.unit_cost}
                                            onChange={(e) => setData('unit_cost', e.target.value)}
                                            className={errors.unit_cost ? 'border-gray-500' : ''}
                                            placeholder="0.00"
                                        />
                                        {errors.unit_cost && <p className="text-sm text-black">{errors.unit_cost}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="minimum_stock_level">
                                            Minimum Stock Level <span className="text-black">*</span>
                                        </Label>
                                        <Input
                                            id="minimum_stock_level"
                                            name="minimum_stock_level"
                                            type="number"
                                            min="0"
                                            value={data.minimum_stock_level}
                                            onChange={(e) => setData('minimum_stock_level', e.target.value)}
                                            className={errors.minimum_stock_level ? 'border-gray-500' : ''}
                                            placeholder="0"
                                        />
                                        {errors.minimum_stock_level && <p className="text-sm text-black">{errors.minimum_stock_level}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="maximum_stock_level">
                                            Maximum Stock Level <span className="text-black">*</span>
                                        </Label>
                                        <Input
                                            id="maximum_stock_level"
                                            name="maximum_stock_level"
                                            type="number"
                                            min="0"
                                            value={data.maximum_stock_level}
                                            onChange={(e) => setData('maximum_stock_level', e.target.value)}
                                            className={errors.maximum_stock_level ? 'border-gray-500' : ''}
                                            placeholder="0"
                                        />
                                        {errors.maximum_stock_level && <p className="text-sm text-black">{errors.maximum_stock_level}</p>}
                                    </div>

                                    <div className="space-y-4 md:col-span-2">
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
                            className="rounded-xl px-8 py-3 text-lg font-semibold"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
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
                                    Create Item
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

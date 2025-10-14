import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PatientInfoCard } from '@/components/patient/PatientPageLayout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { 
    Package, 
    Save,
    ArrowLeft,
    AlertCircle
} from 'lucide-react';
import { useState } from 'react';

type InventoryItem = {
    id: number;
    item_name: string;
    item_code: string;
    category: string;
    unit: string;
    assigned_to: string;
    stock: number;
    consumed: number;
    rejected: number;
    status: string;
    low_stock_alert: number;
    created_at: string;
    updated_at: string;
};

interface InventoryEditProps {
    item: InventoryItem;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Management',
        href: '/admin/inventory',
    },
    {
        title: 'Edit Item',
        href: '/admin/inventory/edit',
    },
];

export default function InventoryEdit({
    item,
}: InventoryEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        item_name: item.item_name,
        item_code: item.item_code,
        category: item.category,
        unit: item.unit,
        assigned_to: item.assigned_to,
        low_stock_alert: item.low_stock_alert,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        put(`/admin/inventory/${item.id}`, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    const categories = [
        'Medical Supplies',
        'Laboratory Equipment',
        'Pharmaceuticals',
        'Surgical Instruments',
        'Diagnostic Tools',
        'Personal Protective Equipment',
        'Cleaning Supplies',
        'Office Supplies',
        'Other'
    ];

    const units = [
        'pieces',
        'boxes',
        'bottles',
        'tubes',
        'vials',
        'syringes',
        'gloves',
        'masks',
        'liters',
        'grams',
        'kilograms',
        'milliliters'
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${item.item_name}`} />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Edit Inventory Item</h1>
                                <p className="text-sm text-black mt-1">Update item information and settings</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={() => router.visit('/admin/inventory')}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="w-full">
                    <PatientInfoCard
                        title="Item Information"
                        icon={<Package className="h-5 w-5 text-black" />}
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Item Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="item_name" className="text-sm font-medium text-gray-700">
                                        Item Name *
                                    </Label>
                                    <Input
                                        id="item_name"
                                        type="text"
                                        value={data.item_name}
                                        onChange={(e) => setData('item_name', e.target.value)}
                                        placeholder="Enter item name"
                                        className="h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                        required
                                    />
                                    {errors.item_name && (
                                        <div className="flex items-center gap-2 text-red-600 text-sm">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.item_name}
                                        </div>
                                    )}
                                </div>

                                {/* Item Code */}
                                <div className="space-y-2">
                                    <Label htmlFor="item_code" className="text-sm font-medium text-gray-700">
                                        Item Code *
                                    </Label>
                                    <Input
                                        id="item_code"
                                        type="text"
                                        value={data.item_code}
                                        onChange={(e) => setData('item_code', e.target.value)}
                                        placeholder="Enter unique item code"
                                        className="h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                        required
                                    />
                                    {errors.item_code && (
                                        <div className="flex items-center gap-2 text-red-600 text-sm">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.item_code}
                                        </div>
                                    )}
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                                        Category *
                                    </Label>
                                    <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                        <SelectTrigger className="h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category && (
                                        <div className="flex items-center gap-2 text-red-600 text-sm">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.category}
                                        </div>
                                    )}
                                </div>

                                {/* Unit */}
                                <div className="space-y-2">
                                    <Label htmlFor="unit" className="text-sm font-medium text-gray-700">
                                        Unit of Measurement *
                                    </Label>
                                    <Select value={data.unit} onValueChange={(value) => setData('unit', value)}>
                                        <SelectTrigger className="h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                            <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {units.map((unit) => (
                                                <SelectItem key={unit} value={unit}>
                                                    {unit}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.unit && (
                                        <div className="flex items-center gap-2 text-red-600 text-sm">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.unit}
                                        </div>
                                    )}
                                </div>

                                {/* Assigned To */}
                                <div className="space-y-2">
                                    <Label htmlFor="assigned_to" className="text-sm font-medium text-gray-700">
                                        Assigned To *
                                    </Label>
                                    <Select value={data.assigned_to} onValueChange={(value) => setData('assigned_to', value)}>
                                        <SelectTrigger className="h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Doctor & Nurse">Doctor & Nurse</SelectItem>
                                            <SelectItem value="Med Tech">Med Tech</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.assigned_to && (
                                        <div className="flex items-center gap-2 text-red-600 text-sm">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.assigned_to}
                                        </div>
                                    )}
                                </div>

                                {/* Low Stock Alert */}
                                <div className="space-y-2">
                                    <Label htmlFor="low_stock_alert" className="text-sm font-medium text-gray-700">
                                        Low Stock Alert Level
                                    </Label>
                                    <Input
                                        id="low_stock_alert"
                                        type="number"
                                        min="0"
                                        value={data.low_stock_alert}
                                        onChange={(e) => setData('low_stock_alert', parseInt(e.target.value) || 0)}
                                        placeholder="Enter low stock alert level"
                                        className="h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                    />
                                    {errors.low_stock_alert && (
                                        <div className="flex items-center gap-2 text-red-600 text-sm">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.low_stock_alert}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Current Stock Information (Read-only) */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Stock Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Current Stock</label>
                                        <p className="text-lg font-semibold text-gray-900">{item.stock} {item.unit}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Consumed</label>
                                        <p className="text-lg font-semibold text-gray-900">{item.consumed} {item.unit}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Rejected</label>
                                        <p className="text-lg font-semibold text-gray-900">{item.rejected} {item.unit}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    Note: Stock quantities are managed through movements. Use the "Record Movement" button to update stock levels.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                    className="px-6 py-2"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing || isSubmitting}
                                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white"
                                >
                                    {processing || isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Updating...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Save className="h-4 w-4" />
                                            Update Item
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </PatientInfoCard>
                </div>
            </div>
        </AppLayout>
    );
}


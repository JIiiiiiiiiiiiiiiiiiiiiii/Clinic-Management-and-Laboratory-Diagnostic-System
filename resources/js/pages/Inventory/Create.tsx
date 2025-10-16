import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Management',
        href: '/admin/inventory',
    },
    {
        title: 'Add New Item',
        href: '/admin/inventory/create',
    },
];

export default function InventoryCreate() {
    const { data, setData, post, processing, errors } = useForm({
        item_name: '',
        item_code: '',
        category: '',
        unit: '',
        assigned_to: '',
        stock: 0,
        low_stock_alert: 10,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        post('/admin/inventory', {
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
            <Head title="Add New Inventory Item" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Add New Inventory Item</h1>
                                <p className="text-sm text-black mt-1">Create a new item in the inventory system</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={() => window.history.back()}
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

                                {/* Initial Stock */}
                                <div className="space-y-2">
                                    <Label htmlFor="stock" className="text-sm font-medium text-gray-700">
                                        Initial Stock *
                                    </Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        min="0"
                                        value={data.stock}
                                        onChange={(e) => setData('stock', parseInt(e.target.value) || 0)}
                                        placeholder="Enter initial stock quantity"
                                        className="h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                        required
                                    />
                                    {errors.stock && (
                                        <div className="flex items-center gap-2 text-red-600 text-sm">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.stock}
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
                                            Creating...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Save className="h-4 w-4" />
                                            Create Item
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

import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Save, Edit } from 'lucide-react';

interface InventoryItem {
    id: number;
    item_name: string;
    item_code: string;
    category: string;
    unit: string;
    assigned_to: string;
    stock: number;
    low_stock_alert: number;
    consumed: number;
    rejected: number;
    status: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    item: InventoryItem;
}

const InventoryEdit: React.FC<Props> = ({ item }) => {
    const { data, setData, put, processing, errors } = useForm({
        item_name: item.item_name,
        item_code: item.item_code,
        category: item.category,
        unit: item.unit,
        assigned_to: item.assigned_to,
        low_stock_alert: item.low_stock_alert,
    });

    const categories = [
        'Medical Supplies',
        'Diagnostic Kit',
        'Laboratory Supplies',
        'Surgical Instruments',
        'Personal Protective Equipment',
        'Medications',
        'Cleaning Supplies',
        'Office Supplies'
    ];

    const units = [
        'bottle',
        'box',
        'pack',
        'piece',
        'liter',
        'gram',
        'ml',
        'set',
        'roll',
        'sheet'
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/inventory/${item.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Edit ${item.item_name}`} />
            
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="@container/main flex flex-1 flex-col gap-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Edit className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Edit Inventory Item</h1>
                                <p className="text-sm text-gray-600 mt-1">Update the details for {item.item_name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => window.history.back()}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                        </div>
                    </div>

                    {/* Form */}
                    <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">Product Information</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">Update the details below to modify this inventory item</p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Item Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="item_name">Product Name *</Label>
                                        <Input
                                            id="item_name"
                                            type="text"
                                            value={data.item_name}
                                            onChange={(e) => setData('item_name', e.target.value)}
                                            placeholder="e.g. Alcohol 70%, Surgical Gloves, Blood Collection Tubes"
                                            className={errors.item_name ? 'border-red-500' : ''}
                                        />
                                        <p className="text-xs text-gray-500">Enter the full name of the medical product or supply</p>
                                        {errors.item_name && (
                                            <p className="text-sm text-red-600">{errors.item_name}</p>
                                        )}
                                    </div>

                                    {/* Item Code */}
                                    <div className="space-y-2">
                                        <Label htmlFor="item_code">Product Code *</Label>
                                        <Input
                                            id="item_code"
                                            type="text"
                                            value={data.item_code}
                                            onChange={(e) => setData('item_code', e.target.value)}
                                            placeholder="e.g. ALCOHOL-001, GLOVES-002, TUBES-003"
                                            className={errors.item_code ? 'border-red-500' : ''}
                                        />
                                        <p className="text-xs text-gray-500">Unique identifier for tracking and reference</p>
                                        {errors.item_code && (
                                            <p className="text-sm text-red-600">{errors.item_code}</p>
                                        )}
                                    </div>

                                    {/* Category */}
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category *</Label>
                                        <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                            <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500">Choose the appropriate category for this item</p>
                                        {errors.category && (
                                            <p className="text-sm text-red-600">{errors.category}</p>
                                        )}
                                    </div>

                                    {/* Unit of Measure */}
                                    <div className="space-y-2">
                                        <Label htmlFor="unit">Unit of Measure *</Label>
                                        <Select value={data.unit} onValueChange={(value) => setData('unit', value)}>
                                            <SelectTrigger className={errors.unit ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select a unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {units.map((unit) => (
                                                    <SelectItem key={unit} value={unit}>
                                                        {unit}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500">How this item is measured and counted</p>
                                        {errors.unit && (
                                            <p className="text-sm text-red-600">{errors.unit}</p>
                                        )}
                                    </div>

                                    {/* Department Assignment */}
                                    <div className="space-y-2">
                                        <Label>Department Assignment *</Label>
                                        <RadioGroup
                                            value={data.assigned_to}
                                            onValueChange={(value) => setData('assigned_to', value)}
                                            className="flex gap-6"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Doctor & Nurse" id="doctor-nurse" />
                                                <Label htmlFor="doctor-nurse" className="text-sm font-medium">
                                                    Doctor & Nurse
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Med Tech" id="medtech" />
                                                <Label htmlFor="medtech" className="text-sm font-medium">
                                                    Med Tech
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                        <p className="text-xs text-gray-500">Which department will primarily use this item</p>
                                        {errors.assigned_to && (
                                            <p className="text-sm text-red-600">{errors.assigned_to}</p>
                                        )}
                                    </div>

                                    {/* Low Stock Alert */}
                                    <div className="space-y-2">
                                        <Label htmlFor="low_stock_alert">Low Stock Threshold</Label>
                                        <Input
                                            id="low_stock_alert"
                                            type="number"
                                            min="0"
                                            value={data.low_stock_alert}
                                            onChange={(e) => setData('low_stock_alert', parseInt(e.target.value) || 0)}
                                            className={errors.low_stock_alert ? 'border-red-500' : ''}
                                        />
                                        <p className="text-xs text-gray-500">
                                            System will alert when stock falls below this quantity
                                        </p>
                                        {errors.low_stock_alert && (
                                            <p className="text-sm text-red-600">{errors.low_stock_alert}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Current Stock Display (Read-only) */}
                                <div className="bg-gray-50 p-4 rounded-lg border">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Current Stock</h4>
                                            <p className="text-sm text-gray-600">Stock levels cannot be modified here. Use the movement system to add or remove stock.</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-900">{item.stock} {item.unit}</div>
                                            <div className="text-sm text-gray-500">Available</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex justify-end gap-3 pt-6 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="flex items-center gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        {processing ? 'Updating...' : 'Update Item'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default InventoryEdit;

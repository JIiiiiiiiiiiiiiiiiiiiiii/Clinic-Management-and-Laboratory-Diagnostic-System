import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Save, Plus } from 'lucide-react';

const CreateProduct: React.FC = () => {
    const { data, setData, post, processing, errors } = useForm({
        item_name: '',
        item_code: '',
        category: '',
        unit: '',
        assigned_to: '',
        stock: 0,
        low_stock_alert: 10,
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
        post('/admin/inventory');
    };

    return (
        <AppLayout>
            <Head title="Create Product" />
            
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="@container/main flex flex-1 flex-col gap-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Plus className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Add New Inventory Item</h1>
                                <p className="text-sm text-gray-600 mt-1">Create a new product entry in the clinic inventory system</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => window.history.back()}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Inventory
                            </Button>
                        </div>
                    </div>

                    {/* Form */}
                    <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">Product Information</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">Fill in the details below to add a new item to your inventory</p>
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
                                    <Select
                                        value={data.category}
                                        onValueChange={(value) => setData('category', value)}
                                    >
                                        <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
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
                                        <p className="text-sm text-red-600">{errors.category}</p>
                                    )}
                                </div>

                                {/* Unit of Measure */}
                                <div className="space-y-2">
                                    <Label htmlFor="unit">Unit of Measure *</Label>
                                    <Select
                                        value={data.unit}
                                        onValueChange={(value) => setData('unit', value)}
                                    >
                                        <SelectTrigger className={errors.unit ? 'border-red-500' : ''}>
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
                                        <p className="text-sm text-red-600">{errors.unit}</p>
                                    )}
                                </div>

                                {/* Assign To */}
                                <div className="space-y-2">
                                    <Label>Department Assignment *</Label>
                                    <RadioGroup
                                        value={data.assigned_to}
                                        onValueChange={(value) => setData('assigned_to', value)}
                                        className="flex gap-6"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Doctor & Nurse" id="doctor-nurse" />
                                            <Label htmlFor="doctor-nurse">Doctor & Nurse</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Med Tech" id="med-tech" />
                                            <Label htmlFor="med-tech">Medical Technology</Label>
                                        </div>
                                    </RadioGroup>
                                    <p className="text-xs text-gray-500">Select which department will primarily use this item</p>
                                    {errors.assigned_to && (
                                        <p className="text-sm text-red-600">{errors.assigned_to}</p>
                                    )}
                                </div>

                                {/* Initial Stock */}
                                <div className="space-y-2">
                                    <Label htmlFor="stock">Initial Stock Quantity *</Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        min="0"
                                        value={data.stock}
                                        onChange={(e) => setData('stock', parseInt(e.target.value) || 0)}
                                        className={errors.stock ? 'border-red-500' : ''}
                                    />
                                    <p className="text-xs text-gray-500">Enter the current available quantity</p>
                                    {errors.stock && (
                                        <p className="text-sm text-red-600">{errors.stock}</p>
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
                                        onChange={(e) => setData('low_stock_alert', parseInt(e.target.value) || 10)}
                                    />
                                    <p className="text-xs text-gray-500">
                                        System will alert when stock falls below this quantity
                                    </p>
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
                                    {processing ? 'Creating Item...' : 'Create Inventory Item'}
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

export default CreateProduct;

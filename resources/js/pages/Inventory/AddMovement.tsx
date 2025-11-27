import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PatientInfoCard } from '@/components/patient/PatientPageLayout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Package, 
    ArrowLeft,
    ArrowUpDown,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    AlertTriangle,
    Users,
    FlaskConical,
    Save,
    X
} from 'lucide-react';
import { useState } from 'react';

type InventoryItem = {
    id: number;
    item_name: string;
    item_code: string;
    category: string;
    unit: string;
    stock: number;
    consumed: number;
    rejected: number;
    status: string;
    low_stock_alert: number;
    department: 'Doctor & Nurse' | 'Med Tech';
};

interface AddMovementProps {
    item: InventoryItem;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Management',
        href: '/admin/inventory',
    },
    {
        title: 'Supply Items',
        href: '/admin/inventory/supply-items',
    },
    {
        title: 'Add Movement',
        href: '#',
    },
];

export default function AddMovement({ item }: AddMovementProps) {
    const [formData, setFormData] = useState({
        movement_type: '',
        quantity: '',
        date: new Date().toISOString().split('T')[0],
        handled_by: '',
        reason: '',
        expiry_date: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => {
            const newData = {
                ...prev,
                [field]: value
            };
            // Clear expiry_date when switching to OUT
            if (field === 'movement_type' && value === 'OUT') {
                newData.expiry_date = '';
            }
            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            await router.post(`/admin/inventory/${item.id}/movement`, {
                movement_type: formData.movement_type,
                quantity: parseInt(formData.quantity),
                remarks: formData.reason,
                expiry_date: formData.expiry_date || null,
            });
        } catch (error) {
            console.error('Error submitting movement:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getDepartmentIcon = (department: string) => {
        if (department === 'Doctor & Nurse') {
            return <Users className="h-4 w-4" />;
        } else if (department === 'Med Tech') {
            return <FlaskConical className="h-4 w-4" />;
        }
        return <Package className="h-4 w-4" />;
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'low stock':
            case 'out of stock':
                return 'text-red-600';
            case 'in stock':
                return 'text-green-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Add Movement - ${item.item_name}`} />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Add Inventory Movement</h1>
                                <p className="text-sm text-black mt-1">Record stock movement for {item.item_name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={() => router.visit('/admin/inventory/supply-items')}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Supply Items
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="w-full">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Item Information */}
                            <div className="lg:col-span-1">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            Item Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Item Name</Label>
                                            <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                                                <p className="text-lg font-semibold text-gray-900">{item.item_name}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Item Code</Label>
                                            <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                                                <p className="text-lg font-semibold text-gray-900">{item.item_code}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Category</Label>
                                            <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                                                <p className="text-lg font-semibold text-gray-900">{item.category}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Department</Label>
                                            <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                                                <div className="flex items-center gap-2">
                                                    {getDepartmentIcon(item.department)}
                                                    <span className="text-lg font-semibold text-gray-900">{item.department}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Current Stock Overview */}
                                <Card className="mt-6">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            Current Stock Overview
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">Current Stock:</span>
                                            <span className="text-lg font-bold text-gray-900">{item.stock} {item.unit}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">Total Consumed:</span>
                                            <span className="text-lg font-semibold text-gray-900">{item.consumed} {item.unit}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">Total Rejected:</span>
                                            <span className="text-lg font-semibold text-gray-900">{item.rejected} {item.unit}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">Low Stock Threshold:</span>
                                            <span className="text-lg font-semibold text-gray-900">{item.low_stock_alert} {item.unit}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">Status:</span>
                                            <span className={`text-lg font-semibold ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - Movement Details */}
                            <div className="lg:col-span-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ArrowUpDown className="h-5 w-5" />
                                            Movement Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="movement_type" className="text-sm font-medium text-gray-600">
                                                    Movement Type *
                                                </Label>
                                                <Select 
                                                    value={formData.movement_type} 
                                                    onValueChange={(value) => handleInputChange('movement_type', value)}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select movement type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="IN">
                                                            <div className="flex items-center gap-2">
                                                                <TrendingUp className="h-4 w-4 text-green-600" />
                                                                IN (stock added)
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="OUT">
                                                            <div className="flex items-center gap-2">
                                                                <TrendingDown className="h-4 w-4 text-red-600" />
                                                                OUT (stock used/removed)
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="quantity" className="text-sm font-medium text-gray-600">
                                                    Quantity *
                                                </Label>
                                                <Input
                                                    id="quantity"
                                                    type="number"
                                                    min="1"
                                                    value={formData.quantity}
                                                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                                                    className="mt-1"
                                                    placeholder="Enter quantity"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="unit" className="text-sm font-medium text-gray-600">
                                                    Unit
                                                </Label>
                                                <Input
                                                    id="unit"
                                                    value={item.unit}
                                                    className="mt-1 bg-gray-50"
                                                    readOnly
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="date" className="text-sm font-medium text-gray-600">
                                                    Date *
                                                </Label>
                                                <Input
                                                    id="date"
                                                    type="date"
                                                    value={formData.date}
                                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                                    className="mt-1"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Expiry Date - Only for IN movements */}
                                        {formData.movement_type === 'IN' && (
                                            <div>
                                                <Label htmlFor="expiry_date" className="text-sm font-semibold text-gray-600">
                                                    Expiry Date (Optional)
                                                </Label>
                                                <Input
                                                    id="expiry_date"
                                                    type="date"
                                                    value={formData.expiry_date || ''}
                                                    onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                                                    className="mt-1"
                                                    placeholder="Select expiry date for this batch"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Set expiration date for this batch of items to track when to restock
                                                </p>
                                            </div>
                                        )}

                                        <div>
                                            <Label htmlFor="handled_by" className="text-sm font-medium text-gray-600">
                                                Handled By *
                                            </Label>
                                            <Input
                                                id="handled_by"
                                                value={formData.handled_by}
                                                onChange={(e) => handleInputChange('handled_by', e.target.value)}
                                                className="mt-1"
                                                placeholder="Enter staff name"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="reason" className="text-sm font-medium text-gray-600">
                                                Reason / Notes
                                            </Label>
                                            <Textarea
                                                id="reason"
                                                value={formData.reason}
                                                onChange={(e) => handleInputChange('reason', e.target.value)}
                                                className="mt-1"
                                                placeholder="Enter reason for movement (e.g., 'Used during minor surgery', 'New delivery from supplier')"
                                                rows={3}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-4 mt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit('/admin/inventory/supply-items')}
                                        className="flex items-center gap-2"
                                    >
                                        <X className="h-4 w-4" />
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || !formData.movement_type || !formData.quantity || !formData.handled_by}
                                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        {isSubmitting ? 'Saving...' : 'Save Movement'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

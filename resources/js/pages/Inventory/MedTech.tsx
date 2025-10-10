import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    TestTube, 
    Search, 
    Filter,
    Plus,
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    XCircle,
    Minus,
    CheckCircle,
    X
} from 'lucide-react';

interface InventoryItem {
    id: number;
    item_name: string;
    item_code: string;
    category: string;
    unit: string;
    stock: number;
    status: string;
    consumed: number;
    rejected: number;
    created_at: string;
}

interface Stats {
    totalItems: number;
    lowStock: number;
    consumedItems: number;
    rejectedItems: number;
}

interface Props {
    items: InventoryItem[];
    stats: Stats;
}

const MedTechSupplies: React.FC<Props> = ({ items, stats }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [actionType, setActionType] = useState<'consume' | 'reject' | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [localStats, setLocalStats] = useState(stats);
    const [isProcessing, setIsProcessing] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        movement_type: 'OUT',
        quantity: 1,
        remarks: '',
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'In Stock':
                return 'bg-green-100 text-green-800';
            case 'Low Stock':
                return 'bg-yellow-100 text-yellow-800';
            case 'Out of Stock':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.item_code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleAction = (item: InventoryItem, type: 'consume' | 'reject') => {
        console.log('Action triggered:', { item, type });
        setSelectedItem(item);
        setActionType(type);
        // Force reset form data
        reset();
        setData('quantity', 1);
        setData('remarks', '');
        console.log('Form data after setting:', { quantity: data.quantity, remarks: data.remarks });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', { selectedItem, actionType, data });
        
        if (selectedItem && actionType && !isProcessing) {
            const finalRemarks = `${actionType === 'consume' ? 'Consumed' : 'Rejected'}: ${data.remarks || 'No additional notes'}`;
            
            try {
                setIsProcessing(true);
                
                // 1️⃣ Optimistic update (frontend updates immediately)
                if (actionType === 'reject') {
                    setLocalStats(prevStats => ({
                        ...prevStats,
                        rejectedItems: prevStats.rejectedItems + data.quantity
                    }));
                } else {
                    setLocalStats(prevStats => ({
                        ...prevStats,
                        consumedItems: prevStats.consumedItems + data.quantity
                    }));
                }
                
                // 2️⃣ Send rejection/consumption request to backend using Inertia
                router.post(`/admin/inventory/${selectedItem.id}/movement`, {
                    movement_type: 'OUT',
                    quantity: data.quantity,
                    remarks: finalRemarks,
                    is_rejection: actionType === 'reject'
                }, {
                    onSuccess: (page) => {
                        // 3️⃣ Update with real backend data if response includes updated stats
                        if (page.props.updatedStats) {
                            setLocalStats(page.props.updatedStats);
                        }
                        
                        // Close dialog and reset form
                        setIsDialogOpen(false);
                        reset();
                        setSelectedItem(null);
                        setActionType(null);
                        setData('quantity', 1);
                        setData('remarks', '');
                        
                        console.log('Movement successful');
                    },
                    onError: (errors) => {
                        throw new Error('Movement failed: ' + JSON.stringify(errors));
                    }
                });
                
            } catch (error) {
                console.error('Movement error:', error);
                
                // 4️⃣ Rollback optimistic update if error
                if (actionType === 'reject') {
                    setLocalStats(prevStats => ({
                        ...prevStats,
                        rejectedItems: prevStats.rejectedItems - data.quantity
                    }));
                } else {
                    setLocalStats(prevStats => ({
                        ...prevStats,
                        consumedItems: prevStats.consumedItems - data.quantity
                    }));
                }
                
                // Show error message (you can add a toast notification here)
                alert('Failed to process movement. Please try again.');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        reset();
        setSelectedItem(null);
        setActionType(null);
        // Force reset form data
        setData('quantity', 1);
        setData('remarks', '');
    };

    const StatCard = ({ title, value, icon: Icon, color, trend }: { 
        title: string; 
        value: number; 
        icon: any; 
        color: string;
        trend?: 'up' | 'down';
    }) => (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${color}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <AppLayout>
            <Head title="Med Tech Clinical Supplies" />
            
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="@container/main flex flex-1 flex-col gap-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <TestTube className="h-8 w-8 text-purple-600" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Medical Technology Supplies</h1>
                                <p className="text-sm text-gray-600 mt-1">Manage laboratory supplies and diagnostic equipment</p>
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


                    {/* Statistics Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Lab Supplies</CardTitle>
                                <TestTube className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{stats.totalItems}</div>
                                <p className="text-xs text-gray-500">Available items</p>
                            </CardContent>
                        </Card>

                        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Low Stock Alerts</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{stats.lowStock}</div>
                                <p className="text-xs text-gray-500">Need restocking</p>
                            </CardContent>
                        </Card>

                        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Items Used</CardTitle>
                                <TrendingDown className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{localStats.consumedItems}</div>
                                <p className="text-xs text-gray-500">Consumed items</p>
                            </CardContent>
                        </Card>

                        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Items Rejected</CardTitle>
                                <XCircle className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{localStats.rejectedItems}</div>
                                <p className="text-xs text-gray-500">Rejected items</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            placeholder="Search by item name or code..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="w-full md:w-48">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="In Stock">In Stock</SelectItem>
                                            <SelectItem value="Low Stock">Low Stock</SelectItem>
                                            <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Stock Movement
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items Table */}
                    <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">Laboratory Supplies Inventory</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">Diagnostic equipment and laboratory supplies</p>
                        </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-medium">Item Name</th>
                                        <th className="text-left p-3 font-medium">Code</th>
                                        <th className="text-left p-3 font-medium">Category</th>
                                        <th className="text-left p-3 font-medium">Stock</th>
                                        <th className="text-left p-3 font-medium">Status</th>
                                        <th className="text-left p-3 font-medium">Consumed</th>
                                        <th className="text-left p-3 font-medium">Rejected</th>
                                        <th className="text-left p-3 font-medium">Created</th>
                                        <th className="text-left p-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.map((item) => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-medium">{item.item_name}</td>
                                            <td className="p-3 text-sm text-gray-600">{item.item_code}</td>
                                            <td className="p-3 text-sm text-gray-600">{item.category}</td>
                                            <td className="p-3">
                                                <span className="font-medium">{item.stock}</span>
                                                <span className="text-gray-500 ml-1">{item.unit}</span>
                                            </td>
                                            <td className="p-3">
                                                <Badge className={getStatusColor(item.status)}>
                                                    {item.status}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-sm text-green-600 font-medium">
                                                {item.consumed}
                                            </td>
                                            <td className="p-3 text-sm text-red-600 font-medium">
                                                {item.rejected}
                                            </td>
                                            <td className="p-3 text-sm text-gray-600">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/admin/inventory/${item.id}`}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        View
                                                    </Link>
                                                    <Link
                                                        href={`/admin/inventory/${item.id}/edit`}
                                                        className="text-green-600 hover:text-green-800 text-sm"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            console.log('Consume button clicked for item:', item);
                                                            handleAction(item, 'consume');
                                                        }}
                                                        className="text-green-600 hover:text-green-800 text-sm flex items-center gap-1 px-2 py-1 border border-green-300 rounded hover:bg-green-50"
                                                        disabled={item.stock <= 0}
                                                    >
                                                        <CheckCircle className="h-3 w-3" />
                                                        Consume
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            console.log('Reject button clicked for item:', item);
                                                            handleAction(item, 'reject');
                                                        }}
                                                        className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                                                        disabled={item.stock <= 0}
                                                    >
                                                        <X className="h-3 w-3" />
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {filteredItems.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No items found matching your criteria.
                                </div>
                            )}
                        </div>
                    </CardContent>
                    </Card>

                    {/* Consume/Reject Dialog */}
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        console.log('Dialog open state changed:', open);
                        setIsDialogOpen(open);
                    }}>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    {actionType === 'consume' ? (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <X className="h-5 w-5 text-red-600" />
                                    )}
                                    {actionType === 'consume' ? 'Consume Item' : 'Reject Item'} - {selectedItem?.item_name}
                                </DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Current Stock Display */}
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">Available Stock:</span>
                                        <span className="font-bold text-lg">
                                            {selectedItem?.stock} {selectedItem?.unit}
                                        </span>
                                    </div>
                                </div>

                                {/* Quantity */}
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantity *</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        max={selectedItem?.stock || 0}
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', parseInt(e.target.value) || 1)}
                                        className={errors.quantity ? 'border-red-500' : ''}
                                    />
                                    <p className="text-sm text-gray-500">
                                        Maximum available: {selectedItem?.stock} {selectedItem?.unit}
                                    </p>
                                    {errors.quantity && (
                                        <p className="text-sm text-red-600">{errors.quantity}</p>
                                    )}
                                </div>

                                {/* Remarks */}
                                <div className="space-y-2">
                                    <Label htmlFor="remarks">Transaction Notes</Label>
                                    <Textarea
                                        id="remarks"
                                        value={data.remarks}
                                        onChange={(e) => setData('remarks', e.target.value)}
                                        placeholder={
                                            actionType === 'consume' 
                                                ? 'e.g. Used for lab testing, Consumed by Med Tech'
                                                : 'e.g. Contaminated sample, Expired reagent'
                                        }
                                        rows={3}
                                    />
                                    <p className="text-xs text-gray-500">Add details about this {actionType} action</p>
                                    {errors.remarks && (
                                        <p className="text-sm text-red-600">{errors.remarks}</p>
                                    )}
                                </div>

                                {/* Preview */}
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="text-sm">
                                        <p className="font-medium text-blue-900">
                                            Stock Update Preview:
                                        </p>
                                        <p className="text-blue-700">
                                            New stock level: {selectedItem ? selectedItem.stock - data.quantity : 0} {selectedItem?.unit}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCloseDialog}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isProcessing}
                                        className={actionType === 'consume' 
                                            ? 'bg-green-600 hover:bg-green-700' 
                                            : 'bg-red-600 hover:bg-red-700'
                                        }
                                    >
                                        {isProcessing ? 'Processing...' : `${actionType === 'consume' ? 'Consume' : 'Reject'} Item`}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
};

export default MedTechSupplies;

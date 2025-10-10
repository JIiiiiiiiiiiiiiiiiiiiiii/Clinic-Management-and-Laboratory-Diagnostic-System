import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    Edit, 
    Package, 
    AlertTriangle, 
    TrendingUp, 
    TrendingDown,
    Calendar,
    User,
    Activity
} from 'lucide-react';

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
    movements?: InventoryMovement[];
}

interface InventoryMovement {
    id: number;
    movement_type: string;
    quantity: number;
    remarks: string;
    created_by: string;
    created_at: string;
}

interface Props {
    item: InventoryItem;
}

const InventoryShow: React.FC<Props> = ({ item }) => {
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

    const getMovementTypeColor = (type: string) => {
        switch (type) {
            case 'IN':
                return 'bg-green-100 text-green-800';
            case 'OUT':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout>
            <Head title={`${item.item_name} - Inventory Details`} />
            
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="@container/main flex flex-1 flex-col gap-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Package className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">{item.item_name}</h1>
                                <p className="text-sm text-gray-600 mt-1">Inventory item details and movement history</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/admin/inventory">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Inventory
                                </Button>
                            </Link>
                            <Link href={`/admin/inventory/${item.id}/edit`}>
                                <Button className="flex items-center gap-2">
                                    <Edit className="h-4 w-4" />
                                    Edit Item
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Item Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Basic Information */}
                        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Product Name</label>
                                    <p className="text-lg font-semibold text-gray-900">{item.item_name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Product Code</label>
                                    <p className="text-lg font-semibold text-gray-900">{item.item_code}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Category</label>
                                    <p className="text-lg font-semibold text-gray-900">{item.category}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Unit of Measure</label>
                                    <p className="text-lg font-semibold text-gray-900">{item.unit}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Assigned To</label>
                                    <p className="text-lg font-semibold text-gray-900">{item.assigned_to}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stock Information */}
                        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">Stock Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Current Stock</span>
                                    <span className="text-2xl font-bold text-gray-900">{item.stock} {item.unit}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Status</span>
                                    <Badge className={getStatusColor(item.status)}>
                                        {item.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Low Stock Alert</span>
                                    <span className="text-lg font-semibold text-gray-900">{item.low_stock_alert} {item.unit}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Items Consumed</span>
                                    <span className="text-lg font-semibold text-green-600">{item.consumed} {item.unit}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Items Rejected</span>
                                    <span className="text-lg font-semibold text-red-600">{item.rejected} {item.unit}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* System Information */}
                        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">System Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Created</label>
                                        <p className="text-sm text-gray-900">{new Date(item.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Last Updated</label>
                                        <p className="text-sm text-gray-900">{new Date(item.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Total Movements</label>
                                        <p className="text-sm text-gray-900">{item.movements?.length || 0} transactions</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Movement History */}
                    {item.movements && item.movements.length > 0 && (
                        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">Movement History</CardTitle>
                                <p className="text-sm text-gray-600 mt-1">Complete transaction history for this item</p>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-3 font-medium text-gray-600">Date</th>
                                                <th className="text-left p-3 font-medium text-gray-600">Type</th>
                                                <th className="text-left p-3 font-medium text-gray-600">Quantity</th>
                                                <th className="text-left p-3 font-medium text-gray-600">Remarks</th>
                                                <th className="text-left p-3 font-medium text-gray-600">Created By</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {item.movements.map((movement) => (
                                                <tr key={movement.id} className="border-b">
                                                    <td className="p-3 text-sm text-gray-600">
                                                        {new Date(movement.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge className={getMovementTypeColor(movement.movement_type)}>
                                                            {movement.movement_type}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 text-sm text-gray-900">
                                                        {movement.quantity} {item.unit}
                                                    </td>
                                                    <td className="p-3 text-sm text-gray-600">
                                                        {movement.remarks || '-'}
                                                    </td>
                                                    <td className="p-3 text-sm text-gray-600">
                                                        {movement.created_by}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default InventoryShow;

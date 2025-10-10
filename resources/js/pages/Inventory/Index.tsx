import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MovementModal from '@/components/Inventory/MovementModal';
import { 
    Package, 
    AlertTriangle, 
    Activity, 
    XCircle,
    Plus,
    Stethoscope,
    TestTube,
    BarChart3
} from 'lucide-react';

interface InventoryItem {
    id: number;
    item_name: string;
    item_code: string;
    category: string;
    unit: string;
    assigned_to: string;
    stock: number;
    status: string;
    created_at: string;
}

interface Stats {
    totalSupplies: number;
    lowStockItems: number;
    totalConsumed: number;
    totalRejected: number;
}

interface Props {
    stats: Stats;
    doctorNurseItems: InventoryItem[];
    medTechItems: InventoryItem[];
}

const InventoryIndex: React.FC<Props> = ({ stats, doctorNurseItems, medTechItems }) => {
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

    // Filter items that are low stock (10 or below)
    const lowStockItems = [...doctorNurseItems, ...medTechItems].filter(item => item.stock <= 10);

    const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) => (
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

    const InventoryTable = ({ title, items, assignedTo }: { title: string; items: InventoryItem[]; assignedTo: string }) => (
        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40">
            <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    {assignedTo === 'Doctor & Nurse' ? <Stethoscope className="h-5 w-5" /> : <TestTube className="h-5 w-5" />}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-2">Item Name</th>
                                <th className="text-left p-2">Code</th>
                                <th className="text-left p-2">Category</th>
                                <th className="text-left p-2">Stock</th>
                                <th className="text-left p-2">Status</th>
                                <th className="text-left p-2">Created</th>
                                <th className="text-left p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="border-b">
                                    <td className="p-2 font-medium">{item.item_name}</td>
                                    <td className="p-2 text-sm text-gray-600">{item.item_code}</td>
                                    <td className="p-2 text-sm text-gray-600">{item.category}</td>
                                    <td className="p-2">{item.stock} {item.unit}</td>
                                    <td className="p-2">
                                        <Badge className={getStatusColor(item.status)}>
                                            {item.status}
                                        </Badge>
                                    </td>
                                    <td className="p-2 text-sm text-gray-600">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-2">
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
                                            <MovementModal
                                                itemId={item.id}
                                                itemName={item.item_name}
                                                currentStock={item.stock}
                                                unit={item.unit}
                                                trigger={
                                                    <button className="text-purple-600 hover:text-purple-800 text-sm">
                                                        In/Out
                                                    </button>
                                                }
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <AppLayout>
            <Head title="Clinic Supplies Inventory" />
            
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="@container/main flex flex-1 flex-col gap-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Package className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Clinic Supplies Inventory</h1>
                                <p className="text-sm text-gray-600 mt-1">Comprehensive inventory management system for medical supplies and equipment</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/admin/inventory/create">
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create Product
                                </Button>
                            </Link>
                            <Link href="/admin/inventory/doctor-nurse">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4" />
                                    Doctor & Nurse Supplies
                                </Button>
                            </Link>
                            <Link href="/admin/inventory/medtech">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <TestTube className="h-4 w-4" />
                                    Med Tech Supplies
                                </Button>
                            </Link>
                            <Link href="/admin/inventory/reports">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4" />
                                    Reports
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Inventory Items</CardTitle>
                                <Package className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{stats.totalSupplies}</div>
                                <p className="text-xs text-gray-500">Available items</p>
                            </CardContent>
                        </Card>

                        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Low Stock Alerts</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{stats.lowStockItems}</div>
                                <p className="text-xs text-gray-500">Need restocking</p>
                            </CardContent>
                        </Card>

                        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Items Consumed</CardTitle>
                                <Activity className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{stats.totalConsumed}</div>
                                <p className="text-xs text-gray-500">Consumed items</p>
                            </CardContent>
                        </Card>

                        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Items Rejected</CardTitle>
                                <XCircle className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{stats.totalRejected}</div>
                                <p className="text-xs text-gray-500">Rejected items</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Low Stock Alert */}
                    {lowStockItems.length > 0 && (
                        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-red-50 border-red-200">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold text-red-800 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    Low Stock Alert
                                </CardTitle>
                                <p className="text-sm text-red-600 mt-1">Items with stock 10 or below that need immediate attention</p>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {lowStockItems.map((item) => (
                                        <div key={item.id} className="bg-white p-4 rounded-lg border border-red-200">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{item.item_name}</h4>
                                                    <p className="text-sm text-gray-600">{item.item_code}</p>
                                                    <p className="text-xs text-gray-500">{item.assigned_to}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-red-600">{item.stock}</div>
                                                    <div className="text-xs text-gray-500">{item.unit}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Tables */}
                    <div className="space-y-6">
                        <InventoryTable
                            title="Doctor & Nurse Clinical Supplies"
                            items={doctorNurseItems}
                            assignedTo="Doctor & Nurse"
                        />
                        
                        <InventoryTable
                            title="Medical Technology Supplies"
                            items={medTechItems}
                            assignedTo="Med Tech"
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default InventoryIndex;

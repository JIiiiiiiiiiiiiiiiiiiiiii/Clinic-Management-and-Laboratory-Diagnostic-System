import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientInfoCard } from '@/components/patient/PatientPageLayout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Package, 
    AlertTriangle, 
    Users,
    Plus,
    Trash2,
    FlaskConical,
    Activity
} from 'lucide-react';

type EnhancedStats = {
    total_items: number;
    low_stock_items: number;
    out_of_stock_items: number;
    total_suppliers: number;
    total_movements_today: number;
};

type RecentMovement = {
    id: number;
    movement_type: string;
    quantity: number;
    remarks: string;
    created_at: string;
    inventory_item: {
        item_name: string;
        item_code: string;
    };
};

type LowStockItem = {
    id: number;
    item_name: string;
    item_code: string;
    stock: number;
    low_stock_alert: number;
    status: string;
    assigned_to: string;
};

interface EnhancedInventoryProps {
    stats: EnhancedStats;
    recentMovements: RecentMovement[];
    lowStockItems: LowStockItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Management',
        href: '/admin/inventory',
    },
    {
        title: 'Enhanced Dashboard',
        href: '/admin/inventory/enhanced',
    },
];

export default function EnhancedInventoryDashboard({
    stats,
    recentMovements = [],
    lowStockItems = [],
}: EnhancedInventoryProps) {
    // Calculate additional stats
    const doctorNurseItems = lowStockItems.filter(item => item.assigned_to === 'Doctor & Nurse').length;
    const medTechItems = lowStockItems.filter(item => item.assigned_to === 'Med Tech').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Enhanced Inventory Management" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Enhanced Inventory Management</h1>
                                <p className="text-sm text-black mt-1">Advanced inventory tracking with real-time analytics</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Package className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-black">{stats.total_items}</div>
                                        <div className="text-black text-sm font-medium">Total Items</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="w-full">
                    <PatientInfoCard
                        title="Enhanced Inventory Overview"
                        icon={<Package className="h-5 w-5 text-black" />}
                    >
                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 mb-6">
                            <Button 
                                onClick={() => router.visit('/admin/inventory/supply-items')}
                                className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl"
                            >
                                <Package className="mr-2 h-4 w-4" />
                                View all Supply Items
                            </Button>
                            <Button 
                                onClick={() => router.visit('/admin/inventory/create')}
                                className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Supply Item
                            </Button>
                        </div>

                        {/* Enhanced Statistics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                            <div 
                                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={(e) => {
                                    e.preventDefault();
                                    console.log('Total Items card clicked');
                                    router.visit('/admin/inventory/supply-items');
                                }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Package className="h-4 w-4 text-black" />
                                    <span className="text-sm font-medium text-gray-800">Total Items</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{stats.total_items}</div>
                            </div>
                            <div 
                                className="bg-orange-50 rounded-lg p-4 border border-orange-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={(e) => {
                                    e.preventDefault();
                                    console.log('Low Stock card clicked');
                                    router.visit('/admin/inventory/supply-items');
                                }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm font-medium text-orange-800">Low Stock</span>
                                </div>
                                <div className="text-2xl font-bold text-orange-900">{stats.low_stock_items}</div>
                                <div className="text-xs text-orange-700 mt-1">Click to view low stock items</div>
                            </div>
                            <div 
                                className="bg-red-50 rounded-lg p-4 border border-red-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={(e) => {
                                    e.preventDefault();
                                    console.log('Out of Stock card clicked');
                                    router.visit('/admin/inventory/supply-items');
                                }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm font-medium text-red-800">Out of Stock</span>
                                </div>
                                <div className="text-2xl font-bold text-red-900">{stats.out_of_stock_items}</div>
                                <div className="text-xs text-red-700 mt-1">Click to view out of stock items</div>
                            </div>
                            <div 
                                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => router.visit('/admin/inventory/supply-items')}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="h-4 w-4 text-black" />
                                    <span className="text-sm font-medium text-gray-800">Consumed</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">6</div>
                            </div>
                            <div 
                                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => router.visit('/admin/inventory/supply-items')}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Trash2 className="h-4 w-4 text-black" />
                                    <span className="text-sm font-medium text-gray-800">Rejected</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">0</div>
                            </div>
                        </div>

                        {/* Category Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-5 w-5 text-blue-600" />
                                        <CardTitle className="text-lg">Doctor & Nurse Items</CardTitle>
                                    </div>
                                    <Badge variant="secondary">{doctorNurseItems}</Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-gray-600 mb-4">Items assigned to Doctor & Nurse</div>
                                    <Button asChild className="w-full">
                                        <Link href="/admin/inventory/doctor-nurse">
                                            View Items
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="flex items-center space-x-2">
                                        <FlaskConical className="h-5 w-5 text-green-600" />
                                        <CardTitle className="text-lg">Med Tech Items</CardTitle>
                                    </div>
                                    <Badge variant="secondary">{medTechItems}</Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-gray-600 mb-4">Items assigned to Med Tech</div>
                                    <Button asChild className="w-full">
                                        <Link href="/admin/inventory/medtech">
                                            View Items
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                    </PatientInfoCard>
                </div>
            </div>
        </AppLayout>
    );
}

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientInfoCard } from '@/components/patient/PatientPageLayout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Package, 
    AlertTriangle, 
    TrendingDown, 
    BarChart3, 
    Users,
    Plus,
    Trash2,
    FlaskConical
} from 'lucide-react';

type InventoryStats = {
    totalSupplies: number;
    lowStockItems: number;
    totalConsumed: number;
    totalRejected: number;
};

type DoctorNurseItem = {
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
};

type MedTechItem = {
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
};

interface InventoryIndexProps {
    stats: InventoryStats;
    doctorNurseItems: DoctorNurseItem[];
    medTechItems: MedTechItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Management',
        href: '/admin/inventory',
    },
];

export default function InventoryIndex({
    stats,
    doctorNurseItems = [],
    medTechItems = [],
}: InventoryIndexProps) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Management" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Inventory Management</h1>
                                <p className="text-sm text-black mt-1">Track and manage clinic items and equipment</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Package className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-black">{stats.totalSupplies}</div>
                                        <div className="text-black text-sm font-medium">Total Items</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="w-full">
                    {/* Action Buttons */}
                    <div className="mb-6 flex gap-4 justify-end">
                        <Button 
                            onClick={() => router.visit('/admin/inventory/supply-items')}
                            className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-sm font-semibold rounded-xl"
                        >
                            <Package className="mr-2 h-4 w-4" />
                            View all Supply Items
                        </Button>
                        <Button 
                            onClick={() => router.visit('/admin/inventory/create')}
                            className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-sm font-semibold rounded-xl"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Supply Item
                        </Button>
                    </div>
                    
                    <PatientInfoCard
                        title="Inventory Overview"
                        icon={<Package className="h-5 w-5 text-black" />}
                        actions={
                            <div className="flex items-center gap-2">
                                <Button 
                                    onClick={() => router.visit('/admin/inventory/create')}
                                    className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Item
                                </Button>
                                <Button 
                                    onClick={() => router.visit('/admin/inventory/reports')}
                                    className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl"
                                >
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Reports
                                </Button>
                            </div>
                        }
                    >
                        {/* Statistics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Package className="h-4 w-4 text-black" />
                                    <span className="text-sm font-medium text-gray-800">Total Items</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{stats.totalSupplies}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-black" />
                                    <span className="text-sm font-medium text-gray-800">Low Stock</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{stats.lowStockItems}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingDown className="h-4 w-4 text-black" />
                                    <span className="text-sm font-medium text-gray-800">Consumed</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{stats.totalConsumed}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Trash2 className="h-4 w-4 text-black" />
                                    <span className="text-sm font-medium text-gray-800">Rejected</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{stats.totalRejected}</div>
                            </div>
                        </div>

                        {/* Quick Navigation */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Doctor & Nurse Items
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900 mb-2">{doctorNurseItems.length}</div>
                                    <p className="text-sm text-gray-600 mb-4">Items assigned to Doctor & Nurse</p>
                                    <Button asChild className="w-full">
                                        <Link href="/admin/inventory/doctor-nurse">
                                            View Items
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FlaskConical className="h-5 w-5" />
                                        Med Tech Items
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900 mb-2">{medTechItems.length}</div>
                                    <p className="text-sm text-gray-600 mb-4">Items assigned to Med Tech</p>
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

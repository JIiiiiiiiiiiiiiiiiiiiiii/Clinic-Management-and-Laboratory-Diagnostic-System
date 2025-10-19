import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientInfoCard } from '@/components/patient/PatientPageLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
    FlaskConical,
    CheckCircle
} from 'lucide-react';
import { useState } from 'react';

type InventoryStats = {
    totalSupplies: number;
    lowStockItems: number;
    outOfStockItems: number;
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
    const [noStockDialogOpen, setNoStockDialogOpen] = useState(false);
    const [clickedDepartment, setClickedDepartment] = useState('');

    // Calculate low stock and out of stock counts for each department
    const doctorNurseLowStock = doctorNurseItems.filter(item => 
        item.status === 'Low Stock'
    ).length;
    const doctorNurseOutOfStock = doctorNurseItems.filter(item => 
        item.status === 'Out of Stock'
    ).length;
    const medTechLowStock = medTechItems.filter(item => 
        item.status === 'Low Stock'
    ).length;
    const medTechOutOfStock = medTechItems.filter(item => 
        item.status === 'Out of Stock'
    ).length;

    const handleDepartmentClick = (department: string) => {
        if (department === 'doctor-nurse') {
            router.visit('/admin/inventory/doctor-nurse');
        } else if (department === 'medtech') {
            router.visit('/admin/inventory/medtech');
        }
    };

    const handleLowStockClick = () => {
        console.log('Low stock clicked!', {
            statsLowStock: stats.lowStockItems,
            doctorNurseLowStock,
            medTechLowStock
        });
        
        if (stats.lowStockItems > 0) {
            if (doctorNurseLowStock > 0 && medTechLowStock > 0) {
                // Both departments have low stock - redirect to supply items page
                console.log('Both departments have low stock, redirecting to supply items');
                router.visit('/admin/inventory/supply-items');
            } else if (doctorNurseLowStock > 0) {
                // Only doctor & nurse has low stock
                console.log('Only doctor & nurse has low stock, redirecting to doctor-nurse');
                router.visit('/admin/inventory/doctor-nurse');
            } else if (medTechLowStock > 0) {
                // Only med tech has low stock
                console.log('Only med tech has low stock, redirecting to medtech');
                router.visit('/admin/inventory/medtech');
            } else {
                // Fallback to supply items page
                console.log('Fallback: redirecting to supply items');
                router.visit('/admin/inventory/supply-items');
            }
        } else {
            console.log('No low stock items found, showing popup...');
            setClickedDepartment('Overall Inventory');
            setNoStockDialogOpen(true);
        }
    };

    const handleOutOfStockClick = () => {
        console.log('Out of stock clicked!', {
            statsOutOfStock: stats.outOfStockItems,
            doctorNurseOutOfStock,
            medTechOutOfStock
        });
        
        if (stats.outOfStockItems > 0) {
            if (doctorNurseOutOfStock > 0 && medTechOutOfStock > 0) {
                // Both departments have out of stock - redirect to supply items page
                console.log('Both departments have out of stock, redirecting to supply items');
                router.visit('/admin/inventory/supply-items');
            } else if (doctorNurseOutOfStock > 0) {
                // Only doctor & nurse has out of stock
                console.log('Only doctor & nurse has out of stock, redirecting to doctor-nurse');
                router.visit('/admin/inventory/doctor-nurse');
            } else if (medTechOutOfStock > 0) {
                // Only med tech has out of stock
                console.log('Only med tech has out of stock, redirecting to medtech');
                router.visit('/admin/inventory/medtech');
            } else {
                // Fallback to supply items page
                console.log('Fallback: redirecting to supply items');
                router.visit('/admin/inventory/supply-items');
            }
        } else {
            console.log('No out of stock items found, showing popup...');
            setClickedDepartment('Overall Inventory');
            setNoStockDialogOpen(true);
        }
    };

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
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Package className="h-4 w-4 text-black" />
                                    <span className="text-sm font-medium text-gray-800">Total Items</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{stats.totalSupplies}</div>
                            </div>
                            <div 
                                className={`rounded-lg p-4 border shadow-sm cursor-pointer hover:shadow-lg transition-all duration-200 ${
                                    stats.lowStockItems > 0 
                                        ? 'bg-orange-500 border-orange-500 hover:bg-orange-600' 
                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}
                                onClick={handleLowStockClick}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className={`h-4 w-4 ${
                                        stats.lowStockItems > 0 ? 'text-white' : 'text-black'
                                    }`} />
                                    <span className={`text-sm font-medium ${
                                        stats.lowStockItems > 0 ? 'text-white' : 'text-gray-800'
                                    }`}>Low Stock</span>
                                </div>
                                <div className={`text-2xl font-bold ${
                                    stats.lowStockItems > 0 ? 'text-white' : 'text-gray-900'
                                }`}>{stats.lowStockItems}</div>
                                {stats.lowStockItems > 0 && (
                                    <div className="text-xs text-white/80 mt-1">
                                        Click to view low stock items
                                    </div>
                                )}
                            </div>
                            <div 
                                className={`rounded-lg p-4 border shadow-sm cursor-pointer hover:shadow-lg transition-all duration-200 ${
                                    stats.outOfStockItems > 0 
                                        ? 'bg-red-500 border-red-500 hover:bg-red-600' 
                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}
                                onClick={handleOutOfStockClick}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className={`h-4 w-4 ${
                                        stats.outOfStockItems > 0 ? 'text-white' : 'text-black'
                                    }`} />
                                    <span className={`text-sm font-medium ${
                                        stats.outOfStockItems > 0 ? 'text-white' : 'text-gray-800'
                                    }`}>Out of Stock</span>
                                </div>
                                <div className={`text-2xl font-bold ${
                                    stats.outOfStockItems > 0 ? 'text-white' : 'text-gray-900'
                                }`}>{stats.outOfStockItems}</div>
                                {stats.outOfStockItems > 0 && (
                                    <div className="text-xs text-white/80 mt-1">
                                        Click to view out of stock items
                                    </div>
                                )}
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
                            <Card 
                                className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handleDepartmentClick('doctor-nurse')}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Doctor & Nurse Items
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900 mb-2">{doctorNurseItems.length}</div>
                                    <p className="text-sm text-gray-600 mb-4">Items assigned to Doctor & Nurse</p>
                                    <Button 
                                        className="w-full"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDepartmentClick('doctor-nurse');
                                        }}
                                    >
                                        View Items
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card 
                                className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handleDepartmentClick('medtech')}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FlaskConical className="h-5 w-5" />
                                        Med Tech Items
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900 mb-2">{medTechItems.length}</div>
                                    <p className="text-sm text-gray-600 mb-4">Items assigned to Med Tech</p>
                                    <Button 
                                        className="w-full"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDepartmentClick('medtech');
                                        }}
                                    >
                                        View Items
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                    </PatientInfoCard>
                </div>
            </div>

            {/* No Low Stock Dialog */}
            <Dialog open={noStockDialogOpen} onOpenChange={setNoStockDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            No Low Stock Items
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-gray-600 mb-4">
                            Great news! There are currently no low stock or out of stock items in the {clickedDepartment === 'Overall Inventory' ? 'entire inventory system' : clickedDepartment + ' department'}. 
                            All inventory levels are within acceptable limits.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setNoStockDialogOpen(false)}
                            >
                                Close
                            </Button>
                            <Button 
                                onClick={() => {
                                    setNoStockDialogOpen(false);
                                    if (clickedDepartment === 'Overall Inventory') {
                                        router.visit('/admin/inventory/supply-items');
                                    } else if (clickedDepartment === 'Doctor & Nurse') {
                                        router.visit('/admin/inventory/doctor-nurse');
                                    } else {
                                        router.visit('/admin/inventory/medtech');
                                    }
                                }}
                            >
                                View All Items
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

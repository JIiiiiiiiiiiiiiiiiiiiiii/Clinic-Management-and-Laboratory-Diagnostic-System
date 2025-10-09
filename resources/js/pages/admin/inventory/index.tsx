import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PatientInfoCard } from '@/components/patient/PatientPageLayout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Package, 
    AlertTriangle, 
    Clock, 
    TrendingDown, 
    CheckCircle, 
    BarChart3, 
    TrendingUp, 
    Users,
    ArrowUp,
    ArrowDown,
    Search,
    Plus,
    Edit,
    Eye,
    Trash2,
    FlaskConical
} from 'lucide-react';
import { useState } from 'react';

type InventoryStats = {
    total_products: number;
    low_stock_products: number;
    expiring_soon: number;
    expired_stock: number;
    total_value: number;
    recent_transactions: number;
};

type PendingApproval = {
    id: number;
    product_name: string;
    quantity: number;
    type: string;
    requested_by: string;
    created_at: string;
};

type RecentTransaction = {
    id: number;
    product_name: string;
    quantity: number;
    type: 'in' | 'out';
    reason: string;
    created_at: string;
};

type LowStockItem = {
    id: number;
    name: string;
    current_stock: number;
    minimum_stock: number;
    unit: string;
};

interface InventoryDashboardProps {
    stats: InventoryStats;
    pendingApprovals: PendingApproval[];
    recentTransactions: RecentTransaction[];
    lowStockItems: LowStockItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Management',
        href: '/admin/inventory',
    },
];

export default function InventoryDashboard({
    stats,
    pendingApprovals = [],
    recentTransactions = [],
    lowStockItems = [],
}: InventoryDashboardProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLowStock = lowStockItems.filter((item) => {
        const search = searchTerm.toLowerCase();
        return item.name.toLowerCase().includes(search);
    });

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
                                        <div className="text-3xl font-bold text-black">{stats.total_products}</div>
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
                        title="Inventory Overview"
                        icon={<Package className="h-5 w-5 text-black" />}
                        actions={
                            <div className="flex items-center gap-2">
                                <Button 
                                    onClick={() => router.visit('/admin/inventory/transactions/create')}
                                    className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl"
                                >
                                    <Package className="mr-2 h-4 w-4" />
                                    Record Movement
                                </Button>
                                <Button 
                                    onClick={() => router.visit('/admin/inventory/products/create')}
                                    className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Item
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
                                    <div className="text-2xl font-bold text-gray-900">{stats.total_products}</div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="h-4 w-4 text-black" />
                                        <span className="text-sm font-medium text-gray-800">Low Stock</span>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{stats.low_stock_products}</div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="h-4 w-4 text-black" />
                                        <span className="text-sm font-medium text-gray-800">Expiring Soon</span>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{stats.expiring_soon}</div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingDown className="h-4 w-4 text-black" />
                                        <span className="text-sm font-medium text-gray-800">Expired</span>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{stats.expired_stock}</div>
                                </div>
                            </div>

                            {/* Low Stock Items Table */}
                            <div className="mb-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search low stock items..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-gray-100">
                                            <TableHead className="font-semibold text-black">
                                                    <div className="flex items-center gap-2">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        Item Name
                                                    </div>
                                                </TableHead>
                                            <TableHead className="font-semibold text-black">Current Stock</TableHead>
                                            <TableHead className="font-semibold text-black">Minimum Stock</TableHead>
                                            <TableHead className="font-semibold text-black">Unit</TableHead>
                                            <TableHead className="font-semibold text-black">Status</TableHead>
                                            <TableHead className="font-semibold text-black">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredLowStock.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8">
                                                        <div className="flex flex-col items-center">
                                                            <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                        <h3 className="mb-2 text-lg font-semibold text-black">{searchTerm ? 'No items found' : 'No low stock items'}</h3>
                                                        <p className="text-black">
                                                                {searchTerm ? 'Try adjusting your search terms' : 'All items are well stocked'}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredLowStock.map((item) => (
                                                    <TableRow key={item.id} className="hover:bg-gray-50">
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1 bg-gray-100 rounded-full">
                                                                    <AlertTriangle className="h-4 w-4 text-black" />
                                                                </div>
                                                                {item.name}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-black">{item.current_stock}</TableCell>
                                                        <TableCell className="text-sm text-black">{item.minimum_stock}</TableCell>
                                                        <TableCell className="text-sm text-black">{item.unit}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="destructive">
                                                                Low Stock
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button asChild size="sm">
                                                                    <Link href={`/admin/inventory/products/${item.id}/edit`}>
                                                                        <Edit className="mr-1 h-3 w-3" />
                                                                        Edit
                                                                    </Link>
                                                                </Button>
                                                                <Button asChild size="sm" variant="outline">
                                                                    <Link href={`/admin/inventory/products/${item.id}`}>
                                                                        <Eye className="mr-1 h-3 w-3" />
                                                                        View
                                                                    </Link>
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                    </PatientInfoCard>
                </div>
            </div>
        </AppLayout>
    );
}
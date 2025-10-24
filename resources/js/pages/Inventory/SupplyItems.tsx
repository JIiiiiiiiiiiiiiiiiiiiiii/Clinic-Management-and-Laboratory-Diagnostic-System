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
    Users,
    Search,
    Plus,
    Edit,
    Eye,
    Trash2,
    ArrowLeft,
    BarChart3,
    TrendingDown,
    CheckCircle,
    FlaskConical,
    ArrowUpDown
} from 'lucide-react';
import { useState } from 'react';

type SupplyItem = {
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

type SupplyStats = {
    totalItems: number;
    lowStock: number;
    outOfStock: number;
    consumedItems: number;
    rejectedItems: number;
};

interface SupplyItemsProps {
    doctorNurseItems: SupplyItem[];
    medTechItems: SupplyItem[];
    stats: SupplyStats;
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
];

export default function SupplyItems({
    doctorNurseItems = [],
    medTechItems = [],
    stats,
}: SupplyItemsProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = (itemId: number, itemName: string) => {
        if (confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
            router.delete(`/admin/inventory/${itemId}`, {
                onSuccess: () => {
                    // Show success message
                    alert('Item deleted successfully!');
                },
                onError: (errors) => {
                    console.error('Error deleting item:', errors);
                    alert('Failed to delete item. Please try again.');
                }
            });
        }
    };

    const filteredDoctorNurse = doctorNurseItems.filter((item) => {
        const search = searchTerm.toLowerCase();
        return item.item_name.toLowerCase().includes(search) || 
               item.item_code.toLowerCase().includes(search) ||
               item.category.toLowerCase().includes(search);
    });

    const filteredMedTech = medTechItems.filter((item) => {
        const search = searchTerm.toLowerCase();
        return item.item_name.toLowerCase().includes(search) || 
               item.item_code.toLowerCase().includes(search) ||
               item.category.toLowerCase().includes(search);
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Supply Items" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Supply Items</h1>
                                <p className="text-sm text-black mt-1">All inventory items across departments</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={() => router.visit('/admin/inventory')}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Inventory
                            </Button>
                            <Button 
                                onClick={() => router.visit('/admin/inventory/create')}
                                className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Item
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="w-full">
                    <PatientInfoCard
                        title="All Supply Items"
                        icon={<Package className="h-5 w-5 text-black" />}
                        actions={
                            <div className="flex items-center gap-2">
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
                                <div className="text-2xl font-bold text-gray-900">{stats.totalItems}</div>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm font-medium text-orange-800">Low Stock</span>
                                </div>
                                <div className="text-2xl font-bold text-orange-900">{stats.lowStock}</div>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4 border border-red-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm font-medium text-red-800">Out of Stock</span>
                                </div>
                                <div className="text-2xl font-bold text-red-900">{stats.outOfStock}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingDown className="h-4 w-4 text-black" />
                                    <span className="text-sm font-medium text-gray-800">Consumed</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{stats.consumedItems}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Trash2 className="h-4 w-4 text-black" />
                                    <span className="text-sm font-medium text-gray-800">Rejected</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{stats.rejectedItems}</div>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="mb-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search items..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                    />
                                </div>
                            </div>
                            
                            {/* Doctor & Nurse Items */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Doctor & Nurse Items
                                </h3>
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
                                            <TableRow className="hover:bg-gray-100">
                                                <TableHead className="font-semibold text-black">Item Name</TableHead>
                                                <TableHead className="font-semibold text-black">Code</TableHead>
                                                <TableHead className="font-semibold text-black">Category</TableHead>
                                                <TableHead className="font-semibold text-black">Stock</TableHead>
                                                <TableHead className="font-semibold text-black">Status</TableHead>
                                                <TableHead className="font-semibold text-black">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredDoctorNurse.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8">
                                                        <div className="flex flex-col items-center">
                                                            <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                            <h3 className="mb-2 text-lg font-semibold text-black">No items found</h3>
                                                            <p className="text-black">Try adjusting your search terms</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredDoctorNurse.map((item) => (
                                                    <TableRow key={item.id} className="hover:bg-gray-50">
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1 bg-gray-100 rounded-full">
                                                                    <Package className="h-4 w-4 text-black" />
                                                                </div>
                                                                {item.item_name}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-black">{item.item_code}</TableCell>
                                                        <TableCell className="text-sm text-black">{item.category}</TableCell>
                                                        <TableCell className="text-sm text-black">{item.stock} {item.unit}</TableCell>
                                                        <TableCell>
                                                            <Badge 
                                                                variant={item.status === 'Out of Stock' ? 'destructive' : item.status === 'Low Stock' ? 'secondary' : 'default'}
                                                                className={item.status === 'Low Stock' ? 'bg-orange-100 text-orange-800 border-orange-200' : ''}
                                                            >
                                                                {item.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button asChild size="sm">
                                                                    <Link href={`/admin/inventory/${item.id}/movement`}>
                                                                        <ArrowUpDown className="mr-1 h-3 w-3" />
                                                                        Add Movement
                                                                    </Link>
                                                                </Button>
                                                                <Button asChild size="sm" variant="outline">
                                                                    <Link href={`/admin/inventory/${item.id}/edit`}>
                                                                        <Edit className="mr-1 h-3 w-3" />
                                                                        Edit
                                                                    </Link>
                                                                </Button>
                                                                <Button asChild size="sm" variant="outline">
                                                                    <Link href={`/admin/inventory/${item.id}`}>
                                                                        <Eye className="mr-1 h-3 w-3" />
                                                                        View
                                                                    </Link>
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="destructive"
                                                                    onClick={() => handleDelete(item.id, item.item_name)}
                                                                    className="hover:bg-red-700"
                                                                >
                                                                    <Trash2 className="mr-1 h-3 w-3" />
                                                                    Delete
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

                            {/* Med Tech Items */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FlaskConical className="h-5 w-5" />
                                    Med Tech Items
                                </h3>
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
                                            <TableRow className="hover:bg-gray-100">
                                                <TableHead className="font-semibold text-black">Item Name</TableHead>
                                                <TableHead className="font-semibold text-black">Code</TableHead>
                                                <TableHead className="font-semibold text-black">Category</TableHead>
                                                <TableHead className="font-semibold text-black">Stock</TableHead>
                                                <TableHead className="font-semibold text-black">Status</TableHead>
                                                <TableHead className="font-semibold text-black">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredMedTech.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8">
                                                        <div className="flex flex-col items-center">
                                                            <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                            <h3 className="mb-2 text-lg font-semibold text-black">No items found</h3>
                                                            <p className="text-black">Try adjusting your search terms</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredMedTech.map((item) => (
                                                    <TableRow key={item.id} className="hover:bg-gray-50">
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1 bg-gray-100 rounded-full">
                                                                    <FlaskConical className="h-4 w-4 text-black" />
                                                                </div>
                                                                {item.item_name}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-black">{item.item_code}</TableCell>
                                                        <TableCell className="text-sm text-black">{item.category}</TableCell>
                                                        <TableCell className="text-sm text-black">{item.stock} {item.unit}</TableCell>
                                                        <TableCell>
                                                            <Badge 
                                                                variant={item.status === 'Out of Stock' ? 'destructive' : item.status === 'Low Stock' ? 'secondary' : 'default'}
                                                                className={item.status === 'Low Stock' ? 'bg-orange-100 text-orange-800 border-orange-200' : ''}
                                                            >
                                                                {item.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button asChild size="sm">
                                                                    <Link href={`/admin/inventory/${item.id}/movement`}>
                                                                        <ArrowUpDown className="mr-1 h-3 w-3" />
                                                                        Add Movement
                                                                    </Link>
                                                                </Button>
                                                                <Button asChild size="sm" variant="outline">
                                                                    <Link href={`/admin/inventory/${item.id}/edit`}>
                                                                        <Edit className="mr-1 h-3 w-3" />
                                                                        Edit
                                                                    </Link>
                                                                </Button>
                                                                <Button asChild size="sm" variant="outline">
                                                                    <Link href={`/admin/inventory/${item.id}`}>
                                                                        <Eye className="mr-1 h-3 w-3" />
                                                                        View
                                                                    </Link>
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="destructive"
                                                                    onClick={() => handleDelete(item.id, item.item_name)}
                                                                    className="hover:bg-red-700"
                                                                >
                                                                    <Trash2 className="mr-1 h-3 w-3" />
                                                                    Delete
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
                        </div>
                    </PatientInfoCard>
                </div>
            </div>
        </AppLayout>
    );
}

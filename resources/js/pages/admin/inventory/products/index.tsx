import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PatientInfoCard } from '@/components/patient/PatientPageLayout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Package, Plus, Search, Trash2, FlaskConical } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory',
        href: '/admin/inventory',
    },
    {
        title: 'Items',
        href: '/admin/inventory/products',
    },
];

interface Product {
    id: number;
    name: string;
    code: string;
    description?: string;
    category?: string;
    unit_of_measure?: string;
    unit_cost: number;
    minimum_stock_level: number;
    maximum_stock_level: number;
    requires_lot_tracking: boolean;
    requires_expiry_tracking: boolean;
    current_stock: number;
    available_stock: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface ProductsIndexProps {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        category?: string;
        status?: string;
    };
}

export default function ProductsIndex({ products, filters }: ProductsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = () => {
        router.get(
            '/admin/inventory/products',
            {
                search: search || undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleDelete = (product: Product) => {
        if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
            router.delete(`/admin/inventory/products/${product.id}`, {
                onSuccess: () => {
                    // Success handled by flash message
                },
                onError: (errors) => {
                    console.error('Delete error:', errors);
                },
            });
        }
    };

    const getStockStatus = (product: Product) => {
        if (product.current_stock <= product.minimum_stock_level) {
            return { status: 'low', color: 'destructive', text: 'Low Stock' };
        } else if (product.current_stock >= product.maximum_stock_level) {
            return { status: 'high', color: 'secondary', text: 'High Stock' };
        }
        return { status: 'normal', color: 'default', text: 'Normal' };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Items" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-bold text-black">Inventory Items</h1>
                                <p className="text-sm text-black mt-1">Manage clinic items and equipment</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Package className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-black">{products.total}</div>
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
                        title="Inventory Items"
                        icon={<Package className="h-5 w-5 text-black" />}
                        actions={
                            <Button asChild className="bg-white border border-gray-300 hover:bg-gray-50 text-black shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl">
                                <Link href="/admin/inventory/products/create">
                                    <Plus className="mr-3 h-6 w-6" />
                                    Add New Item
                                </Link>
                            </Button>
                        }
                    >
                            <div className="mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search items by name or code..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            className="pl-10 h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                        />
                                    </div>
                                    <Button onClick={handleSearch} className="h-12 px-6 bg-white border border-gray-300 hover:bg-gray-50 text-black">
                                        <Search className="mr-2 h-4 w-4" />
                                        Search
                                    </Button>
                                </div>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-gray-100">
                                            <TableHead className="font-semibold text-black">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4" />
                                                    Item Name
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-semibold text-black">Code</TableHead>
                                            <TableHead className="font-semibold text-black">Category</TableHead>
                                            <TableHead className="font-semibold text-black">Stock</TableHead>
                                            <TableHead className="font-semibold text-black">Status</TableHead>
                                            <TableHead className="font-semibold text-black">Created</TableHead>
                                            <TableHead className="font-semibold text-black">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8">
                                                    <div className="flex flex-col items-center">
                                                        <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                        <h3 className="mb-2 text-lg font-semibold text-black">{search ? 'No items found' : 'No inventory items yet'}</h3>
                                                        <p className="text-black">
                                                            {search ? 'Try adjusting your search terms' : 'Create your first inventory item to get started'}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            products.data.map((product) => {
                                                const stockStatus = getStockStatus(product);
                                                return (
                                                    <TableRow key={product.id} className="hover:bg-gray-50">
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1 bg-gray-100 rounded-full">
                                                                    <Package className="h-4 w-4 text-black" />
                                                                </div>
                                                                {product.name}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-black font-mono">{product.code}</TableCell>
                                                        <TableCell className="text-sm text-black">{product.category || 'N/A'}</TableCell>
                                                        <TableCell className="text-sm text-black">{product.current_stock} {product.unit_of_measure}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={stockStatus.color as any}>
                                                                {stockStatus.text}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-black">{new Date(product.created_at).toLocaleDateString()}</TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-3">
                                                                <Button asChild size="sm">
                                                                    <Link href={`/admin/inventory/products/${product.id}/edit`}>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </Link>
                                                                </Button>
                                                                <Button asChild size="sm" variant="outline">
                                                                    <Link href={`/admin/inventory/products/${product.id}`}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View
                                                                    </Link>
                                                                </Button>
                                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(product)}>
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                    </PatientInfoCard>
                </div>
            </div>
        </AppLayout>
    );
}
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Edit, Eye, Package, Plus, Search, Trash2 } from 'lucide-react';
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
    const [category, setCategory] = useState(filters.category || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleSearch = () => {
        router.get(
            '/admin/inventory/products',
            {
                search: search || undefined,
                category: category || undefined,
                status: status || undefined,
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 pb-12">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Heading title="Inventory Items" description="Manage clinic items and equipment" icon={Package} />
                        </div>
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={() => router.visit('/admin/inventory/products/create')}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl"
                            >
                                <Plus className="mr-3 h-5 w-5" />
                                Add Item
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white mb-8">
                    <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                        <div className="flex items-center gap-2 text-xl p-6">
                            <Search className="h-5 w-5" />
                            Search & Filters
                        </div>
                    </div>
                    <div className="px-6 py-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="search"
                                        placeholder="Search products..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button variant="outline" size="icon" onClick={handleSearch}>
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <select
                                    id="category"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    <option value="Medical Supplies">Medical Supplies</option>
                                    <option value="Equipment">Equipment</option>
                                    <option value="Medications">Medications</option>
                                    <option value="Consumables">Consumables</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="flex items-end">
                                <Button 
                                    onClick={handleSearch} 
                                    className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center gap-2 text-xl p-6">
                            <Package className="h-5 w-5" />
                            Items ({products.total})
                        </div>
                    </div>
                    <div className="px-6 py-8 space-y-6 bg-gradient-to-br from-blue-50 to-blue-100">
                        {products.data.length > 0 ? (
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-gray-50">
                                            <TableHead className="font-semibold text-gray-700">Item</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Code</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Category</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Unit</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Current Stock</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Cost</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.data.map((product) => {
                                            const stockStatus = getStockStatus(product);
                                            return (
                                                <TableRow key={product.id} className="hover:bg-blue-50/50 transition-colors border-b border-gray-100">
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium text-gray-900">{product.name}</div>
                                                            {product.description && (
                                                                <div className="text-sm text-gray-600">{product.description}</div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <code className="rounded bg-blue-100 text-blue-800 px-2 py-1 text-sm font-medium">{product.code}</code>
                                                    </TableCell>
                                                    <TableCell className="text-gray-700">{product.category || 'N/A'}</TableCell>
                                                    <TableCell className="text-gray-700">{product.unit_of_measure || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Package className="h-4 w-4 text-gray-500" />
                                                            <span className="font-semibold text-gray-900">{product.current_stock}</span>
                                                            <span className="text-sm text-gray-600">/ {product.maximum_stock_level}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={stockStatus.color as any}>{stockStatus.text}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-semibold text-gray-900">₱{Number(product.unit_cost).toFixed(2)}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl"
                                                                onClick={() => router.visit(`/admin/inventory/products/${product.id}`)}
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" /> View
                                                            </Button>
                                                            <Button
                                                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl"
                                                                onClick={() => router.visit(`/admin/inventory/products/${product.id}/edit`)}
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                                            </Button>
                                                            <Button
                                                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl"
                                                                onClick={() => handleDelete(product)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold">No items found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new item.</p>
                                <div className="mt-6">
                                    <Button onClick={() => router.visit('/admin/inventory/products/create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Item
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {products.last_page > 1 && (
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {(products.current_page - 1) * products.per_page + 1} to{' '}
                                    {Math.min(products.current_page * products.per_page, products.total)} of {products.total} results
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={products.current_page === 1}
                                        onClick={() => router.get(`/admin/inventory/products?page=${products.current_page - 1}`)}
                                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm font-medium">
                                        Page {products.current_page} of {products.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={products.current_page === products.last_page}
                                        onClick={() => router.get(`/admin/inventory/products?page=${products.current_page + 1}`)}
                                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

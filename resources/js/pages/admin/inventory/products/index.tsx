import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
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
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Inventory Items</h1>
                        <p className="text-muted-foreground">Manage clinic items and equipment</p>
                    </div>
                    <Button onClick={() => router.visit('/admin/inventory/products/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                                <Button onClick={handleSearch} className="w-full">
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Products Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Items ({products.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {products.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead>Code</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Unit</TableHead>
                                            <TableHead>Current Stock</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Cost</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.data.map((product) => {
                                            const stockStatus = getStockStatus(product);
                                            return (
                                                <TableRow key={product.id}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{product.name}</div>
                                                            {product.description && (
                                                                <div className="text-sm text-muted-foreground">{product.description}</div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <code className="rounded bg-muted px-2 py-1 text-sm">{product.code}</code>
                                                    </TableCell>
                                                    <TableCell>{product.category || 'N/A'}</TableCell>
                                                    <TableCell>{product.unit_of_measure || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Package className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">{product.current_stock}</span>
                                                            <span className="text-sm text-muted-foreground">/ {product.maximum_stock_level}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={stockStatus.color as any}>{stockStatus.text}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-medium">₱{Number(product.unit_cost).toFixed(2)}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => router.visit(`/admin/inventory/products/${product.id}`)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => router.visit(`/admin/inventory/products/${product.id}/edit`)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => handleDelete(product)}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
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
                    </CardContent>
                </Card>

                {/* Pagination */}
                {products.last_page > 1 && (
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
                            >
                                Previous
                            </Button>
                            <span className="text-sm">
                                Page {products.current_page} of {products.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={products.current_page === products.last_page}
                                onClick={() => router.get(`/admin/inventory/products?page=${products.current_page + 1}`)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

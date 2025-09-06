import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Download, Package, TrendingDown, TrendingUp } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Management',
        href: '/admin/inventory',
    },
    {
        title: 'Reports',
        href: '/admin/inventory/reports',
    },
    {
        title: 'Stock Levels Report',
        href: '/admin/inventory/reports/stock-levels',
    },
];

interface Product {
    id: number;
    name: string;
    code: string;
    category?: string;
    unit_of_measure?: string;
    unit_cost: number;
    minimum_stock_level: number;
    maximum_stock_level: number;
    current_stock: number;
    available_stock: number;
    stock_levels?: Array<{
        id: number;
        lot_number?: string;
        expiry_date?: string;
        current_stock: number;
        available_stock: number;
        average_cost: number;
        total_value: number;
        is_expired: boolean;
        is_near_expiry: boolean;
    }>;
}

interface StockLevelsReportProps {
    products: Product[];
    lowStockProducts: Product[];
    expiringSoon: Product[];
    expiredStock: Product[];
}

export default function StockLevelsReport({ products, lowStockProducts, expiringSoon, expiredStock }: StockLevelsReportProps) {
    const handleExport = () => {
        // TODO: Implement PDF export
        alert('PDF export functionality will be implemented soon.');
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
            <Head title="Stock Levels Report" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.visit('/admin/inventory/reports')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Reports
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Stock Levels Report</h1>
                            <p className="text-muted-foreground">Current inventory status and alerts</p>
                        </div>
                    </div>
                    <Button onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{products.length}</div>
                            <p className="text-xs text-muted-foreground">Active products</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                            <TrendingDown className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{lowStockProducts.length}</div>
                            <p className="text-xs text-muted-foreground">Need restocking</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{expiringSoon.length}</div>
                            <p className="text-xs text-muted-foreground">Within 30 days</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Expired</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{expiredStock.length}</div>
                            <p className="text-xs text-muted-foreground">Past expiry date</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Low Stock Alert */}
                {lowStockProducts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-yellow-600">
                                <TrendingDown className="h-5 w-5" />
                                Low Stock Alert
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Current Stock</TableHead>
                                            <TableHead>Minimum Level</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {lowStockProducts.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{product.name}</div>
                                                        <div className="text-sm text-muted-foreground">{product.code}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-yellow-600">{product.current_stock}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{product.minimum_stock_level}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="destructive">Low Stock</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            router.visit(`/admin/inventory/transactions/create?product_id=${product.id}&type=in`)
                                                        }
                                                    >
                                                        Restock
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* All Products Stock Levels */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Products Stock Levels</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {products.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Current Stock</TableHead>
                                            <TableHead>Available Stock</TableHead>
                                            <TableHead>Min/Max Levels</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Total Value</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.map((product) => {
                                            const stockStatus = getStockStatus(product);
                                            return (
                                                <TableRow key={product.id}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{product.name}</div>
                                                            <div className="text-sm text-muted-foreground">{product.code}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{product.category || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{product.current_stock}</div>
                                                        <div className="text-sm text-muted-foreground">{product.unit_of_measure || 'units'}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{product.available_stock}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            <div>Min: {product.minimum_stock_level}</div>
                                                            <div>Max: {product.maximum_stock_level}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={stockStatus.color as any}>{stockStatus.text}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">
                                                            ₱{(product.current_stock * Number(product.unit_cost)).toFixed(2)}
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
                                <h3 className="mt-2 text-sm font-semibold">No products found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">No products available for stock level reporting.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

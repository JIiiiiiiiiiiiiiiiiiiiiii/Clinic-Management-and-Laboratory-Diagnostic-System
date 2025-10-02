import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
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
    const handleExport = (format: 'excel' | 'pdf' | 'word') => {
        const params = new URLSearchParams({ format });
        window.location.href = `/admin/inventory/reports/stock-levels/export?${params.toString()}`;
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Heading title="Stock Levels Report" description="Current inventory status and alerts" icon={Package} />
                        <div className="flex items-center gap-4">
                            <Button variant="secondary" onClick={() => router.visit('/admin/inventory/reports')} className="bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Reports
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleExport('excel')}>Excel</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExport('pdf')}>PDF</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExport('word')}>Word</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-6 md:grid-cols-4 mb-8">
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg">
                                        <Package className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Total Supplies</h3>
                                        <p className="text-blue-100 text-sm">Active supplies</p>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white">{products.length}</div>
                            </div>
                        </div>
                    </div>

                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg">
                                        <TrendingDown className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Low Stock</h3>
                                        <p className="text-yellow-100 text-sm">Need restocking</p>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white">{lowStockProducts.length}</div>
                            </div>
                        </div>
                    </div>

                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Expiring Soon</h3>
                                        <p className="text-orange-100 text-sm">Within 30 days</p>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white">{expiringSoon.length}</div>
                            </div>
                        </div>
                    </div>

                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-red-400 to-red-500 rounded-lg">
                                        <TrendingDown className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Expired</h3>
                                        <p className="text-red-100 text-sm">Past expiry date</p>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white">{expiredStock.length}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Low Stock Alert */}
                {lowStockProducts.length > 0 && (
                    <div className="holographic-card shadow-lg border-0 mb-8 overflow-hidden rounded-xl bg-white">
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg">
                                    <TrendingDown className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Low Stock Alert</h3>
                                    <p className="text-yellow-100 mt-1">Supplies that need immediate restocking</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-gray-50">
                                            <TableHead className="font-semibold text-gray-700">Supply</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Current Stock</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Minimum Level</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {lowStockProducts.map((product: any) => (
                                            <TableRow key={product.id} className="hover:bg-yellow-50/50 transition-colors border-b border-gray-100">
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{product.name}</div>
                                                        <div className="text-sm text-gray-600">{product.code}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-yellow-600">{product.current_stock}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-gray-900">{product.minimum_stock_level}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="destructive" className="px-3 py-1">Low Stock</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-lg"
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
                        </div>
                    </div>
                )}

                {/* All Products Stock Levels */}
                <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white">
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                        <div className="flex items-center gap-3 p-6">
                            <div className="p-2 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-lg">
                                <Package className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">All Supplies Stock Levels</h3>
                                <p className="text-indigo-100 mt-1">Complete inventory overview with status indicators</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-6 bg-gradient-to-br from-indigo-50 to-indigo-100">
                        {products.length > 0 ? (
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-gray-50">
                                            <TableHead className="font-semibold text-gray-700">Supply</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Category</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Current Stock</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Available Stock</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Min/Max Levels</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Total Value</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.map((product) => {
                                            const stockStatus = getStockStatus(product);
                                            return (
                                                <TableRow key={product.id} className="hover:bg-indigo-50/50 transition-colors border-b border-gray-100">
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium text-gray-900">{product.name}</div>
                                                            <div className="text-sm text-gray-600">{product.code}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-700">{product.category || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-gray-900">{product.current_stock}</div>
                                                        <div className="text-sm text-gray-600">{product.unit_of_measure || 'units'}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-gray-900">{Number(product.available_stock ?? 0)}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm text-gray-700">
                                                            <div>Min: {product.minimum_stock_level}</div>
                                                            <div>Max: {product.maximum_stock_level}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={stockStatus.color as any} className="px-3 py-1">{stockStatus.text}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-gray-900">
                                                            ₱{Number((product.current_stock || 0) * Number(product.unit_cost || 0)).toFixed(2)}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <div className="p-6 bg-gray-50 rounded-2xl">
                                    <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                    <h3 className="mb-2 text-2xl font-bold text-gray-900">No Products Found</h3>
                                    <p className="mb-6 text-gray-600">No products available for stock level reporting.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

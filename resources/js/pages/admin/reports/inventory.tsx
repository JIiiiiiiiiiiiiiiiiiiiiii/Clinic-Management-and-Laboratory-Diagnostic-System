import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, Download, FileText, MoreHorizontal, Package, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface InventoryItem {
    id: number;
    name: string;
    category: string;
    current_stock: number;
    minimum_stock_level: number;
    unit_price: number;
    total_value: number;
    supplier: string;
    last_restocked: string;
}

interface Summary {
    total_products: number;
    low_stock_items: number;
    out_of_stock: number;
    total_value: number;
}

interface InventoryReportsProps {
    products: {
        data: InventoryItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    summary: Summary;
    metadata?: {
        generated_at: string;
        generated_by: string;
        generated_by_role: string;
        system_version: string;
    };
}

const breadcrumbs = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Reports', href: '/admin/reports' },
    { label: 'Inventory Reports', href: '/admin/reports/inventory' },
];

// Column definitions for the data table
const columns: ColumnDef<InventoryItem>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Product Name" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'category',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
        cell: ({ row }) => <div>{row.getValue('category')}</div>,
    },
    {
        accessorKey: 'current_stock',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Current Stock" />,
        cell: ({ row }) => {
            const stock = Number(row.getValue('current_stock'));
            const minStock = Number(row.original.minimum_stock_level);
            const isLowStock = stock <= minStock;
            const isOutOfStock = stock <= 0;
            
            return (
                <div className="flex items-center gap-2">
                    <span className={isOutOfStock ? 'text-red-600 font-semibold' : isLowStock ? 'text-yellow-600 font-semibold' : 'text-green-600'}>
                        {stock.toLocaleString()}
                    </span>
                    {isOutOfStock && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {isLowStock && !isOutOfStock && <TrendingDown className="h-4 w-4 text-yellow-500" />}
                </div>
            );
        },
    },
    {
        accessorKey: 'minimum_stock_level',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Min. Stock" />,
        cell: ({ row }) => <div>{row.getValue('minimum_stock_level')}</div>,
    },
    {
        accessorKey: 'unit_price',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Unit Price" />,
        cell: ({ row }) => {
            const price = parseFloat(row.getValue('unit_price') || '0');
            const formatted = new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
            }).format(price);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: 'total_value',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Total Value" />,
        cell: ({ row }) => {
            const value = parseFloat(row.getValue('total_value') || '0');
            const formatted = new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
            }).format(value);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: 'supplier',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Supplier" />,
        cell: ({ row }) => <div>{row.getValue('supplier')}</div>,
    },
    {
        accessorKey: 'last_restocked',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Last Restocked" />,
        cell: ({ row }) => {
            const date = new Date(row.getValue('last_restocked'));
            return <div>{date.toLocaleDateString()}</div>;
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const item = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.id.toString())}>
                            Copy item ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Update stock</DropdownMenuItem>
                        <DropdownMenuItem>Reorder</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function InventoryReports({ products, summary, metadata }: InventoryReportsProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
        try {
            setIsExporting(true);
            const params = new URLSearchParams({
                format,
            });
            window.location.href = `/admin/reports/export?type=inventory&${params.toString()}`;

            setTimeout(() => {
                setIsExporting(false);
            }, 2000);
        } catch (error) {
            console.error('Export failed:', error);
            setIsExporting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const getStockStatus = (current: number, minimum: number) => {
        if (current <= 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' };
        if (current <= minimum) return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
        return { status: 'In Stock', color: 'bg-green-100 text-green-800' };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs as any}>
            <Head title="Inventory Reports" />
            <div className="min-h-screen bg-white p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="mb-4 text-4xl font-semibold text-black">Inventory Reports</h1>
                                <p className="mt-1 text-sm text-black">Stock levels, supply usage, and inventory management</p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => handleExport('excel')} disabled={isExporting} variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Excel
                                </Button>
                                <Button onClick={() => handleExport('pdf')} disabled={isExporting} variant="outline">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Export PDF
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <Package className="h-5 w-5 text-blue-600" />
                                    Total Products
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-blue-600">{summary.total_products.toLocaleString()}</div>
                                <p className="text-sm text-gray-600">All inventory items</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    Low Stock Items
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-yellow-600">{summary.low_stock_items.toLocaleString()}</div>
                                <p className="text-sm text-gray-600">Need restocking</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                    Out of Stock
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-red-600">{summary.out_of_stock.toLocaleString()}</div>
                                <p className="text-sm text-gray-600">Urgent restock needed</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    Total Value
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-green-600">{formatCurrency(summary.total_value)}</div>
                                <p className="text-sm text-gray-600">Inventory value</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Inventory Data Table */}
                    <Card className="rounded-xl border-0 bg-white shadow-lg">
                        <CardHeader className="border-b border-gray-200 bg-white">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                <Package className="h-5 w-5 text-black" />
                                Inventory Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <DataTable columns={columns} data={products.data} searchKey="name" searchPlaceholder="Search products..." />
                        </CardContent>
                    </Card>

                    {/* Stock Status Summary */}
                    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    In Stock Items
                                </CardTitle>
                                <p className="text-sm text-gray-600">Items with adequate stock levels</p>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {products.data.filter(item => item.current_stock > item.minimum_stock_level).length}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    Low Stock Alert
                                </CardTitle>
                                <p className="text-sm text-gray-600">Items below minimum stock level</p>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">
                                    {products.data.filter(item => item.current_stock <= item.minimum_stock_level && item.current_stock > 0).length}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                    Out of Stock
                                </CardTitle>
                                <p className="text-sm text-gray-600">Items with zero stock</p>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    {products.data.filter(item => item.current_stock <= 0).length}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Footer with Metadata */}
                    <Card className="mt-8">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <div>
                                    <p>
                                        <strong>Generated:</strong> {metadata?.generated_at || new Date().toLocaleString()}
                                    </p>
                                    <p>
                                        <strong>Generated By:</strong> {metadata?.generated_by || 'System'} ({metadata?.generated_by_role || 'User'})
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p>
                                        <strong>System Version:</strong> {metadata?.system_version || '1.0.0'}
                                    </p>
                                    <p>
                                        <strong>Clinic:</strong> St. James Clinic Management System
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

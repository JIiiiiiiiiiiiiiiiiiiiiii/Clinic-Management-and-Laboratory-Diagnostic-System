import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
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
import { AlertTriangle, Download, FileText, MoreHorizontal, Package, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface Product {
    id: number;
    name: string;
    category: string;
    current_stock: number;
    unit_price: number;
    supplier_name: string;
    created_at: string;
}

interface Summary {
    total_products: number;
    low_stock_items: number;
    out_of_stock: number;
    total_value: number;
}

interface InventoryReportsProps {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    summary: Summary;
}

const breadcrumbs = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Reports', href: '/admin/reports' },
    { label: 'Inventory Reports', href: '/admin/reports/inventory' },
];

// Column definitions for the data table
const columns: ColumnDef<Product>[] = [
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Product ID" />,
        cell: ({ row }) => <div className="font-medium">#{row.getValue('id')}</div>,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Product Name" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'category',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
        cell: ({ row }) => {
            const category = row.getValue('category') as string;
            return <Badge variant="outline">{category}</Badge>;
        },
    },
    {
        accessorKey: 'current_stock',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Current Stock" />,
        cell: ({ row }) => {
            const stock = (row.getValue('current_stock') as number) || 0;
            const isLowStock = stock < 10;
            return <div className={`font-medium ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>{stock.toLocaleString()}</div>;
        },
    },
    {
        accessorKey: 'unit_cost',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Unit Cost" />,
        cell: ({ row }) => {
            const cost = parseFloat(row.getValue('unit_cost') || '0');
            const formatted = new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
            }).format(cost);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: 'supplier_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Supplier" />,
        cell: ({ row }) => <div>{row.getValue('supplier_name') || 'N/A'}</div>,
    },
    {
        accessorKey: 'expiration_date',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Expiration Date" />,
        cell: ({ row }) => {
            const date = row.getValue('expiration_date') as string;
            if (!date) return <div>N/A</div>;

            const expDate = new Date(date);
            const today = new Date();
            const isExpired = expDate < today;
            const isExpiringSoon = expDate <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

            return (
                <div className={`${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-600' : 'text-green-600'}`}>
                    {expDate.toLocaleDateString()}
                </div>
            );
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const product = row.original;

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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(product.id.toString())}>Copy product ID</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View product details</DropdownMenuItem>
                        <DropdownMenuItem>Update stock</DropdownMenuItem>
                        <DropdownMenuItem>Edit product</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function InventoryReports({ products, summary }: InventoryReportsProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
        try {
            setIsExporting(true);
            const params = new URLSearchParams({
                format,
                category: category,
                low_stock: lowStock.toString(),
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

    const getStockBadge = (stock: number) => {
        if (stock === 0) {
            return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
        } else if (stock <= 10) {
            return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
        } else {
            return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
        }
    };

    const getStockColor = (stock: number) => {
        if (stock === 0) return 'text-red-600';
        if (stock <= 10) return 'text-yellow-600';
        return 'text-green-600';
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
                                <p className="mt-1 text-sm text-black">Supply management and stock analytics</p>
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
                                <p className="text-sm text-gray-600">Items ≤ 10 units</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <Package className="h-5 w-5 text-red-600" />
                                    Out of Stock
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-red-600">{summary.out_of_stock.toLocaleString()}</div>
                                <p className="text-sm text-gray-600">Zero inventory</p>
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

                    {/* Products Data Table */}
                    <Card className="rounded-xl border-0 bg-white shadow-lg">
                        <CardHeader className="border-b border-gray-200 bg-white">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                <FileText className="h-5 w-5 text-black" />
                                Inventory Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <DataTable columns={columns} data={products.data} searchKey="name" searchPlaceholder="Search products..." />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

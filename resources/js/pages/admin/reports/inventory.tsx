import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { AlertTriangle, Calendar, Download, FileText, Package, TrendingUp } from 'lucide-react';
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
    { label: 'Reports & Analytics', href: '/admin/reports' },
    { label: 'Inventory Reports', href: '/admin/reports/inventory' },
];

export default function InventoryReports({ products, summary }: InventoryReportsProps) {
    const [category, setCategory] = useState('all');
    const [lowStock, setLowStock] = useState(false);
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

                    {/* Filters */}
                    <Card className="mb-8 rounded-xl border-0 bg-white shadow-lg">
                        <CardHeader className="border-b border-gray-200 bg-white">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                <Calendar className="h-5 w-5 text-black" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            <SelectItem value="medical_supplies">Medical Supplies</SelectItem>
                                            <SelectItem value="office_supplies">Office Supplies</SelectItem>
                                            <SelectItem value="equipment">Equipment</SelectItem>
                                            <SelectItem value="medication">Medication</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="low_stock">Show Low Stock Only</Label>
                                    <Select value={lowStock.toString()} onValueChange={(value) => setLowStock(value === 'true')}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Filter by stock level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="false">All Items</SelectItem>
                                            <SelectItem value="true">Low Stock Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end">
                                    <Button className="w-full">Apply Filters</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Products Table */}
                    <Card className="rounded-xl border-0 bg-white shadow-lg">
                        <CardHeader className="border-b border-gray-200 bg-white">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                <FileText className="h-5 w-5 text-black" />
                                Inventory Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-gray-100">
                                            <TableHead className="font-semibold text-black">Product Name</TableHead>
                                            <TableHead className="font-semibold text-black">Category</TableHead>
                                            <TableHead className="font-semibold text-black">Current Stock</TableHead>
                                            <TableHead className="font-semibold text-black">Unit Price</TableHead>
                                            <TableHead className="font-semibold text-black">Total Value</TableHead>
                                            <TableHead className="font-semibold text-black">Supplier</TableHead>
                                            <TableHead className="font-semibold text-black">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="py-8 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                        <h3 className="mb-2 text-lg font-semibold text-black">No products found</h3>
                                                        <p className="text-black">Try adjusting your filters</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            products.data.map((product) => (
                                                <TableRow key={product.id} className="hover:bg-gray-50">
                                                    <TableCell className="font-medium text-black">{product.name}</TableCell>
                                                    <TableCell className="text-black capitalize">{product.category.replace('_', ' ')}</TableCell>
                                                    <TableCell className={`font-semibold ${getStockColor(product.current_stock || 0)}`}>
                                                        {(product.current_stock || 0).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-black">{formatCurrency(product.unit_cost || 0)}</TableCell>
                                                    <TableCell className="font-semibold text-green-600">
                                                        {formatCurrency((product.current_stock || 0) * (product.unit_cost || 0))}
                                                    </TableCell>
                                                    <TableCell className="text-black">{product.supplier_name || 'N/A'}</TableCell>
                                                    <TableCell>{getStockBadge(product.current_stock || 0)}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

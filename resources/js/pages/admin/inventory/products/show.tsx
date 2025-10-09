import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, Package, Plus, TrendingDown, TrendingUp } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory',
        href: '/admin/inventory',
    },
    {
        title: 'Items',
        href: '/admin/inventory/products',
    },
    {
        title: 'Item Details',
        href: '/admin/inventory/products/show',
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
    recent_transactions?: Array<{
        id: number;
        type: string;
        subtype: string;
        quantity: number;
        transaction_date: string;
        approval_status: string;
        user: {
            name: string;
        };
    }>;
}

interface ShowProductProps {
    product: Product;
}

export default function ShowProduct({ product }: ShowProductProps) {
    const getStockStatus = () => {
        if (product.current_stock <= product.minimum_stock_level) {
            return { status: 'low', color: 'destructive', text: 'Low Stock' };
        } else if (product.current_stock >= product.maximum_stock_level) {
            return { status: 'high', color: 'secondary', text: 'High Stock' };
        }
        return { status: 'normal', color: 'default', text: 'Normal' };
    };

    const stockStatus = getStockStatus();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Item Details - ${product.name}`} />
            <div className="min-h-screen bg-white p-6 pb-12">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button 
                                variant="outline" 
                                onClick={() => router.visit('/admin/inventory/products')}
                                className="h-12 w-12"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <Heading title={product.name} description="Item details and stock information" icon={Package} />
                        </div>
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={() => router.visit(`/admin/inventory/transactions/create?product_id=${product.id}`)}
                                className="bg-white border border-gray-300 hover:bg-gray-50 text-black shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
                            >
                                <Plus className="mr-3 h-6 w-6" />
                                Record Movement
                            </Button>
                            <Button 
                                onClick={() => router.visit(`/admin/inventory/products/${product.id}/edit`)}
                                className="bg-white border border-gray-300 hover:bg-gray-50 text-black shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
                            >
                                <Edit className="mr-3 h-6 w-6" />
                                Edit Item
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Item Information */}
                    <div className="holographic-card shadow-xl border-0 overflow-hidden rounded-2xl bg-white hover:shadow-2xl transition-all duration-300 md:col-span-2">
                        <div className="bg-white border-b border-gray-200 text-black">
                            <div className="flex items-center gap-2 text-xl p-6">
                                <Package className="h-5 w-5" />
                                Item Information
                            </div>
                        </div>
                        <div className="px-6 py-8 space-y-6 bg-white">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Item Name</label>
                                    <p className="text-lg font-semibold">{product.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Item Code</label>
                                    <p className="text-lg font-semibold">
                                        <code className="rounded bg-muted px-2 py-1">{product.code}</code>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                                    <p className="text-lg">{product.category || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Unit of Measure</label>
                                    <p className="text-lg">{product.unit_of_measure || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Unit Cost</label>
                                    <p className="text-lg font-semibold">₱{Number(product.unit_cost).toFixed(2)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={product.is_active ? 'success' : 'secondary'}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {product.description && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                                    <p className="text-lg">{product.description}</p>
                                </div>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Tracking Requirements</label>
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        {product.requires_lot_tracking && <Badge variant="outline">Lot Tracking</Badge>}
                                        {product.requires_expiry_tracking && <Badge variant="outline">Expiry Tracking</Badge>}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Stock Levels</label>
                                    <div className="text-sm">
                                        <p>Min: {product.minimum_stock_level}</p>
                                        <p>Max: {product.maximum_stock_level}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stock Overview */}
                    <div className="holographic-card shadow-xl border-0 overflow-hidden rounded-2xl bg-white hover:shadow-2xl transition-all duration-300">
                        <div className="bg-white border-b border-gray-200 text-black">
                            <div className="flex items-center gap-2 text-xl p-6">
                                <TrendingUp className="h-5 w-5" />
                                Stock Overview
                            </div>
                        </div>
                        <div className="px-6 py-8 space-y-4 bg-white">
                            <div className="text-center">
                                <div className="text-3xl font-bold">{product.current_stock}</div>
                                <p className="text-sm text-muted-foreground">Current Stock</p>
                                <Badge variant={stockStatus.color as any} className="mt-2">
                                    {stockStatus.text}
                                </Badge>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Available Stock</span>
                                    <span className="font-medium">{product.available_stock}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Minimum Level</span>
                                    <span className="font-medium">{product.minimum_stock_level}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Maximum Level</span>
                                    <span className="font-medium">{product.maximum_stock_level}</span>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between text-sm">
                                    <span>Total Value</span>
                                    <span className="font-medium">₱{(product.current_stock * Number(product.unit_cost)).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stock Levels by Lot */}
                {product.stock_levels && product.stock_levels.length > 0 && (
                    <div className="holographic-card shadow-xl border-0 overflow-hidden rounded-2xl bg-white hover:shadow-2xl transition-all duration-300">
                        <div className="bg-white border-b border-gray-200 text-black">
                            <div className="flex items-center gap-2 text-xl p-6">
                                <Calendar className="h-5 w-5" />
                                Stock Levels by Lot
                            </div>
                        </div>
                        <div className="px-6 py-8 bg-white">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-2 text-left">Lot Number</th>
                                            <th className="p-2 text-left">Expiry Date</th>
                                            <th className="p-2 text-left">Current Stock</th>
                                            <th className="p-2 text-left">Available Stock</th>
                                            <th className="p-2 text-left">Average Cost</th>
                                            <th className="p-2 text-left">Total Value</th>
                                            <th className="p-2 text-left">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {product.stock_levels.map((stock) => (
                                            <tr key={stock.id} className="border-b">
                                                <td className="p-2">
                                                    <code className="rounded bg-muted px-2 py-1 text-xs">{stock.lot_number || 'N/A'}</code>
                                                </td>
                                                <td className="p-2">
                                                    {stock.expiry_date ? new Date(stock.expiry_date).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="p-2 font-medium">{stock.current_stock}</td>
                                                <td className="p-2">{stock.available_stock}</td>
                                                <td className="p-2">₱{stock.average_cost.toFixed(2)}</td>
                                                <td className="p-2">₱{stock.total_value.toFixed(2)}</td>
                                                <td className="p-2">
                                                    <div className="flex gap-1">
                                                        {stock.is_expired && (
                                                            <Badge variant="destructive" className="text-xs">
                                                                Expired
                                                            </Badge>
                                                        )}
                                                        {stock.is_near_expiry && !stock.is_expired && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Expiring Soon
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Transactions */}
                {product.recent_transactions && product.recent_transactions.length > 0 && (
                    <div className="holographic-card shadow-xl border-0 overflow-hidden rounded-2xl bg-white hover:shadow-2xl transition-all duration-300">
                        <div className="bg-white border-b border-gray-200 text-black">
                            <div className="flex items-center gap-2 text-xl p-6">
                                <Calendar className="h-5 w-5" />
                                Recent Transactions
                            </div>
                        </div>
                        <div className="px-6 py-8 bg-white">
                            <div className="space-y-3">
                                {product.recent_transactions.map((transaction) => (
                                    <div key={transaction.id} className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="flex items-center gap-3">
                                            {transaction.type === 'in' ? (
                                                <TrendingUp className="h-4 w-4 text-black" />
                                            ) : (
                                                <TrendingDown className="h-4 w-4 text-black" />
                                            )}
                                            <div>
                                                <p className="font-medium">{transaction.subtype}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {transaction.user.name} • {new Date(transaction.transaction_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">
                                                {transaction.type === 'in' ? '+' : ''}
                                                {transaction.quantity}
                                            </p>
                                            <Badge
                                                variant={
                                                    transaction.approval_status === 'approved'
                                                        ? 'default'
                                                        : transaction.approval_status === 'pending'
                                                          ? 'secondary'
                                                          : 'destructive'
                                                }
                                                className="text-xs"
                                            >
                                                {transaction.approval_status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

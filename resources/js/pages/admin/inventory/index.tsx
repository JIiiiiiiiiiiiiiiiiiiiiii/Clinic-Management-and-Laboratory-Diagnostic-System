import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    BarChart3,
    BriefcaseMedical,
    CheckCircle,
    Clock,
    Package,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory',
        href: '/admin/inventory',
    },
];

interface InventoryStats {
    total_products: number;
    active_products: number;
    low_stock_products: number;
    expiring_soon: number;
    expired_stock: number;
}

interface Transaction {
    id: number;
    type: string;
    subtype: string;
    quantity: number;
    transaction_date: string;
    approval_status: string;
    product: {
        name: string;
        code: string;
    };
    user: {
        name: string;
    };
    approved_by?: {
        name: string;
    };
}

interface TopConsumedProduct {
    product: {
        name: string;
        code: string;
    };
    total_quantity: number;
}

interface LowStockItem {
    id: number;
    name: string;
    code: string;
    total_stock: number;
    min_level: number;
}

interface InventoryDashboardProps {
    stats: InventoryStats;
    recentTransactions: Transaction[];
    pendingApprovals: Transaction[];
    topConsumedProducts: TopConsumedProduct[];
    lowStockItems?: LowStockItem[];
}

export default function InventoryDashboard({
    stats,
    recentTransactions,
    pendingApprovals,
    topConsumedProducts,
    lowStockItems = [],
}: InventoryDashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Inventory</h1>
                        <p className="text-muted-foreground">Track and manage clinic items and equipment</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => router.visit('/admin/inventory/transactions/create')}>
                            <Package className="mr-2 h-4 w-4" />
                            Record Movement
                        </Button>
                        <Button variant="outline" onClick={() => router.visit('/admin/inventory/products/create')}>
                            <BriefcaseMedical className="mr-2 h-4 w-4" />
                            Add Item
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_products}</div>
                            <p className="text-xs text-muted-foreground">{stats.active_products} active items</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.low_stock_products}</div>
                            <p className="text-xs text-muted-foreground">Items need restocking</p>
                            {/* Details intentionally omitted to keep layout clean */}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                            <Clock className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.expiring_soon}</div>
                            <p className="text-xs text-muted-foreground">Within 30 days</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Expired Stock</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.expired_stock}</div>
                            <p className="text-xs text-muted-foreground">Items past expiry</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{pendingApprovals.length}</div>
                            <p className="text-xs text-muted-foreground">Awaiting approval</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Recent Transactions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Movements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentTransactions.length > 0 ? (
                                    recentTransactions.map((transaction) => (
                                        <div key={transaction.id} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                {transaction.type === 'in' ? (
                                                    <ArrowUp className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <ArrowDown className="h-4 w-4 text-red-500" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium">{transaction.product.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {transaction.subtype} • {transaction.user.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">
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
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No recent transactions</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Consumed Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Consumed Items (This Month)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topConsumedProducts.length > 0 ? (
                                    topConsumedProducts.map((item, index) => (
                                        <div key={item.product.code} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{item.product.name}</p>
                                                    <p className="text-xs text-muted-foreground">{item.product.code}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">{item.total_quantity}</p>
                                                <p className="text-xs text-muted-foreground">units consumed</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No consumption data available</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Button variant="outline" className="h-auto flex-col p-4" onClick={() => router.visit('/admin/inventory/products')}>
                                <Package className="mb-2 h-6 w-6" />
                                <span className="font-medium">Manage Items</span>
                                <span className="text-xs text-muted-foreground">View and edit items</span>
                            </Button>

                            <Button variant="outline" className="h-auto flex-col p-4" onClick={() => router.visit('/admin/inventory/transactions')}>
                                <BarChart3 className="mb-2 h-6 w-6" />
                                <span className="font-medium">View Transactions</span>
                                <span className="text-xs text-muted-foreground">Track all movements</span>
                            </Button>

                            <Button variant="outline" className="h-auto flex-col p-4" onClick={() => router.visit('/admin/inventory/reports')}>
                                <TrendingUp className="mb-2 h-6 w-6" />
                                <span className="font-medium">Generate Reports</span>
                                <span className="text-xs text-muted-foreground">Used/rejected supplies</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto flex-col p-4"
                                onClick={() => router.visit('/admin/inventory/reports/stock-levels')}
                            >
                                <Users className="mb-2 h-6 w-6" />
                                <span className="font-medium">Stock Levels</span>
                                <span className="text-xs text-muted-foreground">Current inventory status</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

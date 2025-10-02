import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 pb-12">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Heading title="Inventory Management" description="Track and manage clinic items and equipment" icon={Package} />
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={() => router.visit('/admin/inventory/transactions/create')}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl"
                            >
                                <Package className="mr-3 h-5 w-5" />
                                Record Movement
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => router.visit('/admin/inventory/products/create')}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl"
                            >
                                <BriefcaseMedical className="mr-3 h-5 w-5" />
                                Add Item
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="mb-8 flex flex-wrap items-start gap-2 sm:gap-3 md:gap-4">
                    {/* Card 1: Total Items */}
                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all cursor-pointer w-full flex-1 min-w-[140px] sm:min-w-[160px] md:min-w-[180px] lg:min-w-[192px]">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white h-24 flex items-center">
                            <div className="flex items-center justify-between p-4 w-full">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                        <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">Total Items</h3>
                                        <p className="text-emerald-100 text-xs leading-tight">All products</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 sm:px-6 py-3">
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total_products}</div>
                        </div>
                    </div>

                    {/* Card 2: Low Stock */}
                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all cursor-pointer w-full flex-1 min-w-[140px] sm:min-w-[160px] md:min-w-[180px] lg:min-w-[192px]">
                        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white h-24 flex items-center">
                            <div className="flex items-center justify-between p-4 w-full">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">Low Stock</h3>
                                        <p className="text-yellow-100 text-xs leading-tight">Needs restock</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 sm:px-6 py-4">
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.low_stock_products}</div>
                        </div>
                    </div>

                    {/* Card 3: Expiring Soon */}
                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all cursor-pointer w-full flex-1 min-w-[140px] sm:min-w-[160px] md:min-w-[180px] lg:min-w-[192px]">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white h-24 flex items-center">
                            <div className="flex items-center justify-between p-4 w-full">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">Expiring Soon</h3>
                                        <p className="text-orange-100 text-xs leading-tight">Within 30 days</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 sm:px-6 py-6">
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.expiring_soon}</div>
                        </div>
                    </div>

                    {/* Card 4: Expired Stock */}
                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all cursor-pointer w-full flex-1 min-w-[140px] sm:min-w-[160px] md:min-w-[180px] lg:min-w-[192px]">
                        <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white h-24 flex items-center">
                            <div className="flex items-center justify-between p-4 w-full">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                        <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">Expired Stock</h3>
                                        <p className="text-red-100 text-xs leading-tight">Past expiry</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 sm:px-6 py-4">
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.expired_stock}</div>
                        </div>
                    </div>

                    {/* Card 5: Pending Approvals */}
                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all cursor-pointer w-full flex-1 min-w-[140px] sm:min-w-[160px] md:min-w-[180px] lg:min-w-[192px]">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white h-24 flex items-center">
                            <div className="flex items-center justify-between p-4 w-full">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">Pending Approvals</h3>
                                        <p className="text-indigo-100 text-xs leading-tight">Awaiting review</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 sm:px-6 py-3">
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">{pendingApprovals.length}</div>
                        </div>
                    </div>
                </div>

                {/* Spacing between cards and content sections */}
                <div className="mt-12"></div>

                {/* Quick Actions - 4 buttons with same Admin Dashboard icon background color */}
                <div className="mb-12">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Button 
                            className="h-auto flex-col p-6 holographic-card shadow-lg hover:shadow-2xl overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all duration-300 cursor-pointer !bg-gradient-to-br !from-[#1075bb] !to-[#0b5a8f] !border-0 !text-white hover:!from-[#0b5a8f] hover:!to-[#084a7a]" 
                            onClick={() => router.visit('/admin/inventory/products')}
                        >
                            <Package className="mb-3 h-8 w-8 text-white" />
                            <span className="font-semibold text-lg text-white">Manage Items</span>
                            <span className="text-sm text-white">View and edit items</span>
                        </Button>

                        <Button 
                            className="h-auto flex-col p-6 holographic-card shadow-lg hover:shadow-2xl overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all duration-300 cursor-pointer !bg-gradient-to-br !from-[#1075bb] !to-[#0b5a8f] !border-0 !text-white hover:!from-[#0b5a8f] hover:!to-[#084a7a]" 
                            onClick={() => router.visit('/admin/inventory/transactions')}
                        >
                            <BarChart3 className="mb-3 h-8 w-8 text-white" />
                            <span className="font-semibold text-lg text-white">View Transactions</span>
                            <span className="text-sm text-white">Track all movements</span>
                        </Button>

                        <Button 
                            className="h-auto flex-col p-6 holographic-card shadow-lg hover:shadow-2xl overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all duration-300 cursor-pointer !bg-gradient-to-br !from-[#1075bb] !to-[#0b5a8f] !border-0 !text-white hover:!from-[#0b5a8f] hover:!to-[#084a7a]" 
                            onClick={() => router.visit('/admin/inventory/reports')}
                        >
                            <TrendingUp className="mb-3 h-8 w-8 text-white" />
                            <span className="font-semibold text-lg text-white">Generate Reports</span>
                            <span className="text-sm text-white">Used/rejected supplies</span>
                        </Button>

                        <Button
                            className="h-auto flex-col p-6 holographic-card shadow-lg hover:shadow-2xl overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all duration-300 cursor-pointer !bg-gradient-to-br !from-[#1075bb] !to-[#0b5a8f] !border-0 !text-white hover:!from-[#0b5a8f] hover:!to-[#084a7a]"
                            onClick={() => router.visit('/admin/inventory/reports/stock-levels')}
                        >
                            <Users className="mb-3 h-8 w-8 text-white" />
                            <span className="font-semibold text-lg text-white">Stock Levels</span>
                            <span className="text-sm text-white">Current inventory status</span>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Recent Transactions */}
                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <ArrowUp className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Recent Movements</h3>
                                    <p className="text-green-100 mt-1">Latest supply transactions</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6 bg-gradient-to-br from-green-50 to-green-100">
                            <div className="space-y-4">
                                {recentTransactions.length > 0 ? (
                                    recentTransactions.map((transaction) => (
                                        <div key={transaction.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200">
                                            <div className="flex items-center space-x-3">
                                                {transaction.type === 'in' ? (
                                                    <ArrowUp className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <ArrowDown className="h-5 w-5 text-red-500" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{transaction.product.name}</p>
                                                    <p className="text-xs text-gray-600">
                                                        {transaction.subtype} • {transaction.user.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {transaction.type === 'in' ? '+' : ''}
                                                    {transaction.quantity}
                                                </p>
                                                <Badge
                                                    variant={
                                                        transaction.approval_status === 'approved'
                                                            ? 'success'
                                                            : transaction.approval_status === 'pending'
                                                              ? 'warning'
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
                                    <p className="text-sm text-gray-600 text-center py-4">No recent transactions</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Top Consumed Items */}
                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Top Consumed Items</h3>
                                    <p className="text-purple-100 mt-1">This month's usage</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6 bg-gradient-to-br from-purple-50 to-purple-100">
                            <div className="space-y-4">
                                {topConsumedProducts.length > 0 ? (
                                    topConsumedProducts.map((item, index) => (
                                        <div key={item.product.code} className="flex items-center justify-between p-4 bg-white rounded-lg border border-purple-200">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                                                    <p className="text-xs text-gray-600">{item.product.code}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-purple-600">{item.total_quantity}</p>
                                                <p className="text-xs text-gray-600">units consumed</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-600 text-center py-4">No consumption data available</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                
            </div>
        </AppLayout>
    );
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, AlertTriangle, Package, TrendingDown, Filter, Calendar, BarChart3 } from 'lucide-react';
import { useState } from 'react';

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
        title: 'Rejected Items',
        href: '/admin/inventory/reports/rejected-supplies',
    },
];

interface InventoryItem {
    id: number;
    item_name: string;
    item_code: string;
    category: string;
    unit: string;
    assigned_to: string;
    stock: number;
    consumed: number;
    rejected: number;
    status: string;
    created_at: string;
    updated_at: string;
}

interface RejectedMovement {
    id: number;
    inventory_id: number;
    movement_type: string;
    quantity: number;
    remarks: string;
    created_by: string;
    created_at: string;
    inventoryItem: InventoryItem;
}

interface Summary {
    totalRejectedItems: number;
    totalRejectedProducts: number;
    totalRejectedMovements: number;
    rejectionRate: number;
    topRejectedCategories: Array<{
        category: string;
        total_rejected: number;
        product_count: number;
    }>;
    rejectionTrends: Array<{
        month: string;
        total_rejected: number;
    }>;
}

interface Filters {
    assignedTo: string;
    category: string;
    dateFrom: string;
    dateTo: string;
    availableCategories: string[];
    availableAssignedTo: string[];
}

interface RejectedSuppliesReportProps {
    itemsWithRejections: InventoryItem[];
    rejectedMovements: RejectedMovement[];
    summary: Summary;
    filters: Filters;
}

export default function RejectedSuppliesReport({ itemsWithRejections, rejectedMovements, summary, filters }: RejectedSuppliesReportProps) {
    // Simplified version for testing
    console.log('RejectedSuppliesReport component loaded', { itemsWithRejections, rejectedMovements, summary, filters });
    
    const [localFilters, setLocalFilters] = useState({
        assignedTo: filters?.assignedTo || 'all',
        category: filters?.category || 'all',
        dateFrom: filters?.dateFrom || '',
        dateTo: filters?.dateTo || '',
    });

    const handleFilterChange = (key: string, value: string) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        Object.entries(localFilters).forEach(([key, value]) => {
            if (value && value !== 'all') {
                params.append(key, value);
            }
        });
        router.get(`/admin/inventory/reports/rejected-supplies?${params.toString()}`);
    };

    const clearFilters = () => {
        setLocalFilters({
            assignedTo: 'all',
            category: 'all',
            dateFrom: '',
            dateTo: '',
        });
        router.get('/admin/inventory/reports/rejected-supplies');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rejected Items Report" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Heading title="Rejected Items Report" description="View all rejected inventory items across the entire system" icon={AlertTriangle} />
                        <Button 
                            variant="secondary" 
                            onClick={() => router.visit('/admin/inventory/reports')} 
                            className="bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Reports
                        </Button>
                    </div>
                </div>

                {/* Filters Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filter Options
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="assignedTo">Assigned To</Label>
                                <Select value={localFilters.assignedTo} onValueChange={(value) => handleFilterChange('assignedTo', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Departments" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Departments</SelectItem>
                                        {filters.availableAssignedTo.map((dept) => (
                                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Select value={localFilters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {filters.availableCategories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div>
                                <Label htmlFor="dateFrom">From Date</Label>
                                <Input
                                    id="dateFrom"
                                    type="date"
                                    value={localFilters.dateFrom}
                                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="dateTo">To Date</Label>
                                <Input
                                    id="dateTo"
                                    type="date"
                                    value={localFilters.dateTo}
                                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                            <Button onClick={applyFilters} className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                Apply Filters
                            </Button>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card className="bg-red-50 border-red-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-red-900">Total Rejected Items</h4>
                                        <p className="text-red-600 text-sm">Items marked as rejected</p>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-red-900">{summary.totalRejectedItems}</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-orange-50 border-orange-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <Package className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-orange-900">Products with Rejections</h4>
                                        <p className="text-orange-600 text-sm">Different products rejected</p>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-orange-900">{summary.totalRejectedProducts}</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-yellow-50 border-yellow-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <TrendingDown className="h-6 w-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-yellow-900">Rejection Events</h4>
                                        <p className="text-yellow-600 text-sm">Total rejection movements</p>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-yellow-900">{summary.totalRejectedMovements}</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-purple-50 border-purple-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <BarChart3 className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-purple-900">Rejection Rate</h4>
                                        <p className="text-purple-600 text-sm">Percentage of products rejected</p>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-purple-900">{summary.rejectionRate}%</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Analytics Section */}
                <div className="grid gap-6 lg:grid-cols-2 mb-8">
                    {/* Top Rejected Categories */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Top Rejected Categories
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {summary.topRejectedCategories.length > 0 ? (
                                <div className="space-y-3">
                                    {summary.topRejectedCategories.map((category, index) => (
                                        <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{category.category}</p>
                                                    <p className="text-sm text-gray-600">{category.product_count} products</p>
                                                </div>
                                            </div>
                                            <Badge variant="destructive" className="px-3 py-1">
                                                {category.total_rejected} rejected
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                    <p>No rejection data available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Rejection Trends */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Rejection Trends (Last 6 Months)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {summary.rejectionTrends.length > 0 ? (
                                <div className="space-y-3">
                                    {summary.rejectionTrends.map((trend) => (
                                        <div key={trend.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">{new Date(trend.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-red-500 h-2 rounded-full" 
                                                        style={{ 
                                                            width: `${Math.min(100, (trend.total_rejected / Math.max(...summary.rejectionTrends.map(t => t.total_rejected))) * 100)}%` 
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium">{trend.total_rejected}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                    <p>No trend data available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Items with Rejections */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-900">Items with Rejections</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {itemsWithRejections.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product Name</TableHead>
                                            <TableHead>Item Code</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Assigned To</TableHead>
                                            <TableHead>Current Stock</TableHead>
                                            <TableHead>Rejected Quantity</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {itemsWithRejections.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.item_name}</TableCell>
                                                <TableCell>{item.item_code}</TableCell>
                                                <TableCell>{item.category}</TableCell>
                                                <TableCell>{item.assigned_to}</TableCell>
                                                <TableCell>{item.stock}</TableCell>
                                                <TableCell>
                                                    <Badge variant="destructive" className="px-3 py-1">
                                                        {item.rejected}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge 
                                                        variant={item.status === 'Low Stock' ? 'destructive' : item.status === 'Out of Stock' ? 'secondary' : 'default'}
                                                        className="px-3 py-1"
                                                    >
                                                        {item.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <div className="p-6 bg-gray-50 rounded-2xl">
                                    <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                    <h3 className="mb-2 text-2xl font-bold text-gray-900">No Rejected Items</h3>
                                    <p className="mb-6 text-gray-600">No items have been marked as rejected.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Rejection History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-900">Rejection History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {rejectedMovements.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>User</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rejectedMovements.map((movement) => (
                                            <TableRow key={movement.id}>
                                                <TableCell>
                                                    {new Date(movement.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{movement.inventoryItem.item_name}</div>
                                                        <div className="text-sm text-gray-600">{movement.inventoryItem.item_code}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="destructive" className="px-3 py-1">
                                                        {movement.quantity}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-700">
                                                    {movement.remarks || 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-700">
                                                    {movement.created_by}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <div className="p-6 bg-gray-50 rounded-2xl">
                                    <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                    <h3 className="mb-2 text-2xl font-bold text-gray-900">No Rejection History</h3>
                                    <p className="mb-6 text-gray-600">No rejection movements found in the system.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
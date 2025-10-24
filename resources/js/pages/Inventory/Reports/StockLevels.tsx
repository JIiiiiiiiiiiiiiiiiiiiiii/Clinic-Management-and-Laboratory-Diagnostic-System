import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PatientInfoCard } from '@/components/patient/PatientPageLayout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Package, 
    BarChart3,
    Download,
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Calendar,
    FileText,
    Filter,
    Users,
    FlaskConical,
    Clock,
    DollarSign,
    Activity,
    Plus,
    Eye,
    Trash2,
    Save
} from 'lucide-react';
import { useState } from 'react';

type StockLevelsData = {
    summary: {
        total_items: number;
        in_stock: number;
        low_stock: number;
        out_of_stock: number;
        total_value: number;
    };
    category_stats: any;
    needs_restock: any[];
    all_items: any[];
};

interface StockLevelsReportProps {
    data: StockLevelsData;
    filters: {
        category?: string;
        status?: string;
    };
    report_id?: number;
}

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
        title: 'Stock Levels',
        href: '/admin/inventory/reports/stock-levels',
    },
];

export default function StockLevelsReport({
    data,
    filters,
    report_id,
}: StockLevelsReportProps) {
    const [selectedFormat, setSelectedFormat] = useState('pdf');
    const [saveReport, setSaveReport] = useState(false);

    const handleExport = (format: string) => {
        // Create export URL with current filters
        const params = new URLSearchParams();
        params.append('format', format);
        if (filters.category) params.append('category', filters.category);
        if (filters.status) params.append('status', filters.status);
        
        const exportUrl = `/admin/inventory/reports/stock-levels/export?${params.toString()}`;
        window.open(exportUrl, '_blank');
    };

    const handleGenerateReport = () => {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.status) params.append('status', filters.status);
        if (saveReport) params.append('save_report', '1');

        router.visit(`/admin/inventory/reports/stock-levels?${params.toString()}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock Levels Report" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Stock Levels Report</h1>
                                <p className="text-sm text-black mt-1">Current inventory status and stock levels</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={() => router.visit('/admin/inventory/reports')}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Reports
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Report Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                                    <Select defaultValue={filters.category || 'all'}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            <SelectItem value="Medical Supplies">Medical Supplies</SelectItem>
                                            <SelectItem value="Laboratory Supplies">Laboratory Supplies</SelectItem>
                                            <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                                    <Select defaultValue={filters.status || 'all'}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="In Stock">In Stock</SelectItem>
                                            <SelectItem value="Low Stock">Low Stock</SelectItem>
                                            <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-4">
                                <Button onClick={handleGenerateReport} className="bg-green-600 hover:bg-green-700">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Generate Report
                                </Button>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        id="saveReport"
                                        checked={saveReport}
                                        onChange={(e) => setSaveReport(e.target.checked)}
                                    />
                                    <label htmlFor="saveReport" className="text-sm text-gray-700">Save this report</label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main content */}
                <div className="w-full">
                    <PatientInfoCard
                        title="Stock Levels Report"
                        icon={<Package className="h-5 w-5 text-black" />}
                    >
                        {/* Export Actions */}
                        <div className="mb-6 flex justify-end">
                            <div className="flex items-center gap-2">
                                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pdf">PDF</SelectItem>
                                        <SelectItem value="excel">Excel</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button 
                                    onClick={() => handleExport(selectedFormat)}
                                    className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Report
                                </Button>
                            </div>
                        </div>

                        {/* Summary Statistics */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Package className="h-4 w-4 text-black" />
                                    <span className="text-sm font-medium text-gray-800">Total Items</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{data.summary.total_items}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-gray-800">In Stock</span>
                                </div>
                                <div className="text-2xl font-bold text-green-600">{data.summary.in_stock}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    <span className="text-sm font-medium text-gray-800">Low Stock</span>
                                </div>
                                <div className="text-2xl font-bold text-yellow-600">{data.summary.low_stock}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm font-medium text-gray-800">Out of Stock</span>
                                </div>
                                <div className="text-2xl font-bold text-red-600">{data.summary.out_of_stock}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-800">Total Value</span>
                                </div>
                                <div className="text-2xl font-bold text-blue-600">${data.summary.total_value.toLocaleString()}</div>
                            </div>
                        </div>

                        {/* Items Needing Restock */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Needing Restock</h3>
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead className="font-semibold text-black">Item Name</TableHead>
                                            <TableHead className="font-semibold text-black">Category</TableHead>
                                            <TableHead className="font-semibold text-black">Department</TableHead>
                                            <TableHead className="font-semibold text-black">Current Stock</TableHead>
                                            <TableHead className="font-semibold text-black">Unit Cost</TableHead>
                                            <TableHead className="font-semibold text-black">Total Value</TableHead>
                                            <TableHead className="font-semibold text-black">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.needs_restock && data.needs_restock.length > 0 ? (
                                            data.needs_restock.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{item.item_name}</TableCell>
                                                    <TableCell>{item.category}</TableCell>
                                                    <TableCell>{item.assigned_to}</TableCell>
                                                    <TableCell>{item.stock}</TableCell>
                                                    <TableCell>${item.unit_cost || 0}</TableCell>
                                                    <TableCell>${((item.stock || 0) * (item.unit_cost || 0)).toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <Badge 
                                                            variant={
                                                                item.status === 'In Stock' ? 'default' :
                                                                item.status === 'Low Stock' ? 'secondary' : 'destructive'
                                                            }
                                                            className={
                                                                item.status === 'Low Stock' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                                                item.status === 'Out of Stock' ? 'bg-red-100 text-red-800 border-red-200' : ''
                                                            }
                                                        >
                                                            {item.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8">
                                                    <div className="flex flex-col items-center">
                                                        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-400" />
                                                        <h3 className="mb-2 text-lg font-semibold text-black">All items are well stocked</h3>
                                                        <p className="text-gray-600">No items need immediate restocking</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </PatientInfoCard>
                </div>
            </div>
        </AppLayout>
    );
}

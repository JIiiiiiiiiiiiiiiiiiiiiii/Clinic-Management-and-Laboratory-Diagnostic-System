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

type UsedRejectedData = {
    summary: {
        total_items: number;
        total_consumed: number;
        total_rejected: number;
        low_stock_items: number;
        out_of_stock_items: number;
    };
    department_stats: {
        doctor_nurse: {
            total_items: number;
            total_consumed: number;
            total_rejected: number;
            low_stock: number;
        };
        med_tech: {
            total_items: number;
            total_consumed: number;
            total_rejected: number;
            low_stock: number;
        };
    };
    top_consumed_items: any[];
    top_rejected_items: any[];
    consumption_trends: any[];
    date_range: {
        start: string;
        end: string;
        label: string;
    };
};

interface UsedRejectedReportProps {
    data: UsedRejectedData;
    filters: {
        period?: string;
        start_date?: string;
        end_date?: string;
        department?: string;
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
        title: 'Used/Rejected Supplies',
        href: '/admin/inventory/reports/used-rejected',
    },
];

export default function UsedRejectedReport({
    data,
    filters,
    report_id,
}: UsedRejectedReportProps) {
    const [selectedFormat, setSelectedFormat] = useState('pdf');
    const [saveReport, setSaveReport] = useState(false);

    const handleExport = (format: string) => {
        // Create export URL with current filters
        const params = new URLSearchParams();
        params.append('format', format);
        if (filters.period) params.append('period', filters.period);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        if (filters.department) params.append('department', filters.department);
        
        const exportUrl = `/admin/inventory/reports/used-rejected/export?${params.toString()}`;
        window.open(exportUrl, '_blank');
    };

    const handleGenerateReport = () => {
        const params = new URLSearchParams();
        if (filters.period) params.append('period', filters.period);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        if (filters.department) params.append('department', filters.department);
        if (saveReport) params.append('save_report', '1');

        router.visit(`/admin/inventory/reports/used-rejected?${params.toString()}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Used/Rejected Supplies Report" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Used/Rejected Supplies Report</h1>
                                <p className="text-sm text-black mt-1">Track consumption and rejection patterns</p>
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
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Period</label>
                                    <Select defaultValue={filters.period || 'monthly'}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select period" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="yearly">Yearly</SelectItem>
                                            <SelectItem value="custom">Custom Range</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Department</label>
                                    <Select defaultValue={filters.department || 'all'}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Departments</SelectItem>
                                            <SelectItem value="Doctor & Nurse">Doctor & Nurse</SelectItem>
                                            <SelectItem value="Med Tech">Med Tech</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Start Date</label>
                                    <Input 
                                        type="date" 
                                        defaultValue={filters.start_date || ''}
                                        disabled={filters.period !== 'custom'}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">End Date</label>
                                    <Input 
                                        type="date" 
                                        defaultValue={filters.end_date || ''}
                                        disabled={filters.period !== 'custom'}
                                    />
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
                        title="Used/Rejected Supplies Report"
                        icon={<AlertTriangle className="h-5 w-5 text-black" />}
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
                        {/* Report Info */}
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-blue-900">Report Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-blue-800">Report Type:</span>
                                    <span className="ml-2 text-blue-700">Used/Rejected Supplies Report</span>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-800">Date Range:</span>
                                    <span className="ml-2 text-blue-700">{data.date_range.label}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-800">Generated:</span>
                                    <span className="ml-2 text-blue-700">{new Date().toLocaleString()}</span>
                                </div>
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
                                    <TrendingDown className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-gray-800">Total Consumed</span>
                                </div>
                                <div className="text-2xl font-bold text-green-600">{data.summary.total_consumed}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm font-medium text-gray-800">Total Rejected</span>
                                </div>
                                <div className="text-2xl font-bold text-red-600">{data.summary.total_rejected}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    <span className="text-sm font-medium text-gray-800">Low Stock</span>
                                </div>
                                <div className="text-2xl font-bold text-yellow-600">{data.summary.low_stock_items}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm font-medium text-gray-800">Out of Stock</span>
                                </div>
                                <div className="text-2xl font-bold text-red-600">{data.summary.out_of_stock_items}</div>
                            </div>
                        </div>

                        {/* Department Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Doctor & Nurse Department
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Total Items:</span>
                                            <span className="font-semibold">{data.department_stats.doctor_nurse.total_items}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Consumed:</span>
                                            <span className="font-semibold text-green-600">{data.department_stats.doctor_nurse.total_consumed}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Rejected:</span>
                                            <span className="font-semibold text-red-600">{data.department_stats.doctor_nurse.total_rejected}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Low Stock:</span>
                                            <span className="font-semibold text-yellow-600">{data.department_stats.doctor_nurse.low_stock}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FlaskConical className="h-5 w-5" />
                                        Med Tech Department
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Total Items:</span>
                                            <span className="font-semibold">{data.department_stats.med_tech.total_items}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Consumed:</span>
                                            <span className="font-semibold text-green-600">{data.department_stats.med_tech.total_consumed}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Rejected:</span>
                                            <span className="font-semibold text-red-600">{data.department_stats.med_tech.total_rejected}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Low Stock:</span>
                                            <span className="font-semibold text-yellow-600">{data.department_stats.med_tech.low_stock}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Top Consumed Items */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Consumed Items</h3>
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead className="font-semibold text-black">Item Name</TableHead>
                                            <TableHead className="font-semibold text-black">Category</TableHead>
                                            <TableHead className="font-semibold text-black">Department</TableHead>
                                            <TableHead className="font-semibold text-black">Current Stock</TableHead>
                                            <TableHead className="font-semibold text-black">Consumed</TableHead>
                                            <TableHead className="font-semibold text-black">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.top_consumed_items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{item.item_name}</TableCell>
                                                <TableCell>{item.category}</TableCell>
                                                <TableCell>{item.assigned_to}</TableCell>
                                                <TableCell>{item.stock}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-green-600">
                                                        {item.consumed}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        item.status === 'In Stock' ? 'default' :
                                                        item.status === 'Low Stock' ? 'secondary' : 'destructive'
                                                    }>
                                                        {item.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Top Rejected Items */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Rejected Items</h3>
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead className="font-semibold text-black">Item Name</TableHead>
                                            <TableHead className="font-semibold text-black">Category</TableHead>
                                            <TableHead className="font-semibold text-black">Department</TableHead>
                                            <TableHead className="font-semibold text-black">Current Stock</TableHead>
                                            <TableHead className="font-semibold text-black">Rejected</TableHead>
                                            <TableHead className="font-semibold text-black">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.top_rejected_items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{item.item_name}</TableCell>
                                                <TableCell>{item.category}</TableCell>
                                                <TableCell>{item.assigned_to}</TableCell>
                                                <TableCell>{item.stock}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-red-600">
                                                        {item.rejected}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        item.status === 'In Stock' ? 'default' :
                                                        item.status === 'Low Stock' ? 'secondary' : 'destructive'
                                                    }>
                                                        {item.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
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

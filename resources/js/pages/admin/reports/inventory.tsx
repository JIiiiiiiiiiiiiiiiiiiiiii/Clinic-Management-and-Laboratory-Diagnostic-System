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
    Trash2
} from 'lucide-react';
import { useState } from 'react';

type InventoryReport = {
    id: number;
    report_name: string;
    report_type: string;
    period: string;
    start_date: string | null;
    end_date: string | null;
    status: string;
    created_at: string;
    exported_at: string | null;
    export_format: string | null;
    creator: {
        name: string;
    };
};

interface InventoryReportsProps {
    reports: {
        data: InventoryReport[];
        links: any[];
        meta: any;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports',
        href: '/admin/reports',
    },
    {
        title: 'Inventory',
        href: '/admin/reports/inventory',
    },
];

export default function InventoryReports({
    reports,
}: InventoryReportsProps) {
    const [selectedFormat, setSelectedFormat] = useState('pdf');
    const [filterPeriod, setFilterPeriod] = useState('all');

    const handleExport = (reportId: number, format: string) => {
        const exportUrl = `/admin/reports/inventory/${reportId}/export?format=${format}`;
        window.open(exportUrl, '_blank');
    };

    const handleDelete = (reportId: number) => {
        if (confirm('Are you sure you want to delete this report?')) {
            router.delete(`/admin/reports/inventory/${reportId}`);
        }
    };

    const handleExportAll = (format: string) => {
        const exportUrl = `/admin/reports/inventory/export-all?format=${format}`;
        window.open(exportUrl, '_blank');
    };

    const getReportTypeIcon = (type: string) => {
        switch (type) {
            case 'used_rejected':
                return <AlertTriangle className="h-4 w-4" />;
            case 'in_out_supplies':
                return <TrendingUp className="h-4 w-4" />;
            case 'stock_levels':
                return <Package className="h-4 w-4" />;
            case 'daily_consumption':
                return <Calendar className="h-4 w-4" />;
            case 'usage_by_location':
                return <BarChart3 className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const getReportTypeName = (type: string) => {
        switch (type) {
            case 'used_rejected':
                return 'Used/Rejected Supplies';
            case 'in_out_supplies':
                return 'In/Out Supplies';
            case 'stock_levels':
                return 'Stock Levels';
            case 'daily_consumption':
                return 'Daily Consumption';
            case 'usage_by_location':
                return 'Usage by Location';
            default:
                return 'Unknown Report';
        }
    };

    const filteredReports = reports.data.filter(report => {
        if (filterPeriod === 'all') return true;
        return report.period === filterPeriod;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Reports" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Inventory Reports</h1>
                                <p className="text-sm text-black mt-1">Comprehensive inventory analytics and reporting</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={() => router.visit('/admin/reports')}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Reports
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="w-full">
                    <PatientInfoCard
                        title="Inventory Reports Dashboard"
                        icon={<BarChart3 className="h-5 w-5 text-black" />}
                    >
                        {/* Header Actions */}
                        <div className="mb-6 flex justify-between items-center">
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
                                    onClick={() => handleExportAll(selectedFormat)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export All Reports
                                </Button>
                            </div>
                            <Button 
                                onClick={() => router.visit('/admin/reports/inventory/used-rejected')}
                                className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Generate Report
                            </Button>
                        </div>
                        {/* Quick Report Generation */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Report Generation</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Button asChild className="h-auto p-4 flex flex-col items-center gap-2">
                                    <Link href="/admin/reports/inventory/used-rejected">
                                        <AlertTriangle className="h-6 w-6" />
                                        <span>Used/Rejected Supplies</span>
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                                    <Link href="/admin/reports/inventory/in-out-supplies">
                                        <TrendingUp className="h-6 w-6" />
                                        <span>In/Out Supplies</span>
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                                    <Link href="/admin/reports/inventory/stock-levels">
                                        <Package className="h-6 w-6" />
                                        <span>Stock Levels</span>
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                                    <Link href="/admin/reports/inventory/daily-consumption">
                                        <Calendar className="h-6 w-6" />
                                        <span>Daily Consumption</span>
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                                    <Link href="/admin/reports/inventory/usage-by-location">
                                        <BarChart3 className="h-6 w-6" />
                                        <span>Usage by Location</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Filter and Search */}
                        <div className="mb-6 flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <Input placeholder="Search reports..." className="h-10" />
                            </div>
                            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Filter by period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Periods</SelectItem>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Reports Table */}
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="hover:bg-gray-100">
                                        <TableHead className="font-semibold text-black">Report Name</TableHead>
                                        <TableHead className="font-semibold text-black">Type</TableHead>
                                        <TableHead className="font-semibold text-black">Period</TableHead>
                                        <TableHead className="font-semibold text-black">Created By</TableHead>
                                        <TableHead className="font-semibold text-black">Created At</TableHead>
                                        <TableHead className="font-semibold text-black">Status</TableHead>
                                        <TableHead className="font-semibold text-black">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReports.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                <div className="flex flex-col items-center">
                                                    <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                    <h3 className="mb-2 text-lg font-semibold text-black">No reports found</h3>
                                                    <p className="text-gray-600">Generate your first inventory report to get started</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredReports.map((report) => (
                                            <TableRow key={report.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {getReportTypeIcon(report.report_type)}
                                                        {report.report_name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {getReportTypeName(report.report_type)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600 capitalize">
                                                    {report.period}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    {report.creator.name}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    {new Date(report.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={report.status === 'active' ? 'default' : 'secondary'}>
                                                        {report.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => handleExport(report.id, 'pdf')}
                                                            className="text-blue-600 hover:text-blue-700"
                                                        >
                                                            <Download className="mr-1 h-3 w-3" />
                                                            PDF
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => handleExport(report.id, 'excel')}
                                                            className="text-green-600 hover:text-green-700"
                                                        >
                                                            <Download className="mr-1 h-3 w-3" />
                                                            Excel
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => handleDelete(report.id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="mr-1 h-3 w-3" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </PatientInfoCard>
                </div>
            </div>
        </AppLayout>
    );
}

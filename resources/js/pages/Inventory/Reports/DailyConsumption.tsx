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

type DailyConsumptionData = {
    daily_data: any[];
    item_consumption: any[];
    date_range: {
        start: string;
        end: string;
        label: string;
    };
};

interface DailyConsumptionReportProps {
    data: DailyConsumptionData;
    filters: {
        period?: string;
        start_date?: string;
        end_date?: string;
        item_id?: string;
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
        title: 'Daily Consumption',
        href: '/admin/inventory/reports/daily-consumption',
    },
];

export default function DailyConsumptionReport({
    data,
    filters,
    report_id,
}: DailyConsumptionReportProps) {
    const [selectedFormat, setSelectedFormat] = useState('pdf');
    const [saveReport, setSaveReport] = useState(false);

    const handleExport = (format: string) => {
        // Create export URL with current filters
        const params = new URLSearchParams();
        params.append('format', format);
        if (filters.period) params.append('period', filters.period);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        if (filters.item_id) params.append('item_id', filters.item_id);
        
        const exportUrl = `/admin/inventory/reports/daily-consumption/export?${params.toString()}`;
        window.open(exportUrl, '_blank');
    };

    const handleGenerateReport = () => {
        const params = new URLSearchParams();
        if (filters.period) params.append('period', filters.period);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        if (filters.item_id) params.append('item_id', filters.item_id);
        if (saveReport) params.append('save_report', '1');

        router.visit(`/admin/inventory/reports/daily-consumption?${params.toString()}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daily Consumption Report" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Daily Consumption Report</h1>
                                <p className="text-sm text-black mt-1">Track daily usage patterns and consumption trends</p>
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
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Specific Item</label>
                                    <Select defaultValue={filters.item_id || 'all'}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select item" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Items</SelectItem>
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
                        title="Daily Consumption Report"
                        icon={<Calendar className="h-5 w-5 text-black" />}
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

                        {/* Daily Consumption Data */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Consumption Data</h3>
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead className="font-semibold text-black">Date</TableHead>
                                            <TableHead className="font-semibold text-black">Total Consumed</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.daily_data && data.daily_data.length > 0 ? (
                                            data.daily_data.map((daily, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{new Date(daily.date).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-blue-600">
                                                            {daily.total_consumed}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center py-8">
                                                    <div className="flex flex-col items-center">
                                                        <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                        <h3 className="mb-2 text-lg font-semibold text-black">No consumption data found</h3>
                                                        <p className="text-gray-600">No consumption data was recorded for the selected period</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Item Consumption */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Consumption Summary</h3>
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead className="font-semibold text-black">Item Name</TableHead>
                                            <TableHead className="font-semibold text-black">Category</TableHead>
                                            <TableHead className="font-semibold text-black">Total Consumed</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.item_consumption && data.item_consumption.length > 0 ? (
                                            data.item_consumption.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{item.item_name}</TableCell>
                                                    <TableCell>{item.category}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-green-600">
                                                            {item.total_consumed}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-8">
                                                    <div className="flex flex-col items-center">
                                                        <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                        <h3 className="mb-2 text-lg font-semibold text-black">No item consumption data found</h3>
                                                        <p className="text-gray-600">No item consumption data was recorded for the selected period</p>
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

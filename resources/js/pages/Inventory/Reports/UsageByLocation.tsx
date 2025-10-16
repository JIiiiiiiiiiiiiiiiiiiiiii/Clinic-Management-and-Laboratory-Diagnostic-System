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
    Save,
    MapPin
} from 'lucide-react';
import { useState } from 'react';

type UsageByLocationData = {
    location_usage: any[];
    date_range: {
        start: string;
        end: string;
        label: string;
    };
};

interface UsageByLocationReportProps {
    data: UsageByLocationData;
    filters: {
        period?: string;
        start_date?: string;
        end_date?: string;
        location?: string;
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
        title: 'Usage by Location',
        href: '/admin/inventory/reports/usage-by-location',
    },
];

export default function UsageByLocationReport({
    data,
    filters,
    report_id,
}: UsageByLocationReportProps) {
    const [selectedFormat, setSelectedFormat] = useState('pdf');
    const [saveReport, setSaveReport] = useState(false);

    const handleExport = (format: string) => {
        // Create export URL with current filters
        const params = new URLSearchParams();
        params.append('format', format);
        if (filters.period) params.append('period', filters.period);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        if (filters.location) params.append('location', filters.location);
        
        const exportUrl = `/admin/inventory/reports/usage-by-location/export?${params.toString()}`;
        window.open(exportUrl, '_blank');
    };

    const handleGenerateReport = () => {
        const params = new URLSearchParams();
        if (filters.period) params.append('period', filters.period);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        if (filters.location) params.append('location', filters.location);
        if (saveReport) params.append('save_report', '1');

        router.visit(`/admin/inventory/reports/usage-by-location?${params.toString()}`);
    };

    const getTotalUsage = () => {
        return data.location_usage?.reduce((total, location) => total + (location.total_used || 0), 0) || 0;
    };

    const getPercentage = (usage: number) => {
        const total = getTotalUsage();
        return total > 0 ? ((usage / total) * 100).toFixed(2) : '0.00';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usage by Location Report" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Usage by Location Report</h1>
                                <p className="text-sm text-black mt-1">Track inventory usage patterns by department and location</p>
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
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                                    <Select defaultValue={filters.location || 'all'}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Locations</SelectItem>
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
                        title="Usage by Location Report"
                        icon={<MapPin className="h-5 w-5 text-black" />}
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="h-4 w-4 text-black" />
                                    <span className="text-sm font-medium text-gray-800">Total Locations</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{data.location_usage?.length || 0}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-800">Total Usage</span>
                                </div>
                                <div className="text-2xl font-bold text-blue-600">{getTotalUsage()}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <BarChart3 className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-gray-800">Average per Location</span>
                                </div>
                                <div className="text-2xl font-bold text-green-600">
                                    {data.location_usage?.length > 0 ? Math.round(getTotalUsage() / data.location_usage.length) : 0}
                                </div>
                            </div>
                        </div>

                        {/* Location Usage Data */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage by Location</h3>
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead className="font-semibold text-black">Location</TableHead>
                                            <TableHead className="font-semibold text-black">Total Used</TableHead>
                                            <TableHead className="font-semibold text-black">Percentage</TableHead>
                                            <TableHead className="font-semibold text-black">Usage Bar</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.location_usage && data.location_usage.length > 0 ? (
                                            data.location_usage.map((location, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-gray-500" />
                                                            {location.location}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-blue-600">
                                                            {location.total_used}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">
                                                            {getPercentage(location.total_used)}%
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div 
                                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                                style={{ width: `${getPercentage(location.total_used)}%` }}
                                                            ></div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8">
                                                    <div className="flex flex-col items-center">
                                                        <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                        <h3 className="mb-2 text-lg font-semibold text-black">No usage data found</h3>
                                                        <p className="text-gray-600">No usage data was recorded for the selected period</p>
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

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, BarChart3, Calendar, Download, FileText, Package, TrendingDown, Users, Loader2, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';

interface ReportsIndexProps {
    filters: {
        dateRange: string;
        reportType: string;
        startDate?: string;
        endDate?: string;
    };
    summary: {
        totalItems: number;
        totalConsumed: number;
        totalRejected: number;
        lowStockItems: number;
        totalInMovements: number;
        totalOutMovements: number;
        totalMovements: number;
    };
    departmentStats: {
        doctorNurse: {
            totalItems: number;
            totalConsumed: number;
            totalRejected: number;
            lowStock: number;
        };
        medTech: {
            totalItems: number;
            totalConsumed: number;
            totalRejected: number;
            lowStock: number;
        };
    };
    activityTracking: {
        reportsGenerated: number;
        filesExported: number;
        lastReportTimestamp?: string;
    };
    reportData: any;
    dateFilter: {
        start?: string;
        end?: string;
        label: string;
    };
    reportId?: number;
    generatedAt?: string;
}

export default function InventoryReports({
    filters,
    summary,
    departmentStats,
    activityTracking,
    reportData,
    dateFilter,
    reportId,
    generatedAt
}: ReportsIndexProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);
    const [currentReport, setCurrentReport] = useState<{id: number, generatedAt: string} | null>(
        reportId ? { id: reportId, generatedAt: generatedAt || '' } : null
    );

    const handleFilterChange = (key: string, value: string) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleGenerateReport = () => {
        setIsGenerating(true);
        router.get('/admin/inventory/reports', localFilters, {
            preserveState: false,
            onFinish: () => {
                setIsGenerating(false);
                // Reset current report state - will be updated when new data comes in
                setCurrentReport(null);
            },
            onSuccess: (page) => {
                // Update current report state with new report data
                if (page.props.reportId) {
                    setCurrentReport({
                        id: page.props.reportId,
                        generatedAt: page.props.generatedAt || ''
                    });
                }
            }
        });
    };

    const handleExport = async (format: 'pdf' | 'excel') => {
        if (!currentReport) {
            alert('Please generate a report first before exporting.');
            return;
        }

        try {
            setIsExporting(true);
            const params = new URLSearchParams({
                format,
                reportId: currentReport.id.toString()
            });
            window.location.href = `/admin/inventory/reports/export?${params.toString()}`;
            
            // Reset loading state after a delay
            setTimeout(() => {
                setIsExporting(false);
            }, 2000);
        } catch (error) {
            console.error('Export failed:', error);
            setIsExporting(false);
        }
    };

    return (
        <AppLayout>
            <Head title="Inventory Reports & Analytics" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <BarChart3 className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-2">Inventory Reports & Analytics</h1>
                                <p className="text-sm text-gray-600">Generate comprehensive reports and analytics for inventory management</p>
                            </div>
                        </div>
                        <Button 
                            variant="secondary" 
                            onClick={() => router.visit('/admin/inventory')} 
                            className="bg-white text-black hover:bg-gray-50 hover:text-black shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Inventory
                        </Button>
                    </div>
                </div>

                {/* Report Configuration Section */}
                <Card className="mb-8 shadow-lg border-0 rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Generate Report
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Date Range Selector */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Date Range</Label>
                            <Select 
                                value={localFilters.dateRange} 
                                onValueChange={(value) => handleFilterChange('dateRange', value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select date range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Today</SelectItem>
                                    <SelectItem value="weekly">This Week</SelectItem>
                                    <SelectItem value="monthly">This Month</SelectItem>
                                    <SelectItem value="yearly">This Year</SelectItem>
                                    <SelectItem value="custom">Custom Range</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Custom Date Range */}
                        {localFilters.dateRange === 'custom' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">Start Date</Label>
                                    <input
                                        type="date"
                                        value={localFilters.startDate || ''}
                                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">End Date</Label>
                                    <input
                                        type="date"
                                        value={localFilters.endDate || ''}
                                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Report Type Selector */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Report Type</Label>
                            <RadioGroup 
                                value={localFilters.reportType} 
                                onValueChange={(value) => handleFilterChange('reportType', value)}
                                className="flex gap-6"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="consumed-rejected" id="consumed-rejected" />
                                    <Label htmlFor="consumed-rejected" className="text-sm font-medium">
                                        Consumed and Rejected Items
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="incoming-outgoing" id="incoming-outgoing" />
                                    <Label htmlFor="incoming-outgoing" className="text-sm font-medium">
                                        Incoming and Outgoing Movements
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Generate Report Button */}
                        <Button 
                            onClick={handleGenerateReport}
                            disabled={isGenerating}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <BarChart3 className="mr-2 h-4 w-4" />
                            )}
                            {isGenerating ? 'Generating Report...' : 'Generate Report'}
                        </Button>

                        {/* Report Status */}
                        {currentReport && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 text-green-700">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium">
                                        Report Generated: {currentReport.generatedAt}
                                    </span>
                                </div>
                                <div className="text-xs text-green-600 mt-1">
                                    Report ID: {currentReport.id} • Ready for export
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Inventory Summary Section */}
                <Card className="mb-8 shadow-lg border-0 rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Inventory Summary – {dateFilter.label}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{summary.totalItems}</div>
                                <div className="text-sm text-gray-600">
                                    {filters.reportType === 'incoming-outgoing' ? 'Total Movements' : 'Total Items'}
                                </div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{summary.totalConsumed}</div>
                                <div className="text-sm text-gray-600">
                                    {filters.reportType === 'incoming-outgoing' ? 'Incoming Movements' : 'Items Consumed'}
                                </div>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">{summary.totalRejected}</div>
                                <div className="text-sm text-gray-600">
                                    {filters.reportType === 'incoming-outgoing' ? 'Outgoing Movements' : 'Items Rejected'}
                                </div>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600">{summary.lowStockItems}</div>
                                <div className="text-sm text-gray-600">
                                    {filters.reportType === 'incoming-outgoing' ? 'Outgoing Count' : 'Low Stock'}
                                </div>
                            </div>
                        </div>

                        {/* Department Breakdown */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="border border-gray-200">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Doctor & Nurse Supplies
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">
                                            {filters.reportType === 'incoming-outgoing' ? 'Total Movements:' : 'Total Items:'}
                                        </span>
                                        <span className="font-semibold">{departmentStats.doctorNurse.totalItems}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">
                                            {filters.reportType === 'incoming-outgoing' ? 'Incoming:' : 'Consumed:'}
                                        </span>
                                        <span className="font-semibold text-green-600">{departmentStats.doctorNurse.totalConsumed}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">
                                            {filters.reportType === 'incoming-outgoing' ? 'Outgoing:' : 'Rejected:'}
                                        </span>
                                        <span className="font-semibold text-red-600">{departmentStats.doctorNurse.totalRejected}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">
                                            {filters.reportType === 'incoming-outgoing' ? 'Outgoing Count:' : 'Low Stock:'}
                                        </span>
                                        <span className="font-semibold text-yellow-600">{departmentStats.doctorNurse.lowStock}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border border-gray-200">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <TrendingDown className="h-4 w-4" />
                                        Med Tech Supplies
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">
                                            {filters.reportType === 'incoming-outgoing' ? 'Total Movements:' : 'Total Items:'}
                                        </span>
                                        <span className="font-semibold">{departmentStats.medTech.totalItems}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">
                                            {filters.reportType === 'incoming-outgoing' ? 'Incoming:' : 'Consumed:'}
                                        </span>
                                        <span className="font-semibold text-green-600">{departmentStats.medTech.totalConsumed}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">
                                            {filters.reportType === 'incoming-outgoing' ? 'Outgoing:' : 'Rejected:'}
                                        </span>
                                        <span className="font-semibold text-red-600">{departmentStats.medTech.totalRejected}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">
                                            {filters.reportType === 'incoming-outgoing' ? 'Outgoing Count:' : 'Low Stock:'}
                                        </span>
                                        <span className="font-semibold text-yellow-600">{departmentStats.medTech.lowStock}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>

                {/* Reports Activity Section */}
                <Card className="mb-8 shadow-lg border-0 rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Reports Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-gray-600">{activityTracking.reportsGenerated}</div>
                                <div className="text-sm text-gray-600">Reports Generated</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-gray-600">{activityTracking.filesExported}</div>
                                <div className="text-sm text-gray-600">Files Exported</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-sm font-bold text-gray-600">
                                    {activityTracking.lastReportTimestamp || 'No reports yet'}
                                </div>
                                <div className="text-sm text-gray-600">Last Report</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Export Options */}
                <Card className="shadow-lg border-0 rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Download className="h-5 w-5" />
                            Export Options
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <Button 
                                onClick={() => handleExport('pdf')}
                                disabled={isExporting || !currentReport}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isExporting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <FileText className="mr-2 h-4 w-4" />
                                )}
                                {!currentReport ? 'Generate Report First' : 'Export to PDF'}
                            </Button>
                            <Button 
                                onClick={() => handleExport('excel')}
                                disabled={isExporting || !currentReport}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isExporting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                )}
                                {!currentReport ? 'Generate Report First' : 'Export to Excel'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

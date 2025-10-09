import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PatientInfoCard } from '@/components/patient/PatientPageLayout';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingUp, Users, DollarSign, FileText, BarChart3, PieChart, Download, Filter, CalendarDays, MoreHorizontal, Search, Plus, FlaskConical } from 'lucide-react';

interface ReportData {
    id: number;
    name: string;
    type: string;
    dateRange: string;
    generatedBy: string;
    status: 'Generated' | 'Processing' | 'Failed';
    lastGenerated: string;
    downloadUrl?: string;
}

interface FinancialData {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
    patientCount: number;
}

interface PatientStats {
    category: string;
    count: number;
    percentage: number;
}

const mockReportData: ReportData[] = [
    {
        id: 1,
        name: 'Monthly Financial Report',
        type: 'Financial',
        dateRange: 'January 2025',
        generatedBy: 'Admin User',
        status: 'Generated',
        lastGenerated: '2025-01-15 10:30 AM',
        downloadUrl: '/reports/financial-jan-2025.pdf'
    },
    {
        id: 2,
        name: 'Patient Analytics',
        type: 'Analytics',
        dateRange: 'Q4 2024',
        generatedBy: 'Dr. Smith',
        status: 'Generated',
        lastGenerated: '2025-01-10 2:15 PM',
        downloadUrl: '/reports/patient-analytics-q4-2024.pdf'
    },
    {
        id: 3,
        name: 'Inventory Status',
        type: 'Inventory',
        dateRange: 'January 2025',
        generatedBy: 'Admin User',
        status: 'Processing',
        lastGenerated: '2025-01-14 9:45 AM'
    },
    {
        id: 4,
        name: 'Staff Performance',
        type: 'HR',
        dateRange: 'December 2024',
        generatedBy: 'HR Manager',
        status: 'Generated',
        lastGenerated: '2025-01-12 4:20 PM',
        downloadUrl: '/reports/staff-performance-dec-2024.pdf'
    }
];

const mockFinancialData: FinancialData[] = [
    { month: 'Jan', revenue: 45000, expenses: 32000, profit: 13000, patientCount: 120 },
    { month: 'Feb', revenue: 52000, expenses: 35000, profit: 17000, patientCount: 135 },
    { month: 'Mar', revenue: 48000, expenses: 33000, profit: 15000, patientCount: 128 },
    { month: 'Apr', revenue: 55000, expenses: 38000, profit: 17000, patientCount: 142 },
    { month: 'May', revenue: 60000, expenses: 40000, profit: 20000, patientCount: 155 },
    { month: 'Jun', revenue: 58000, expenses: 39000, profit: 19000, patientCount: 148 }
];

const mockPatientStats: PatientStats[] = [
    { category: 'New Patients', count: 45, percentage: 22.2 },
    { category: 'Returning Patients', count: 89, percentage: 43.8 },
    { category: 'Emergency Cases', count: 23, percentage: 11.3 },
    { category: 'Follow-up Visits', count: 46, percentage: 22.7 }
];

const breadcrumbs = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Reports & Analytics', href: '/admin/reports' }
];

export default function ReportsAndAnalytics() {
    const [selectedReportType, setSelectedReportType] = useState('all');
    const [dateRange, setDateRange] = useState('month');
    const [showGenerateDialog, setShowGenerateDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredReports = mockReportData.filter(report => {
        const matchesType = selectedReportType === 'all' || report.type.toLowerCase() === selectedReportType.toLowerCase();
        const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Generated':
                return 'bg-gray-100 text-black hover:bg-gray-100';
            case 'Processing':
                return 'bg-gray-100 text-black hover:bg-gray-100';
            case 'Failed':
                return 'bg-gray-100 text-black hover:bg-gray-100';
            default:
                return 'bg-gray-100 text-black hover:bg-gray-100';
        }
    };

    const totalRevenue = mockFinancialData.reduce((sum, data) => sum + data.revenue, 0);
    const totalExpenses = mockFinancialData.reduce((sum, data) => sum + data.expenses, 0);
    const totalProfit = mockFinancialData.reduce((sum, data) => sum + data.profit, 0);
    const totalPatients = mockFinancialData.reduce((sum, data) => sum + data.patientCount, 0);

    const reportTypes = ['all', 'Financial', 'Analytics', 'Inventory', 'HR'];

    return (
        <AppLayout breadcrumbs={breadcrumbs as any}>
            <Head title="Reports & Analytics" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                                    <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Reports & Analytics</h1>
                                <p className="text-sm text-black mt-1">Generate comprehensive reports and analyze clinic performance</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <BarChart3 className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-black">{mockReportData.length}</div>
                                        <div className="text-black text-sm font-medium">Total Reports</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content layout */}
                <div className="space-y-6">
                    <Card className="shadow-lg border-0 rounded-xl bg-white">
                        <CardHeader className="bg-white border-b border-gray-200">
                            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                <BarChart3 className="h-5 w-5 text-black" />
                                Reports & Analytics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search reports..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                    />
                                </div>
                                <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                                    <SelectTrigger className="w-48 h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500">
                                        <SelectValue placeholder="Filter by type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {reportTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type === 'all' ? 'All Types' : type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={() => setShowGenerateDialog(true)} className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl">
                                <Plus className="mr-3 h-6 w-6" />
                                Generate Report
                            </Button>
                        </div>

                            {/* Reports Table */}
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-gray-100">
                                            <TableHead className="font-semibold text-black">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    Report Name
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-semibold text-black">Type</TableHead>
                                            <TableHead className="font-semibold text-black">Date Range</TableHead>
                                            <TableHead className="font-semibold text-black">Status</TableHead>
                                            <TableHead className="font-semibold text-black">Generated By</TableHead>
                                            <TableHead className="font-semibold text-black">Last Generated</TableHead>
                                            <TableHead className="font-semibold text-black">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                        {filteredReports.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8">
                                                    <div className="flex flex-col items-center">
                                                        <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                        <h3 className="mb-2 text-lg font-semibold text-black">{searchTerm ? 'No reports found' : 'No reports generated yet'}</h3>
                                                        <p className="text-black">
                                                            {searchTerm ? 'Try adjusting your search terms' : 'Generate your first report to get started'}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredReports.map((report) => (
                                                <TableRow key={report.id} className="hover:bg-gray-50">
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1 bg-gray-100 rounded-full">
                                                                <FileText className="h-4 w-4 text-black" />
                                                            </div>
                                                            {report.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-black">{report.type}</TableCell>
                                                    <TableCell className="text-sm text-black">{report.dateRange}</TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusBadge(report.status)}>
                                                            {report.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-black">{report.generatedBy}</TableCell>
                                                    <TableCell className="text-sm text-black">{report.lastGenerated}</TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            {report.downloadUrl && (
                                                                <Button size="sm" variant="outline">
                                                                    <Download className="mr-1 h-3 w-3" />
                                                                    Download
                                                                </Button>
                                                            )}
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button size="sm" variant="outline">
                                                                        <MoreHorizontal className="h-3 w-3" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                                <DropdownMenuContent>
                                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                                <DropdownMenuItem>Regenerate</DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                    <DropdownMenuItem className="text-black">Delete</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Quick Tips Section */}
                    <Card className="shadow-lg border-0 rounded-xl bg-white">
                        <CardHeader className="bg-white border-b border-gray-200">
                            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                <FlaskConical className="h-5 w-5 text-black" />
                                Quick Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="p-3 bg-white rounded-lg border border-gray-200">
                                    <div className="font-semibold text-black mb-1">Report Types</div>
                                    <div className="text-sm text-black">Choose the right report type for your needs</div>
                                </div>
                                <div className="p-3 bg-white rounded-lg border border-gray-200">
                                    <div className="font-semibold text-black mb-1">Date Ranges</div>
                                    <div className="text-sm text-black">Select appropriate date ranges for accurate analysis</div>
                                </div>
                                <div className="p-3 bg-white rounded-lg border border-gray-200">
                                    <div className="font-semibold text-black mb-1">Regular Reports</div>
                                    <div className="text-sm text-black">Schedule regular reports for consistent monitoring</div>
                                </div>
                                <div className="p-3 bg-white rounded-lg border border-gray-200">
                                    <div className="font-semibold text-black mb-1">Data Accuracy</div>
                                    <div className="text-sm text-black">Ensure data is up-to-date before generating reports</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            {/* Generate Report Dialog */}
            <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Generate New Report</DialogTitle>
                            <DialogDescription>
                                Select the type of report you want to generate and specify the date range.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                        <div className="space-y-2">
                                <Label htmlFor="report-type">Report Type</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select report type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="financial">Financial Report</SelectItem>
                                    <SelectItem value="analytics">Analytics Report</SelectItem>
                                    <SelectItem value="inventory">Inventory Report</SelectItem>
                                    <SelectItem value="hr">HR Report</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                                <Label htmlFor="date-range">Date Range</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select date range" />
                                </SelectTrigger>
                                <SelectContent>
                                        <SelectItem value="last-week">Last Week</SelectItem>
                                        <SelectItem value="last-month">Last Month</SelectItem>
                                        <SelectItem value="last-quarter">Last Quarter</SelectItem>
                                        <SelectItem value="last-year">Last Year</SelectItem>
                                    <SelectItem value="custom">Custom Range</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={() => setShowGenerateDialog(false)}>
                                Generate Report
                            </Button>
                        </DialogFooter>
                </DialogContent>
            </Dialog>
            </div>
        </AppLayout>
    );
}
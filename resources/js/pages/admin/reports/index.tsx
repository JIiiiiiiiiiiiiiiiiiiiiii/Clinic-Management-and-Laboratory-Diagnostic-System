import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingUp, Users, DollarSign, FileText, BarChart3, PieChart, Download, Filter, CalendarDays, MoreHorizontal } from 'lucide-react';
import Heading from '@/components/heading';

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
        name: 'Patient Demographics Report',
        type: 'Analytics',
        dateRange: 'Q4 2024',
        generatedBy: 'Admin User',
        status: 'Generated',
        lastGenerated: '2025-01-10 02:15 PM',
        downloadUrl: '/reports/demographics-q4-2024.pdf'
    },
    {
        id: 3,
        name: 'Inventory Status Report',
        type: 'Inventory',
        dateRange: 'January 2025',
        generatedBy: 'Admin User',
        status: 'Generated',
        lastGenerated: '2025-01-14 09:45 AM',
        downloadUrl: '/reports/inventory-jan-2025.pdf'
    },
    {
        id: 4,
        name: 'Staff Performance Report',
        type: 'HR',
        dateRange: 'December 2024',
        generatedBy: 'Admin User',
        status: 'Processing',
        lastGenerated: '2025-01-15 11:20 AM'
    },
    {
        id: 5,
        name: 'Revenue Analysis Report',
        type: 'Financial',
        dateRange: 'Q4 2024',
        generatedBy: 'Admin User',
        status: 'Failed',
        lastGenerated: '2025-01-12 03:30 PM'
    }
];

const mockFinancialData: FinancialData[] = [
    { month: 'Jan', revenue: 125000, expenses: 85000, profit: 40000, patientCount: 156 },
    { month: 'Feb', revenue: 138000, expenses: 92000, profit: 46000, patientCount: 142 },
    { month: 'Mar', revenue: 145000, expenses: 98000, profit: 47000, patientCount: 168 },
    { month: 'Apr', revenue: 132000, expenses: 89000, profit: 43000, patientCount: 135 },
    { month: 'May', revenue: 158000, expenses: 105000, profit: 53000, patientCount: 189 },
    { month: 'Jun', revenue: 167000, expenses: 112000, profit: 55000, patientCount: 203 }
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

    const filteredReports = mockReportData.filter(report => {
        return selectedReportType === 'all' || report.type.toLowerCase() === selectedReportType.toLowerCase();
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Generated':
                return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'Processing':
                return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
            case 'Failed':
                return 'bg-red-100 text-red-800 hover:bg-red-100';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <Heading title="Reports" description="Generate comprehensive reports and analyze clinic performance" icon={BarChart3} />
                    <Button onClick={() => setShowGenerateDialog(true)} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Generate Report
                    </Button>
                </div>

                {/* Key Metrics - Styled like Patient Records header */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-6">
                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <DollarSign className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Total Revenue</h3>
                                        <p className="text-emerald-100 mt-1 text-xs">Last 6 months</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6">
                            <div className="text-2xl font-bold text-gray-900">₱{totalRevenue.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <TrendingUp className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Total Profit</h3>
                                        <p className="text-blue-100 mt-1 text-xs">Net profit margin</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6">
                            <div className="text-2xl font-bold text-gray-900">₱{totalProfit.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Total Patients</h3>
                                        <p className="text-indigo-100 mt-1 text-xs">Last 6 months</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6">
                            <div className="text-2xl font-bold text-gray-900">{totalPatients}</div>
                        </div>
                    </div>

                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Generated Reports</h3>
                                        <p className="text-orange-100 mt-1 text-xs">This month</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6">
                            <div className="text-2xl font-bold text-gray-900">{mockReportData.filter(r => r.status === 'Generated').length}</div>
                        </div>
                    </div>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="financial">Financial</TabsTrigger>
                        <TabsTrigger value="patients">Patients</TabsTrigger>
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Financial Trend Chart */}
                            <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                    <div className="flex items-center gap-3 p-6">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <BarChart3 className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">Financial Performance</h3>
                                            <p className="text-blue-100 mt-1">Revenue vs Expenses (Last 6 months)</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-6 bg-gradient-to-br from-blue-50 to-blue-100">
                                    <div className="space-y-4">
                                        {mockFinancialData.map((data, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{data.month}</span>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-green-600">₱{data.revenue.toLocaleString()}</span>
                                                    <span className="text-sm text-red-600">₱{data.expenses.toLocaleString()}</span>
                                                    <span className="text-sm font-medium">₱{data.profit.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Patient Demographics */}
                            <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all">
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                    <div className="flex items-center gap-3 p-6">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Users className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">Patient Categories</h3>
                                            <p className="text-indigo-100 mt-1">Distribution of patient types</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-6 bg-gradient-to-br from-purple-50 to-purple-100">
                                    <div className="space-y-3">
                                        {mockPatientStats.map((stat, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <span className="text-sm">{stat.category}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">{stat.count}</span>
                                                    <Badge variant="secondary">{stat.percentage}%</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="financial" className="space-y-4">
                        <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <div className="flex items-center gap-3 p-6">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <DollarSign className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Financial Reports</h3>
                                        <p className="text-emerald-100 mt-1">Generate and view financial reports</p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-6 bg-gradient-to-br from-emerald-50 to-green-100">
                                <div className="flex items-center gap-4 mb-4">
                                    <Select value={dateRange} onValueChange={setDateRange}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select date range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="week">This Week</SelectItem>
                                            <SelectItem value="month">This Month</SelectItem>
                                            <SelectItem value="quarter">This Quarter</SelectItem>
                                            <SelectItem value="year">This Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" className="rounded-xl border-gray-300 hover:bg-gray-50">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export Data
                                    </Button>
                                </div>
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
                                            <TableRow className="hover:bg-gray-50">
                                                <TableHead className="font-semibold text-gray-700">Month</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Revenue</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Expenses</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Profit</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Patients</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {mockFinancialData.map((data, index) => (
                                                <TableRow key={index} className="hover:bg-green-50/50 transition-colors border-b border-gray-100">
                                                    <TableCell className="font-medium text-gray-900">{data.month}</TableCell>
                                                    <TableCell className="text-green-600">₱{data.revenue.toLocaleString()}</TableCell>
                                                    <TableCell className="text-red-600">₱{data.expenses.toLocaleString()}</TableCell>
                                                    <TableCell className="font-medium text-gray-900">₱{data.profit.toLocaleString()}</TableCell>
                                                    <TableCell className="text-gray-700">{data.patientCount}</TableCell>
                                                    <TableCell>
                                                        <Button variant="outline" size="sm" className="rounded-xl">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="patients" className="space-y-4">
                            <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                <div className="flex items-center gap-3 p-6">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Patient Analytics</h3>
                                        <p className="text-indigo-100 mt-1">Patient demographics and trends</p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-6 bg-gradient-to-br from-purple-50 to-purple-100">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <h4 className="font-medium mb-3">Patient Growth</h4>
                                        <div className="space-y-2">
                                            {mockFinancialData.map((data, index) => (
                                                <div key={index} className="flex items-center justify-between">
                                                    <span className="text-sm">{data.month}</span>
                                                    <span className="text-sm font-medium">{data.patientCount}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-3">Category Distribution</h4>
                                        <div className="space-y-2">
                                            {mockPatientStats.map((stat, index) => (
                                                <div key={index} className="flex items-center justify-between">
                                                    <span className="text-sm">{stat.category}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">{stat.count}</span>
                                                        <Badge variant="secondary">{stat.percentage}%</Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="reports" className="space-y-4">
                        <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                                <div className="flex items-center gap-3 p-6">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Generated Reports</h3>
                                        <p className="text-orange-100 mt-1">View and manage all generated reports</p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-6 bg-gradient-to-br from-orange-50 to-red-50">
                                <div className="flex items-center gap-4 mb-4">
                                    <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="All Report Types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {reportTypes.map(type => (
                                                <SelectItem key={type} value={type}>
                                                    {type === 'all' ? 'All Types' : type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button className="h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Apply Filters
                                    </Button>
                                    <Button className="h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Apply Filters
                                    </Button>
                                </div>
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
                                            <TableRow className="hover:bg-gray-50">
                                                <TableHead className="font-semibold text-gray-700">Report Name</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Type</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Date Range</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Generated By</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Last Generated</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredReports.map((report) => (
                                                <TableRow key={report.id} className="hover:bg-orange-50/50 transition-colors border-b border-gray-100">
                                                    <TableCell className="font-medium text-gray-900">{report.name}</TableCell>
                                                    <TableCell className="text-gray-700">{report.type}</TableCell>
                                                    <TableCell className="text-gray-700">{report.dateRange}</TableCell>
                                                    <TableCell className="text-gray-700">{report.generatedBy}</TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusBadge(report.status)}>
                                                            {report.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-500">
                                                        {report.lastGenerated}
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="rounded-xl">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                {report.status === 'Generated' && report.downloadUrl && (
                                                                    <DropdownMenuItem>
                                                                        <Download className="h-4 w-4 mr-2" />
                                                                        Download
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                                <DropdownMenuItem>Regenerate</DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-red-600">
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Generate Report Dialog */}
            <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
                <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <div className="flex items-center gap-3 p-6">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold text-white">Generate New Report</DialogTitle>
                                <DialogDescription className="text-blue-100">Select report type and parameters</DialogDescription>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-6 bg-gradient-to-br from-blue-50 to-blue-100 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="reportType">Report Type</Label>
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
                            <Label htmlFor="dateRange">Date Range</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select date range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="week">This Week</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                    <SelectItem value="quarter">This Quarter</SelectItem>
                                    <SelectItem value="year">This Year</SelectItem>
                                    <SelectItem value="custom">Custom Range</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="format">Output Format</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                    <SelectItem value="excel">Excel</SelectItem>
                                    <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                                Cancel
                            </Button>
                            <Button>Generate Report</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

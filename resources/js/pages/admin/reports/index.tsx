import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
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
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                        <p className="text-muted-foreground">
                            Generate comprehensive reports and analyze clinic performance
                        </p>
                    </div>
                    <Button onClick={() => setShowGenerateDialog(true)} className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Generate Report
                    </Button>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{totalRevenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                Last 6 months
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{totalProfit.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                Net profit margin
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalPatients}</div>
                            <p className="text-xs text-muted-foreground">
                                Last 6 months
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Generated Reports</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{mockReportData.filter(r => r.status === 'Generated').length}</div>
                            <p className="text-xs text-muted-foreground">
                                This month
                            </p>
                        </CardContent>
                    </Card>
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
                            <Card>
                                <CardHeader>
                                    <CardTitle>Financial Performance</CardTitle>
                                    <CardDescription>Revenue vs Expenses (Last 6 months)</CardDescription>
                                </CardHeader>
                                <CardContent>
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
                                </CardContent>
                            </Card>

                            {/* Patient Demographics */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Patient Categories</CardTitle>
                                    <CardDescription>Distribution of patient types</CardDescription>
                                </CardHeader>
                                <CardContent>
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
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="financial" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Financial Reports</CardTitle>
                                <CardDescription>Generate and view financial reports</CardDescription>
                            </CardHeader>
                            <CardContent>
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
                                    <Button variant="outline">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export Data
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Month</TableHead>
                                            <TableHead>Revenue</TableHead>
                                            <TableHead>Expenses</TableHead>
                                            <TableHead>Profit</TableHead>
                                            <TableHead>Patients</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockFinancialData.map((data, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{data.month}</TableCell>
                                                <TableCell className="text-green-600">₱{data.revenue.toLocaleString()}</TableCell>
                                                <TableCell className="text-red-600">₱{data.expenses.toLocaleString()}</TableCell>
                                                <TableCell className="font-medium">₱{data.profit.toLocaleString()}</TableCell>
                                                <TableCell>{data.patientCount}</TableCell>
                                                <TableCell>
                                                    <Button variant="outline" size="sm">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="patients" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Patient Analytics</CardTitle>
                                <CardDescription>Patient demographics and trends</CardDescription>
                            </CardHeader>
                            <CardContent>
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
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reports" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Generated Reports</CardTitle>
                                <CardDescription>View and manage all generated reports</CardDescription>
                            </CardHeader>
                            <CardContent>
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
                                    <Button variant="outline">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filter
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Report Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Date Range</TableHead>
                                            <TableHead>Generated By</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Last Generated</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredReports.map((report) => (
                                            <TableRow key={report.id}>
                                                <TableCell className="font-medium">{report.name}</TableCell>
                                                <TableCell>{report.type}</TableCell>
                                                <TableCell>{report.dateRange}</TableCell>
                                                <TableCell>{report.generatedBy}</TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusBadge(report.status)}>
                                                        {report.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {report.lastGenerated}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
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
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Generate Report Dialog */}
            <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Generate New Report</DialogTitle>
                        <DialogDescription>
                            Select report type and parameters
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
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
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                            Cancel
                        </Button>
                        <Button>Generate Report</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

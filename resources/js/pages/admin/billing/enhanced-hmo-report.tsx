import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { 
    ArrowLeft, 
    CreditCard,
    DollarSign,
    TrendingUp,
    Download,
    Filter,
    FileText,
    Users,
    BarChart3,
    Plus,
    Eye,
    Calendar,
    CalendarDays,
    CalendarRange,
    Clock,
    ChevronDown
} from 'lucide-react';
import { useState } from 'react';

type Summary = {
    total_hmo_revenue: number;
    total_hmo_transactions: number;
    total_claims_amount: number;
    total_approved_amount: number;
    total_rejected_amount: number;
    total_claims_count: number;
    approved_claims_count: number;
    rejected_claims_count: number;
    approval_rate: number;
    hmo_providers_count: number;
    active_patient_coverages: number;
    pending_claims_count: number;
    paid_claims_count: number;
};

type HmoProvider = {
    id: number;
    name: string;
    code: string;
    status?: string;
    is_active?: boolean;
};

type RecentReport = {
    id: number;
    report_name: string;
    report_type: string;
    period: string;
    start_date: string;
    end_date: string;
    created_at: string;
    created_by: {
        id: number;
        name: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Reports', href: '/admin/billing/billing-reports' },
    { title: 'HMO Report', href: '/admin/billing/billing-reports/hmo' },
];

type HmoTransaction = {
    id: number;
    transaction_id: string;
    patient_name: string;
    doctor_name: string;
    total_amount: number;
    hmo_provider: string;
    payment_method: string;
    status: string;
    transaction_date: string;
    description?: string;
};

export default function EnhancedHmoReport({ 
    summary,
    hmoProviders = [],
    hmoTransactions = [],
    filters = {}
}: { 
    summary?: Summary;
    hmoProviders?: HmoProvider[];
    hmoTransactions?: HmoTransaction[];
    filters?: any;
}) {
    // Debug: Log what the component receives
    console.log('EnhancedHmoReport - Received data:', {
        hmoTransactionsCount: hmoTransactions?.length || 0,
        hmoTransactions: hmoTransactions,
        summary: summary,
        hmoProviders: hmoProviders,
        filters: filters
    });
    
    // Additional debugging
    console.log('hmoTransactions type:', typeof hmoTransactions);
    console.log('hmoTransactions is array:', Array.isArray(hmoTransactions));
    console.log('hmoTransactions length:', hmoTransactions?.length);
    console.log('hmoTransactions first item:', hmoTransactions?.[0]);
    console.log('hmoTransactions === undefined:', hmoTransactions === undefined);
    console.log('hmoTransactions === null:', hmoTransactions === null);
    
    
    const [selectedDate, setSelectedDate] = useState(filters?.date || new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState(filters?.month || new Date().toISOString().slice(0, 7));
    const [selectedYear, setSelectedYear] = useState(filters?.year || new Date().getFullYear().toString());
    const [activeTab, setActiveTab] = useState(filters?.report_type || 'daily');
    const [selectedProvider, setSelectedProvider] = useState(filters?.hmo_provider_id || 'all');
    const [isLoading, setIsLoading] = useState(false);
    const [activeViewTab, setActiveViewTab] = useState('reports');

    // Provide default values for summary
    const defaultSummary: Summary = {
        total_hmo_revenue: 0,
        total_hmo_transactions: 0,
        total_claims_amount: 0,
        total_approved_amount: 0,
        total_rejected_amount: 0,
        total_claims_count: 0,
        approved_claims_count: 0,
        rejected_claims_count: 0,
        approval_rate: 0,
        hmo_providers_count: 0,
        active_patient_coverages: 0,
        pending_claims_count: 0,
        paid_claims_count: 0,
    };

    const safeSummary = summary || defaultSummary;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const handleDailyReport = () => {
        router.get('/admin/billing/enhanced-hmo-report', {
            date: selectedDate,
            report_type: 'daily',
            hmo_provider_id: selectedProvider,
        });
    };

    const handleMonthlyReport = () => {
        router.get('/admin/billing/enhanced-hmo-report', {
            month: selectedMonth,
            report_type: 'monthly',
            hmo_provider_id: selectedProvider,
        });
    };

    const handleYearlyReport = () => {
        router.get('/admin/billing/enhanced-hmo-report', {
            year: selectedYear,
            report_type: 'yearly',
            hmo_provider_id: selectedProvider,
        });
    };

    const handleGenerateReport = () => {
        router.get('/admin/billing/enhanced-hmo-report/generate');
    };

    const handleExport = (reportType: string, format: string) => {
        const params: any = { 
            format, 
            report_type: reportType,
            hmo_provider_id: selectedProvider
        };
        
        if (reportType === 'daily') {
            params.date = selectedDate;
        } else if (reportType === 'monthly') {
            params.month = selectedMonth;
        } else if (reportType === 'yearly') {
            params.year = selectedYear;
        }

        const exportUrl = `/admin/billing/enhanced-hmo-report/export?${new URLSearchParams(params).toString()}`;
        window.open(exportUrl, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="HMO Report" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button asChild variant="outline" className="h-12 w-12">
                                <Link href="/admin/billing/billing-reports">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <Heading 
                                title="HMO Report" 
                                description="Comprehensive HMO analytics and reporting system" 
                                icon={CreditCard} 
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Button onClick={() => handleExport(activeTab, 'excel')} variant="outline">
                                <Download className="mr-2 h-5 w-5" />
                                Export Excel
                            </Button>
                            <Button onClick={() => handleExport(activeTab, 'pdf')} variant="outline">
                                <Download className="mr-2 h-5 w-5" />
                                Export PDF
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Report Type Tabs */}
                <Card className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <CardContent className="p-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="daily" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Daily Report
                                </TabsTrigger>
                                <TabsTrigger value="monthly" className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4" />
                                    Monthly Report
                                </TabsTrigger>
                                <TabsTrigger value="yearly" className="flex items-center gap-2">
                                    <CalendarRange className="h-4 w-4" />
                                    Yearly Report
                                </TabsTrigger>
                            </TabsList>

                            {/* Daily Report Tab */}
                            <TabsContent value="daily" className="mt-6">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Select Date</Label>
                                            <Input
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                            />
                                        </div>
                                        <Button onClick={handleDailyReport} className="h-12 px-6">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            Generate Daily Report
                                        </Button>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleExport('daily', 'excel')}
                                            className="h-12"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Excel
                                        </Button>
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleExport('daily', 'pdf')}
                                            className="h-12"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export PDF
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Monthly Report Tab */}
                            <TabsContent value="monthly" className="mt-6">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Select Month</Label>
                                            <Input
                                                type="month"
                                                value={selectedMonth}
                                                onChange={(e) => setSelectedMonth(e.target.value)}
                                                className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                            />
                                        </div>
                                        <Button onClick={handleMonthlyReport} className="h-12 px-6">
                                            <CalendarDays className="mr-2 h-4 w-4" />
                                            Generate Monthly Report
                                        </Button>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleExport('monthly', 'excel')}
                                            className="h-12"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Excel
                                        </Button>
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleExport('monthly', 'pdf')}
                                            className="h-12"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export PDF
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Yearly Report Tab */}
                            <TabsContent value="yearly" className="mt-6">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Select Year</Label>
                                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                                <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from({ length: 10 }, (_, i) => {
                                                        const year = new Date().getFullYear() - i;
                                                        return (
                                                            <SelectItem key={year} value={year.toString()}>
                                                                {year}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button onClick={handleYearlyReport} className="h-12 px-6">
                                            <CalendarRange className="mr-2 h-4 w-4" />
                                            Generate Yearly Report
                                        </Button>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleExport('yearly', 'excel')}
                                            className="h-12"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Excel
                                        </Button>
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleExport('yearly', 'pdf')}
                                            className="h-12"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export PDF
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Additional Filters */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">HMO Provider</Label>
                                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                                        <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Providers</SelectItem>
                                            {hmoProviders && hmoProviders.length > 0 ? hmoProviders.map((provider) => (
                                                <SelectItem key={provider.id} value={provider.id.toString()}>
                                                    {provider.name} ({provider.code})
                                                </SelectItem>
                                            )) : null}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-2 text-gray-600">Loading HMO data...</span>
                    </div>
                ) : (
                    <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(safeSummary.total_hmo_revenue)}</div>
                                    <div className="text-sm text-gray-600">Total HMO Revenue</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <CreditCard className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{safeSummary.total_hmo_transactions}</div>
                                    <div className="text-sm text-gray-600">Total Transactions</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(safeSummary.total_approved_amount)}</div>
                                    <div className="text-sm text-gray-600">Approved Amount</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Clock className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{safeSummary.pending_claims_count}</div>
                                    <div className="text-sm text-gray-600">Pending Claims</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <BarChart3 className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{safeSummary.approval_rate.toFixed(1)}%</div>
                                    <div className="text-sm text-gray-600">Approval Rate</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs for different views */}
                <Tabs value={activeViewTab} onValueChange={setActiveViewTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="providers">Providers</TabsTrigger>
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                    </TabsList>


                    <TabsContent value="providers">
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                    <CreditCard className="h-5 w-5 text-black" />
                                    HMO Providers
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
                                            <TableRow className="hover:bg-gray-50">
                                                <TableHead className="font-semibold text-gray-700">Provider</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Code</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {!hmoProviders || hmoProviders.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8">
                                                        <div className="flex flex-col items-center">
                                                            <CreditCard className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                            <h3 className="mb-2 text-lg font-semibold text-gray-600">No HMO providers found</h3>
                                                            <p className="text-gray-500">Add HMO providers to start tracking</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                hmoProviders && hmoProviders.length > 0 ? hmoProviders.map((provider) => (
                                                    <TableRow key={provider.id} className="hover:bg-gray-50">
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1 bg-gray-100 rounded-full">
                                                                    <CreditCard className="h-4 w-4 text-black" />
                                                                </div>
                                                                {provider.name}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {provider.code}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                (provider.status === 'active' || provider.is_active === true) 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {provider.status || (provider.is_active ? 'active' : 'inactive')}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )) : null
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>


                    <TabsContent value="reports">
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                    <CreditCard className="h-5 w-5 text-black" />
                                    HMO Transactions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
                                            <TableRow className="hover:bg-gray-50">
                                                <TableHead className="font-semibold text-gray-700">Transaction ID</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Patient</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Doctor</TableHead>
                                                <TableHead className="font-semibold text-gray-700">HMO Provider</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {!hmoTransactions || hmoTransactions.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8">
                                                        <div className="flex flex-col items-center">
                                                            <CreditCard className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                            <h3 className="mb-2 text-lg font-semibold text-gray-600">No HMO transactions found</h3>
                                                            <p className="text-gray-500">HMO transactions will appear here when available</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                hmoTransactions && hmoTransactions.length > 0 ? hmoTransactions.map((transaction) => (
                                                    <TableRow key={transaction.id} className="hover:bg-gray-50">
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1 bg-gray-100 rounded-full">
                                                                    <CreditCard className="h-4 w-4 text-black" />
                                                                </div>
                                                                {transaction.transaction_id}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {transaction.patient_name}
                                                        </TableCell>
                                                        <TableCell>
                                                            {transaction.doctor_name}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                                {transaction.hmo_provider}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="font-semibold text-green-600">
                                                            {formatCurrency(transaction.total_amount)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                transaction.status === 'paid' 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : transaction.status === 'pending'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {transaction.status}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-gray-600">
                                                            {new Date(transaction.transaction_date).toLocaleDateString()}
                                                        </TableCell>
                                                    </TableRow>
                                                )) : null
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                        </Tabs>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

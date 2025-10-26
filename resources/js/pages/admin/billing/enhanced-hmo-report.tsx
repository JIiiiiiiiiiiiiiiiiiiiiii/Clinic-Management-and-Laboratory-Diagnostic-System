import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
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
    ChevronDown,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search
} from 'lucide-react';
import { useState } from 'react';
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table';
import * as React from 'react';

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

// Column definitions for HMO Providers table
const createHmoProviderColumns = (): ColumnDef<HmoProvider>[] => [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Provider
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <div className="p-1 bg-gray-100 rounded-full">
                    <CreditCard className="h-4 w-4 text-black" />
                </div>
                <div className="font-medium">{row.getValue("name")}</div>
            </div>
        ),
    },
    {
        accessorKey: "code",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Code
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-center font-semibold">{row.getValue("code")}</div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const provider = row.original;
            const isActive = provider.status === 'active' || provider.is_active === true;
            return (
                <Badge variant={isActive ? "success" : "destructive"}>
                    {provider.status || (provider.is_active ? 'active' : 'inactive')}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const provider = row.original;
            return (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                    </Button>
                </div>
            );
        },
    },
];

// Column definitions for HMO Transactions table
const createHmoTransactionColumns = (): ColumnDef<HmoTransaction>[] => [
    {
        accessorKey: "transaction_id",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Transaction ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("transaction_id")}</div>
        ),
    },
    {
        accessorKey: "patient_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Patient
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("patient_name")}</div>
        ),
    },
    {
        accessorKey: "doctor_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Doctor
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-gray-600">{row.getValue("doctor_name")}</div>
        ),
    },
    {
        accessorKey: "hmo_provider",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    HMO Provider
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-100 rounded-full">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                </div>
                <div className="font-medium">{row.getValue("hmo_provider")}</div>
            </div>
        ),
    },
    {
        accessorKey: "total_amount",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-semibold text-green-600">
                ₱{row.getValue("total_amount")?.toLocaleString()}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const variantMap = {
                completed: 'success',
                pending: 'warning',
                failed: 'destructive',
                cancelled: 'destructive'
            };
            
            return (
                <Badge variant={variantMap[status as keyof typeof variantMap] as any}>
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "transaction_date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-sm text-gray-600">
                {new Date(row.getValue("transaction_date")).toLocaleDateString()}
            </div>
        ),
    },
];

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

    // TanStack Table state for HMO Providers
    const [providerSorting, setProviderSorting] = React.useState<SortingState>([]);
    const [providerColumnFilters, setProviderColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [providerColumnVisibility, setProviderColumnVisibility] = React.useState<VisibilityState>({});
    const [providerRowSelection, setProviderRowSelection] = React.useState({});
    const [providerGlobalFilter, setProviderGlobalFilter] = React.useState('');

    // TanStack Table state for HMO Transactions
    const [transactionSorting, setTransactionSorting] = React.useState<SortingState>([]);
    const [transactionColumnFilters, setTransactionColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [transactionColumnVisibility, setTransactionColumnVisibility] = React.useState<VisibilityState>({});
    const [transactionRowSelection, setTransactionRowSelection] = React.useState({});
    const [transactionGlobalFilter, setTransactionGlobalFilter] = React.useState('');

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

    // Initialize HMO Providers table
    const providerColumns = createHmoProviderColumns();
    const providerTable = useReactTable({
        data: hmoProviders || [],
        columns: providerColumns,
        onSortingChange: setProviderSorting,
        onColumnFiltersChange: setProviderColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setProviderColumnVisibility,
        onRowSelectionChange: setProviderRowSelection,
        onGlobalFilterChange: setProviderGlobalFilter,
        globalFilterFn: (row, columnId, value) => {
            const search = value.toLowerCase();
            const provider = row.original;
            return (
                provider.name?.toLowerCase().includes(search) ||
                provider.code?.toLowerCase().includes(search)
            );
        },
        state: {
            sorting: providerSorting,
            columnFilters: providerColumnFilters,
            columnVisibility: providerColumnVisibility,
            rowSelection: providerRowSelection,
            globalFilter: providerGlobalFilter,
        },
    });

    // Initialize HMO Transactions table
    const transactionColumns = createHmoTransactionColumns();
    const transactionTable = useReactTable({
        data: hmoTransactions || [],
        columns: transactionColumns,
        onSortingChange: setTransactionSorting,
        onColumnFiltersChange: setTransactionColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setTransactionColumnVisibility,
        onRowSelectionChange: setTransactionRowSelection,
        onGlobalFilterChange: setTransactionGlobalFilter,
        globalFilterFn: (row, columnId, value) => {
            const search = value.toLowerCase();
            const transaction = row.original;
            return (
                transaction.transaction_id?.toLowerCase().includes(search) ||
                transaction.patient_name?.toLowerCase().includes(search) ||
                transaction.doctor_name?.toLowerCase().includes(search) ||
                transaction.hmo_provider?.toLowerCase().includes(search)
            );
        },
        state: {
            sorting: transactionSorting,
            columnFilters: transactionColumnFilters,
            columnVisibility: transactionColumnVisibility,
            rowSelection: transactionRowSelection,
            globalFilter: transactionGlobalFilter,
        },
    });

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
                                {/* Table Controls */}
                                <div className="flex items-center py-4">
                                    <Input
                                        placeholder="Search HMO providers..."
                                        value={providerGlobalFilter ?? ""}
                                        onChange={(event) => setProviderGlobalFilter(event.target.value)}
                                        className="max-w-sm"
                                    />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="ml-auto">
                                                Columns <ChevronDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                                            {providerTable
                                                .getAllColumns()
                                                .filter((column) => column.getCanHide())
                                                .map((column) => {
                                                    return (
                                                        <DropdownMenuCheckboxItem
                                                            key={column.id}
                                                            className="capitalize"
                                                            checked={column.getIsVisible()}
                                                            onCheckedChange={(value) => {
                                                                column.toggleVisibility(!!value);
                                                            }}
                                                            onSelect={(e) => {
                                                                e.preventDefault();
                                                            }}
                                                        >
                                                            {column.id}
                                                        </DropdownMenuCheckboxItem>
                                                    )
                                                })}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* HMO Providers Table */}
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            {providerTable.getHeaderGroups().map((headerGroup) => (
                                                <TableRow key={headerGroup.id}>
                                                    {headerGroup.headers.map((header) => {
                                                        return (
                                                            <TableHead key={header.id}>
                                                                {header.isPlaceholder
                                                                    ? null
                                                                    : flexRender(
                                                                        header.column.columnDef.header,
                                                                        header.getContext()
                                                                )}
                                                            </TableHead>
                                                        )
                                                    })}
                                                </TableRow>
                                            ))}
                                        </TableHeader>
                                        <TableBody>
                                            {providerTable.getRowModel().rows?.length ? (
                                                providerTable.getRowModel().rows.map((row) => (
                                                    <TableRow
                                                        key={row.id}
                                                        data-state={row.getIsSelected() && "selected"}
                                                    >
                                                        {row.getVisibleCells().map((cell) => (
                                                            <TableCell key={cell.id}>
                                                                {flexRender(
                                                                    cell.column.columnDef.cell,
                                                                    cell.getContext()
                                                                )}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={providerColumns.length}
                                                        className="h-24 text-center"
                                                    >
                                                        <div className="flex flex-col items-center">
                                                            <CreditCard className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                            <h3 className="mb-2 text-lg font-semibold text-gray-600">No HMO providers found</h3>
                                                            <p className="text-gray-500">Add HMO providers to start tracking</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                
                                {/* Pagination */}
                                <div className="flex items-center justify-between px-2 py-4">
                                    <div className="text-muted-foreground flex-1 text-sm">
                                        {providerTable.getFilteredSelectedRowModel().rows.length} of{" "}
                                        {providerTable.getFilteredRowModel().rows.length} row(s) selected.
                                    </div>
                                    <div className="flex items-center space-x-6 lg:space-x-8">
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm font-medium">Rows per page</p>
                                            <Select
                                                value={`${providerTable.getState().pagination.pageSize}`}
                                                onValueChange={(value) => {
                                                    providerTable.setPageSize(Number(value))
                                                }}
                                            >
                                                <SelectTrigger className="h-8 w-[70px]">
                                                    <SelectValue placeholder={providerTable.getState().pagination.pageSize} />
                                                </SelectTrigger>
                                                <SelectContent side="top">
                                                    {[10, 20, 30, 40, 50].map((pageSize) => (
                                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                                            {pageSize}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                            Page {providerTable.getState().pagination.pageIndex + 1} of{" "}
                                            {providerTable.getPageCount()}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="hidden size-8 lg:flex"
                                                onClick={() => providerTable.setPageIndex(0)}
                                                disabled={!providerTable.getCanPreviousPage()}
                                            >
                                                <span className="sr-only">Go to first page</span>
                                                <ChevronsLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => providerTable.previousPage()}
                                                disabled={!providerTable.getCanPreviousPage()}
                                            >
                                                <span className="sr-only">Go to previous page</span>
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => providerTable.nextPage()}
                                                disabled={!providerTable.getCanNextPage()}
                                            >
                                                <span className="sr-only">Go to next page</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="hidden size-8 lg:flex"
                                                onClick={() => providerTable.setPageIndex(providerTable.getPageCount() - 1)}
                                                disabled={!providerTable.getCanNextPage()}
                                            >
                                                <span className="sr-only">Go to last page</span>
                                                <ChevronsRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
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
                                {/* Table Controls */}
                                <div className="flex items-center py-4">
                                    <Input
                                        placeholder="Search HMO transactions..."
                                        value={transactionGlobalFilter ?? ""}
                                        onChange={(event) => setTransactionGlobalFilter(event.target.value)}
                                        className="max-w-sm"
                                    />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="ml-auto">
                                                Columns <ChevronDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                                            {transactionTable
                                                .getAllColumns()
                                                .filter((column) => column.getCanHide())
                                                .map((column) => {
                                                    return (
                                                        <DropdownMenuCheckboxItem
                                                            key={column.id}
                                                            className="capitalize"
                                                            checked={column.getIsVisible()}
                                                            onCheckedChange={(value) => {
                                                                column.toggleVisibility(!!value);
                                                            }}
                                                            onSelect={(e) => {
                                                                e.preventDefault();
                                                            }}
                                                        >
                                                            {column.id}
                                                        </DropdownMenuCheckboxItem>
                                                    )
                                                })}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* HMO Transactions Table */}
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            {transactionTable.getHeaderGroups().map((headerGroup) => (
                                                <TableRow key={headerGroup.id}>
                                                    {headerGroup.headers.map((header) => {
                                                        return (
                                                            <TableHead key={header.id}>
                                                                {header.isPlaceholder
                                                                    ? null
                                                                    : flexRender(
                                                                        header.column.columnDef.header,
                                                                        header.getContext()
                                                                )}
                                                            </TableHead>
                                                        )
                                                    })}
                                                </TableRow>
                                            ))}
                                        </TableHeader>
                                        <TableBody>
                                            {transactionTable.getRowModel().rows?.length ? (
                                                transactionTable.getRowModel().rows.map((row) => (
                                                    <TableRow
                                                        key={row.id}
                                                        data-state={row.getIsSelected() && "selected"}
                                                    >
                                                        {row.getVisibleCells().map((cell) => (
                                                            <TableCell key={cell.id}>
                                                                {flexRender(
                                                                    cell.column.columnDef.cell,
                                                                    cell.getContext()
                                                                )}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={transactionColumns.length}
                                                        className="h-24 text-center"
                                                    >
                                                        <div className="flex flex-col items-center">
                                                            <CreditCard className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                            <h3 className="mb-2 text-lg font-semibold text-gray-600">No HMO transactions found</h3>
                                                            <p className="text-gray-500">HMO transactions will appear here when available</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                
                                {/* Pagination */}
                                <div className="flex items-center justify-between px-2 py-4">
                                    <div className="text-muted-foreground flex-1 text-sm">
                                        {transactionTable.getFilteredSelectedRowModel().rows.length} of{" "}
                                        {transactionTable.getFilteredRowModel().rows.length} row(s) selected.
                                    </div>
                                    <div className="flex items-center space-x-6 lg:space-x-8">
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm font-medium">Rows per page</p>
                                            <Select
                                                value={`${transactionTable.getState().pagination.pageSize}`}
                                                onValueChange={(value) => {
                                                    transactionTable.setPageSize(Number(value))
                                                }}
                                            >
                                                <SelectTrigger className="h-8 w-[70px]">
                                                    <SelectValue placeholder={transactionTable.getState().pagination.pageSize} />
                                                </SelectTrigger>
                                                <SelectContent side="top">
                                                    {[10, 20, 30, 40, 50].map((pageSize) => (
                                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                                            {pageSize}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                            Page {transactionTable.getState().pagination.pageIndex + 1} of{" "}
                                            {transactionTable.getPageCount()}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="hidden size-8 lg:flex"
                                                onClick={() => transactionTable.setPageIndex(0)}
                                                disabled={!transactionTable.getCanPreviousPage()}
                                            >
                                                <span className="sr-only">Go to first page</span>
                                                <ChevronsLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => transactionTable.previousPage()}
                                                disabled={!transactionTable.getCanPreviousPage()}
                                            >
                                                <span className="sr-only">Go to previous page</span>
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => transactionTable.nextPage()}
                                                disabled={!transactionTable.getCanNextPage()}
                                            >
                                                <span className="sr-only">Go to next page</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="hidden size-8 lg:flex"
                                                onClick={() => transactionTable.setPageIndex(transactionTable.getPageCount() - 1)}
                                                disabled={!transactionTable.getCanNextPage()}
                                            >
                                                <span className="sr-only">Go to last page</span>
                                                <ChevronsRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
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

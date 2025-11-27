    import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportDatePicker } from '@/components/ui/report-date-picker';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
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
import { 
    Calendar as CalendarIcon, Coins, Download, FileText, MoreHorizontal, TrendingUp,
    ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, FileDown,
    Users
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { DateRange } from 'react-day-picker';

interface Transaction {
    id: number;
    patient_name: string;
    doctor_name: string;
    total_amount: number; // Final amount after discounts
    original_amount?: number; // Original amount before discounts
    discount_amount?: number; // Regular discount amount
    senior_discount_amount?: number; // Senior citizen discount amount
    payment_method: string;
    transaction_date: string;
    status: string;
}

interface Summary {
    total_revenue: number;
    total_transactions: number;
    average_transaction: number;
    date_from: string;
    date_to: string;
}

interface FinancialReportsProps {
    filter: string;
    date: string;
    reportType: string;
    data: {
        total_transactions: number;
        pending_transactions: number;
        completed_transactions: number;
        completion_rate: number;
        payment_summary: Record<string, number>;
        transaction_details: Transaction[];
        period: string;
        start_date: string;
        end_date: string;
    };
    transactions?: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    summary: Summary;
    chartData?: {
        monthly_revenue: Array<{ month: string; revenue: number }>;
        payment_methods: Array<{ payment_method: string; count: number; amount: number }>;
    };
    filterOptions?: {
        doctors: Array<{ id: number; name: string }>;
        departments: string[];
        statuses: string[];
        payment_methods: string[];
        hmo_providers: string[];
    };
    metadata?: {
        generated_at: string;
        generated_by: string;
        generated_by_role: string;
        system_version: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/admin/reports' },
    { title: 'Financial Reports', href: '/admin/reports/financial' },
];

// Column definitions for the data table
const createColumns = (): ColumnDef<Transaction>[] => [
    {
        accessorKey: 'id',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3 text-left justify-start w-full"
                >
                    Transaction ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium text-left">#{row.getValue("id")}</div>
        ),
    },
    {
        accessorKey: 'patient_name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3 text-left justify-start w-full"
                >
                    Patient Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium text-left">{row.getValue("patient_name")}</div>
        ),
    },
    {
        accessorKey: 'doctor_name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3 text-left justify-start w-full"
                >
                    Doctor
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-left">{row.getValue("doctor_name")}</div>
        ),
    },
    {
        accessorKey: 'total_amount',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3 text-right justify-end w-full"
                >
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const transaction = row.original;
            const amount = parseFloat(String(transaction.total_amount || '0'));
            const originalAmount = parseFloat(String(transaction.original_amount || '0'));
            const discountAmount = parseFloat(String(transaction.discount_amount || '0'));
            const seniorDiscountAmount = parseFloat(String(transaction.senior_discount_amount || '0'));
            
            const formatted = new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
            }).format(amount);
            
            return (
                <div className="text-right font-medium">
                    <div className="text-green-600">{formatted}</div>
                    {originalAmount > amount && (
                        <div className="text-xs text-gray-500">
                            Original: {new Intl.NumberFormat('en-PH', {
                                style: 'currency',
                                currency: 'PHP',
                            }).format(originalAmount)}
                            {discountAmount > 0 && (
                                <span className="ml-2 text-blue-600">
                                    (-{new Intl.NumberFormat('en-PH', {
                                        style: 'currency',
                                        currency: 'PHP',
                                    }).format(discountAmount)} discount)
                                </span>
                            )}
                            {seniorDiscountAmount > 0 && (
                                <span className="ml-2 text-green-600">
                                    (-{new Intl.NumberFormat('en-PH', {
                                        style: 'currency',
                                        currency: 'PHP',
                                    }).format(seniorDiscountAmount)} senior)
                                </span>
                            )}
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'payment_method',
        header: ({ column }) => {
            return (
                <div className="text-left font-medium w-full">Payment Method</div>
            )
        },
        cell: ({ row }) => (
            <div className="text-left">{row.getValue("payment_method")}</div>
        ),
    },
    {
        accessorKey: 'transaction_date',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3 text-center justify-center w-full"
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = new Date(row.getValue("transaction_date"));
            return (
                <div className="text-sm text-center">
                    {date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    })}
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => {
            return (
                <div className="text-left font-medium w-full">Status</div>
            )
        },
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <div className="text-left">
                    {status === 'paid' ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">paid</Badge>
                    ) : (
                        <Badge variant="secondary">{status}</Badge>
                    )}
                </div>
            );
        },
    },
];

export default function FinancialReports({ filter, date, reportType, data, transactions, summary, chartData, filterOptions, metadata }: FinancialReportsProps) {
    // Debug logging for props
    console.log('FinancialReports props:', {
        filter,
        date,
        reportType,
        data,
        transactions,
        summary
    });
    // Create data structure from available props if data is not provided
    const reportData = data || {
        total_transactions: transactions?.data?.length || 0,
        pending_transactions: transactions?.data?.filter(t => t.status === 'pending').length || 0,
        completed_transactions: transactions?.data?.filter(t => t.status === 'paid').length || 0,
        completion_rate: transactions?.data?.length ? 
            ((transactions.data.filter(t => t.status === 'paid').length / transactions.data.length) * 100) : 0,
        payment_summary: transactions?.data?.reduce((acc, t) => {
            acc[t.payment_method] = (acc[t.payment_method] || 0) + 1;
            return acc;
        }, {} as Record<string, number>) || {},
        transaction_details: transactions?.data || [],
        period: filter === 'daily' 
            ? `Daily Report - ${new Date(date).toLocaleDateString()}`
            : filter === 'monthly' 
            ? `Monthly Report - ${new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`
            : `Yearly Report - ${new Date(date).getFullYear()}`,
        start_date: summary?.date_from || date,
        end_date: summary?.date_to || date
    };

    // Calculate dynamic data based on current filter and date
    // Use props directly (filter, date, reportType) instead of state to ensure data updates when URL changes
    const getFilteredData = () => {
        // Use data prop if available (filtered from backend), otherwise fallback to transactions
        // Check if transaction_details is empty array and fallback to transactions.data
        const dataTransactions = data?.transaction_details;
        const hasDataTransactions = Array.isArray(dataTransactions) && dataTransactions.length > 0;
        const currentTransactions = hasDataTransactions ? dataTransactions : (transactions?.data || []);
        
        // Use props directly, not state, to ensure we get the latest values from URL
        const activeFilter = filter || currentFilter;
        const activeDate = date || currentDate;
        
        // Debug logging
        console.log('getFilteredData - activeFilter (from props):', activeFilter);
        console.log('getFilteredData - activeDate (from props):', activeDate);
        console.log('getFilteredData - data prop:', data);
        console.log('getFilteredData - transactions prop:', transactions);
        console.log('getFilteredData - currentTransactions length:', currentTransactions.length);
        console.log('getFilteredData - currentTransactions sample:', currentTransactions.slice(0, 2));
        
        const total = currentTransactions.length;
        const pending = currentTransactions.filter(t => t.status === 'pending').length;
        const completed = currentTransactions.filter(t => t.status === 'paid').length;
        const completionRate = total > 0 ? (completed / total) * 100 : 0;
        
        // Calculate revenue based on filtered transactions
        const totalRevenue = currentTransactions.reduce((sum, t) => {
            const amount = typeof t.total_amount === 'string' ? parseFloat(t.total_amount) : (t.total_amount || 0);
            return sum + amount;
        }, 0);
        const averageTransaction = total > 0 ? totalRevenue / total : 0;
        
        // Payment summary from filtered data - include both count and amount
        const paymentSummary = currentTransactions.reduce((acc, t) => {
            const method = t.payment_method || 'Unknown';
            if (!acc[method]) {
                acc[method] = { count: 0, amount: 0 };
            }
            acc[method].count += 1;
            const amount = typeof t.total_amount === 'string' ? parseFloat(t.total_amount) : (t.total_amount || 0);
            acc[method].amount += amount;
            return acc;
        }, {} as Record<string, { count: number; amount: number }>);

        const result = {
            total_transactions: total,
            pending_transactions: pending,
            completed_transactions: completed,
            completion_rate: completionRate,
            total_revenue: totalRevenue,
            average_transaction: averageTransaction,
            payment_summary: paymentSummary,
            transaction_details: currentTransactions,
            period: activeFilter === 'daily' 
                ? `Daily Report - ${new Date(activeDate).toLocaleDateString()}`
                : activeFilter === 'monthly' 
                ? `Monthly Report - ${new Date(activeDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`
                : `Yearly Report - ${new Date(activeDate).getFullYear()}`
        };
        
        console.log('getFilteredData - result:', result);
        return result;
    };

    const [currentFilter, setCurrentFilter] = useState(filter);
    const [currentDate, setCurrentDate] = useState(date);
    const [currentReportType, setCurrentReportType] = useState(reportType);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [search, setSearch] = useState('');

    // Update state when props change (e.g., when URL changes)
    useEffect(() => {
        setCurrentFilter(filter);
        setCurrentDate(date);
        setCurrentReportType(reportType);
    }, [filter, date, reportType]);

    // Recalculate filtered data when filter or date changes
    const [filteredData, setFilteredData] = useState(() => getFilteredData());

    // Update filtered data when data prop changes (new data from backend)
    useEffect(() => {
        setFilteredData(getFilteredData());
    }, [data, transactions, filter, date, reportType]);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
        to: new Date(), // Today
    });


    // Filter handlers
    const handleFilterChange = (newFilter: string) => {
        setCurrentFilter(newFilter);
        setIsLoading(true);
        router.get('/admin/reports/financial', {
            filter: newFilter,
            date: currentDate,
            report_type: currentReportType
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false)
        });
    };

    const handleDateChange = (newDate: string) => {
        setCurrentDate(newDate);
        setIsLoading(true);
        router.get('/admin/reports/financial', {
            filter: currentFilter,
            date: newDate,
            report_type: currentReportType
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false)
        });
    };

    const handleReportTypeChange = (newReportType: string) => {
        setCurrentReportType(newReportType);
        setIsLoading(true);
        router.get('/admin/reports/financial', {
            filter: currentFilter,
            date: currentDate,
            report_type: newReportType
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false)
        });
    };


    // TanStack Table state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState(search);

    // Initialize table
    const columns = createColumns();
    const table = useReactTable({
        data: filteredData.transaction_details || [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, columnId, value) => {
            const search = value.toLowerCase();
            const transaction = row.original;
            return (
                transaction.patient_name?.toLowerCase().includes(search) ||
                transaction.doctor_name?.toLowerCase().includes(search) ||
                transaction.payment_method?.toLowerCase().includes(search) ||
                transaction.status?.toLowerCase().includes(search)
            );
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    });

    const handleExport = async (format: 'excel' | 'pdf') => {
        try {
            setIsExporting(true);
            const params = new URLSearchParams({
                filter: currentFilter,
                date: currentDate,
                report_type: currentReportType,
                format,
                // Include additional context for the export
                total_transactions: (transactions?.data?.length || 0).toString(),
                total_revenue: summary.total_revenue.toString()
            });
            
            if (format === 'excel') {
                window.location.href = `/admin/reports/financial/export/excel?${params}`;
            } else {
                window.location.href = `/admin/reports/financial/export/pdf?${params}`;
            }

            setTimeout(() => {
                setIsExporting(false);
            }, 2000);
        } catch (error) {
            console.error('Export failed:', error);
            setIsExporting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs as any}>
            <Head title="Financial Reports" />
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
                    {/* Dynamic Filter Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {currentReportType === 'all' ? (
                            <>
                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                                                <p className="text-3xl font-bold">{formatCurrency(filteredData.total_revenue || 0)}</p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today\'s Revenue' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
                                            <Coins className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm font-medium">Total Transactions</p>
                                                <p className="text-3xl font-bold">{(filteredData.total_transactions || 0).toLocaleString()}</p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today\'s Count' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
                                            <FileText className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm font-medium">Completion Rate</p>
                                                <p className="text-3xl font-bold">{(filteredData.completion_rate || 0).toFixed(1)}%</p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {filteredData.completed_transactions || 0} of {filteredData.total_transactions || 0} completed
                                                </p>
                                            </div>
                                            <TrendingUp className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm font-medium">Pending Transactions</p>
                                                <p className="text-3xl font-bold">{(filteredData.pending_transactions || 0).toLocaleString()}</p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {(filteredData.total_transactions || 0) > 0 ? 
                                                        (((filteredData.pending_transactions || 0) / (filteredData.total_transactions || 1)) * 100).toFixed(1) : 0
                                                    }% of total
                                                </p>
                                            </div>
                                            <CalendarIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : currentReportType === 'cash' ? (
                            <>
                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm font-medium">Cash Revenue</p>
                                                <p className="text-3xl font-bold">{formatCurrency(filteredData.total_revenue || 0)}</p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today\'s Cash' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
                                            <Coins className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm font-medium">Cash Transactions</p>
                                                <p className="text-3xl font-bold">{(filteredData.total_transactions || 0).toLocaleString()}</p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today\'s Count' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
                                            <FileText className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm font-medium">Completion Rate</p>
                                                <p className="text-3xl font-bold">{(filteredData.completion_rate || 0).toFixed(1)}%</p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {filteredData.completed_transactions || 0} of {filteredData.total_transactions || 0} completed
                                                </p>
                                            </div>
                                            <TrendingUp className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm font-medium">Pending Cash</p>
                                                <p className="text-3xl font-bold">{(filteredData.pending_transactions || 0).toLocaleString()}</p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {(filteredData.total_transactions || 0) > 0 ? 
                                                        (((filteredData.pending_transactions || 0) / (filteredData.total_transactions || 1)) * 100).toFixed(1) : 0
                                                    }% of total
                                                </p>
                                            </div>
                                            <CalendarIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : currentReportType === 'hmo' ? (
                            <>
                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm font-medium">HMO Revenue</p>
                                                <p className="text-3xl font-bold">{formatCurrency(filteredData.total_revenue || 0)}</p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today\'s HMO' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
                                            <Coins className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm font-medium">HMO Transactions</p>
                                                <p className="text-3xl font-bold">{(filteredData.total_transactions || 0).toLocaleString()}</p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today\'s Count' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
                                            <FileText className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm font-medium">Completion Rate</p>
                                                <p className="text-3xl font-bold">{(filteredData.completion_rate || 0).toFixed(1)}%</p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {filteredData.completed_transactions || 0} of {filteredData.total_transactions || 0} completed
                                                </p>
                                            </div>
                                            <TrendingUp className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm font-medium">Pending HMO</p>
                                                <p className="text-3xl font-bold">{(filteredData.pending_transactions || 0).toLocaleString()}</p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {(filteredData.total_transactions || 0) > 0 ? 
                                                        (((filteredData.pending_transactions || 0) / (filteredData.total_transactions || 1)) * 100).toFixed(1) : 0
                                                    }% of total
                                                </p>
                                            </div>
                                            <CalendarIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : null}
                    </div>

                    {/* Filter Controls */}
                    <div className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            <div className="space-y-2 w-full">
                                <Label className="text-sm font-semibold text-gray-800 mb-2 block">
                                    Report Type {isLoading && <span className="text-blue-500">(Loading...)</span>}
                                </Label>
                                <select
                                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={currentReportType}
                                    onChange={(e) => handleReportTypeChange(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="all">All Payment Methods</option>
                                    <option value="cash">Cash Payments Only</option>
                                    <option value="hmo">HMO Payments Only</option>
                                </select>
                            </div>

                            <div className="space-y-2 w-full">
                                <Label className="text-sm font-semibold text-gray-800 mb-2 block">
                                    Time Period {isLoading && <span className="text-blue-500">(Loading...)</span>}
                                </Label>
                                <select
                                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={currentFilter}
                                    onChange={(e) => handleFilterChange(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                            
                            <div className="space-y-2 w-full">
                                <Label className="text-sm font-semibold text-gray-800 mb-2 block">
                                    Select Date {isLoading && <span className="text-blue-500">(Loading...)</span>}
                                </Label>
                                <ReportDatePicker
                                    date={currentDate ? new Date(currentDate) : undefined}
                                    onDateChange={(date: Date | undefined) => {
                                        if (date) {
                                            // Use local date formatting to avoid timezone issues
                                            const year = date.getFullYear();
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const day = String(date.getDate()).padStart(2, '0');
                                            
                                            let formattedDate: string;
                                            if (currentFilter === 'monthly') {
                                                formattedDate = `${year}-${month}`;
                                            } else if (currentFilter === 'yearly') {
                                                formattedDate = year.toString();
                                            } else {
                                                formattedDate = `${year}-${month}-${day}`;
                                            }
                                            
                                            handleDateChange(formattedDate);
                                        } else {
                                            handleDateChange('');
                                        }
                                    }}
                                    filter={currentFilter as 'daily' | 'monthly' | 'yearly'}
                                    placeholder={`Select ${currentFilter} date`}
                                />
                            </div>

                            <div className="w-full">
                                <Label className="text-sm font-semibold text-gray-800 mb-2 block">Period</Label>
                                <div className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm flex items-center">
                                    {filteredData.period}
                                </div>
                            </div>

                            <div className="w-full flex items-end">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                <Button 
                                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl w-full h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading}
                                >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Report
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleExport('excel')}>
                                            <FileDown className="mr-2 h-4 w-4" />
                                            Excel Spreadsheet
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('pdf')}>
                                            <FileDown className="mr-2 h-4 w-4" />
                                            PDF Report
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-8" />

                    {/* Summary Table */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Summary</h3>
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentReportType === 'all' ? (
                                        <>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Transactions</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.total_transactions || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">100%</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Pending Transactions</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.pending_transactions || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {(filteredData.total_transactions || 0) > 0 ? (((filteredData.pending_transactions || 0) / (filteredData.total_transactions || 1)) * 100).toFixed(1) : 0}%
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Completed Transactions</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.completed_transactions || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {(filteredData.total_transactions || 0) > 0 ? (((filteredData.completed_transactions || 0) / (filteredData.total_transactions || 1)) * 100).toFixed(1) : 0}%
                                                </td>
                                            </tr>
                                        </>
                                    ) : currentReportType === 'cash' ? (
                                        <>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Cash Transactions</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.total_transactions || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">100%</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Pending Cash</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.pending_transactions || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {(filteredData.total_transactions || 0) > 0 ? (((filteredData.pending_transactions || 0) / (filteredData.total_transactions || 1)) * 100).toFixed(1) : 0}%
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Completed Cash</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.completed_transactions || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {(filteredData.total_transactions || 0) > 0 ? (((filteredData.completed_transactions || 0) / (filteredData.total_transactions || 1)) * 100).toFixed(1) : 0}%
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Cash Amount</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(
                                                        filteredData.payment_summary && typeof filteredData.payment_summary['cash'] === 'object' 
                                                            ? (filteredData.payment_summary['cash'] as any).amount 
                                                            : (filteredData.payment_summary && typeof filteredData.payment_summary['cash'] === 'number' 
                                                                ? 0 
                                                                : (data?.summary?.cash_total || 0))
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                                            </tr>
                                        </>
                                    ) : currentReportType === 'hmo' ? (
                                        <>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">HMO Transactions</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.total_transactions || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">100%</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Pending HMO</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.pending_transactions || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {(filteredData.total_transactions || 0) > 0 ? (((filteredData.pending_transactions || 0) / (filteredData.total_transactions || 1)) * 100).toFixed(1) : 0}%
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Completed HMO</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.completed_transactions || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {(filteredData.total_transactions || 0) > 0 ? (((filteredData.completed_transactions || 0) / (filteredData.total_transactions || 1)) * 100).toFixed(1) : 0}%
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">HMO Amount</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(
                                                        filteredData.payment_summary && typeof filteredData.payment_summary['hmo'] === 'object' 
                                                            ? (filteredData.payment_summary['hmo'] as any).amount 
                                                            : (filteredData.payment_summary && typeof filteredData.payment_summary['hmo'] === 'number' 
                                                                ? 0 
                                                                : (data?.summary?.hmo_total || 0))
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                                            </tr>
                                        </>
                                    ) : null}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payment Summary Table */}
                    {filteredData.payment_summary && Object.keys(filteredData.payment_summary).length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredData.payment_summary && Object.entries(filteredData.payment_summary).map(([paymentMethod, paymentData]) => {
                                            // Handle both old format (number) and new format (object with count and amount)
                                            const count = typeof paymentData === 'object' && paymentData !== null ? (paymentData as any).count : (paymentData as number);
                                            const amount = typeof paymentData === 'object' && paymentData !== null ? (paymentData as any).amount : 0;
                                            const totalTransactions = filteredData.total_transactions || 0;
                                            const percentage = totalTransactions > 0 ? ((count / totalTransactions) * 100) : 0;
                                            return (
                                            <tr key={paymentMethod}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{paymentMethod}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{count}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                                    {formatCurrency(amount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {percentage.toFixed(1)}%
                                                </td>
                                            </tr>
                                        );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Transaction Details Table */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-gray-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="h-4 w-4" />
                                    <span>{(filteredData.transaction_details || []).length} transactions found</span>
                                </div>
                            </div>
                        </div>

                        {(filteredData.transaction_details || []).length === 0 ? (
                            <div className="py-16 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                <div className="text-gray-400 mb-4">
                                    <Coins className="h-12 w-12 mx-auto" />
                                </div>
                                <p className="text-lg font-semibold text-gray-700 mb-2">No transactions found</p>
                                <p className="text-gray-500">No financial transactions found for the selected period</p>
                            </div>
                        ) : (
                            <Card className="bg-white border border-gray-200">
                                <CardContent className="p-4 sm:p-6">
                                    {/* Table Controls */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 py-4">
                                        <Input
                                            placeholder="Search transactions..."
                                            value={globalFilter ?? ""}
                                            onChange={(event) => setGlobalFilter(event.target.value)}
                                            className="w-full sm:max-w-sm"
                                        />
                                        <Button
                                            onClick={() => handleExport('excel')}
                                            disabled={isExporting}
                                            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            <span className="hidden sm:inline">Export Excel</span>
                                            <span className="sm:hidden">Excel</span>
                                        </Button>
                                        <Button
                                            onClick={() => handleExport('pdf')}
                                            disabled={isExporting}
                                            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                                        >
                                            <FileDown className="h-4 w-4 mr-2" />
                                            <span className="hidden sm:inline">Export PDF</span>
                                            <span className="sm:hidden">PDF</span>
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="w-full sm:w-auto sm:ml-auto">
                                                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                                                {table
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

                                    {/* Table */}
                                    <div className="rounded-md border overflow-x-auto">
                                        <div className="inline-block min-w-full align-middle">
                                            <Table>
                                                <TableHeader>
                                                    {table.getHeaderGroups().map((headerGroup) => (
                                                        <TableRow key={headerGroup.id}>
                                                            {headerGroup.headers.map((header) => {
                                                                return (
                                                                    <TableHead key={header.id} className="whitespace-nowrap">
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
                                                    {table.getRowModel().rows?.length ? (
                                                        table.getRowModel().rows.map((row) => (
                                                            <TableRow
                                                                key={row.id}
                                                                data-state={row.getIsSelected() && "selected"}
                                                            >
                                                                {row.getVisibleCells().map((cell) => (
                                                                    <TableCell key={cell.id} className="whitespace-nowrap">
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
                                                                colSpan={columns.length}
                                                                className="h-24 text-center"
                                                            >
                                                                No results.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    {/* Pagination */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 px-2 py-4">
                                        <div className="text-muted-foreground text-sm text-center sm:text-left">
                                            {table.getFilteredSelectedRowModel().rows.length} of{" "}
                                            {table.getFilteredRowModel().rows.length} row(s) selected.
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:space-x-6 lg:space-x-8">
                                            <div className="flex items-center space-x-2">
                                                <p className="text-sm font-medium hidden sm:inline">Rows per page</p>
                                                <p className="text-sm font-medium sm:hidden">Per page</p>
                                                <Select
                                                    value={`${table.getState().pagination.pageSize}`}
                                                    onValueChange={(value) => {
                                                        table.setPageSize(Number(value))
                                                    }}
                                                >
                                                    <SelectTrigger className="h-8 w-[70px]">
                                                        <SelectValue placeholder={table.getState().pagination.pageSize} />
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
                                                Page {table.getState().pagination.pageIndex + 1} of{" "}
                                                {table.getPageCount()}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="hidden size-8 lg:flex"
                                                    onClick={() => table.setPageIndex(0)}
                                                    disabled={!table.getCanPreviousPage()}
                                                >
                                                    <span className="sr-only">Go to first page</span>
                                                    <ChevronsLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-8"
                                                    onClick={() => table.previousPage()}
                                                    disabled={!table.getCanPreviousPage()}
                                                >
                                                    <span className="sr-only">Go to previous page</span>
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-8"
                                                    onClick={() => table.nextPage()}
                                                    disabled={!table.getCanNextPage()}
                                                >
                                                    <span className="sr-only">Go to next page</span>
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="hidden size-8 lg:flex"
                                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                                    disabled={!table.getCanNextPage()}
                                                >
                                                    <span className="sr-only">Go to last page</span>
                                                    <ChevronsRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
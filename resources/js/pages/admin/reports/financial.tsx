    import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomDatePicker } from '@/components/ui/date-picker';
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
    Calendar as CalendarIcon, DollarSign, Download, FileText, MoreHorizontal, TrendingUp,
    ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, FileDown,
    Users
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { DateRange } from 'react-day-picker';

interface Transaction {
    id: number;
    patient_name: string;
    doctor_name: string;
    total_amount: number;
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
                    className="h-8 px-2 lg:px-3"
                >
                    Transaction ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">#{row.getValue("id")}</div>
        ),
    },
    {
        accessorKey: 'patient_name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Patient Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("patient_name")}</div>
        ),
    },
    {
        accessorKey: 'doctor_name',
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
            <div>{row.getValue("doctor_name")}</div>
        ),
    },
    {
        accessorKey: 'total_amount',
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
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('total_amount') || '0');
            const formatted = new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
            }).format(amount);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: 'payment_method',
        header: "Payment Method",
        cell: ({ row }) => (
            <div>{row.getValue("payment_method")}</div>
        ),
    },
    {
        accessorKey: 'transaction_date',
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
        cell: ({ row }) => {
            const date = new Date(row.getValue("transaction_date"));
            return (
                <div className="text-sm">
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
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
                    {status}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const transaction = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(transaction.id.toString())}
                        >
                            Copy transaction ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            View details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Edit transaction
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
];

export default function FinancialReports({ filter, date, data, transactions, summary, chartData, filterOptions, metadata }: FinancialReportsProps) {
    // Debug logging for props
    console.log('FinancialReports props:', {
        filter,
        date,
        data,
        transactions,
        summary
    });
    // Create data structure from available props if data is not provided
    const reportData = data || {
        total_transactions: transactions?.data?.length || 0,
        pending_transactions: transactions?.data?.filter(t => t.status === 'pending').length || 0,
        completed_transactions: transactions?.data?.filter(t => t.status === 'completed').length || 0,
        completion_rate: transactions?.data?.length ? 
            ((transactions.data.filter(t => t.status === 'completed').length / transactions.data.length) * 100) : 0,
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
    const getFilteredData = () => {
        // Use data prop if available (filtered from backend), otherwise fallback to transactions
        const currentTransactions = data?.transaction_details || transactions?.data || [];
        
        // Debug logging
        console.log('getFilteredData - currentFilter:', currentFilter);
        console.log('getFilteredData - currentDate:', currentDate);
        console.log('getFilteredData - data prop:', data);
        console.log('getFilteredData - transactions prop:', transactions);
        console.log('getFilteredData - currentTransactions length:', currentTransactions.length);
        console.log('getFilteredData - currentTransactions sample:', currentTransactions.slice(0, 2));
        
        const total = currentTransactions.length;
        const pending = currentTransactions.filter(t => t.status === 'pending').length;
        const completed = currentTransactions.filter(t => t.status === 'completed').length;
        const completionRate = total > 0 ? (completed / total) * 100 : 0;
        
        // Calculate revenue based on filtered transactions
        const totalRevenue = currentTransactions.reduce((sum, t) => {
            const amount = typeof t.total_amount === 'string' ? parseFloat(t.total_amount) : (t.total_amount || 0);
            return sum + amount;
        }, 0);
        const averageTransaction = total > 0 ? totalRevenue / total : 0;
        
        // Payment summary from filtered data
        const paymentSummary = currentTransactions.reduce((acc, t) => {
            const method = t.payment_method || 'Unknown';
            acc[method] = (acc[method] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const result = {
            total_transactions: total,
            pending_transactions: pending,
            completed_transactions: completed,
            completion_rate: completionRate,
            total_revenue: totalRevenue,
            average_transaction: averageTransaction,
            payment_summary: paymentSummary,
            transaction_details: currentTransactions,
            period: currentFilter === 'daily' 
                ? `Daily Report - ${new Date(currentDate).toLocaleDateString()}`
                : currentFilter === 'monthly' 
                ? `Monthly Report - ${new Date(currentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`
                : `Yearly Report - ${new Date(currentDate).getFullYear()}`
        };
        
        console.log('getFilteredData - result:', result);
        return result;
    };

    const [currentFilter, setCurrentFilter] = useState(filter);
    const [currentDate, setCurrentDate] = useState(date);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [search, setSearch] = useState('');

    // Recalculate filtered data when filter or date changes
    const [filteredData, setFilteredData] = useState(() => getFilteredData());

    // Update filtered data when data prop changes (new data from backend)
    useEffect(() => {
        setFilteredData(getFilteredData());
    }, [data, transactions]);
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
            date: currentDate
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
            date: newDate
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
                format,
                // Include additional context for the export
                report_type: 'financial',
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
                        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm font-medium">Filtered Revenue</p>
                                        <p className="text-3xl font-bold">{formatCurrency(filteredData.total_revenue || 0)}</p>
                                        <p className="text-green-100 text-xs mt-1">
                                            {currentFilter === 'daily' ? 'Today\'s Revenue' : 
                                             currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                        </p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-green-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm font-medium">Filtered Transactions</p>
                                        <p className="text-3xl font-bold">{(filteredData.total_transactions || 0).toLocaleString()}</p>
                                        <p className="text-blue-100 text-xs mt-1">
                                            {currentFilter === 'daily' ? 'Today\'s Count' : 
                                             currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                        </p>
                                    </div>
                                    <FileText className="h-8 w-8 text-blue-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm font-medium">Completion Rate</p>
                                        <p className="text-3xl font-bold">{(filteredData.completion_rate || 0).toFixed(1)}%</p>
                                        <p className="text-purple-100 text-xs mt-1">
                                            {filteredData.completed_transactions || 0} of {filteredData.total_transactions || 0} completed
                                        </p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-purple-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-100 text-sm font-medium">Pending Transactions</p>
                                        <p className="text-3xl font-bold">{(filteredData.pending_transactions || 0).toLocaleString()}</p>
                                        <p className="text-orange-100 text-xs mt-1">
                                            {(filteredData.total_transactions || 0) > 0 ? 
                                                (((filteredData.pending_transactions || 0) / (filteredData.total_transactions || 1)) * 100).toFixed(1) : 0
                                            }% of total
                                        </p>
                                    </div>
                                    <CalendarIcon className="h-8 w-8 text-orange-200" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filter Controls */}
                    <div className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2 w-full">
                                <Label className="text-sm font-semibold text-gray-800 mb-2 block">Report Type</Label>
                                <select
                                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={currentFilter}
                                    onChange={(e) => handleFilterChange(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="daily">Daily Report</option>
                                    <option value="monthly">Monthly Report</option>
                                    <option value="yearly">Yearly Report</option>
                                </select>
                            </div>
                            
                            <div className="w-full">
                                <CustomDatePicker
                                    label={currentFilter === 'daily' ? 'Select Date' : currentFilter === 'monthly' ? 'Select Month' : 'Select Year'}
                                    date={currentDate ? new Date(currentDate) : undefined}
                                    setDate={(date: Date | undefined) => handleDateChange(date ? date.toISOString().split('T')[0] : '')}
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
                                    className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl w-full h-12 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Completion Rate</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(filteredData.completion_rate || 0).toFixed(1)}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                                    </tr>
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredData.payment_summary && Object.entries(filteredData.payment_summary).map(([paymentMethod, count]) => (
                                            <tr key={paymentMethod}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{paymentMethod}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{count}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {(filteredData.total_transactions || 0) > 0 ? ((count / (filteredData.total_transactions || 1)) * 100).toFixed(1) : 0}%
                                                </td>
                                            </tr>
                                        ))}
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
                                    <DollarSign className="h-12 w-12 mx-auto" />
                                </div>
                                <p className="text-lg font-semibold text-gray-700 mb-2">No transactions found</p>
                                <p className="text-gray-500">No financial transactions found for the selected period</p>
                            </div>
                        ) : (
                            <Card className="bg-white border border-gray-200">
                                <CardContent className="p-6">
                                    {/* Table Controls */}
                                    <div className="flex items-center py-4">
                                        <Input
                                            placeholder="Search transactions..."
                                            value={globalFilter ?? ""}
                                            onChange={(event) => setGlobalFilter(event.target.value)}
                                            className="max-w-sm"
                                        />
                                        <Button
                                            onClick={() => handleExport('excel')}
                                            disabled={isExporting}
                                            className="bg-green-600 hover:bg-green-700 text-white ml-4"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Export Excel
                                        </Button>
                                        <Button
                                            onClick={() => handleExport('pdf')}
                                            disabled={isExporting}
                                            variant="outline"
                                            className="ml-2"
                                        >
                                            <FileDown className="h-4 w-4 mr-2" />
                                            Export PDF
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="ml-auto">
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
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                {table.getHeaderGroups().map((headerGroup) => (
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
                                                {table.getRowModel().rows?.length ? (
                                                    table.getRowModel().rows.map((row) => (
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

                                    {/* Pagination */}
                                    <div className="flex items-center justify-between px-2 py-4">
                                        <div className="text-muted-foreground flex-1 text-sm">
                                            {table.getFilteredSelectedRowModel().rows.length} of{" "}
                                            {table.getFilteredRowModel().rows.length} row(s) selected.
                                        </div>
                                        <div className="flex items-center space-x-6 lg:space-x-8">
                                            <div className="flex items-center space-x-2">
                                                <p className="text-sm font-medium">Rows per page</p>
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
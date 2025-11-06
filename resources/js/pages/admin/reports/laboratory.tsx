import { PatientInfoCard } from '@/components/patient/PatientPageLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ReportDatePicker } from '@/components/ui/report-date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
    AlertCircle,
    ArrowUpDown,
    BarChart3,
    CheckCircle,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Clock,
    Download,
    FileDown,
    FlaskConical,
    Link as LinkIcon,
    TestTube,
    TrendingUp,
    Users,
} from 'lucide-react';
import * as React from 'react';
import { useEffect, useState } from 'react';

type LabTest = { id: number; name: string; code: string };
type Patient = { id: number; first_name: string; last_name: string };
type OrderDetail = {
    order_id: number;
    patient_name: string;
    patient_id: number;
    tests_ordered: string;
    status: string;
    ordered_at: string;
    ordered_by: string;
};

type ReportData = {
    total_orders: number;
    pending_orders: number;
    completed_orders: number;
    completion_rate: number;
    test_summary: Record<string, number>;
    order_details: OrderDetail[];
    period: string;
    start_date: string;
    end_date: string;
};

type AnalyticsData = {
    most_used_tests?: Array<{
        id: number;
        name: string;
        code: string;
        count: number;
    }>;
    most_common_combinations?: Array<{
        test_ids: number[];
        test_names: string[];
        display_name: string;
        count: number;
    }>;
};

type LaboratoryReportsIndexProps = {
    filter: string;
    date: string;
    data: ReportData;
    availableTests: LabTest[];
    analytics?: AnalyticsData;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/admin/reports' },
    { title: 'Laboratory Reports', href: '/admin/reports/laboratory' },
];

// Column definitions for the laboratory orders table
const columns: ColumnDef<OrderDetail>[] = [
    {
        accessorKey: 'order_id',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-8 px-2 lg:px-3">
                    Order #
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => <div className="font-medium">#{row.getValue('order_id')}</div>,
    },
    {
        accessorKey: 'patient_name',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-8 px-2 lg:px-3">
                    Patient Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const order = row.original;
            return (
                <div>
                    <div className="font-medium">{order.patient_name}</div>
                    <div className="text-xs text-gray-500">ID: {order.patient_id}</div>
                </div>
            );
        },
    },
    {
        accessorKey: 'tests_ordered',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-8 px-2 lg:px-3">
                    Tests Ordered
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const tests = row.getValue('tests_ordered') as string;
            return (
                <div className="max-w-xs truncate" title={tests}>
                    {tests}
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-8 px-2 lg:px-3">
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            const getStatusIcon = (status: string) => {
                switch (status.toLowerCase()) {
                    case 'completed':
                        return <CheckCircle className="h-4 w-4 text-green-500" />;
                    case 'processing':
                        return <Clock className="h-4 w-4 text-blue-500" />;
                    case 'ordered':
                        return <AlertCircle className="h-4 w-4 text-orange-500" />;
                    default:
                        return <AlertCircle className="h-4 w-4 text-gray-500" />;
                }
            };
            const getStatusColor = (status: string) => {
                switch (status.toLowerCase()) {
                    case 'completed':
                        return 'bg-green-100 text-green-800 border-green-200';
                    case 'processing':
                        return 'bg-blue-100 text-blue-800 border-blue-200';
                    case 'ordered':
                        return 'bg-orange-100 text-orange-800 border-orange-200';
                    default:
                        return 'bg-gray-100 text-gray-800 border-gray-200';
                }
            };
            return (
                <Badge className={`${getStatusColor(status)} border`}>
                    {getStatusIcon(status)}
                    <span className="ml-1">{status}</span>
                </Badge>
            );
        },
    },
    {
        accessorKey: 'ordered_at',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-8 px-2 lg:px-3">
                    Ordered At
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const date = new Date(row.getValue('ordered_at'));
            return (
                <div className="text-sm">
                    {date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </div>
            );
        },
    },
    {
        accessorKey: 'ordered_by',
        header: 'Ordered By',
        cell: ({ row }) => <div className="text-sm">{row.getValue('ordered_by')}</div>,
    },
];

export default function LaboratoryReportsIndex({
    filter,
    date,
    data,
    availableTests,
    analytics = { most_used_tests: [], most_common_combinations: [] },
}: LaboratoryReportsIndexProps) {
    const [currentFilter, setCurrentFilter] = useState(filter);
    const [currentDate, setCurrentDate] = useState(date);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Handle data updates when props change
    useEffect(() => {
        console.log('Laboratory data updated:', {
            filter,
            date,
            data,
            orderDetailsCount: data?.order_details?.length || 0,
        });
    }, [filter, date, data]);

    // TanStack Table state
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = React.useState('');

    const handleFilterChange = (newFilter: string) => {
        setCurrentFilter(newFilter);
        setIsLoading(true);
        router.get(
            '/admin/reports/laboratory',
            {
                filter: newFilter,
                date: currentDate,
            },
            {
                preserveState: false,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleDateChange = (newDate: string) => {
        setCurrentDate(newDate);
        setIsLoading(true);
        router.get(
            '/admin/reports/laboratory',
            {
                filter: currentFilter,
                date: newDate,
            },
            {
                preserveState: false,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleExport = async (format: 'excel' | 'pdf') => {
        try {
            setIsExporting(true);
            const params = new URLSearchParams({
                filter: currentFilter,
                date: currentDate,
                format,
            });

            if (format === 'excel') {
                window.location.href = `/admin/laboratory-reports/export/excel?${params}`;
            } else {
                window.location.href = `/admin/laboratory-reports/export/pdf?${params}`;
            }

            setTimeout(() => {
                setIsExporting(false);
            }, 2000);
        } catch (error) {
            console.error('Export failed:', error);
            setIsExporting(false);
        }
    };

    // Initialize table
    const table = useReactTable({
        data: data.order_details || [],
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
            const order = row.original;
            return (
                order.patient_name?.toLowerCase().includes(search) ||
                order.tests_ordered?.toLowerCase().includes(search) ||
                order.status?.toLowerCase().includes(search) ||
                order.ordered_by?.toLowerCase().includes(search) ||
                order.order_id?.toString().includes(search)
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

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'processing':
                return <Clock className="h-4 w-4 text-blue-500" />;
            case 'ordered':
                return <AlertCircle className="h-4 w-4 text-orange-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'processing':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ordered':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laboratory Reports" />
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Insight Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border border-gray-200 bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                    <p className="text-3xl font-bold text-gray-900">{data.total_orders}</p>
                                    <p className="mt-1 text-xs text-gray-500">All time orders</p>
                                </div>
                                <div className="rounded-full border p-3">
                                    <TestTube className="h-6 w-6 text-gray-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-gray-200 bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-3xl font-bold text-gray-900">{data.completed_orders}</p>
                                    <p className="mt-1 text-xs text-gray-500">{data.completion_rate.toFixed(1)}% completion rate</p>
                                </div>
                                <div className="rounded-full border p-3">
                                    <CheckCircle className="h-6 w-6 text-gray-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-gray-200 bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-3xl font-bold text-gray-900">{data.pending_orders}</p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {data.total_orders > 0 ? ((data.pending_orders / data.total_orders) * 100).toFixed(1) : 0}% of total
                                    </p>
                                </div>
                                <div className="rounded-full border p-3">
                                    <Clock className="h-6 w-6 text-gray-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-gray-200 bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Test Types</p>
                                    <p className="text-3xl font-bold text-gray-900">{Object.keys(data.test_summary).length}</p>
                                    <p className="mt-1 text-xs text-gray-500">Different test types</p>
                                </div>
                                <div className="rounded-full border p-3">
                                    <TrendingUp className="h-6 w-6 text-gray-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Analytics Cards - Most Used Tests & Combinations */}
                <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Most Used Tests */}
                    <Card className="border border-gray-200 bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FlaskConical className="h-5 w-5 text-blue-600" />
                                Most Frequently Used Tests
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {analytics?.most_used_tests && analytics.most_used_tests.length > 0 ? (
                                <div className="space-y-3">
                                    {analytics.most_used_tests.map((test, index) => (
                                        <div key={test.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{test.name}</p>
                                                    <p className="text-xs text-gray-500">{test.code}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">{test.count}</p>
                                                <p className="text-xs text-gray-500">times used</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-4 text-center text-sm text-gray-500">No test usage data available</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Most Common Combinations */}
                    <Card className="border border-gray-200 bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LinkIcon className="h-5 w-5 text-green-600" />
                                Most Common Test Combinations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {analytics?.most_common_combinations && analytics.most_common_combinations.length > 0 ? (
                                <div className="space-y-3">
                                    {analytics.most_common_combinations.map((combination, index) => (
                                        <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                            <div className="flex flex-1 items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                                                    {index + 1}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium text-gray-900">{combination.display_name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {combination.test_names.length} test{combination.test_names.length > 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="ml-2 text-right">
                                                <p className="font-bold text-gray-900">{combination.count}</p>
                                                <p className="text-xs text-gray-500">orders</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-4 text-center text-sm text-gray-500">No combination data available</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Unified Reports Interface */}
                <PatientInfoCard title="Laboratory Reports" icon={<BarChart3 className="h-5 w-5 text-black" />}>
                    {/* Filter Controls */}
                    <div className="mb-8">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <div className="w-full space-y-2">
                                <Label className="mb-2 block text-sm font-semibold text-gray-800">
                                    Time Period {isLoading && <span className="text-blue-500">(Loading...)</span>}
                                </Label>
                                <select
                                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={currentFilter}
                                    onChange={(e) => handleFilterChange(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>

                            <div className="w-full space-y-2">
                                <Label className="mb-2 block text-sm font-semibold text-gray-800">
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
                                <Label className="mb-2 block text-sm font-semibold text-gray-800">Period</Label>
                                <div className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                                    {data.period}
                                </div>
                            </div>

                            <div className="flex w-full items-end">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            className="h-12 w-full rounded-xl bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-gray-700 hover:shadow-xl"
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
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Report Summary</h3>
                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Metric</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Value</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Percentage</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    <tr>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">Total Orders</td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{data.total_orders}</td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">100%</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">Pending Orders</td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{data.pending_orders}</td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                            {data.total_orders > 0 ? ((data.pending_orders / data.total_orders) * 100).toFixed(1) : 0}%
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">Completed Orders</td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{data.completed_orders}</td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                            {data.total_orders > 0 ? ((data.completed_orders / data.total_orders) * 100).toFixed(1) : 0}%
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">Completion Rate</td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{data.completion_rate}%</td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Test Summary Table */}
                    {Object.keys(data.test_summary).length > 0 && (
                        <div className="mb-8">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Test Summary</h3>
                            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Test Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Count</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Percentage
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {Object.entries(data.test_summary).map(([testType, count]) => (
                                            <tr key={testType}>
                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{testType}</td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{count}</td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                                    {data.total_orders > 0 ? ((count / data.total_orders) * 100).toFixed(1) : 0}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Order Details Table */}
                    <div className="mb-6">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-gray-100 p-2">
                                    <TrendingUp className="h-5 w-5 text-gray-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="h-4 w-4" />
                                    <span>{data.order_details.length} orders found</span>
                                </div>
                            </div>
                        </div>

                        {data.order_details.length === 0 ? (
                            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-16 text-center">
                                <div className="mb-4 text-gray-400">
                                    <BarChart3 className="mx-auto h-12 w-12" />
                                </div>
                                <p className="mb-2 text-lg font-semibold text-gray-700">No orders found</p>
                                <p className="text-gray-500">No laboratory orders found for the selected period</p>
                            </div>
                        ) : (
                            <Card className="border border-gray-200 bg-white">
                                <CardContent className="p-6">
                                    {/* Table Controls */}
                                    <div className="flex items-center py-4">
                                        <Input
                                            placeholder="Search orders..."
                                            value={globalFilter ?? ''}
                                            onChange={(event) => setGlobalFilter(event.target.value)}
                                            className="max-w-sm"
                                        />
                                        <Button
                                            onClick={() => handleExport('excel')}
                                            disabled={isExporting}
                                            className="ml-4 bg-green-600 text-white hover:bg-green-700"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Excel
                                        </Button>
                                        <Button onClick={() => handleExport('pdf')} disabled={isExporting} variant="outline" className="ml-2">
                                            <FileDown className="mr-2 h-4 w-4" />
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
                                                        );
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
                                                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                                                </TableHead>
                                                            );
                                                        })}
                                                    </TableRow>
                                                ))}
                                            </TableHeader>
                                            <TableBody>
                                                {table.getRowModel().rows?.length ? (
                                                    table.getRowModel().rows.map((row) => (
                                                        <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                                            {row.getVisibleCells().map((cell) => (
                                                                <TableCell key={cell.id}>
                                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                                            No results.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Pagination */}
                                    <div className="flex items-center justify-between px-2 py-4">
                                        <div className="flex-1 text-sm text-muted-foreground">
                                            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
                                            selected.
                                        </div>
                                        <div className="flex items-center space-x-6 lg:space-x-8">
                                            <div className="flex items-center space-x-2">
                                                <p className="text-sm font-medium">Rows per page</p>
                                                <Select
                                                    value={`${table.getState().pagination.pageSize}`}
                                                    onValueChange={(value) => {
                                                        table.setPageSize(Number(value));
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
                                                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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
                </PatientInfoCard>
            </div>
        </AppLayout>
    );
}

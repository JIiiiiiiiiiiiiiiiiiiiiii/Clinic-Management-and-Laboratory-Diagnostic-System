import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ReportDatePicker } from '@/components/ui/report-date-picker';
import { PatientInfoCard } from '@/components/patient/PatientPageLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { BarChart3, FileDown, Filter, Search, Eye, Calendar, TestTube, Users, TrendingUp, Download, Clock, CheckCircle, AlertCircle, ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
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

type LaboratoryReportsIndexProps = {
    filter: string;
    date: string;
    data: ReportData;
    availableTests: LabTest[];
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
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Order #
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">#{row.getValue("order_id")}</div>
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
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Tests Ordered
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const tests = row.getValue("tests_ordered") as string;
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
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
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
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Ordered At
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = new Date(row.getValue("ordered_at"));
            return (
                <div className="text-sm">
                    {date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            );
        },
    },
    {
        accessorKey: 'ordered_by',
        header: "Ordered By",
        cell: ({ row }) => (
            <div className="text-sm">{row.getValue("ordered_by")}</div>
        ),
    },
];

export default function LaboratoryReportsIndex({ filter, date, data, availableTests }: LaboratoryReportsIndexProps) {
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
            orderDetailsCount: data?.order_details?.length || 0
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
        router.get('/admin/reports/laboratory', {
            filter: newFilter,
            date: currentDate
        }, {
            preserveState: false,
            onFinish: () => setIsLoading(false)
        });
    };

    const handleDateChange = (newDate: string) => {
        setCurrentDate(newDate);
        setIsLoading(true);
        router.get('/admin/reports/laboratory', {
            filter: currentFilter,
            date: newDate
        }, {
            preserveState: false,
            onFinish: () => setIsLoading(false)
        });
    };

    const handleExport = async (format: 'excel' | 'pdf') => {
        try {
            setIsExporting(true);
            const params = new URLSearchParams({
                filter: currentFilter,
                date: currentDate,
                format
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
            minute: '2-digit'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laboratory Reports" />
            <div className="min-h-screen bg-gray-50 p-6">

                {/* Insight Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Total Orders</p>
                                    <p className="text-3xl font-bold">{data.total_orders}</p>
                                    <p className="text-blue-100 text-xs mt-1">All time orders</p>
                                </div>
                                <TestTube className="h-8 w-8 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium">Completed</p>
                                    <p className="text-3xl font-bold">{data.completed_orders}</p>
                                    <p className="text-green-100 text-xs mt-1">
                                        {data.completion_rate.toFixed(1)}% completion rate
                                    </p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm font-medium">Pending</p>
                                    <p className="text-3xl font-bold">{data.pending_orders}</p>
                                    <p className="text-orange-100 text-xs mt-1">
                                        {data.total_orders > 0 ? ((data.pending_orders / data.total_orders) * 100).toFixed(1) : 0}% of total
                                    </p>
                                </div>
                                <Clock className="h-8 w-8 text-orange-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">Test Types</p>
                                    <p className="text-3xl font-bold">{Object.keys(data.test_summary).length}</p>
                                    <p className="text-purple-100 text-xs mt-1">Different test types</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-purple-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Unified Reports Interface */}
                <PatientInfoCard
                    title="Laboratory Reports"
                    icon={<BarChart3 className="h-5 w-5 text-black" />}
                >
                    {/* Filter Controls */}
                    <div className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                    {data.period}
                                </div>
                            </div>

                            <div className="w-full flex items-end">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl w-full h-12"
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Orders</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.total_orders}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">100%</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Pending Orders</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.pending_orders}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {data.total_orders > 0 ? ((data.pending_orders / data.total_orders) * 100).toFixed(1) : 0}%
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Completed Orders</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.completed_orders}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {data.total_orders > 0 ? ((data.completed_orders / data.total_orders) * 100).toFixed(1) : 0}%
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Completion Rate</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.completion_rate}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Test Summary Table */}
                    {Object.keys(data.test_summary).length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Summary</h3>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {Object.entries(data.test_summary).map(([testType, count]) => (
                                            <tr key={testType}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{testType}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{count}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
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
                            <div className="py-16 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                <div className="text-gray-400 mb-4">
                                    <BarChart3 className="h-12 w-12 mx-auto" />
                                </div>
                                <p className="text-lg font-semibold text-gray-700 mb-2">No orders found</p>
                                <p className="text-gray-500">No laboratory orders found for the selected period</p>
                            </div>
                        ) : (
                            <Card className="bg-white border border-gray-200">
                                <CardContent className="p-6">
                                    {/* Table Controls */}
                                    <div className="flex items-center py-4">
                                        <Input
                                            placeholder="Search orders..."
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
                </PatientInfoCard>
            </div>
        </AppLayout>
    );
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { PatientInfoCard } from '@/components/patient/PatientPageLayout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Package, 
    BarChart3,
    Download,
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Calendar,
    FileText,
    Filter,
    Users,
    FlaskConical,
    Clock,
    DollarSign,
    Activity,
    Plus,
    Eye,
    Trash2,
    Save,
    ArrowUpDown,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
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

type UsedRejectedData = {
    summary: {
        total_items: number;
        total_consumed: number;
        total_rejected: number;
        low_stock_items: number;
        out_of_stock_items: number;
    };
    department_stats: {
        doctor_nurse: {
            total_items: number;
            total_consumed: number;
            total_rejected: number;
            low_stock: number;
        };
        med_tech: {
            total_items: number;
            total_consumed: number;
            total_rejected: number;
            low_stock: number;
        };
    };
    top_consumed_items: any[];
    top_rejected_items: any[];
    consumption_trends: any[];
    date_range: {
        start: string;
        end: string;
        label: string;
    };
};

interface UsedRejectedReportProps {
    data: UsedRejectedData;
    filters: {
        period?: string;
        start_date?: string;
        end_date?: string;
        department?: string;
    };
    report_id?: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Management',
        href: '/admin/inventory',
    },
    {
        title: 'Reports',
        href: '/admin/inventory/reports',
    },
    {
        title: 'Used/Rejected Supplies',
        href: '/admin/inventory/reports/used-rejected',
    },
];

// Column definitions for Top Consumed Items table
const consumedItemsColumns: ColumnDef<any>[] = [
    {
        accessorKey: 'item_name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Item Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("item_name")}</div>
        ),
    },
    {
        accessorKey: 'quantity_consumed',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Quantity Consumed
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-center">{row.getValue("quantity_consumed")}</div>
        ),
    },
    {
        accessorKey: 'unit',
        header: "Unit",
        cell: ({ row }) => (
            <div className="text-sm">{row.getValue("unit")}</div>
        ),
    },
    {
        accessorKey: 'total_cost',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Total Cost
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">₱{Number(row.getValue("total_cost") || 0).toFixed(2)}</div>
        ),
    },
    {
        accessorKey: 'department',
        header: "Department",
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize">
                {row.getValue("department")}
            </Badge>
        ),
    },
];

// Column definitions for Top Rejected Items table
const rejectedItemsColumns: ColumnDef<any>[] = [
    {
        accessorKey: 'item_name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Item Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("item_name")}</div>
        ),
    },
    {
        accessorKey: 'quantity_rejected',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Quantity Rejected
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-center">{row.getValue("quantity_rejected")}</div>
        ),
    },
    {
        accessorKey: 'unit',
        header: "Unit",
        cell: ({ row }) => (
            <div className="text-sm">{row.getValue("unit")}</div>
        ),
    },
    {
        accessorKey: 'total_cost',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Total Cost
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">₱{Number(row.getValue("total_cost") || 0).toFixed(2)}</div>
        ),
    },
    {
        accessorKey: 'reason',
        header: "Reason",
        cell: ({ row }) => (
            <div className="text-sm max-w-[200px] truncate" title={row.getValue("reason")}>
                {row.getValue("reason") || 'N/A'}
            </div>
        ),
    },
];

export default function UsedRejectedReport({
    data,
    filters,
    report_id,
}: UsedRejectedReportProps) {
    const [selectedFormat, setSelectedFormat] = useState('pdf');
    const [saveReport, setSaveReport] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // TanStack Table state for Top Consumed Items
    const [consumedSorting, setConsumedSorting] = React.useState<SortingState>([]);
    const [consumedColumnFilters, setConsumedColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [consumedColumnVisibility, setConsumedColumnVisibility] = React.useState<VisibilityState>({});
    const [consumedRowSelection, setConsumedRowSelection] = React.useState({});
    const [consumedGlobalFilter, setConsumedGlobalFilter] = React.useState('');

    // TanStack Table state for Top Rejected Items
    const [rejectedSorting, setRejectedSorting] = React.useState<SortingState>([]);
    const [rejectedColumnFilters, setRejectedColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [rejectedColumnVisibility, setRejectedColumnVisibility] = React.useState<VisibilityState>({});
    const [rejectedRowSelection, setRejectedRowSelection] = React.useState({});
    const [rejectedGlobalFilter, setRejectedGlobalFilter] = React.useState('');

    const handleExport = (format: string) => {
        // Create export URL with current filters
        const params = new URLSearchParams();
        params.append('format', format);
        if (filters.period) params.append('period', filters.period);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        if (filters.department) params.append('department', filters.department);
        
        const exportUrl = `/admin/inventory/reports/used-rejected/export?${params.toString()}`;
        window.open(exportUrl, '_blank');
    };

    const handleGenerateReport = () => {
        const params = new URLSearchParams();
        if (filters.period) params.append('period', filters.period);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        if (filters.department) params.append('department', filters.department);
        if (saveReport) params.append('save_report', '1');

        router.visit(`/admin/inventory/reports/used-rejected?${params.toString()}`);
    };

    // Initialize Top Consumed Items table
    const consumedTable = useReactTable({
        data: data.top_consumed_items || [],
        columns: consumedItemsColumns,
        onSortingChange: setConsumedSorting,
        onColumnFiltersChange: setConsumedColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setConsumedColumnVisibility,
        onRowSelectionChange: setConsumedRowSelection,
        onGlobalFilterChange: setConsumedGlobalFilter,
        globalFilterFn: (row, columnId, value) => {
            const search = value.toLowerCase();
            const item = row.original;
            return (
                item.item_name?.toLowerCase().includes(search) ||
                item.department?.toLowerCase().includes(search) ||
                item.unit?.toLowerCase().includes(search) ||
                item.reason?.toLowerCase().includes(search)
            );
        },
        state: {
            sorting: consumedSorting,
            columnFilters: consumedColumnFilters,
            columnVisibility: consumedColumnVisibility,
            rowSelection: consumedRowSelection,
            globalFilter: consumedGlobalFilter,
        },
    });

    // Initialize Top Rejected Items table
    const rejectedTable = useReactTable({
        data: data.top_rejected_items || [],
        columns: rejectedItemsColumns,
        onSortingChange: setRejectedSorting,
        onColumnFiltersChange: setRejectedColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setRejectedColumnVisibility,
        onRowSelectionChange: setRejectedRowSelection,
        onGlobalFilterChange: setRejectedGlobalFilter,
        globalFilterFn: (row, columnId, value) => {
            const search = value.toLowerCase();
            const item = row.original;
            return (
                item.item_name?.toLowerCase().includes(search) ||
                item.department?.toLowerCase().includes(search) ||
                item.unit?.toLowerCase().includes(search) ||
                item.reason?.toLowerCase().includes(search)
            );
        },
        state: {
            sorting: rejectedSorting,
            columnFilters: rejectedColumnFilters,
            columnVisibility: rejectedColumnVisibility,
            rowSelection: rejectedRowSelection,
            globalFilter: rejectedGlobalFilter,
        },
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Used/Rejected Supplies Report" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Used/Rejected Supplies Report</h1>
                                <p className="text-sm text-black mt-1">Track consumption and rejection patterns</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={() => router.visit('/admin/inventory/reports')}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Reports
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Report Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Period</label>
                                    <Select defaultValue={filters.period || 'monthly'}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select period" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="yearly">Yearly</SelectItem>
                                            <SelectItem value="custom">Custom Range</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Department</label>
                                    <Select defaultValue={filters.department || 'all'}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Departments</SelectItem>
                                            <SelectItem value="Doctor & Nurse">Doctor & Nurse</SelectItem>
                                            <SelectItem value="Med Tech">Med Tech</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Start Date</label>
                                    <Input 
                                        type="date" 
                                        defaultValue={filters.start_date || ''}
                                        disabled={filters.period !== 'custom'}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">End Date</label>
                                    <Input 
                                        type="date" 
                                        defaultValue={filters.end_date || ''}
                                        disabled={filters.period !== 'custom'}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-4">
                                <Button onClick={handleGenerateReport} className="bg-green-600 hover:bg-green-700">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Generate Report
                                </Button>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        id="saveReport"
                                        checked={saveReport}
                                        onChange={(e) => setSaveReport(e.target.checked)}
                                    />
                                    <label htmlFor="saveReport" className="text-sm text-gray-700">Save this report</label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main content */}
                <div className="w-full">
                    <PatientInfoCard
                        title="Used/Rejected Supplies Report"
                        icon={<AlertTriangle className="h-5 w-5 text-black" />}
                    >
                        {/* Export Actions */}
                        <div className="mb-6 flex justify-end">
                            <div className="flex items-center gap-2">
                                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pdf">PDF</SelectItem>
                                        <SelectItem value="excel">Excel</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button 
                                    onClick={() => handleExport(selectedFormat)}
                                    className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Report
                                </Button>
                            </div>
                        </div>
                        {/* Report Info */}
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-blue-900">Report Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-blue-800">Report Type:</span>
                                    <span className="ml-2 text-blue-700">Used/Rejected Supplies Report</span>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-800">Date Range:</span>
                                    <span className="ml-2 text-blue-700">{data.date_range.label}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-800">Generated:</span>
                                    <span className="ml-2 text-blue-700">{new Date().toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Summary Statistics */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Package className="h-4 w-4 text-black" />
                                    <span className="text-sm font-medium text-gray-800">Total Items</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{data.summary.total_items}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingDown className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-gray-800">Total Consumed</span>
                                </div>
                                <div className="text-2xl font-bold text-green-600">{data.summary.total_consumed}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm font-medium text-gray-800">Total Rejected</span>
                                </div>
                                <div className="text-2xl font-bold text-red-600">{data.summary.total_rejected}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    <span className="text-sm font-medium text-gray-800">Low Stock</span>
                                </div>
                                <div className="text-2xl font-bold text-yellow-600">{data.summary.low_stock_items}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm font-medium text-gray-800">Out of Stock</span>
                                </div>
                                <div className="text-2xl font-bold text-red-600">{data.summary.out_of_stock_items}</div>
                            </div>
                        </div>

                        {/* Department Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Doctor & Nurse Department
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Total Items:</span>
                                            <span className="font-semibold">{data.department_stats.doctor_nurse.total_items}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Consumed:</span>
                                            <span className="font-semibold text-green-600">{data.department_stats.doctor_nurse.total_consumed}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Rejected:</span>
                                            <span className="font-semibold text-red-600">{data.department_stats.doctor_nurse.total_rejected}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Low Stock:</span>
                                            <span className="font-semibold text-yellow-600">{data.department_stats.doctor_nurse.low_stock}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FlaskConical className="h-5 w-5" />
                                        Med Tech Department
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Total Items:</span>
                                            <span className="font-semibold">{data.department_stats.med_tech.total_items}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Consumed:</span>
                                            <span className="font-semibold text-green-600">{data.department_stats.med_tech.total_consumed}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Rejected:</span>
                                            <span className="font-semibold text-red-600">{data.department_stats.med_tech.total_rejected}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Low Stock:</span>
                                            <span className="font-semibold text-yellow-600">{data.department_stats.med_tech.low_stock}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Top Consumed Items */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Consumed Items</h3>
                            <Card className="bg-white border border-gray-200">
                                <CardContent className="p-6">
                                    {/* Table Controls */}
                                    <div className="flex items-center py-4">
                                        <Input
                                            placeholder="Search consumed items..."
                                            value={consumedGlobalFilter ?? ""}
                                            onChange={(event) => setConsumedGlobalFilter(event.target.value)}
                                            className="max-w-sm"
                                        />
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="ml-auto">
                                                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                                                {consumedTable
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
                                                {consumedTable.getHeaderGroups().map((headerGroup) => (
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
                                                {consumedTable.getRowModel().rows?.length ? (
                                                    consumedTable.getRowModel().rows.map((row) => (
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
                                                            colSpan={consumedItemsColumns.length}
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
                                            {consumedTable.getFilteredSelectedRowModel().rows.length} of{" "}
                                            {consumedTable.getFilteredRowModel().rows.length} row(s) selected.
                                        </div>
                                        <div className="flex items-center space-x-6 lg:space-x-8">
                                            <div className="flex items-center space-x-2">
                                                <p className="text-sm font-medium">Rows per page</p>
                                                <Select
                                                    value={`${consumedTable.getState().pagination.pageSize}`}
                                                    onValueChange={(value) => {
                                                        consumedTable.setPageSize(Number(value))
                                                    }}
                                                >
                                                    <SelectTrigger className="h-8 w-[70px]">
                                                        <SelectValue placeholder={consumedTable.getState().pagination.pageSize} />
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
                                                Page {consumedTable.getState().pagination.pageIndex + 1} of{" "}
                                                {consumedTable.getPageCount()}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="hidden size-8 lg:flex"
                                                    onClick={() => consumedTable.setPageIndex(0)}
                                                    disabled={!consumedTable.getCanPreviousPage()}
                                                >
                                                    <span className="sr-only">Go to first page</span>
                                                    <ChevronsLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-8"
                                                    onClick={() => consumedTable.previousPage()}
                                                    disabled={!consumedTable.getCanPreviousPage()}
                                                >
                                                    <span className="sr-only">Go to previous page</span>
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-8"
                                                    onClick={() => consumedTable.nextPage()}
                                                    disabled={!consumedTable.getCanNextPage()}
                                                >
                                                    <span className="sr-only">Go to next page</span>
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="hidden size-8 lg:flex"
                                                    onClick={() => consumedTable.setPageIndex(consumedTable.getPageCount() - 1)}
                                                    disabled={!consumedTable.getCanNextPage()}
                                                >
                                                    <span className="sr-only">Go to last page</span>
                                                    <ChevronsRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Top Rejected Items */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Rejected Items</h3>
                            <Card className="bg-white border border-gray-200">
                                <CardContent className="p-6">
                                    {/* Table Controls */}
                                    <div className="flex items-center py-4">
                                        <Input
                                            placeholder="Search rejected items..."
                                            value={rejectedGlobalFilter ?? ""}
                                            onChange={(event) => setRejectedGlobalFilter(event.target.value)}
                                            className="max-w-sm"
                                        />
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="ml-auto">
                                                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                                                {rejectedTable
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
                                                {rejectedTable.getHeaderGroups().map((headerGroup) => (
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
                                                {rejectedTable.getRowModel().rows?.length ? (
                                                    rejectedTable.getRowModel().rows.map((row) => (
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
                                                            colSpan={rejectedItemsColumns.length}
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
                                            {rejectedTable.getFilteredSelectedRowModel().rows.length} of{" "}
                                            {rejectedTable.getFilteredRowModel().rows.length} row(s) selected.
                                        </div>
                                        <div className="flex items-center space-x-6 lg:space-x-8">
                                            <div className="flex items-center space-x-2">
                                                <p className="text-sm font-medium">Rows per page</p>
                                                <Select
                                                    value={`${rejectedTable.getState().pagination.pageSize}`}
                                                    onValueChange={(value) => {
                                                        rejectedTable.setPageSize(Number(value))
                                                    }}
                                                >
                                                    <SelectTrigger className="h-8 w-[70px]">
                                                        <SelectValue placeholder={rejectedTable.getState().pagination.pageSize} />
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
                                                Page {rejectedTable.getState().pagination.pageIndex + 1} of{" "}
                                                {rejectedTable.getPageCount()}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="hidden size-8 lg:flex"
                                                    onClick={() => rejectedTable.setPageIndex(0)}
                                                    disabled={!rejectedTable.getCanPreviousPage()}
                                                >
                                                    <span className="sr-only">Go to first page</span>
                                                    <ChevronsLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-8"
                                                    onClick={() => rejectedTable.previousPage()}
                                                    disabled={!rejectedTable.getCanPreviousPage()}
                                                >
                                                    <span className="sr-only">Go to previous page</span>
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-8"
                                                    onClick={() => rejectedTable.nextPage()}
                                                    disabled={!rejectedTable.getCanNextPage()}
                                                >
                                                    <span className="sr-only">Go to next page</span>
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="hidden size-8 lg:flex"
                                                    onClick={() => rejectedTable.setPageIndex(rejectedTable.getPageCount() - 1)}
                                                    disabled={!rejectedTable.getCanNextPage()}
                                                >
                                                    <span className="sr-only">Go to last page</span>
                                                    <ChevronsRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </PatientInfoCard>
                </div>
            </div>
        </AppLayout>
    );
}

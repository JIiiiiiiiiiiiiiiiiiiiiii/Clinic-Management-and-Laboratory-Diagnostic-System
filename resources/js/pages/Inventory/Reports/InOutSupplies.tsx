import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PatientInfoCard } from '@/components/patient/PatientPageLayout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
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
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';
import { useState } from 'react';

// Column definitions for the Recent Movements table
const createMovementColumns = (): ColumnDef<any>[] => [
    {
        accessorKey: "created_at",
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
            const date = new Date(row.getValue("created_at"));
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
        accessorKey: "inventory_item.item_name",
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
            <div className="font-medium">{row.original.inventory_item?.item_name || 'N/A'}</div>
        ),
    },
    {
        accessorKey: "movement_type",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Type
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const type = row.getValue("movement_type") as string;
            return (
                <Badge variant={type === 'IN' ? 'default' : 'destructive'}>
                    {type}
                </Badge>
            );
        },
    },
    {
        accessorKey: "quantity",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Quantity
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-center">{row.getValue("quantity")}</div>
        ),
    },
    {
        accessorKey: "created_by",
        header: "Handled By",
        cell: ({ row }) => (
            <div className="text-sm">{row.getValue("created_by") || 'N/A'}</div>
        ),
    },
    {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => (
            <div className="text-sm">{row.getValue("remarks") || 'N/A'}</div>
        ),
    },
];

type InOutSuppliesData = {
    summary: {
        total_movements: number;
        in_movements: number;
        out_movements: number;
        total_in_quantity: number;
        total_out_quantity: number;
    };
    department_stats: {
        doctor_nurse: {
            in_movements: number;
            out_movements: number;
        };
        med_tech: {
            in_movements: number;
            out_movements: number;
        };
    };
    movements: any[];
    movement_trends: any[];
    date_range: {
        start: string;
        end: string;
        label: string;
    };
};

interface InOutSuppliesReportProps {
    data: InOutSuppliesData;
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
        title: 'In/Out Supplies',
        href: '/admin/inventory/reports/in-out-supplies',
    },
];

export default function InOutSuppliesReport({
    data,
    filters,
    report_id,
}: InOutSuppliesReportProps) {
    const [selectedFormat, setSelectedFormat] = useState('pdf');
    const [saveReport, setSaveReport] = useState(false);

    // TanStack Table state for Recent Movements
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = React.useState('');

    // Initialize table for Recent Movements
    const movementColumns = createMovementColumns();
    const movementTable = useReactTable({
        data: data.movements || [],
        columns: movementColumns,
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
            const movement = row.original;
            return Boolean(
                movement.inventory_item?.item_name?.toLowerCase().includes(search) ||
                movement.movement_type?.toLowerCase().includes(search) ||
                movement.created_by?.toLowerCase().includes(search) ||
                movement.remarks?.toLowerCase().includes(search)
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

    const handleExport = (format: string) => {
        // Create export URL with current filters
        const params = new URLSearchParams();
        params.append('format', format);
        if (filters.period) params.append('period', filters.period);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        if (filters.department) params.append('department', filters.department);
        
        const exportUrl = `/admin/inventory/reports/in-out-supplies/export?${params.toString()}`;
        window.open(exportUrl, '_blank');
    };

    const handleGenerateReport = () => {
        const params = new URLSearchParams();
        if (filters.period) params.append('period', filters.period);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        if (filters.department) params.append('department', filters.department);
        if (saveReport) params.append('save_report', '1');

        router.visit(`/admin/inventory/reports/in-out-supplies?${params.toString()}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="In/Out Supplies Report" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">In/Out Supplies Report</h1>
                                <p className="text-sm text-black mt-1">Track inventory movements and transactions</p>
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
                        title="In/Out Supplies Report"
                        icon={<TrendingUp className="h-5 w-5 text-black" />}
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
                                    <span className="ml-2 text-blue-700">In/Out Supplies Report</span>
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
                                    <Activity className="h-4 w-4 text-black" />
                                    <span className="text-sm font-medium text-gray-800">Total Movements</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{data.summary.total_movements}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <ArrowUp className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-gray-800">In Movements</span>
                                </div>
                                <div className="text-2xl font-bold text-green-600">{data.summary.in_movements}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <ArrowDown className="h-4 w-4 text-red-600" />
                                    <span className="text-sm font-medium text-gray-800">Out Movements</span>
                                </div>
                                <div className="text-2xl font-bold text-red-600">{data.summary.out_movements}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-gray-800">Total In Quantity</span>
                                </div>
                                <div className="text-2xl font-bold text-green-600">{data.summary.total_in_quantity}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                    <span className="text-sm font-medium text-gray-800">Total Out Quantity</span>
                                </div>
                                <div className="text-2xl font-bold text-red-600">{data.summary.total_out_quantity}</div>
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
                                            <span className="text-sm text-gray-600">In Movements:</span>
                                            <span className="font-semibold text-green-600">{data.department_stats.doctor_nurse.in_movements}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Out Movements:</span>
                                            <span className="font-semibold text-red-600">{data.department_stats.doctor_nurse.out_movements}</span>
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
                                            <span className="text-sm text-gray-600">In Movements:</span>
                                            <span className="font-semibold text-green-600">{data.department_stats.med_tech.in_movements}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Out Movements:</span>
                                            <span className="font-semibold text-red-600">{data.department_stats.med_tech.out_movements}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Movements */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Movements</h3>
                            
                            {/* Table Controls */}
                            <div className="flex items-center py-4">
                                <Input
                                    placeholder="Search movements..."
                                    value={globalFilter ?? ""}
                                    onChange={(event) => setGlobalFilter(event.target.value)}
                                    className="max-w-sm"
                                />
                            </div>
                                    
                            {/* Table */}
                            <div className="rounded-md border">
                                        <Table>
                                    <TableHeader>
                                        {movementTable.getHeaderGroups().map((headerGroup) => (
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
                                        {movementTable.getRowModel().rows?.length ? (
                                            movementTable.getRowModel().rows.map((row) => (
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
                                                    colSpan={movementColumns.length}
                                                    className="h-24 text-center"
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <Activity className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                        <h3 className="mb-2 text-lg font-semibold text-black">No movements found</h3>
                                                        <p className="text-gray-600">No inventory movements were recorded for the selected period</p>
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
                                    {movementTable.getFilteredSelectedRowModel().rows.length} of{" "}
                                    {movementTable.getFilteredRowModel().rows.length} row(s) selected.
                                </div>
                                <div className="flex items-center space-x-6 lg:space-x-8">
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm font-medium">Rows per page</p>
                                        <Select
                                            value={`${movementTable.getState().pagination.pageSize}`}
                                            onValueChange={(value) => {
                                                movementTable.setPageSize(Number(value))
                                            }}
                                        >
                                            <SelectTrigger className="h-8 w-[70px]">
                                                <SelectValue placeholder={movementTable.getState().pagination.pageSize} />
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
                                        Page {movementTable.getState().pagination.pageIndex + 1} of{" "}
                                        {movementTable.getPageCount()}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="hidden size-8 lg:flex"
                                            onClick={() => movementTable.setPageIndex(0)}
                                            disabled={!movementTable.getCanPreviousPage()}
                                        >
                                            <span className="sr-only">Go to first page</span>
                                            <ChevronsLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-8"
                                            onClick={() => movementTable.previousPage()}
                                            disabled={!movementTable.getCanPreviousPage()}
                                        >
                                            <span className="sr-only">Go to previous page</span>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-8"
                                            onClick={() => movementTable.nextPage()}
                                            disabled={!movementTable.getCanNextPage()}
                                        >
                                            <span className="sr-only">Go to next page</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="hidden size-8 lg:flex"
                                            onClick={() => movementTable.setPageIndex(movementTable.getPageCount() - 1)}
                                            disabled={!movementTable.getCanNextPage()}
                                        >
                                            <span className="sr-only">Go to last page</span>
                                            <ChevronsRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </PatientInfoCard>
                </div>
            </div>
        </AppLayout>
    );
}

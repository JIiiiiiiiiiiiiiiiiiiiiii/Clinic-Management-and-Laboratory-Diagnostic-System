import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { 
    ArrowLeft, 
    TrendingUp,
    DollarSign,
    BarChart3,
    PieChart,
    Download,
    Calendar,
    Filter,
    FileText,
    Users,
    CreditCard,
    UserCheck,
    Clock,
    CheckCircle,
    ArrowUpDown,
    ChevronDown,
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
    total_payments: number;
    total_amount: number;
    paid_amount: number;
    pending_amount: number;
    average_payment: number;
};

type ReportData = {
    date?: string;
    year?: number;
    month?: number;
    month_name?: string;
    doctor_id: number;
    doctor_name: string;
    doctor_specialization: string;
    payment_count: number;
    total_incentives: number;
    total_net_payment: number;
    average_payment: number;
};

type Doctor = {
    id: number;
    name: string;
    specialization: string;
};

// Column definitions for the doctor payment reports table
const createDoctorPaymentReportColumns = (reportType: string): ColumnDef<ReportData>[] => [
    {
        accessorKey: reportType === 'daily' ? 'date' : reportType === 'monthly' ? 'month_name' : 'year',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    {reportType === 'daily' ? 'Date' : reportType === 'monthly' ? 'Month' : 'Year'}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const item = row.original;
            return (
                <div className="font-medium">
                    {reportType === 'daily' ? formatDate(item.date!) :
                     reportType === 'monthly' ? item.month_name :
                     item.year}
                </div>
            );
        },
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
            <div className="font-medium">{row.getValue("doctor_name")}</div>
        ),
    },
    {
        accessorKey: "doctor_specialization",
        header: "Specialization",
        cell: ({ row }) => (
            <div className="text-gray-600">{row.getValue("doctor_specialization")}</div>
        ),
    },
    {
        accessorKey: "payment_count",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Payments
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-right font-semibold">{row.getValue("payment_count")}</div>
        ),
    },
    {
        accessorKey: "total_incentives",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Incentives
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-right text-green-600 font-semibold">
                {formatCurrency(row.getValue("total_incentives"))}
            </div>
        ),
    },
    {
        accessorKey: "total_net_payment",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Net Payment
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-right font-bold text-blue-600">
                {formatCurrency(row.getValue("total_net_payment"))}
            </div>
        ),
    },
    {
        accessorKey: "average_payment",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Average
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-right">{formatCurrency(row.getValue("average_payment"))}</div>
        ),
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const item = row.original;
            return (
                <div className="text-center">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDoctorDetails(item.doctor_id)}
                    >
                        View Details
                    </Button>
                </div>
            );
        },
    },
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Doctor Payment Reports', href: '/admin/billing/doctor-payment-reports' },
];

export default function DoctorPaymentReports({ 
    reportData,
    summary,
    doctors,
    filters
}: { 
    reportData: ReportData[];
    summary: Summary;
    doctors: Doctor[];
    filters: any;
}) {
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [reportType, setReportType] = useState(filters.report_type || 'daily');
    const [doctorId, setDoctorId] = useState(filters.doctor_id || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    // TanStack Table state
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = React.useState('');

    // Initialize table
    const columns = createDoctorPaymentReportColumns(reportType);
    const table = useReactTable({
        data: reportData || [],
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
            const item = row.original;
            return (
                item.doctor_name?.toLowerCase().includes(search) ||
                item.doctor_specialization?.toLowerCase().includes(search) ||
                (reportType === 'daily' && item.date?.toLowerCase().includes(search)) ||
                (reportType === 'monthly' && item.month_name?.toLowerCase().includes(search)) ||
                (reportType === 'yearly' && item.year?.toString().includes(search))
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

    const handleFilter = () => {
        router.get('/admin/billing/doctor-payment-reports', {
            date_from: dateFrom,
            date_to: dateTo,
            report_type: reportType,
            doctor_id: doctorId,
            status: status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleExport = (format: string) => {
        router.get('/admin/billing/doctor-payment-reports/export', {
            date_from: dateFrom,
            date_to: dateTo,
            report_type: reportType,
            doctor_id: doctorId,
            status: status,
            format: format,
        });
    };

    const handleDoctorDetails = (doctorId: number) => {
        router.get(`/admin/billing/doctor-payment-reports/doctor/${doctorId}`, {
            date_from: dateFrom,
            date_to: dateTo,
            status: status,
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Doctor Payment Reports" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button asChild variant="outline" className="h-12 w-12">
                                <Link href="/admin/billing">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <Heading title="Doctor Payment Reports" description="Comprehensive doctor payment analytics and reporting" icon={TrendingUp} />
                        </div>
                        <div className="flex items-center gap-4">
                            <Button onClick={() => handleExport('excel')} variant="outline">
                                <Download className="mr-2 h-5 w-5" />
                                Export Excel
                            </Button>
                            <Button onClick={() => handleExport('pdf')} variant="outline">
                                <Download className="mr-2 h-5 w-5" />
                                Export PDF
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <Card className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                            <Filter className="h-5 w-5 text-black" />
                            Report Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Date From</Label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Date To</Label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Report Type</Label>
                                <Select value={reportType} onValueChange={setReportType}>
                                    <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Doctor</Label>
                                <Select value={doctorId} onValueChange={setDoctorId}>
                                    <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Doctors</SelectItem>
                                        {doctors.map((doctor) => (
                                            <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                                {doctor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Button onClick={handleFilter} className="h-12 px-6">
                                <Filter className="mr-2 h-4 w-4" />
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{summary.total_payments}</div>
                                    <div className="text-sm text-gray-600">Total Payments</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_amount)}</div>
                                    <div className="text-sm text-gray-600">Total Amount</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.paid_amount)}</div>
                                    <div className="text-sm text-gray-600">Paid Amount</div>
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
                                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.pending_amount)}</div>
                                    <div className="text-sm text-gray-600">Pending Amount</div>
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
                                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.average_payment)}</div>
                                    <div className="text-sm text-gray-600">Average Payment</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Report Data */}
                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                            <UserCheck className="h-5 w-5 text-black" />
                            Doctor Payment Report - {reportType.charAt(0).toUpperCase() + reportType.slice(1)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {/* Table Controls */}
                        <div className="flex items-center py-4">
                            <Input
                                placeholder="Search reports..."
                                value={globalFilter ?? ""}
                                onChange={(event) => setGlobalFilter(event.target.value)}
                                className="max-w-sm"
                            />
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

                        {/* Report Data Table */}
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
                                                <div className="flex flex-col items-center">
                                                    <UserCheck className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                    <h3 className="mb-2 text-lg font-semibold text-gray-600">No Data Found</h3>
                                                    <p className="text-gray-500">No doctor payment data found for the selected filters.</p>
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

                {/* Quick Actions */}
                <Card className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                            <Calendar className="h-5 w-5 text-black" />
                            Quick Reports
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button asChild variant="outline" className="h-16">
                                <Link href="/admin/billing/doctor-payment-reports/daily">
                                    <Calendar className="mr-2 h-5 w-5" />
                                    Daily Report
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="h-16">
                                <Link href="/admin/billing/doctor-payment-reports/monthly">
                                    <BarChart3 className="mr-2 h-5 w-5" />
                                    Monthly Report
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="h-16">
                                <Link href="/admin/billing/doctor-payment-reports/yearly">
                                    <TrendingUp className="mr-2 h-5 w-5" />
                                    Yearly Report
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

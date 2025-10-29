import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { 
    ArrowLeft, 
    Calendar,
    DollarSign,
    TrendingUp,
    FileText,
    Download,
    Receipt,
    Users,
    ArrowUpDown,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    UserCheck,
    Clock,
    CheckCircle,
    XCircle
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

type DoctorPayment = {
    id: number;
    doctor_id: number;
    doctor_name: string;
    doctor_specialization: string;
    payment_date: string;
    total_incentives: number;
    total_net_payment: number;
    payment_count: number;
    average_payment: number;
    status: string;
    description?: string;
};

type Summary = {
    total_payments: number;
    total_amount: number;
    paid_amount: number;
    pending_amount: number;
    average_payment: number;
    total_doctors: number;
    average_monthly_payments: number;
    highest_paid_doctor: string;
    lowest_paid_doctor: string;
    year_over_year_growth: number;
};

// Helper functions
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);
};

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    paid: { label: 'Paid', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
};

// Column definitions for the doctor payments table
const createDoctorPaymentColumns = (): ColumnDef<DoctorPayment>[] => [
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
            <div className="flex items-center gap-3">
                <div className="p-1 bg-blue-100 rounded-full">
                    <UserCheck className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                    <div className="font-medium">{row.getValue("doctor_name")}</div>
                    <div className="text-sm text-gray-500">{row.original.doctor_specialization}</div>
                </div>
            </div>
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
            <div className="text-center">
                <div className="font-semibold">{row.getValue("payment_count")}</div>
                <div className="text-xs text-gray-500">transactions</div>
            </div>
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
                    Total Incentives
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-semibold text-blue-600">
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
            <div className="font-semibold text-green-600">
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
                    Average Payment
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-semibold text-purple-600">
                {formatCurrency(row.getValue("average_payment"))}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const config = statusConfig[status as keyof typeof statusConfig] || { 
                label: status, 
                color: 'bg-gray-100 text-gray-800', 
                icon: Clock 
            };
            const Icon = config.icon;
            
            return (
                <Badge className={config.color}>
                    <Icon className="mr-1 h-3 w-3" />
                    {config.label}
                </Badge>
            );
        },
    },
    {
        accessorKey: "payment_date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Payment Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-sm text-gray-600">
                {new Date(row.getValue("payment_date")).toLocaleDateString()}
            </div>
        ),
    },
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Doctor Yearly Report', href: '/admin/billing/doctor-yearly-report' },
];

export default function DoctorYearlyReport({ 
    doctorPayments,
    summary,
    year,
    doctorId,
    status
}: { 
    doctorPayments: DoctorPayment[];
    summary: Summary;
    year: string;
    doctorId?: string;
    status?: string;
}) {
    const [selectedYear, setSelectedYear] = useState(year);

    // TanStack Table state for doctor payments
    const [transactionSorting, setTransactionSorting] = React.useState<SortingState>([]);
    const [transactionColumnFilters, setTransactionColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [transactionColumnVisibility, setTransactionColumnVisibility] = React.useState<VisibilityState>({});
    const [transactionRowSelection, setTransactionRowSelection] = React.useState({});
    const [transactionGlobalFilter, setTransactionGlobalFilter] = React.useState('');

    // Initialize transaction table
    const transactionColumns = createDoctorPaymentColumns();
    const transactionTable = useReactTable({
        data: doctorPayments || [],
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
            const payment = row.original;
            return (
                payment.doctor_name?.toLowerCase().includes(search) ||
                payment.doctor_specialization?.toLowerCase().includes(search) ||
                payment.status?.toLowerCase().includes(search)
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

    const handleYearChange = () => {
        router.get('/admin/billing/doctor-yearly-report', {
            year: selectedYear,
            doctor_id: doctorId,
            status: status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Doctor Yearly Report" />
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Payments</p>
                                        <p className="text-3xl font-bold text-gray-900">{summary.total_payments || 0}</p>
                                        <p className="text-sm text-gray-500">Annual payments</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <Receipt className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Amount</p>
                                        <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.total_amount || 0)}</p>
                                        <p className="text-sm text-gray-500">Annual total</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <DollarSign className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Average Monthly Payments</p>
                                        <p className="text-3xl font-bold text-gray-900">{summary.average_monthly_payments || 0}</p>
                                        <p className="text-sm text-gray-500">Per month average</p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-full">
                                        <TrendingUp className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Year-over-Year Growth</p>
                                        <p className={`text-3xl font-bold ${(summary.year_over_year_growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {(summary.year_over_year_growth || 0) >= 0 ? '+' : ''}{(summary.year_over_year_growth || 0).toFixed(1)}%
                                        </p>
                                        <p className="text-sm text-gray-500">Growth rate</p>
                                    </div>
                                    <div className={`p-3 rounded-full ${(summary.year_over_year_growth || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                        <TrendingUp className={`h-6 w-6 ${(summary.year_over_year_growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Data Table */}
                    <Card className="bg-white border border-gray-200">
                        <CardContent className="p-6">
                            {/* Table Controls */}
                            <div className="flex items-center py-4">
                                <Input
                                    placeholder="Search doctor payments..."
                                    value={transactionGlobalFilter ?? ""}
                                    onChange={(event) => setTransactionGlobalFilter(event.target.value)}
                                    className="max-w-sm"
                                />
                                <Button
                                    onClick={() => {
                                        const exportUrl = `/admin/billing/doctor-summary/export?year=${selectedYear}&format=excel&report_type=yearly`;
                                        window.open(exportUrl, '_blank');
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white ml-4"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Excel
                                </Button>
                                <Button
                                    onClick={() => {
                                        const exportUrl = `/admin/billing/doctor-summary/export?year=${selectedYear}&format=pdf&report_type=yearly`;
                                        window.open(exportUrl, '_blank');
                                    }}
                                    variant="outline"
                                    className="ml-2"
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Export PDF
                                </Button>
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
                                    
                            {/* Table */}
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
                                                        <UserCheck className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                        <h3 className="mb-2 text-lg font-semibold text-gray-600">No doctor payments found</h3>
                                                        <p className="text-gray-500">No doctor payments for the selected year</p>
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
                </div>
            </div>
        </AppLayout>
    );
}

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Coins,
    TrendingUp,
    FileText,
    Download,
    Receipt,
    CreditCard,
    ArrowUpDown,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';
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

type HmoTransaction = {
    id: number;
    transaction_id: string;
    patient_name: string;
    doctor_name: string;
    amount: number;
    total_amount?: number;
    final_amount?: number;
    discount_amount?: number;
    senior_discount_amount?: number;
    is_senior_citizen?: boolean;
    hmo_provider: string;
    payment_method: string;
    status: string;
    transaction_date: string;
    description?: string;
};

type Summary = {
    total_hmo_revenue: number;
    total_hmo_transactions: number;
    total_approved_amount: number;
    pending_claims_count: number;
    approval_rate: number;
    average_monthly_revenue: number;
    highest_revenue_month: string;
    lowest_revenue_month: string;
    year_over_year_growth: number;
};

// Column definitions for the HMO transactions table
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
        accessorKey: "amount",
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
            const transaction = row.original;
            return (
                <div className="font-semibold text-green-600">
                    <div>
                        ₱{transaction.amount?.toLocaleString()}
                    </div>
                    {transaction.total_amount && transaction.total_amount !== transaction.amount && (
                        <div className="text-xs text-gray-500">
                            Original: ₱{transaction.total_amount.toLocaleString()}
                            {transaction.senior_discount_amount > 0 && (
                                <span className="ml-2 text-green-600">
                                    (-₱{transaction.senior_discount_amount.toLocaleString()} senior)
                                </span>
                            )}
                            {transaction.discount_amount > 0 && (
                                <span className="ml-2 text-blue-600">
                                    (-₱{transaction.discount_amount.toLocaleString()} discount)
                                </span>
                            )}
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const statusConfig = {
                paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
                completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
                pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
                cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
                failed: { label: 'Failed', color: 'bg-red-100 text-red-800' }
            };
            const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800' };
            
            return (
                <Badge className={config.color}>
                    {config.label}
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
    { title: 'HMO Yearly Report', href: '/admin/billing/hmo-yearly-report' },
];

export default function HmoYearlyReport({ 
    hmoTransactions,
    summary,
    year,
    hmoProvider
}: { 
    hmoTransactions: HmoTransaction[];
    summary: Summary;
    year: string;
    hmoProvider?: string;
}) {

    // TanStack Table state for HMO transactions
    const [transactionSorting, setTransactionSorting] = React.useState<SortingState>([]);
    const [transactionColumnFilters, setTransactionColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [transactionColumnVisibility, setTransactionColumnVisibility] = React.useState<VisibilityState>({});
    const [transactionRowSelection, setTransactionRowSelection] = React.useState({});
    const [transactionGlobalFilter, setTransactionGlobalFilter] = React.useState('');

    // Initialize transaction table
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
                transaction.hmo_provider?.toLowerCase().includes(search) ||
                transaction.status?.toLowerCase().includes(search)
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


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="HMO Yearly Report" />
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total HMO Revenue</p>
                                        <p className="text-3xl font-bold text-gray-900">₱{(summary.total_hmo_revenue || 0).toLocaleString()}</p>
                                        <p className="text-sm text-gray-500">Annual HMO revenue</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <Coins className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                                        <p className="text-3xl font-bold text-gray-900">{summary.total_hmo_transactions || 0}</p>
                                        <p className="text-sm text-gray-500">Annual HMO transactions</p>
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
                                        <p className="text-sm font-medium text-gray-600">Average Monthly Revenue</p>
                                        <p className="text-3xl font-bold text-gray-900">₱{(summary.average_monthly_revenue || 0).toLocaleString()}</p>
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
                                    placeholder="Search HMO transactions..."
                                    value={transactionGlobalFilter ?? ""}
                                    onChange={(event) => setTransactionGlobalFilter(event.target.value)}
                                    className="max-w-sm"
                                />
                                <Button
                                    onClick={() => {
                                        const exportUrl = `/admin/billing/enhanced-hmo-report/export-data?year=${year}&format=excel&report_type=yearly`;
                                        window.open(exportUrl, '_blank');
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white ml-4"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Excel
                                </Button>
                                <Button
                                    onClick={() => {
                                        const exportUrl = `/admin/billing/enhanced-hmo-report/export-data?year=${year}&format=pdf&report_type=yearly`;
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
                                                        <CreditCard className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                        <h3 className="mb-2 text-lg font-semibold text-gray-600">No HMO transactions found</h3>
                                                        <p className="text-gray-500">No HMO transactions for the selected year</p>
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

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
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
    CreditCard,
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

type Transaction = {
    id: number;
    type: 'billing' | 'doctor_payment' | 'expense' | 'appointment';
    transaction_id: string;
    patient_name: string;
    specialist_name: string;
    amount: number;
    payment_method: string;
    status: string;
    description: string;
    time: string;
    items_count: number;
    appointments_count: number;
};

type Expense = {
    id: number;
    expense_name: string;
    amount: number;
    expense_category: string;
    status: string;
    expense_date: string;
};

type Summary = {
    total_revenue: number;
    total_expenses: number;
    total_doctor_payments: number;
    net_profit: number;
    transaction_count: number;
    expense_count: number;
    doctor_payment_count: number;
};

// Column definitions for the transactions table
const createTransactionColumns = (): ColumnDef<Transaction>[] => [
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as string;
            const typeConfig = {
                billing: { label: 'BILLING', color: 'bg-green-100 text-green-800' },
                doctor_payment: { label: 'DOCTOR PAYMENT', color: 'bg-blue-100 text-blue-800' },
                expense: { label: 'EXPENSE', color: 'bg-red-100 text-red-800' },
                appointment: { label: 'APPOINTMENT', color: 'bg-yellow-100 text-yellow-800' }
            };
            const config = typeConfig[type as keyof typeof typeConfig] || { label: type.toUpperCase(), color: 'bg-gray-100 text-gray-800' };
            
            return (
                <Badge className={config.color}>
                    {config.label}
                </Badge>
            );
        },
    },
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
                    Patient/Source
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const transaction = row.original;
            return (
                <div>
                    <div className="font-medium">{row.getValue("patient_name")}</div>
                    {transaction.items_count > 0 && (
                        <div className="text-sm text-gray-500">
                            {transaction.items_count} items
                        </div>
                    )}
                    {transaction.appointments_count > 0 && (
                        <div className="text-sm text-gray-500">
                            {transaction.appointments_count} appointments
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "specialist_name",
        header: "Specialist",
        cell: ({ row }) => (
            <div>{row.getValue("specialist_name")}</div>
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
                <div className={`font-semibold ${
                    transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                    {transaction.amount < 0 ? '-' : ''}₱{Math.abs(transaction.amount).toLocaleString()}
                </div>
            );
        },
    },
    {
        accessorKey: "payment_method",
        header: "Payment Method",
        cell: ({ row }) => (
            <Badge variant="outline" className="bg-gray-100 text-gray-800">
                {row.getValue("payment_method")?.toString().replace('_', ' ').toUpperCase()}
            </Badge>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const statusConfig = {
                paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
                approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
                pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
                cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
            };
            const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800' };
            
            return (
                <Badge className={config.color}>
                    {config.label}
                </Badge>
            );
        },
    },
];

// Column definitions for the expenses table
const createExpenseColumns = (): ColumnDef<Expense>[] => [
    {
        accessorKey: "expense_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Expense
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("expense_name")}</div>
        ),
    },
    {
        accessorKey: "expense_category",
        header: "Category",
        cell: ({ row }) => (
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                {row.getValue("expense_category")?.toString().replace('_', ' ')}
            </Badge>
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
        cell: ({ row }) => (
            <div className="font-semibold">
                ₱{row.getValue("amount")?.toLocaleString()}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const statusConfig = {
                approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
                pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' }
            };
            const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800' };
            
            return (
                <Badge className={config.color}>
                    {config.label}
                </Badge>
            );
        },
    },
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Yearly Report', href: '/admin/billing/billing-reports/yearly' },
];

export default function YearlyReport({ 
    transactions,
    expenses,
    summary,
    year
}: { 
    transactions: Transaction[];
    expenses: Expense[];
    summary: Summary;
    year: string;
}) {
    const [selectedYear, setSelectedYear] = useState(year);

    // TanStack Table state for transactions
    const [transactionSorting, setTransactionSorting] = React.useState<SortingState>([]);
    const [transactionColumnFilters, setTransactionColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [transactionColumnVisibility, setTransactionColumnVisibility] = React.useState<VisibilityState>({});
    const [transactionRowSelection, setTransactionRowSelection] = React.useState({});
    const [transactionGlobalFilter, setTransactionGlobalFilter] = React.useState('');

    // TanStack Table state for expenses
    const [expenseSorting, setExpenseSorting] = React.useState<SortingState>([]);
    const [expenseColumnFilters, setExpenseColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [expenseColumnVisibility, setExpenseColumnVisibility] = React.useState<VisibilityState>({});
    const [expenseRowSelection, setExpenseRowSelection] = React.useState({});
    const [expenseGlobalFilter, setExpenseGlobalFilter] = React.useState('');

    // Initialize transaction table
    const transactionColumns = createTransactionColumns();
    const transactionTable = useReactTable({
        data: transactions || [],
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
                transaction.specialist_name?.toLowerCase().includes(search) ||
                transaction.type?.toLowerCase().includes(search) ||
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

    // Initialize expense table
    const expenseColumns = createExpenseColumns();
    const expenseTable = useReactTable({
        data: expenses || [],
        columns: expenseColumns,
        onSortingChange: setExpenseSorting,
        onColumnFiltersChange: setExpenseColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setExpenseColumnVisibility,
        onRowSelectionChange: setExpenseRowSelection,
        onGlobalFilterChange: setExpenseGlobalFilter,
        globalFilterFn: (row, columnId, value) => {
            const search = value.toLowerCase();
            const expense = row.original;
            return (
                expense.expense_name?.toLowerCase().includes(search) ||
                expense.expense_category?.toLowerCase().includes(search) ||
                expense.status?.toLowerCase().includes(search)
            );
        },
        state: {
            sorting: expenseSorting,
            columnFilters: expenseColumnFilters,
            columnVisibility: expenseColumnVisibility,
            rowSelection: expenseRowSelection,
            globalFilter: expenseGlobalFilter,
        },
    });

    const handleYearChange = () => {
        router.get('/admin/billing/billing-reports/yearly', {
            year: selectedYear,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleExport = (format: string) => {
        const exportUrl = `/admin/billing/billing-reports/yearly/export?year=${selectedYear}&format=${format}`;
        window.open(exportUrl, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Yearly Report" />
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                        <p className="text-3xl font-bold text-gray-900">₱{(summary.total_revenue || 0).toLocaleString()}</p>
                                        <p className="text-sm text-gray-500">Yearly revenue</p>
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
                                        <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                                        <p className="text-3xl font-bold text-gray-900">₱{(summary.total_expenses || 0).toLocaleString()}</p>
                                        <p className="text-sm text-gray-500">Yearly expenses</p>
                                    </div>
                                    <div className="p-3 bg-red-100 rounded-full">
                                        <FileText className="h-6 w-6 text-red-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Net Profit</p>
                                        <p className={`text-3xl font-bold ${(summary.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ₱{(summary.net_profit || 0).toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-500">Yearly profit</p>
                                    </div>
                                    <div className={`p-3 rounded-full ${(summary.net_profit || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                        <TrendingUp className={`h-6 w-6 ${(summary.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Transactions</p>
                                        <p className="text-3xl font-bold text-gray-900">{summary.transaction_count || 0}</p>
                                        <p className="text-sm text-gray-500">Yearly transactions</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <Receipt className="h-6 w-6 text-blue-600" />
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
                                    placeholder="Search transactions..."
                                    value={transactionGlobalFilter ?? ""}
                                    onChange={(event) => setTransactionGlobalFilter(event.target.value)}
                                    className="max-w-sm"
                                />
                                <Button
                                    onClick={() => handleExport('excel')}
                                    className="bg-green-600 hover:bg-green-700 text-white ml-4"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Excel
                                </Button>
                                <Button
                                    onClick={() => handleExport('pdf')}
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
                                                        <Receipt className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                        <h3 className="mb-2 text-lg font-semibold text-gray-600">No transactions found</h3>
                                                        <p className="text-gray-500">No transactions for this year</p>
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

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import BillingTransactionModal from '@/components/modals/billing-transaction-modal';
import TransactionViewModal from '@/components/modals/transaction-view-modal';
import TransactionEditModal from '@/components/modals/transaction-edit-modal';
import { 
    AlertCircle, 
    CheckCircle, 
    Clock, 
    Download, 
    Eye, 
    FileText, 
    Plus, 
    Search, 
    XCircle, 
    CreditCard,
    Receipt,
    Coins,
    Filter,
    Edit,
    ArrowUpDown,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    User
} from 'lucide-react';
import { useState, useEffect } from 'react';
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

type BillingTransaction = {
    id: number;
    transaction_id: string;
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        patient_no: string;
    };
    doctor: {
        specialist_id: number;
        name: string;
    } | null;
    payment_type: 'cash' | 'health_card' | 'discount';
    total_amount: number;
    amount: number;
    discount_amount: number;
    discount_percentage: number | null;
    is_senior_citizen: boolean;
    senior_discount_amount: number;
    senior_discount_percentage: number;
    hmo_provider: string | null;
    hmo_reference: string | null;
    hmo_reference_number: string | null;
    payment_method: 'cash' | 'hmo';
    payment_reference: string | null;
    status: 'draft' | 'pending' | 'paid' | 'cancelled' | 'refunded';
    description: string | null;
    notes: string | null;
    transaction_date: string;
    due_date: string | null;
    created_at: string;
    updated_at: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Billing',
        href: '/admin/billing',
    },
    {
        title: 'Transaction',
        href: '/admin/billing/transactions',
    },
];

const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-500', icon: FileText },
    pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
    paid: { label: 'Paid', color: 'bg-green-500', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
    refunded: { label: 'Refunded', color: 'bg-orange-500', icon: AlertCircle },
};

const getStatusBadge = (status: keyof typeof statusConfig) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    
    const variantMap = {
        draft: 'secondary',
        pending: 'warning',
        paid: 'success',
        cancelled: 'destructive',
        refunded: 'destructive'
    };
    
    return (
        <Badge variant={variantMap[status] as any}>
            <Icon className="mr-1 h-3 w-3" />
            {config.label}
        </Badge>
    );
};

export default function BillingTransactions({
    transactions,
    patients,
    doctors,
    labTests,
    hmoProviders,
    filters
}: BillingTransactionsProps) {
    // Column definitions for the transactions table
    const createTransactionColumns = (handleViewTransaction: (id: number) => void, handleEditTransaction: (id: number) => void): ColumnDef<BillingTransaction>[] => [
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
        accessorKey: "patient",
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
        cell: ({ row }) => {
            const patient = row.getValue("patient") as any;
            return (
                <div className="font-medium">
                    {patient ? `${patient.last_name}, ${patient.first_name}` : 'Loading...'}
                </div>
            );
        },
    },
    {
        accessorKey: "doctor",
        header: "Specialist",
        cell: ({ row }) => {
            const doctor = row.getValue("doctor") as any;
            return <div>{doctor ? doctor.name : '—'}</div>;
        },
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
            <div className="font-semibold text-green-600">
                {(() => {
                    const t = row.original as any;
                    const amount = Number(t?.amount ?? 0);
                    const total = Number(t?.total_amount ?? 0);
                    const discount = Number(t?.discount_amount ?? 0);
                    const seniorDiscount = Number(t?.senior_discount_amount ?? 0);
                    const net = amount > 0 ? amount : Math.max(0, total - discount - seniorDiscount);
                    return `₱${net.toLocaleString()}`;
                })()}
            </div>
        ),
    },
    {
        accessorKey: "payment_method",
        header: "Payment Method",
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize">
                {row.getValue("payment_method")}
            </Badge>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as keyof typeof statusConfig;
            return getStatusBadge(status);
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
        cell: ({ row }) => {
            const dateValue = row.getValue("transaction_date");
            if (!dateValue) {
                return <div className="text-sm text-gray-400">N/A</div>;
            }
            try {
                const date = new Date(dateValue);
                if (isNaN(date.getTime())) {
                    return <div className="text-sm text-gray-400">Invalid Date</div>;
                }
                return <div className="text-sm">{date.toLocaleDateString()}</div>;
            } catch (error) {
                return <div className="text-sm text-gray-400">Invalid Date</div>;
            }
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const transaction = row.original;

            return (
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewTransaction(transaction.id)}
                    >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditTransaction(transaction.id)}
                    >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                    </Button>
                </div>
            )
        },
    },
];

    // Filter state
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState(filters.payment_method || 'all');
    const [doctorFilter, setDoctorFilter] = useState(filters.doctor_id || 'all');
    
    // Debounced search
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    
    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        handleFilter();
    }, [debouncedSearchTerm, statusFilter, paymentMethodFilter, doctorFilter]);
    
    // TanStack Table state
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = React.useState(filters.search || '');

    // Ensure we have data to work with
    const transactionsData = transactions?.data || [];
    
    // Debug: Log first transaction to check doctor relationship
    useEffect(() => {
        if (transactionsData.length > 0) {
            console.log('First transaction data:', transactionsData[0]);
            console.log('Doctor in first transaction:', transactionsData[0]?.doctor);
        }
    }, [transactionsData]);
    
    // View modal handlers
    const handleViewTransaction = (transactionId: number) => {
        setSelectedTransactionId(transactionId);
        setViewModalOpen(true);
    };

    const handleViewModalClose = () => {
        setViewModalOpen(false);
        setSelectedTransactionId(null);
    };

    // Edit modal handlers
    const handleEditTransaction = (transactionId: number) => {
        setSelectedTransactionId(transactionId);
        setEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setEditModalOpen(false);
        setSelectedTransactionId(null);
    };
    
    // Initialize transactions table
    const columns = createTransactionColumns(handleViewTransaction, handleEditTransaction);
    const table = useReactTable({
        data: transactionsData || [],
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
                transaction.transaction_id?.toLowerCase().includes(search) ||
                transaction.patient?.first_name?.toLowerCase().includes(search) ||
                transaction.patient?.last_name?.toLowerCase().includes(search) ||
                transaction.patient?.patient_no?.toLowerCase().includes(search) ||
                transaction.doctor?.name?.toLowerCase().includes(search)
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
        const params: any = {};
        
        // Only add parameters that are not default values
        if (debouncedSearchTerm && debouncedSearchTerm.trim() !== '') {
            params.search = debouncedSearchTerm;
        }
        if (statusFilter && statusFilter !== 'all') {
            params.status = statusFilter;
        }
        if (paymentMethodFilter && paymentMethodFilter !== 'all') {
            params.payment_method = paymentMethodFilter;
        }
        if (doctorFilter && doctorFilter !== 'all') {
            params.doctor_id = doctorFilter;
        }

        router.get('/admin/billing/transactions', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Modal handlers
    const handleCreateTransaction = () => {
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
    };

    const handleModalSuccess = () => {
        // Refresh the transactions data
        router.reload({ only: ['transactions'] });
    };

    // Calculate statistics
    const totalTransactions = transactionsData.length;
    const paidTransactions = transactionsData.filter((t: BillingTransaction) => t.status === 'paid').length;
    const pendingTransactions = transactionsData.filter((t: BillingTransaction) => t.status === 'pending').length;
    const totalRevenue = transactionsData
        .filter((t: BillingTransaction) => t.status === 'paid')
        .reduce((sum: number, t: BillingTransaction) => {
            const amount = Number(t.amount) || 0;
            return sum + amount;
        }, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing Transactions" />
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                                        <p className="text-3xl font-bold text-gray-900">{totalTransactions}</p>
                                        <p className="text-sm text-gray-500">All billing records</p>
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
                                        <p className="text-sm font-medium text-gray-600">Paid Transactions</p>
                                        <p className="text-3xl font-bold text-gray-900">{paidTransactions}</p>
                                        <p className="text-sm text-gray-500">Successfully completed</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Pending Transactions</p>
                                        <p className="text-3xl font-bold text-gray-900">{pendingTransactions}</p>
                                        <p className="text-sm text-gray-500">Awaiting payment</p>
                                    </div>
                                    <div className="p-3 bg-yellow-100 rounded-full">
                                        <Clock className="h-6 w-6 text-yellow-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                        <p className="text-3xl font-bold text-gray-900">₱{totalRevenue.toLocaleString()}</p>
                                        <p className="text-sm text-gray-500">From paid transactions</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <Coins className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Data Table */}
                    <Card className="bg-white border border-gray-200">
                        <CardContent className="p-6">
                            {/* Filters and Controls */}
                            <div className="mb-6">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search transactions..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                        />
                                    </div>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="h-12 px-4 border border-gray-200 rounded-xl focus:border-gray-500 focus:ring-gray-500"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="draft">Draft</option>
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                    <select
                                        value={paymentMethodFilter}
                                        onChange={(e) => setPaymentMethodFilter(e.target.value)}
                                        className="h-12 px-4 border border-gray-200 rounded-xl focus:border-gray-500 focus:ring-gray-500"
                                    >
                                        <option value="all">All Payment Methods</option>
                                        <option value="cash">Cash</option>
                                        <option value="hmo">HMO</option>
                                    </select>
                                    <select
                                        value={doctorFilter}
                                        onChange={(e) => setDoctorFilter(e.target.value)}
                                        className="h-12 px-4 border border-gray-200 rounded-xl focus:border-gray-500 focus:ring-gray-500"
                                    >
                                        <option value="all">All Specialists</option>
                                        {doctors.map((doctor) => (
                                            <option key={doctor.specialist_id} value={doctor.specialist_id.toString()}>
                                                {doctor.name}
                                            </option>
                                        ))}
                                    </select>
                                    <Button
                                        onClick={handleCreateTransaction}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        New Transaction
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline">
                                                <Download className="mr-2 h-4 w-4" />
                                                Export
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => window.open('/admin/billing/export?format=excel', '_self')}>
                                                Excel
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => window.open('/admin/billing/export?format=pdf', '_self')}>
                                                PDF
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline">
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
                </div>
            </div>
            
            {/* Billing Transaction Modal */}
            <BillingTransactionModal
                isOpen={modalOpen}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                patients={patients}
                doctors={doctors}
                labTests={labTests}
                hmoProviders={hmoProviders}
            />

            {/* Transaction View Modal */}
            <TransactionViewModal
                isOpen={viewModalOpen}
                onClose={handleViewModalClose}
                transactionId={selectedTransactionId}
                onEdit={handleEditTransaction}
            />

            {/* Transaction Edit Modal */}
            <TransactionEditModal
                isOpen={editModalOpen}
                onClose={handleEditModalClose}
                onSuccess={handleModalSuccess}
                transactionId={selectedTransactionId}
                patients={patients}
                doctors={doctors}
                labTests={labTests}
                hmoProviders={hmoProviders}
            />
        </AppLayout>
    );
}

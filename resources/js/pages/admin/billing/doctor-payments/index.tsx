import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import Heading from '@/components/heading';
import { 
    Plus, 
    Search, 
    Filter,
    Eye,
    Trash2,
    MoreHorizontal,
    CheckCircle,
    Clock,
    XCircle,
    FileText,
    Users,
    DollarSign,
    TrendingUp,
    ArrowLeft,
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

interface Doctor {
    specialist_id: number;
    name: string;
    role?: string;
    specialization?: string;
    contact?: string;
    email?: string;
    status?: string;
}

interface DoctorPayment {
    id: number;
    doctor: Doctor;
    incentives: number;
    net_payment: number;
    payment_date: string;
    status: 'pending' | 'paid' | 'cancelled';
    notes: string | null;
    created_at: string;
    created_by: {
        id: number;
        name: string;
    };
}

interface Summary {
    total_paid: number;
    pending_amount: number;
    total_payments: number;
    paid_payments: number;
}

interface Filters {
    search?: string;
    status?: string;
    doctor_id?: string;
    date_from?: string;
    date_to?: string;
}

interface Props {
    payments: {
        data: DoctorPayment[];
        links: any[];
        meta: any;
    };
    summary: Summary;
    doctors: Doctor[];
    filters: Filters;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Doctor Payments', href: '/admin/billing/doctor-payments' },
];

// Column definitions for the doctor payments table
const createDoctorPaymentColumns = (handleMarkAsPaid: (paymentId: number) => void, handleDelete: (paymentId: number) => void): ColumnDef<DoctorPayment>[] => [
    {
        accessorKey: "doctor",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Doctor
                    </div>
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const doctor = row.getValue("doctor") as any;
            return (
                <div className="flex items-center gap-2">
                    <div className="p-1 bg-gray-100 rounded-full">
                        <Users className="h-4 w-4 text-black" />
                    </div>
                    {doctor ? doctor.name : 'N/A'}
                </div>
            );
        },
    },
    {
        accessorKey: "incentives",
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
            <div className="text-green-600">
                +₱{row.getValue("incentives")?.toLocaleString()}
            </div>
        ),
    },
    {
        accessorKey: "net_payment",
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
            <div className="font-semibold text-lg">
                ₱{row.getValue("net_payment")?.toLocaleString()}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as keyof typeof statusConfig;
            const config = statusConfig[status];
            const Icon = config.icon;
            
            const variantMap = {
                pending: 'warning',
                paid: 'success',
                cancelled: 'destructive'
            };
            
            return (
                <Badge variant={variantMap[status] as any}>
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
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const payment = row.original;

            return (
                <div className="flex gap-2">
                    <Button asChild size="sm">
                        <Link href={`/admin/billing/doctor-payments/${payment.id}`}>
                            <Eye className="mr-1 h-3 w-3" />
                            View
                        </Link>
                    </Button>
                    {payment.status === 'pending' && (
                        <Button
                            size="sm"
                            onClick={() => handleMarkAsPaid(payment.id)}
                        >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Mark Paid
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                                <MoreHorizontal className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                                onClick={() => handleDelete(payment.id)}
                                className="text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    },
];

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
    paid: { label: 'Paid', color: 'bg-green-500', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
};

export default function DoctorPaymentsIndex({ payments, summary, doctors, filters }: Props) {
    // TanStack Table state
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = React.useState(filters.search || '');

    // Debug: Log the data being received
    console.log('=== DOCTOR PAYMENTS INDEX DEBUG ===');
    console.log('Payments data:', payments);
    console.log('Doctors data:', doctors);
    console.log('First payment:', payments?.data?.[0]);
    if (payments?.data?.[0]) {
        console.log('First payment doctor:', payments.data[0].doctor);
        console.log('First payment doctor type:', typeof payments.data[0].doctor);
        console.log('First payment doctor keys:', payments.data[0].doctor ? Object.keys(payments.data[0].doctor) : 'NULL');
    }

    const getStatusBadge = (status: keyof typeof statusConfig) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        
        const variantMap = {
            pending: 'warning',
            paid: 'success',
            cancelled: 'destructive'
        };
        
        return (
            <Badge variant={variantMap[status] as any}>
                <Icon className="mr-1 h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const handleFilter = () => {
        router.get('/admin/billing/doctor-payments', {
            search: searchTerm,
            status: statusFilter,
            doctor_id: doctorFilter,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            replace: true,
        });
    };


    const handleMarkAsPaid = (paymentId: number) => {
        router.post(`/admin/billing/doctor-payments/${paymentId}/mark-as-paid`, {}, {
            onSuccess: () => {
                router.reload();
            }
        });
    };

    const handleDelete = (paymentId: number) => {
        if (confirm('Are you sure you want to delete this payment?')) {
            router.delete(`/admin/billing/doctor-payments/${paymentId}`);
        }
    };

    // Initialize table
    const columns = createDoctorPaymentColumns(handleMarkAsPaid, handleDelete);
    const table = useReactTable({
        data: payments?.data || [],
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
            const payment = row.original;
            return (
                payment.doctor?.name?.toLowerCase().includes(search) ||
                payment.status?.toLowerCase().includes(search)
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Doctor Payments" />
            
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
                            <Heading title="Doctor Payments" description="Manage doctor salary payments and commissions" icon={Users} />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4 w-52 h-20 flex items-center overflow-hidden">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <DollarSign className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900 whitespace-nowrap leading-tight">
                                            ₱{summary.total_paid.toLocaleString()}
                                        </div>
                                        <div className="text-gray-600 text-sm font-medium whitespace-nowrap">Total Paid</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4 w-52 h-20 flex items-center overflow-hidden">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900 whitespace-nowrap leading-tight">
                                            {summary.paid_payments}
                                        </div>
                                        <div className="text-gray-600 text-sm font-medium whitespace-nowrap">Paid Payments</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Doctor Payments Section */}
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Users className="h-6 w-6 text-black" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold text-gray-900">Doctor Payments</CardTitle>
                                <CardDescription>Manage doctor salary payments and commission tracking</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button asChild>
                                <Link href="/admin/billing/doctor-payments/create">
                                    <Plus className="mr-2 h-5 w-5" />
                                    New Payment
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/admin/billing/doctor-payments/summary">
                                    <FileText className="mr-2 h-5 w-5" />
                                    Summary Report
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {/* Table Controls */}
                        <div className="flex items-center py-4">
                            <Input
                                placeholder="Search payments..."
                                value={globalFilter ?? ""}
                                onChange={(event) => setGlobalFilter(event.target.value)}
                                className="max-w-sm"
                            />
                            <Button
                                asChild
                                className="bg-green-600 hover:bg-green-700 text-white ml-4"
                            >
                                <Link href="/admin/billing/doctor-payments/create">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Payment
                                </Link>
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

                        {/* Payments Table */}
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
                                                    <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                    <h3 className="mb-2 text-lg font-semibold text-gray-600">
                                                        {globalFilter ? 'No payments found' : 'No doctor payments yet'}
                                                    </h3>
                                                    <p className="text-gray-500">
                                                        {globalFilter ? 'Try adjusting your search terms' : 'Create your first doctor payment to get started'}
                                                    </p>
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
            </div>
        </AppLayout>
    );
}
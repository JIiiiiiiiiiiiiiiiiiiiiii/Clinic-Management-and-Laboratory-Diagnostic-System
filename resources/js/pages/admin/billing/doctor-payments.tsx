import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    CheckCircle, 
    Clock, 
    Eye, 
    Plus, 
    Users,
    TrendingUp,
    ArrowUpDown,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    DollarSign,
    X,
    Calendar
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

type DoctorPayment = {
    id: number;
    doctor_id: number;
    doctor: {
        specialist_id: number;
        name: string;
    };
    incentives: number;
    net_payment: number;
    status: 'pending' | 'paid' | 'cancelled';
    payment_date: string;
    paid_date?: string;
    notes?: string;
    created_by?: number;
    updated_by?: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Billing Management',
        href: '/admin/billing',
    },
    {
        title: 'Doctor Payments',
        href: '/admin/billing/doctor-payments',
    },
];

// Column definitions for the doctor payments table
const createDoctorPaymentsColumns = (): ColumnDef<DoctorPayment>[] => [
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
                +₱{row.getValue("incentives")?.toLocaleString() || '0.00'}
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
                ₱{row.getValue("net_payment")?.toLocaleString() || '0.00'}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const variantMap = {
                pending: 'warning',
                paid: 'success',
                cancelled: 'destructive'
            };
            
            return (
                <Badge variant={variantMap[status as keyof typeof variantMap] as any}>
                    <div className="flex items-center gap-1">
                        {status === 'pending' && <Clock className="h-3 w-3" />}
                        {status === 'paid' && <CheckCircle className="h-3 w-3" />}
                        {status === 'cancelled' && <X className="h-3 w-3" />}
                        {status}
                    </div>
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
                    <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/billing/doctor-payments/${payment.id}`}>
                            <Eye className="mr-1 h-3 w-3" />
                            View
                        </Link>
                    </Button>
                    {payment.status === 'pending' && (
                        <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-green-600 hover:text-green-700"
                            onClick={() => {
                                if (confirm('Are you sure you want to mark this payment as paid?')) {
                                    router.put(`/admin/billing/doctor-payments/${payment.id}/mark-paid`, {}, {
                                        onSuccess: () => {
                                            window.location.reload();
                                        },
                                        onError: (errors) => {
                                            console.error('Mark as paid failed:', errors);
                                            alert('Failed to mark payment as paid. Please try again.');
                                        },
                                    });
                                }
                            }}
                        >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Mark Paid
                        </Button>
                    )}
                </div>
            )
        },
    },
];

export default function DoctorPayments({ doctorPayments, filters = {} }: { doctorPayments: any, filters?: any }) {
    // TanStack Table state for doctor payments
    const [doctorSorting, setDoctorSorting] = React.useState<SortingState>([]);
    const [doctorColumnFilters, setDoctorColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [doctorColumnVisibility, setDoctorColumnVisibility] = React.useState<VisibilityState>({});
    const [doctorRowSelection, setDoctorRowSelection] = React.useState({});
    const [doctorGlobalFilter, setDoctorGlobalFilter] = React.useState('');
    
    // Date filtering state
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        return dateString;
    };
    
    const [selectedDate, setSelectedDate] = React.useState(filters.date || getTodayDate());

    // Update selectedDate to today if no filter is set
    React.useEffect(() => {
        if (!filters.date) {
            const today = getTodayDate();
            setSelectedDate(today);
        }
    }, [filters.date]);


    // Ensure we have data to work with
    const doctorPaymentsData = doctorPayments?.data || [];
    
    // Initialize doctor payments table
    const doctorColumns = createDoctorPaymentsColumns();
    const doctorTable = useReactTable({
        data: doctorPaymentsData || [],
        columns: doctorColumns,
        onSortingChange: setDoctorSorting,
        onColumnFiltersChange: setDoctorColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setDoctorColumnVisibility,
        onRowSelectionChange: setDoctorRowSelection,
        onGlobalFilterChange: setDoctorGlobalFilter,
        globalFilterFn: (row, columnId, value) => {
            const search = value.toLowerCase();
            const payment = row.original;
            return (
                payment.doctor?.name?.toLowerCase().includes(search) ||
                payment.status?.toLowerCase().includes(search)
            );
        },
        state: {
            sorting: doctorSorting,
            columnFilters: doctorColumnFilters,
            columnVisibility: doctorColumnVisibility,
            rowSelection: doctorRowSelection,
            globalFilter: doctorGlobalFilter,
        },
    });

    // Calculate statistics
    const totalPayments = doctorPaymentsData.length;
    const activeDoctors = new Set(doctorPaymentsData.map((payment: DoctorPayment) => payment.doctor_id)).size;
    const totalAmount = doctorPaymentsData.reduce((sum: number, payment: DoctorPayment) => {
        const amount = Number(payment.net_payment) || 0;
        return sum + amount;
    }, 0);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Doctor Payments" />
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Payments</p>
                                        <p className="text-3xl font-bold text-gray-900">{totalPayments}</p>
                                        <p className="text-sm text-gray-500">All doctor payments</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <DollarSign className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Active Doctors</p>
                                        <p className="text-3xl font-bold text-gray-900">{activeDoctors}</p>
                                        <p className="text-sm text-gray-500">Receiving payments</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <Users className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Amount</p>
                                        <p className="text-3xl font-bold text-gray-900">₱{totalAmount.toLocaleString()}</p>
                                        <p className="text-sm text-gray-500">Paid to doctors</p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-full">
                                        <TrendingUp className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>


                    {/* Data Table */}
                    <Card className="bg-white border border-gray-200">
                        <CardContent className="p-6">
                            {/* Table Controls */}
                            <div className="flex items-center justify-between py-4">
                                <div className="flex items-center gap-4">
                                    <Input
                                        placeholder="Search payments..."
                                        value={doctorGlobalFilter ?? ""}
                                        onChange={(event) => setDoctorGlobalFilter(event.target.value)}
                                        className="max-w-sm"
                                    />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline">
                                                Columns <ChevronDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                                            {doctorTable
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
                                <div className="flex items-center gap-3">
                                    {/* Date Filter Controls */}
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => {
                                                setSelectedDate(e.target.value);
                                                // Automatically filter when date changes
                                                router.get('/admin/billing/doctor-payments', {
                                                    date: e.target.value,
                                                    search: doctorGlobalFilter,
                                                }, {
                                                    preserveState: true,
                                                    replace: true,
                                                });
                                            }}
                                            className="h-10 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-lg"
                                        />
                                    </div>
                                    {/* Action Buttons */}
                                    <Button
                                        asChild
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Link href="/admin/billing/doctor-payments/create">
                                            <Plus className="h-4 w-4 mr-2" />
                                            New Payment
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href="/admin/billing/doctor-summary">
                                            <TrendingUp className="mr-2 h-4 w-4" />
                                            Summary Report
                                        </Link>
                                    </Button>
                                </div>
                            </div>


                            {/* Doctor Payments Table */}
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        {doctorTable.getHeaderGroups().map((headerGroup) => (
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
                                        {doctorTable.getRowModel().rows?.length ? (
                                            doctorTable.getRowModel().rows.map((row) => (
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
                                                    colSpan={doctorColumns.length}
                                                    className="h-24 text-center"
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                        <h3 className="mb-2 text-lg font-semibold text-gray-600">No doctor payments</h3>
                                                        <p className="text-gray-500">Create your first doctor payment</p>
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
                                    {doctorTable.getFilteredSelectedRowModel().rows.length} of{" "}
                                    {doctorTable.getFilteredRowModel().rows.length} row(s) selected.
                                </div>
                                <div className="flex items-center space-x-6 lg:space-x-8">
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm font-medium">Rows per page</p>
                                        <Select
                                            value={`${doctorTable.getState().pagination.pageSize}`}
                                            onValueChange={(value) => {
                                                doctorTable.setPageSize(Number(value))
                                            }}
                                        >
                                            <SelectTrigger className="h-8 w-[70px]">
                                                <SelectValue placeholder={doctorTable.getState().pagination.pageSize} />
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
                                        Page {doctorTable.getState().pagination.pageIndex + 1} of{" "}
                                        {doctorTable.getPageCount()}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="hidden size-8 lg:flex"
                                            onClick={() => doctorTable.setPageIndex(0)}
                                            disabled={!doctorTable.getCanPreviousPage()}
                                        >
                                            <span className="sr-only">Go to first page</span>
                                            <ChevronsLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-8"
                                            onClick={() => doctorTable.previousPage()}
                                            disabled={!doctorTable.getCanPreviousPage()}
                                        >
                                            <span className="sr-only">Go to previous page</span>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-8"
                                            onClick={() => doctorTable.nextPage()}
                                            disabled={!doctorTable.getCanNextPage()}
                                        >
                                            <span className="sr-only">Go to next page</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="hidden size-8 lg:flex"
                                            onClick={() => doctorTable.setPageIndex(doctorTable.getPageCount() - 1)}
                                            disabled={!doctorTable.getCanNextPage()}
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
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DatePickerWithLabel } from '@/components/ui/date-picker';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Clock, Download, Eye, FileText, Plus, Search, XCircle, ArrowUpDown, Filter, X } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';

type Order = {
    id: number;
    status: 'ordered' | 'processing' | 'completed' | 'cancelled';
    created_at: string;
    updated_at: string;
    notes?: string;
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        age: number;
        sex: string;
    } | null;
    lab_tests: Array<{
        id: number;
        name: string;
        code: string;
    }>;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Lab Orders',
        href: '/admin/laboratory/orders',
    },
];

const statusConfig = {
    ordered: { label: 'Ordered', color: 'bg-gray-500', icon: Clock },
    processing: { label: 'Processing', color: 'bg-gray-500', icon: AlertCircle },
    completed: { label: 'Completed', color: 'bg-gray-500', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-gray-500', icon: XCircle },
};

export default function LabOrdersIndex({ orders }: { orders: Order[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const safeOrders = Array.isArray(orders) ? orders : [];

    // Filter orders based on search term, date, and status
    const filteredOrders = safeOrders.filter((order) => {
        const matchesSearch = !searchTerm || 
            order.id.toString().includes(searchTerm.toLowerCase()) ||
            (order.patient && `${order.patient.first_name} ${order.patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
            order.lab_tests.some(test => test.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesDate = !dateFilter || 
            new Date(order.created_at).toDateString() === dateFilter.toDateString();
        
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        
        return matchesSearch && matchesDate && matchesStatus;
    });

    const columns: ColumnDef<Order>[] = [
        {
            accessorKey: 'id',
            header: 'Order #',
        },
        {
            accessorKey: 'patient',
            header: 'Patient',
            cell: ({ row }) => {
                const patient = row.getValue('patient') as Order['patient'];
                return (
                    <div>
                        <div className="font-medium">
                            {patient ? `${patient.last_name}, ${patient.first_name}` : '—'}
                        </div>
                        <div className="text-sm text-gray-500">
                            {patient ? `${patient.age} years, ${patient.sex}` : 'Unknown patient'}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'lab_tests',
            header: 'Tests Ordered',
            cell: ({ row }) => {
                const tests = row.getValue('lab_tests') as Order['lab_tests'];
                return (
                    <div className="flex flex-wrap gap-1">
                        {(tests || []).map((test) => (
                            <Badge key={test.id} variant="outline" className="text-xs">
                                {test.name}
                            </Badge>
                        ))}
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                return getStatusBadge(row.getValue('status') as keyof typeof statusConfig);
            },
        },
        {
            accessorKey: 'created_at',
            header: 'Ordered',
            cell: ({ row }) => {
                return <span className="text-sm text-gray-600">{new Date(row.getValue('created_at')).toLocaleString()}</span>;
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const order = row.original;
                return (
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href={`/admin/laboratory/orders/${order.id}`}>
                                <Eye className="mr-1 h-4 w-4" />
                                View Order
                            </Link>
                        </Button>
                        <Button onClick={() => handleEnterResults(order.id)} disabled={order.status === 'cancelled'}>
                            <FileText className="mr-1 h-4 w-4" />
                            Results
                        </Button>
                        {order.status === 'ordered' && (
                            <Button variant="outline" onClick={() => handleUpdateStatus(order.id, 'processing')}>
                                Start
                            </Button>
                        )}
                        {order.status === 'processing' && (
                            <Button onClick={() => handleUpdateStatus(order.id, 'completed')}>Complete</Button>
                        )}
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: filteredOrders,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    });

    const getStatusBadge = (status: keyof typeof statusConfig) => {
        const config = statusConfig[status];
        const Icon = config.icon;

        // Map status to appropriate badge variant
        const variantMap = {
            ordered: 'info',
            processing: 'warning',
            completed: 'success',
            cancelled: 'destructive',
        };

        return (
            <Badge variant={variantMap[status] as any}>
                <Icon className="mr-1 h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const handleEnterResults = (orderId: number) => {
        router.visit(`/admin/laboratory/orders/${orderId}/results`);
    };

    const handleUpdateStatus = (orderId: number, newStatus: string) => {
        router.put(
            `/admin/laboratory/orders/${orderId}/status`,
            { status: newStatus },
            {
                onError: (errors) => {
                    console.error('Status update failed:', errors);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lab Orders" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Heading title="Lab Orders" description="Manage laboratory orders and results" icon={FileText} />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex h-20 w-52 items-center overflow-hidden rounded-xl border bg-white px-6 py-4 shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gray-100 p-2">
                                        <FileText className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl leading-tight font-bold whitespace-nowrap text-gray-900">{orders.length}</div>
                                        <div className="text-sm font-medium whitespace-nowrap text-gray-600">Total Orders</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders Section */}
                <Card className="bg-white border border-gray-200">
                    <CardContent className="p-6">
                        {/* Table Controls */}
                        <div className="flex items-center py-4 gap-4 flex-wrap">
                            <Input
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm"
                            />
                            
                            {/* Date Filter */}
                            <div className="flex items-center gap-2">
                                <DatePickerWithLabel 
                                    label="Filter by Date" 
                                    placeholder="Select date"
                                    date={dateFilter}
                                    setDate={setDateFilter}
                                />
                                {dateFilter && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDateFilter(undefined)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium">Status:</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="ordered">Ordered</option>
                                    <option value="processing">Processing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            {/* Clear Filters Button */}
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm('');
                                    setDateFilter(undefined);
                                    setStatusFilter('all');
                                }}
                                className="flex items-center gap-2"
                            >
                                <X className="h-4 w-4" />
                                Clear Filters
                            </Button>

                            <Button
                                asChild
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Link href="/admin/laboratory/orders/create">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Order
                                </Link>
                            </Button>
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="ml-auto">
                                        Export <Download className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => window.open('/admin/laboratory/exports/orders.xlsx?format=excel', '_self')}>
                                        Excel
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.open('/admin/laboratory/exports/orders.xlsx?format=pdf', '_self')}>
                                        PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.open('/admin/laboratory/exports/orders.xlsx?format=word', '_self')}>
                                        Word
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                                
                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : (
                                                            <div
                                                                className={
                                                                    header.column.getCanSort()
                                                                        ? 'cursor-pointer select-none flex items-center'
                                                                        : 'flex items-center'
                                                                }
                                                                onClick={header.column.getToggleSortingHandler()}
                                                            >
                                                                {flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext()
                                                                )}
                                                                {header.column.getCanSort() && (
                                                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                                                )}
                                                            </div>
                                                        )}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                data-state={row.getIsSelected() && 'selected'}
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
                                    <select 
                                        className="h-8 w-[70px] rounded border border-gray-300 px-2 text-sm"
                                        value={table.getState().pagination.pageSize}
                                        onChange={(e) => {
                                            table.setPageSize(Number(e.target.value))
                                        }}
                                    >
                                        {[10, 20, 30, 40, 50].map((pageSize) => (
                                            <option key={pageSize} value={pageSize}>
                                                {pageSize}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                                    {table.getPageCount()}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        className="hidden size-8 lg:flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                        onClick={() => table.setPageIndex(0)}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        <span className="sr-only">Go to first page</span>
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        className="size-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        <span className="sr-only">Go to previous page</span>
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        className="size-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                    >
                                        <span className="sr-only">Go to next page</span>
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                    <button
                                        className="hidden size-8 lg:flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                        disabled={!table.getCanNextPage()}
                                    >
                                        <span className="sr-only">Go to last page</span>
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
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
import { AlertCircle, ArrowUpDown, CheckCircle, Clock, Download, Eye, FileText, FlaskConical, Link as LinkIcon, MoreHorizontal, PlayCircle, Plus, XCircle } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

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
    visit?: {
        id: number;
        notes?: string;
        attending_staff?: {
            id: number;
            name: string;
        } | null;
    } | null;
    ordered_by?: {
        id: number;
        name: string;
    } | null;
};

type AnalyticsData = {
    most_used_tests?: Array<{
        id: number;
        name: string;
        code: string;
        count: number;
    }>;
    most_common_combinations?: Array<{
        test_ids: number[];
        test_names: string[];
        display_name: string;
        count: number;
    }>;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Laboratory',
        href: '/admin/laboratory',
    },
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

export default function LabOrdersIndex({
    orders,
    analytics = {
        most_used_tests: [],
        most_common_combinations: [],
    },
}: {
    orders: Order[];
    analytics?: AnalyticsData;
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);

    const safeOrders = Array.isArray(orders) ? orders : [];

    // Calculate statistics with memoization
    const stats = useMemo(
        () => ({
            totalOrders: safeOrders.length,
            orderedOrders: safeOrders.filter((order) => order.status === 'ordered').length,
            processingOrders: safeOrders.filter((order) => order.status === 'processing').length,
            completedOrders: safeOrders.filter((order) => order.status === 'completed').length,
            cancelledOrders: safeOrders.filter((order) => order.status === 'cancelled').length,
        }),
        [safeOrders],
    );

    // Filter orders based on search term with memoization
    const filteredOrders = useMemo(() => {
        if (!searchTerm) return safeOrders;

        const searchLower = searchTerm.toLowerCase();
        return safeOrders.filter((order) => {
            return (
                order.id.toString().includes(searchLower) ||
                (order.patient && `${order.patient.first_name} ${order.patient.last_name}`.toLowerCase().includes(searchLower)) ||
                order.lab_tests.some((test) => test.name.toLowerCase().includes(searchLower))
            );
        });
    }, [safeOrders, searchTerm]);

    const handleEnterResults = useCallback((orderId: number) => {
        router.visit(`/admin/laboratory/orders/${orderId}/results`);
    }, []);

    const handleUpdateStatus = useCallback((orderId: number, newStatus: string) => {
        router.put(
            `/admin/laboratory/orders/${orderId}/status`,
            { status: newStatus },
            {
                onError: (errors) => {
                    console.error('Status update failed:', errors);
                },
            },
        );
    }, []);

    const columns: ColumnDef<Order>[] = useMemo(
        () => [
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
                            <div className="font-medium">{patient ? `${patient.last_name}, ${patient.first_name}` : '—'}</div>
                            <div className="text-sm text-gray-500">{patient ? `${patient.age} years, ${patient.sex}` : 'Unknown patient'}</div>
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
                                <Badge key={test.id} variant="outline" className="border-green-200 bg-green-100 text-xs text-green-800">
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
                accessorKey: 'ordered_by',
                header: 'Requested By',
                cell: ({ row }) => {
                    const order = row.original;
                    const orderedBy = order.ordered_by;
                    return (
                        <div className="text-sm">
                            {orderedBy ? (
                                <span className="font-medium text-gray-900">{orderedBy.name}</span>
                            ) : (
                                <span className="text-gray-400">—</span>
                            )}
                        </div>
                    );
                },
            },
            {
                id: 'actions',
                enableHiding: false,
                cell: ({ row }) => {
                    const order = row.original;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                <Link href={`/admin/laboratory/orders/${order.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                    View Order
                                </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                onClick={() => handleEnterResults(order.id)}
                                disabled={order.status === 'cancelled'}
                            >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Enter Results
                                </DropdownMenuItem>
                            {order.status === 'ordered' && (
                                    <DropdownMenuItem
                                    onClick={() => handleUpdateStatus(order.id, 'processing')}
                                    >
                                        <PlayCircle className="mr-2 h-4 w-4" />
                                        Start Processing
                                    </DropdownMenuItem>
                            )}
                            {order.status === 'processing' && (
                                    <DropdownMenuItem
                                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                                >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Mark Complete
                                    </DropdownMenuItem>
                            )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ],
        [handleEnterResults, handleUpdateStatus],
    );

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
            <Badge variant={variantMap[status] as any} className="border-green-200 bg-green-100 text-green-800">
                <Icon className="mr-1 h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lab Orders" />
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
                    {/* Statistics Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="border border-gray-200 bg-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                                        <p className="text-sm text-gray-500">All lab orders</p>
                                    </div>
                                    <div className="rounded-full bg-blue-100 p-3">
                                        <FileText className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-gray-200 bg-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Ordered</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.orderedOrders}</p>
                                        <p className="text-sm text-gray-500">New orders</p>
                                    </div>
                                    <div className="rounded-full bg-yellow-100 p-3">
                                        <Clock className="h-6 w-6 text-yellow-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-gray-200 bg-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Processing</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.processingOrders}</p>
                                        <p className="text-sm text-gray-500">In progress</p>
                                    </div>
                                    <div className="rounded-full bg-orange-100 p-3">
                                        <AlertCircle className="h-6 w-6 text-orange-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-gray-200 bg-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Completed</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.completedOrders}</p>
                                        <p className="text-sm text-gray-500">Finished orders</p>
                                    </div>
                                    <div className="rounded-full bg-green-100 p-3">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Analytics Cards - Most Used Tests & Combinations */}
                    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Most Used Tests */}
                        <Card className="border border-gray-200 bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FlaskConical className="h-5 w-5 text-blue-600" />
                                    Most Frequently Used Tests
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {analytics?.most_used_tests && analytics.most_used_tests.length > 0 ? (
                                    <div className="space-y-3">
                                        {analytics.most_used_tests.map((test, index) => (
                                            <div key={test.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{test.name}</p>
                                                        <p className="text-xs text-gray-500">{test.code}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">{test.count}</p>
                                                    <p className="text-xs text-gray-500">times used</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="py-4 text-center text-sm text-gray-500">No test usage data available</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Most Common Combinations */}
                        <Card className="border border-gray-200 bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LinkIcon className="h-5 w-5 text-green-600" />
                                    Most Common Test Combinations
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {analytics?.most_common_combinations && analytics.most_common_combinations.length > 0 ? (
                                    <div className="space-y-3">
                                        {analytics.most_common_combinations.map((combination, index) => (
                                            <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                                <div className="flex flex-1 items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                                                        {index + 1}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate font-medium text-gray-900">{combination.display_name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {combination.test_names.length} test{combination.test_names.length > 1 ? 's' : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="ml-2 text-right">
                                                    <p className="font-bold text-gray-900">{combination.count}</p>
                                                    <p className="text-xs text-gray-500">orders</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="py-4 text-center text-sm text-gray-500">No combination data available</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Data Table */}
                    <Card className="border border-gray-200 bg-white">
                        <CardContent className="p-6">
                            {/* Table Controls */}
                            <div className="flex items-center py-4">
                                <Input
                                    placeholder="Search orders..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="max-w-sm"
                                />

                                <Button asChild className="ml-4 bg-green-600 text-white hover:bg-green-700">
                                    <Link href="/admin/laboratory/orders/create">
                                        <Plus className="mr-2 h-4 w-4" />
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
                                                        {header.isPlaceholder ? null : (
                                                            <div
                                                                className={
                                                                    header.column.getCanSort()
                                                                        ? 'flex cursor-pointer items-center select-none'
                                                                        : 'flex items-center'
                                                                }
                                                                onClick={header.column.getToggleSortingHandler()}
                                                            >
                                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                                {header.column.getCanSort() && <ArrowUpDown className="ml-2 h-4 w-4" />}
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
                                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                                    {row.getVisibleCells().map((cell) => (
                                                        <TableCell key={cell.id}>
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                                    No results.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between px-2 py-4">
                                <div className="flex-1 text-sm text-muted-foreground">
                                    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
                                </div>
                                <div className="flex items-center space-x-6 lg:space-x-8">
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm font-medium">Rows per page</p>
                                        <select
                                            className="h-8 w-[70px] rounded border border-gray-300 px-2 text-sm"
                                            value={table.getState().pagination.pageSize}
                                            onChange={(e) => {
                                                table.setPageSize(Number(e.target.value));
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
                                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            className="hidden size-8 items-center justify-center rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 lg:flex"
                                            onClick={() => table.setPageIndex(0)}
                                            disabled={!table.getCanPreviousPage()}
                                        >
                                            <span className="sr-only">Go to first page</span>
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            className="flex size-8 items-center justify-center rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                            onClick={() => table.previousPage()}
                                            disabled={!table.getCanPreviousPage()}
                                        >
                                            <span className="sr-only">Go to previous page</span>
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            className="flex size-8 items-center justify-center rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                            onClick={() => table.nextPage()}
                                            disabled={!table.getCanNextPage()}
                                        >
                                            <span className="sr-only">Go to next page</span>
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                        <button
                                            className="hidden size-8 items-center justify-center rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 lg:flex"
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
            </div>
        </AppLayout>
    );
}

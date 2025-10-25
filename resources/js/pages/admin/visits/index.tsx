import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { 
    Eye, CheckCircle, XCircle, Clock, User, Calendar, Users, UserCheck, 
    Heart, ArrowUpDown, ChevronDown, Search, Filter, RefreshCw, Plus, History,
    MoreHorizontal, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
    Stethoscope, CalendarDays, ArrowRight, Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Patient Management', href: '/admin/patient' },
    { title: 'Visits', href: '/admin/visits' },
];

// Column definitions for the visits table
const createColumns = (): ColumnDef<any>[] => [
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
            const visit = row.original;
            return (
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                        <div className="font-medium">
                            {visit.patient?.first_name} {visit.patient?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                            {visit.patient?.patient_code || visit.patient?.sequence_number || visit.patient?.patient_no}
                        </div>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "visit_date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Date & Time
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const visit = row.original;
            const dateTime = visit.visit_date_time_time || visit.visit_date_time || visit.visit_date;
            return (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {dateTime ? format(new Date(dateTime), 'MMM dd, yyyy HH:mm') : 'N/A'}
                </div>
            );
        },
    },
    {
        accessorKey: "purpose",
        header: "Purpose",
        cell: ({ row }) => (
            <div className="text-sm max-w-[200px] truncate" title={row.getValue("purpose")}>
                {row.getValue("purpose") || "N/A"}
            </div>
        ),
    },
    {
        accessorKey: "staff",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Staff
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const visit = row.original;
            return (
                <div>
                    <div className="font-medium">{visit.staff?.name || 'No staff assigned'}</div>
                    <div className="text-sm text-gray-500 capitalize">{visit.staff?.role || 'N/A'}</div>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const getStatusBadge = (status: string) => {
                switch (status) {
                    case 'scheduled':
                        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200"><Clock className="w-3 h-3 mr-1" />Scheduled</Badge>;
                    case 'in_progress':
                        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
                    case 'completed':
                        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
                    case 'cancelled':
                        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
                    default:
                        return <Badge variant="outline">{status}</Badge>;
                }
            };
            return getStatusBadge(status);
        },
    },
    {
        accessorKey: "visit_type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("visit_type") as string;
            const getTypeBadge = (type: string) => {
                switch (type) {
                    case 'initial':
                        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Initial Visit</Badge>;
                    case 'follow_up':
                        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Follow-up</Badge>;
                    case 'lab_result_review':
                        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Lab Review</Badge>;
                    default:
                        return <Badge variant="outline">{type}</Badge>;
                }
            };
            return getTypeBadge(type);
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const visit = row.original;

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
                            <Link href={`/admin/visits/${visit.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/visits/${visit.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Visit
                            </Link>
                        </DropdownMenuItem>
                        {visit.visit_type === 'initial' && (
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/visits/${visit.id}/follow-up`}>
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Create Follow-up
                                </Link>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
];

interface VisitsIndexProps {
    initial_visits: any[];
    follow_up_visits: any[];
    initial_visits_pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    follow_up_visits_pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        visit_type?: string;
        date_from?: string;
        date_to?: string;
        staff_id?: string;
        sort_by?: string;
        sort_dir?: string;
    };
    staff: any[];
    status_options: Record<string, string>;
    visit_type_options: Record<string, string>;
}

export default function VisitsIndex({ 
    initial_visits = [], 
    follow_up_visits = [], 
    initial_visits_pagination, 
    follow_up_visits_pagination, 
    filters = {}, 
    staff = [], 
    status_options = {}, 
    visit_type_options = {} 
}: VisitsIndexProps) {
    // TanStack Table state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState(filters.search || '');

    // Combine all visits for the table
    const allVisits = [...initial_visits, ...follow_up_visits];

    // Initialize table
    const columns = createColumns();
    const table = useReactTable({
        data: allVisits || [],
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
            const visit = row.original;
            return (
                visit.patient?.first_name?.toLowerCase().includes(search) ||
                visit.patient?.last_name?.toLowerCase().includes(search) ||
                visit.patient?.patient_code?.toLowerCase().includes(search) ||
                visit.purpose?.toLowerCase().includes(search) ||
                visit.staff?.name?.toLowerCase().includes(search)
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

    const stats = {
        totalVisits: initial_visits_pagination.total + follow_up_visits_pagination.total,
        initialVisits: initial_visits_pagination.total,
        followUpVisits: follow_up_visits_pagination.total,
        completedToday: initial_visits.filter(v => v.status === 'completed' && new Date(v.visit_date).toDateString() === new Date().toDateString()).length + 
                       follow_up_visits.filter(v => v.status === 'completed' && new Date(v.visit_date).toDateString() === new Date().toDateString()).length
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Visits Management" />
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Visits</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.totalVisits}</p>
                                        <p className="text-sm text-gray-500">All patient visits</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <Calendar className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Initial Visits</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.initialVisits}</p>
                                        <p className="text-sm text-gray-500">First-time visits</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <UserCheck className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Follow-up Visits</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.followUpVisits}</p>
                                        <p className="text-sm text-gray-500">Subsequent visits</p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-full">
                                        <ArrowRight className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Completed Today</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.completedToday}</p>
                                        <p className="text-sm text-gray-500">Finished visits</p>
                                    </div>
                                    <div className="p-3 bg-orange-100 rounded-full">
                                        <CheckCircle className="h-6 w-6 text-orange-600" />
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
                                    placeholder="Search visits..."
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
        </AppLayout>
    );
}
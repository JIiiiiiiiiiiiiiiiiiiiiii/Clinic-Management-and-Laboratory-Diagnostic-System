import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Building2,
    Phone,
    Mail,
    MapPin,
    CheckCircle,
    XCircle,
    ArrowUpDown,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
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

type HmoProvider = {
    id: number;
    name: string;
    code: string;
    description?: string;
    contact_number?: string;
    email?: string;
    address?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'HMO Providers', href: '/admin/billing/hmo-providers' },
];

// Column definitions for the HMO providers table
const createHmoProviderColumns = (handleDelete: (providerId: number) => void, toggleStatus: (providerId: number, currentStatus: boolean) => void): ColumnDef<HmoProvider>[] => [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Provider
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                    <div className="font-medium text-gray-900">{row.getValue("name")}</div>
                    {row.original.description && (
                        <div className="text-sm text-gray-500">{row.original.description}</div>
                    )}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "code",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Code
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <Badge variant="outline" className="font-mono">
                {row.getValue("code")}
            </Badge>
        ),
    },
    {
        accessorKey: "contact_number",
        header: "Contact",
        cell: ({ row }) => (
            <div className="space-y-1">
                {row.original.contact_number && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        {row.original.contact_number}
                    </div>
                )}
                {row.original.email && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        {row.original.email}
                    </div>
                )}
                {row.original.address && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        {row.original.address}
                    </div>
                )}
            </div>
        ),
    },
    {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.getValue("is_active") as boolean;
            return (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(row.original.id, isActive)}
                        className={isActive ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}
                    >
                        {isActive ? (
                            <>
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Active
                            </>
                        ) : (
                            <>
                                <XCircle className="mr-1 h-3 w-3" />
                                Inactive
                            </>
                        )}
                    </Button>
                </div>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Created
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-sm text-gray-500">
                {new Date(row.getValue("created_at")).toLocaleDateString()}
            </div>
        ),
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const provider = row.original;

            return (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/billing/hmo-providers/${provider.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(provider.id)}
                        className="text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                    </Button>
                </div>
            )
        },
    },
];

export default function HmoProvidersIndex({ 
    hmoProviders = [],
    filters = {}
}: { 
    hmoProviders: HmoProvider[];
    filters: any;
}) {
    // TanStack Table state
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = React.useState(filters.search || '');

    const handleDelete = (providerId: number) => {
        if (confirm('Are you sure you want to delete this HMO provider? This action cannot be undone.')) {
            router.delete(`/admin/billing/hmo-providers/${providerId}`, {
                onSuccess: () => {
                    // Provider will be removed from the list
                },
                onError: (errors) => {
                    console.error('Delete failed:', errors);
                    alert('Failed to delete HMO provider. Please try again.');
                },
            });
        }
    };

    const toggleStatus = (providerId: number, currentStatus: boolean) => {
        router.put(`/admin/billing/hmo-providers/${providerId}/toggle-status`, {
            is_active: !currentStatus
        }, {
            onSuccess: () => {
                // Status will be updated
            },
            onError: (errors) => {
                console.error('Status update failed:', errors);
                alert('Failed to update provider status. Please try again.');
            },
        });
    };

    // Initialize table
    const columns = createHmoProviderColumns(handleDelete, toggleStatus);
    const table = useReactTable({
        data: hmoProviders || [],
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
            const provider = row.original;
            return (
                provider.name?.toLowerCase().includes(search) ||
                provider.code?.toLowerCase().includes(search) ||
                provider.contact_number?.toLowerCase().includes(search) ||
                provider.email?.toLowerCase().includes(search)
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
            <Head title="HMO Providers" />
            <div className="min-h-screen bg-white p-6">
                {/* Main Content */}
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Building2 className="h-6 w-6 text-black" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold text-gray-900">HMO Providers</CardTitle>
                                <p className="text-sm text-gray-500 mt-1">Manage health insurance providers</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {/* Table Controls */}
                        <div className="flex items-center py-4">
                            <Input
                                placeholder="Search providers..."
                                value={globalFilter ?? ""}
                                onChange={(event) => setGlobalFilter(event.target.value)}
                                className="max-w-sm"
                            />
                            <Button
                                asChild
                                className="bg-green-600 hover:bg-green-700 text-white ml-4"
                            >
                                <Link href="/admin/billing/hmo-providers/create">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Provider
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

                        {/* Providers Table */}
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
                                                    <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                    <h3 className="mb-2 text-lg font-semibold text-gray-600">No HMO providers found</h3>
                                                    <p className="text-gray-500 mb-4">Create your first HMO provider</p>
                                                    <Button asChild>
                                                        <Link href="/admin/billing/hmo-providers/create">
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Add Provider
                                                        </Link>
                                                    </Button>
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

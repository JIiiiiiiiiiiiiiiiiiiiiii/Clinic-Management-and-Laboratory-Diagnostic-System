import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
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
    Package, 
    AlertTriangle, 
    Users,
    Plus,
    Trash2,
    FlaskConical,
    Activity,
    ArrowUpDown,
    ArrowUp, 
    ArrowDown, 
    ChevronsUpDown, 
    ChevronLeft, 
    ChevronRight, 
    ChevronsLeft, 
    ChevronsRight, 
    Settings2, 
    EyeOff, 
    ChevronDown
} from 'lucide-react';
import { useState, useMemo } from 'react';

type InventoryStats = {
    total_items: number;
    low_stock_items: number;
    out_of_stock_items: number;
    total_suppliers: number;
    total_movements_today: number;
    consumed_today: number;
    rejected_today: number;
};

type RecentMovement = {
    id: number;
    movement_type: string;
    quantity: number;
    remarks: string;
    created_at: string;
    inventory_item: {
        item_name: string;
        item_code: string;
    };
};

type LowStockItem = {
    id: number;
    item_name: string;
    item_code: string;
    stock: number;
    low_stock_alert: number;
    status: string;
    assigned_to: string;
};

interface InventoryItem {
    id: number;
    item_name: string;
    item_code: string;
    category: string;
    stock: number;
    low_stock_alert: number;
    location: string;
    assigned_to: string;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    last_updated: string;
}

interface InventoryDashboardProps {
    stats: InventoryStats;
    recentMovements: RecentMovement[];
    lowStockItems: LowStockItem[];
    doctorNurseItems: InventoryItem[];
    medTechItems: InventoryItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Management',
        href: '/admin/inventory',
    },
];

const createDoctorNurseColumns = (): ColumnDef<InventoryItem>[] => [
    {
        accessorKey: "item_code",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Item Code
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("item_code")}</div>
        ),
    },
    {
        accessorKey: "item_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Item Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const item = row.original;
            return (
                <div>
                    <div className="font-medium">{item.item_name}</div>
                    <div className="text-sm text-gray-500">{item.category}</div>
                </div>
            );
        },
    },
    {
        accessorKey: "stock",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Stock
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const stock = row.getValue("stock") as number;
            const lowStockAlert = row.original.low_stock_alert;
            const isLowStock = stock <= lowStockAlert;
            
            return (
                <div className="flex items-center gap-2">
                    <span className={`font-medium ${isLowStock ? 'text-orange-600' : 'text-gray-900'}`}>
                        {stock}
                    </span>
                    {isLowStock && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                </div>
            );
        },
    },
    {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => {
            return <div className="text-sm">{row.getValue("location")}</div>;
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
                    case 'in_stock':
                        return 'bg-green-100 text-green-800';
                    case 'low_stock':
                        return 'bg-orange-100 text-orange-800';
                    case 'out_of_stock':
                        return 'bg-red-100 text-red-800';
                    default:
                        return 'bg-gray-100 text-gray-800';
                }
            };
            
            return (
                <Badge className={getStatusBadge(status)}>
                    {status.replace('_', ' ').toUpperCase()}
                </Badge>
            );
        },
    },
    {
        accessorKey: "last_updated",
        header: "Last Updated",
        cell: ({ row }) => {
            const date = new Date(row.getValue("last_updated"));
            return (
                <div className="text-sm">
                    {date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    })}
                </div>
            );
        },
    },
];

const createMedTechColumns = (): ColumnDef<InventoryItem>[] => [
    {
        accessorKey: "item_code",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Item Code
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("item_code")}</div>
        ),
    },
    {
        accessorKey: "item_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Item Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const item = row.original;
            return (
                <div>
                    <div className="font-medium">{item.item_name}</div>
                    <div className="text-sm text-gray-500">{item.category}</div>
                </div>
            );
        },
    },
    {
        accessorKey: "stock",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Stock
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const stock = row.getValue("stock") as number;
            const lowStockAlert = row.original.low_stock_alert;
            const isLowStock = stock <= lowStockAlert;
            
            return (
                <div className="flex items-center gap-2">
                    <span className={`font-medium ${isLowStock ? 'text-orange-600' : 'text-gray-900'}`}>
                        {stock}
                    </span>
                    {isLowStock && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                </div>
            );
        },
    },
    {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => {
            return <div className="text-sm">{row.getValue("location")}</div>;
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
                    case 'in_stock':
                        return 'bg-green-100 text-green-800';
                    case 'low_stock':
                        return 'bg-orange-100 text-orange-800';
                    case 'out_of_stock':
                        return 'bg-red-100 text-red-800';
                    default:
                        return 'bg-gray-100 text-gray-800';
                }
            };
            
            return (
                <Badge className={getStatusBadge(status)}>
                    {status.replace('_', ' ').toUpperCase()}
                </Badge>
            );
        },
    },
    {
        accessorKey: "last_updated",
        header: "Last Updated",
        cell: ({ row }) => {
            const date = new Date(row.getValue("last_updated"));
            return (
                <div className="text-sm">
                    {date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    })}
                </div>
            );
        },
    },
];

export default function InventoryDashboard({
    stats,
    recentMovements = [],
    lowStockItems = [],
    doctorNurseItems = [],
    medTechItems = [],
}: InventoryDashboardProps) {
    // TanStack Table state for Doctor & Nurse Items
    const [doctorNurseSorting, setDoctorNurseSorting] = useState<SortingState>([]);
    const [doctorNurseColumnFilters, setDoctorNurseColumnFilters] = useState<ColumnFiltersState>([]);
    const [doctorNurseColumnVisibility, setDoctorNurseColumnVisibility] = useState<VisibilityState>({});
    const [doctorNurseRowSelection, setDoctorNurseRowSelection] = useState({});
    const [doctorNurseGlobalFilter, setDoctorNurseGlobalFilter] = useState('');
    const [doctorNursePagination, setDoctorNursePagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    });

    // TanStack Table state for Med Tech Items
    const [medTechSorting, setMedTechSorting] = useState<SortingState>([]);
    const [medTechColumnFilters, setMedTechColumnFilters] = useState<ColumnFiltersState>([]);
    const [medTechColumnVisibility, setMedTechColumnVisibility] = useState<VisibilityState>({});
    const [medTechRowSelection, setMedTechRowSelection] = useState({});
    const [medTechGlobalFilter, setMedTechGlobalFilter] = useState('');
    const [medTechPagination, setMedTechPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    });

    // Initialize tables
    const doctorNurseColumns = useMemo(() => createDoctorNurseColumns(), []);
    const medTechColumns = useMemo(() => createMedTechColumns(), []);

    const doctorNurseTable = useReactTable({
        data: doctorNurseItems || [],
        columns: doctorNurseColumns,
        onSortingChange: setDoctorNurseSorting,
        onColumnFiltersChange: setDoctorNurseColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setDoctorNurseColumnVisibility,
        onRowSelectionChange: setDoctorNurseRowSelection,
        onGlobalFilterChange: setDoctorNurseGlobalFilter,
        globalFilterFn: (row, columnId, value) => {
            const search = value.toLowerCase();
            const item = row.original;
            return Boolean(
                item.item_name?.toLowerCase().includes(search) ||
                item.item_code?.toLowerCase().includes(search) ||
                item.category?.toLowerCase().includes(search) ||
                item.location?.toLowerCase().includes(search)
            );
        },
        state: {
            sorting: doctorNurseSorting,
            columnFilters: doctorNurseColumnFilters,
            columnVisibility: doctorNurseColumnVisibility,
            rowSelection: doctorNurseRowSelection,
            globalFilter: doctorNurseGlobalFilter,
            pagination: doctorNursePagination,
        },
        onPaginationChange: setDoctorNursePagination,
    });

    const medTechTable = useReactTable({
        data: medTechItems || [],
        columns: medTechColumns,
        onSortingChange: setMedTechSorting,
        onColumnFiltersChange: setMedTechColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setMedTechColumnVisibility,
        onRowSelectionChange: setMedTechRowSelection,
        onGlobalFilterChange: setMedTechGlobalFilter,
        globalFilterFn: (row, columnId, value) => {
            const search = value.toLowerCase();
            const item = row.original;
            return Boolean(
                item.item_name?.toLowerCase().includes(search) ||
                item.item_code?.toLowerCase().includes(search) ||
                item.category?.toLowerCase().includes(search) ||
                item.location?.toLowerCase().includes(search)
            );
        },
        state: {
            sorting: medTechSorting,
            columnFilters: medTechColumnFilters,
            columnVisibility: medTechColumnVisibility,
            rowSelection: medTechRowSelection,
            globalFilter: medTechGlobalFilter,
            pagination: medTechPagination,
        },
        onPaginationChange: setMedTechPagination,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Management" />
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Items</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.total_items}</p>
                                        <p className="text-sm text-gray-500">All inventory items</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <Package className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Low Stock</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.low_stock_items}</p>
                                        <p className="text-sm text-gray-500">Items running low</p>
                                    </div>
                                    <div className="p-3 bg-orange-100 rounded-full">
                                        <AlertTriangle className="h-6 w-6 text-orange-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.out_of_stock_items}</p>
                                        <p className="text-sm text-gray-500">No stock available</p>
                                    </div>
                                    <div className="p-3 bg-red-100 rounded-full">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Consumed</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.consumed_today || 0}</p>
                                        <p className="text-sm text-gray-500">Items used today</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <Activity className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Rejected</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.rejected_today || 0}</p>
                                        <p className="text-sm text-gray-500">Items rejected</p>
                                    </div>
                                    <div className="p-3 bg-gray-100 rounded-full">
                                        <Trash2 className="h-6 w-6 text-gray-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Doctor & Nurse Items Section - Completely Separate */}
                    <div className="mb-16">
                        <Card className="bg-white border border-gray-200 shadow-lg">
                            <CardHeader className="bg-white border-b border-gray-200">
                                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                    <Users className="h-5 w-5 text-black" />
                                    Doctor & Nurse Items ({doctorNurseTable.getFilteredRowModel().rows.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {/* Controls */}
                                <div className="flex flex-wrap items-center gap-4 py-4">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <Input
                                            placeholder="Search items..."
                                            value={doctorNurseGlobalFilter ?? ""}
                                            onChange={(event) => setDoctorNurseGlobalFilter(event.target.value)}
                                            className="max-w-sm"
                                        />
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            {doctorNurseTable.getHeaderGroups().map((headerGroup) => (
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
                                            {doctorNurseTable.getRowModel().rows?.length ? (
                                                doctorNurseTable.getRowModel().rows.map((row) => (
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
                                                        colSpan={doctorNurseColumns.length}
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
                                        Showing {doctorNurseTable.getRowModel().rows.length} of {doctorNurseTable.getFilteredRowModel().rows.length} items
                                    </div>
                                    <div className="flex items-center space-x-6 lg:space-x-8">
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm font-medium">Rows per page</p>
                                            <Select
                                                value={`${doctorNurseTable.getState().pagination.pageSize}`}
                                                onValueChange={(value) => {
                                                    doctorNurseTable.setPageSize(Number(value))
                                                }}
                                            >
                                                <SelectTrigger className="h-8 w-[70px]">
                                                    <SelectValue placeholder={doctorNurseTable.getState().pagination.pageSize} />
                                                </SelectTrigger>
                                                <SelectContent side="top">
                                                    {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                                            {pageSize}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                            Page {doctorNurseTable.getState().pagination.pageIndex + 1} of{" "}
                                            {doctorNurseTable.getPageCount()}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="hidden size-8 lg:flex"
                                                onClick={() => doctorNurseTable.setPageIndex(0)}
                                                disabled={!doctorNurseTable.getCanPreviousPage()}
                                            >
                                                <span className="sr-only">Go to first page</span>
                                                <ChevronsLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => doctorNurseTable.previousPage()}
                                                disabled={!doctorNurseTable.getCanPreviousPage()}
                                            >
                                                <span className="sr-only">Go to previous page</span>
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => doctorNurseTable.nextPage()}
                                                disabled={!doctorNurseTable.getCanNextPage()}
                                            >
                                                <span className="sr-only">Go to next page</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="hidden size-8 lg:flex"
                                                onClick={() => doctorNurseTable.setPageIndex(doctorNurseTable.getPageCount() - 1)}
                                                disabled={!doctorNurseTable.getCanNextPage()}
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


                    {/* Med Tech Items Section - Completely Separate */}
                    <div className="mb-8">
                        <Card className="bg-white border border-gray-200 shadow-lg">
                            <CardHeader className="bg-white border-b border-gray-200">
                                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                    <FlaskConical className="h-5 w-5 text-black" />
                                    Med Tech Items ({medTechTable.getFilteredRowModel().rows.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {/* Controls */}
                                <div className="flex flex-wrap items-center gap-4 py-4">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <Input
                                            placeholder="Search items..."
                                            value={medTechGlobalFilter ?? ""}
                                            onChange={(event) => setMedTechGlobalFilter(event.target.value)}
                                            className="max-w-sm"
                                        />
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            {medTechTable.getHeaderGroups().map((headerGroup) => (
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
                                            {medTechTable.getRowModel().rows?.length ? (
                                                medTechTable.getRowModel().rows.map((row) => (
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
                                                        colSpan={medTechColumns.length}
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
                                        Showing {medTechTable.getRowModel().rows.length} of {medTechTable.getFilteredRowModel().rows.length} items
                                    </div>
                                    <div className="flex items-center space-x-6 lg:space-x-8">
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm font-medium">Rows per page</p>
                                            <Select
                                                value={`${medTechTable.getState().pagination.pageSize}`}
                                                onValueChange={(value) => {
                                                    medTechTable.setPageSize(Number(value))
                                                }}
                                            >
                                                <SelectTrigger className="h-8 w-[70px]">
                                                    <SelectValue placeholder={medTechTable.getState().pagination.pageSize} />
                                                </SelectTrigger>
                                                <SelectContent side="top">
                                                    {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                                            {pageSize}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                            Page {medTechTable.getState().pagination.pageIndex + 1} of{" "}
                                            {medTechTable.getPageCount()}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="hidden size-8 lg:flex"
                                                onClick={() => medTechTable.setPageIndex(0)}
                                                disabled={!medTechTable.getCanPreviousPage()}
                                            >
                                                <span className="sr-only">Go to first page</span>
                                                <ChevronsLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => medTechTable.previousPage()}
                                                disabled={!medTechTable.getCanPreviousPage()}
                                            >
                                                <span className="sr-only">Go to previous page</span>
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => medTechTable.nextPage()}
                                                disabled={!medTechTable.getCanNextPage()}
                                            >
                                                <span className="sr-only">Go to next page</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="hidden size-8 lg:flex"
                                                onClick={() => medTechTable.setPageIndex(medTechTable.getPageCount() - 1)}
                                                disabled={!medTechTable.getCanNextPage()}
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
            </div>
        </AppLayout>
    );
}

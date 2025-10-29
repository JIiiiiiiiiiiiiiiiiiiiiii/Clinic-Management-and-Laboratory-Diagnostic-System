import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
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
    ArrowLeft,
    Download,
    FileSpreadsheet,
    FileText,
    Filter,
    Search,
    UserCheck,
    Users,
    TrendingUp,
    Award,
    Calendar,
    CheckCircle,
    MoreHorizontal,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowUpDown
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';

interface Specialist {
    id: string;
    name: string;
    type: string;
    total_appointments: number;
    completed_appointments: number;
    completion_rate: number;
}

interface Props {
    specialists: Specialist[];
    summary: {
        total_specialists: number;
        doctors: number;
        medtechs: number;
        average_completion_rate: number;
    };
    filterOptions: {
        doctors: Array<{ id: number; name: string }>;
        departments: string[];
        statuses: string[];
        payment_methods: string[];
        hmo_providers: string[];
    };
    metadata: {
        generated_at: string;
        generated_by: string;
        generated_by_role: string;
        system_version: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/admin/reports' },
    { title: 'Specialist Management', href: '/admin/reports/specialist-management' },
];

const createColumns = (): ColumnDef<Specialist>[] => [
    {
        accessorKey: "id",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Specialist ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("id")}</div>
        ),
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("name")}</div>
        ),
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as string;
            const getTypeBadge = (type: string) => {
                switch (type.toLowerCase()) {
                    case 'doctor':
                        return <Badge variant="default" className="bg-blue-100 text-blue-800">Doctor</Badge>;
                    case 'medtech':
                        return <Badge variant="default" className="bg-green-100 text-green-800">MedTech</Badge>;
                    case 'nurse':
                        return <Badge variant="default" className="bg-purple-100 text-purple-800">Nurse</Badge>;
                    default:
                        return <Badge variant="secondary">{type}</Badge>;
                }
            };
            return getTypeBadge(type);
        },
    },
    {
        accessorKey: "total_appointments",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Total Appointments
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-center">{row.getValue("total_appointments")}</div>
        ),
    },
    {
        accessorKey: "completed_appointments",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Completed
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-center">{row.getValue("completed_appointments")}</div>
        ),
    },
    {
        accessorKey: "completion_rate",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Completion Rate
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const rate = row.getValue("completion_rate") as number;
            const getCompletionRateColor = (rate: number) => {
                if (rate >= 90) return 'text-green-600';
                if (rate >= 70) return 'text-yellow-600';
                return 'text-red-600';
            };
            return (
                <div className={`font-medium ${getCompletionRateColor(rate)}`}>
                    {rate.toFixed(1)}%
                </div>
            );
        },
    },
    {
        id: "performance",
        header: "Performance",
        cell: ({ row }) => {
            const rate = row.original.completion_rate;
            return (
                <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                            className={`h-2 rounded-full ${
                                rate >= 90 ? 'bg-green-500' :
                                rate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(rate, 100)}%` }}
                        />
                    </div>
                    <span className="text-sm text-gray-500">
                        {rate >= 90 ? 'Excellent' : rate >= 70 ? 'Good' : 'Needs Improvement'}
                    </span>
                </div>
            );
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const specialist = row.original;

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
                        <DropdownMenuItem onClick={() => window.open(`/admin/reports/export?type=specialist-management&specialist_id=${specialist.id}&format=pdf`, '_blank')}>
                            <FileText className="mr-2 h-4 w-4" />
                            Export PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/admin/reports/export?type=specialist-management&specialist_id=${specialist.id}&format=excel`, '_blank')}>
                            <Download className="mr-2 h-4 w-4" />
                            Export Excel
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
];

export default function SpecialistManagementReports({ specialists, summary, filterOptions, metadata }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    
    // TanStack Table state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState('');

    const handleExport = (format: string) => {
        const params = new URLSearchParams({
            format: format,
            search: searchTerm,
            type: typeFilter,
        });
        window.location.href = `/admin/reports/export?type=specialist-management&${params.toString()}`;
    };

    // Initialize table
    const columns = useMemo(() => createColumns(), []);
    
    const table = useReactTable({
        data: specialists,
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
            const specialist = row.original;
            return (
                specialist.name?.toLowerCase().includes(search) ||
                specialist.type?.toLowerCase().includes(search) ||
                specialist.id?.toLowerCase().includes(search)
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

    const getTypeBadge = (type: string) => {
        const typeConfig = {
            doctor: { variant: 'default' as const, color: 'text-blue-600', icon: UserCheck },
            medtech: { variant: 'secondary' as const, color: 'text-purple-600', icon: Award },
        };
        
        const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.doctor;
        const Icon = config.icon;
        
        return (
            <Badge variant={config.variant} className={`${config.color} flex items-center gap-1`}>
                <Icon className="h-3 w-3" />
                {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
        );
    };

    const getCompletionRateColor = (rate: number) => {
        if (rate >= 90) return 'text-green-600';
        if (rate >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Prepare chart data
    const typeDistribution = [
        { type: 'Doctors', count: summary.doctors },
        { type: 'MedTechs', count: summary.medtechs },
    ];

    const performanceData = specialists
        .sort((a, b) => b.completion_rate - a.completion_rate)
        .slice(0, 10)
        .map(specialist => ({
            name: specialist.name.split(' ')[0], // First name only for chart
            completion_rate: specialist.completion_rate,
            appointments: specialist.total_appointments,
        }));

    return (
        <AppLayout breadcrumbs={breadcrumbs as any}>
            <Head title="Specialist Management Reports" />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => handleExport('excel')}>
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    Export Excel
                                </Button>
                                <Button variant="outline" onClick={() => handleExport('pdf')}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Export PDF
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Specialists</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.total_specialists.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">All specialists</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Doctors</CardTitle>
                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{summary.doctors.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">Medical doctors</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">MedTechs</CardTitle>
                                <Award className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-600">{summary.medtechs.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">Medical technologists</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.average_completion_rate.toFixed(1)}%</div>
                                <p className="text-xs text-muted-foreground">Appointment completion</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="search">Search</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="search"
                                            placeholder="Search specialists..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Specialist Type</Label>
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Types</SelectItem>
                                            <SelectItem value="doctor">Doctor</SelectItem>
                                            <SelectItem value="medtech">MedTech</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end">
                                    <Button className="w-full">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Apply Filters
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Charts */}
                    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Type Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    Specialist Type Distribution
                                </CardTitle>
                                <CardDescription>Distribution of specialist types</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ChartContainer
                                        config={{
                                            Doctors: { label: 'Doctors', color: '#3b82f6' },
                                            MedTechs: { label: 'MedTechs', color: '#8b5cf6' },
                                        }}
                                        className="h-full w-full"
                                    >
                                        <PieChart>
                                            <Pie
                                                data={typeDistribution}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="count"
                                            >
                                                {typeDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#8b5cf6'} />
                                                ))}
                                            </Pie>
                                            <ChartTooltip content={<ChartTooltipContent formatter={(value) => [value, 'Specialists']} />} />
                                        </PieChart>
                                    </ChartContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    Top Performers
                                </CardTitle>
                                <CardDescription>Specialists with highest completion rates</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ChartContainer
                                        config={{
                                            completion_rate: { label: 'Completion Rate (%)', color: '#10b981' },
                                        }}
                                        className="h-full w-full"
                                    >
                                        <BarChart data={performanceData}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                                            <XAxis dataKey="name" className="text-sm" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                            <YAxis className="text-sm" tick={{ fill: '#6b7280' }} />
                                            <ChartTooltip content={<ChartTooltipContent formatter={(value) => [`${value}%`, 'Completion Rate']} />} />
                                            <Bar dataKey="completion_rate" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ChartContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Specialists Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Specialist Records</CardTitle>
                            <CardDescription>All specialists in the database</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Search and Filters */}
                            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <Input 
                                        placeholder="Search specialists..." 
                                        className="h-10"
                                        value={globalFilter ?? ""}
                                        onChange={(event) => setGlobalFilter(event.target.value)}
                                    />
                                </div>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filter by type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Types</SelectItem>
                                        <SelectItem value="doctor">Doctor</SelectItem>
                                        <SelectItem value="medtech">MedTech</SelectItem>
                                        <SelectItem value="nurse">Nurse</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* TanStack Table */}
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
                                                        <h3 className="mb-2 text-lg font-semibold text-black">No specialists found</h3>
                                                        <p className="text-gray-600">No specialists match your current filters</p>
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
                                    Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} specialists
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
                                                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
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

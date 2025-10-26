import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CustomDatePicker } from '@/components/ui/date-picker';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
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
    BarChart3,
    Download,
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Calendar,
    FileText,
    Filter,
    Users,
    FlaskConical,
    Clock,
    DollarSign,
    Activity,
    Plus,
    Eye,
    Trash2,
    MoreHorizontal,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowUpDown,
    FileDown,
    Package2,
    AlertCircle,
    ShoppingCart,
    XCircle
} from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';

type Supply = {
    id: number;
    name: string;
    code: string;
    category: string;
    unit_of_measure: string;
    current_stock: number;
    minimum_stock_level: number;
    maximum_stock_level: number;
    unit_cost: number;
    total_value: number;
    is_low_stock: boolean;
    is_out_of_stock: boolean;
    is_active: boolean;
    created_at: string;
};

interface InventoryReportsProps {
    filter: string;
    date: string;
    reportType: string;
    data: {
        total_products: number;
        low_stock_items: number;
        out_of_stock: number;
        total_value: number;
        used_count?: number;
        rejected_count?: number;
        total_transactions?: number;
        incoming_count?: number;
        outgoing_count?: number;
        incoming_value?: number;
        outgoing_value?: number;
        net_value?: number;
        category_summary: Record<string, {
            count: number;
            total_value: number;
            low_stock: number;
            out_of_stock: number;
            used_quantity?: number;
            rejected_quantity?: number;
            incoming_value?: number;
            outgoing_value?: number;
            net_value?: number;
            incoming_quantity?: number;
            outgoing_quantity?: number;
        }>;
        supply_details: Supply[];
        period: string;
        start_date: string;
        end_date: string;
    };
    supplies?: {
        data: Supply[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    summary: {
        total_products: number;
        low_stock_items: number;
        out_of_stock: number;
        total_value: number;
    };
    filterOptions?: {
        doctors: Array<{ id: number; name: string }>;
        departments: string[];
        statuses: string[];
        payment_methods: string[];
        hmo_providers: string[];
    };
    metadata?: {
        generated_at: string;
        generated_by: string;
        generated_by_role: string;
        system_version: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/admin/reports' },
    { title: 'Inventory', href: '/admin/reports/inventory' },
];

const createColumns = (): ColumnDef<Supply>[] => [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Product Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("name")}</div>
        ),
    },
    {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => (
            <div className="text-sm font-mono">{row.getValue("code")}</div>
        ),
    },
    {
        accessorKey: "category",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Category
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const category = row.getValue("category") as string;
            return (
                <Badge variant="outline" className="capitalize">
                    {category}
                </Badge>
            );
        },
    },
    {
        accessorKey: "current_stock",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Current Stock
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const stock = row.getValue("current_stock") as number;
            const minLevel = row.original.minimum_stock_level;
            const isLowStock = stock <= minLevel;
            const isOutOfStock = stock <= 0;
            
            return (
                <div className="flex items-center gap-2">
                    <span className={isOutOfStock ? "text-red-600 font-semibold" : isLowStock ? "text-orange-600 font-semibold" : "text-green-600"}>
                        {stock.toLocaleString()}
                    </span>
                    {isOutOfStock && <XCircle className="h-4 w-4 text-red-500" />}
                    {isLowStock && !isOutOfStock && <AlertCircle className="h-4 w-4 text-orange-500" />}
                </div>
            );
        },
    },
    {
        accessorKey: "minimum_stock_level",
        header: "Min Level",
        cell: ({ row }) => (
            <div className="text-sm">{row.getValue("minimum_stock_level")}</div>
        ),
    },
    {
        accessorKey: "unit_cost",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Unit Cost
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const cost = row.getValue("unit_cost") as number;
            return (
                <div className="text-sm">₱{cost.toFixed(2)}</div>
            );
        },
    },
    {
        accessorKey: "total_value",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Total Value
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const value = row.getValue("total_value") as number;
            return (
                <div className="text-sm font-semibold">₱{value.toFixed(2)}</div>
            );
        },
    },
    {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.getValue("is_active") as boolean;
            return (
                <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            );
        },
    },
];

export default function InventoryReports({
    filter,
    date,
    reportType,
    data,
    supplies,
    summary,
    filterOptions,
    metadata,
}: InventoryReportsProps) {
    // Debug logging
    console.log('InventoryReports Props:', {
        filter,
        date,
        reportType,
        data,
        supplies,
        summary
    });

    const [currentFilter, setCurrentFilter] = useState(filter || 'daily');
    const [currentDate, setCurrentDate] = useState(date || new Date().toISOString().split('T')[0]);
    const [currentReportType, setCurrentReportType] = useState(reportType || 'all');
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // TanStack Table state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState('');

    // Dynamic data calculation
    const getFilteredData = useCallback(() => {
        // Use data.supply_details for the main data (from backend filtering)
        // Use supplies.data for pagination in the table
        const currentSupplies = data?.supply_details || [];
        
        console.log('getFilteredData - currentFilter:', currentFilter);
        console.log('getFilteredData - currentDate:', currentDate);
        console.log('getFilteredData - currentReportType:', currentReportType);
        console.log('getFilteredData - data prop:', data);
        console.log('getFilteredData - supplies prop:', supplies);
        console.log('getFilteredData - currentSupplies length:', currentSupplies.length);
        console.log('getFilteredData - currentSupplies sample:', currentSupplies.slice(0, 2));
        
        const total = currentSupplies.length;
        const lowStock = currentSupplies.filter(s => s.current_stock <= s.minimum_stock_level).length;
        const outOfStock = currentSupplies.filter(s => s.current_stock <= 0).length;
        const totalValue = currentSupplies.reduce((sum, supply) => sum + (supply.total_value || 0), 0);
        
        const categorySummary = currentSupplies.reduce((acc, supply) => {
            const category = supply.category;
            if (!acc[category]) {
                acc[category] = {
                    count: 0,
                    total_value: 0,
                    low_stock: 0,
                    out_of_stock: 0,
                };
            }
            acc[category].count += 1;
            acc[category].total_value += supply.total_value || 0;
            if (supply.current_stock <= supply.minimum_stock_level) {
                acc[category].low_stock += 1;
            }
            if (supply.current_stock <= 0) {
                acc[category].out_of_stock += 1;
            }
            return acc;
        }, {} as Record<string, { count: number; total_value: number; low_stock: number; out_of_stock: number; }>);

        const result = {
            total_products: total,
            low_stock_items: lowStock,
            out_of_stock: outOfStock,
            total_value: totalValue,
            category_summary: categorySummary,
            supply_details: currentSupplies,
            period: data?.period || (currentFilter === 'daily' 
                ? `Daily Report - ${new Date(currentDate).toLocaleDateString()}`
                : currentFilter === 'monthly' 
                ? `Monthly Report - ${new Date(currentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`
                : `Yearly Report - ${new Date(currentDate).getFullYear()}`)
        };
        
        console.log('getFilteredData - result:', result);
        return result;
    }, [data, supplies, currentFilter, currentDate, currentReportType]);

    const [filteredData, setFilteredData] = useState(() => {
        // Initialize with actual data from backend
        const initialData = {
            total_products: data?.total_products || 0,
            low_stock_items: data?.low_stock_items || 0,
            out_of_stock: data?.out_of_stock || 0,
            total_value: data?.total_value || 0,
            category_summary: data?.category_summary || {},
            supply_details: data?.supply_details || [],
            period: data?.period || 'Loading...',
            start_date: data?.start_date || currentDate,
            end_date: data?.end_date || currentDate
        };
        
        console.log('Initial filteredData:', initialData);
        return initialData;
    });

    useEffect(() => {
        setFilteredData(getFilteredData());
    }, [getFilteredData]);

    const handleFilterChange = (newFilter: string) => {
        setCurrentFilter(newFilter);
        setIsLoading(true);
        router.get('/admin/reports/inventory', {
            filter: newFilter,
            date: currentDate,
            report_type: currentReportType
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false)
        });
    };

    const handleDateChange = (newDate: string) => {
        setCurrentDate(newDate);
        setIsLoading(true);
        router.get('/admin/reports/inventory', {
            filter: currentFilter,
            date: newDate,
            report_type: currentReportType
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false)
        });
    };

    const handleReportTypeChange = (newReportType: string) => {
        setCurrentReportType(newReportType);
        setIsLoading(true);
        router.get('/admin/reports/inventory', {
            filter: currentFilter,
            date: currentDate,
            report_type: newReportType
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false)
        });
    };

    const handleExport = async (format: 'excel' | 'pdf') => {
        try {
            setIsExporting(true);
            const params = new URLSearchParams({
                filter: currentFilter,
                date: currentDate,
                report_type: currentReportType,
                format,
                total_products: (filteredData.total_products || 0).toString(),
                low_stock_items: (filteredData.low_stock_items || 0).toString()
            });
            
            if (format === 'excel') {
                window.location.href = `/admin/reports/export?type=inventory&format=excel&${params}`;
            } else {
                window.location.href = `/admin/reports/export?type=inventory&format=pdf&${params}`;
            }

            setTimeout(() => {
                setIsExporting(false);
            }, 2000);
        } catch (error) {
            console.error('Export failed:', error);
            setIsExporting(false);
        }
    };

    // Initialize table
    const columns = useMemo(() => createColumns(), []);
    
    const table = useReactTable({
        data: filteredData.supply_details || data?.supply_details || supplies?.data || [],
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
            const supply = row.original;
            return (
                supply.name?.toLowerCase().includes(search) ||
                supply.code?.toLowerCase().includes(search) ||
                supply.category?.toLowerCase().includes(search)
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
        <AppLayout breadcrumbs={breadcrumbs as any}>
            <Head title="Inventory Reports" />
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
                    {/* Dynamic Insight Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {currentReportType === 'all' ? (
                            <>
                                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-blue-100 text-sm font-medium">Total Products</p>
                                                <p className="text-3xl font-bold">{(filteredData.total_products || 0).toLocaleString()}</p>
                                                <p className="text-blue-100 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today\'s Count' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
                                            <Package className="h-8 w-8 text-blue-200" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-orange-100 text-sm font-medium">Low Stock Items</p>
                                                <p className="text-3xl font-bold">{(filteredData.low_stock_items || 0).toLocaleString()}</p>
                                                <p className="text-orange-100 text-xs mt-1">
                                                    {(filteredData.total_products || 0) > 0 ? 
                                                        (((filteredData.low_stock_items || 0) / (filteredData.total_products || 1)) * 100).toFixed(1) : 0
                                                    }% of total
                                                </p>
                                            </div>
                                            <AlertTriangle className="h-8 w-8 text-orange-200" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-red-100 text-sm font-medium">Out of Stock</p>
                                                <p className="text-3xl font-bold">{(filteredData.out_of_stock || 0).toLocaleString()}</p>
                                                <p className="text-red-100 text-xs mt-1">
                                                    {(filteredData.total_products || 0) > 0 ? 
                                                        (((filteredData.out_of_stock || 0) / (filteredData.total_products || 1)) * 100).toFixed(1) : 0
                                                    }% of total
                                                </p>
                                            </div>
                                            <XCircle className="h-8 w-8 text-red-200" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-green-100 text-sm font-medium">Total Value</p>
                                                <p className="text-3xl font-bold">₱{(filteredData.total_value || 0).toLocaleString()}</p>
                                                <p className="text-green-100 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today\'s Value' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
                                            <DollarSign className="h-8 w-8 text-green-200" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : currentReportType === 'used_rejected' ? (
                            <>
                                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-blue-100 text-sm font-medium">Total Products</p>
                                                <p className="text-3xl font-bold">{(filteredData.total_products || 0).toLocaleString()}</p>
                                                <p className="text-blue-100 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today\'s Count' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
                                            <Package className="h-8 w-8 text-blue-200" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-green-100 text-sm font-medium">Used Items</p>
                                                <p className="text-3xl font-bold">{(filteredData.used_count || 0).toLocaleString()}</p>
                                                <p className="text-green-100 text-xs mt-1">
                                                    {(filteredData.total_transactions || 0) > 0 ? 
                                                        (((filteredData.used_count || 0) / (filteredData.total_transactions || 1)) * 100).toFixed(1) : 0
                                                    }% of transactions
                                                </p>
                                            </div>
                                            <CheckCircle className="h-8 w-8 text-green-200" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-red-100 text-sm font-medium">Rejected Items</p>
                                                <p className="text-3xl font-bold">{(filteredData.rejected_count || 0).toLocaleString()}</p>
                                                <p className="text-red-100 text-xs mt-1">
                                                    {(filteredData.total_transactions || 0) > 0 ? 
                                                        (((filteredData.rejected_count || 0) / (filteredData.total_transactions || 1)) * 100).toFixed(1) : 0
                                                    }% of transactions
                                                </p>
                                            </div>
                                            <XCircle className="h-8 w-8 text-red-200" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-purple-100 text-sm font-medium">Total Value</p>
                                                <p className="text-3xl font-bold">₱{(filteredData.total_value || 0).toLocaleString()}</p>
                                                <p className="text-purple-100 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today\'s Value' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
                                            <DollarSign className="h-8 w-8 text-purple-200" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : currentReportType === 'in_out' ? (
                            <>
                                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-blue-100 text-sm font-medium">Total Products</p>
                                                <p className="text-3xl font-bold">{(filteredData.total_products || 0).toLocaleString()}</p>
                                                <p className="text-blue-100 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today\'s Count' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
                                            <Package className="h-8 w-8 text-blue-200" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-green-100 text-sm font-medium">Incoming</p>
                                                <p className="text-3xl font-bold">{(filteredData.incoming_count || 0).toLocaleString()}</p>
                                                <p className="text-green-100 text-xs mt-1">
                                                    ₱{(filteredData.incoming_value || 0).toLocaleString()}
                                                </p>
                                            </div>
                                            <TrendingUp className="h-8 w-8 text-green-200" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-orange-100 text-sm font-medium">Outgoing</p>
                                                <p className="text-3xl font-bold">{(filteredData.outgoing_count || 0).toLocaleString()}</p>
                                                <p className="text-orange-100 text-xs mt-1">
                                                    ₱{(filteredData.outgoing_value || 0).toLocaleString()}
                                                </p>
                                            </div>
                                            <TrendingDown className="h-8 w-8 text-orange-200" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-purple-100 text-sm font-medium">Net Value</p>
                                                <p className="text-3xl font-bold">₱{(filteredData.net_value || 0).toLocaleString()}</p>
                                                <p className="text-purple-100 text-xs mt-1">
                                                    {currentFilter === 'daily' ? 'Today\'s Net' : 
                                                     currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                                </p>
                                            </div>
                                            <DollarSign className="h-8 w-8 text-purple-200" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : null}
                    </div>

                    {/* Filter Controls */}
                    <div className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            <div className="space-y-2 w-full">
                                <Label className="text-sm font-semibold text-gray-800 mb-2 block">Report Type</Label>
                                <select
                                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={currentReportType}
                                    onChange={(e) => handleReportTypeChange(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="all">All Supplies</option>
                                    <option value="used_rejected">Used/Rejected</option>
                                    <option value="in_out">In/Out Supplies</option>
                                </select>
                            </div>

                            <div className="space-y-2 w-full">
                                <Label className="text-sm font-semibold text-gray-800 mb-2 block">Time Period</Label>
                                <select
                                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={currentFilter}
                                    onChange={(e) => handleFilterChange(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="daily">Daily Report</option>
                                    <option value="monthly">Monthly Report</option>
                                    <option value="yearly">Yearly Report</option>
                                </select>
                            </div>
                            
                            <div className="w-full">
                                <CustomDatePicker
                                    label={currentFilter === 'daily' ? 'Select Date' : currentFilter === 'monthly' ? 'Select Month' : 'Select Year'}
                                    date={currentDate ? new Date(currentDate) : undefined}
                                    setDate={(date: Date | undefined) => handleDateChange(date ? date.toISOString().split('T')[0] : '')}
                                    placeholder={`Select ${currentFilter} date`}
                                />
                            </div>

                            <div className="w-full">
                                <Label className="text-sm font-semibold text-gray-800 mb-2 block">Period</Label>
                                <div className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm flex items-center">
                                    {filteredData.period}
                                </div>
                            </div>

                            <div className="w-full flex items-end">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl w-full h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={isLoading}
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Report
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleExport('excel')}>
                                            <FileDown className="mr-2 h-4 w-4" />
                                            Excel Spreadsheet
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('pdf')}>
                                            <FileDown className="mr-2 h-4 w-4" />
                                            PDF Report
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>

                    {/* Report Summary */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Summary</h3>
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentReportType === 'all' ? (
                                        <>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Products</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.total_products || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">100%</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Low Stock Items</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.low_stock_items || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {(filteredData.total_products || 0) > 0 ? (((filteredData.low_stock_items || 0) / (filteredData.total_products || 1)) * 100).toFixed(1) : 0}%
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Out of Stock</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.out_of_stock || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {(filteredData.total_products || 0) > 0 ? (((filteredData.out_of_stock || 0) / (filteredData.total_products || 1)) * 100).toFixed(1) : 0}%
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Value</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{(filteredData.total_value || 0).toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                                            </tr>
                                        </>
                                    ) : currentReportType === 'used_rejected' ? (
                                        <>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Products</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.total_products || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">100%</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Used Items</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.used_count || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {(filteredData.total_transactions || 0) > 0 ? (((filteredData.used_count || 0) / (filteredData.total_transactions || 1)) * 100).toFixed(1) : 0}%
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Rejected Items</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.rejected_count || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {(filteredData.total_transactions || 0) > 0 ? (((filteredData.rejected_count || 0) / (filteredData.total_transactions || 1)) * 100).toFixed(1) : 0}%
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Value</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{(filteredData.total_value || 0).toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                                            </tr>
                                        </>
                                    ) : currentReportType === 'in_out' ? (
                                        <>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Products</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.total_products || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">100%</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Incoming</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.incoming_count || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {(filteredData.total_transactions || 0) > 0 ? (((filteredData.incoming_count || 0) / (filteredData.total_transactions || 1)) * 100).toFixed(1) : 0}%
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Outgoing</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.outgoing_count || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {(filteredData.total_transactions || 0) > 0 ? (((filteredData.outgoing_count || 0) / (filteredData.total_transactions || 1)) * 100).toFixed(1) : 0}%
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Net Value</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{(filteredData.net_value || 0).toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                                            </tr>
                                        </>
                                    ) : null}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Category Summary */}
                    {filteredData.category_summary && Object.keys(filteredData.category_summary).length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Summary</h3>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                                            {currentReportType === 'all' ? (
                                                <>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Low Stock</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Out of Stock</th>
                                                </>
                                            ) : currentReportType === 'used_rejected' ? (
                                                <>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used Quantity</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rejected Quantity</th>
                                                </>
                                            ) : currentReportType === 'in_out' ? (
                                                <>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incoming Value</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outgoing Value</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Value</th>
                                                </>
                                            ) : null}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {Object.entries(filteredData.category_summary).map(([category, data]) => (
                                            <tr key={category}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{category}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.count}</td>
                                                {currentReportType === 'all' ? (
                                                    <>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{data.total_value.toLocaleString()}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.low_stock}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.out_of_stock}</td>
                                                    </>
                                                ) : currentReportType === 'used_rejected' ? (
                                                    <>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{data.total_value.toLocaleString()}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.used_quantity || 0}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.rejected_quantity || 0}</td>
                                                    </>
                                                ) : currentReportType === 'in_out' ? (
                                                    <>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{(data.incoming_value || 0).toLocaleString()}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{(data.outgoing_value || 0).toLocaleString()}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{(data.net_value || 0).toLocaleString()}</td>
                                                    </>
                                                ) : null}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}


                    {/* Supply Details Table */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <Package className="h-5 w-5 text-gray-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Supply Details</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Package className="h-4 w-4" />
                                    <span>{(filteredData.supply_details || []).length} supplies found</span>
                                </div>
                            </div>
                        </div>

                        {(filteredData.supply_details || []).length === 0 ? (
                            <div className="py-16 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                <div className="text-gray-400 mb-4">
                                    <Package className="h-12 w-12 mx-auto" />
                                </div>
                                <p className="text-lg font-semibold text-gray-700 mb-2">No supplies found</p>
                                <p className="text-gray-500">No supplies found for the selected period</p>
                            </div>
                        ) : (
                            <Card className="bg-white border border-gray-200">
                                <CardContent className="p-6">
                                    {/* Table Controls */}
                                    <div className="flex items-center py-4">
                                        <Input
                                            placeholder="Search supplies..."
                                            value={globalFilter ?? ""}
                                            onChange={(event) => setGlobalFilter(event.target.value)}
                                            className="max-w-sm"
                                        />
                                        <Button
                                            onClick={() => handleExport('excel')}
                                            disabled={isExporting}
                                            className="bg-green-600 hover:bg-green-700 text-white ml-4"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Export Excel
                                        </Button>
                                        <Button
                                            onClick={() => handleExport('pdf')}
                                            disabled={isExporting}
                                            variant="outline"
                                            className="ml-2"
                                        >
                                            <FileDown className="h-4 w-4 mr-2" />
                                            Export PDF
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
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
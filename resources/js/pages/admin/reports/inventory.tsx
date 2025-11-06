import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ReportDatePicker } from '@/components/ui/report-date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
    Activity,
    AlertCircle,
    AlertTriangle,
    ArrowUpDown,
    CheckCircle,
    ChevonDown,
    ChevronLft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Download,
    FileDown,
    Package,
    TrendingDown,
    TrendingUp,
    XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Supply = {
    id: number;
    name: string;
    code: string;
    category: string;
    unit_of_measure?: string;
    current_stock?: number;
    minimum_stock_level?: number;
    maximum_stock_level?: number;
    is_low_stock?: boolean;
    is_out_of_stock?: boolean;
    is_active?: boolean;
    created_at: string;
    // Movement fields
    movement_type?: string;
    quantity?: number;
    created_by?: string;
    remarks?: string;
    item_id?: number;
};

type AnalyticsData = {
    most_used_supplies?: Array<{
        id: number;
        name: string;
        code: string;
        category: string;
        quantity: number;
        count: number;
    }>;
    least_used_supplies?: Array<{
        id: number;
        name: string;
        code: string;
        category: string;
        quantity: number;
        count: number;
    }>;
};

interface InventoryReportsProps {
    filter: string;
    date: string;
    reportType: string;
    data: {
        total_products: number;
        low_stock_items: number;
        out_of_stock: number;
        used_count?: number;
        rejected_count?: number;
        total_transactions?: number;
        incoming_count?: number;
        outgoing_count?: number;
        incoming_value?: number;
        outgoing_value?: number;
        net_value?: number;
        category_summary: Record<
            string,
            {
                count: number;
                low_stock: number;
                out_of_stock: number;
                used_quantity?: number;
                rejected_quantity?: number;
                incoming_value?: number;
                outgoing_value?: number;
                net_value?: number;
                incoming_quantity?: number;
                outgoing_quantity?: number;
            }
        >;
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
    };
    analytics?: AnalyticsData;
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

const createColumns = (reportType: string): ColumnDef<Supply>[] => {
    const baseColumns: ColumnDef<Supply>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-8 px-2 lg:px-3">
                        Product Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
        },
        {
            accessorKey: 'code',
            header: 'Code',
            cell: ({ row }) => <div className="font-mono text-sm">{row.getValue('code')}</div>,
        },
        {
            accessorKey: 'category',
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-8 px-2 lg:px-3">
                        Category
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const category = row.getValue('category') as string;
                return (
                    <Badge variant="outline" className="capitalize">
                        {category}
                    </Badge>
                );
            },
        },
    ];

    // Add columns based on report type
    if (reportType === 'all') {
        baseColumns.push(
            {
                accessorKey: 'current_stock',
                header: ({ column }) => {
                    return (
                        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-8 px-2 lg:px-3">
                            Current Stock
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    );
                },
                cell: ({ row }) => {
                    const stock = row.getValue('current_stock') as number;
                    const minLevel = row.original.minimum_stock_level;
                    const isLowStock = stock <= minLevel;
                    const isOutOfStock = stock <= 0;

                    return (
                        <div className="flex items-center gap-2">
                            <span
                                className={
                                    isOutOfStock ? 'font-semibold text-red-600' : isLowStock ? 'font-semibold text-orange-600' : 'text-green-600'
                                }
                            >
                                {stock.toLocaleString()}
                            </span>
                            {isOutOfStock && <XCircle className="h-4 w-4 text-red-500" />}
                            {isLowStock && !isOutOfStock && <AlertCircle className="h-4 w-4 text-orange-500" />}
                        </div>
                    );

            },
            {
                accessorKey: 'minimum_stock_level',
                header: 'Min Level',
                cell: ({ row }) => <div className="text-sm">{row.getValue('minimum_stock_level')}</div>,
            },
            {
                accessorKey: 'is_active',
                header: 'Status',
                cell: ({ row }) => {
                    const isActive = row.getValue('is_active') as boolean;
                    return <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Active' : 'Inactive'}</Badge>;
                },
            },
        );
    } else if (reportType === 'used_rejected') {
        baseColumns.push(
            {
                accessorKey: 'used_quantity',
                header: 'Used Quantity',
                cell: ({ row }) => <div className="text-sm font-medium">{row.getValue('used_quantity') || 0}</div>,
            },
            {
                accessorKey: 'rejected_quantity',
                header: 'Rejected Quantity',
                cell: ({ row }) => <div className="text-sm font-medium">{row.getValue('rejected_quantity') || 0}</div>,
            },
        );
    } else if (reportType === 'in_out') {
        baseColumns.push(
            {
                accessorKey: 'movement_type',
                header: 'Movement Type',
                cell: ({ row }) => {
                    const type = row.getValue('movement_type') as string | undefined;
                    // Only use fallback if the value is truly null/undefined, not if it's an empty string
                    const movementType = type ?? 'UNKNOWN';
                    return (
                        <Badge variant={movementType === 'IN' ? 'default' : 'destructive'}>
                            {movementType === 'IN' ? 'Incoming' : movementType === 'OUT' ? 'Outgoing' : 'Unknown'}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: 'quantity',
                header: 'Quantity',
                cell: ({ row }) => {
                    const quantity = row.getValue('quantity') as number | undefined;
                    const type = row.original.movement_type;
                    const quantityValue = quantity ?? 0;
                    return (
                        <div className={`text-sm font-medium ${type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                            {quantityValue.toLocaleString()}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'created_by',
                header: 'Created By',
                cell: ({ row }) => {
                    const createdBy = row.getValue('created_by') as string | undefined;
                    // Only use fallback if the value is truly null/undefined, not if it's an empty string
                    return <div className="text-sm">{createdBy ?? 'System'}</div>;
                },
            },
            {
                accessorKey: 'created_at',
                header: 'Date',
                cell: ({ row }) => {
                    const date = row.getValue('created_at') as string | undefined;
                    if (!date) return <div className="text-sm text-gray-600">N/A</div>;

                    try {
                        const dateObj = new Date(date);
                        return (
                            <div className="text-sm text-gray-600">
                                {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString()}
                            </div>
                        );
                    } catch (error) {
                        return <div className="text-sm text-gray-600">Invalid Date</div>;
                    }
                },
            },
            {
                accessorKey: 'remarks',
                header: 'Remarks',
                cell: ({ row }) => {
                    const remarks = row.getValue('remarks') as string | undefined;
                    const remarksValue = remarks || 'No remarks';
                    return (
                        <div className="max-w-xs truncate text-sm text-gray-600" title={remarksValue}>
                            {remarksValue}

                    );
                },
            },
        );
    }

    return baseColumns;
};

export default function InventoryReports({
    filter,
    date,
    reportType,
    data,
    supplies,
    summary,
    analytics,
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
        summary,
    });

    // Log when component mounts or props change
    useEffect(() => {
        console.log('InventoryReports component updated with new props:', {
            filter,
            date,
            reportType,
            dataCount: data?.supply_details?.length || 0,
            suppliesCount: supplies?.data?.length || 0,
        });

        // Debug movement data specifically
        if (reportType === 'in_out' && data?.supply_details) {
            console.log('Movement data sample:', data.supply_details.slice(0, 3));
        }
    }, [filter, date, reportType, data, supplies]);

    const [currentFilter, setCurrentFilter] = useState(filter || 'daily');
    const [currentDate, setCurrentDate] = useState(date || new Date().toISOString().split('T')[0]);
    const [currentReportType, setCurrentReportType] = useState(reportType || 'all');
    const [isLoading, setIsLoading] = useState(false);


    // TanStack Table state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState('');

    // Dynamic data calculation

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

        // If no data from backend, return empty state
        if (!data) {
            console.log('No data from backend, returning empty state');
            return {
                total_products: 0,
                low_stock_items: 0,
                out_of_stock: 0,
                category_summary: {},
                supply_details: [],
                period: 'No data available',
                start_date: currentDate,
                end_date: currentDate,

        }

        // Calculate totals based on report type
        let total = 0;
        let lowStock = 0;
        let outOfStock = 0;


            // For used/rejected reports, count unique items from supply_details
            const uniqueItems = new Set(currentSupplies.map((s) => s.item_id || s.id));
            total = uniqueItems.size;
            // Low stock and out of stock not applicable for used/rejected reports
            lowStock = 0;
            outOfStock = 0;
        } else {
            // For other reports, use standard inventory calculations
            total = currentSupplies.length;
            lowStock = currentSupplies.filter((s) => s.current_stock <= s.minimum_stock_level).length;
            outOfStock = currentSupplies.filter((s) => s.current_stock <= 0).length;
        }

        const categorySummary = currentSupplies.reduce(

                const category = supply.category;
                if (!acc[category]) {
                    acc[category] = {
                        count: 0,

                        out_of_stock: 0,
                        used_quantity: 0,
                        rejected_quantity: 0,
                    };
                }
                acc[category].count += 1;

                // For inventory reports, check stock levels
                if (supply.current_stock !== undefined) {
                    if (supply.current_stock <= supply.minimum_stock_level) {
                        acc[category].low_stock += 1;
                    }
                    if (supply.current_stock <= 0) {

                    }
                }

                // For used/rejected reports, calculate quantities
                if (currentReportType === 'used_rejected') {
                    if (supply.type === 'used' || (supply.movement_type === 'used' && !supply.type)) {
                        acc[category].used_quantity += supply.quantity || supply.used_quantity || 0;
                    } else if (supply.type === 'rejected' || (supply.movement_type === 'rejected' && !supply.type)) {
                        acc[category].rejected_quantity += supply.quantity || supply.rejected_quantity || 0;
                    } else if (supply.used_quantity > 0) {
                        acc[category].used_quantity += supply.used_quantity;
                    } else if (supply.rejected_quantity > 0) {

                    }
                }

                return acc;
            },
            {} as Record<string, { count: number; low_stock: number; out_of_stock: number; used_quantity?: number; rejected_quantity?: number }>,
        );

        // Calculate movement statistics for in_out report type

        let outgoingCount = 0;
        let incomingQuantity = 0;
        let outgoingQuantity = 0;
        let totalTransactions = 0;
        let netQuantity = 0;

        // Calculate used/rejected statistics for used_rejected report type
        let usedCount = 0;
        let rejectedCount = 0;
        let usedQuantity = 0;
        let rejectedQuantity = 0;


            // Count movements from the supply_details (which contains movement data for in_out)
            console.log('Calculating movement stats for in_out report type');
            console.log('Current supplies for movement calculation:', currentSupplies.slice(0, 3));

            currentSupplies.forEach((supply) => {
                if (supply.movement_type === 'IN') {
                    incomingCount++;
                    incomingQuantity += supply.quantity || 0;
                } else if (supply.movement_type === 'OUT') {
                    outgoingCount++;
                    outgoingQuantity += supply.quantity || 0;
                }
            });

            totalTransactions = incomingCount + outgoingCount;
            netQuantity = incomingQuantity - outgoingQuantity;

            console.log('Movement calculation results:', {
                incomingCount,
                outgoingCount,
                incomingQuantity,

                totalTransactions,
                netQuantity,
            });
        } else if (currentReportType === 'used_rejected') {
            // Calculate used/rejected statistics from supply_details (which contains used/rejected item records)
            console.log('Calculating used/rejected stats for used_rejected report type');
            console.log('Current supplies for used/rejected calculation:', currentSupplies.slice(0, 3));

            // Count from supply_details table - each record represents one transaction

                // Check type field first (from inventory_used_rejected_items)
                if (supply.type === 'used' || (supply.movement_type === 'used' && !supply.type)) {


                    usedQuantity += supply.quantity || supply.used_quantity || 0;
                } else if (supply.type === 'rejected' || (supply.movement_type === 'rejected' && !supply.type)) {
                    rejectedCount++;
                    rejectedQuantity += supply.quantity || supply.rejected_quantity || 0;
                }
                // Also check if used_quantity or rejected_quantity fields exist (sum aggregation)
                else if (supply.used_quantity > 0) {
                    usedCount++;
                    usedQuantity += supply.used_quantity;
                } else if (supply.rejected_quantity > 0) {
                    rejectedCount++;


            });

            // Use backend-provided values if they're more accurate (backend counts all records)
            // But prefer our calculation from supply_details if we have data
            if (currentSupplies.length > 0) {
                // We calculated from supply_details, use those values
                totalTransactions = usedCount + rejectedCount;
            } else {
                // Fallback to backend-provided values
                usedCount = data?.used_count || 0;
                rejectedCount = data?.rejected_count || 0;
                totalTransactions = data?.total_transactions || usedCount + rejectedCount;
            }

            console.log('Used/Rejected calculation results from Supply Details:', {
                supplyDetailsCount: currentSupplies.length,
                usedCount,
                rejectedCount,


                totalTransactions,
                backendUsedCount: data?.used_count,
                backendRejectedCount: data?.rejected_count,
            });
        }

        const result = {
            total_products: total,
            low_stock_items: lowStock,
            out_of_stock: outOfStock,


            outgoing_count: outgoingCount,
            incoming_quantity: incomingQuantity,
            outgoing_quantity: outgoingQuantity,
            total_transactions: totalTransactions,
            net_quantity: netQuantity,
            // Used/Rejected data for used_rejected report
            used_count: usedCount || data?.used_count || 0,
            rejected_count: rejectedCount || data?.rejected_count || 0,
            used_quantity: usedQuantity || data?.used_quantity || 0,
            rejected_quantity: rejectedQuantity || data?.rejected_quantity || 0,
            category_summary: categorySummary,
            supply_details: currentSupplies,
            period:
                data?.period ||
                (currentReportType === 'all'
                    ? 'All Inventory Items'
                    : currentFilter === 'daily'
                      ? `Daily Report - ${new Date(currentDate).toLocaleDateString()}`
                      : currentFilter === 'monthly'
                        ? `Monthly Report - ${new Date(currentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`
                        : `Yearly Report - ${new Date(currentDate).getFullYear()}`),
        };

        console.log('getFilteredData - result:', result);
        return result;
    }, [data, supplies, currentFilter, currentDate, currentReportType]);

    const [filteredData, setFilteredData] = useState(() => {
        // Initialize with actual data from backend
        const initialData = {
            total_products: data?.total_products || 0,
            low_stock_items: data?.low_stoc_items || 0,
            out_of_stock: data?.out_of_stock || 0,
            category_summary: data?.category_ummary || {},
            supply_details: data?.supply_details || [],
            period: data?.period || 'Loading...',
            start_date: data?.start_date || currentDate,
    end_date: data?.end_date || currentDate,

            used_count: data?.used_count || 0,
            rejected_count: data?.rejected_count || 0,
            total_transactions: data?.total_transactions || 0,
            used_quantity: data?.used_quantity || 0,
            rejected_quantity: data?.rejected_quantity || 0,
        };

        console.log('Initial filteredData:', initialData);
        return initialData;
    });

    useEffect(() => {
        console.log('Data prop changed, updating filtered data');
        setFilteredData(getFilteredData());
    }, [data, supplies, currentFilter, currentDate, currentReportType]);

    const handleFilterChange = (newFilter: string) => {
        setCurrentFilter(newFilter);
        setIsLoading(true);
        console.log('Filter change - sending:', {
            filter: newFilter,


        });
        router.get(
            '/admin/reports/inventory',
            {
                filter: newFilter,
                date: currentDate,
                report_type: currentReportType,
            },
            {
                preserveState: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleDateChange = (newDate: string) => {
        setCurrentDate(newDate);
        setIsLoading(true);
        console.log('Date change - sending:', {
            filter: currentFilter,
            date: newDate,
            report_type: currentReportType,
        });
        router.get(
            '/admin/reports/inventory',
            {
                filter: currentFilter,
                date: newDate,
                report_type: currentReportType,
            },
            {
                preserveState: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleReportTypeChange = (newReportType: string) => {
        setCurrentReportType(newReportType);
        setIsLoading(true);
        router.get(
            '/admin/reports/inventory',
            {
                filter: currentFilter,
                date: currentDate,
                report_type: newReportType,
            },
            {
                preserveState: false, // Force refresh to get new data
                onFinish: () => setIsLoading(false),
            },
        );
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
                low_stock_items: (filteredData.low_stock_items || 0).toString(),
            });

            if (format === 'excel') {
                window.location.href = `/admin/reports/export?type=inventory&format=excel&${params}`;


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
    const columns = useMemo(() => createColumns(currentReportType), [currentReportType]);

    // Debug table data
    const tableData = filteredData.supply_details || data?.supply_details || supplies?.data || [];
for', reportType, ':', tableData.slice(0, 2));

    const table = useReactTable({
        data: tableData,


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
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {currentReportType === 'all' ? (
                            <>
                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">
                                                    Total Products {isLoading && <span className="animate-pulse">⏳</span>}
                                                </p>
                                                <p className="text-3xl font-bold">{(filteredData.total_products || 0).toLocaleString()}</p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {currentReportType === 'all'
                                                        ? 'All Items'
                                                        : currentFilter === 'daily'
                                                          ? "Today's Count"
                                                          : currentFilter === 'monthly'
                                                            ? 'This Month'
                                                            : 'This Year'}
                                                    {currentReportType !== 'all' && ` (${currentReportType.replace('_', ' ')})`}
                                                </p>
                                            </div>
                                            <Package className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
                                                <p className="text-3xl font-bold">{(filteredData.low_stock_items || 0).toLocaleString()}</p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {(filteredData.total_products || 0) > 0
                                                        ? (((filteredData.low_stock_items || 0) / (filteredData.total_products || 1)) * 100).toFixed(
                                                              1,
                                                          )
                                                        : 0}
                                                    % of total
                                                </p>
                                            </div>
                                            <AlertTriangle className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                                                <p className="text-3xl font-bold">{(filteredData.out_of_stock || 0).toLocaleString()}</p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {(filteredData.total_products || 0) > 0
                                                        ? (((filteredData.out_of_stock || 0) / (filteredData.total_products || 1)) * 100).toFixed(1)
                                                        : 0}
                                                    % of total
                                                </p>
                                            </div>
                                            <XCircle className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : currentReportType === 'used_rejected' ? (
                            <>
                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Tocts</p>
                                                <p className="text-3xl font-bold">{(filteredData.total_products || 0).toLocaleString()}</p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {currentFilter === 'daily'
                                                        ? "Today's Count"
                                                        : currentFilter === 'monthly'
                                                          ? 'This Month'
                                                          : 'This Year'}
                                                </p>
                                            </div>
                                            <Package className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Used Items</p>
                                                <p className="text-3xl font-bold">{(filteredData.used_quantity || 0).toLocaleString()}</p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {(filteredData.used_quantity || 0) + (filteredData.rejected_quantity || 0) > 0
                                                        ? (
                                                              ((filteredData.used_quantity || 0) /
                                                                  ((filteredData.used_quantity || 0) + (filteredData.rejected_quantity || 0))) *
                                                              100
                                                          ).toFixed(1)
                                                        : 0}
                                                    % of total quantity
                                                </p>
                                            </div>
                                            <CheckCircle className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Rejected Items</p>
                                                <p className="text-3xl font-bold">{(filteredData.rejected_quantity || 0).toLocaleString()}</p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {(filteredData.used_quantity || 0) + (filteredData.rejected_quantity || 0) > 0
                                                        ? (
                                                              ((filteredData.rejected_quantity || 0) /
                                                                  ((filteredData.used_quantity || 0) + (filteredData.rejected_quantity || 0))) *
                                                              100
                                                          ).toFixed(1)
                                                        : 0}
                                                    % of total quantity
                                                </p>
                                            </div>
                                            <XCircle className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                                                <p className="text-3xl font-bold">{(filteredData.total_transactions || 0).toLocaleString()}</p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {currentFilter === 'daily'
                                                        ? "Today's activity"
                                                        : currentFilter === 'monthly'
                                                          ? 'This month'
                                                          : 'This year'}
                                                </p>
                                            </div>
                                            <Activity className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : currentReportType === 'in_out' ? (
                            <>
                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Total Products</p>
                                                <p className="text-3xl font-bold">{(filteredData.total_products || 0).toLocaleString()}</p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {currentFilter === 'daily'
                                                        ? "Today's Count"
                                                        : currentFilter === 'monthly'
                                                          ? 'This Month'
                                                          : 'This Year'}
                                                </p>
                                            </div>
                                            <Package className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Incoming</p>
                                                <p className="text-3xl font-bold">{(filteredData.incoming_count || 0).toLocaleString()}</p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {(filteredData.incoming_quantity || 0).toLocaleString()} items
                                                </p>
                                            </div>
                                            <TrendingUp className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Outgoing</p>
                                                <p className="text-3xl font-bold">{(filteredData.outgoing_count || 0).toLocaleString()}</p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {(filteredData.outgoing_quantity || 0).toLocaleString()} items
                                                </p>
                                            </div>
                                            <TrendingDown className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </>



                    {/* Analytics Cards - Most Used & Least Used Supplies */}
                    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Most Used Supplies */}
                        <Card className="border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                    Most Frequently Used Supplies
                                </CardTitle>
                            </CardHeader>


                                    <div className="space-y-3">
                                        {analytics.most_used_supplies.map((supply, index) => (
                                            <div key={supply.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                            {index + 1}
                                                    </div>


                                                        <p className="text-xs text-gray-500">{supply.code}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">{supply.quantity.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {supply.count} {supply.count === 1 ? 'time' : 'times'} used
                                                    </p>
                                                </div>
</div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="py-4 text-center text-sm text-gray-500">No supply usage data available</p>
                                )}
                            </CardContent>
                        </Card>

ies */}
                        <Card className="border0 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingDown className="h-5 w-5 text-orange-600" />
                                    Least Frequently Used Supplies
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {analytics?.least_used_supplies && analytics.least_used_supplies.length > 0 ? (
                                    <div className="space-y-3">
                                        {analytics.least_used_supplies.map((supply, index) => (
                                            <div key={supply.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{supply.name}</p>
                                                        <p className="text-xs text-gray-500">{supply.code}</p>
                                                    </div>
                                               </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">{supply.quantity.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {supply.count === 0
                                                            ? 'Never used'
                                                            : `${supply.count} ${supply.count === 1 ? 'time' : 'times'} used`}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="py-4 text-center text-sm text-gray-500">No supply usage data available</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filter Controls */}
                    <div className="mb-8">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
                            <div className="w-full space-y-2">
                                <Label className="mb-2 block text-sm font-semibold text-gray-800">
                                    Report Type {isLoading && <span className="text-blue-500">(Loading...)</span>}
                                </Label>
                                <select
                                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={currentReportType}
                                    onChange={(e) => handleReportTypeChange(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="all">All Inventory Items</option>
                                    <option value="used_rejected">Used/Rejected Items</option>
                                    <option value="in_out">Stock Movements</option>
                                </select>
                            </div>

                            <div className="w-full space-y-2">
                                <Label className="mb-2 block text-sm font-semibold text-gray-800">
                                    Time Period {isLoading && <span className="text-blue-500">(Loading...)</span>}
                                </Label>
                                <select
                                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={currentFilter}
                                    onChange={(e) => handleFilterChange(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>

                            <div className="w-full space-y-2">
                                <Label className="mb-2 block text-sm font-semibold text-gray-800">
                                    Select Date {isLoading && <span className="text-blue-500">(Loading...)</span>}
                                </Label>
                                <ReportDatePicker
                                    date={currentDate ? new Date(currentDate) : undefined}
                                    onDateChange={(date: Date | undefined) => {
                                        if (date) {
                                            // Use local date formatting to avoid timezone issues
                                            const year = date.getFullYear();
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const day = String(date.getDate()).padStart(2, '0');

                                            let formattedDate: string;
                                            if (currentFilter === 'monthly') {
                                                formattedDate = `${year}-${month}`;
                                            } else if (currentFilter === 'yearly') {
                                                formattedDate = year.toString();
                                            } else {
                                                formattedDate = `${year}-${month}-${day}`;
                                            }

                                            handleDateChange(formattedDate);
                                        } else {
                                            handleDateChange('');
                                        }
                                    }}
                                    filter={currentFilter as 'daily' | 'monthly' | 'yearly'}
                                    placeholder={`Select ${currentFilter} date`}
                                />
                            </div>

                            <div className="w-full">
                                <Label className="mb-2 block text-sm font-semibold text-gray-800">Period</Label>
                                <div className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                                    {filteredData.period}
                                </div>
                            </div>

                            <div className="flex w-full items-end">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            className="h-12 w-full rounded-xl bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-gray-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
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

                    {/* Report Summary - Hidden for in_out report type */}
                    {currentReportType !== 'in_out' && (
                        <div className="mb-8">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Report Summary</h3>
                            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Metric</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Value</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Percentage
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {currentReportType === 'all' ? (
                                            <>
                                                <tr>
                                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">Total Products</td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                                        {filteredData.total_products || 0}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">100%</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">Low Stock Items</td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                                        {filteredData.low_stock_items || 0}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                                        {(filteredData.total_products || 0) > 0
                                                            ? (
                                                                  ((filteredData.low_stock_items || 0) / (filteredData.total_products || 1)) *
                                                                  100
                                                              ).toFixed(1)
                                                            : 0}
                                                        %
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">Out of Stock</td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                                        {filteredData.out_of_stock || 0}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                                        {(filteredData.total_products || 0) > 0
                                                            ? (((filteredData.out_of_stock || 0) / (filteredData.total_products || 1)) * 100).toFixed(
                                                                  1,
                                                              )
                                                            : 0}
                                                        %
                                                    </td>
                                                </tr>
                                            </>
                                        ) : currentReportType === 'used_rejected' ? (
                                            <>
                                                <tr>
                                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">Total Products</td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                                        {filteredData.total_products || 0}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">100%</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">Used Items</td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                                        {(filteredData.used_quantity || 0).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                                        {(filteredData.used_quantity || 0) + (filteredData.rejected_quantity || 0) > 0
                                                            ? (
                                                                  ((filteredData.used_quantity || 0) /
                                                                      ((filteredData.used_quantity || 0) + (filteredData.rejected_quantity || 0))) *
                                                                  100
                                                              ).toFixed(1)
                                                            : 0}
                                                        %
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">Rejected Items</td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                                        {(filteredData.rejected_quantity || 0).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                                        {(filteredData.used_quantity || 0) + (filteredData.rejected_quantity || 0) > 0
                                                            ? (
                                                                  ((filteredData.rejected_quantity || 0) /
                                                                      ((filteredData.used_quantity || 0) + (filteredData.rejected_quantity || 0))) *
                                                                  100
                                                              ).toFixed(1)
                                                            : 0}
                                                        %
                                                    </td>
                                                </tr>
                                            </>
                                        ) : null}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Category Summary - Hidden for in_out report type */}
                    {currentReportType !== 'in_out' && filteredData.category_summary && Object.keys(filteredData.category_summary).length > 0 && (
                        <div className="mb-8">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Category Summary</h3>
                            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Count</th>
                                            {currentReportType === 'all' ? (
                                                <>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Low Stock
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Out of Stock
                                                    </th>
                                                </>
                                            ) : currentReportType === 'used_rejected' ? (
                                                <>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Used Quantity
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Rejected Quantity
                                                    </th>
                                                </>
                                            ) : null}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {Object.entries(filteredData.category_summary).map(([category, data]) => (
                                            <tr key={category}>
                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900 capitalize">
                                                    {category}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{data.count}</td>
                                                {currentReportType === 'all' ? (
                                                    <>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{data.low_stock}</td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{data.out_of_stock}</td>
                                                    </>
                                                ) : currentReportType === 'used_rejected' ? (
                                                    <>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                                            {data.used_quantity || 0}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                                            {data.rejected_quantity || 0}
                                                        </td>
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
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-gray-100 p-2">
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

                        {isLoading ? (
                            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-16 text-center">
                                <div className="mb-4 text-gray-400">
                                    <Package className="mx-auto h-12 w-12 animate-pulse" />
                                </div>
                                <p className="mb-2 text-lg font-semibold text-gray-700">Loading inventory data...</p>
                                <p className="text-gray-500">Please wait while we fetch the data</p>
                            </div>
                        ) : (filteredData.supply_details || []).length === 0 ? (
                            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-16 text-center">
                                <div className="mb-4 text-gray-400">
                                    <Package className="mx-auto h-12 w-12" />
                                </div>
                                <p className="mb-2 text-lg font-semibold text-gray-700">No supplies found</p>
                                <p className="text-gray-500">No supplies found for the selected period and filters</p>
                            </div>
                        ) : (
                            <Card className="border border-gray-200 bg-white">
                                <CardContent className="p-6">
                                    {/* Table Controls */}
                                    <div className="flex items-center py-4">
                                        <Input
                                            placeholder="Search supplies..."
                                            value={globalFilter ?? ''}
                                            onChange={(event) => setGlobalFilter(event.target.value)}
                                            className="max-w-sm"
                                        />
                                        <Button
                                            onClick={() => handleExport('excel')}
                                            disabled={isExporting}
                                            className="ml-4 bg-green-600 text-white hover:bg-green-700"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Excel
                                        </Button>
                                        <Button onClick={() => handleExport('pdf')} disabled={isExporting} variant="outline" className="ml-2">
                                            <FileDown className="mr-2 h-4 w-4" />
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
                                                        );
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
                                                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                                                </TableHead>
                                                            );
                                                        })}
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
                                            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
                                            selected.
                                        </div>
                                        <div className="flex items-center space-x-6 lg:space-x-8">
                                            <div className="flex items-center space-x-2">
                                                <p className="text-sm font-medium">Rows per page</p>
                                                <Select
                                                    value={`${table.getState().pagination.pageSize}`}
                                                    onValueChange={(value) => {
                                                        table.setPageSize(Number(value));
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
                                                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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


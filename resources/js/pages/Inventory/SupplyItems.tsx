import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
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
    Search,
    Plus,
    Edit,
    Eye,
    Trash2,
    ArrowLeft,
    BarChart3,
    TrendingDown,
    TrendingUp,
    CheckCircle,
    FlaskConical,
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
    MoreHorizontal, 
    ChevronDown,
    Save,
    AlertCircle
} from 'lucide-react';
import { useState, useMemo, useCallback, useRef, useEffect, useLayoutEffect } from 'react';

type SupplyItem = {
    id: number;
    item_name: string;
    item_code: string;
    category: string;
    unit: string;
    assigned_to: string;
    stock: number;
    consumed: number;
    rejected: number;
    status: string;
    low_stock_alert: number;
    unit_price?: number;
    total_value?: number;
    location?: string;
    last_updated?: string;
};

type ConsumedRejectedItem = {
    id: number;
    item_name: string;
    item_code: string;
    category: string;
    consumed: number;
    rejected: number;
    total_used: number;
    last_updated: string;
};

type StaffMember = {
    id: number;
    name: string;
    role: string;
    employee_id?: string;
};

type SupplyStats = {
    totalItems: number;
    lowStock: number;
    outOfStock: number;
    consumedItems: number;
    rejectedItems: number;
};

interface SupplyItemsProps {
    doctorNurseItems: SupplyItem[];
    medTechItems: SupplyItem[];
    consumedRejectedItems: ConsumedRejectedItem[];
    staffMembers: StaffMember[];
    stats: SupplyStats;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Management',
        href: '/admin/inventory',
    },
    {
        title: 'Supply Items',
        href: '/admin/inventory/supply-items',
    },
];

const createDoctorNurseColumns = (handleOpenConsumeModal: (item: SupplyItem) => void, handleOpenRejectModal: (item: SupplyItem) => void, handleOpenMovementModal: (item: SupplyItem) => void, handleOpenViewModal: (item: SupplyItem) => void, handleOpenEditModal: (item: SupplyItem) => void, notify: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void): ColumnDef<SupplyItem>[] => [
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
                        {stock} {row.original.unit}
                    </span>
                    {isLowStock && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                </div>
            );
        },
    },
    {
        accessorKey: "unit_price",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Unit Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const price = parseFloat(String(row.getValue("unit_price") || 0));
            return <div className="font-medium">₱{price.toLocaleString()}</div>;
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
            const value = parseFloat(String(row.getValue("total_value") || 0));
            return <div className="font-medium">₱{value.toLocaleString()}</div>;
        },
    },
    {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => {
            return <div className="text-sm">{row.getValue("location") || 'Main Storage'}</div>;
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
                    case 'In Stock':
                        return 'bg-green-100 text-green-800';
                    case 'Low Stock':
                        return 'bg-orange-100 text-orange-800';
                    case 'Out of Stock':
                        return 'bg-red-100 text-red-800';
                    default:
                        return 'bg-gray-100 text-gray-800';
                }
            };
            
            return (
                <Badge className={getStatusBadge(status)}>
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "last_updated",
        header: "Last Updated",
        cell: ({ row }) => {
            const date = new Date(row.getValue("last_updated") || new Date());
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
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const item = row.original;

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
                        <DropdownMenuItem onClick={() => handleOpenViewModal(item)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenEditModal(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit item
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenMovementModal(item)}>
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            Add Movement
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenConsumeModal(item)}>
                            <TrendingDown className="mr-2 h-4 w-4" />
                            Consume Item
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenRejectModal(item)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Reject Item
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={() => {
                                if (confirm(`Are you sure you want to delete "${item.item_name}"? This action cannot be undone.`)) {
                                    router.delete(`/admin/inventory/${item.id}`, {
                                        onSuccess: () => notify('success', `${item.item_name} deleted successfully!`),
                                        onError: () => notify('error', 'Failed to delete item. Please try again.')
                                    });
                                }
                            }}
                            className="text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete item
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
];

const createMedTechColumns = (handleOpenConsumeModal: (item: SupplyItem) => void, handleOpenRejectModal: (item: SupplyItem) => void, handleOpenMovementModal: (item: SupplyItem) => void, handleOpenViewModal: (item: SupplyItem) => void, handleOpenEditModal: (item: SupplyItem) => void, notify: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void): ColumnDef<SupplyItem>[] => [
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
                        {stock} {row.original.unit}
                    </span>
                    {isLowStock && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                </div>
            );
        },
    },
    {
        accessorKey: "unit_price",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Unit Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const price = parseFloat(String(row.getValue("unit_price") || 0));
            return <div className="font-medium">₱{price.toLocaleString()}</div>;
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
            const value = parseFloat(String(row.getValue("total_value") || 0));
            return <div className="font-medium">₱{value.toLocaleString()}</div>;
        },
    },
    {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => {
            return <div className="text-sm">{row.getValue("location") || 'Main Storage'}</div>;
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
                    case 'In Stock':
                        return 'bg-green-100 text-green-800';
                    case 'Low Stock':
                        return 'bg-orange-100 text-orange-800';
                    case 'Out of Stock':
                        return 'bg-red-100 text-red-800';
                    default:
                        return 'bg-gray-100 text-gray-800';
                }
            };
            
            return (
                <Badge className={getStatusBadge(status)}>
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "last_updated",
        header: "Last Updated",
        cell: ({ row }) => {
            const date = new Date(row.getValue("last_updated") || new Date());
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
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const item = row.original;

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
                        <DropdownMenuItem onClick={() => handleOpenViewModal(item)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenEditModal(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit item
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenMovementModal(item)}>
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            Add Movement
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenConsumeModal(item)}>
                            <TrendingDown className="mr-2 h-4 w-4" />
                            Consume Item
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenRejectModal(item)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Reject Item
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={() => {
                                if (confirm(`Are you sure you want to delete "${item.item_name}"? This action cannot be undone.`)) {
                                    router.delete(`/admin/inventory/${item.id}`, {
                                        onSuccess: () => notify('success', `${item.item_name} deleted successfully!`),
                                        onError: () => notify('error', 'Failed to delete item. Please try again.')
                                    });
                                }
                            }}
                            className="text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete item
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
];

const createConsumedRejectedColumns = (): ColumnDef<ConsumedRejectedItem>[] => [
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
        accessorKey: "consumed",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Consumed
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const consumed = row.getValue("consumed") as number;
            return (
                <div className="flex items-center gap-2">
                    <span className="font-medium text-green-600">{consumed}</span>
                    <TrendingDown className="h-4 w-4 text-green-500" />
                </div>
            );
        },
    },
    {
        accessorKey: "rejected",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Rejected
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const rejected = row.getValue("rejected") as number;
            return (
                <div className="flex items-center gap-2">
                    <span className="font-medium text-red-600">{rejected}</span>
                    <Trash2 className="h-4 w-4 text-red-500" />
                </div>
            );
        },
    },
    {
        accessorKey: "total_used",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Total Used
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const totalUsed = row.getValue("total_used") as number;
            return (
                <div className="flex items-center gap-2">
                    <span className="font-medium text-blue-600">{totalUsed}</span>
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                </div>
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

export default function SupplyItems({
    doctorNurseItems = [],
    medTechItems = [],
    consumedRejectedItems = [],
    staffMembers = [],
    stats = {
        totalItems: 0,
        lowStock: 0,
        outOfStock: 0,
        consumedItems: 0,
        rejectedItems: 0,
    },
}: SupplyItemsProps) {
    // Ensure stats object has all required properties
    const safeStats = {
        totalItems: stats?.totalItems || 0,
        lowStock: stats?.lowStock || 0,
        outOfStock: stats?.outOfStock || 0,
        consumedItems: stats?.consumedItems || 0,
        rejectedItems: stats?.rejectedItems || 0,
    };
    // Form for adding new items
    const { data, setData, post, processing, errors, reset } = useForm({
        item_name: '',
        item_code: '',
        category: '',
        unit: '',
        assigned_to: '',
        stock: 0,
        low_stock_alert: 10,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Consume and Reject modal states
    const [isConsumeModalOpen, setIsConsumeModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<SupplyItem | null>(null);
    const [consumeQuantity, setConsumeQuantity] = useState('');
    const [consumeReason, setConsumeReason] = useState('');
    const [rejectQuantity, setRejectQuantity] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    
    // Movement modal states
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [movementData, setMovementData] = useState({
        movement_type: '',
        quantity: '',
        date: new Date().toISOString().split('T')[0],
        handled_by: '',
        reason: ''
    });
    const [isMovementSubmitting, setIsMovementSubmitting] = useState(false);

    // View modal states
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewItem, setViewItem] = useState<SupplyItem | null>(null);

    // Edit modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<SupplyItem | null>(null);
    const [editData, setEditData] = useState({
        item_name: '',
        item_code: '',
        category: '',
        unit: '',
        assigned_to: '',
        low_stock_alert: 0,
    });
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);
    
    // Notification state
    const [notifications, setNotifications] = useState<Array<{id: number, type: 'success' | 'error' | 'warning' | 'info', message: string}>>([]);
    
    // Simple notification system
    const notify = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 4000);
    };

    // Auto-generate item code based on item name and category
    const generateItemCode = useCallback((itemName: string, category: string) => {
        if (!itemName || !category) return '';
        
        // Get first 3 letters of category and first 3 letters of item name
        const categoryPrefix = category.substring(0, 3).toUpperCase();
        const itemPrefix = itemName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
        
        // Generate a random 3-digit number
        const randomNum = Math.floor(Math.random() * 900) + 100;
        
        return `${categoryPrefix}-${itemPrefix}-${randomNum}`;
    }, []);

    // Auto-generate item code handler
    const handleGenerateItemCode = useCallback(() => {
        if (!data.item_name.trim()) {
            notify('warning', 'Please enter an item name first');
            return;
        }
        
        if (!data.category) {
            notify('warning', 'Please select a category first');
            return;
        }
        
        // Generate code based on item name and category
        const generatedCode = generateItemCode(data.item_name, data.category);
        setData('item_code', generatedCode);
        notify('success', 'Item code generated successfully!');
    }, [data.item_name, data.category, setData, notify, generateItemCode]);

    // View modal handlers
    const handleOpenViewModal = useCallback((item: SupplyItem) => {
        setViewItem(item);
        setIsViewModalOpen(true);
    }, []);

    const handleViewModalClose = useCallback(() => {
        setIsViewModalOpen(false);
        setViewItem(null);
    }, []);

    // Edit modal handlers
    const handleOpenEditModal = useCallback((item: SupplyItem) => {
        setEditItem(item);
        setEditData({
            item_name: item.item_name,
            item_code: item.item_code,
            category: item.category,
            unit: item.unit,
            assigned_to: item.assigned_to,
            low_stock_alert: item.low_stock_alert,
        });
        setIsEditModalOpen(true);
    }, []);

    const handleEditModalClose = useCallback(() => {
        setIsEditModalOpen(false);
        setEditItem(null);
        setEditData({
            item_name: '',
            item_code: '',
            category: '',
            unit: '',
            assigned_to: '',
            low_stock_alert: 0,
        });
    }, []);

    const handleEditInputChange = useCallback((field: string, value: string | number) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const handleEditSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!editItem) return;

        setIsEditSubmitting(true);
        
        router.put(`/admin/inventory/${editItem.id}`, editData, {
            onSuccess: () => {
                notify('success', `${editItem.item_name} updated successfully!`);
                handleEditModalClose();
                router.reload();
            },
            onError: () => {
                notify('error', 'Failed to update item. Please try again.');
            },
            onFinish: () => {
                setIsEditSubmitting(false);
            }
        });
    }, [editItem, editData, router, notify, handleEditModalClose]);

    // Memoized handlers to prevent unnecessary re-renders
    const handleModalClose = useCallback(() => {
        setIsModalOpen(false);
        reset();
    }, [reset]);

    const handleModalOpen = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    // Consume and Reject modal handlers
    const handleOpenConsumeModal = useCallback((item: SupplyItem) => {
        setSelectedItem(item);
        setConsumeQuantity('');
        setConsumeReason('');
        setIsConsumeModalOpen(true);
    }, []);

    const handleOpenRejectModal = useCallback((item: SupplyItem) => {
        setSelectedItem(item);
        setRejectQuantity('');
        setRejectReason('');
        setIsRejectModalOpen(true);
    }, []);

    const handleConsumeModalClose = useCallback(() => {
        setIsConsumeModalOpen(false);
        setSelectedItem(null);
        setConsumeQuantity('');
        setConsumeReason('');
    }, []);

    const handleRejectModalClose = useCallback(() => {
        setIsRejectModalOpen(false);
        setSelectedItem(null);
        setRejectQuantity('');
        setRejectReason('');
    }, []);

    // Movement modal handlers
    const handleOpenMovementModal = useCallback((item: SupplyItem) => {
        setSelectedItem(item);
        setMovementData({
            movement_type: '',
            quantity: '',
            date: new Date().toISOString().split('T')[0],
            handled_by: '',
            reason: ''
        });
        setIsMovementModalOpen(true);
    }, []);

    const handleMovementModalClose = useCallback(() => {
        setIsMovementModalOpen(false);
        setSelectedItem(null);
        setMovementData({
            movement_type: '',
            quantity: '',
            date: new Date().toISOString().split('T')[0],
            handled_by: '',
            reason: ''
        });
    }, []);

    const handleMovementInputChange = useCallback((field: string, value: string) => {
        setMovementData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const handleMovementSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;
        
        setIsMovementSubmitting(true);
        
        router.post(`/admin/inventory/${selectedItem.id}/movement`, {
            ...movementData,
            quantity: parseInt(movementData.quantity)
        }, {
            onSuccess: () => {
                notify('success', `Movement recorded for ${selectedItem.item_name}!`);
                handleMovementModalClose();
            },
            onError: () => {
                notify('error', 'Failed to record movement. Please try again.');
            },
            onFinish: () => {
                setIsMovementSubmitting(false);
            }
        });
    }, [selectedItem, movementData, router, notify, handleMovementModalClose]);

    // Legacy handlers (kept for backward compatibility but not used in modals)
    const handleConsumeItem = useCallback((itemId: number) => {
        const quantity = prompt('Enter quantity to consume:');
        if (quantity && !isNaN(Number(quantity)) && Number(quantity) > 0) {
            const reason = prompt('Enter reason for consumption (optional):');
            router.post(`/admin/inventory/${itemId}/consume`, {
                quantity: Number(quantity),
                reason: reason || null
            }, {
                onSuccess: () => {
                    notify('success', 'Item consumed successfully!');
                },
                onError: () => {
                    notify('error', 'Failed to consume item. Please try again.');
                }
            });
        }
    }, [router, notify]);

    const handleRejectItem = useCallback((itemId: number) => {
        const quantity = prompt('Enter quantity to reject:');
        if (quantity && !isNaN(Number(quantity)) && Number(quantity) > 0) {
            const reason = prompt('Enter reason for rejection (required):');
            if (reason && reason.trim()) {
                router.post(`/admin/inventory/${itemId}/reject`, {
                    quantity: Number(quantity),
                    reason: reason.trim()
                }, {
                    onSuccess: () => {
                        notify('success', 'Item rejected successfully!');
                    },
                    onError: () => {
                        notify('error', 'Failed to reject item. Please try again.');
                    }
                });
            } else {
                notify('error', 'Reason is required for rejection.');
            }
        }
    }, [router, notify]);

    const handleConsumeSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem || !consumeQuantity || isNaN(Number(consumeQuantity)) || Number(consumeQuantity) <= 0) {
            notify('error', 'Please enter a valid quantity.');
            return;
        }
        
        router.post(`/admin/inventory/${selectedItem.id}/consume`, {
            quantity: Number(consumeQuantity),
            reason: consumeReason || null
        }, {
            onSuccess: () => {
                notify('success', `${selectedItem.item_name} consumed successfully!`);
                handleConsumeModalClose();
            },
            onError: () => {
                notify('error', 'Failed to consume item. Please try again.');
            }
        });
    }, [selectedItem, consumeQuantity, consumeReason, router, handleConsumeModalClose, notify]);

    const handleRejectSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem || !rejectQuantity || isNaN(Number(rejectQuantity)) || Number(rejectQuantity) <= 0) {
            notify('error', 'Please enter a valid quantity.');
            return;
        }
        
        if (!rejectReason.trim()) {
            notify('error', 'Reason is required for rejection.');
            return;
        }
        
        router.post(`/admin/inventory/${selectedItem.id}/reject`, {
            quantity: Number(rejectQuantity),
            reason: rejectReason.trim()
        }, {
            onSuccess: () => {
                notify('success', `${selectedItem.item_name} rejected successfully!`);
                handleRejectModalClose();
            },
            onError: () => {
                notify('error', 'Failed to reject item. Please try again.');
            }
        });
    }, [selectedItem, rejectQuantity, rejectReason, router, handleRejectModalClose, notify]);

    const handleModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        post('/admin/inventory', {
            onSuccess: () => {
                setIsSubmitting(false);
                notify('success', `${data.item_name} created successfully!`);
                handleModalClose();
            },
            onError: () => {
                setIsSubmitting(false);
                notify('error', 'Failed to create item. Please try again.');
            },
        });
    };

    const categories = [
        'Medical Supplies',
        'Laboratory Equipment',
        'Pharmaceuticals',
        'Surgical Instruments',
        'Diagnostic Tools',
        'Personal Protective Equipment',
        'Cleaning Supplies',
        'Office Supplies',
        'Other'
    ];

    const units = [
        'pieces',
        'boxes',
        'bottles',
        'tubes',
        'vials',
        'syringes',
        'gloves',
        'masks',
        'liters',
        'grams',
        'kilograms',
        'milliliters'
    ];

    // Optimized global filter functions
    const doctorNurseGlobalFilterFn = useCallback((row: any, columnId: string, value: string) => {
        const search = value.toLowerCase();
        const item = row.original;
        return Boolean(
            item.item_name?.toLowerCase().includes(search) ||
            item.item_code?.toLowerCase().includes(search) ||
            item.category?.toLowerCase().includes(search)
        );
    }, []);

    const medTechGlobalFilterFn = useCallback((row: any, columnId: string, value: string) => {
        const search = value.toLowerCase();
        const item = row.original;
        return Boolean(
            item.item_name?.toLowerCase().includes(search) ||
            item.item_code?.toLowerCase().includes(search) ||
            item.category?.toLowerCase().includes(search)
        );
    }, []);

    const consumedRejectedGlobalFilterFn = useCallback((row: any, columnId: string, value: string) => {
        const search = value.toLowerCase();
        const item = row.original;
        return Boolean(
            item.item_name?.toLowerCase().includes(search) ||
            item.item_code?.toLowerCase().includes(search) ||
            item.category?.toLowerCase().includes(search)
        );
    }, []);
    // TanStack Table state for Doctor & Nurse Items
    const [doctorNurseSorting, setDoctorNurseSorting] = useState<SortingState>([]);
    const [doctorNurseColumnFilters, setDoctorNurseColumnFilters] = useState<ColumnFiltersState>([]);
    const [doctorNurseColumnVisibility, setDoctorNurseColumnVisibility] = useState<VisibilityState>({});
    const [doctorNurseRowSelection, setDoctorNurseRowSelection] = useState({});
    const [doctorNurseGlobalFilter, setDoctorNurseGlobalFilter] = useState('');
    const [doctorNursePagination, setDoctorNursePagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    // TanStack Table state for Med Tech Items
    const [medTechSorting, setMedTechSorting] = useState<SortingState>([]);
    const [medTechColumnFilters, setMedTechColumnFilters] = useState<ColumnFiltersState>([]);
    const [medTechColumnVisibility, setMedTechColumnVisibility] = useState<VisibilityState>({});
    const [medTechRowSelection, setMedTechRowSelection] = useState({});
    const [medTechGlobalFilter, setMedTechGlobalFilter] = useState('');
    const [medTechPagination, setMedTechPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    // TanStack Table state for Consumed/Rejected Items
    const [consumedRejectedSorting, setConsumedRejectedSorting] = useState<SortingState>([]);
    const [consumedRejectedColumnFilters, setConsumedRejectedColumnFilters] = useState<ColumnFiltersState>([]);
    const [consumedRejectedColumnVisibility, setConsumedRejectedColumnVisibility] = useState<VisibilityState>({});
    const [consumedRejectedRowSelection, setConsumedRejectedRowSelection] = useState({});
    const [consumedRejectedGlobalFilter, setConsumedRejectedGlobalFilter] = useState('');
    const [consumedRejectedPagination, setConsumedRejectedPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    // Initialize tables
    const doctorNurseColumns = useMemo(() => createDoctorNurseColumns(handleOpenConsumeModal, handleOpenRejectModal, handleOpenMovementModal, handleOpenViewModal, handleOpenEditModal, notify), [handleOpenConsumeModal, handleOpenRejectModal, handleOpenMovementModal, handleOpenViewModal, handleOpenEditModal, notify]);
    const medTechColumns = useMemo(() => createMedTechColumns(handleOpenConsumeModal, handleOpenRejectModal, handleOpenMovementModal, handleOpenViewModal, handleOpenEditModal, notify), [handleOpenConsumeModal, handleOpenRejectModal, handleOpenMovementModal, handleOpenViewModal, handleOpenEditModal, notify]);
    const consumedRejectedColumns = useMemo(() => createConsumedRejectedColumns(), []);

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
        globalFilterFn: doctorNurseGlobalFilterFn,
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
        globalFilterFn: medTechGlobalFilterFn,
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

    const consumedRejectedTable = useReactTable({
        data: consumedRejectedItems || [],
        columns: consumedRejectedColumns,
        onSortingChange: setConsumedRejectedSorting,
        onColumnFiltersChange: setConsumedRejectedColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setConsumedRejectedColumnVisibility,
        onRowSelectionChange: setConsumedRejectedRowSelection,
        onGlobalFilterChange: setConsumedRejectedGlobalFilter,
        globalFilterFn: consumedRejectedGlobalFilterFn,
        state: {
            sorting: consumedRejectedSorting,
            columnFilters: consumedRejectedColumnFilters,
            columnVisibility: consumedRejectedColumnVisibility,
            rowSelection: consumedRejectedRowSelection,
            globalFilter: consumedRejectedGlobalFilter,
            pagination: consumedRejectedPagination,
        },
        onPaginationChange: setConsumedRejectedPagination,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Supply Items" />
            
            {/* Notification Display */}
            <div className="pointer-events-none fixed right-4 top-4 z-50 flex max-w-sm flex-col gap-2">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`pointer-events-auto rounded-md border p-3 text-sm shadow-md ${
                            notification.type === 'success'
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                : notification.type === 'error'
                                ? 'border-red-300 bg-red-50 text-red-800'
                                : notification.type === 'warning'
                                ? 'border-yellow-300 bg-yellow-50 text-yellow-800'
                                : 'border-slate-300 bg-white text-slate-800'
                        }`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="font-medium capitalize">{notification.type}</div>
                            <button 
                                className="opacity-60 hover:opacity-100" 
                                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                            >
                                ×
                            </button>
                        </div>
                        <div className="mt-1 whitespace-pre-wrap">{notification.message}</div>
                    </div>
                ))}
            </div>
            
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Items</p>
                                               <p className="text-3xl font-bold text-gray-900">{safeStats.totalItems}</p>
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
                                               <p className="text-3xl font-bold text-gray-900">{safeStats.lowStock}</p>
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
                                               <p className="text-3xl font-bold text-gray-900">{safeStats.outOfStock}</p>
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
                                               <p className="text-3xl font-bold text-gray-900">{safeStats.consumedItems}</p>
                                        <p className="text-sm text-gray-500">Items used today</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <TrendingDown className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Rejected</p>
                                               <p className="text-3xl font-bold text-gray-900">{safeStats.rejectedItems}</p>
                                        <p className="text-sm text-gray-500">Items rejected</p>
                                    </div>
                                    <div className="p-3 bg-gray-100 rounded-full">
                                        <Trash2 className="h-6 w-6 text-gray-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Combined Supply Items Section */}
                    <div className="mb-8">
                        <Card className="bg-white border border-gray-200 shadow-lg">
                            <CardHeader className="bg-white border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                        <Package className="h-5 w-5 text-black" />
                                        All Supply Items ({doctorNurseTable.getFilteredRowModel().rows.length + medTechTable.getFilteredRowModel().rows.length})
                                    </CardTitle>
                                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="bg-green-600 hover:bg-green-700 text-white">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Item
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2">
                                                    <Plus className="h-5 w-5" />
                                                    Add New Inventory Item
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Create a new inventory item with all necessary details.
                                                </DialogDescription>
                                            </DialogHeader>
                                            
                                            <form onSubmit={handleModalSubmit} className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Item Name */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="modal_item_name" className="text-sm font-medium text-gray-700">
                                                            Item Name *
                                                        </Label>
                                                        <Input
                                                            id="modal_item_name"
                                                            type="text"
                                                            value={data.item_name}
                                                            onChange={(e) => setData('item_name', e.target.value)}
                                                            placeholder="Enter item name"
                                                            className="h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                                            required
                                                        />
                                                        {errors.item_name && (
                                                            <div className="flex items-center gap-2 text-red-600 text-sm">
                                                                <AlertCircle className="h-4 w-4" />
                                                                {errors.item_name}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Item Code */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="modal_item_code" className="text-sm font-medium text-gray-700">
                                                            Item Code *
                                                        </Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                id="modal_item_code"
                                                                type="text"
                                                                value={data.item_code}
                                                                onChange={(e) => setData('item_code', e.target.value)}
                                                                placeholder="Enter unique item code"
                                                                className="h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl flex-1"
                                                                required
                                                            />
                                                            <Button
                                                                type="button"
                                                                onClick={handleGenerateItemCode}
                                                                className="h-12 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                                                                disabled={!data.item_name || !data.category}
                                                            >
                                                                <Settings2 className="h-4 w-4 mr-2" />
                                                                Generate
                                                            </Button>
                                                        </div>
                                                        {errors.item_code && (
                                                            <div className="flex items-center gap-2 text-red-600 text-sm">
                                                                <AlertCircle className="h-4 w-4" />
                                                                {errors.item_code}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Category */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="modal_category" className="text-sm font-medium text-gray-700">
                                                            Category *
                                                        </Label>
                                                        <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                                            <SelectTrigger className="h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                                                <SelectValue placeholder="Select category" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {categories.map((category) => (
                                                                    <SelectItem key={category} value={category}>
                                                                        {category}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {errors.category && (
                                                            <div className="flex items-center gap-2 text-red-600 text-sm">
                                                                <AlertCircle className="h-4 w-4" />
                                                                {errors.category}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Unit */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="modal_unit" className="text-sm font-medium text-gray-700">
                                                            Unit of Measurement *
                                                        </Label>
                                                        <Select value={data.unit} onValueChange={(value) => setData('unit', value)}>
                                                            <SelectTrigger className="h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                                                <SelectValue placeholder="Select unit" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {units.map((unit) => (
                                                                    <SelectItem key={unit} value={unit}>
                                                                        {unit}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {errors.unit && (
                                                            <div className="flex items-center gap-2 text-red-600 text-sm">
                                                                <AlertCircle className="h-4 w-4" />
                                                                {errors.unit}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Assigned To */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="modal_assigned_to" className="text-sm font-medium text-gray-700">
                                                            Assigned To *
                                                        </Label>
                                                        <Select value={data.assigned_to} onValueChange={(value) => setData('assigned_to', value)}>
                                                            <SelectTrigger className="h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                                                <SelectValue placeholder="Select department" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Doctor & Nurse">Doctor & Nurse</SelectItem>
                                                                <SelectItem value="Med Tech">Med Tech</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        {errors.assigned_to && (
                                                            <div className="flex items-center gap-2 text-red-600 text-sm">
                                                                <AlertCircle className="h-4 w-4" />
                                                                {errors.assigned_to}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Initial Stock */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="modal_stock" className="text-sm font-medium text-gray-700">
                                                            Initial Stock *
                                                        </Label>
                                                        <Input
                                                            id="modal_stock"
                                                            type="number"
                                                            min="0"
                                                            value={data.stock}
                                                            onChange={(e) => setData('stock', parseInt(e.target.value) || 0)}
                                                            placeholder="Enter initial stock quantity"
                                                            className="h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                                            required
                                                        />
                                                        {errors.stock && (
                                                            <div className="flex items-center gap-2 text-red-600 text-sm">
                                                                <AlertCircle className="h-4 w-4" />
                                                                {errors.stock}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Low Stock Alert */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="modal_low_stock_alert" className="text-sm font-medium text-gray-700">
                                                            Low Stock Alert Level
                                                        </Label>
                                                        <Input
                                                            id="modal_low_stock_alert"
                                                            type="number"
                                                            min="0"
                                                            value={data.low_stock_alert}
                                                            onChange={(e) => setData('low_stock_alert', parseInt(e.target.value) || 0)}
                                                            placeholder="Enter low stock alert level"
                                                            className="h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                                        />
                                                        {errors.low_stock_alert && (
                                                            <div className="flex items-center gap-2 text-red-600 text-sm">
                                                                <AlertCircle className="h-4 w-4" />
                                                                {errors.low_stock_alert}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <DialogFooter className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={handleModalClose}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        disabled={processing || isSubmitting}
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        {processing || isSubmitting ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                Creating...
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <Save className="h-4 w-4 mr-2" />
                                                                Create Item
                                                            </div>
                                                        )}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                
                                {/* Consume Item Modal */}
                                <Dialog open={isConsumeModalOpen} onOpenChange={setIsConsumeModalOpen}>
                                    <DialogContent className="max-w-md">
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2">
                                                <TrendingDown className="h-5 w-5 text-green-600" />
                                                Consume Item
                                            </DialogTitle>
                                            <DialogDescription>
                                                Consume {selectedItem?.item_name} from inventory
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleConsumeSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="consume-quantity">Quantity to Consume</Label>
                                                <Input
                                                    id="consume-quantity"
                                                    type="number"
                                                    min="1"
                                                    max={selectedItem?.stock || 0}
                                                    value={consumeQuantity}
                                                    onChange={(e) => setConsumeQuantity(e.target.value)}
                                                    placeholder="Enter quantity"
                                                    required
                                                />
                                                <p className="text-sm text-gray-500">
                                                    Available stock: {selectedItem?.stock || 0}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="consume-reason">Reason (Optional)</Label>
                                                <Input
                                                    id="consume-reason"
                                                    type="text"
                                                    value={consumeReason}
                                                    onChange={(e) => setConsumeReason(e.target.value)}
                                                    placeholder="Enter reason for consumption"
                                                />
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleConsumeModalClose}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <TrendingDown className="h-4 w-4 mr-2" />
                                                    Consume Item
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                                {/* Reject Item Modal */}
                                <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                                    <DialogContent className="max-w-md">
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2">
                                                <Trash2 className="h-5 w-5 text-red-600" />
                                                Reject Item
                                            </DialogTitle>
                                            <DialogDescription>
                                                Reject {selectedItem?.item_name} from inventory
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleRejectSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="reject-quantity">Quantity to Reject</Label>
                                                <Input
                                                    id="reject-quantity"
                                                    type="number"
                                                    min="1"
                                                    max={selectedItem?.stock || 0}
                                                    value={rejectQuantity}
                                                    onChange={(e) => setRejectQuantity(e.target.value)}
                                                    placeholder="Enter quantity"
                                                    required
                                                />
                                                <p className="text-sm text-gray-500">
                                                    Available stock: {selectedItem?.stock || 0}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="reject-reason">Reason (Required)</Label>
                                                <Input
                                                    id="reject-reason"
                                                    type="text"
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                    placeholder="Enter reason for rejection"
                                                    required
                                                />
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleRejectModalClose}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Reject Item
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                                {/* Movement Modal */}
                                <Dialog open={isMovementModalOpen} onOpenChange={setIsMovementModalOpen}>
                                    <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
                                        <DialogHeader className="pb-4 border-b border-gray-200">
                                            <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <ArrowUpDown className="h-5 w-5 text-blue-600" />
                                                </div>
                                                Add Inventory Movement
                                            </DialogTitle>
                                            <DialogDescription className="text-gray-600 mt-2">
                                                Record stock movement for <span className="font-medium text-gray-900">{selectedItem?.item_name}</span>
                                            </DialogDescription>
                                        </DialogHeader>
                                        
                                        <form onSubmit={handleMovementSubmit} className="py-6">
                                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                                {/* Left Column - Item Information */}
                                                <div className="lg:col-span-2">
                                                    <div className="space-y-6">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                                <Package className="h-5 w-5 text-gray-600" />
                                                                Item Information
                                                            </h3>
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Item Name</Label>
                                                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                                        <p className="text-base font-semibold text-gray-900">{selectedItem?.item_name}</p>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Item Code</Label>
                                                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                                        <p className="text-base font-semibold text-gray-900">{selectedItem?.item_code}</p>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Category</Label>
                                                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                                        <p className="text-base font-semibold text-gray-900">{selectedItem?.category}</p>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Current Stock</Label>
                                                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                                        <p className="text-lg font-bold text-blue-900">{selectedItem?.stock} {selectedItem?.unit}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Column - Movement Details */}
                                                <div className="lg:col-span-3">
                                                    <div className="space-y-6">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                                <ArrowUpDown className="h-5 w-5 text-gray-600" />
                                                                Movement Details
                                                            </h3>
                                                        </div>
                                                        
                                                        <div className="space-y-6">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="movement_type" className="text-sm font-medium text-gray-700">
                                                                        Movement Type *
                                                                    </Label>
                                                                    <Select 
                                                                        value={movementData.movement_type} 
                                                                        onValueChange={(value) => handleMovementInputChange('movement_type', value)}
                                                                    >
                                                                        <SelectTrigger className="h-11 w-full">
                                                                            <SelectValue placeholder="Select movement type" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="IN">
                                                                                <div className="flex items-center gap-3">
                                                                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                                                                    <span>IN (stock added)</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                            <SelectItem value="OUT">
                                                                                <div className="flex items-center gap-3">
                                                                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                                                                    <span>OUT (stock used/removed)</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                                                                        Quantity *
                                                                    </Label>
                                                                    <Input
                                                                        id="quantity"
                                                                        type="number"
                                                                        min="1"
                                                                        value={movementData.quantity}
                                                                        onChange={(e) => handleMovementInputChange('quantity', e.target.value)}
                                                                        className="h-11 w-full"
                                                                        placeholder="Enter quantity"
                                                                        required
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="unit" className="text-sm font-medium text-gray-700">
                                                                        Unit
                                                                    </Label>
                                                                    <Input
                                                                        id="unit"
                                                                        value={selectedItem?.unit || ''}
                                                                        className="h-11 w-full bg-gray-50"
                                                                        readOnly
                                                                    />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                                                                        Date *
                                                                    </Label>
                                                                    <Input
                                                                        id="date"
                                                                        type="date"
                                                                        value={movementData.date}
                                                                        onChange={(e) => handleMovementInputChange('date', e.target.value)}
                                                                        className="h-11 w-full"
                                                                        required
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="handled_by" className="text-sm font-medium text-gray-700">
                                                                    Handled By *
                                                                </Label>
                                                                <Select 
                                                                    value={movementData.handled_by} 
                                                                    onValueChange={(value) => handleMovementInputChange('handled_by', value)}
                                                                >
                                                                    <SelectTrigger className="h-11 w-full">
                                                                        <SelectValue placeholder="Select staff member">
                                                                            {movementData.handled_by && (
                                                                                <div className="flex items-center gap-2">
                                                                                    <Users className="h-4 w-4 text-gray-500" />
                                                                                    <span>{movementData.handled_by}</span>
                                                                                    {staffMembers.find(s => s.name === movementData.handled_by) && (
                                                                                        <span className="text-xs text-gray-500">
                                                                                            ({staffMembers.find(s => s.name === movementData.handled_by)?.role})
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </SelectValue>
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {staffMembers && staffMembers.length > 0 ? (
                                                                            staffMembers.map((staff) => (
                                                                                <SelectItem key={staff.id} value={staff.name}>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Users className="h-4 w-4 text-gray-500" />
                                                                                        <span>{staff.name}</span>
                                                                                        <span className="text-xs text-gray-500">({staff.role})</span>
                                                                                    </div>
                                                                                </SelectItem>
                                                                            ))
                                                                        ) : (
                                                                            <SelectItem value="No staff available" disabled>
                                                                                <div className="flex items-center gap-2">
                                                                                    <Users className="h-4 w-4 text-gray-400" />
                                                                                    <span className="text-gray-400">No staff members found</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                                                                    Reason / Notes
                                                                </Label>
                                                                <Textarea
                                                                    id="reason"
                                                                    value={movementData.reason}
                                                                    onChange={(e) => handleMovementInputChange('reason', e.target.value)}
                                                                    className="min-h-[100px] resize-none"
                                                                    placeholder="Enter reason for movement (e.g., 'Used during minor surgery', 'New delivery from supplier')"
                                                                    rows={4}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-4 pt-6 mt-8 border-t border-gray-200">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleMovementModalClose}
                                                    className="px-6 py-2"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={isMovementSubmitting || !movementData.movement_type || !movementData.quantity || !movementData.handled_by}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 flex items-center gap-2"
                                                >
                                                    <ArrowUpDown className="h-4 w-4" />
                                                    {isMovementSubmitting ? 'Saving...' : 'Save Movement'}
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                                {/* View Modal */}
                                <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader className="pb-4 border-b border-gray-200">
                                            <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Eye className="h-5 w-5 text-blue-600" />
                                                </div>
                                                Item Details
                                            </DialogTitle>
                                            <DialogDescription className="text-gray-600 mt-2">
                                                View detailed information for <span className="font-medium text-gray-900">{viewItem?.item_name}</span>
                                            </DialogDescription>
                                        </DialogHeader>
                                        
                                        {viewItem && (
                                            <div className="py-6">
                                                {/* Basic Information */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="flex items-center gap-2">
                                                                <Package className="h-5 w-5" />
                                                                Basic Information
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-600">Item Name</label>
                                                                <p className="text-lg font-semibold text-gray-900">{viewItem.item_name}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-600">Item Code</label>
                                                                <p className="text-lg font-semibold text-gray-900">{viewItem.item_code}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-600">Category</label>
                                                                <div className="flex items-center gap-2">
                                                                    <Package className="h-4 w-4 text-gray-500" />
                                                                    <span className="text-lg font-semibold text-gray-900">{viewItem.category}</span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-600">Unit</label>
                                                                <p className="text-lg font-semibold text-gray-900">{viewItem.unit}</p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="flex items-center gap-2">
                                                                <TrendingDown className="h-5 w-5" />
                                                                Stock Information
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-600">Current Stock</label>
                                                                <p className="text-2xl font-bold text-gray-900">{viewItem.stock} {viewItem.unit}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-600">Consumed</label>
                                                                <p className="text-lg font-semibold text-gray-900">{viewItem.consumed} {viewItem.unit}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-600">Rejected</label>
                                                                <p className="text-lg font-semibold text-gray-900">{viewItem.rejected} {viewItem.unit}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-600">Low Stock Alert</label>
                                                                <p className="text-lg font-semibold text-gray-900">{viewItem.low_stock_alert} {viewItem.unit}</p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                {/* Status and Additional Information */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="flex items-center gap-2">
                                                                <CheckCircle className="h-5 w-5" />
                                                                Status
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="flex items-center gap-2">
                                                                {viewItem.status === 'low_stock' || viewItem.status === 'out_of_stock' ? (
                                                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                                                ) : (
                                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                                )}
                                                                <Badge variant={viewItem.status === 'low_stock' || viewItem.status === 'out_of_stock' ? 'destructive' : 'default'}>
                                                                    {viewItem.status.replace('_', ' ').toUpperCase()}
                                                                </Badge>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="flex items-center gap-2">
                                                                <Package className="h-5 w-5" />
                                                                Additional Information
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-600">Assigned To</label>
                                                                <p className="text-gray-900">{viewItem.assigned_to}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-600">Location</label>
                                                                <p className="text-gray-900">{viewItem.location || 'Main Storage'}</p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                {/* Timestamps */}
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Package className="h-5 w-5" />
                                                            Record Information
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                                                                <p className="text-gray-900">{viewItem.last_updated ? new Date(viewItem.last_updated).toLocaleString() : 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-4 pt-6 mt-8 border-t border-gray-200">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleViewModalClose}
                                                className="px-6 py-2"
                                            >
                                                Close
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                {/* Edit Modal */}
                                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader className="pb-4 border-b border-gray-200">
                                            <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <Edit className="h-5 w-5 text-green-600" />
                                                </div>
                                                Edit Item
                                            </DialogTitle>
                                            <DialogDescription className="text-gray-600 mt-2">
                                                Update information for <span className="font-medium text-gray-900">{editItem?.item_name}</span>
                                            </DialogDescription>
                                        </DialogHeader>
                                        
                                        <form onSubmit={handleEditSubmit} className="py-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Item Name */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="edit_item_name" className="text-sm font-medium text-gray-700">
                                                        Item Name *
                                                    </Label>
                                                    <Input
                                                        id="edit_item_name"
                                                        type="text"
                                                        value={editData.item_name}
                                                        onChange={(e) => handleEditInputChange('item_name', e.target.value)}
                                                        placeholder="Enter item name"
                                                        className="h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                                        required
                                                    />
                                                </div>

                                                {/* Item Code */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="edit_item_code" className="text-sm font-medium text-gray-700">
                                                        Item Code *
                                                    </Label>
                                                    <Input
                                                        id="edit_item_code"
                                                        type="text"
                                                        value={editData.item_code}
                                                        onChange={(e) => handleEditInputChange('item_code', e.target.value)}
                                                        placeholder="Enter unique item code"
                                                        className="h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                                        required
                                                    />
                                                </div>

                                                {/* Category */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="edit_category" className="text-sm font-medium text-gray-700">
                                                        Category *
                                                    </Label>
                                                    <Select value={editData.category} onValueChange={(value) => handleEditInputChange('category', value)}>
                                                        <SelectTrigger className="h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories.map((category) => (
                                                                <SelectItem key={category} value={category}>
                                                                    {category}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Unit */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="edit_unit" className="text-sm font-medium text-gray-700">
                                                        Unit of Measurement *
                                                    </Label>
                                                    <Select value={editData.unit} onValueChange={(value) => handleEditInputChange('unit', value)}>
                                                        <SelectTrigger className="h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                                            <SelectValue placeholder="Select unit" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {units.map((unit) => (
                                                                <SelectItem key={unit} value={unit}>
                                                                    {unit}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Assigned To */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="edit_assigned_to" className="text-sm font-medium text-gray-700">
                                                        Assigned To *
                                                    </Label>
                                                    <Select value={editData.assigned_to} onValueChange={(value) => handleEditInputChange('assigned_to', value)}>
                                                        <SelectTrigger className="h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                                            <SelectValue placeholder="Select department" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Doctor & Nurse">Doctor & Nurse</SelectItem>
                                                            <SelectItem value="Med Tech">Med Tech</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Low Stock Alert */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="edit_low_stock_alert" className="text-sm font-medium text-gray-700">
                                                        Low Stock Alert Level
                                                    </Label>
                                                    <Input
                                                        id="edit_low_stock_alert"
                                                        type="number"
                                                        min="0"
                                                        value={editData.low_stock_alert}
                                                        onChange={(e) => handleEditInputChange('low_stock_alert', parseInt(e.target.value) || 0)}
                                                        placeholder="Enter low stock alert level"
                                                        className="h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                                    />
                                                </div>
                                            </div>

                                            {/* Current Stock Information (Read-only) */}
                                            {editItem && (
                                                <div className="bg-gray-50 rounded-lg p-4 mt-6">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Stock Information</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Current Stock</label>
                                                            <p className="text-lg font-semibold text-gray-900">{editItem.stock} {editItem.unit}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Consumed</label>
                                                            <p className="text-lg font-semibold text-gray-900">{editItem.consumed} {editItem.unit}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Rejected</label>
                                                            <p className="text-lg font-semibold text-gray-900">{editItem.rejected} {editItem.unit}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        Note: Stock quantities are managed through movements. Use the "Add Movement" button to update stock levels.
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex justify-end gap-4 pt-6 mt-8 border-t border-gray-200">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleEditModalClose}
                                                    className="px-6 py-2"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={isEditSubmitting}
                                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                                                >
                                                    <Save className="h-4 w-4" />
                                                    {isEditSubmitting ? 'Updating...' : 'Update Item'}
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent className="p-6">
                                {/* Doctor & Nurse Items Section */}
                                <div className="mb-12">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Users className="h-4 w-4 text-blue-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Doctor & Nurse Items ({doctorNurseTable.getFilteredRowModel().rows.length})</h3>
                                    </div>
                                    
                                    {/* Doctor & Nurse Controls */}
                                    <div className="flex flex-wrap items-center gap-4 py-4">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <Input
                                                placeholder="Search Doctor & Nurse items..."
                                                value={doctorNurseGlobalFilter ?? ""}
                                                onChange={(event) => setDoctorNurseGlobalFilter(event.target.value)}
                                                className="max-w-sm"
                                            />
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline">
                                                        Columns <ChevronDown className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                                                    {doctorNurseTable
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
                                    </div>
                                    
                                    {/* Doctor & Nurse Table */}
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
                                                            No Doctor & Nurse items found.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    
                                    {/* Doctor & Nurse Pagination */}
                                    <div className="flex items-center justify-between px-2 py-4">
                                        <div className="text-muted-foreground flex-1 text-sm">
                                            Showing {doctorNurseTable.getRowModel().rows.length} of {doctorNurseTable.getFilteredRowModel().rows.length} Doctor & Nurse items
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
                                                        {[10, 20, 30, 40, 50].map((pageSize) => (
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
                                </div>

                                {/* Separator Line */}
                                <div className="my-8 border-t-2 border-gray-300"></div>

                                {/* Med Tech Items Section */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <FlaskConical className="h-4 w-4 text-purple-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Med Tech Items ({medTechTable.getFilteredRowModel().rows.length})</h3>
                                    </div>
                                    
                                    {/* Med Tech Controls */}
                                    <div className="flex flex-wrap items-center gap-4 py-4">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <Input
                                                placeholder="Search Med Tech items..."
                                                value={medTechGlobalFilter ?? ""}
                                                onChange={(event) => setMedTechGlobalFilter(event.target.value)}
                                                className="max-w-sm"
                                            />
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline">
                                                        Columns <ChevronDown className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                                                    {medTechTable
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
                                    </div>
                                    
                                    {/* Med Tech Table */}
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
                                                            No Med Tech items found.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    
                                    {/* Med Tech Pagination */}
                                    <div className="flex items-center justify-between px-2 py-4">
                                        <div className="text-muted-foreground flex-1 text-sm">
                                            Showing {medTechTable.getRowModel().rows.length} of {medTechTable.getFilteredRowModel().rows.length} Med Tech items
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
                                                        {[10, 20, 30, 40, 50].map((pageSize) => (
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
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Consumed/Rejected Items Section */}
                    <div className="mb-8">
                        <Card className="bg-white border border-gray-200 shadow-lg">
                            <CardHeader className="bg-white border-b border-gray-200">
                                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                    <BarChart3 className="h-5 w-5 text-black" />
                                    Consumed & Rejected Items ({consumedRejectedTable.getFilteredRowModel().rows.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {/* Controls */}
                                <div className="flex flex-wrap items-center gap-4 py-4">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <Input
                                            placeholder="Search consumed/rejected items..."
                                            value={consumedRejectedGlobalFilter ?? ""}
                                            onChange={(event) => setConsumedRejectedGlobalFilter(event.target.value)}
                                            className="max-w-sm"
                                        />
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline">
                                                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                                                {consumedRejectedTable
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
                                </div>

                                {/* Table */}
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            {consumedRejectedTable.getHeaderGroups().map((headerGroup) => (
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
                                            {consumedRejectedTable.getRowModel().rows?.length ? (
                                                consumedRejectedTable.getRowModel().rows.map((row) => (
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
                                                        colSpan={consumedRejectedColumns.length}
                                                        className="h-24 text-center"
                                                    >
                                                        No consumed/rejected items found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                
                                {/* Pagination */}
                                <div className="flex items-center justify-between px-2 py-4">
                                    <div className="text-muted-foreground flex-1 text-sm">
                                        Showing {consumedRejectedTable.getRowModel().rows.length} of {consumedRejectedTable.getFilteredRowModel().rows.length} consumed/rejected items
                                    </div>
                                    <div className="flex items-center space-x-6 lg:space-x-8">
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm font-medium">Rows per page</p>
                                            <Select
                                                value={`${consumedRejectedTable.getState().pagination.pageSize}`}
                                                onValueChange={(value) => {
                                                    consumedRejectedTable.setPageSize(Number(value))
                                                }}
                                            >
                                                <SelectTrigger className="h-8 w-[70px]">
                                                    <SelectValue placeholder={consumedRejectedTable.getState().pagination.pageSize} />
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
                                            Page {consumedRejectedTable.getState().pagination.pageIndex + 1} of{" "}
                                            {consumedRejectedTable.getPageCount()}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="hidden size-8 lg:flex"
                                                onClick={() => consumedRejectedTable.setPageIndex(0)}
                                                disabled={!consumedRejectedTable.getCanPreviousPage()}
                                            >
                                                <span className="sr-only">Go to first page</span>
                                                <ChevronsLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => consumedRejectedTable.previousPage()}
                                                disabled={!consumedRejectedTable.getCanPreviousPage()}
                                            >
                                                <span className="sr-only">Go to previous page</span>
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => consumedRejectedTable.nextPage()}
                                                disabled={!consumedRejectedTable.getCanNextPage()}
                                            >
                                                <span className="sr-only">Go to next page</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="hidden size-8 lg:flex"
                                                onClick={() => consumedRejectedTable.setPageIndex(consumedRejectedTable.getPageCount() - 1)}
                                                disabled={!consumedRejectedTable.getCanNextPage()}
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

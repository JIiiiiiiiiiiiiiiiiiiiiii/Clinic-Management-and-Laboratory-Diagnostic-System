import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
    MoreHorizontal, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Trash2,
    ArrowRightLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patient Management',
        href: '/admin/patient',
    },
    {
        title: 'Patient Transfer',
        href: '/admin/patient-transfers',
    },
];

// Column definitions for the patient transfer table
const createColumns = (handleApproveClick: (transfer: PatientTransfer) => void, handleRejectClick: (transfer: PatientTransfer) => void, handleDeleteClick: (transfer: PatientTransfer) => void): ColumnDef<PatientTransfer>[] => [
    {
        accessorKey: "patient_data.first_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Patient Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const transfer = row.original;
            return (
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                        <div className="font-medium">
                            {transfer.patient_data?.first_name || 'N/A'} {transfer.patient_data?.last_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                            {transfer.patient_data?.sex || 'N/A'}, {transfer.patient_data?.age || 'N/A'} years
                        </div>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "transfer_direction",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Transfer Direction
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const transfer = row.original;
            const direction = transfer.transfer_direction;
            
            if (!direction) {
                // Fallback for old records or determine from boolean fields
                if (transfer.from_hospital && transfer.to_clinic) {
                    return (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                            <ArrowRightLeft className="w-3 h-3 mr-1" />
                            Hospital → Clinic
                        </Badge>
                    );
                } else if (!transfer.from_hospital && !transfer.to_clinic) {
                    return (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            <ArrowRightLeft className="w-3 h-3 mr-1" />
                            Clinic → Hospital
                        </Badge>
                    );
                }
                return <span className="text-gray-400">N/A</span>;
            }
            
            const directionConfig = {
                'hospital_to_clinic': {
                    label: 'Hospital → Clinic',
                    className: 'bg-blue-100 text-blue-800 border-blue-200',
                },
                'clinic_to_hospital': {
                    label: 'Clinic → Hospital',
                    className: 'bg-green-100 text-green-800 border-green-200',
                },
                'hospital_to_hospital': {
                    label: 'Hospital → Hospital',
                    className: 'bg-purple-100 text-purple-800 border-purple-200',
                },
                'clinic_to_clinic': {
                    label: 'Clinic → Clinic',
                    className: 'bg-orange-100 text-orange-800 border-orange-200',
                },
            };
            
            const config = directionConfig[direction] || directionConfig['hospital_to_clinic'];
            
            return (
                <Badge variant="outline" className={config.className}>
                    <ArrowRightLeft className="w-3 h-3 mr-1" />
                    {config.label}
                </Badge>
            );
        },
    },
    {
        accessorKey: "registration_type",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Registration Type
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const transfer = row.original;
            const type = transfer.registration_type;
            if (!type) return <span className="text-gray-400">Existing Patient</span>;
            return (
                <Badge variant="outline" className={type === 'hospital' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-blue-100 text-blue-800 border-blue-200'}>
                    {type === 'hospital' ? 'Hospital Registration' : 'Admin Registration'}
                </Badge>
            );
        },
    },
    {
        accessorKey: "requested_by.name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Requested By
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const transfer = row.original;
            return (
                <div>
                    <div className="font-medium">{transfer.requested_by?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{transfer.requested_by?.role || 'N/A'}</div>
                </div>
            );
        },
    },
    {
        accessorKey: "approval_status",
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
            const transfer = row.original;
            // Use approval_status for registrations, status for existing transfers
            const status = (transfer.approval_status || transfer.status) as string;
            const getStatusBadge = (status: string) => {
                switch (status) {
                    case 'pending':
                        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
                    case 'approved':
                        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
                    case 'rejected':
                        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
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
        accessorKey: "created_at",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = new Date(row.getValue("created_at"));
            return (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {format(date, 'MMM dd, yyyy')}
                </div>
            );
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const transfer = row.original;

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
                            <Link href={route('admin.patient.transfer.registrations.show', transfer.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        {(transfer.approval_status === 'pending' || transfer.status === 'pending') && transfer.registration_type && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleApproveClick(transfer)}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRejectClick(transfer)}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                </DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={() => handleDeleteClick(transfer)}
                            className="text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
];

interface PatientTransfer {
    id: number;
    patient_id?: number; // For existing patient transfers
    patient_data?: {
        first_name?: string;
        last_name?: string;
        middle_name?: string;
        birthdate?: string;
        age?: number;
        sex?: string;
        mobile_no?: string;
        patient_no?: string;
    };
    registration_type?: 'admin' | 'hospital'; // Optional for existing transfers
    approval_status?: 'pending' | 'approved' | 'rejected'; // Optional for existing transfers
    status?: 'pending' | 'completed' | 'cancelled'; // For existing transfers
    from_hospital?: boolean;
    to_clinic?: boolean;
    transfer_direction?: 'hospital_to_clinic' | 'clinic_to_hospital' | 'hospital_to_hospital' | 'clinic_to_clinic';
    requested_by?: {
        id: number;
        name: string;
        role: string;
    };
    approved_by?: {
        id: number;
        name: string;
        role: string;
    };
    created_at: string;
    approval_date?: string;
    approval_notes?: string;
    transfer_reason?: string; // For existing transfers
    priority?: string; // For existing transfers
    transfer_date?: string; // For existing transfers
}

interface Props {
    transfers: {
        data: PatientTransfer[];
        links: any[];
        meta: any;
    };
    userRole: string;
    statistics?: {
        total_transfers: number;
        pending_transfers: number;
        approved_transfers: number;
        rejected_transfers: number;
    };
    filters?: {
        status?: string;
    };
}

export default function PatientTransferIndex({ transfers, userRole, statistics, filters }: Props) {
    const { flash } = usePage().props as any;
    
    // TanStack Table state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    
    // Handle flash messages and show toasts
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Modal states
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState<PatientTransfer | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    // Handler functions
    const handleApproveClick = (transfer: PatientTransfer) => {
        setSelectedTransfer(transfer);
        setApproveModalOpen(true);
    };

    const handleRejectClick = (transfer: PatientTransfer) => {
        setSelectedTransfer(transfer);
        setRejectReason('');
        setRejectModalOpen(true);
    };

    const handleDeleteClick = (transfer: PatientTransfer) => {
        setSelectedTransfer(transfer);
        setDeleteModalOpen(true);
    };

    const handleApprove = () => {
        if (selectedTransfer) {
            router.post(route('admin.patient.transfer.registrations.approve', selectedTransfer.id), {
                onSuccess: () => {
                    toast.success('Transfer request approved successfully!');
                    setApproveModalOpen(false);
                    setSelectedTransfer(null);
                },
                onError: () => {
                    toast.error('Failed to approve transfer request. Please try again.');
                }
            });
        }
    };

    const handleReject = () => {
        if (selectedTransfer && rejectReason.trim()) {
            router.post(route('admin.patient.transfer.registrations.reject', selectedTransfer.id), { 
                notes: rejectReason,
                onSuccess: () => {
                    toast.success('Transfer request rejected successfully!');
                    setRejectModalOpen(false);
                    setSelectedTransfer(null);
                    setRejectReason('');
                },
                onError: () => {
                    toast.error('Failed to reject transfer request. Please try again.');
                }
            });
        }
    };

    const handleDelete = () => {
        if (selectedTransfer) {
            router.delete(route('admin.patient.transfer.registrations.destroy', selectedTransfer.id), {
                onSuccess: () => {
                    toast.success('Transfer request deleted successfully!');
                    setDeleteModalOpen(false);
                    setSelectedTransfer(null);
                },
                onError: () => {
                    toast.error('Failed to delete transfer request. Please try again.');
                }
            });
        }
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
        router.get(route('admin.patient.transfer.registrations.index'), { status }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Initialize table
    const columns = createColumns(handleApproveClick, handleRejectClick, handleDeleteClick);
    const table = useReactTable({
        data: transfers?.data || [],
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
            const transfer = row.original;
            const direction = transfer.transfer_direction;
            let directionLabel = '';
            if (direction === 'hospital_to_clinic') directionLabel = 'hospital to clinic';
            else if (direction === 'clinic_to_hospital') directionLabel = 'clinic to hospital';
            else if (direction === 'hospital_to_hospital') directionLabel = 'hospital to hospital';
            else if (direction === 'clinic_to_clinic') directionLabel = 'clinic to clinic';
            
            return (
                transfer.patient_data?.first_name?.toLowerCase().includes(search) ||
                transfer.patient_data?.last_name?.toLowerCase().includes(search) ||
                transfer.requested_by?.name?.toLowerCase().includes(search) ||
                transfer.registration_type?.toLowerCase().includes(search) ||
                directionLabel.includes(search) ||
                (transfer.from_hospital && transfer.to_clinic && 'hospital to clinic'.includes(search)) ||
                (!transfer.from_hospital && !transfer.to_clinic && 'clinic to hospital'.includes(search))
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
    
    // Safety check for transfers data
    if (!transfers || !transfers.data) {
        return (
            <AppLayout
                title="Patient Transfer Registrations"
                renderHeader={() => (
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Patient Transfer Registrations</h2>
                            <p className="text-sm text-gray-600">Loading...</p>
                        </div>
                    </div>
                )}
            >
                <Head title="Patient Transfer Registrations" />
                <div className="py-6">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="text-center py-8">Loading patient transfer data...</div>
                    </div>
                </div>
            </AppLayout>
        );
    }



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patient Transfer Registrations" />
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Transfers</p>
                                        <p className="text-3xl font-bold text-gray-900">{statistics?.total_transfers || transfers.data?.length || 0}</p>
                                        <p className="text-sm text-gray-500">All registration requests</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Pending</p>
                                        <p className="text-3xl font-bold text-gray-900">{statistics?.pending_transfers || 0}</p>
                                        <p className="text-sm text-gray-500">Awaiting approval</p>
                                    </div>
                                    <div className="p-3 bg-yellow-100 rounded-full">
                                        <Clock className="h-6 w-6 text-yellow-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Approved</p>
                                        <p className="text-3xl font-bold text-gray-900">{statistics?.approved_transfers || 0}</p>
                                        <p className="text-sm text-gray-500">Successfully approved</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    </div>
                            </div>
                        </CardContent>
                    </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Rejected</p>
                                        <p className="text-3xl font-bold text-gray-900">{statistics?.rejected_transfers || 0}</p>
                                        <p className="text-sm text-gray-500">Declined requests</p>
                                    </div>
                                    <div className="p-3 bg-red-100 rounded-full">
                                        <XCircle className="h-6 w-6 text-red-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Data Table */}
                    <Card className="bg-white border border-gray-200">
                        <CardContent className="p-6">
                            {/* Table Controls */}
                            <div className="flex items-center py-4 gap-4">
                                <Input
                                    placeholder="Search transfers..."
                                    value={globalFilter ?? ""}
                                    onChange={(event) => setGlobalFilter(event.target.value)}
                                    className="max-w-sm"
                                />
                                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="all">All Status</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="flex gap-2 ml-auto">
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                    >
                                        <Link href="/admin/patient-transfers/transfers/create">
                                            <ArrowRightLeft className="h-4 w-4 mr-2" />
                                            Transfer Existing Patient
                                        </Link>
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline">
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

            {/* Approve Modal */}
            <AlertDialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Approve Transfer</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to approve this patient transfer request?
                            {selectedTransfer && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                    <p><strong>Patient:</strong> {selectedTransfer.patient_data?.first_name} {selectedTransfer.patient_data?.last_name}</p>
                                    <p><strong>Type:</strong> {selectedTransfer.registration_type === 'hospital' ? 'Hospital Registration' : 'Admin Registration'}</p>
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                            Approve Transfer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Modal */}
            <AlertDialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Transfer</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please provide a reason for rejecting this patient transfer request.
                            {selectedTransfer && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                    <p><strong>Patient:</strong> {selectedTransfer.patient_data?.first_name} {selectedTransfer.patient_data?.last_name}</p>
                                    <p><strong>Type:</strong> {selectedTransfer.registration_type === 'hospital' ? 'Hospital Registration' : 'Admin Registration'}</p>
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label htmlFor="reject-reason">Reason for rejection *</Label>
                        <Textarea
                            id="reject-reason"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Please provide a detailed reason for rejection..."
                            className="mt-2"
                            rows={3}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleReject} 
                            className="bg-red-600 hover:bg-red-700"
                            disabled={!rejectReason.trim()}
                        >
                            Reject Transfer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Modal */}
            <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Transfer</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this patient transfer request? This action cannot be undone.
                            {selectedTransfer && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                    <p><strong>Patient:</strong> {selectedTransfer.patient_data?.first_name} {selectedTransfer.patient_data?.last_name}</p>
                                    <p><strong>Type:</strong> {selectedTransfer.registration_type === 'hospital' ? 'Hospital Registration' : 'Admin Registration'}</p>
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete Transfer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
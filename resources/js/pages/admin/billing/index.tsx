import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { safeFormatDate, safeFormatTime } from '@/utils/dateTime';
import { formatAppointmentType } from '@/utils/formatAppointmentType';
import { 
    AlertCircle, 
    ArrowLeft, 
    CheckCircle, 
    Clock, 
    Download, 
    Eye, 
    FileText, 
    Plus, 
    Search, 
    XCircle, 
    CreditCard,
    Receipt,
    Coins,
    TrendingUp,
    Users,
    Calendar,
    Filter,
    Printer,
    Trash2,
    MoreHorizontal,
    X,
    Check,
    Edit,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
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

type BillingTransaction = {
    id: number;
    transaction_id: string;
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        patient_no: string;
    };
    doctor: {
        id: number;
        name: string;
    } | null;
    payment_type: 'cash' | 'health_card' | 'discount';
    total_amount: number;
    amount: number;
    discount_amount: number;
    discount_percentage: number | null;
    is_senior_citizen: boolean;
    senior_discount_amount: number;
    senior_discount_percentage: number;
    hmo_provider: string | null;
    hmo_reference: string | null;
    hmo_reference_number: string | null;
    payment_method: 'cash' | 'hmo';
    payment_reference: string | null;
    status: 'draft' | 'pending' | 'paid' | 'cancelled' | 'refunded';
    description: string | null;
    notes: string | null;
    transaction_date: string;
    due_date: string | null;
    created_at: string;
    items: Array<{
        id: number;
        item_type: string;
        item_name: string;
        quantity: number;
        unit_price: number;
        total_price: number;
    }>;
};

type Summary = {
    total_revenue: number;
    pending_amount: number;
    total_transactions: number;
    paid_transactions: number;
    total_doctor_payments: number;
    net_profit: number;
};

type Doctor = {
    id: number;
    name: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Billing',
        href: '/admin/billing',
    },
];

const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-500', icon: FileText },
    pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
    paid: { label: 'Paid', color: 'bg-green-500', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
    refunded: { label: 'Refunded', color: 'bg-orange-500', icon: AlertCircle },
};

const getStatusBadge = (status: keyof typeof statusConfig) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    
    const variantMap = {
        draft: 'secondary',
        pending: 'warning',
        paid: 'success',
        cancelled: 'destructive',
        refunded: 'destructive'
    };
    
    return (
        <Badge variant={variantMap[status] as any}>
            <Icon className="mr-1 h-3 w-3" />
            {config.label}
        </Badge>
    );
};


// Column definitions for the transactions table
const createTransactionColumns = (): ColumnDef<BillingTransaction>[] => [
    {
        accessorKey: "transaction_id",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Transaction ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("transaction_id")}</div>
        ),
    },
    {
        accessorKey: "patient",
        header: "Patient",
        cell: ({ row }) => {
            const patient = row.getValue("patient") as any;
            return (
                <div className="font-medium">
                    {patient ? `${patient.last_name}, ${patient.first_name}` : 'Loading...'}
                </div>
            );
        },
    },
    {
        accessorKey: "doctor",
        header: "Specialist",
        cell: ({ row }) => {
            const doctor = row.getValue("doctor") as any;
            return <div>{doctor ? doctor.name : '—'}</div>;
        },
    },
    {
        accessorKey: "amount",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-semibold text-green-600">
                ₱{row.getValue("amount")?.toLocaleString()}
            </div>
        ),
    },
    {
        accessorKey: "payment_method",
        header: "Payment Method",
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize">
                {row.getValue("payment_method")}
            </Badge>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as keyof typeof statusConfig;
            return getStatusBadge(status);
        },
    },
    {
        accessorKey: "transaction_date",
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
        cell: ({ row }) => (
            <div className="text-sm">
                {new Date(row.getValue("transaction_date")).toLocaleDateString()}
            </div>
        ),
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const transaction = row.original;

            return (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/billing/${transaction.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/billing/${transaction.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </Link>
                    </Button>
                </div>
            )
        },
    },
];

// Column definitions for the pending appointments table
const createPendingAppointmentsColumns = (): ColumnDef<PendingAppointment>[] => [
    {
        accessorKey: "patient_name",
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
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("patient_name")}</div>
        ),
    },
    {
        accessorKey: "appointment_type",
        header: "Appointment Type",
        cell: ({ row }) => {
            const type = row.getValue("appointment_type") as string;
            const formattedType = formatAppointmentType(type);
            return (
                <Badge variant="outline">
                    {formattedType}
                </Badge>
            );
        },
    },
    {
        accessorKey: "specialist_name",
        header: "Specialist",
        cell: ({ row }) => (
            <div>{row.getValue("specialist_name")}</div>
        ),
    },
    {
        accessorKey: "appointment_date",
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
        cell: ({ row }) => (
            <div>
                <div className="font-medium">
                    {safeFormatDate(row.getValue("appointment_date"))}
                </div>
                <div className="text-sm text-gray-500">
                    {safeFormatTime(row.original.appointment_time)}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "price",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-semibold text-green-600">
                ₱{(row.original.final_total_amount || row.getValue("price") || 0).toLocaleString()}
            </div>
        ),
    },
    {
        accessorKey: "billing_status",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                {row.getValue("billing_status")}
            </Badge>
        ),
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const appointment = row.original;

            return (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/appointments/${appointment.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                        </Link>
                    </Button>
                    <Button asChild size="sm">
                        <Link href={`/admin/billing/create-from-appointments?appointment_id=${appointment.id}`}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Pay Now
                        </Link>
                    </Button>
                </div>
            )
        },
    },
];

// Column definitions for the doctor payments table
const createDoctorPaymentsColumns = (): ColumnDef<any>[] => [
    {
        accessorKey: "doctor",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Doctor
                    </div>
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const doctor = row.getValue("doctor") as any;
            return (
                <div className="flex items-center gap-2">
                    <div className="p-1 bg-gray-100 rounded-full">
                        <Users className="h-4 w-4 text-black" />
                    </div>
                    {doctor ? doctor.name : 'N/A'}
                </div>
            );
        },
    },
    {
        accessorKey: "incentives",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Incentives
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-green-600">
                +₱{row.getValue("incentives")?.toLocaleString() || '0.00'}
            </div>
        ),
    },
    {
        accessorKey: "net_payment",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Net Payment
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-semibold text-lg">
                ₱{row.getValue("net_payment")?.toLocaleString() || '0.00'}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const variantMap = {
                pending: 'warning',
                paid: 'success',
                cancelled: 'destructive'
            };
            
            return (
                <Badge variant={variantMap[status as keyof typeof variantMap] as any}>
                    <div className="flex items-center gap-1">
                        {status === 'pending' && <Clock className="h-3 w-3" />}
                        {status === 'paid' && <Check className="h-3 w-3" />}
                        {status === 'cancelled' && <X className="h-3 w-3" />}
                        {status}
                    </div>
                </Badge>
            );
        },
    },
    {
        accessorKey: "payment_date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Payment Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-sm text-gray-600">
                {new Date(row.getValue("payment_date")).toLocaleDateString()}
            </div>
        ),
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const payment = row.original;

            return (
                <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/billing/doctor-payments/${payment.id}`}>
                            <Eye className="mr-1 h-3 w-3" />
                            View
                        </Link>
                    </Button>
                    {payment.status === 'pending' && (
                        <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-green-600 hover:text-green-700"
                            onClick={() => {
                                if (confirm('Are you sure you want to mark this payment as paid?')) {
                                    router.put(`/admin/billing/doctor-payments/${payment.id}/mark-paid`, {}, {
                                        onSuccess: () => {
                                            window.location.reload();
                                        },
                                        onError: (errors) => {
                                            console.error('Mark as paid failed:', errors);
                                            alert('Failed to mark payment as paid. Please try again.');
                                        },
                                    });
                                }
                            }}
                        >
                            <Check className="mr-1 h-3 w-3" />
                            Mark Paid
                        </Button>
                    )}
                </div>
            )
        },
    },
];

const paymentMethodConfig = {
    cash: { label: 'Cash', color: 'bg-green-100 text-green-800' },
    hmo: { label: 'HMO', color: 'bg-indigo-100 text-indigo-800' },
};

type PendingAppointment = {
    id: number;
    patient_name: string;
    patient_id: string;
    appointment_type: string;
    price: number;
    total_lab_amount: number;
    final_total_amount: number;
    appointment_date: string;
    appointment_time: string;
    specialist_name: string;
    billing_status: string;
    source: string;
    lab_tests_count: number;
};

export default function BillingIndex({ 
    transactions, 
    pendingAppointments,
    doctorPayments,
    revenueData,
    doctorPaymentData,
    summary, 
    doctors, 
    filters,
    defaultTab = 'transactions',
    debug
}: { 
    transactions: any;
    pendingAppointments: PendingAppointment[];
    doctorPayments: any;
    revenueData: any[];
    doctorPaymentData: any[];
    summary: Summary;
    doctors: Doctor[];
    filters: any;
    defaultTab?: string;
    debug?: any;
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState(filters.payment_method || 'all');
    const [doctorFilter, setDoctorFilter] = useState(filters.doctor_id || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<BillingTransaction | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentReference, setPaymentReference] = useState('');
    
    // TanStack Table state for transactions
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = React.useState(filters.search || '');

    // TanStack Table state for pending appointments
    const [pendingSorting, setPendingSorting] = React.useState<SortingState>([]);
    const [pendingColumnFilters, setPendingColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [pendingColumnVisibility, setPendingColumnVisibility] = React.useState<VisibilityState>({});
    const [pendingRowSelection, setPendingRowSelection] = React.useState({});
    const [pendingGlobalFilter, setPendingGlobalFilter] = React.useState('');

    // TanStack Table state for doctor payments
    const [doctorSorting, setDoctorSorting] = React.useState<SortingState>([]);
    const [doctorColumnFilters, setDoctorColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [doctorColumnVisibility, setDoctorColumnVisibility] = React.useState<VisibilityState>({});
    const [doctorRowSelection, setDoctorRowSelection] = React.useState({});
    const [doctorGlobalFilter, setDoctorGlobalFilter] = React.useState('');

    // Ensure we have data to work with
    const transactionsData = transactions?.data || [];
    const pendingAppointmentsData = pendingAppointments || [];
    const doctorPaymentsData = doctorPayments?.data || [];
    
    // Initialize transactions table
    const columns = createTransactionColumns();
    const table = useReactTable({
        data: transactionsData || [],
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
            const transaction = row.original;
            return (
                transaction.transaction_id?.toLowerCase().includes(search) ||
                transaction.patient?.first_name?.toLowerCase().includes(search) ||
                transaction.patient?.last_name?.toLowerCase().includes(search) ||
                transaction.patient?.patient_no?.toLowerCase().includes(search) ||
                transaction.doctor?.name?.toLowerCase().includes(search)
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

    // Initialize pending appointments table
    const pendingColumns = createPendingAppointmentsColumns();
    const pendingTable = useReactTable({
        data: pendingAppointmentsData || [],
        columns: pendingColumns,
        onSortingChange: setPendingSorting,
        onColumnFiltersChange: setPendingColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setPendingColumnVisibility,
        onRowSelectionChange: setPendingRowSelection,
        onGlobalFilterChange: setPendingGlobalFilter,
        globalFilterFn: (row, columnId, value) => {
            const search = value.toLowerCase();
            const appointment = row.original;
            return (
                appointment.patient_name?.toLowerCase().includes(search) ||
                appointment.appointment_type?.toLowerCase().includes(search) ||
                appointment.specialist_name?.toLowerCase().includes(search)
            );
        },
        state: {
            sorting: pendingSorting,
            columnFilters: pendingColumnFilters,
            columnVisibility: pendingColumnVisibility,
            rowSelection: pendingRowSelection,
            globalFilter: pendingGlobalFilter,
        },
    });

    // Initialize doctor payments table
    const doctorColumns = createDoctorPaymentsColumns();
    const doctorTable = useReactTable({
        data: doctorPaymentsData || [],
        columns: doctorColumns,
        onSortingChange: setDoctorSorting,
        onColumnFiltersChange: setDoctorColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setDoctorColumnVisibility,
        onRowSelectionChange: setDoctorRowSelection,
        onGlobalFilterChange: setDoctorGlobalFilter,
        globalFilterFn: (row, columnId, value) => {
            const search = value.toLowerCase();
            const payment = row.original;
            return (
                payment.doctor?.name?.toLowerCase().includes(search) ||
                payment.status?.toLowerCase().includes(search)
            );
        },
        state: {
            sorting: doctorSorting,
            columnFilters: doctorColumnFilters,
            columnVisibility: doctorColumnVisibility,
            rowSelection: doctorRowSelection,
            globalFilter: doctorGlobalFilter,
        },
    });
    
    
    const filteredTransactions = (transactionsData || []).filter((transaction: BillingTransaction) => {
        if (!transaction) {
            return false;
        }
        
        const patientName = transaction.patient ? 
            `${transaction.patient.first_name || ''} ${transaction.patient.last_name || ''}`.toLowerCase() : '';
        const search = searchTerm.toLowerCase();
        
        const matchesSearch = patientName.includes(search) || 
                            (transaction.transaction_id || '').toLowerCase().includes(search) ||
                            (transaction.patient?.patient_no || '').toLowerCase().includes(search);
        
        const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
        const matchesPaymentMethod = paymentMethodFilter === 'all' || transaction.payment_method === paymentMethodFilter;
        const matchesDoctor = doctorFilter === 'all' || transaction.doctor?.id?.toString() === doctorFilter;
        
        const passes = matchesSearch && matchesStatus && matchesPaymentMethod && matchesDoctor;
        
        
        return passes;
    });
    



    const getPaymentMethodBadge = (method: keyof typeof paymentMethodConfig) => {
        const config = paymentMethodConfig[method];
        return (
            <Badge className={config.color}>
                {config.label}
            </Badge>
        );
    };

    // Handle sorting
    const handleSort = (field: string) => {
        const newSortDir = sortBy === field && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(field);
        setSortDir(newSortDir);
        router.get('/admin/billing', {
            search: searchTerm,
            status: statusFilter,
            payment_method: paymentMethodFilter,
            doctor_id: doctorFilter,
            date_from: dateFrom,
            date_to: dateTo,
            sort_by: field,
            sort_dir: newSortDir,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilter = () => {
        router.get('/admin/billing', {
            search: searchTerm,
            status: statusFilter,
            payment_method: paymentMethodFilter,
            doctor_id: doctorFilter,
            date_from: dateFrom,
            date_to: dateTo,
            sort_by: sortBy,
            sort_dir: sortDir,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleMarkPaidClick = (transaction: BillingTransaction) => {
        setSelectedTransaction(transaction);
        setShowMarkPaidModal(true);
    };

    const handleMarkPaid = () => {
        if (!selectedTransaction) return;
        
        router.put(
            `/admin/billing/${selectedTransaction.id}/mark-paid`,
            { 
                payment_method: paymentMethod,
                payment_reference: paymentReference,
            },
            {
                onSuccess: () => {
                    setShowMarkPaidModal(false);
                    setSelectedTransaction(null);
                    setPaymentMethod('cash');
                    setPaymentReference('');
                },
                onError: (errors) => {
                    console.error('Mark as paid failed:', errors);
                    alert('Failed to mark transaction as paid. Please try again.');
                },
            },
        );
    };

    const handleStatusUpdate = (transactionId: number, newStatus: string) => {
        router.put(
            `/admin/billing/${transactionId}/status`,
            { status: newStatus },
            {
                onSuccess: () => {
                },
                onError: (errors) => {
                    console.error('Status update failed:', errors);
                    alert('Failed to update status. Please try again.');
                },
            },
        );
    };

    const handleDelete = (transactionId: number) => {
        if (confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
            router.delete(`/admin/billing/${transactionId}`, {
                onSuccess: () => {
                },
                onError: (errors) => {
                    console.error('Delete failed:', errors);
                    alert('Failed to delete transaction. Please try again.');
                },
            });
        }
    };

    // Report Action Functions
    const handleTransactionReport = () => {
        const reportDateFrom = dateFrom || new Date().toISOString().split('T')[0];
        const reportDateTo = dateTo || new Date().toISOString().split('T')[0];
        
        // Navigate to transaction report with current filters
        router.get('/admin/billing/transaction-report', {
            date_from: reportDateFrom,
            date_to: reportDateTo,
            status: statusFilter,
            payment_method: paymentMethodFilter,
            doctor_id: doctorFilter,
        });
    };

    const handleDoctorSummary = () => {
        const reportDateFrom = dateFrom || new Date().toISOString().split('T')[0];
        const reportDateTo = dateTo || new Date().toISOString().split('T')[0];
        
        // Navigate to doctor summary report
        router.get('/admin/billing/doctor-summary', {
            date_from: reportDateFrom,
            date_to: reportDateTo,
            doctor_id: doctorFilter,
        });
    };

    const handleHMOReport = () => {
        const reportDateFrom = dateFrom || new Date().toISOString().split('T')[0];
        const reportDateTo = dateTo || new Date().toISOString().split('T')[0];
        
        // Navigate to HMO report
        router.get('/admin/billing/billing-reports/hmo', {
            date_from: reportDateFrom,
            date_to: reportDateTo,
        });
    };

    const handleExportAll = () => {
        const reportDateFrom = dateFrom || new Date().toISOString().split('T')[0];
        const reportDateTo = dateTo || new Date().toISOString().split('T')[0];
        
        // Show export options modal or direct export
        const exportUrl = `/admin/billing/billing-reports/export-all?date_from=${reportDateFrom}&date_to=${reportDateTo}&format=excel`;
        window.open(exportUrl, '_blank');
    };

    // Enhanced Export Functions with Format Options
    const handleExportWithFormat = (reportType: string, format: 'excel' | 'pdf' = 'excel') => {
        const reportDateFrom = dateFrom || new Date().toISOString().split('T')[0];
        const reportDateTo = dateTo || new Date().toISOString().split('T')[0];
        
        const exportUrl = `/admin/billing/billing-reports/${reportType}/export?date_from=${reportDateFrom}&date_to=${reportDateTo}&format=${format}`;
        window.open(exportUrl, '_blank');
    };

    // Quick Export Functions
    const handleQuickExport = (type: 'transactions' | 'doctor-payments' | 'all') => {
        const reportDateFrom = dateFrom || new Date().toISOString().split('T')[0];
        const reportDateTo = dateTo || new Date().toISOString().split('T')[0];
        
        const exportUrl = `/admin/billing/export/${type}?date_from=${reportDateFrom}&date_to=${reportDateTo}&format=excel`;
        window.open(exportUrl, '_blank');
    };

    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing & Payments" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Heading title="Billing & Payments" description="Manage all clinic financial transactions" icon={CreditCard} />
                        </div>
                    </div>
                </div>

                {/* Debug Info */}
                {debug && (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h3 className="font-semibold text-yellow-800">Debug Info:</h3>
                        <p>Transactions: {debug.transactions_count} (Total: {debug.transactions_total})</p>
                        <p>Doctor Payments: {debug.doctor_payments_count}</p>
                    </div>
                )}

                {/* Main Content with Tabs */}
                <Tabs defaultValue={defaultTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="transactions">Transactions</TabsTrigger>
                        <TabsTrigger value="pending-appointments">Pending Appointments</TabsTrigger>
                        <TabsTrigger value="doctor-payments">Doctor Payments</TabsTrigger>
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                    </TabsList>

                    {/* Transactions Tab */}
                    <TabsContent value="transactions">
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <CreditCard className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Billing Transactions</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">Manage patient payments and billing records</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button asChild>
                                                    <Link href="/admin/billing/create">
                                                        <Plus className="mr-2 h-5 w-5" />
                                                        New Transaction
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Create New Transaction</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline">
                                                <Download className="mr-2 h-5 w-5" />
                                                Export
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => window.open('/admin/billing/export?format=excel', '_self')}>
                                                Excel
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => window.open('/admin/billing/export?format=pdf', '_self')}>
                                                PDF
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {/* Filters */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <div className="relative flex-1 max-w-md">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Search transactions..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                            />
                                        </div>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="h-12 px-4 border border-gray-200 rounded-xl focus:border-gray-500 focus:ring-gray-500"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="draft">Draft</option>
                                            <option value="pending">Pending</option>
                                            <option value="paid">Paid</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="refunded">Refunded</option>
                                        </select>
                                        <select
                                            value={paymentMethodFilter}
                                            onChange={(e) => setPaymentMethodFilter(e.target.value)}
                                            className="h-12 px-4 border border-gray-200 rounded-xl focus:border-gray-500 focus:ring-gray-500"
                                        >
                                            <option value="all">All Payment Methods</option>
                                            <option value="cash">Cash</option>
                                            <option value="hmo">HMO</option>
                                        </select>
                                        <select
                                            value={doctorFilter}
                                            onChange={(e) => setDoctorFilter(e.target.value)}
                                            className="h-12 px-4 border border-gray-200 rounded-xl focus:border-gray-500 focus:ring-gray-500"
                                        >
                                            <option value="all">All Specialists</option>
                                            {doctors.map((doctor) => (
                                                <option key={doctor.id} value={doctor.id.toString()}>
                                                    {doctor.name}
                                                </option>
                                            ))}
                                        </select>
                                        <Button onClick={handleFilter} className="h-12 px-6">
                                            <Filter className="mr-2 h-4 w-4" />
                                            Apply Filters
                                        </Button>
                                    </div>
                                </div>

                                {/* Table Controls */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 py-4">
                                    <Input
                                        placeholder="Search transactions..."
                                        value={globalFilter ?? ""}
                                        onChange={(event) => setGlobalFilter(event.target.value)}
                                        className="w-full sm:max-w-sm"
                                    />
                                    <Button
                                        asChild
                                        className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                                    >
                                        <Link href="/admin/billing/create">
                                            <Plus className="h-4 w-4 mr-2" />
                                            <span className="hidden sm:inline">New Transaction</span>
                                            <span className="sm:hidden">New</span>
                                        </Link>
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full sm:w-auto sm:ml-auto">
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

                                {/* Transactions Table */}
                                <div className="rounded-md border overflow-x-auto">
                                    <div className="inline-block min-w-full align-middle">
                                        <Table>
                                            <TableHeader>
                                                {table.getHeaderGroups().map((headerGroup) => (
                                                    <TableRow key={headerGroup.id}>
                                                        {headerGroup.headers.map((header) => {
                                                            return (
                                                                <TableHead key={header.id} className="whitespace-nowrap">
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
                                                                <TableCell key={cell.id} className="whitespace-nowrap">
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
                                </div>
                                
                                {/* Pagination */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 px-2 py-4">
                                    <div className="text-muted-foreground text-sm text-center sm:text-left">
                                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                                        {table.getFilteredRowModel().rows.length} row(s) selected.
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:space-x-6 lg:space-x-8">
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm font-medium hidden sm:inline">Rows per page</p>
                                            <p className="text-sm font-medium sm:hidden">Per page</p>
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
                    </TabsContent>

                    {/* Pending Appointments Tab */}
                    <TabsContent value="pending-appointments">
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Calendar className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Pending Appointments</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">Appointments awaiting payment processing</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button asChild>
                                        <Link href="/admin/billing/create-from-appointments">
                                            <Plus className="mr-2 h-5 w-5" />
                                            Create Transaction
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {/* Table Controls */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 py-4">
                                    <Input
                                        placeholder="Search appointments..."
                                        value={pendingGlobalFilter ?? ""}
                                        onChange={(event) => setPendingGlobalFilter(event.target.value)}
                                        className="w-full sm:max-w-sm"
                                    />
                                    <Button
                                        asChild
                                        className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                                    >
                                        <Link href="/admin/billing/create-from-appointments">
                                            <Plus className="h-4 w-4 mr-2" />
                                            <span className="hidden sm:inline">Create Transaction</span>
                                            <span className="sm:hidden">Create</span>
                                        </Link>
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full sm:w-auto sm:ml-auto">
                                                Columns <ChevronDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                                            {pendingTable
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

                                {/* Pending Appointments Table */}
                                <div className="rounded-md border overflow-x-auto">
                                    <div className="inline-block min-w-full align-middle">
                                        <Table>
                                            <TableHeader>
                                                {pendingTable.getHeaderGroups().map((headerGroup) => (
                                                    <TableRow key={headerGroup.id}>
                                                        {headerGroup.headers.map((header) => {
                                                            return (
                                                                <TableHead key={header.id} className="whitespace-nowrap">
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
                                                {pendingTable.getRowModel().rows?.length ? (
                                                    pendingTable.getRowModel().rows.map((row) => (
                                                        <TableRow
                                                            key={row.id}
                                                            data-state={row.getIsSelected() && "selected"}
                                                        >
                                                            {row.getVisibleCells().map((cell) => (
                                                                <TableCell key={cell.id} className="whitespace-nowrap">
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
                                                            colSpan={pendingColumns.length}
                                                            className="h-24 text-center"
                                                        >
                                                            No pending appointments
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                                
                                {/* Pagination */}
                                <div className="flex items-center justify-between px-2 py-4">
                                    <div className="text-muted-foreground flex-1 text-sm">
                                        {pendingTable.getFilteredSelectedRowModel().rows.length} of{" "}
                                        {pendingTable.getFilteredRowModel().rows.length} row(s) selected.
                                    </div>
                                    <div className="flex items-center space-x-6 lg:space-x-8">
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm font-medium">Rows per page</p>
                                            <Select
                                                value={`${pendingTable.getState().pagination.pageSize}`}
                                                onValueChange={(value) => {
                                                    pendingTable.setPageSize(Number(value))
                                                }}
                                            >
                                                <SelectTrigger className="h-8 w-[70px]">
                                                    <SelectValue placeholder={pendingTable.getState().pagination.pageSize} />
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
                                            Page {pendingTable.getState().pagination.pageIndex + 1} of{" "}
                                            {pendingTable.getPageCount()}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="hidden size-8 lg:flex"
                                                onClick={() => pendingTable.setPageIndex(0)}
                                                disabled={!pendingTable.getCanPreviousPage()}
                                            >
                                                <span className="sr-only">Go to first page</span>
                                                <ChevronsLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => pendingTable.previousPage()}
                                                disabled={!pendingTable.getCanPreviousPage()}
                                            >
                                                <span className="sr-only">Go to previous page</span>
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => pendingTable.nextPage()}
                                                disabled={!pendingTable.getCanNextPage()}
                                            >
                                                <span className="sr-only">Go to next page</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="hidden size-8 lg:flex"
                                                onClick={() => pendingTable.setPageIndex(pendingTable.getPageCount() - 1)}
                                                disabled={!pendingTable.getCanNextPage()}
                                            >
                                                <span className="sr-only">Go to last page</span>
                                                <ChevronsRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Doctor Payments Tab */}
                    <TabsContent value="doctor-payments">
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Users className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Doctor Payments</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">Manage doctor salary payments and commissions</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button asChild>
                                        <Link href="/admin/billing/doctor-payments/create">
                                            <Plus className="mr-2 h-5 w-5" />
                                            New Payment
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href="/admin/billing/doctor-summary">
                                            <TrendingUp className="mr-2 h-5 w-5" />
                                            Summary Report
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {/* Table Controls */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 py-4">
                                    <Input
                                        placeholder="Search payments..."
                                        value={doctorGlobalFilter ?? ""}
                                        onChange={(event) => setDoctorGlobalFilter(event.target.value)}
                                        className="w-full sm:max-w-sm"
                                    />
                                    <Button
                                        asChild
                                        className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                                    >
                                        <Link href="/admin/billing/doctor-payments/create">
                                            <Plus className="h-4 w-4 mr-2" />
                                            <span className="hidden sm:inline">New Payment</span>
                                            <span className="sm:hidden">New</span>
                                        </Link>
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full sm:w-auto sm:ml-auto">
                                                Columns <ChevronDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                                            {doctorTable
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

                                {/* Doctor Payments Table */}
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            {doctorTable.getHeaderGroups().map((headerGroup) => (
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
                                            {doctorTable.getRowModel().rows?.length ? (
                                                doctorTable.getRowModel().rows.map((row) => (
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
                                                        colSpan={doctorColumns.length}
                                                        className="h-24 text-center"
                                                    >
                                                        <div className="flex flex-col items-center">
                                                            <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                            <h3 className="mb-2 text-lg font-semibold text-gray-600">No doctor payments</h3>
                                                            <p className="text-gray-500">Create your first doctor payment</p>
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
                                        {doctorTable.getFilteredSelectedRowModel().rows.length} of{" "}
                                        {doctorTable.getFilteredRowModel().rows.length} row(s) selected.
                                    </div>
                                    <div className="flex items-center space-x-6 lg:space-x-8">
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm font-medium">Rows per page</p>
                                            <Select
                                                value={`${doctorTable.getState().pagination.pageSize}`}
                                                onValueChange={(value) => {
                                                    doctorTable.setPageSize(Number(value))
                                                }}
                                            >
                                                <SelectTrigger className="h-8 w-[70px]">
                                                    <SelectValue placeholder={doctorTable.getState().pagination.pageSize} />
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
                                            Page {doctorTable.getState().pagination.pageIndex + 1} of{" "}
                                            {doctorTable.getPageCount()}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="hidden size-8 lg:flex"
                                                onClick={() => doctorTable.setPageIndex(0)}
                                                disabled={!doctorTable.getCanPreviousPage()}
                                            >
                                                <span className="sr-only">Go to first page</span>
                                                <ChevronsLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => doctorTable.previousPage()}
                                                disabled={!doctorTable.getCanPreviousPage()}
                                            >
                                                <span className="sr-only">Go to previous page</span>
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => doctorTable.nextPage()}
                                                disabled={!doctorTable.getCanNextPage()}
                                            >
                                                <span className="sr-only">Go to next page</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="hidden size-8 lg:flex"
                                                onClick={() => doctorTable.setPageIndex(doctorTable.getPageCount() - 1)}
                                                disabled={!doctorTable.getCanNextPage()}
                                            >
                                                <span className="sr-only">Go to last page</span>
                                                <ChevronsRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>


                    {/* Reports Tab */}
                    <TabsContent value="reports">
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    ₱{summary.total_revenue?.toLocaleString() || '0'}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-green-100 rounded-full">
                                                <Coins className="h-6 w-6 text-green-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>


                                <Card className="shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Doctor Payments</p>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    ₱{summary.total_doctor_payments?.toLocaleString() || '0'}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-blue-100 rounded-full">
                                                <Users className="h-6 w-6 text-blue-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                                                <p className="text-2xl font-bold text-purple-600">
                                                    ₱{summary.net_profit?.toLocaleString() || '0'}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-purple-100 rounded-full">
                                                <TrendingUp className="h-6 w-6 text-purple-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Quick Actions */}
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                        <TrendingUp className="h-5 w-5 text-black" />
                                        Report Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <Button 
                                            variant="outline" 
                                            className="h-20 flex flex-col gap-2"
                                            onClick={handleTransactionReport}
                                        >
                                            <Calendar className="h-6 w-6" />
                                            Transaction Report
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="h-20 flex flex-col gap-2"
                                            onClick={handleDoctorSummary}
                                        >
                                            <Users className="h-6 w-6" />
                                            Doctor Summary
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="h-20 flex flex-col gap-2"
                                            onClick={handleHMOReport}
                                        >
                                            <FileText className="h-6 w-6" />
                                            HMO Report
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="h-20 flex flex-col gap-2"
                                            onClick={handleExportAll}
                                        >
                                            <Download className="h-6 w-6" />
                                            Export All
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Mark as Paid Modal */}
                {showMarkPaidModal && selectedTransaction && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Mark as Paid</h3>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowMarkPaidModal(false)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Transaction: <span className="font-medium">{selectedTransaction.transaction_id}</span>
                                        </p>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Amount: <span className="font-medium">₱{(selectedTransaction.amount || 0).toLocaleString()}</span>
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="payment_method">Payment Method</Label>
                                        <select
                                            id="payment_method"
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="hmo">HMO</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="payment_reference">Payment Reference (Optional)</Label>
                                        <Input
                                            id="payment_reference"
                                            value={paymentReference}
                                            onChange={(e) => setPaymentReference(e.target.value)}
                                            placeholder="Enter payment reference number"
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowMarkPaidModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleMarkPaid}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Mark as Paid
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
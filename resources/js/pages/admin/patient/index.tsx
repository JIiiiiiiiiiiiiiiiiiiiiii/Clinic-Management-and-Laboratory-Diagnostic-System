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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { PatientItem } from '@/types/patients';
import { Head, Link, router, usePage } from '@inertiajs/react';
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
    Edit, Eye, Plus, Search, Filter, Calendar, User, Phone, Mail, MapPin, Clock, 
    Stethoscope, CheckCircle, AlertCircle, XCircle, Activity, TrendingUp,
    FileText, Heart, Calendar as CalendarIcon, UserCheck, BarChart3, ArrowLeft, ArrowRight, UserPlus, Users, Trash2,
    Download, Upload, MoreHorizontal, ChevronDown, Bell, Settings, Grid, List, ArrowUpDown, ArrowUp, ArrowDown,
    ChevronsUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Settings2, EyeOff
} from 'lucide-react';
import * as React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patient Management',
        href: '/admin/patient',
    },
];

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

type VisitRow = {
    id: number;
    patient: { id: number; patient_no: string; first_name: string; last_name: string };
    visit_date_time: string;
    attending_physician: string;
    status: 'active' | 'completed' | 'discharged';
};

// Column definitions for the patient data table
const createColumns = (handleDeletePatient: (patient: PatientItem) => void): ColumnDef<PatientItem>[] => [
    {
        accessorKey: "patient_no",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Patient No
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("patient_no")}</div>
        ),
    },
    {
        accessorKey: "first_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    First Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("first_name")}</div>
        ),
    },
    {
        accessorKey: "last_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Last Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("last_name")}</div>
        ),
    },
    {
        accessorKey: "age",
        header: "Age",
        cell: ({ row }) => (
            <div className="text-center">{row.getValue("age")}</div>
        ),
    },
    {
        accessorKey: "sex",
        header: "Gender",
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize">
                {row.getValue("sex")}
            </Badge>
        ),
    },
    {
        accessorKey: "birthdate",
        header: "Date of Birth",
        cell: ({ row }) => {
            const birthdate = row.getValue("birthdate") as string;
            if (!birthdate) return <div className="text-gray-500">N/A</div>;
            
            try {
                const date = new Date(birthdate);
                if (isNaN(date.getTime())) return <div className="text-gray-500">N/A</div>;
                
                return (
                    <div className="text-sm">
                        {date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        })}
                    </div>
                );
            } catch (error) {
                return <div className="text-gray-500">N/A</div>;
            }
        },
    },
    {
        accessorKey: "mobile_no",
        header: "Mobile",
        cell: ({ row }) => (
            <div className="text-sm">{row.getValue("mobile_no") || "N/A"}</div>
        ),
    },
    {
        accessorKey: "display_address",
        header: "Address",
        cell: ({ row }) => (
            <div className="text-sm max-w-[200px] truncate" title={row.getValue("display_address")}>
                {row.getValue("display_address") || "N/A"}
            </div>
        ),
    },
    {
        accessorKey: "created_at",
        header: "Date Created",
        cell: ({ row }) => {
            const date = new Date(row.getValue("created_at"));
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
            const patient = row.original;

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
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(patient.patient_no)}
                        >
                            Copy patient number
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.visit(`/admin/patient/${(patient as any).id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View patient
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.visit(`/admin/patient/${(patient as any).id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit patient
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => handleDeletePatient(patient)}
                            className="text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete patient
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
];

export default function Patient(props: {
    patients: PatientItem[];
    patients_pagination: Pagination;
    patients_filters: { p_search: string; p_sort_by: string; p_sort_dir: 'asc' | 'desc' };
    statistics?: {
        total_patients?: number;
        active_patients?: number;
        inactive_patients?: number;
        new_patients_this_month?: number;
        patients_with_appointments?: number;
        patients_with_completed_visits?: number;
        patients_by_gender?: { [key: string]: number };
        patients_by_age_group?: { [key: string]: number };
        patients_by_civil_status?: { [key: string]: number };
        senior_citizens?: number;
        patients_with_insurance?: number;
    };
}) {
    const { patients, patients_pagination, patients_filters, statistics } = props as any;
    
    // TanStack Table state
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = React.useState(patients_filters?.p_search || '');
    
    // Delete confirmation state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
    const [patientToDelete, setPatientToDelete] = React.useState<PatientItem | null>(null);

    // Delete handler functions
    const handleDeletePatient = (patient: PatientItem) => {
        setPatientToDelete(patient);
        setDeleteConfirmOpen(true);
    };

    // Initialize table
    const columns = createColumns(handleDeletePatient);
    const table = useReactTable({
        data: patients || [],
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
            const patient = row.original;
            return (
                patient.first_name?.toLowerCase().includes(search) ||
                patient.last_name?.toLowerCase().includes(search) ||
                patient.patient_no?.toLowerCase().includes(search) ||
                patient.mobile_no?.toLowerCase().includes(search) ||
                patient.display_address?.toLowerCase().includes(search)
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
    
    const created = (usePage().props as any).flash?.created_patient as
        | { id: number; last_name: string; first_name: string; age: number; sex: string }
        | undefined;
    const [open, setOpen] = React.useState(Boolean(created));

    const confirmDelete = () => {
        if (patientToDelete) {
            router.delete(`/admin/patient/${(patientToDelete as any).id}`, {
                onSuccess: () => {
                    setDeleteConfirmOpen(false);
                    setPatientToDelete(null);
                },
            });
        }
    };

    const stats = {
        totalPatients: statistics?.total_patients || 0,
        activePatients: statistics?.active_patients || 0,
        patientsWithAppointments: statistics?.patients_with_appointments || 0,
        seniorCitizens: statistics?.senior_citizens || 0,
        newThisMonth: statistics?.new_patients_this_month || 0
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patient Management" />
            <div className="min-h-screen bg-gray-50">

                <div className="p-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Patients</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.totalPatients}</p>
                                        <p className="text-sm text-gray-500">All registered patients</p>
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
                                        <p className="text-sm font-medium text-gray-600">Active Patients</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.activePatients}</p>
                                        <p className="text-sm text-gray-500">Currently active</p>
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
                                        <p className="text-sm font-medium text-gray-600">With Appointments</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.patientsWithAppointments}</p>
                                        <p className="text-sm text-gray-500">Scheduled visits</p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-full">
                                        <Calendar className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Senior Citizens</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.seniorCitizens}</p>
                                        <p className="text-sm text-gray-500">Age 60+</p>
                                    </div>
                                    <div className="p-3 bg-orange-100 rounded-full">
                                        <Heart className="h-6 w-6 text-orange-600" />
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
                                    placeholder="Search patients..."
                                    value={globalFilter ?? ""}
                                    onChange={(event) => setGlobalFilter(event.target.value)}
                                    className="max-w-sm"
                                />
                                <Button
                                    asChild
                                    className="bg-green-600 hover:bg-green-700 text-white ml-4"
                                >
                                    <Link href="/admin/patient/create">
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Register New Patient
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

                {/* Success Dialog */}
                <AlertDialog open={open} onOpenChange={setOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Patient Created Successfully!</AlertDialogTitle>
                            <AlertDialogDescription>
                                {created && (
                                    <>
                                        Patient {created.first_name} {created.last_name} has been successfully registered.
                                        <br />
                                        Patient Number: {created.id}
                                        <br />
                                        Age: {created.age} | Gender: {created.sex}
                                    </>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction onClick={() => setOpen(false)}>
                                Continue
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Patient</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete <strong>{patientToDelete?.first_name} {patientToDelete?.last_name}</strong>? 
                                This will also delete all associated appointments and visits. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                                Delete Patient
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}

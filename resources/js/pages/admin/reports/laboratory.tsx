import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, Clock, Download, FileText, FlaskConical, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

interface LabOrder {
    id: number;
    patient_name: string;
    doctor_name: string;
    test_name: string;
    status: string;
    created_at: string;
    result_date?: string;
}

interface Summary {
    total_orders: number;
    pending_orders: number;
    completed_orders: number;
    date_from?: string;
    date_to?: string;
}

interface LaboratoryReportsProps {
    labOrders: {
        data: LabOrder[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    summary: Summary;
}

const breadcrumbs = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Reports', href: '/admin/reports' },
    { label: 'Laboratory Reports', href: '/admin/reports/laboratory' },
];

// Column definitions for the data table
const columns: ColumnDef<LabOrder>[] = [
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Order ID" />,
        cell: ({ row }) => <div className="font-medium">#{row.getValue('id')}</div>,
    },
    {
        accessorKey: 'patient_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Patient Name" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue('patient_name')}</div>,
    },
    {
        accessorKey: 'doctor_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Doctor" />,
        cell: ({ row }) => <div>{row.getValue('doctor_name')}</div>,
    },
    {
        accessorKey: 'test_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Test Name" />,
        cell: ({ row }) => <div>{row.getValue('test_name')}</div>,
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            const getStatusBadge = (status: string) => {
                switch (status.toLowerCase()) {
                    case 'completed':
                        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
                    case 'pending':
                        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
                    case 'in_progress':
                        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
                    case 'cancelled':
                        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
                    default:
                        return <Badge variant="secondary">{status}</Badge>;
                }
            };
            return getStatusBadge(status);
        },
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Order Date" />,
        cell: ({ row }) => {
            const date = new Date(row.getValue('created_at'));
            return <div>{date.toLocaleDateString()}</div>;
        },
    },
    {
        accessorKey: 'result_date',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Result Date" />,
        cell: ({ row }) => {
            const date = row.getValue('result_date') as string;
            return <div>{date ? new Date(date).toLocaleDateString() : 'N/A'}</div>;
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const labOrder = row.original;

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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(labOrder.id.toString())}>Copy order ID</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View order details</DropdownMenuItem>
                        <DropdownMenuItem>View test results</DropdownMenuItem>
                        <DropdownMenuItem>Update status</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function LaboratoryReports({ labOrders, summary }: LaboratoryReportsProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
        try {
            setIsExporting(true);
            const params = new URLSearchParams({
                format,
                date_from: dateFrom,
                date_to: dateTo,
                status: status,
            });
            window.location.href = `/admin/reports/export?type=laboratory&${params.toString()}`;

            setTimeout(() => {
                setIsExporting(false);
            }, 2000);
        } catch (error) {
            console.error('Export failed:', error);
            setIsExporting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case 'in_progress':
                return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs as any}>
            <Head title="Laboratory Reports" />
            <div className="min-h-screen bg-white p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="mb-4 text-4xl font-semibold text-black">Laboratory Reports</h1>
                                <p className="mt-1 text-sm text-black">Lab test results and quality metrics</p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => handleExport('excel')} disabled={isExporting} variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Excel
                                </Button>
                                <Button onClick={() => handleExport('pdf')} disabled={isExporting} variant="outline">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Export PDF
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <FlaskConical className="h-5 w-5 text-blue-600" />
                                    Total Orders
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-blue-600">{summary.total_orders.toLocaleString()}</div>
                                <p className="text-sm text-gray-600">All lab orders</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                    Pending Orders
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-yellow-600">{summary.pending_orders.toLocaleString()}</div>
                                <p className="text-sm text-gray-600">Awaiting results</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    Completed Orders
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-green-600">{summary.completed_orders.toLocaleString()}</div>
                                <p className="text-sm text-gray-600">Results available</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <Calendar className="h-5 w-5 text-purple-600" />
                                    Completion Rate
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-purple-600">
                                    {summary.total_orders > 0 ? Math.round((summary.completed_orders / summary.total_orders) * 100) : 0}%
                                </div>
                                <p className="text-sm text-gray-600">Success rate</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Lab Orders Data Table */}
                    <Card className="rounded-xl border-0 bg-white shadow-lg">
                        <CardHeader className="border-b border-gray-200 bg-white">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                <FileText className="h-5 w-5 text-black" />
                                Laboratory Orders
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <DataTable columns={columns} data={labOrders.data} searchKey="patient_name" searchPlaceholder="Search patients..." />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

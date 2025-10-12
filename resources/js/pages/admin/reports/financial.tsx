import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format as formatDate } from 'date-fns';
import { Calendar as CalendarIcon, DollarSign, Download, FileText, MoreHorizontal, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

interface Transaction {
    id: number;
    patient_name: string;
    doctor_name: string;
    total_amount: number;
    payment_method: string;
    transaction_date: string;
    status: string;
}

interface Summary {
    total_revenue: number;
    total_transactions: number;
    average_transaction: number;
    date_from: string;
    date_to: string;
}

interface FinancialReportsProps {
    transactions: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    summary: Summary;
    chartData?: {
        monthly_revenue: Array<{ month: string; revenue: number }>;
        payment_methods: Array<{ payment_method: string; count: number; amount: number }>;
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

const breadcrumbs = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Reports', href: '/admin/reports' },
    { label: 'Financial Reports', href: '/admin/reports/financial' },
];

// Column definitions for the data table
const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Transaction ID" />,
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
        accessorKey: 'total_amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('total_amount') || '0');
            const formatted = new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
            }).format(amount);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: 'payment_method',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Payment Method" />,
        cell: ({ row }) => <div>{row.getValue('payment_method')}</div>,
    },
    {
        accessorKey: 'transaction_date',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ row }) => {
            const date = new Date(row.getValue('transaction_date'));
            return <div>{date.toLocaleDateString()}</div>;
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            return <Badge variant={status === 'completed' ? 'default' : 'secondary'}>{status}</Badge>;
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const transaction = row.original;

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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(transaction.id.toString())}>
                            Copy transaction ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Edit transaction</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function FinancialReports({ transactions, summary, chartData, filterOptions, metadata }: FinancialReportsProps) {
    const [search, setSearch] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
        to: new Date(), // Today
    });

    const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
        try {
            setIsExporting(true);
            const params = new URLSearchParams({
                format,
            });

            // Add date range parameters if selected
            if (dateRange?.from) {
                params.append('date_from', formatDate(dateRange.from, 'yyyy-MM-dd'));
            }
            if (dateRange?.to) {
                params.append('date_to', formatDate(dateRange.to, 'yyyy-MM-dd'));
            }

            window.location.href = `/admin/reports/export?type=financial&${params.toString()}`;

            setTimeout(() => {
                setIsExporting(false);
            }, 2000);
        } catch (error) {
            console.error('Export failed:', error);
            setIsExporting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs as any}>
            <Head title="Financial Reports" />
            <div className="min-h-screen bg-white p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="mb-4 text-4xl font-semibold text-black">Financial Reports</h1>
                                <p className="mt-1 text-sm text-black">Revenue, expenses, and financial analytics</p>
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
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                    Total Revenue
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-green-600">{formatCurrency(summary.total_revenue)}</div>
                                <p className="text-sm text-gray-600">All transactions</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Total Transactions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-blue-600">{summary.total_transactions.toLocaleString()}</div>
                                <p className="text-sm text-gray-600">All transactions</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                    Average Transaction
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-purple-600">{formatCurrency(summary.average_transaction)}</div>
                                <p className="text-sm text-gray-600">Per transaction</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <CalendarIcon className="h-5 w-5 text-orange-600" />
                                    Date Range
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-sm font-semibold text-orange-600">
                                    {new Date(summary.date_from).toLocaleDateString()} - {new Date(summary.date_to).toLocaleDateString()}
                                </div>
                                <p className="text-sm text-gray-600">Report period</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Transactions Data Table */}
                    <Card className="rounded-xl border-0 bg-white shadow-lg">
                        <CardHeader className="border-b border-gray-200 bg-white">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                <FileText className="h-5 w-5 text-black" />
                                Financial Transactions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <DataTable columns={columns} data={transactions.data} searchKey="patient_name" searchPlaceholder="Search patients..." />
                        </CardContent>
                    </Card>

                    {/* Footer with Metadata */}
                    <Card className="mt-8">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <div>
                                    <p>
                                        <strong>Generated:</strong> {metadata?.generated_at || new Date().toLocaleString()}
                                    </p>
                                    <p>
                                        <strong>Generated By:</strong> {metadata?.generated_by || 'System'} ({metadata?.generated_by_role || 'User'})
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p>
                                        <strong>System Version:</strong> {metadata?.system_version || '1.0.0'}
                                    </p>
                                    <p>
                                        <strong>Clinic:</strong> St. James Clinic Management System
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
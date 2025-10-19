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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface FinancialOverview {
    id: string;
    date: string;
    total_transactions: number;
    total_revenue: number;
    pending_amount: number;
    cash_total: number;
    hmo_total: number;
    other_payment_total: number;
    paid_transactions: number;
    pending_transactions: number;
    cancelled_transactions: number;
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
    financialOverview: FinancialOverview[];
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

// Column definitions for the financial overview table
const overviewColumns: ColumnDef<FinancialOverview>[] = [
    {
        accessorKey: 'date',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ row }) => {
            const date = new Date(row.getValue('date'));
            return <div className="font-medium">{date.toLocaleDateString()}</div>;
        },
    },
    {
        accessorKey: 'total_transactions',
        header: ({ column }) => (
            <div className="flex justify-center">
                <DataTableColumnHeader column={column} title="Total Transactions" />
            </div>
        ),
        cell: ({ row }) => <div className="text-center font-medium">{row.getValue('total_transactions')}</div>,
    },
    {
        accessorKey: 'total_revenue',
        header: ({ column }) => (
            <div className="flex justify-center">
                <DataTableColumnHeader column={column} title="Total Revenue" />
            </div>
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('total_revenue') || '0');
            const formatted = new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
            }).format(amount);
            return <div className="text-center font-medium text-green-600">{formatted}</div>;
        },
    },
    {
        accessorKey: 'pending_amount',
        header: ({ column }) => (
            <div className="flex justify-center">
                <DataTableColumnHeader column={column} title="Pending Amount" />
            </div>
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('pending_amount') || '0');
            const formatted = new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
            }).format(amount);
            return <div className="text-center font-medium text-orange-600">{formatted}</div>;
        },
    },
    {
        accessorKey: 'cash_total',
        header: ({ column }) => (
            <div className="flex justify-center">
                <DataTableColumnHeader column={column} title="Cash Total" />
            </div>
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('cash_total') || '0');
            const formatted = new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
            }).format(amount);
            return <div className="text-center font-medium text-blue-600">{formatted}</div>;
        },
    },
    {
        accessorKey: 'hmo_total',
        header: ({ column }) => (
            <div className="flex justify-center">
                <DataTableColumnHeader column={column} title="HMO Total" />
            </div>
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('hmo_total') || '0');
            const formatted = new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
            }).format(amount);
            return <div className="text-center font-medium text-purple-600">{formatted}</div>;
        },
    },
];

// Column definitions for the transactions data table
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
        header: ({ column }) => (
            <div className="flex justify-center">
                <DataTableColumnHeader column={column} title="Amount" />
            </div>
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('total_amount') || '0');
            const formatted = new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
            }).format(amount);
            return <div className="text-center font-medium">{formatted}</div>;
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

export default function FinancialReports({ transactions, summary, financialOverview, chartData, filterOptions, metadata }: FinancialReportsProps) {
    // Safety check for transactions data
    const transactionsData = transactions?.data || [];
    
    // Debug logging
    console.log('Financial Reports Props:', {
        transactions: transactions,
        summary: summary,
        financialOverview: financialOverview,
        chartData: chartData
    });
    
    // Additional safety check for the DataTable
    if (!Array.isArray(transactionsData)) {
        console.warn('Transactions data is not an array:', transactionsData);
    }
    const [search, setSearch] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
        to: new Date(), // Today
    });
    const [activeFilter, setActiveFilter] = useState('monthly');

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

                    {/* Filter Section */}
                    <div className="mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5" />
                                    Report Filters
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Period</label>
                                        <Select 
                                            value={activeFilter} 
                                            onValueChange={(value) => {
                                                setActiveFilter(value);
                                                const today = new Date();
                                                
                                                switch (value) {
                                                    case 'daily':
                                                        setDateRange({
                                                            from: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                                                            to: new Date(today.getFullYear(), today.getMonth(), today.getDate())
                                                        });
                                                        break;
                                                    case 'monthly':
                                                        setDateRange({
                                                            from: new Date(today.getFullYear(), today.getMonth(), 1),
                                                            to: new Date(today.getFullYear(), today.getMonth() + 1, 0)
                                                        });
                                                        break;
                                                    case 'yearly':
                                                        setDateRange({
                                                            from: new Date(today.getFullYear(), 0, 1),
                                                            to: new Date(today.getFullYear(), 11, 31)
                                                        });
                                                        break;
                                                    case 'custom':
                                                        // Keep current date range
                                                        break;
                                                }
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select period" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">Daily</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                                <SelectItem value="yearly">Yearly</SelectItem>
                                                <SelectItem value="custom">Custom Range</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">From Date</label>
                                        <Input
                                            type="date"
                                            value={dateRange?.from ? formatDate(dateRange.from, 'yyyy-MM-dd') : ''}
                                            onChange={(e) => {
                                                const newDate = e.target.value ? new Date(e.target.value) : undefined;
                                                setDateRange(prev => ({
                                                    from: newDate,
                                                    to: prev?.to
                                                }));
                                            }}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">To Date</label>
                                        <Input
                                            type="date"
                                            value={dateRange?.to ? formatDate(dateRange.to, 'yyyy-MM-dd') : ''}
                                            onChange={(e) => {
                                                const newDate = e.target.value ? new Date(e.target.value) : undefined;
                                                setDateRange(prev => ({
                                                    from: prev?.from,
                                                    to: newDate
                                                }));
                                            }}
                                        />
                                    </div>
                                    
                                    <div className="flex items-end gap-2">
                                        <Button
                                            onClick={() => {
                                                // Reload page with new date range
                                                const params = new URLSearchParams();
                                                if (dateRange?.from) {
                                                    params.append('date_from', formatDate(dateRange.from, 'yyyy-MM-dd'));
                                                }
                                                if (dateRange?.to) {
                                                    params.append('date_to', formatDate(dateRange.to, 'yyyy-MM-dd'));
                                                }
                                                window.location.href = `/admin/reports/financial?${params.toString()}`;
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            Apply Filter
                                        </Button>
                                        
                                        <Button
                                            onClick={() => {
                                                setActiveFilter('monthly');
                                                setDateRange({
                                                    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                                                    to: new Date()
                                                });
                                                window.location.href = '/admin/reports/financial';
                                            }}
                                            variant="outline"
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                </div>
                                
                                {/* Current Filter Status */}
                                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                                    <span className="font-medium">Current View:</span>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        {activeFilter === 'daily' && 'Today'}
                                        {activeFilter === 'monthly' && 'This Month'}
                                        {activeFilter === 'yearly' && 'This Year'}
                                        {activeFilter === 'custom' && 'Custom Range'}
                                    </Badge>
                                    {dateRange?.from && dateRange?.to && (
                                        <span className="text-gray-500">
                                            ({formatDate(dateRange.from, 'MMM dd, yyyy')} - {formatDate(dateRange.to, 'MMM dd, yyyy')})
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    </div>

                    {/* Financial Overview Table */}
                    <Card className="mb-8 rounded-xl border-0 bg-white shadow-lg">
                        <CardHeader className="border-b border-gray-200 bg-white">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                Financial Overview
                            </CardTitle>
                            <p className="text-sm text-gray-600">Daily aggregated financial data</p>
                        </CardHeader>
                        <CardContent className="p-6">
                            {(!financialOverview || financialOverview.length === 0) ? (
                                <div className="text-center py-8">
                                    <TrendingUp className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                    <h3 className="mb-2 text-lg font-semibold text-gray-600">No Financial Data</h3>
                                    <p className="text-gray-500 mb-4">No financial overview data available for the selected period.</p>
                                    <div className="mb-4 p-4 bg-gray-100 rounded-lg text-left">
                                        <h4 className="font-semibold mb-2">Debug Information:</h4>
                                        <p className="text-sm text-gray-600">Financial Overview: {financialOverview ? financialOverview.length : 'undefined'}</p>
                                        <p className="text-sm text-gray-600">Type: {typeof financialOverview}</p>
                                        <p className="text-sm text-gray-600">Data: {JSON.stringify(financialOverview)}</p>
                                    </div>
                                    <Button 
                                        onClick={() => window.location.reload()} 
                                        variant="outline"
                                        className="mr-2"
                                    >
                                        Refresh Data
                                    </Button>
                                    <Button 
                                        onClick={() => {
                                            // Trigger sync command
                                            fetch('/admin/reports/financial/sync', { method: 'POST' })
                                                .then(() => window.location.reload());
                                        }} 
                                        variant="default"
                                    >
                                        Sync Data
                                    </Button>
                                    <Button 
                                        onClick={() => {
                                            // Check debug endpoint
                                            window.open('/admin/reports/financial/debug', '_blank');
                                        }} 
                                        variant="outline"
                                        className="ml-2"
                                    >
                                        Debug Data
                                    </Button>
                                </div>
                            ) : (
                                <DataTable 
                                    columns={overviewColumns} 
                                    data={financialOverview || []} 
                                    searchKey="date" 
                                    searchPlaceholder="Search by date..." 
                                />
                            )}
                        </CardContent>
                    </Card>

                    {/* Transactions Data Table */}
                    <Card className="rounded-xl border-0 bg-white shadow-lg">
                        <CardHeader className="border-b border-gray-200 bg-white">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                <FileText className="h-5 w-5 text-black" />
                                Financial Transactions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <DataTable 
                                columns={columns} 
                                data={Array.isArray(transactionsData) ? transactionsData : []} 
                                searchKey="patient_name" 
                                searchPlaceholder="Search patients..." 
                            />
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
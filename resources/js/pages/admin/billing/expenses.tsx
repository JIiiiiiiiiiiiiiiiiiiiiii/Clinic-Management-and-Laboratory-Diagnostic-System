import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { 
    ArrowLeft, 
    Plus, 
    Search, 
    FileText,
    DollarSign,
    TrendingUp,
    Calendar,
    Filter,
    Edit,
    Eye,
    Trash2,
    MoreHorizontal,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { useState } from 'react';

type Expense = {
    id: number;
    expense_category: string;
    expense_name: string;
    description: string | null;
    amount: number;
    expense_date: string;
    payment_method: 'cash' | 'card' | 'bank_transfer' | 'check';
    payment_reference: string | null;
    vendor_name: string | null;
    vendor_contact: string | null;
    receipt_number: string | null;
    status: 'draft' | 'pending' | 'approved' | 'cancelled';
    notes: string | null;
    created_at: string;
    createdBy: {
        id: number;
        name: string;
    };
};

type Summary = {
    total_expenses: number;
    pending_amount: number;
    total_count: number;
    approved_count: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Expenses', href: '/admin/billing/expenses' },
];

const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-500', icon: Clock },
    pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
    approved: { label: 'Approved', color: 'bg-green-500', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
};

const categoryConfig = {
    office_supplies: { label: 'Office Supplies', color: 'bg-blue-100 text-blue-800' },
    medical_supplies: { label: 'Medical Supplies', color: 'bg-green-100 text-green-800' },
    equipment: { label: 'Equipment', color: 'bg-purple-100 text-purple-800' },
    utilities: { label: 'Utilities', color: 'bg-yellow-100 text-yellow-800' },
    rent: { label: 'Rent', color: 'bg-red-100 text-red-800' },
    maintenance: { label: 'Maintenance', color: 'bg-orange-100 text-orange-800' },
    marketing: { label: 'Marketing', color: 'bg-pink-100 text-pink-800' },
    other: { label: 'Other', color: 'bg-gray-100 text-gray-800' },
};

const paymentMethodConfig = {
    cash: { label: 'Cash', color: 'bg-green-100 text-green-800' },
    card: { label: 'Card', color: 'bg-blue-100 text-blue-800' },
    bank_transfer: { label: 'Bank Transfer', color: 'bg-purple-100 text-purple-800' },
    check: { label: 'Check', color: 'bg-yellow-100 text-yellow-800' },
};

export default function ExpensesIndex({ 
    expenses, 
    summary, 
    filters 
}: { 
    expenses: any;
    summary: Summary;
    filters: any;
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState(filters.payment_method || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const filteredExpenses = expenses.data.filter((expense: Expense) => {
        const search = searchTerm.toLowerCase();
        
        const matchesSearch = expense.expense_name.toLowerCase().includes(search) || 
                            expense.vendor_name?.toLowerCase().includes(search) || 
                            expense.receipt_number?.toLowerCase().includes(search) || '';
        
        const matchesCategory = categoryFilter === 'all' || expense.expense_category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
        const matchesPaymentMethod = paymentMethodFilter === 'all' || expense.payment_method === paymentMethodFilter;
        
        return matchesSearch && matchesCategory && matchesStatus && matchesPaymentMethod;
    });

    const getStatusBadge = (status: keyof typeof statusConfig) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        
        const variantMap = {
            draft: 'secondary',
            pending: 'warning',
            approved: 'success',
            cancelled: 'destructive'
        };
        
        return (
            <Badge variant={variantMap[status] as any}>
                <Icon className="mr-1 h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getCategoryBadge = (category: keyof typeof categoryConfig) => {
        const config = categoryConfig[category];
        return (
            <Badge className={config.color}>
                {config.label}
            </Badge>
        );
    };

    const getPaymentMethodBadge = (method: keyof typeof paymentMethodConfig) => {
        const config = paymentMethodConfig[method];
        return (
            <Badge className={config.color}>
                {config.label}
            </Badge>
        );
    };

    const handleFilter = () => {
        router.get('/admin/billing/expenses', {
            search: searchTerm,
            category: categoryFilter,
            status: statusFilter,
            payment_method: paymentMethodFilter,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusUpdate = (expenseId: number, newStatus: string) => {
        router.put(
            `/admin/billing/expenses/${expenseId}/status`,
            { status: newStatus },
            {
                onError: (errors) => {
                    console.error('Status update failed:', errors);
                },
            },
        );
    };

    const handleDelete = (expenseId: number) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            router.delete(`/admin/billing/expenses/${expenseId}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Expenses" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button asChild variant="outline" className="h-12 w-12">
                                <Link href="/admin/billing">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <Heading title="Expenses" description="Track and manage clinic expenses" icon={FileText} />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4 w-52 h-20 flex items-center overflow-hidden">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <DollarSign className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900 whitespace-nowrap leading-tight">₱{summary.total_expenses.toLocaleString()}</div>
                                        <div className="text-gray-600 text-sm font-medium whitespace-nowrap">Total Expenses</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4 w-52 h-20 flex items-center overflow-hidden">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900 whitespace-nowrap leading-tight">{summary.approved_count}</div>
                                        <div className="text-gray-600 text-sm font-medium whitespace-nowrap">Approved</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expenses Section */}
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <FileText className="h-6 w-6 text-black" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold text-gray-900">Expense Records</CardTitle>
                                <p className="text-sm text-gray-500 mt-1">Track and manage clinic expenses and costs</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button asChild>
                                            <Link href="/admin/billing/expenses/create">
                                                <Plus className="mr-2 h-5 w-5" />
                                                New Expense
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Create New Expense</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {/* Filters */}
                        <div className="mb-6">
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search expenses..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                    />
                                </div>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="h-12 px-4 border border-gray-200 rounded-xl focus:border-gray-500 focus:ring-gray-500"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="office_supplies">Office Supplies</option>
                                    <option value="medical_supplies">Medical Supplies</option>
                                    <option value="equipment">Equipment</option>
                                    <option value="utilities">Utilities</option>
                                    <option value="rent">Rent</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="other">Other</option>
                                </select>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="h-12 px-4 border border-gray-200 rounded-xl focus:border-gray-500 focus:ring-gray-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="draft">Draft</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <select
                                    value={paymentMethodFilter}
                                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                                    className="h-12 px-4 border border-gray-200 rounded-xl focus:border-gray-500 focus:ring-gray-500"
                                >
                                    <option value="all">All Payment Methods</option>
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="check">Check</option>
                                </select>
                                <Button onClick={handleFilter} className="h-12 px-6">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Apply Filters
                                </Button>
                            </div>
                        </div>

                        {/* Expenses Table */}
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="hover:bg-gray-50">
                                        <TableHead className="font-semibold text-gray-700">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                Expense
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700">Category</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Payment Method</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Date</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredExpenses.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                <div className="flex flex-col items-center">
                                                    <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                    <h3 className="mb-2 text-lg font-semibold text-gray-600">{searchTerm ? 'No expenses found' : 'No expenses yet'}</h3>
                                                    <p className="text-gray-500">
                                                        {searchTerm ? 'Try adjusting your search terms' : 'Create your first expense to get started'}
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredExpenses.map((expense: Expense) => (
                                            <TableRow key={expense.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1 bg-gray-100 rounded-full">
                                                            <FileText className="h-4 w-4 text-black" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{expense.expense_name}</div>
                                                            {expense.vendor_name && (
                                                                <div className="text-sm text-gray-500">{expense.vendor_name}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getCategoryBadge(expense.expense_category)}
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    ₱{expense.amount.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {getPaymentMethodBadge(expense.payment_method)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(expense.status)}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    {new Date(expense.expense_date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button asChild size="sm">
                                                            <Link href={`/admin/billing/expenses/${expense.id}`}>
                                                                <Eye className="mr-1 h-3 w-3" />
                                                                View
                                                            </Link>
                                                        </Button>
                                                        {expense.status === 'pending' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleStatusUpdate(expense.id, 'approved')}
                                                            >
                                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                                Approve
                                                            </Button>
                                                        )}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button size="sm" variant="outline">
                                                                    <MoreHorizontal className="h-3 w-3" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/admin/billing/expenses/${expense.id}/edit`}>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    onClick={() => handleDelete(expense.id)}
                                                                    className="text-red-600"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}




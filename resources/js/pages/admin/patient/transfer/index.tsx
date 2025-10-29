import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    ArrowRightLeft, 
    Calendar, 
    Clock, 
    Eye, 
    Filter, 
    Plus, 
    Search, 
    User, 
    AlertCircle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { useState } from 'react';

interface PatientTransfer {
    id: number;
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        patient_no: string;
    };
    transfer_reason: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'completed' | 'cancelled';
    notes: string | null;
    transferred_by: {
        id: number;
        name: string;
    };
    accepted_by: {
        id: number;
        name: string;
    } | null;
    transfer_date: string;
    completion_date: string | null;
    created_at: string;
    updated_at: string;
}

interface FilterOptions {
    statuses: string[];
    priorities: string[];
}

interface Props {
    transfers: {
        data: PatientTransfer[];
        links: any[];
        meta: any;
    };
    filterOptions: FilterOptions;
    filters: {
        status?: string;
        priority?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
    };
}

const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
};

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

const statusIcons = {
    pending: Clock,
    completed: CheckCircle,
    cancelled: XCircle,
};

export default function PatientTransferIndex({ transfers, filterOptions, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [priorityFilter, setPriorityFilter] = useState(filters.priority || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Patient Management', href: '/admin/patient' },
        { label: 'Patient Transfers', href: '/admin/patient/transfer' },
    ];

    const handleFilter = () => {
        const params = new URLSearchParams();
        
        if (searchTerm) params.set('search', searchTerm);
        if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
        if (priorityFilter && priorityFilter !== 'all') params.set('priority', priorityFilter);
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);

        router.get('/admin/patient-transfers', Object.fromEntries(params));
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setPriorityFilter('all');
        setDateFrom('');
        setDateTo('');
        router.get('/admin/patient-transfers');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patient Transfers" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Patient Transfers</h1>
                        <p className="text-gray-600 mt-1">
                            Manage patient transfers between hospital and clinic
                        </p>
                    </div>
                    <Link
                        href="/admin/patient-transfers/create"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Transfer
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search patients..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {filterOptions.statuses.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Priorities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    {filterOptions.priorities.map((priority) => (
                                        <SelectItem key={priority} value={priority}>
                                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                type="date"
                                placeholder="From Date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />

                            <Input
                                type="date"
                                placeholder="To Date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 mt-4">
                            <Button onClick={handleFilter} className="bg-blue-600 hover:bg-blue-700">
                                Apply Filters
                            </Button>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Transfers Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Patient Transfers</CardTitle>
                        <CardDescription>
                            Manage patient transfers between hospital and clinic
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transfers.data.length === 0 ? (
                            <div className="text-center py-8">
                                <ArrowRightLeft className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No transfers found</h3>
                                <p className="text-gray-600 mb-4">
                                    {Object.values(filters).some(f => f) 
                                        ? 'Try adjusting your filters to see more results.'
                                        : 'Get started by creating a new patient transfer.'
                                    }
                                </p>
                                <Link
                                    href="/admin/patient-transfers/create"
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    New Transfer
                                </Link>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Transfer Reason</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Transfer Date</TableHead>
                                        <TableHead>Transferred By</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transfers.data.map((transfer) => {
                                        const StatusIcon = statusIcons[transfer.status];
                                        return (
                                            <TableRow key={transfer.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">
                                                            {transfer.patient.first_name} {transfer.patient.last_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {transfer.patient.patient_no}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-xs truncate">
                                                        {transfer.transfer_reason}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={priorityColors[transfer.priority]}>
                                                        {transfer.priority}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <StatusIcon className="w-4 h-4" />
                                                        <Badge className={statusColors[transfer.status]}>
                                                            {transfer.status}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(transfer.transfer_date).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                        {transfer.transferred_by.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/admin/patient-transfers/${transfer.id}`}
                                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            View
                                                        </Link>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

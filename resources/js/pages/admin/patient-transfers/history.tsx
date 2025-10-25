import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Calendar, User, Clock, CheckCircle, XCircle, FileText, 
    ArrowLeft, Search, Filter, RefreshCw, History, Users, 
    Activity, TrendingUp, BarChart3, PieChart, LineChart,
    ArrowUpDown, ChevronDown, Eye, CalendarDays
} from 'lucide-react';
import { format } from 'date-fns';

interface TransferHistory {
    id: number;
    action: 'created' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
    action_by_role: string;
    action_by_user: {
        id: number;
        name: string;
        role: string;
    };
    notes?: string;
    action_date: string;
    patient: {
        id: number;
        first_name: string;
        last_name: string;
    };
    transfer: {
        id: number;
        registration_type: 'admin' | 'hospital';
        approval_status: string;
    };
}

interface Props {
    history: {
        data: TransferHistory[];
        links: any[];
        meta: any;
    };
    filters: {
        action?: string;
        role?: string;
        date_from?: string;
        date_to?: string;
        year?: string;
        month?: string;
    };
    statistics?: {
        total_actions: number;
        created_count: number;
        approved_count: number;
        rejected_count: number;
    };
}

export default function PatientTransferHistory({ history, filters, statistics }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState(filters.action || 'all');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [sortBy, setSortBy] = useState<string>('action_date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'created':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200"><FileText className="w-3 h-3 mr-1" />Created</Badge>;
            case 'accepted':
                return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            case 'cancelled':
                return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
            case 'completed':
                return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
            default:
                return <Badge variant="outline">{action}</Badge>;
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Admin</Badge>;
            case 'hospital_admin':
                return <Badge variant="default" className="bg-purple-100 text-purple-800">Hospital Admin</Badge>;
            case 'hospital_staff':
                return <Badge variant="outline" className="bg-green-100 text-green-800">Hospital Staff</Badge>;
            default:
                return <Badge variant="outline">{role}</Badge>;
        }
    };

    // Filter and search logic
    const filteredHistory = (history.data || []).filter(item => {
        if (!item || typeof item !== 'object') return false;
        
        // Search filter
        const searchMatch = searchTerm === '' || 
            `${item.patient?.first_name || ''} ${item.patient?.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.action_by_user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.notes?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Action filter
        const actionMatch = actionFilter === 'all' || item.action === actionFilter;
        
        // Role filter
        const roleMatch = roleFilter === 'all' || item.action_by_role === roleFilter;
        
        // Date filter
        const dateMatch = (!dateFrom || new Date(item.action_date) >= new Date(dateFrom)) &&
                         (!dateTo || new Date(item.action_date) <= new Date(dateTo));
        
        return searchMatch && actionMatch && roleMatch && dateMatch;
    });

    // Sort logic
    const sortedHistory = [...filteredHistory].sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
            case 'patient_name':
                aValue = `${a.patient?.first_name || ''} ${a.patient?.last_name || ''}`.toLowerCase();
                bValue = `${b.patient?.first_name || ''} ${b.patient?.last_name || ''}`.toLowerCase();
                break;
            case 'action_by':
                aValue = a.action_by_user?.name?.toLowerCase() || '';
                bValue = b.action_by_user?.name?.toLowerCase() || '';
                break;
            case 'action':
                aValue = a.action;
                bValue = b.action;
                break;
            case 'action_date':
            default:
                aValue = new Date(a.action_date).getTime();
                bValue = new Date(b.action_date).getTime();
                break;
        }
        
        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const applyFilters = () => {
        router.get(route('admin.patient.transfer.history'), {
            action: actionFilter,
            role: roleFilter,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        setSearchTerm('');
        setActionFilter('all');
        setRoleFilter('all');
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.patient.transfer.history'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Patient Transfer History" />

            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Patient Transfer History</h2>
                        <p className="text-sm text-gray-600">Complete history of all patient transfer actions</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('admin.patient.transfer.registrations.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Transfers
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-full mx-auto">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Actions</p>
                                        <p className="text-3xl font-bold text-gray-900">{statistics?.total_actions || history.data?.length || 0}</p>
                                        <p className="text-sm text-gray-500">All recorded actions</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <History className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Created</p>
                                        <p className="text-3xl font-bold text-gray-900">{statistics?.created_count || 0}</p>
                                        <p className="text-sm text-gray-500">New registrations</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <FileText className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Approved</p>
                                        <p className="text-3xl font-bold text-gray-900">{statistics?.approved_count || 0}</p>
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
                                        <p className="text-3xl font-bold text-gray-900">{statistics?.rejected_count || 0}</p>
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
                            <div className="flex items-center justify-between py-4 mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            placeholder="Search history..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 w-64"
                                        />
                                    </div>
                                    
                                    <Select value={actionFilter} onValueChange={setActionFilter}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="Action" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Actions</SelectItem>
                                            <SelectItem value="created">Created</SelectItem>
                                            <SelectItem value="accepted">Approved</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Roles</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="hospital_admin">Hospital Admin</SelectItem>
                                            <SelectItem value="hospital_staff">Hospital Staff</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="date"
                                            placeholder="From"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            className="w-40"
                                        />
                                        <Input
                                            type="date"
                                            placeholder="To"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                            className="w-40"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={applyFilters}
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        Apply
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={resetFilters}
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Reset
                                    </Button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setSortBy('patient_name');
                                                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                                    }}
                                                    className="h-8 px-2 lg:px-3"
                                                >
                                                    Patient
                                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                                </Button>
                                            </TableHead>
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setSortBy('action');
                                                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                                    }}
                                                    className="h-8 px-2 lg:px-3"
                                                >
                                                    Action
                                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                                </Button>
                                            </TableHead>
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setSortBy('action_by');
                                                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                                    }}
                                                    className="h-8 px-2 lg:px-3"
                                                >
                                                    Action By
                                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                                </Button>
                                            </TableHead>
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setSortBy('action_date');
                                                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                                    }}
                                                    className="h-8 px-2 lg:px-3"
                                                >
                                                    Date
                                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                                </Button>
                                            </TableHead>
                                            <TableHead>Notes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedHistory && sortedHistory.length > 0 ? sortedHistory.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-gray-500" />
                                                        <div>
                                                            <div className="font-medium">
                                                                {item.patient?.first_name || 'N/A'} {item.patient?.last_name || 'N/A'}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {item.transfer?.registration_type === 'hospital' ? 'Hospital Registration' : 'Admin Registration'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getActionBadge(item.action)}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{item.action_by_user?.name || 'N/A'}</div>
                                                        <div className="text-sm text-gray-500">{getRoleBadge(item.action_by_role)}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        <Calendar className="w-3 h-3" />
                                                        {format(new Date(item.action_date), 'MMM dd, yyyy HH:mm')}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-600 max-w-xs truncate">
                                                        {item.notes || 'No notes'}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                                    No transfer history found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Results Summary */}
                            <div className="mt-4 text-sm text-gray-500">
                                Showing {sortedHistory.length} of {history.data?.length || 0} history record(s)
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
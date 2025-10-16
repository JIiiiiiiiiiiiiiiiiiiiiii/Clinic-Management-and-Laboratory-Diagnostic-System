import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, Filter, Search, Stethoscope, Edit, Eye, UserCheck, CalendarDays, Users, X, Save, Trash2, Plus, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Visits', href: '/admin/visits' },
];

interface VisitsIndexProps {
    initial_visits: any[];
    follow_up_visits: any[];
    initial_visits_pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    follow_up_visits_pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        visit_type?: string;
        date_from?: string;
        date_to?: string;
        staff_id?: string;
        sort_by?: string;
        sort_dir?: string;
    };
    staff: any[];
    status_options: Record<string, string>;
    visit_type_options: Record<string, string>;
}

export default function VisitsIndex({ 
    initial_visits, 
    follow_up_visits,
    initial_visits_pagination,
    follow_up_visits_pagination,
    filters, 
    staff, 
    status_options, 
    visit_type_options 
}: VisitsIndexProps) {
    const { hasPermission } = useRoleAccess();
    
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || undefined);
    const [visitTypeFilter, setVisitTypeFilter] = useState(filters.visit_type || undefined);
    const [dateFromFilter, setDateFromFilter] = useState(filters.date_from || '');
    const [dateToFilter, setDateToFilter] = useState(filters.date_to || '');
    const [staffFilter, setStaffFilter] = useState(filters.staff_id || undefined);
    const [sortBy, setSortBy] = useState(filters.sort_by || 'visit_date_time');
    const [sortDir, setSortDir] = useState(filters.sort_dir || 'desc');

    const handleSearch = () => {
        router.get('/admin/visits', {
            search: searchTerm,
            status: statusFilter || '',
            visit_type: visitTypeFilter || '',
            date_from: dateFromFilter,
            date_to: dateToFilter,
            staff_id: staffFilter || '',
            sort_by: sortBy,
            sort_dir: sortDir,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSort = (field: string) => {
        const newSortDir = sortBy === field && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(field);
        setSortDir(newSortDir);
        
        router.get('/admin/visits', {
            ...filters,
            sort_by: field,
            sort_dir: newSortDir,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const formatDateTime = (dateTime: string) => {
        return new Date(dateTime).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        const colors = {
            scheduled: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getVisitTypeColor = (type: string) => {
        const colors = {
            initial: 'bg-blue-100 text-blue-800',
            follow_up: 'bg-green-100 text-green-800',
            lab_result_review: 'bg-purple-100 text-purple-800',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Visits Management" />
            
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="@container/main flex flex-1 flex-col gap-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Stethoscope className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Visits Management</h1>
                                <p className="text-sm text-gray-600 mt-1">Manage patient visits and follow-up consultations</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/admin/appointments">
                                <Button variant="outline" size="sm">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    View Appointments
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Visits</p>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {initial_visits_pagination.total + follow_up_visits_pagination.total}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Calendar className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Initial Visits</p>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {initial_visits_pagination.total}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <UserCheck className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Follow-up Visits</p>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {follow_up_visits_pagination.total}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <ArrowRight className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Completed Today</p>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {initial_visits.filter(v => v.status === 'completed' && new Date(v.visit_date_time).toDateString() === new Date().toDateString()).length + 
                                             follow_up_visits.filter(v => v.status === 'completed' && new Date(v.visit_date_time).toDateString() === new Date().toDateString()).length}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="holographic-card shadow-lg overflow-hidden rounded-xl bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white/80 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <Filter className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-900">Filters</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                        <div className="space-y-6">
                            {/* First Row - Search and Basic Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            placeholder="Search patients..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <Select value={statusFilter || ''} onValueChange={(value) => setStatusFilter(value || undefined)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(status_options).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Visit Type</label>
                                    <Select value={visitTypeFilter || ''} onValueChange={(value) => setVisitTypeFilter(value || undefined)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(visit_type_options).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Staff</label>
                                    <Select value={staffFilter || ''} onValueChange={(value) => setStaffFilter(value || undefined)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Staff" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {staff.map((member) => (
                                                <SelectItem key={member.id} value={member.id.toString()}>
                                                    {member.name} ({member.role})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Second Row - Date Range Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Date From</label>
                                    <Input
                                        type="date"
                                        value={dateFromFilter}
                                        onChange={(e) => setDateFromFilter(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Date To</label>
                                    <Input
                                        type="date"
                                        value={dateToFilter}
                                        onChange={(e) => setDateToFilter(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-end">
                                    <Button onClick={handleSearch} className="w-full">
                                        <Search className="h-4 w-4 mr-2" />
                                        Search
                                    </Button>
                                </div>

                                <div className="flex items-end">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => {
                                            setSearchTerm('');
                                            setStatusFilter(undefined);
                                            setVisitTypeFilter(undefined);
                                            setDateFromFilter('');
                                            setDateToFilter('');
                                            setStaffFilter(undefined);
                                            router.get('/admin/visits');
                                        }}
                                        className="w-full"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                    {/* Initial Visits Table */}
                    <Card className="holographic-card shadow-lg overflow-hidden rounded-xl bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white/80 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-900">Initial Visits</CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">Primary patient visits and consultations</p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                {initial_visits_pagination.total} total
                            </div>
                        </CardHeader>
                        <CardContent>
                        <div className="overflow-x-auto">
                            <Table className="min-w-full">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="whitespace-nowrap">Date & Time</TableHead>
                                        <TableHead className="whitespace-nowrap">Patient</TableHead>
                                        <TableHead className="whitespace-nowrap">Purpose</TableHead>
                                        <TableHead className="whitespace-nowrap">Staff</TableHead>
                                        <TableHead className="whitespace-nowrap">Status</TableHead>
                                        <TableHead className="whitespace-nowrap">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {initial_visits.map((visit) => (
                                        <TableRow key={visit.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium py-4">
                                                <div className="text-sm">
                                                    {formatDateTime(visit.visit_date_time)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="space-y-1">
                                                    <div className="font-medium text-sm">{visit.patient?.first_name} {visit.patient?.last_name}</div>
                                                    <div className="text-xs text-gray-500">{visit.patient?.sequence_number || visit.patient?.patient_no}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="text-sm max-w-[200px] truncate" title={visit.purpose}>
                                                    {visit.purpose}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="space-y-1">
                                                    <div className="font-medium text-sm">{visit.attending_staff?.name}</div>
                                                    <div className="text-xs text-gray-500 capitalize">{visit.attending_staff?.role}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge className={getStatusColor(visit.status)}>
                                                    {status_options[visit.status] || visit.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => router.visit(`/admin/visits/${visit.id}`)}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Initial Visits Pagination */}
                        {initial_visits_pagination.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                <div className="text-sm text-gray-700">
                                    Showing {((initial_visits_pagination.current_page - 1) * initial_visits_pagination.per_page) + 1} to{' '}
                                    {Math.min(initial_visits_pagination.current_page * initial_visits_pagination.per_page, initial_visits_pagination.total)} of{' '}
                                    {initial_visits_pagination.total} results
                                </div>
                                <div className="flex gap-2">
                                    {initial_visits_pagination.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            onClick={() => router.get('/admin/visits', { ...filters, page: initial_visits_pagination.current_page - 1 })}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {initial_visits_pagination.current_page < initial_visits_pagination.last_page && (
                                        <Button
                                            variant="outline"
                                            onClick={() => router.get('/admin/visits', { ...filters, page: initial_visits_pagination.current_page + 1 })}
                                        >
                                            Next
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                        </CardContent>
                    </Card>

                    {/* Follow-up Visits Table */}
                    <Card className="holographic-card shadow-lg overflow-hidden rounded-xl bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white/80 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <ArrowRight className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-900">Follow-up Visits</CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">Subsequent visits and follow-up consultations</p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                {follow_up_visits_pagination.total} total
                            </div>
                        </CardHeader>
                        <CardContent>
                        <div className="overflow-x-auto">
                            <Table className="min-w-full">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="whitespace-nowrap">Date & Time</TableHead>
                                        <TableHead className="whitespace-nowrap">Patient</TableHead>
                                        <TableHead className="whitespace-nowrap">Purpose</TableHead>
                                        <TableHead className="whitespace-nowrap">Staff</TableHead>
                                        <TableHead className="whitespace-nowrap">Status</TableHead>
                                        <TableHead className="whitespace-nowrap">Original Visit</TableHead>
                                        <TableHead className="whitespace-nowrap">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {follow_up_visits.map((visit) => (
                                        <TableRow key={visit.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium py-4">
                                                <div className="text-sm">
                                                    {formatDateTime(visit.visit_date_time)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="space-y-1">
                                                    <div className="font-medium text-sm">{visit.patient?.first_name} {visit.patient?.last_name}</div>
                                                    <div className="text-xs text-gray-500">{visit.patient?.sequence_number || visit.patient?.patient_no}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="text-sm max-w-[200px] truncate" title={visit.purpose}>
                                                    {visit.purpose}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="space-y-1">
                                                    <div className="font-medium text-sm">{visit.attending_staff?.name}</div>
                                                    <div className="text-xs text-gray-500 capitalize">{visit.attending_staff?.role}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge className={getStatusColor(visit.status)}>
                                                    {status_options[visit.status] || visit.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Link 
                                                    href={`/admin/visits/${visit.follow_up_visit_id}`}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    View Original
                                                </Link>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => router.visit(`/admin/visits/${visit.id}`)}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Follow-up Visits Pagination */}
                        {follow_up_visits_pagination.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                <div className="text-sm text-gray-700">
                                    Showing {((follow_up_visits_pagination.current_page - 1) * follow_up_visits_pagination.per_page) + 1} to{' '}
                                    {Math.min(follow_up_visits_pagination.current_page * follow_up_visits_pagination.per_page, follow_up_visits_pagination.total)} of{' '}
                                    {follow_up_visits_pagination.total} results
                                </div>
                                <div className="flex gap-2">
                                    {follow_up_visits_pagination.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            onClick={() => router.get('/admin/visits', { ...filters, page: follow_up_visits_pagination.current_page - 1 })}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {follow_up_visits_pagination.current_page < follow_up_visits_pagination.last_page && (
                                        <Button
                                            variant="outline"
                                            onClick={() => router.get('/admin/visits', { ...filters, page: follow_up_visits_pagination.current_page + 1 })}
                                        >
                                            Next
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

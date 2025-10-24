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
import { Calendar, User, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
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
}

export default function TransferHistory({ history, filters }: Props) {
    const [localFilters, setLocalFilters] = useState({
        action: filters.action || '',
        role: filters.role || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        year: filters.year || new Date().getFullYear().toString(),
        month: filters.month || '',
    });

    const applyFilters = () => {
        router.get(route('admin.patient.transfer.history'), localFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setLocalFilters({
            action: '',
            role: '',
            date_from: '',
            date_to: '',
            year: new Date().getFullYear().toString(),
            month: '',
        });
        router.get(route('admin.patient.transfer.history'));
    };

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'created':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800"><FileText className="w-3 h-3 mr-1" />Created</Badge>;
            case 'accepted':
                return <Badge variant="outline" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            case 'completed':
                return <Badge variant="outline" className="bg-purple-100 text-purple-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
            case 'cancelled':
                return <Badge variant="outline" className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
            default:
                return <Badge variant="outline">{action}</Badge>;
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <Badge variant="secondary">Admin</Badge>;
            case 'hospital_admin':
                return <Badge variant="default">Hospital Admin</Badge>;
            case 'hospital_staff':
                return <Badge variant="outline">Hospital Staff</Badge>;
            default:
                return <Badge variant="outline">{role}</Badge>;
        }
    };

    const getRegistrationTypeBadge = (type: string) => {
        switch (type) {
            case 'admin':
                return <Badge variant="secondary">Admin Registration</Badge>;
            case 'hospital':
                return <Badge variant="default">Hospital Registration</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    return (
        <AppLayout
            title="Transfer History"
            renderHeader={() => (
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Patient Transfer History</h2>
                        <p className="text-sm text-gray-600">
                            View all patient transfer activities and approvals
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={route('admin.patient.transfer.registrations.index')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                            Back to Registrations
                        </Link>
                    </div>
                </div>
            )}
        >
            <Head title="Transfer History" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Filters */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Filter History</CardTitle>
                            <CardDescription>Filter transfer history by various criteria</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="action">Action</Label>
                                    <Select value={localFilters.action} onValueChange={(value) => setLocalFilters({...localFilters, action: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Actions" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Actions</SelectItem>
                                            <SelectItem value="created">Created</SelectItem>
                                            <SelectItem value="accepted">Accepted</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="role">Role</Label>
                                    <Select value={localFilters.role} onValueChange={(value) => setLocalFilters({...localFilters, role: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Roles" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Roles</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="hospital_admin">Hospital Admin</SelectItem>
                                            <SelectItem value="hospital_staff">Hospital Staff</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="year">Year</Label>
                                    <Select value={localFilters.year} onValueChange={(value) => setLocalFilters({...localFilters, year: value})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({length: 5}, (_, i) => new Date().getFullYear() - i).map(year => (
                                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="month">Month</Label>
                                    <Select value={localFilters.month} onValueChange={(value) => setLocalFilters({...localFilters, month: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Months" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Months</SelectItem>
                                            {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                                                <SelectItem key={month} value={month.toString()}>
                                                    {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="date_from">Date From</Label>
                                    <Input
                                        id="date_from"
                                        type="date"
                                        value={localFilters.date_from}
                                        onChange={(e) => setLocalFilters({...localFilters, date_from: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="date_to">Date To</Label>
                                    <Input
                                        id="date_to"
                                        type="date"
                                        value={localFilters.date_to}
                                        onChange={(e) => setLocalFilters({...localFilters, date_to: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700">
                                    Apply Filters
                                </Button>
                                <Button onClick={clearFilters} variant="outline">
                                    Clear Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* History Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Transfer History</CardTitle>
                            <CardDescription>
                                {history.data.length} record(s) found
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Patient</TableHead>
                                            <TableHead>Action</TableHead>
                                            <TableHead>Performed By</TableHead>
                                            <TableHead>Registration Type</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Notes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {history.data.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-gray-500" />
                                                        <div>
                                                            <div className="font-medium">
                                                                {record.patient.first_name} {record.patient.last_name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getActionBadge(record.action)}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{record.action_by_user.name}</div>
                                                        <div className="text-sm text-gray-500">{getRoleBadge(record.action_by_role)}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getRegistrationTypeBadge(record.transfer.registration_type)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        <Calendar className="w-3 h-3" />
                                                        {format(new Date(record.action_date), 'MMM dd, yyyy HH:mm')}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {record.notes ? (
                                                        <div className="text-sm text-gray-600 max-w-xs truncate">
                                                            {record.notes}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {history.data.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No transfer history found.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

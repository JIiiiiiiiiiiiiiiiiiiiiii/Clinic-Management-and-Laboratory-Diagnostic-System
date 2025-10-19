import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Activity, ArrowLeft, CheckCircle, Clock, Download, Eye, XCircle } from 'lucide-react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { title: 'Reports', href: route('hospital.reports.index') },
    { title: 'Transfer Reports', href: route('hospital.reports.transfers') },
];

interface Transfer {
    id: number;
    patient_name: string;
    transfer_reason: string;
    priority: string;
    status: string;
    created_at: string;
    transferred_by?: string;
}

interface Props {
    transfers: {
        data: Transfer[];
        links: any[];
        meta: any;
    };
    stats: {
        total_transfers: number;
        pending_transfers: number;
        completed_transfers: number;
        cancelled_transfers: number;
    };
    dateRange: {
        start: string;
        end: string;
        period: string;
        label: string;
    };
    filters: any;
}

export default function HospitalTransferReports({ transfers, stats, dateRange, filters }: Props) {
    const getPriorityBadgeColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'urgent':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transfer Reports - Hospital" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Transfer Reports</h1>
                        <p className="text-muted-foreground">Patient transfer analytics and status tracking for {dateRange.label}</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" asChild>
                            <Link href={route('hospital.reports.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Reports
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('hospital.reports.export', 'transfers')}>
                                <Download className="mr-2 h-4 w-4" />
                                Export Data
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_transfers || 0}</div>
                            <p className="text-xs text-muted-foreground">{dateRange.label}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats?.completed_transfers || 0}</div>
                            <p className="text-xs text-muted-foreground">Successfully transferred</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats?.pending_transfers || 0}</div>
                            <p className="text-xs text-muted-foreground">Awaiting completion</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats?.cancelled_transfers || 0}</div>
                            <p className="text-xs text-muted-foreground">Cancelled transfers</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Transfers Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transfer Records</CardTitle>
                        <CardDescription>Detailed transfer information for the selected period</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transfers.data && transfers.data.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Transferred By</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transfers.data.map((transfer) => (
                                        <TableRow key={transfer.id}>
                                            <TableCell className="font-medium">{transfer.patient_name}</TableCell>
                                            <TableCell className="max-w-xs truncate">{transfer.transfer_reason}</TableCell>
                                            <TableCell>
                                                <Badge className={getPriorityBadgeColor(transfer.priority)}>{transfer.priority.toUpperCase()}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusBadgeColor(transfer.status)}>{transfer.status.toUpperCase()}</Badge>
                                            </TableCell>
                                            <TableCell>{transfer.transferred_by || 'N/A'}</TableCell>
                                            <TableCell>{new Date(transfer.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={route('hospital.patients.show', transfer.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-8 text-center">
                                <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">No transfers found</h3>
                                <p className="mt-1 text-sm text-gray-500">No transfer records found for the selected period.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, CheckCircle, XCircle, Clock, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface PatientTransfer {
    id: number;
    patient_data?: {
        first_name?: string;
        last_name?: string;
        middle_name?: string;
        birthdate?: string;
        age?: number;
        sex?: string;
        mobile_no?: string;
    };
    registration_type: 'admin' | 'hospital';
    approval_status: 'pending' | 'approved' | 'rejected';
    requested_by: {
        id: number;
        name: string;
        role: string;
    };
    approved_by?: {
        id: number;
        name: string;
        role: string;
    };
    created_at: string;
    approval_date?: string;
    approval_notes?: string;
}

interface Props {
    transfers: {
        data: PatientTransfer[];
        links: any[];
        meta: any;
    };
    userRole: string;
}

export default function PatientTransferIndex({ transfers, userRole }: Props) {
    const [filterStatus, setFilterStatus] = useState<string>('all');
    
    // Safety check for transfers data
    if (!transfers || !transfers.data) {
        return (
            <AppLayout
                title="Patient Transfer Registrations"
                renderHeader={() => (
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Patient Transfer Registrations</h2>
                            <p className="text-sm text-gray-600">Loading...</p>
                        </div>
                    </div>
                )}
            >
                <Head title="Patient Transfer Registrations" />
                <div className="py-6">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="text-center py-8">Loading patient transfer data...</div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'approved':
                return <Badge variant="outline" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
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

    const filteredTransfers = filterStatus === 'all' 
        ? (transfers.data || []) 
        : (transfers.data || []).filter(transfer => transfer && transfer.approval_status === filterStatus);
    
    // Additional safety check
    if (!Array.isArray(filteredTransfers)) {
        console.error('filteredTransfers is not an array:', filteredTransfers);
        return (
            <AppLayout
                title="Patient Transfer Registrations"
                renderHeader={() => (
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Patient Transfer Registrations</h2>
                            <p className="text-sm text-gray-600">Error loading data</p>
                        </div>
                    </div>
                )}
            >
                <Head title="Patient Transfer Registrations" />
                <div className="py-6">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="text-center py-8 text-red-500">Error loading patient transfer data. Please refresh the page.</div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            title="Patient Transfer Registrations"
            renderHeader={() => (
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Patient Transfer Registrations</h2>
                        <p className="text-sm text-gray-600">
                            {userRole === 'admin' 
                                ? 'Review hospital patient registrations' 
                                : 'Review admin patient registrations'
                            }
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={route('admin.patient.transfer.registrations.create')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                            Register New Patient
                        </Link>
                        <Link
                            href={route('admin.patient.transfer.history')}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                            View History
                        </Link>
                    </div>
                </div>
            )}
        >
            <Head title="Patient Transfer Registrations" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Filters */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Button
                                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                                    onClick={() => setFilterStatus('all')}
                                    size="sm"
                                >
                                    All
                                </Button>
                                <Button
                                    variant={filterStatus === 'pending' ? 'default' : 'outline'}
                                    onClick={() => setFilterStatus('pending')}
                                    size="sm"
                                >
                                    Pending
                                </Button>
                                <Button
                                    variant={filterStatus === 'approved' ? 'default' : 'outline'}
                                    onClick={() => setFilterStatus('approved')}
                                    size="sm"
                                >
                                    Approved
                                </Button>
                                <Button
                                    variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                                    onClick={() => setFilterStatus('rejected')}
                                    size="sm"
                                >
                                    Rejected
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transfers Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Patient Registration Requests</CardTitle>
                            <CardDescription>
                                {filteredTransfers.length} registration request(s) found
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Patient Name</TableHead>
                                            <TableHead>Registration Type</TableHead>
                                            <TableHead>Requested By</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTransfers && filteredTransfers.length > 0 ? filteredTransfers.filter(transfer => transfer && typeof transfer === 'object').map((transfer) => {
                                            // Safety check for transfer object
                                            if (!transfer || typeof transfer !== 'object') {
                                                console.error('Invalid transfer object:', transfer);
                                                return null;
                                            }
                                            
                                            
                                            return (
                                            <TableRow key={transfer.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-gray-500" />
                                                        <div>
                                                            <div className="font-medium">
                                                                {transfer.patient_data?.first_name || 'N/A'} {transfer.patient_data?.last_name || 'N/A'}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {transfer.patient_data?.sex || 'N/A'}, {transfer.patient_data?.age || 'N/A'} years
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getRegistrationTypeBadge(transfer.registration_type)}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{transfer.requested_by.name}</div>
                                                        <div className="text-sm text-gray-500">{transfer.requested_by.role}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(transfer.approval_status)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        <Calendar className="w-3 h-3" />
                                                        {format(new Date(transfer.created_at), 'MMM dd, yyyy')}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Link
                                                            href={route('admin.patient.transfer.registrations.show', transfer.id)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        {transfer.approval_status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-green-600 hover:text-green-800"
                                                                    onClick={() => {
                                                                        if (confirm('Are you sure you want to approve this registration?')) {
                                                                            router.post(route('admin.patient.transfer.registrations.approve', transfer.id));
                                                                        }
                                                                    }}
                                                                >
                                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-red-600 hover:text-red-800"
                                                                    onClick={() => {
                                                                        const notes = prompt('Please provide a reason for rejection:');
                                                                        if (notes) {
                                                                            router.post(route('admin.patient.transfer.registrations.reject', transfer.id), {
                                                                                notes
                                                                            });
                                                                        }
                                                                    }}
                                                                >
                                                                    <XCircle className="w-4 h-4 mr-1" />
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            );
                                        }) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                    No patient registration requests found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

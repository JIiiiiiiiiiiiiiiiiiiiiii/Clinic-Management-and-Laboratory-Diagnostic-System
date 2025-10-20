import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    ArrowRightLeft,
    Building,
    CheckCircle,
    Clock,
    Download,
    Edit,
    Eye,
    Filter,
    Hospital,
    Phone,
    Plus,
    Search,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface Patient {
    id: number;
    patient_no: string;
    first_name: string;
    last_name: string;
    full_name: string;
    age: number;
    sex: string;
    mobile_no?: string;
    present_address?: string;
    last_visit?: string;
    status: string;
    created_at: string;
}

interface Transfer {
    id: number;
    patient_id: number;
    patient_name: string;
    patient_no: string;
    from_hospital: boolean;
    to_clinic: string;
    transfer_reason: string;
    priority: string;
    status: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    created_by: string;
}

interface TransferStats {
    total_transfers: number;
    pending_transfers: number;
    completed_transfers: number;
    cancelled_transfers: number;
    urgent_transfers: number;
    high_priority_transfers: number;
}

interface Props {
    patients: {
        data: Patient[];
        links: any[];
        meta: any;
    };
    transfers: {
        data: Transfer[];
        links: any[];
        meta: any;
    };
    stats: TransferStats;
    filters: {
        search?: string;
        status?: string;
        priority?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function TransferManagement({ patients, transfers, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [priority, setPriority] = useState(filters.priority || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [showTransferForm, setShowTransferForm] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Hospital Dashboard', href: route('hospital.dashboard') },
        { label: 'Patient Transfers', href: route('hospital.patients.refer') },
    ];

    const handleFilter = () => {
        router.get(
            route('hospital.patients.refer'),
            {
                search: search || undefined,
                status: status || undefined,
                priority: priority || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setPriority('');
        setDateFrom('');
        setDateTo('');
        router.get(
            route('hospital.patients.refer'),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handlePatientSelect = (patient: Patient) => {
        setSelectedPatient(patient);
        setShowTransferForm(true);
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'pending':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            default:
                return <Clock className="h-4 w-4 text-blue-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            completed: 'default',
            cancelled: 'destructive',
            pending: 'secondary',
            in_progress: 'outline',
        } as const;

        return <Badge variant={variants[status.toLowerCase() as keyof typeof variants] || 'outline'}>{status}</Badge>;
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
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

    const exportTransfers = () => {
        const params = new URLSearchParams({
            search: search || '',
            status: status || '',
            priority: priority || '',
            date_from: dateFrom || '',
            date_to: dateTo || '',
        });

        window.open(route('hospital.reports.export', 'transfers') + '?' + params.toString());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patient Transfer Management - Hospital" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Patient Transfer Management</h1>
                        <p className="text-muted-foreground">Manage patient transfers between Saint James Hospital and St. James Clinic</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={exportTransfers}>
                            <Download className="mr-2 h-4 w-4" />
                            Export Transfers
                        </Button>
                        <Button asChild>
                            <Link href={route('hospital.patients.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Patients
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
                            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_transfers.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">All time transfers</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Transfers</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending_transfers.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Awaiting approval</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.completed_transfers.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Successfully transferred</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.urgent_transfers.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Urgent priority</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.high_priority_transfers.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">High priority</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content with Tabs */}
                <Tabs defaultValue="transfers" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="transfers">Transfer Records</TabsTrigger>
                        <TabsTrigger value="patients">Select Patient</TabsTrigger>
                        <TabsTrigger value="new-transfer">New Transfer</TabsTrigger>
                    </TabsList>

                    <TabsContent value="transfers" className="space-y-4">
                        {/* Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="h-5 w-5" />
                                    Transfer Filters
                                </CardTitle>
                                <CardDescription>Filter transfers by various criteria</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                                    <div>
                                        <Label htmlFor="search">Search</Label>
                                        <div className="relative">
                                            <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="search"
                                                placeholder="Patient name, transfer ID..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={status} onValueChange={setStatus}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Statuses</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="priority">Priority</Label>
                                        <Select value={priority} onValueChange={setPriority}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All priorities" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Priorities</SelectItem>
                                                <SelectItem value="urgent">Urgent</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="low">Low</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="date_from">From Date</Label>
                                        <Input id="date_from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                                    </div>

                                    <div>
                                        <Label htmlFor="date_to">To Date</Label>
                                        <Input id="date_to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <Button onClick={handleFilter}>Apply Filters</Button>
                                    <Button variant="outline" onClick={clearFilters}>
                                        Clear Filters
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Transfers Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Transfer Records</CardTitle>
                                <CardDescription>{transfers.meta.total} transfers found</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Transfer ID</TableHead>
                                                <TableHead>Patient</TableHead>
                                                <TableHead>From/To</TableHead>
                                                <TableHead>Reason</TableHead>
                                                <TableHead>Priority</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transfers.data.map((transfer) => (
                                                <TableRow key={transfer.id}>
                                                    <TableCell className="font-medium">#{transfer.id}</TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{transfer.patient_name}</div>
                                                            <div className="text-sm text-muted-foreground">ID: {transfer.patient_no}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {transfer.from_hospital ? (
                                                                <Hospital className="h-4 w-4 text-blue-600" />
                                                            ) : (
                                                                <Building className="h-4 w-4 text-green-600" />
                                                            )}
                                                            <span className="text-sm">
                                                                {transfer.from_hospital ? 'Hospital' : 'Clinic'} → {transfer.to_clinic}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="max-w-[200px] truncate">{transfer.transfer_reason}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getPriorityColor(transfer.priority)}>{transfer.priority}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(transfer.status)}
                                                            {getStatusBadge(transfer.status)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">{new Date(transfer.created_at).toLocaleDateString()}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {transfers.links && transfers.links.length > 3 && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {transfers.meta.from} to {transfers.meta.to} of {transfers.meta.total} results
                                        </div>
                                        <div className="flex gap-1">
                                            {transfers.links.map((link, index) => (
                                                <Button
                                                    key={index}
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url)}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="patients" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Select Patient for Transfer
                                </CardTitle>
                                <CardDescription>Choose a patient to transfer to St. James Clinic</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Search className="h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Search patients by name or ID..." className="flex-1" />
                                    </div>

                                    <div className="grid gap-4">
                                        {patients.data.slice(0, 10).map((patient) => (
                                            <div
                                                key={patient.id}
                                                className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
                                            >
                                                <div className="space-y-1">
                                                    <div className="font-medium">{patient.full_name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        ID: {patient.patient_no} • {patient.age} years old • {patient.sex}
                                                    </div>
                                                    {patient.mobile_no && (
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Phone className="h-3 w-3" />
                                                            {patient.mobile_no}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">{patient.status}</Badge>
                                                    <Button size="sm" onClick={() => handlePatientSelect(patient)}>
                                                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                                                        Transfer
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="new-transfer" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Plus className="h-5 w-5" />
                                    Create New Transfer
                                </CardTitle>
                                <CardDescription>Transfer a patient from Saint James Hospital to St. James Clinic</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="py-8 text-center">
                                    <ArrowRightLeft className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                    <h3 className="mb-2 text-lg font-semibold">Create New Transfer</h3>
                                    <p className="mb-4 text-muted-foreground">
                                        Select a patient from the "Select Patient" tab to create a new transfer
                                    </p>
                                    <Button onClick={() => setActiveTab('patients')}>
                                        <Users className="mr-2 h-4 w-4" />
                                        Select Patient
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

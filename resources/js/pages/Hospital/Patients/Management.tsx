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
import { Activity, ArrowRightLeft, Calendar, Download, Edit, Eye, FileText, Filter, Phone, Plus, Search, Trash2, User, Users } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface Patient {
    id: number;
    patient_no: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    full_name: string;
    birthdate: string;
    age: number;
    sex: string;
    mobile_no?: string;
    present_address?: string;
    occupation?: string;
    civil_status?: string;
    created_at: string;
    last_visit?: string;
    status?: string;
    transfers?: any[];
    appointments?: any[];
}

interface PatientStats {
    total_patients: number;
    male_patients: number;
    female_patients: number;
    new_this_month: number;
    active_patients: number;
    transferred_patients: number;
}

interface Props {
    patients: {
        data: Patient[];
        links: any[];
        meta: any;
    };
    stats: PatientStats;
    filters: {
        search?: string;
        sex?: string;
        age_min?: number;
        age_max?: number;
        date_from?: string;
        date_to?: string;
        status?: string;
    };
}

export default function HospitalPatientManagement({ patients, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [sex, setSex] = useState(filters.sex || '');
    const [ageMin, setAgeMin] = useState(filters.age_min || '');
    const [ageMax, setAgeMax] = useState(filters.age_max || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [status, setStatus] = useState(filters.status || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Hospital Dashboard', href: route('hospital.dashboard') },
        { title: 'Patient Management', href: route('hospital.patients.index') },
    ];

    const handleFilter = () => {
        router.get(
            route('hospital.patients.index'),
            {
                search: search || undefined,
                sex: sex || undefined,
                age_min: ageMin ? String(ageMin) : undefined,
                age_max: ageMax ? String(ageMax) : undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
                status: status || undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setSex('');
        setAgeMin('');
        setAgeMax('');
        setDateFrom('');
        setDateTo('');
        setStatus('');
        router.get(
            route('hospital.patients.index'),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleDelete = (patient: Patient) => {
        if (confirm(`Are you sure you want to delete patient ${patient.full_name}?`)) {
            router.delete(route('hospital.patients.destroy', patient.id));
        }
    };

    const exportPatients = () => {
        const params = new URLSearchParams({
            search: search || '',
            sex: sex || '',
            age_min: String(ageMin || ''),
            age_max: String(ageMax || ''),
            date_from: dateFrom || '',
            date_to: dateTo || '',
            status: status || '',
        });

        window.open(route('hospital.reports.export', 'patients') + '?' + params.toString());
    };

    const getStatusBadge = (patient: Patient) => {
        if (patient.transfers && patient.transfers.length > 0) {
            const latestTransfer = patient.transfers[0];
            if (latestTransfer.status === 'completed') {
                return <Badge className="bg-green-100 text-green-800">Transferred</Badge>;
            } else if (latestTransfer.status === 'pending') {
                return <Badge className="bg-yellow-100 text-yellow-800">Transfer Pending</Badge>;
            }
        }

        if (patient.last_visit) {
            const lastVisitDate = new Date(patient.last_visit);
            const daysSinceVisit = Math.floor((Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysSinceVisit <= 30) {
                return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
            } else if (daysSinceVisit <= 90) {
                return <Badge className="bg-orange-100 text-orange-800">Inactive</Badge>;
            } else {
                return <Badge className="bg-gray-100 text-gray-800">Dormant</Badge>;
            }
        }

        return <Badge className="bg-gray-100 text-gray-800">New</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patient Management - Hospital" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
                        <p className="text-muted-foreground">Comprehensive patient management for Saint James Hospital</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={exportPatients}>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button asChild>
                            <Link href={route('hospital.patients.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Patient
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_patients.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Registered in system</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.active_patients.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Recent activity</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Male Patients</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.male_patients.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Male patients</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Female Patients</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.female_patients.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Female patients</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.new_this_month.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Registered this month</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content with Tabs */}
                <Tabs defaultValue="patients" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="patients">Patient Records</TabsTrigger>
                        <TabsTrigger value="transfers">Patient Transfers</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="patients" className="space-y-4">
                        {/* Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="h-5 w-5" />
                                    Advanced Filters
                                </CardTitle>
                                <CardDescription>Filter patients by various criteria for better management</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-7">
                                    <div>
                                        <Label htmlFor="search">Search</Label>
                                        <div className="relative">
                                            <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="search"
                                                placeholder="Name, patient no..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="sex">Gender</Label>
                                        <Select value={sex} onValueChange={setSex}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All genders" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Genders</SelectItem>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="age_min">Min Age</Label>
                                        <Input
                                            id="age_min"
                                            type="number"
                                            placeholder="0"
                                            value={ageMin}
                                            onChange={(e) => setAgeMin(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="age_max">Max Age</Label>
                                        <Input
                                            id="age_max"
                                            type="number"
                                            placeholder="100"
                                            value={ageMax}
                                            onChange={(e) => setAgeMax(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="date_from">From Date</Label>
                                        <Input id="date_from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                                    </div>

                                    <div>
                                        <Label htmlFor="date_to">To Date</Label>
                                        <Input id="date_to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                                    </div>

                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={status} onValueChange={setStatus}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Statuses</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="transferred">Transferred</SelectItem>
                                                <SelectItem value="new">New</SelectItem>
                                            </SelectContent>
                                        </Select>
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

                        {/* Patients Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Patient Records</CardTitle>
                                <CardDescription>{patients.meta.total} patients found</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Patient No</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Age</TableHead>
                                                <TableHead>Gender</TableHead>
                                                <TableHead>Contact</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Last Visit</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {patients.data.map((patient) => (
                                                <TableRow key={patient.id}>
                                                    <TableCell className="font-medium">{patient.patient_no}</TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{patient.full_name}</div>
                                                            {patient.occupation && (
                                                                <div className="text-sm text-muted-foreground">{patient.occupation}</div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{patient.age}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {patient.sex}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {patient.mobile_no && (
                                                            <div className="flex items-center gap-1 text-sm">
                                                                <Phone className="h-3 w-3" />
                                                                {patient.mobile_no}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(patient)}</TableCell>
                                                    <TableCell>
                                                        {patient.last_visit ? (
                                                            <div className="text-sm">{new Date(patient.last_visit).toLocaleDateString()}</div>
                                                        ) : (
                                                            <span className="text-muted-foreground">No visits</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={route('hospital.patients.show', patient.id)}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={route('hospital.patients.edit', patient.id)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(patient)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {patients.links && patients.links.length > 3 && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {patients.meta.from} to {patients.meta.to} of {patients.meta.total} results
                                        </div>
                                        <div className="flex gap-1">
                                            {patients.links.map((link, index) => (
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

                    <TabsContent value="transfers" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ArrowRightLeft className="h-5 w-5" />
                                    Patient Transfers
                                </CardTitle>
                                <CardDescription>Manage patient transfers between hospital and clinic</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="py-8 text-center">
                                    <ArrowRightLeft className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                    <h3 className="mb-2 text-lg font-semibold">Transfer Management</h3>
                                    <p className="mb-4 text-muted-foreground">
                                        Manage patient transfers and referrals between Saint James Hospital and St. James Clinic
                                    </p>
                                    <div className="flex justify-center gap-2">
                                        <Button asChild>
                                            <Link href={route('hospital.patients.refer')}>
                                                <ArrowRightLeft className="mr-2 h-4 w-4" />
                                                Transfer Patient
                                            </Link>
                                        </Button>
                                        <Button variant="outline" asChild>
                                            <Link href={route('hospital.reports.transfers')}>
                                                <FileText className="mr-2 h-4 w-4" />
                                                View Transfer Reports
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Patient Analytics
                                </CardTitle>
                                <CardDescription>Comprehensive analytics and insights for patient management</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="py-8 text-center">
                                    <Activity className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                    <h3 className="mb-2 text-lg font-semibold">Analytics Dashboard</h3>
                                    <p className="mb-4 text-muted-foreground">View detailed analytics and insights for patient management</p>
                                    <div className="flex justify-center gap-2">
                                        <Button asChild>
                                            <Link href={route('hospital.reports.patients')}>
                                                <FileText className="mr-2 h-4 w-4" />
                                                View Patient Reports
                                            </Link>
                                        </Button>
                                        <Button variant="outline" asChild>
                                            <Link href={route('hospital.reports.index')}>
                                                <Activity className="mr-2 h-4 w-4" />
                                                View All Reports
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

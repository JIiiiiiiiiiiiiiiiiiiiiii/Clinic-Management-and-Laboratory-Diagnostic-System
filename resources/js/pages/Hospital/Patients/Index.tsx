import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Edit, Eye, MapPin, Phone, Plus, Search, Trash2, User, Users } from 'lucide-react';
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
}

interface PatientStats {
    total_patients: number;
    male_patients: number;
    female_patients: number;
    new_this_month: number;
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
    };
}

export default function HospitalPatientsIndex({ patients, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Hospital Dashboard', href: route('hospital.dashboard') },
        { label: 'Patients', href: route('hospital.patients.index') },
    ];

    const handleFilter = () => {
        router.get(
            route('hospital.patients.index'),
            {
                search: search || undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        setSearch('');
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patients - Hospital" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
                        <p className="text-muted-foreground">View and manage all patients in the system</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild>
                            <Link href={route('hospital.patients.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Patient
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={route('hospital.patients.refer')}>Refer Patient</Link>
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
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

                {/* Search */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Search Patients
                        </CardTitle>
                        <CardDescription>Search patients by name, patient number, or mobile number</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name, patient no, or mobile..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                        onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                                    />
                                </div>
                            </div>
                            <Button onClick={handleFilter}>Search</Button>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Patients Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Patient Records</CardTitle>
                        <CardDescription>{patients?.meta?.total || patients?.data?.length || 0} patients found</CardDescription>
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
                                        <TableHead>Address</TableHead>
                                        <TableHead>Registered</TableHead>
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
                                                    {patient.occupation && <div className="text-sm text-muted-foreground">{patient.occupation}</div>}
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
                                            <TableCell>
                                                {patient.present_address && (
                                                    <div className="flex max-w-[200px] items-center gap-1 truncate text-sm">
                                                        <MapPin className="h-3 w-3" />
                                                        {patient.present_address}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>{new Date(patient.created_at).toLocaleDateString()}</TableCell>
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
            </div>
        </AppLayout>
    );
}

import PageHeader from '@/components/hospital/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Search, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface PatientRow {
    id: number;
    full_name: string;
    patient_no: string;
    mobile_no?: string;
}

interface Props {
    patients: { data: PatientRow[]; meta: any; links: any[] };
    stats?: any;
    filters?: { search?: string };
}

export default function HospitalPatientsIndex({ patients, stats, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Hospital Dashboard', href: route('hospital.dashboard') },
        { title: 'Patients', href: route('hospital.patients.index') },
    ];

    const applySearch = () => {
        router.get(route('hospital.patients.index'), { search: search || undefined }, { replace: true, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patients - Hospital" />
            <div className="space-y-6 px-4 md:px-6">
                <PageHeader
                    title="Patients"
                    description="Manage patient records"
                    trailing={
                        <Button asChild>
                            <Link href={route('hospital.patients.create')}>
                                <Plus className="mr-2 h-4 w-4" /> Add Patient
                            </Link>
                        </Button>
                    }
                />

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" /> Patient List
                        </CardTitle>
                        <CardDescription>Registered patients in the hospital system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex items-center gap-2">
                            <div className="relative w-full max-w-md">
                                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search patients by name or number"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                                    className="pl-9"
                                />
                            </div>
                            <Button onClick={applySearch}>Search</Button>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Patient No.</TableHead>
                                        <TableHead>Full Name</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patients.data.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="whitespace-nowrap">{p.patient_no}</TableCell>
                                            <TableCell className="whitespace-nowrap">{p.full_name}</TableCell>
                                            <TableCell className="whitespace-nowrap">{p.mobile_no || '—'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={route('hospital.patients.show', p.id)}>
                                                            <Eye className="mr-1 h-4 w-4" /> View
                                                        </Link>
                                                    </Button>
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={route('hospital.patients.edit', p.id)}>
                                                            <Edit className="mr-1 h-4 w-4" /> Edit
                                                        </Link>
                                                    </Button>
                                                    <Button variant="destructive" size="sm">
                                                        <Trash2 className="mr-1 h-4 w-4" /> Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {patients.links && patients.links.length > 3 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {patients.meta.from} to {patients.meta.to} of {patients.meta.total} results
                                </div>
                                <div className="flex gap-1">
                                    {patients.links.map((link: any, index: number) => (
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

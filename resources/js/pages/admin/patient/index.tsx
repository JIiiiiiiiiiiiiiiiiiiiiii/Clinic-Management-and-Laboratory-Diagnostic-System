import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PatientItem } from '@/types/patients';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Eye, Plus } from 'lucide-react';
import * as React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patient Management',
        href: '/admin/patient',
    },
];

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function Patient(props: { patients: PatientItem[]; pagination: Pagination }) {
    const { patients, pagination } = props;
    const [search, setSearch] = React.useState('');
    const created = (usePage().props as any).flash?.created_patient as
        | { id: number; last_name: string; first_name: string; age: number; sex: string }
        | undefined;
    const [open, setOpen] = React.useState(Boolean(created));
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patient Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Search by name, patient no. or mobile"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-72"
                        />
                        <Button variant="outline" onClick={() => router.visit(`/admin/patient?search=${encodeURIComponent(search)}`)}>
                            Search
                        </Button>
                    </div>
                    <Button asChild>
                        <Link href="/admin/patient/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Patient
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Patients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Patient No.</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Sex</TableHead>
                                        <TableHead>Age</TableHead>
                                        <TableHead>Mobile</TableHead>
                                        <TableHead className="w-40">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patients.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-medium">{p.patient_no || '—'}</TableCell>
                                            <TableCell>
                                                {p.last_name}, {p.first_name} {p.middle_name || ''}
                                            </TableCell>
                                            <TableCell>{p.sex}</TableCell>
                                            <TableCell>{p.age}</TableCell>
                                            <TableCell>{p.mobile_no}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={`/admin/patient/${p.id}`}>
                                                            <Eye className="mr-1 h-3 w-3" /> View
                                                        </Link>
                                                    </Button>
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={`/admin/patient/${p.id}/edit`}>
                                                            <Edit className="mr-1 h-3 w-3" /> Edit
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {pagination.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.current_page === 1}
                                    onClick={() => router.visit(`/admin/patient?page=${pagination.current_page - 1}`)}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {pagination.current_page} of {pagination.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.current_page === pagination.last_page}
                                    onClick={() => router.visit(`/admin/patient?page=${pagination.current_page + 1}`)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Patient created</AlertDialogTitle>
                    </AlertDialogHeader>
                    {created && (
                        <AlertDialogDescription>
                            Added patient #{created.id}: {created.last_name}, {created.first_name} ({created.sex}, {created.age}).
                        </AlertDialogDescription>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setOpen(false)}>OK</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

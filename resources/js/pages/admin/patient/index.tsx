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
import { Separator } from '@/components/ui/separator';
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

type VisitRow = {
    id: number;
    patient: { id: number; patient_no: string; first_name: string; last_name: string };
    arrival_date: string;
    arrival_time: string;
    attending_physician: string;
    status: 'active' | 'completed' | 'discharged';
};

export default function Patient(props: {
    patients: PatientItem[];
    patients_pagination: Pagination;
    patients_filters: { p_search: string; p_sort_by: string; p_sort_dir: 'asc' | 'desc' };
    visits: VisitRow[];
    visits_pagination: Pagination;
    visits_filters: { v_start?: string; v_end?: string; v_doctor?: string; v_sort_dir: 'asc' | 'desc' };
}) {
    const { patients, patients_pagination, patients_filters, visits, visits_pagination, visits_filters } = props as any;
    const [pSearch, setPSearch] = React.useState<string>(patients_filters?.p_search || '');
    const created = (usePage().props as any).flash?.created_patient as
        | { id: number; last_name: string; first_name: string; age: number; sex: string }
        | undefined;
    const [open, setOpen] = React.useState(Boolean(created));
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patient Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Patients: controls */}
                <Card>
                    <CardHeader>
                        <CardTitle>Patients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Search by last/first name"
                                    value={pSearch}
                                    onChange={(e) => setPSearch(e.target.value)}
                                    className="w-72"
                                />
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        router.visit(
                                            `/admin/patient?p_search=${encodeURIComponent(pSearch)}&p_sort_by=${encodeURIComponent(
                                                patients_filters?.p_sort_by || 'last_name',
                                            )}&p_sort_dir=${patients_filters?.p_sort_dir || 'asc'}`,
                                        )
                                    }
                                >
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
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <button
                                                className="underline-offset-2 hover:underline"
                                                onClick={() => {
                                                    const dir =
                                                        patients_filters?.p_sort_by === 'patient_no' && patients_filters?.p_sort_dir === 'asc'
                                                            ? 'desc'
                                                            : 'asc';
                                                    router.visit(
                                                        `/admin/patient?p_search=${encodeURIComponent(pSearch)}&p_sort_by=patient_no&p_sort_dir=${dir}`,
                                                    );
                                                }}
                                            >
                                                Patient No.
                                            </button>
                                        </TableHead>
                                        <TableHead>
                                            <button
                                                className="underline-offset-2 hover:underline"
                                                onClick={() => {
                                                    const dir =
                                                        patients_filters?.p_sort_by === 'last_name' && patients_filters?.p_sort_dir === 'asc'
                                                            ? 'desc'
                                                            : 'asc';
                                                    router.visit(
                                                        `/admin/patient?p_search=${encodeURIComponent(pSearch)}&p_sort_by=last_name&p_sort_dir=${dir}`,
                                                    );
                                                }}
                                            >
                                                Last Name
                                            </button>
                                        </TableHead>
                                        <TableHead>
                                            <button
                                                className="underline-offset-2 hover:underline"
                                                onClick={() => {
                                                    const dir =
                                                        patients_filters?.p_sort_by === 'first_name' && patients_filters?.p_sort_dir === 'asc'
                                                            ? 'desc'
                                                            : 'asc';
                                                    router.visit(
                                                        `/admin/patient?p_search=${encodeURIComponent(pSearch)}&p_sort_by=first_name&p_sort_dir=${dir}`,
                                                    );
                                                }}
                                            >
                                                First Name
                                            </button>
                                        </TableHead>
                                        <TableHead>Sex</TableHead>
                                        <TableHead>Age</TableHead>
                                        <TableHead>Mobile</TableHead>
                                        <TableHead className="w-40">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patients.map((p: any) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-medium">{p.patient_no || '—'}</TableCell>
                                            <TableCell>{p.last_name}</TableCell>
                                            <TableCell>{p.first_name}</TableCell>
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
                        {patients_pagination?.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={patients_pagination.current_page === 1}
                                    onClick={() =>
                                        router.visit(
                                            `/admin/patient?p_page=${patients_pagination.current_page - 1}&p_search=${encodeURIComponent(
                                                pSearch,
                                            )}&p_sort_by=${patients_filters?.p_sort_by || 'last_name'}&p_sort_dir=${patients_filters?.p_sort_dir || 'asc'}`,
                                        )
                                    }
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {patients_pagination.current_page} of {patients_pagination.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={patients_pagination.current_page === patients_pagination.last_page}
                                    onClick={() =>
                                        router.visit(
                                            `/admin/patient?p_page=${patients_pagination.current_page + 1}&p_search=${encodeURIComponent(
                                                pSearch,
                                            )}&p_sort_by=${patients_filters?.p_sort_by || 'last_name'}&p_sort_dir=${patients_filters?.p_sort_dir || 'asc'}`,
                                        )
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Separator className="my-2" />

                {/* Visit Records across all patients */}
                <Card>
                    <CardHeader>
                        <CardTitle>Visit Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            className="mb-4 grid gap-4 md:grid-cols-5"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.currentTarget as HTMLFormElement;
                                const vStart = (form.elements.namedItem('v_start') as HTMLInputElement).value;
                                const vEnd = (form.elements.namedItem('v_end') as HTMLInputElement).value;
                                const vDoctor = (form.elements.namedItem('v_doctor') as HTMLInputElement).value;
                                const vSortDir = (form.elements.namedItem('v_sort_dir') as HTMLSelectElement).value || 'desc';
                                router.visit(
                                    `/admin/patient?v_start=${encodeURIComponent(vStart || '')}&v_end=${encodeURIComponent(vEnd || '')}&v_doctor=${encodeURIComponent(
                                        vDoctor || '',
                                    )}&v_sort_dir=${vSortDir}`,
                                );
                            }}
                        >
                            <div>
                                <label className="mb-1 block text-sm font-medium">Start Date</label>
                                <Input name="v_start" type="date" defaultValue={(visits_filters as any)?.v_start || ''} />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">End Date</label>
                                <Input name="v_end" type="date" defaultValue={(visits_filters as any)?.v_end || ''} />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Attending Doctor</label>
                                <Input name="v_doctor" placeholder="Doctor name" defaultValue={(visits_filters as any)?.v_doctor || ''} />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Sort by date</label>
                                <select
                                    name="v_sort_dir"
                                    defaultValue={(visits_filters as any)?.v_sort_dir || 'desc'}
                                    className="w-full rounded-md border p-2 text-sm"
                                >
                                    <option value="asc">Ascending</option>
                                    <option value="desc">Descending</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <Button variant="outline" type="submit">
                                    Apply
                                </Button>
                            </div>
                        </form>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Patient No.</TableHead>
                                        <TableHead>Last Name</TableHead>
                                        <TableHead>First Name</TableHead>
                                        <TableHead>Arrival Date</TableHead>
                                        <TableHead>Arrival Time</TableHead>
                                        <TableHead>Attending Physician</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visits.map((v: any) => (
                                        <TableRow key={v.id}>
                                            <TableCell className="font-medium">{v.patient?.patient_no || '—'}</TableCell>
                                            <TableCell>{v.patient?.last_name}</TableCell>
                                            <TableCell>{v.patient?.first_name}</TableCell>
                                            <TableCell>{new Date(v.arrival_date).toLocaleDateString()}</TableCell>
                                            <TableCell>{String(v.arrival_time).match(/\d{2}:\d{2}/)?.[0] || v.arrival_time}</TableCell>
                                            <TableCell>{v.attending_physician}</TableCell>
                                            <TableCell className="capitalize">{v.status}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={`/admin/patient/${v.patient?.id}?tab=visits`}>View</Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {visits_pagination?.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={visits_pagination.current_page === 1}
                                    onClick={() =>
                                        router.visit(
                                            `/admin/patient?v_page=${visits_pagination.current_page - 1}&v_start=${encodeURIComponent(
                                                (visits_filters as any)?.v_start || '',
                                            )}&v_end=${encodeURIComponent((visits_filters as any)?.v_end || '')}&v_doctor=${encodeURIComponent(
                                                (visits_filters as any)?.v_doctor || '',
                                            )}&v_sort_dir=${(visits_filters as any)?.v_sort_dir || 'desc'}`,
                                        )
                                    }
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {visits_pagination.current_page} of {visits_pagination.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={visits_pagination.current_page === visits_pagination.last_page}
                                    onClick={() =>
                                        router.visit(
                                            `/admin/patient?v_page=${visits_pagination.current_page + 1}&v_start=${encodeURIComponent(
                                                (visits_filters as any)?.v_start || '',
                                            )}&v_end=${encodeURIComponent((visits_filters as any)?.v_end || '')}&v_doctor=${encodeURIComponent(
                                                (visits_filters as any)?.v_doctor || '',
                                            )}&v_sort_dir=${(visits_filters as any)?.v_sort_dir || 'desc'}`,
                                        )
                                    }
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

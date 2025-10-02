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
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PatientItem } from '@/types/patients';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Eye, Plus, Search, Filter, Calendar, User, Phone, Mail, MapPin, Clock, Stethoscope, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Heading title="Patient Management" description="Manage patient records and visit history" icon={User} />
                        <div className="flex items-center gap-4">
                            <div className="counter-card text-white rounded-xl shadow-lg border-0 px-6 py-4 w-52 h-20 flex items-center">
                                <div className="flex items-center gap-3">
                                    <div className="counter-icon p-2 rounded-lg border border-white/60">
                                        <User className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold">{patients_pagination?.total || 0}</div>
                                        <div className="text-blue-100 text-sm font-medium">Total Patients</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Patients Section */}
                <div className="holographic-card shadow-lg border-0 mb-8 overflow-hidden rounded-lg bg-white">
                    {/* Header Section - No gaps */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Patient Records</h3>
                                    <p className="text-blue-100 mt-1">Search and manage patient information</p>
                                </div>
                            </div>
                            <Button asChild className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl">
                                <Link href="/admin/patient/create">
                                    <Plus className="mr-3 h-6 w-6" />
                                    Add New Patient
                                </Link>
                            </Button>
                        </div>
                    </div>
                    {/* Content Section - Seamlessly connected */}
                    <div className="px-6 py-6 bg-gradient-to-br from-blue-50 to-blue-100">
                        <div className="mb-6">
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search patients by name..."
                                        value={pSearch}
                                        onChange={(e) => setPSearch(e.target.value)}
                                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                                    />
                                </div>
                                <Button
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                    onClick={() =>
                                        router.visit(
                                            `/admin/patient?p_search=${encodeURIComponent(pSearch)}&p_sort_by=${encodeURIComponent(
                                                patients_filters?.p_sort_by || 'last_name',
                                            )}&p_sort_dir=${patients_filters?.p_sort_dir || 'asc'}`,
                                        )
                                    }
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    Search
                                </Button>
                            </div>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="hover:bg-gray-50">
                                        <TableHead className="font-semibold text-gray-700">
                                            <button
                                                className="flex items-center gap-2 transition-colors !border-0 !border-none hover:!border-0 focus:!border-0 shadow-none bg-transparent p-0"
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
                                                <User className="h-4 w-4" />
                                                Patient No.
                                            </button>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700">
                                            <button
                                                className="flex items-center gap-2 transition-colors !border-0 !border-none hover:!border-0 focus:!border-0 shadow-none bg-transparent p-0"
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
                                        <TableHead className="font-semibold text-gray-700">
                                            <button
                                                className="flex items-center gap-2 transition-colors !border-0 !border-none hover:!border-0 focus:!border-0 shadow-none bg-transparent p-0"
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
                                        <TableHead className="font-semibold text-gray-700">Sex</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Age</TableHead>
                                        <TableHead className="font-semibold text-gray-700">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                Mobile
                                            </div>
                                        </TableHead>
                                        <TableHead className="w-48 font-semibold text-gray-700">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patients.map((p: any) => (
                                        <TableRow key={p.id} className="hover:bg-blue-50/50 transition-colors border-b border-gray-100">
                                            <TableCell className="font-semibold text-blue-600 !border-0 !border-none !border-transparent" style={{ border: 'none !important', borderWidth: '0 !important', borderStyle: 'none !important', borderColor: 'transparent !important', outline: 'none !important' }}>{p.patient_no || '—'}</TableCell>
                                            <TableCell className="font-medium text-gray-900 !border-0 !border-none !border-transparent" style={{ border: 'none !important', borderWidth: '0 !important', borderStyle: 'none !important', borderColor: 'transparent !important', outline: 'none !important' }}>{p.last_name}</TableCell>
                                            <TableCell className="text-gray-700 !border-0 !border-none !border-transparent" style={{ border: 'none !important', borderWidth: '0 !important', borderStyle: 'none !important', borderColor: 'transparent !important', outline: 'none !important' }}>{p.first_name}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    p.sex === 'male' 
                                                        ? 'bg-blue-100 text-blue-800' 
                                                        : 'bg-pink-100 text-pink-800'
                                                }`}>
                                                    {p.sex}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-600">{p.age} years</TableCell>
                                            <TableCell className="text-gray-600">{p.mobile_no}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-3">
                                                    <Button asChild className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                                        <Link href={`/admin/patient/${p.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" /> View
                                                        </Link>
                                                    </Button>
                                                    <Button asChild className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                                        <Link href={`/admin/patient/${p.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit
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
                            <div className="mt-6 flex items-center justify-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={patients_pagination.current_page === 1}
                                    onClick={() =>
                                        router.visit(
                                            `/admin/patient?p_page=${patients_pagination.current_page - 1}&p_search=${encodeURIComponent(
                                                pSearch,
                                            )}&p_sort_by=${patients_filters?.p_sort_by || 'last_name'}&p_sort_dir=${patients_filters?.p_sort_dir || 'asc'}`,
                                        )
                                    }
                                    className="px-4 py-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </Button>
                                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                                    <span className="text-sm font-medium text-blue-700">
                                        Page {patients_pagination.current_page} of {patients_pagination.last_page}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={patients_pagination.current_page === patients_pagination.last_page}
                                    onClick={() =>
                                        router.visit(
                                            `/admin/patient?p_page=${patients_pagination.current_page + 1}&p_search=${encodeURIComponent(
                                                pSearch,
                                            )}&p_sort_by=${patients_filters?.p_sort_by || 'last_name'}&p_sort_dir=${patients_filters?.p_sort_dir || 'asc'}`,
                                        )
                                    }
                                    className="px-4 py-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Visit Records Section */}
                <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                    {/* Header Section - No gaps */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <div className="flex items-center gap-3 p-6">
                            <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Visit Records</h3>
                                <p className="text-purple-100 mt-1">Filter and view patient visit history</p>
                            </div>
                        </div>
                    </div>
                    {/* Content Section - Seamlessly connected */}
                    <div className="px-6 py-6 bg-gradient-to-br from-purple-50 to-purple-100">
                        <form
                            className="mb-6 bg-gray-50 p-6 rounded-xl border border-gray-200"
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
                            <div className="grid gap-6 md:grid-cols-5">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Start Date
                                    </label>
                                    <Input 
                                        name="v_start" 
                                        type="date" 
                                        defaultValue={(visits_filters as any)?.v_start || ''} 
                                        className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        End Date
                                    </label>
                                    <Input 
                                        name="v_end" 
                                        type="date" 
                                        defaultValue={(visits_filters as any)?.v_end || ''} 
                                        className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Stethoscope className="h-4 w-4" />
                                        Attending Doctor
                                    </label>
                                    <Input 
                                        name="v_doctor" 
                                        placeholder="Doctor name" 
                                        defaultValue={(visits_filters as any)?.v_doctor || ''} 
                                        className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        Sort Order
                                    </label>
                                    <select
                                        name="v_sort_dir"
                                        defaultValue={(visits_filters as any)?.v_sort_dir || 'desc'}
                                        className="w-full h-12 rounded-xl border border-gray-300 px-3 text-sm focus:border-purple-500 focus:ring-purple-500 shadow-sm"
                                    >
                                        <option value="asc">Ascending (Oldest First)</option>
                                        <option value="desc">Descending (Newest First)</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <Button 
                                        type="submit" 
                                        className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                                    >
                                        <Filter className="mr-2 h-4 w-4" />
                                        Apply Filters
                                    </Button>
                                </div>
                            </div>
                        </form>

                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="hover:bg-gray-50">
                                        <TableHead className="font-semibold text-gray-700">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Patient No.
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700">Last Name</TableHead>
                                        <TableHead className="font-semibold text-gray-700">First Name</TableHead>
                                        <TableHead className="font-semibold text-gray-700">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Arrival Date
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Arrival Time
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700">
                                            <div className="flex items-center gap-2">
                                                <Stethoscope className="h-4 w-4" />
                                                Attending Physician
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visits.map((v: any) => (
                                        <TableRow key={v.id} className="hover:bg-purple-50/50 transition-colors border-b border-gray-100">
                                            <TableCell className="font-semibold text-purple-600">{v.patient?.patient_no || '—'}</TableCell>
                                            <TableCell className="font-medium text-gray-900">{v.patient?.last_name}</TableCell>
                                            <TableCell className="text-gray-700">{v.patient?.first_name}</TableCell>
                                            <TableCell className="text-gray-600">{new Date(v.arrival_date).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-gray-600">{String(v.arrival_time).match(/\d{2}:\d{2}/)?.[0] || v.arrival_time}</TableCell>
                                            <TableCell className="text-gray-700">{v.attending_physician}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        v.status === 'completed' 
                                                            ? 'success' 
                                                            : v.status === 'active'
                                                            ? 'success'
                                                            : 'destructive'
                                                    }
                                                >
                                                    {v.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                    {v.status === 'active' && <AlertCircle className="w-3 h-3 mr-1" />}
                                                    {v.status === 'discharged' && <XCircle className="w-3 h-3 mr-1" />}
                                                    {v.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button asChild className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                                    <Link href={`/admin/patient/${v.patient?.id}?tab=visits`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {visits_pagination?.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-center gap-3">
                                <Button
                                    variant="ghost"
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
                                    className="px-4 py-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </Button>
                                <div className="bg-purple-50 px-4 py-2 rounded-lg">
                                    <span className="text-sm font-medium text-purple-700">
                                        Page {visits_pagination.current_page} of {visits_pagination.last_page}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
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
                                    className="px-4 py-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
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

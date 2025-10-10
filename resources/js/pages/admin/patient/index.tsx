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
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { CustomDatePicker } from '@/components/ui/date-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PatientPageLayout, PatientActionButton, PatientInfoCard, PatientStatusBadge } from '@/components/patient/PatientPageLayout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PatientItem } from '@/types/patients';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    Edit, Eye, Plus, Search, Filter, Calendar, User, Phone, Mail, MapPin, Clock, 
    Stethoscope, CheckCircle, AlertCircle, XCircle, Activity, TrendingUp,
    FileText, Heart, Calendar as CalendarIcon, UserCheck, BarChart3, ArrowLeft, ArrowRight, UserPlus, Users
} from 'lucide-react';
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

    // Mock data for statistics
    const stats = {
        totalPatients: patients_pagination?.total || 0,
        activeVisits: visits.filter((v: any) => v.status === 'active').length,
        completedVisits: visits.filter((v: any) => v.status === 'completed').length,
        newThisMonth: Math.floor(Math.random() * 20) + 5
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patient Management" />
            <PatientPageLayout
                title="Patient Management"
                description="Comprehensive patient records and visit history management"
                stats={stats}
                actions={
                    <PatientActionButton
                        variant="default"
                        icon={<User className="h-4 w-4" />}
                        label="Register New Patient"
                        href="/admin/patient/create"
                        className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    />
                }
            >

                    {/* Main Content with Tabs */}
                    <div className="space-y-6">
                        <Tabs defaultValue="patients" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
                                <TabsTrigger value="patients" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm">
                                    <Users className="h-4 w-4" />
                                    Patient Records
                                </TabsTrigger>
                                <TabsTrigger value="visits" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm">
                                    <Calendar className="h-4 w-4" />
                                    Visit History
                                </TabsTrigger>
                            </TabsList>

                        <TabsContent value="patients" className="space-y-6 mt-4">
                            {/* Patient Records Card */}
                            <PatientInfoCard
                                title="Patient Records"
                                icon={<Users className="h-5 w-5 text-black" />}
                            >
                                {/* Search and Filter */}
                                <div className="flex items-center gap-4">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search patients by name..."
                                            value={pSearch}
                                            onChange={(e) => setPSearch(e.target.value)}
                                            className="pl-10 h-10 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-lg shadow-sm"
                                        />
                                    </div>
                                    <Select defaultValue={patients_filters?.p_sort_by || 'last_name'}>
                                        <SelectTrigger className="w-48 h-10">
                                            <SelectValue placeholder="Sort by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="last_name">Last Name</SelectItem>
                                            <SelectItem value="first_name">First Name</SelectItem>
                                            <SelectItem value="patient_no">Patient No.</SelectItem>
                                            <SelectItem value="age">Age</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <PatientActionButton
                                        variant="default"
                                        icon={<Search className="h-4 w-4" />}
                                        label="Search"
                                        onClick={() =>
                                            router.visit(
                                                `/admin/patient?p_search=${encodeURIComponent(pSearch)}&p_sort_by=${encodeURIComponent(
                                                    patients_filters?.p_sort_by || 'last_name',
                                                )}&p_sort_dir=${patients_filters?.p_sort_dir || 'asc'}`,
                                            )
                                        }
                                        className="bg-gray-600 hover:bg-gray-700 text-white"
                                    />
                                </div>
                                    
                                    {/* Modern Patient Table */}
                                    <div className="mt-8 overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                        <Table>
                                            <TableHeader className="bg-gray-50">
                                                <TableRow>
                                                    <TableHead className="font-semibold text-gray-700">Patient No.</TableHead>
                                                    <TableHead className="font-semibold text-gray-700">Name</TableHead>
                                                    <TableHead className="font-semibold text-gray-700">Gender</TableHead>
                                                    <TableHead className="font-semibold text-gray-700">Age</TableHead>
                                                    <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                                                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                                    <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {patients.map((p: any) => (
                                                    <TableRow key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <TableCell className="font-semibold text-black">
                                                            {p.patient_no || '—'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium text-gray-900">{p.last_name}, {p.first_name}</div>
                                                                <div className="text-sm text-gray-500">{p.email || 'No email'}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge 
                                                                variant={p.sex === 'male' ? 'default' : 'secondary'}
                                                                className='bg-gray-100 text-black'
                                                            >
                                                                {p.sex}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-gray-600">{p.age} years</TableCell>
                                                        <TableCell className="text-gray-600">{p.mobile_no}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="bg-gray-50 text-black border-gray-200">
                                                                Active
                                                            </Badge>
                                                        </TableCell>
                                                                <TableCell>
                                                                    <div className="flex gap-2">
                                                                        <PatientActionButton
                                                                            variant="outline"
                                                                            size="sm"
                                                                            icon={<Eye className="h-4 w-4" />}
                                                                            label="View"
                                                                            href={`/admin/patient/${p.id}`}
                                                                        />
                                                                        <PatientActionButton
                                                                            variant="outline"
                                                                            size="sm"
                                                                            icon={<Edit className="h-4 w-4" />}
                                                                            label="Edit"
                                                                            href={`/admin/patient/${p.id}/edit`}
                                                                        />
                                                                    </div>
                                                                </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    
                                {/* Pagination */}
                                {patients_pagination?.last_page > 1 && (
                                    <div className="flex items-center justify-center gap-3 pt-4">
                                        <PatientActionButton
                                            variant="outline"
                                            size="sm"
                                            icon={<ArrowLeft className="h-4 w-4" />}
                                            label="Previous"
                                            disabled={patients_pagination.current_page === 1}
                                            onClick={() =>
                                                router.visit(
                                                    `/admin/patient?p_page=${patients_pagination.current_page - 1}&p_search=${encodeURIComponent(
                                                        pSearch,
                                                    )}&p_sort_by=${patients_filters?.p_sort_by || 'patient_no'}&p_sort_dir=${patients_filters?.p_sort_dir || 'asc'}`,
                                                )
                                            }
                                            className="px-4 py-2"
                                        />
                                        <div className="bg-gray-50 px-4 py-2 rounded-lg">
                                            <span className="text-sm font-medium text-black">
                                                Page {patients_pagination.current_page} of {patients_pagination.last_page}
                                            </span>
                                        </div>
                                        <PatientActionButton
                                            variant="outline"
                                            size="sm"
                                            icon={<ArrowRight className="h-4 w-4" />}
                                            label="Next"
                                            disabled={patients_pagination.current_page === patients_pagination.last_page}
                                            onClick={() =>
                                                router.visit(
                                                    `/admin/patient?p_page=${patients_pagination.current_page + 1}&p_search=${encodeURIComponent(
                                                        pSearch,
                                                    )}&p_sort_by=${patients_filters?.p_sort_by || 'patient_no'}&p_sort_dir=${patients_filters?.p_sort_dir || 'asc'}`,
                                                )
                                            }
                                            className="px-4 py-2"
                                        />
                                    </div>
                                )}
                            </PatientInfoCard>
                        </TabsContent>

                        <TabsContent value="visits" className="space-y-6 mt-4">
                            {/* Visit History Card */}
                            <PatientInfoCard
                                title="Visit History"
                                icon={<Calendar className="h-5 w-5 text-black" />}
                            >
                                {/* Visit Filters */}
                                <div className="flex flex-wrap gap-3 items-end">
                                    <div className="flex-1 min-w-[180px]">
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Start Date</label>
                                        <Input
                                            type="date"
                                            name="v_start"
                                            defaultValue={(visits_filters as any)?.v_start || ''}
                                            className="h-10 w-full"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-[180px]">
                                        <label className="mb-1 block text-sm font-medium text-gray-700">End Date</label>
                                        <Input
                                            type="date"
                                            name="v_end"
                                            defaultValue={(visits_filters as any)?.v_end || ''}
                                            className="h-10 w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Doctor</label>
                                        <Input 
                                            name="v_doctor" 
                                            placeholder="Doctor name" 
                                            defaultValue={(visits_filters as any)?.v_doctor || ''} 
                                            className="h-10"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <PatientActionButton
                                            variant="default"
                                            icon={<Filter className="h-4 w-4" />}
                                            label="Filter"
                                            className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                                        />
                                    </div>
                                </div>
                                    
                                    {/* Visit History Table */}
                                    <div className="mt-8 overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                        <Table>
                                            <TableHeader className="bg-gray-50">
                                                <TableRow>
                                                    <TableHead className="font-semibold text-gray-700">Patient</TableHead>
                                                    <TableHead className="font-semibold text-gray-700">Date & Time</TableHead>
                                                    <TableHead className="font-semibold text-gray-700">Doctor</TableHead>
                                                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                                    <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {visits.map((v: any) => (
                                                    <TableRow key={v.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium text-gray-900">{v.patient?.last_name}, {v.patient?.first_name}</div>
                                                                <div className="text-sm text-gray-500">{v.patient?.patient_no || '—'}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <div className="text-gray-900">{new Date(v.arrival_date).toLocaleDateString()}</div>
                                                                <div className="text-sm text-gray-500">{String(v.arrival_time).match(/\d{2}:\d{2}/)?.[0] || v.arrival_time}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-gray-700">{v.attending_physician}</TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={
                                                                    v.status === 'completed' 
                                                                        ? 'default' 
                                                                        : v.status === 'active'
                                                                        ? 'secondary'
                                                                        : 'destructive'
                                                                }
                                                                className='bg-gray-100 text-black'
                                                            >
                                                                {v.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                                {v.status === 'active' && <AlertCircle className="w-3 h-3 mr-1" />}
                                                                {v.status === 'discharged' && <XCircle className="w-3 h-3 mr-1" />}
                                                                {v.status}
                                                            </Badge>
                                                        </TableCell>
                                                                <TableCell>
                                                                    <PatientActionButton
                                                                        variant="outline"
                                                                        size="sm"
                                                                        icon={<Eye className="h-4 w-4" />}
                                                                        label="View"
                                                                        href={`/admin/patient/${v.patient?.id}?tab=visits`}
                                                                    />
                                                                </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    
                                {/* Visit Pagination */}
                                {visits_pagination?.last_page > 1 && (
                                    <div className="flex items-center justify-center gap-3 pt-4">
                                        <PatientActionButton
                                            variant="outline"
                                            size="sm"
                                            icon={<ArrowLeft className="h-4 w-4" />}
                                            label="Previous"
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
                                            className="px-4 py-2"
                                        />
                                        <div className="bg-gray-50 px-4 py-2 rounded-lg">
                                            <span className="text-sm font-medium text-black">
                                                Page {visits_pagination.current_page} of {visits_pagination.last_page}
                                            </span>
                                        </div>
                                        <PatientActionButton
                                            variant="outline"
                                            size="sm"
                                            icon={<ArrowRight className="h-4 w-4" />}
                                            label="Next"
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
                                            className="px-4 py-2"
                                        />
                                    </div>
                                )}
                            </PatientInfoCard>
                        </TabsContent>
                        </Tabs>
                    </div>
            </PatientPageLayout>
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
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
    FileText, Heart, Calendar as CalendarIcon, UserCheck, BarChart3, ArrowLeft, ArrowRight, UserPlus, Users, Trash2
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
    visit_date_time: string;
    attending_physician: string;
    status: 'active' | 'completed' | 'discharged';
};

export default function Patient(props: {
    patients: PatientItem[];
    patients_pagination: Pagination;
    patients_filters: { p_search: string; p_sort_by: string; p_sort_dir: 'asc' | 'desc' };
}) {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
    const [patientToDelete, setPatientToDelete] = React.useState<PatientItem | null>(null);

    const handleDeletePatient = (patient: PatientItem) => {
        setPatientToDelete(patient);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (patientToDelete) {
            router.delete(`/admin/patient/${patientToDelete.id}`, {
                onSuccess: () => {
                    setDeleteConfirmOpen(false);
                    setPatientToDelete(null);
                },
            });
        }
    };
    const { patients, patients_pagination, patients_filters } = props as any;
    const [pSearch, setPSearch] = React.useState<string>(patients_filters?.p_search || '');
    const [sortBy, setSortBy] = React.useState<string>(patients_filters?.p_sort_by || 'patient_no');
    const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>(patients_filters?.p_sort_dir || 'asc');
    const created = (usePage().props as any).flash?.created_patient as
        | { id: number; last_name: string; first_name: string; age: number; sex: string }
        | undefined;
    const [open, setOpen] = React.useState(Boolean(created));

    // Handle sorting
    const handleSort = (field: string) => {
        const newSortDir = sortBy === field && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(field);
        setSortDir(newSortDir);
        router.get('/admin/patient', {
            p_search: pSearch,
            p_sort_by: field,
            p_sort_dir: newSortDir,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    // Mock data for statistics
    const stats = {
        totalPatients: patients_pagination?.total || 0,
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
                            <TabsList className="grid w-full grid-cols-1 bg-gray-100 p-1 rounded-lg">
                                <TabsTrigger value="patients" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm">
                                    <Users className="h-4 w-4" />
                                    Patient Records
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
                                                    <TableHead 
                                                        className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('patient_no')}
                                                    >
                                                        Patient No.
                                                        {sortBy === 'patient_no' && (
                                                            <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                                                        )}
                                                    </TableHead>
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
                                                                <div className="font-medium text-gray-900">{p.first_name} {p.last_name}</div>
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
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleDeletePatient(p)}
                                                                            className="text-red-600 border-red-300 hover:bg-red-50 min-w-[75px] px-3"
                                                                        >
                                                                            <Trash2 className="h-4 w-4 mr-1" />
                                                                            Delete
                                                                        </Button>
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Patient</AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-gray-600">
                            Are you sure you want to delete <strong>{patientToDelete?.first_name} {patientToDelete?.last_name}</strong>? 
                            This will also delete all associated appointments and visits. This action cannot be undone.
                        </p>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete Patient
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Plus, Search, Trash2, UserCheck, Stethoscope } from 'lucide-react';
import Heading from '@/components/heading';
import { useState } from 'react';

type Doctor = {
    id: number;
    name: string;
    email: string;
    specialization?: string;
    license_number?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Doctor Management',
        href: '/admin/doctors',
    },
];

export default function DoctorIndex({ doctors }: { doctors: Doctor[] }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDoctors = doctors.filter((doctor) => {
        const search = searchTerm.toLowerCase();
        return (
            doctor.name.toLowerCase().includes(search) ||
            doctor.email.toLowerCase().includes(search) ||
            doctor.specialization?.toLowerCase().includes(search) ||
            doctor.license_number?.toLowerCase().includes(search)
        );
    });

    const handleDelete = (doctorId: number, doctorName: string) => {
        if (confirm(`Are you sure you want to delete Dr. ${doctorName}? This action cannot be undone.`)) {
            router.delete(`/admin/doctors/${doctorId}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Doctor Management" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Heading title="Doctor Management" description="Manage clinic doctors and their information" icon={Stethoscope} />
                        <div className="flex items-center gap-4">
                            <div className="counter-card text-white rounded-xl shadow-lg border-0 px-6 py-4 w-52 h-20 flex items-center">
                                <div className="flex items-center gap-3">
                                    <div className="counter-icon p-2 rounded-lg border border-white/60">
                                        <Stethoscope className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold">{doctors.length}</div>
                                        <div className="text-blue-100 text-sm font-medium">Total Doctors</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Doctors Section */}
                <div className="holographic-card shadow-lg border-0 mb-8 overflow-hidden rounded-lg bg-white">
                    {/* Header Section - No gaps */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                    <Stethoscope className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Doctor Records</h3>
                                    <p className="text-blue-100 mt-1">Search and manage doctor information</p>
                                </div>
                            </div>
                            <Button asChild className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl">
                                <Link href="/admin/doctors/create">
                                    <Plus className="mr-3 h-6 w-6" />
                                    Add New Doctor
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
                                        placeholder="Search doctors by name, email, specialization..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="hover:bg-gray-50">
                                        <TableHead className="font-semibold text-gray-700">
                                            <div className="flex items-center gap-2">
                                                <Stethoscope className="h-4 w-4" />
                                                Doctor Name
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700">Email</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Specialization</TableHead>
                                        <TableHead className="font-semibold text-gray-700">License Number</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDoctors.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                <div className="flex flex-col items-center">
                                                    <UserCheck className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                    <h3 className="mb-2 text-lg font-semibold text-gray-600">{searchTerm ? 'No doctors found' : 'No doctors registered yet'}</h3>
                                                    <p className="text-gray-500">
                                                        {searchTerm ? 'Try adjusting your search terms' : 'Add doctors to the system to get started'}
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredDoctors.map((doctor) => (
                                            <TableRow key={doctor.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1 bg-blue-100 rounded-full">
                                                            <Stethoscope className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        Dr. {doctor.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">{doctor.email}</TableCell>
                                                <TableCell className="text-sm text-gray-600">{doctor.specialization || 'Not specified'}</TableCell>
                                                <TableCell className="text-sm text-gray-600">{doctor.license_number || 'Not provided'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={doctor.is_active ? 'success' : 'secondary'}>
                                                        {doctor.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-3">
                                                        <Button asChild className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                                            <Link href={`/admin/doctors/${doctor.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                        <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl" onClick={() => handleDelete(doctor.id, doctor.name)}>
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

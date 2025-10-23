import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Search, Trash2, UserCheck, Calendar } from 'lucide-react';
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

    const safeDoctors = Array.isArray(doctors) ? doctors : [];
    const filteredDoctors = safeDoctors.filter((doctor) => {
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
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="mb-4 text-4xl font-semibold text-black">Doctor Management</h1>
                                <p className="mt-1 text-sm text-black">Manage clinic doctors and medical staff</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl border bg-white px-6 py-4 shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gray-100 p-2">
                                        <UserCheck className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-black">{doctors.length}</div>
                                        <div className="text-sm font-medium text-black">Total Doctors</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content layout */}
                <div className="space-y-6">
                    <Card className="rounded-xl border-0 bg-white shadow-lg">
                        <CardHeader className="border-b border-gray-200 bg-white">
                            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                <UserCheck className="h-5 w-5 text-black" />
                                Doctor Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="relative max-w-md flex-1">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                        <Input
                                            placeholder="Search doctors..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="h-12 rounded-xl border-gray-200 pl-10 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                                        />
                                    </div>
                                </div>
                                <Button
                                    asChild
                                    className="rounded-xl bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-gray-700 hover:shadow-xl"
                                >
                                    <Link href="/admin/doctors/create">
                                        <Plus className="mr-3 h-6 w-6" />
                                        Add New Doctor
                                    </Link>
                                </Button>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-gray-100">
                                            <TableHead className="font-semibold text-black">
                                                <div className="flex items-center gap-2">
                                                    <UserCheck className="h-4 w-4" />
                                                    Doctor Name
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-semibold text-black">Email</TableHead>
                                            <TableHead className="font-semibold text-black">Specialization</TableHead>
                                            <TableHead className="font-semibold text-black">License</TableHead>
                                            <TableHead className="font-semibold text-black">Status</TableHead>
                                            <TableHead className="font-semibold text-black">Created</TableHead>
                                            <TableHead className="font-semibold text-black">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredDoctors.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="py-8 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <UserCheck className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                        <h3 className="mb-2 text-lg font-semibold text-black">
                                                            {searchTerm ? 'No doctors found' : 'No doctors registered yet'}
                                                        </h3>
                                                        <p className="text-black">
                                                            {searchTerm ? 'Try adjusting your search terms' : 'Add your first doctor to get started'}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredDoctors.map((doctor) => (
                                                <TableRow key={doctor.id} className="hover:bg-gray-50">
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <div className="rounded-full bg-gray-100 p-1">
                                                                <UserCheck className="h-4 w-4 text-black" />
                                                            </div>
                                                            {doctor.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-black">{doctor.email}</TableCell>
                                                    <TableCell className="text-sm text-black">{doctor.specialization || 'N/A'}</TableCell>
                                                    <TableCell className="font-mono text-sm text-black">{doctor.license_number || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={doctor.is_active ? 'success' : 'secondary'}>
                                                            {doctor.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-black">
                                                        {new Date(doctor.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-3">
                                                            <Button asChild size="sm">
                                                                <Link href={`/admin/doctors/${doctor.id}/edit`}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </Link>
                                                            </Button>
                                                            <Button asChild size="sm" variant="outline">
                                                                <Link href={`/admin/specialists/doctors/${doctor.id}/schedule`}>
                                                                    <Calendar className="mr-2 h-4 w-4" />
                                                                    Schedule
                                                                </Link>
                                                            </Button>
                                                            <Button asChild size="sm" variant="outline">
                                                                <Link href={`/admin/doctors/${doctor.id}`}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleDelete(doctor.id, doctor.name)}
                                                            >
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
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

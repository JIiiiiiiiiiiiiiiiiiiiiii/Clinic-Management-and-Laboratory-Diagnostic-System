import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Plus, Search, Trash2, UserCheck } from 'lucide-react';
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
    { title: 'Admin', href: '/admin' },
    { title: 'Doctor Management', href: '/admin/doctors' },
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
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">Doctor Management</h1>
                            <p className="text-muted-foreground">Manage clinic doctors and their information</p>
                        </div>
                    </div>
                    <Button onClick={() => router.visit('/admin/doctors/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Doctor
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>All Doctors</CardTitle>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email, specialization, or license..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-80 pl-10"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredDoctors.length === 0 ? (
                            <div className="py-8 text-center">
                                <UserCheck className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold">{searchTerm ? 'No doctors found' : 'No doctors registered yet'}</h3>
                                <p className="text-muted-foreground">
                                    {searchTerm ? 'Try adjusting your search terms' : 'Add doctors to the system to get started'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredDoctors.map((doctor) => (
                                    <Card key={doctor.id} className="transition-shadow hover:shadow-md">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-center gap-3">
                                                        <h3 className="text-lg font-semibold">Dr. {doctor.name}</h3>
                                                        <Badge variant={doctor.is_active ? 'default' : 'secondary'}>
                                                            {doctor.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>

                                                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                                        <div>
                                                            <span className="text-sm text-muted-foreground">Email:</span>
                                                            <div className="text-sm">{doctor.email}</div>
                                                        </div>

                                                        <div>
                                                            <span className="text-sm text-muted-foreground">Specialization:</span>
                                                            <div className="text-sm">{doctor.specialization || 'Not specified'}</div>
                                                        </div>

                                                        <div>
                                                            <span className="text-sm text-muted-foreground">License Number:</span>
                                                            <div className="text-sm">{doctor.license_number || 'Not provided'}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="ml-4 flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.visit(`/admin/doctors/${doctor.id}/edit`)}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleDelete(doctor.id, doctor.name)}>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

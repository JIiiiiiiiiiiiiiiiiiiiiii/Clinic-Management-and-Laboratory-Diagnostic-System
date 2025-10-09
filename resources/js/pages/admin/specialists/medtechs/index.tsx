import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2, UserCheck, Stethoscope } from 'lucide-react';
import { useState } from 'react';

type MedTech = {
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
        title: 'Specialist Management',
        href: '/admin/specialists',
    },
    {
        title: 'Med Techs',
        href: '/admin/specialists/medtechs',
    },
];

export default function MedTechIndex({ medtechs }: { medtechs: MedTech[] }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMedTechs = medtechs.filter(medtech =>
        medtech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medtech.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (medtech.specialization && medtech.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDelete = (medtechId: number) => {
        if (confirm('Are you sure you want to delete this med tech?')) {
            router.delete(`/admin/specialists/medtechs/${medtechId}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Med Tech Management" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Med Tech Management</h1>
                                <p className="text-sm text-black mt-1">Manage clinic medical technologists and lab staff</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <UserCheck className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-black">{medtechs.length}</div>
                                        <div className="text-black text-sm font-medium">Total Med Techs</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Actions */}
                <Card className="shadow-lg border-0 rounded-xl bg-white mb-6">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search med techs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 w-80"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link href="/admin/specialists/medtechs/create">
                                    <Button className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add Med Tech
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Med Techs Table */}
                <Card className="shadow-lg border-0 rounded-xl bg-white">
                    <CardHeader className="bg-white border-b border-gray-200">
                        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                            <Stethoscope className="h-5 w-5 text-black" />
                            Med Techs ({filteredMedTechs.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="text-black font-semibold">Name</TableHead>
                                        <TableHead className="text-black font-semibold">Email</TableHead>
                                        <TableHead className="text-black font-semibold">Specialization</TableHead>
                                        <TableHead className="text-black font-semibold">License Number</TableHead>
                                        <TableHead className="text-black font-semibold">Status</TableHead>
                                        <TableHead className="text-black font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredMedTechs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                No med techs found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredMedTechs.map((medtech) => (
                                            <TableRow key={medtech.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium text-black">
                                                    {medtech.name}
                                                </TableCell>
                                                <TableCell className="text-black">{medtech.email}</TableCell>
                                                <TableCell className="text-black">
                                                    {medtech.specialization || 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-black">
                                                    {medtech.license_number || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={medtech.is_active ? 'default' : 'secondary'}
                                                        className={medtech.is_active ? 'bg-gray-100 text-black' : 'bg-gray-100 text-gray-800'}
                                                    >
                                                        {medtech.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/admin/specialists/medtechs/${medtech.id}/edit`}>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-black border-gray-300 hover:bg-gray-50"
                                                            >
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(medtech.id)}
                                                            className="text-black border-gray-300 hover:bg-gray-50"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
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
        </AppLayout>
    );
}
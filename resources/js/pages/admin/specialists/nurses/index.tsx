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

type Nurse = {
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
        title: 'Nurses',
        href: '/admin/specialists/nurses',
    },
];

export default function NurseIndex({ nurses }: { nurses: Nurse[] }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredNurses = nurses.filter(nurse =>
        nurse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nurse.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (nurse.specialization && nurse.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDelete = (nurseId: number) => {
        if (confirm('Are you sure you want to delete this nurse?')) {
            router.delete(`/admin/specialists/nurses/${nurseId}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nurse Management" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Nurse Management</h1>
                                <p className="text-sm text-black mt-1">Manage clinic nurses and nursing staff</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <UserCheck className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-black">{nurses.length}</div>
                                        <div className="text-black text-sm font-medium">Total Nurses</div>
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
                                        placeholder="Search nurses..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 w-80"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link href="/admin/specialists/nurses/create">
                                    <Button className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add Nurse
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Nurses Table */}
                <Card className="shadow-lg border-0 rounded-xl bg-white">
                    <CardHeader className="bg-white border-b border-gray-200">
                        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                            <Stethoscope className="h-5 w-5 text-black" />
                            Nurses ({filteredNurses.length})
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
                                    {filteredNurses.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                No nurses found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredNurses.map((nurse) => (
                                            <TableRow key={nurse.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium text-black">
                                                    {nurse.name}
                                                </TableCell>
                                                <TableCell className="text-black">{nurse.email}</TableCell>
                                                <TableCell className="text-black">
                                                    {nurse.specialization || 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-black">
                                                    {nurse.license_number || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={nurse.is_active ? 'default' : 'secondary'}
                                                        className={nurse.is_active ? 'bg-gray-100 text-black' : 'bg-gray-100 text-gray-800'}
                                                    >
                                                        {nurse.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/admin/specialists/nurses/${nurse.id}/edit`}>
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
                                                            onClick={() => handleDelete(nurse.id)}
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
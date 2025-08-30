import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Filter, FlaskConical, Plus, Search } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Laboratory', href: '/admin/laboratory' },
];

// Mock data - in real app this would come from props
const labTests = [
    {
        id: 1,
        patientName: 'John Doe',
        patientId: 'P001',
        testType: 'Blood Test',
        requestedBy: 'Dr. Smith',
        status: 'In Progress',
        requestedDate: '2025-04-24',
        priority: 'High',
        labTechnician: 'Sarah Johnson',
    },
    {
        id: 2,
        patientName: 'Jane Smith',
        patientId: 'P002',
        testType: 'Urinalysis',
        requestedBy: 'Dr. Johnson',
        status: 'Completed',
        requestedDate: '2025-04-23',
        priority: 'Normal',
        labTechnician: 'Mike Wilson',
    },
    {
        id: 3,
        patientName: 'Bob Johnson',
        patientId: 'P003',
        testType: 'CBC',
        requestedBy: 'Dr. Davis',
        status: 'Pending',
        requestedDate: '2025-04-24',
        priority: 'Normal',
        labTechnician: 'Sarah Johnson',
    },
];

const getStatusBadge = (status: string) => {
    const statusConfig = {
        Pending: 'bg-yellow-100 text-yellow-800',
        'In Progress': 'bg-blue-100 text-blue-800',
        Completed: 'bg-green-100 text-green-800',
        Cancelled: 'bg-red-100 text-red-800',
    };

    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
};

const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
        High: 'bg-red-100 text-red-800',
        Normal: 'bg-green-100 text-green-800',
        Low: 'bg-gray-100 text-gray-800',
    };

    return priorityConfig[priority as keyof typeof priorityConfig] || 'bg-gray-100 text-gray-800';
};

export default function LaboratoryIndex() {
    const { permissions, canAccessModule } = useRoleAccess();

    // Redirect if user doesn't have access to laboratory
    if (!permissions.canAccessLaboratory) {
        router.visit('/admin/dashboard');
        return null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laboratory Management" />

            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Laboratory Management</h1>
                            <p className="text-gray-500">Manage and track all laboratory test requests and results</p>
                        </div>
                        {permissions.canCreateLabTests && (
                            <Button asChild>
                                <Link href="/admin/laboratory/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Test Request
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Tests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">156</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">23</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">In Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">45</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">88</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Search and filter laboratory tests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input placeholder="Search by patient name, test type, or ID..." className="pl-10" />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filter by Status
                                </Button>
                                <Button variant="outline">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filter by Priority
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tests Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Test Requests</CardTitle>
                        <CardDescription>A list of laboratory test requests and their current status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Test Type</TableHead>
                                    <TableHead>Requested By</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Requested Date</TableHead>
                                    <TableHead>Lab Technician</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {labTests.map((test) => (
                                    <TableRow key={test.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{test.patientName}</div>
                                                <div className="text-sm text-gray-500">ID: {test.patientId}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <FlaskConical className="h-4 w-4 text-blue-500" />
                                                {test.testType}
                                            </div>
                                        </TableCell>
                                        <TableCell>{test.requestedBy}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusBadge(test.status)}>{test.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getPriorityBadge(test.priority)}>{test.priority}</Badge>
                                        </TableCell>
                                        <TableCell>{test.requestedDate}</TableCell>
                                        <TableCell>{test.labTechnician}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/admin/laboratory/${test.id}`}>View</Link>
                                                </Button>
                                                {permissions.canEditLabTests && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/admin/laboratory/${test.id}/edit`}>Edit</Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Calendar, FileText, Heart, User } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Patient Dashboard', href: '/patient/dashboard' },
    { title: 'Medical Records', href: '/patient/records' },
];

// Mock data - in real app this would come from props
const medicalRecords = [
    {
        id: 1,
        date: '2025-04-20',
        type: 'Consultation',
        doctor: 'Dr. Smith',
        diagnosis: 'Hypertension',
        treatment: 'Lisinopril 10mg daily',
        notes: 'Blood pressure elevated, monitor weekly',
        status: 'Active',
    },
    {
        id: 2,
        date: '2025-03-15',
        type: 'Annual Check-up',
        doctor: 'Dr. Johnson',
        diagnosis: 'Healthy',
        treatment: 'None required',
        notes: 'All vitals normal, continue healthy lifestyle',
        status: 'Completed',
    },
    {
        id: 3,
        date: '2025-02-10',
        type: 'Follow-up',
        doctor: 'Dr. Smith',
        diagnosis: 'Hypertension',
        treatment: 'Lisinopril 10mg daily',
        notes: 'Blood pressure improving, continue medication',
        status: 'Completed',
    },
];

const getStatusBadge = (status: string) => {
    const statusConfig = {
        Active: 'bg-blue-100 text-blue-800',
        Completed: 'bg-green-100 text-green-800',
        Pending: 'bg-yellow-100 text-yellow-800',
    };

    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
};

export default function PatientRecords() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Medical Records" />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
                    <p className="text-gray-500">Your complete medical history and treatment records</p>
                </div>

                {/* Summary Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Records</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{medicalRecords.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Active Treatments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{medicalRecords.filter((r) => r.status === 'Active').length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Last Visit</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{medicalRecords[0]?.date || 'N/A'}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Primary Doctor</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">Dr. Smith</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Medical Records Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    Medical History
                                </CardTitle>
                                <CardDescription>A comprehensive list of your medical records and treatments</CardDescription>
                            </div>
                            <Button variant="outline">
                                <FileText className="mr-2 h-4 w-4" />
                                Export Records
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Diagnosis</TableHead>
                                    <TableHead>Treatment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {medicalRecords.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-500" />
                                                {record.date}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-blue-500" />
                                                {record.type}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-green-500" />
                                                {record.doctor}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Heart className="h-4 w-4 text-red-500" />
                                                {record.diagnosis}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs">{record.treatment}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusBadge(record.status)}>{record.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm">
                                                View Details
                                            </Button>
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

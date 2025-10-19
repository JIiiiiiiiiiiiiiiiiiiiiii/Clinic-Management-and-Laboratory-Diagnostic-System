import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, Eye, Users } from 'lucide-react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { title: 'Reports', href: route('hospital.reports.index') },
    { title: 'Patient Reports', href: route('hospital.reports.patients') },
];

interface Patient {
    id: number;
    patient_no: string;
    full_name: string;
    birthdate: string;
    age: number;
    sex: string;
    mobile_no: string;
    present_address: string;
    occupation: string;
    civil_status: string;
    created_at: string;
}

interface Props {
    patients: {
        data: Patient[];
        links: any[];
        meta: any;
    };
    stats: any;
    dateRange: {
        start: string;
        end: string;
        period: string;
        label: string;
    };
    filters: any;
}

export default function HospitalPatientReports({ patients, stats, dateRange, filters }: Props) {
    const getSexBadgeColor = (sex: string) => {
        switch (sex.toLowerCase()) {
            case 'male':
                return 'bg-blue-100 text-blue-800';
            case 'female':
                return 'bg-pink-100 text-pink-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patient Reports - Hospital" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Patient Reports</h1>
                        <p className="text-muted-foreground">Patient statistics and demographics for {dateRange.label}</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" asChild>
                            <Link href={route('hospital.reports.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Reports
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('hospital.reports.export', 'patients')}>
                                <Download className="mr-2 h-4 w-4" />
                                Export Data
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_patients || 0}</div>
                            <p className="text-xs text-muted-foreground">{dateRange.label}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Male Patients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats?.male_patients || 0}</div>
                            <p className="text-xs text-muted-foreground">{stats?.male_percentage || 0}% of total</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Female Patients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-pink-600">{stats?.female_patients || 0}</div>
                            <p className="text-xs text-muted-foreground">{stats?.female_percentage || 0}% of total</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Age</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.average_age || 0}</div>
                            <p className="text-xs text-muted-foreground">years old</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Patients Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Patient Records</CardTitle>
                        <CardDescription>Detailed patient information for the selected period</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {patients.data && patients.data.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Patient No</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Age</TableHead>
                                        <TableHead>Sex</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Registered</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patients.data.map((patient) => (
                                        <TableRow key={patient.id}>
                                            <TableCell className="font-medium">{patient.patient_no}</TableCell>
                                            <TableCell>{patient.full_name}</TableCell>
                                            <TableCell>{patient.age}</TableCell>
                                            <TableCell>
                                                <Badge className={getSexBadgeColor(patient.sex)}>{patient.sex}</Badge>
                                            </TableCell>
                                            <TableCell>{patient.mobile_no}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">Active</Badge>
                                            </TableCell>
                                            <TableCell>{new Date(patient.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={route('hospital.patients.show', patient.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-8 text-center">
                                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">No patients found</h3>
                                <p className="mt-1 text-sm text-gray-500">No patient records found for the selected period.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

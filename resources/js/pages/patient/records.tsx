import { PatientInfoCard } from '@/components/patient/PatientPageLayout';
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

interface PatientRecordsProps {
    user: {
        name: string;
        email: string;
        role: string;
    };
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        patient_no: string;
    };
    records: {
        visits: Array<{
            id: number;
            visit_date: string;
            chief_complaint: string;
            diagnosis: string;
            treatment: string;
            vital_signs: {
                blood_pressure: string;
                temperature: string;
                pulse_rate: string;
                respiratory_rate: string;
            };
            notes: string;
        }>;
        lab_orders: Array<{
            id: number;
            created_at: string;
            tests: string[];
            status: string;
            notes: string;
        }>;
        lab_results: Array<{
            id: number;
            test_name: string;
            result_value: string;
            normal_range: string;
            unit: string;
            status: string;
            verified_at: string | null;
            created_at: string;
        }>;
    };
}

const getStatusBadge = (status: string) => {
    const statusConfig = {
        Active: 'bg-blue-100 text-blue-800',
        Completed: 'bg-green-100 text-green-800',
        Pending: 'bg-yellow-100 text-yellow-800',
    };

    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
};

export default function PatientRecords({ user, patient, records }: PatientRecordsProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Medical Records" />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-black">Medical Records</h1>
                    <p className="text-gray-500">Your complete medical history and treatment records</p>
                </div>

                {/* Summary Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <PatientInfoCard title="Total Records" icon={<FileText className="h-5 w-5 text-blue-600" />}>
                        <div className="text-2xl font-bold">{records.visits.length}</div>
                    </PatientInfoCard>

                    <PatientInfoCard title="Active Treatments" icon={<Heart className="h-5 w-5 text-red-600" />}>
                        <div className="text-2xl font-bold text-blue-600">
                            {Array.isArray(records?.visits) ? records.visits.filter((r) => r.diagnosis && r.diagnosis !== 'Healthy').length : 0}
                        </div>
                    </PatientInfoCard>

                    <PatientInfoCard title="Last Visit" icon={<Calendar className="h-5 w-5 text-green-600" />}>
                        <div className="text-2xl font-bold text-green-600">{records.visits[0]?.visit_date || 'N/A'}</div>
                    </PatientInfoCard>

                    <PatientInfoCard title="Primary Doctor" icon={<User className="h-5 w-5 text-purple-600" />}>
                        <div className="text-2xl font-bold text-purple-600">St. James Clinic</div>
                    </PatientInfoCard>
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
                                {Array.isArray(records?.visits)
                                    ? records.visits.map((record) => (
                                          <TableRow key={record.id}>
                                              <TableCell>
                                                  <div className="flex items-center gap-2">
                                                      <Calendar className="h-4 w-4 text-gray-500" />
                                                      {record.visit_date}
                                                  </div>
                                              </TableCell>
                                              <TableCell>
                                                  <div className="flex items-center gap-2">
                                                      <FileText className="h-4 w-4 text-blue-500" />
                                                      Medical Visit
                                                  </div>
                                              </TableCell>
                                              <TableCell>
                                                  <div className="flex items-center gap-2">
                                                      <User className="h-4 w-4 text-green-500" />
                                                      St. James Clinic
                                                  </div>
                                              </TableCell>
                                              <TableCell>
                                                  <div className="flex items-center gap-2">
                                                      <Heart className="h-4 w-4 text-red-500" />
                                                      {record.diagnosis || 'N/A'}
                                                  </div>
                                              </TableCell>
                                              <TableCell className="max-w-xs">{record.treatment || 'N/A'}</TableCell>
                                              <TableCell>
                                                  <Badge className={getStatusBadge(record.diagnosis ? 'Active' : 'Completed')}>
                                                      {record.diagnosis ? 'Active' : 'Completed'}
                                                  </Badge>
                                              </TableCell>
                                              <TableCell>
                                                  <Button variant="outline" size="sm">
                                                      View Details
                                                  </Button>
                                              </TableCell>
                                          </TableRow>
                                      ))
                                    : null}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

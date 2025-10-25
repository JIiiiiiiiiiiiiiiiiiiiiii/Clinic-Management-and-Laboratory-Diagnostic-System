import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SharedNavigation from '@/components/SharedNavigation';
import { Head } from '@inertiajs/react';
import { Calendar, FileText, Heart, User } from 'lucide-react';


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
    notifications?: Array<{
        id: number;
        type: string;
        title: string;
        message: string;
        read: boolean;
        created_at: string;
        data: any;
    }>;
    unreadCount?: number;
}

const getStatusBadge = (status: string) => {
    const statusConfig = {
        Active: 'bg-blue-100 text-blue-800',
        Completed: 'bg-green-100 text-green-800',
        Pending: 'bg-yellow-100 text-yellow-800',
    };

    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
};

export default function PatientRecords({ user, patient, records, notifications = [], unreadCount = 0 }: PatientRecordsProps) {
    return (
        <div className="min-h-screen bg-white">
            <Head title="Medical Records - SJHI Industrial Clinic" />
            
            {/* Shared Navigation */}
            <SharedNavigation user={user} currentPath="/patient/records" notifications={notifications} unreadCount={unreadCount} />
            
            <div className="min-h-screen bg-gray-50 p-6">

                {/* Summary Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Total Records</p>
                                    <div className="text-2xl font-bold">0</div>
                                </div>
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-600">Active Treatments</p>
                                    <div className="text-2xl font-bold text-blue-600">0</div>
                                </div>
                                <Heart className="h-5 w-5 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600">Last Visit</p>
                                    <div className="text-2xl font-bold text-green-600">N/A</div>
                                </div>
                                <Calendar className="h-5 w-5 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600">Primary Doctor</p>
                                    <div className="text-2xl font-bold text-purple-600">St. James Clinic</div>
                                </div>
                                <User className="h-5 w-5 text-purple-600" />
                            </div>
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
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                        No medical records available. Visit history is now managed through the Patient Management system.
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

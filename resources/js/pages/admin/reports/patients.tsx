import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Calendar, Download, FileText, TrendingUp, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';

interface Patient {
    id: number;
    patient_no: string;
    full_name: string;
    birthdate: string;
    age: number;
    sex: string;
    mobile_no: string;
    present_address: string;
    created_at: string;
    appointments_count: number;
    lab_orders_count: number;
}

interface Summary {
    total_patients: number;
    new_patients: number;
    male_patients: number;
    female_patients: number;
}

interface PatientReportsProps {
    patients: {
        data: Patient[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    summary: Summary;
}

const breadcrumbs = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Reports & Analytics', href: '/admin/reports' },
    { label: 'Patient Reports', href: '/admin/reports/patients' },
];

export default function PatientReports({ patients, summary }: PatientReportsProps) {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [sex, setSex] = useState('all');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
        try {
            setIsExporting(true);
            const params = new URLSearchParams({
                format,
                date_from: dateFrom,
                date_to: dateTo,
                sex: sex,
            });
            window.location.href = `/admin/reports/export?type=patients&${params.toString()}`;

            setTimeout(() => {
                setIsExporting(false);
            }, 2000);
        } catch (error) {
            console.error('Export failed:', error);
            setIsExporting(false);
        }
    };

    const calculateAge = (birthdate: string) => {
        const today = new Date();
        const birth = new Date(birthdate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs as any}>
            <Head title="Patient Reports" />
            <div className="min-h-screen bg-white p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="mb-4 text-4xl font-semibold text-black">Patient Reports</h1>
                                <p className="mt-1 text-sm text-black">Patient demographics and visit analytics</p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => handleExport('excel')} disabled={isExporting} variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Excel
                                </Button>
                                <Button onClick={() => handleExport('pdf')} disabled={isExporting} variant="outline">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Export PDF
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    Total Patients
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-blue-600">{summary.total_patients.toLocaleString()}</div>
                                <p className="text-sm text-gray-600">All registered patients</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <UserPlus className="h-5 w-5 text-green-600" />
                                    New Patients
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-green-600">{summary.new_patients.toLocaleString()}</div>
                                <p className="text-sm text-gray-600">This month</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                    Male Patients
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-purple-600">{summary.male_patients.toLocaleString()}</div>
                                <p className="text-sm text-gray-600">Male patients</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <Users className="h-5 w-5 text-pink-600" />
                                    Female Patients
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-pink-600">{summary.female_patients.toLocaleString()}</div>
                                <p className="text-sm text-gray-600">Female patients</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-8 rounded-xl border-0 bg-white shadow-lg">
                        <CardHeader className="border-b border-gray-200 bg-white">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                <Calendar className="h-5 w-5 text-black" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div>
                                    <Label htmlFor="date_from">From Date</Label>
                                    <Input
                                        id="date_from"
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="date_to">To Date</Label>
                                    <Input id="date_to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="sex">Gender</Label>
                                    <Select value={sex} onValueChange={setSex}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Genders</SelectItem>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end">
                                    <Button className="w-full">Apply Filters</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Patients Table */}
                    <Card className="rounded-xl border-0 bg-white shadow-lg">
                        <CardHeader className="border-b border-gray-200 bg-white">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                <FileText className="h-5 w-5 text-black" />
                                Patient Records
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-gray-100">
                                            <TableHead className="font-semibold text-black">Patient No.</TableHead>
                                            <TableHead className="font-semibold text-black">Name</TableHead>
                                            <TableHead className="font-semibold text-black">Age</TableHead>
                                            <TableHead className="font-semibold text-black">Gender</TableHead>
                                            <TableHead className="font-semibold text-black">Mobile</TableHead>
                                            <TableHead className="font-semibold text-black">Appointments</TableHead>
                                            <TableHead className="font-semibold text-black">Lab Orders</TableHead>
                                            <TableHead className="font-semibold text-black">Registered</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {patients.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="py-8 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                        <h3 className="mb-2 text-lg font-semibold text-black">No patients found</h3>
                                                        <p className="text-black">Try adjusting your filters or date range</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            patients.data.map((patient) => (
                                                <TableRow key={patient.id} className="hover:bg-gray-50">
                                                    <TableCell className="font-medium text-black">{patient.patient_no}</TableCell>
                                                    <TableCell className="text-black">{patient.full_name}</TableCell>
                                                    <TableCell className="text-black">{patient.age}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={
                                                                patient.sex === 'Male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                                                            }
                                                        >
                                                            {patient.sex}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-black">{patient.mobile_no}</TableCell>
                                                    <TableCell className="text-black">{patient.appointments_count}</TableCell>
                                                    <TableCell className="text-black">{patient.lab_orders_count}</TableCell>
                                                    <TableCell className="text-black">{new Date(patient.created_at).toLocaleDateString()}</TableCell>
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

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Download, FileText, MoreHorizontal, TrendingUp, UserPlus, Users } from 'lucide-react';
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
    chartData?: {
        gender_distribution: Array<{ sex: string; count: number }>;
        age_groups: Array<{ age_group: string; count: number }>;
    };
    filterOptions?: {
        doctors: Array<{ id: number; name: string }>;
        departments: string[];
        statuses: string[];
        payment_methods: string[];
        hmo_providers: string[];
    };
    metadata?: {
        generated_at: string;
        generated_by: string;
        generated_by_role: string;
        system_version: string;
    };
}

const breadcrumbs = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Reports', href: '/admin/reports' },
    { label: 'Patient Reports', href: '/admin/reports/patients' },
];

// Column definitions for the data table
const columns: ColumnDef<Patient>[] = [
    {
        accessorKey: 'patient_no',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Patient No." />,
        cell: ({ row }) => <div className="font-medium">{row.getValue('patient_no')}</div>,
    },
    {
        accessorKey: 'full_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Full Name" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue('full_name')}</div>,
    },
    {
        accessorKey: 'age',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Age" />,
        cell: ({ row }) => <div>{row.getValue('age')}</div>,
    },
    {
        accessorKey: 'sex',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Gender" />,
        cell: ({ row }) => {
            const sex = row.getValue('sex') as string;
            return <Badge variant={sex === 'Male' ? 'default' : 'secondary'}>{sex}</Badge>;
        },
    },
    {
        accessorKey: 'mobile_no',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Mobile No." />,
        cell: ({ row }) => <div>{row.getValue('mobile_no')}</div>,
    },
    {
        accessorKey: 'appointments_count',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Appointments" />,
        cell: ({ row }) => <div className="text-center">{row.getValue('appointments_count')}</div>,
    },
    {
        accessorKey: 'lab_orders_count',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Lab Orders" />,
        cell: ({ row }) => <div className="text-center">{row.getValue('lab_orders_count')}</div>,
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Registered" />,
        cell: ({ row }) => {
            const date = new Date(row.getValue('created_at'));
            return <div>{date.toLocaleDateString()}</div>;
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const patient = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(patient.patient_no)}>Copy patient number</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View patient details</DropdownMenuItem>
                        <DropdownMenuItem>View medical history</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function PatientReports({ patients, summary, chartData, filterOptions, metadata }: PatientReportsProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
        try {
            setIsExporting(true);
            const params = new URLSearchParams({
                format,
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

                    {/* Patients Data Table */}
                    <Card className="rounded-xl border-0 bg-white shadow-lg">
                        <CardHeader className="border-b border-gray-200 bg-white">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                <FileText className="h-5 w-5 text-black" />
                                Patient Records
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <DataTable columns={columns} data={patients.data} searchKey="full_name" searchPlaceholder="Search patients..." />
                        </CardContent>
                    </Card>

                    {/* Footer with Metadata */}
                    <Card className="mt-8">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <div>
                                    <p>
                                        <strong>Generated:</strong> {metadata?.generated_at || new Date().toLocaleString()}
                                    </p>
                                    <p>
                                        <strong>Generated By:</strong> {metadata?.generated_by || 'System'} ({metadata?.generated_by_role || 'User'})
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p>
                                        <strong>System Version:</strong> {metadata?.system_version || '1.0.0'}
                                    </p>
                                    <p>
                                        <strong>Clinic:</strong> St. James Clinic Management System
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, ChevronDown, Download, FileText, Filter, MapPin, Phone, Search, User, Users } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface Patient {
    id: number;
    patient_no: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    full_name: string;
    birthdate: string;
    age: number;
    sex: string;
    mobile_no?: string;
    present_address?: string;
    occupation?: string;
    civil_status?: string;
    created_at: string;
}

interface PatientStats {
    total: number;
    by_sex: Record<string, number>;
    by_age_group: Record<string, number>;
}

interface DateRange {
    start: string;
    end: string;
    period: string;
    label: string;
}

interface Props {
    user: any;
    patients: {
        data: Patient[];
        links: any[];
        meta: any;
    };
    stats: PatientStats;
    dateRange: DateRange;
    filters: {
        search?: string;
        sex?: string;
        age_min?: number;
        age_max?: number;
        date_from?: string;
        date_to?: string;
    };
}

export default function HospitalPatientReports({ user, patients, stats, dateRange, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [sex, setSex] = useState(filters.sex || '');
    const [ageMin, setAgeMin] = useState(filters.age_min || '');
    const [ageMax, setAgeMax] = useState(filters.age_max || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Hospital Dashboard', href: route('hospital.dashboard') },
        { label: 'Reports', href: route('hospital.reports.index') },
        { label: 'Patient Reports', href: route('hospital.reports.patients') },
    ];

    const handleFilter = () => {
        router.get(
            route('hospital.reports.patients'),
            {
                search: search || undefined,
                sex: sex || undefined,
                age_min: ageMin || undefined,
                age_max: ageMax || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setSex('');
        setAgeMin('');
        setAgeMax('');
        setDateFrom('');
        setDateTo('');
        router.get(
            route('hospital.reports.patients'),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    // Export function with format selection
    const exportReportWithFormat = async (format: 'csv' | 'pdf' | 'excel') => {
        try {
            const params = new URLSearchParams({
                search: search || '',
                sex: sex || '',
                age_min: ageMin || '',
                age_max: ageMax || '',
                date_from: dateFrom || '',
                date_to: dateTo || '',
            });

            let exportUrl: string;
            let filename: string;
            let acceptHeader: string;

            switch (format) {
                case 'csv':
                    exportUrl = `/hospital/reports/export/patients?${params.toString()}`;
                    filename = `patients_report_${new Date().toISOString().split('T')[0]}.csv`;
                    acceptHeader = 'text/csv,application/csv';
                    break;
                case 'pdf':
                    exportUrl = `/hospital/reports/export-pdf/patients?${params.toString()}`;
                    filename = `patients_report_${new Date().toISOString().split('T')[0]}.pdf`;
                    acceptHeader = 'application/pdf';
                    break;
                case 'excel':
                    exportUrl = `/hospital/reports/export-excel/patients?${params.toString()}`;
                    filename = `patients_report_${new Date().toISOString().split('T')[0]}.xlsx`;
                    acceptHeader = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    break;
                default:
                    throw new Error('Invalid export format');
            }

            console.log('Export URL:', exportUrl);

            // Use fetch with credentials to maintain authentication
            const response = await fetch(exportUrl, {
                method: 'GET',
                credentials: 'same-origin', // This is crucial for maintaining authentication
                headers: {
                    Accept: acceptHeader,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error(`Export failed: ${response.status} ${response.statusText}`);
            }

            // Check if we got HTML instead of expected format (authentication issue)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                throw new Error('Authentication failed - got HTML instead of file. Please refresh the page and try again.');
            }

            // Get the filename from the response headers
            const contentDisposition = response.headers.get('Content-Disposition');
            const finalFilename = contentDisposition ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') : filename;

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = finalFilename;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the object URL
            window.URL.revokeObjectURL(url);

            console.log('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed: ' + (error instanceof Error ? error.message : String(error)));
        }
    };

    // Export dropdown component
    const ExportDropdown = ({ label = 'Export' }: { label?: string }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    {label}
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportReportWithFormat('csv')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportReportWithFormat('pdf')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportReportWithFormat('excel')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as Excel
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patient Reports - Hospital" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Patient Reports</h1>
                        <p className="text-muted-foreground">Comprehensive patient analytics and data for {dateRange.label}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportDropdown />
                        <Button asChild>
                            <Link href={route('hospital.reports.index')}>Back to Dashboard</Link>
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Registered in selected period</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Gender Distribution</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {Object.entries(stats.by_sex).map(([gender, count]) => (
                                    <div key={gender} className="flex justify-between text-sm">
                                        <span className="capitalize">{gender}</span>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Age Groups</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {Object.entries(stats.by_age_group).map(([ageGroup, count]) => (
                                    <div key={ageGroup} className="flex justify-between text-sm">
                                        <span>{ageGroup}</span>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                        <CardDescription>Filter patients by various criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
                            <div>
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Name, patient no..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="sex">Gender</Label>
                                <Select value={sex} onValueChange={setSex}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All genders" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Genders</SelectItem>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="age_min">Min Age</Label>
                                <Input id="age_min" type="number" placeholder="0" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} />
                            </div>

                            <div>
                                <Label htmlFor="age_max">Max Age</Label>
                                <Input id="age_max" type="number" placeholder="100" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} />
                            </div>

                            <div>
                                <Label htmlFor="date_from">From Date</Label>
                                <Input id="date_from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                            </div>

                            <div>
                                <Label htmlFor="date_to">To Date</Label>
                                <Input id="date_to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <Button onClick={handleFilter}>Apply Filters</Button>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Patients Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Patient Records</CardTitle>
                        <CardDescription>{patients.meta.total} patients found</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Patient No</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Age</TableHead>
                                        <TableHead>Gender</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Address</TableHead>
                                        <TableHead>Registered</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patients.data.map((patient) => (
                                        <TableRow key={patient.id}>
                                            <TableCell className="font-medium">{patient.patient_no}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{patient.full_name}</div>
                                                    {patient.occupation && <div className="text-sm text-muted-foreground">{patient.occupation}</div>}
                                                </div>
                                            </TableCell>
                                            <TableCell>{patient.age}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {patient.sex}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {patient.mobile_no && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Phone className="h-3 w-3" />
                                                        {patient.mobile_no}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {patient.present_address && (
                                                    <div className="flex max-w-[200px] items-center gap-1 truncate text-sm">
                                                        <MapPin className="h-3 w-3" />
                                                        {patient.present_address}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>{new Date(patient.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={route('hospital.patients.show', patient.id)}>View</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {patients.links && patients.links.length > 3 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {patients.meta.from} to {patients.meta.to} of {patients.meta.total} results
                                </div>
                                <div className="flex gap-1">
                                    {patients.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

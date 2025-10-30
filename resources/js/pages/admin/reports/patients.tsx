import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table';
import { 
    Download, FileText, MoreHorizontal, TrendingUp, UserPlus, Users, 
    ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown,
    FileDown, CalendarIcon, Clock, CheckCircle, TestTube
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { type BreadcrumbItem } from '@/types';
import { ReportDatePicker } from '@/components/ui/report-date-picker';

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
    filter: string;
    date: string;
    data: {
        total_patients: number;
        new_patients: number;
        male_patients: number;
        female_patients: number;
        age_groups: Record<string, number>;
        patient_details: Patient[];
        period: string;
        start_date: string;
        end_date: string;
    };
    patients?: {
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/admin/reports' },
    { title: 'Patient Reports', href: '/admin/reports/patients' },
];

// Column definitions for the data table
const columns: ColumnDef<Patient>[] = [
    {
        accessorKey: 'patient_no',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Patient No
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("patient_no")}</div>
        ),
    },
    {
        accessorKey: 'full_name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Full Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("full_name")}</div>
        ),
    },
    {
        accessorKey: 'age',
        header: "Age",
        cell: ({ row }) => (
            <div className="text-center">{row.getValue("age")}</div>
        ),
    },
    {
        accessorKey: 'sex',
        header: "Gender",
        cell: ({ row }) => {
            const sex = row.getValue("sex") as string;
            return (
                <Badge variant="outline" className="capitalize">
                    {sex}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'mobile_no',
        header: "Mobile",
        cell: ({ row }) => (
            <div className="text-sm">{row.getValue("mobile_no") || "N/A"}</div>
        ),
    },
    {
        accessorKey: 'appointments_count',
        header: "Appointments",
        cell: ({ row }) => (
            <div className="text-center">{row.getValue("appointments_count")}</div>
        ),
    },
    {
        accessorKey: 'lab_orders_count',
        header: "Lab Orders",
        cell: ({ row }) => (
            <div className="text-center">{row.getValue("lab_orders_count")}</div>
        ),
    },
    {
        accessorKey: 'created_at',
        header: "Date Registered",
        cell: ({ row }) => {
            const date = new Date(row.getValue("created_at"));
            return (
                <div className="text-sm">
                    {date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    })}
                </div>
            );
        },
    },
    {
        id: "actions",
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
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(patient.patient_no)}
                        >
                            Copy patient number
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            View patient details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            View medical history
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
];

export default function PatientReports({ filter, date, data, patients, summary, chartData, filterOptions, metadata }: PatientReportsProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentFilter, setCurrentFilter] = useState(filter || 'daily');
    const [currentDate, setCurrentDate] = useState(date || new Date().toISOString().split('T')[0]);
    
    // TanStack Table state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState('');

    // Get filtered data based on current filter and date
    const getFilteredData = () => {
        // Use data prop if available (filtered from backend), otherwise fallback to patients
        const currentPatients = data?.patient_details || patients?.data || [];
        
        // Debug logging
        console.log('getFilteredData - currentFilter:', currentFilter);
        console.log('getFilteredData - currentDate:', currentDate);
        console.log('getFilteredData - data prop:', data);
        console.log('getFilteredData - patients prop:', patients);
        console.log('getFilteredData - currentPatients length:', currentPatients.length);
        
        const total = currentPatients.length;
        const newPatients = currentPatients.filter(p => {
            const createdDate = new Date(p.created_at);
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return createdDate >= startOfMonth;
        }).length;
        const malePatients = currentPatients.filter(p => p.sex === 'male').length;
        const femalePatients = currentPatients.filter(p => p.sex === 'female').length;
        
        // Calculate age groups from filtered data
        const ageGroups = currentPatients.reduce((acc, patient) => {
            const age = patient.age;
            let group = '';
            if (age < 18) group = '0-17';
            else if (age <= 30) group = '18-30';
            else if (age <= 50) group = '31-50';
            else if (age <= 70) group = '51-70';
            else group = '70+';
            
            acc[group] = (acc[group] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const result = {
            total_patients: total,
            new_patients: newPatients,
            male_patients: malePatients,
            female_patients: femalePatients,
            age_groups: ageGroups,
            patient_details: currentPatients,
            period: currentFilter === 'daily' 
                ? `Daily Report - ${new Date(currentDate).toLocaleDateString()}`
                : currentFilter === 'monthly' 
                ? `Monthly Report - ${new Date(currentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`
                : `Yearly Report - ${new Date(currentDate).getFullYear()}`
        };
        
        console.log('getFilteredData - result:', result);
        return result;
    };

    // State for filtered data
    const [filteredData, setFilteredData] = useState(() => getFilteredData());

    // Update filtered data when props change
    useEffect(() => {
        setFilteredData(getFilteredData());
    }, [data, patients]);

    const handleFilterChange = (newFilter: string) => {
        setCurrentFilter(newFilter);
        setIsLoading(true);
        router.get('/admin/reports/patients', {
            filter: newFilter,
            date: currentDate
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false)
        });
    };

    const handleDateChange = (newDate: string) => {
        setCurrentDate(newDate);
        setIsLoading(true);
        router.get('/admin/reports/patients', {
            filter: currentFilter,
            date: newDate
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false)
        });
    };

    const handleExport = async (format: 'excel' | 'pdf') => {
        try {
            setIsExporting(true);
            const params = new URLSearchParams({
                filter: currentFilter,
                date: currentDate,
                format,
                // Include additional context for the export
                report_type: 'patients',
                total_patients: (filteredData.total_patients || 0).toString(),
                new_patients: (filteredData.new_patients || 0).toString()
            });
            
            if (format === 'excel') {
                window.location.href = `/admin/reports/export?type=patients&format=excel&${params}`;
            } else {
                window.location.href = `/admin/reports/export?type=patients&format=pdf&${params}`;
            }

            setTimeout(() => {
                setIsExporting(false);
            }, 2000);
        } catch (error) {
            console.error('Export failed:', error);
            setIsExporting(false);
        }
    };

    // Initialize table
    const table = useReactTable({
        data: filteredData.patient_details || [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, columnId, value) => {
            const search = value.toLowerCase();
            const patient = row.original;
            return (
                patient.full_name?.toLowerCase().includes(search) ||
                patient.patient_no?.toLowerCase().includes(search) ||
                patient.mobile_no?.toLowerCase().includes(search)
            );
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs as any}>
            <Head title="Patient Reports" />
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
                    {/* Dynamic Insight Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm font-medium">Filtered Patients</p>
                                        <p className="text-3xl font-bold">{(filteredData.total_patients || 0).toLocaleString()}</p>
                                        <p className="text-blue-100 text-xs mt-1">
                                            {currentFilter === 'daily' ? 'Today\'s Count' : 
                                             currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                        </p>
                                    </div>
                                    <Users className="h-8 w-8 text-blue-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm font-medium">New Patients</p>
                                        <p className="text-3xl font-bold">{(filteredData.new_patients || 0).toLocaleString()}</p>
                                        <p className="text-green-100 text-xs mt-1">
                                            {currentFilter === 'daily' ? 'Today\'s New' : 
                                             currentFilter === 'monthly' ? 'This Month' : 'This Year'}
                                        </p>
                                    </div>
                                    <UserPlus className="h-8 w-8 text-green-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm font-medium">Male Patients</p>
                                        <p className="text-3xl font-bold">{(filteredData.male_patients || 0).toLocaleString()}</p>
                                        <p className="text-purple-100 text-xs mt-1">
                                            {(filteredData.total_patients || 0) > 0 ? 
                                                (((filteredData.male_patients || 0) / (filteredData.total_patients || 1)) * 100).toFixed(1) : 0
                                            }% of total
                                        </p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-purple-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white border-0 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-pink-100 text-sm font-medium">Female Patients</p>
                                        <p className="text-3xl font-bold">{(filteredData.female_patients || 0).toLocaleString()}</p>
                                        <p className="text-pink-100 text-xs mt-1">
                                            {(filteredData.total_patients || 0) > 0 ? 
                                                (((filteredData.female_patients || 0) / (filteredData.total_patients || 1)) * 100).toFixed(1) : 0
                                            }% of total
                                        </p>
                                    </div>
                                    <Users className="h-8 w-8 text-pink-200" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filter Controls */}
                    <div className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2 w-full">
                                <Label className="text-sm font-semibold text-gray-800 mb-2 block">
                                    Time Period {isLoading && <span className="text-blue-500">(Loading...)</span>}
                                </Label>
                                <select
                                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={currentFilter}
                                    onChange={(e) => handleFilterChange(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                            
                            <div className="space-y-2 w-full">
                                <Label className="text-sm font-semibold text-gray-800 mb-2 block">
                                    Select Date {isLoading && <span className="text-blue-500">(Loading...)</span>}
                                </Label>
                                <ReportDatePicker
                                    date={currentDate ? new Date(currentDate) : undefined}
                                    onDateChange={(date: Date | undefined) => {
                                        if (date) {
                                            // Use local date formatting to avoid timezone issues
                                            const year = date.getFullYear();
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const day = String(date.getDate()).padStart(2, '0');
                                            
                                            let formattedDate: string;
                                            if (currentFilter === 'monthly') {
                                                formattedDate = `${year}-${month}`;
                                            } else if (currentFilter === 'yearly') {
                                                formattedDate = year.toString();
                                            } else {
                                                formattedDate = `${year}-${month}-${day}`;
                                            }
                                            
                                            handleDateChange(formattedDate);
                                        } else {
                                            handleDateChange('');
                                        }
                                    }}
                                    filter={currentFilter as 'daily' | 'monthly' | 'yearly'}
                                    placeholder={`Select ${currentFilter} date`}
                                />
                            </div>

                            <div className="w-full">
                                <Label className="text-sm font-semibold text-gray-800 mb-2 block">Period</Label>
                                <div className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm flex items-center">
                                    {filteredData.period}
                                </div>
                            </div>

                            <div className="w-full flex items-end">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl w-full h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={isLoading}
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Report
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleExport('excel')}>
                                            <FileDown className="mr-2 h-4 w-4" />
                                            Excel Spreadsheet
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('pdf')}>
                                            <FileDown className="mr-2 h-4 w-4" />
                                            PDF Report
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>

                    {/* Report Summary */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Summary</h3>
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Patients</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.total_patients || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">100%</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">New Patients</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.new_patients || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {(filteredData.total_patients || 0) > 0 ? (((filteredData.new_patients || 0) / (filteredData.total_patients || 1)) * 100).toFixed(1) : 0}%
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Male Patients</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.male_patients || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {(filteredData.total_patients || 0) > 0 ? (((filteredData.male_patients || 0) / (filteredData.total_patients || 1)) * 100).toFixed(1) : 0}%
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Female Patients</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredData.female_patients || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {(filteredData.total_patients || 0) > 0 ? (((filteredData.female_patients || 0) / (filteredData.total_patients || 1)) * 100).toFixed(1) : 0}%
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Age Group Summary */}
                    {filteredData.age_groups && Object.keys(filteredData.age_groups).length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Group Summary</h3>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age Group</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {Object.entries(filteredData.age_groups).map(([ageGroup, count]) => (
                                            <tr key={ageGroup}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ageGroup}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{count}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {(filteredData.total_patients || 0) > 0 ? ((count / (filteredData.total_patients || 1)) * 100).toFixed(1) : 0}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Patient Details Table */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <Users className="h-5 w-5 text-gray-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Patient Details</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="h-4 w-4" />
                                    <span>{(filteredData.patient_details || []).length} patients found</span>
                                </div>
                            </div>
                        </div>

                        {(filteredData.patient_details || []).length === 0 ? (
                            <div className="py-16 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                <div className="text-gray-400 mb-4">
                                    <Users className="h-12 w-12 mx-auto" />
                                </div>
                                <p className="text-lg font-semibold text-gray-700 mb-2">No patients found</p>
                                <p className="text-gray-500">No patients found for the selected period</p>
                            </div>
                        ) : (
                            <Card className="bg-white border border-gray-200">
                                <CardContent className="p-6">
                                    {/* Table Controls */}
                                    <div className="flex items-center py-4">
                                        <Input
                                            placeholder="Search patients..."
                                            value={globalFilter ?? ""}
                                            onChange={(event) => setGlobalFilter(event.target.value)}
                                            className="max-w-sm"
                                        />
                                        <Button
                                            onClick={() => handleExport('excel')}
                                            disabled={isExporting}
                                            className="bg-green-600 hover:bg-green-700 text-white ml-4"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Export Excel
                                        </Button>
                                        <Button
                                            onClick={() => handleExport('pdf')}
                                            disabled={isExporting}
                                            variant="outline"
                                            className="ml-2"
                                        >
                                            <FileDown className="h-4 w-4 mr-2" />
                                            Export PDF
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="ml-auto">
                                                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                                                {table
                                                    .getAllColumns()
                                                    .filter((column) => column.getCanHide())
                                                    .map((column) => {
                                                        return (
                                                            <DropdownMenuCheckboxItem
                                                                key={column.id}
                                                                className="capitalize"
                                                                checked={column.getIsVisible()}
                                                                onCheckedChange={(value) => {
                                                                    column.toggleVisibility(!!value);
                                                                }}
                                                                onSelect={(e) => {
                                                                    e.preventDefault();
                                                                }}
                                                            >
                                                                {column.id}
                                                            </DropdownMenuCheckboxItem>
                                                        )
                                                    })}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    
                                    {/* Table */}
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                {table.getHeaderGroups().map((headerGroup) => (
                                                    <TableRow key={headerGroup.id}>
                                                        {headerGroup.headers.map((header) => {
                                                            return (
                                                                <TableHead key={header.id}>
                                                                    {header.isPlaceholder
                                                                        ? null
                                                                        : flexRender(
                                                                            header.column.columnDef.header,
                                                                            header.getContext()
                                                                        )}
                                                                </TableHead>
                                                            )
                                                        })}
                                                    </TableRow>
                                                ))}
                                            </TableHeader>
                                            <TableBody>
                                                {table.getRowModel().rows?.length ? (
                                                    table.getRowModel().rows.map((row) => (
                                                        <TableRow
                                                            key={row.id}
                                                            data-state={row.getIsSelected() && "selected"}
                                                        >
                                                            {row.getVisibleCells().map((cell) => (
                                                                <TableCell key={cell.id}>
                                                                    {flexRender(
                                                                        cell.column.columnDef.cell,
                                                                        cell.getContext()
                                                                    )}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={columns.length}
                                                            className="h-24 text-center"
                                                        >
                                                            No results.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    
                                    {/* Pagination */}
                                    <div className="flex items-center justify-between px-2 py-4">
                                        <div className="text-muted-foreground flex-1 text-sm">
                                            {table.getFilteredSelectedRowModel().rows.length} of{" "}
                                            {table.getFilteredRowModel().rows.length} row(s) selected.
                                        </div>
                                        <div className="flex items-center space-x-6 lg:space-x-8">
                                            <div className="flex items-center space-x-2">
                                                <p className="text-sm font-medium">Rows per page</p>
                                                <Select
                                                    value={`${table.getState().pagination.pageSize}`}
                                                    onValueChange={(value) => {
                                                        table.setPageSize(Number(value))
                                                    }}
                                                >
                                                    <SelectTrigger className="h-8 w-[70px]">
                                                        <SelectValue placeholder={table.getState().pagination.pageSize} />
                                                    </SelectTrigger>
                                                    <SelectContent side="top">
                                                        {[10, 20, 30, 40, 50].map((pageSize) => (
                                                            <SelectItem key={pageSize} value={`${pageSize}`}>
                                                                {pageSize}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                                Page {table.getState().pagination.pageIndex + 1} of{" "}
                                                {table.getPageCount()}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="hidden size-8 lg:flex"
                                                    onClick={() => table.setPageIndex(0)}
                                                    disabled={!table.getCanPreviousPage()}
                                                >
                                                    <span className="sr-only">Go to first page</span>
                                                    <ChevronsLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-8"
                                                    onClick={() => table.previousPage()}
                                                    disabled={!table.getCanPreviousPage()}
                                                >
                                                    <span className="sr-only">Go to previous page</span>
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-8"
                                                    onClick={() => table.nextPage()}
                                                    disabled={!table.getCanNextPage()}
                                                >
                                                    <span className="sr-only">Go to next page</span>
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="hidden size-8 lg:flex"
                                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                                    disabled={!table.getCanNextPage()}
                                                >
                                                    <span className="sr-only">Go to last page</span>
                                                    <ChevronsRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
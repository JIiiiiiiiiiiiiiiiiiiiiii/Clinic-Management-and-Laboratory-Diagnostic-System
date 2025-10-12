import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import {
    ArrowLeft,
    Download,
    FileSpreadsheet,
    FileText,
    Filter,
    Search,
    UserCheck,
    Users,
    TrendingUp,
    Award,
    Calendar,
    CheckCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';

interface Specialist {
    id: string;
    name: string;
    type: string;
    total_appointments: number;
    completed_appointments: number;
    completion_rate: number;
}

interface Props {
    specialists: Specialist[];
    summary: {
        total_specialists: number;
        doctors: number;
        medtechs: number;
        average_completion_rate: number;
    };
    filterOptions: {
        doctors: Array<{ id: number; name: string }>;
        departments: string[];
        statuses: string[];
        payment_methods: string[];
        hmo_providers: string[];
    };
    metadata: {
        generated_at: string;
        generated_by: string;
        generated_by_role: string;
        system_version: string;
    };
}

const breadcrumbs = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Reports', href: '/admin/reports' },
    { label: 'Specialist Management', href: '/admin/reports/specialist-management' },
];

export default function SpecialistManagementReports({ specialists, summary, filterOptions, metadata }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const handleExport = (format: string) => {
        const params = new URLSearchParams({
            format: format,
            search: searchTerm,
            type: typeFilter,
        });
        window.location.href = `/admin/reports/export?type=specialist-management&${params.toString()}`;
    };

    const getTypeBadge = (type: string) => {
        const typeConfig = {
            doctor: { variant: 'default' as const, color: 'text-blue-600', icon: UserCheck },
            medtech: { variant: 'secondary' as const, color: 'text-purple-600', icon: Award },
        };
        
        const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.doctor;
        const Icon = config.icon;
        
        return (
            <Badge variant={config.variant} className={`${config.color} flex items-center gap-1`}>
                <Icon className="h-3 w-3" />
                {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
        );
    };

    const getCompletionRateColor = (rate: number) => {
        if (rate >= 90) return 'text-green-600';
        if (rate >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Prepare chart data
    const typeDistribution = [
        { type: 'Doctors', count: summary.doctors },
        { type: 'MedTechs', count: summary.medtechs },
    ];

    const performanceData = specialists
        .sort((a, b) => b.completion_rate - a.completion_rate)
        .slice(0, 10)
        .map(specialist => ({
            name: specialist.name.split(' ')[0], // First name only for chart
            completion_rate: specialist.completion_rate,
            appointments: specialist.total_appointments,
        }));

    return (
        <AppLayout breadcrumbs={breadcrumbs as any}>
            <Head title="Specialist Management Reports" />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Specialist Management</h1>
                                    <p className="mt-2 text-gray-600">All specialists in the database - specialist referrals, management, and performance analytics</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => handleExport('excel')}>
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    Export Excel
                                </Button>
                                <Button variant="outline" onClick={() => handleExport('pdf')}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Export PDF
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Specialists</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.total_specialists.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">All specialists</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Doctors</CardTitle>
                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{summary.doctors.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">Medical doctors</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">MedTechs</CardTitle>
                                <Award className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-600">{summary.medtechs.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">Medical technologists</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.average_completion_rate.toFixed(1)}%</div>
                                <p className="text-xs text-muted-foreground">Appointment completion</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="search">Search</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="search"
                                            placeholder="Search specialists..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Specialist Type</Label>
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Types</SelectItem>
                                            <SelectItem value="doctor">Doctor</SelectItem>
                                            <SelectItem value="medtech">MedTech</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end">
                                    <Button className="w-full">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Apply Filters
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Charts */}
                    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Type Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    Specialist Type Distribution
                                </CardTitle>
                                <CardDescription>Distribution of specialist types</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ChartContainer
                                        config={{
                                            Doctors: { label: 'Doctors', color: '#3b82f6' },
                                            MedTechs: { label: 'MedTechs', color: '#8b5cf6' },
                                        }}
                                        className="h-full w-full"
                                    >
                                        <PieChart>
                                            <Pie
                                                data={typeDistribution}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="count"
                                            >
                                                {typeDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#8b5cf6'} />
                                                ))}
                                            </Pie>
                                            <ChartTooltip content={<ChartTooltipContent formatter={(value) => [value, 'Specialists']} />} />
                                        </PieChart>
                                    </ChartContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    Top Performers
                                </CardTitle>
                                <CardDescription>Specialists with highest completion rates</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ChartContainer
                                        config={{
                                            completion_rate: { label: 'Completion Rate (%)', color: '#10b981' },
                                        }}
                                        className="h-full w-full"
                                    >
                                        <BarChart data={performanceData}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                                            <XAxis dataKey="name" className="text-sm" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                            <YAxis className="text-sm" tick={{ fill: '#6b7280' }} />
                                            <ChartTooltip content={<ChartTooltipContent formatter={(value) => [`${value}%`, 'Completion Rate']} />} />
                                            <Bar dataKey="completion_rate" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ChartContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Specialists Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Specialist Records</CardTitle>
                            <CardDescription>All specialists in the database</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Specialist ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Total Appointments</TableHead>
                                        <TableHead>Completed</TableHead>
                                        <TableHead>Completion Rate</TableHead>
                                        <TableHead>Performance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {specialists.map((specialist) => (
                                        <TableRow key={specialist.id}>
                                            <TableCell className="font-medium">{specialist.id}</TableCell>
                                            <TableCell className="font-medium">{specialist.name}</TableCell>
                                            <TableCell>{getTypeBadge(specialist.type)}</TableCell>
                                            <TableCell>{specialist.total_appointments}</TableCell>
                                            <TableCell>{specialist.completed_appointments}</TableCell>
                                            <TableCell>
                                                <div className={`font-medium ${getCompletionRateColor(specialist.completion_rate)}`}>
                                                    {specialist.completion_rate.toFixed(1)}%
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className={`h-2 rounded-full ${
                                                                specialist.completion_rate >= 90 ? 'bg-green-500' :
                                                                specialist.completion_rate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                            style={{ width: `${Math.min(specialist.completion_rate, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-gray-500">
                                                        {specialist.completion_rate >= 90 ? 'Excellent' :
                                                         specialist.completion_rate >= 70 ? 'Good' : 'Needs Improvement'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <Card className="mt-8">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <div>
                                    <p>
                                        <strong>Generated:</strong> {metadata.generated_at}
                                    </p>
                                    <p>
                                        <strong>Generated By:</strong> {metadata.generated_by} ({metadata.generated_by_role})
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p>
                                        <strong>System Version:</strong> {metadata.system_version}
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

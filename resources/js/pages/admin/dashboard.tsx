import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BarChart3, Calendar, CreditCard, DollarSign, FlaskConical, MoreHorizontal, Package2, TrendingUp, UserCheck, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

// Role-based data
const roleBasedData = {
    admin: {
        title: 'Admin Dashboard',
        description: 'Complete overview of clinic operations and management',
        analytics: [
            { label: 'Total Patients', value: '1,234', change: '+12%', icon: Users },
            { label: 'Total Revenue', value: '₱2,456,789', change: '+8%', icon: DollarSign },
            { label: 'Lab Tests', value: '456', change: '+15%', icon: FlaskConical },
            { label: 'Appointments', value: '89', change: '+5%', icon: Calendar },
        ],
        recentPatients: [
            { id: 1, name: 'John Doe', lastVisit: '2025-04-24', status: 'Active' },
            { id: 2, name: 'Jane Smith', lastVisit: '2025-04-23', status: 'Active' },
            { id: 3, name: 'Bob Johnson', lastVisit: '2025-04-22', status: 'Inactive' },
        ],
        recentProducts: [
            { id: 1, name: 'Paracetamol 500mg', stock: 150, status: 'In Stock' },
            { id: 2, name: 'Amoxicillin 250mg', stock: 75, status: 'Low Stock' },
            { id: 3, name: 'Ibuprofen 400mg', stock: 200, status: 'In Stock' },
        ],
        recentSales: [
            { id: 1, product: 'Paracetamol 500mg', quantity: 50, revenue: '₱2,500' },
            { id: 2, product: 'Amoxicillin 250mg', quantity: 30, revenue: '₱4,500' },
            { id: 3, product: 'Ibuprofen 400mg', quantity: 25, revenue: '₱1,875' },
        ],
    },
    laboratory_technologist: {
        title: 'Laboratory Dashboard',
        description: 'Manage laboratory tests and results',
        analytics: [
            { label: 'Total Tests', value: '156', change: '+8%', icon: FlaskConical },
            { label: 'Pending Results', value: '23', change: '-5%', icon: BarChart3 },
            { label: 'Completed Today', value: '45', change: '+12%', icon: TrendingUp },
            { label: 'Equipment Status', value: 'All OK', change: '0%', icon: Package2 },
        ],
        recentTests: [
            { id: 1, patient: 'John Doe', test: 'Blood Test', status: 'Completed', date: '2025-04-24' },
            { id: 2, patient: 'Jane Smith', test: 'Urinalysis', status: 'In Progress', date: '2025-04-24' },
            { id: 3, patient: 'Bob Johnson', test: 'CBC', status: 'Pending', date: '2025-04-23' },
        ],
    },
    medtech: {
        title: 'Medical Technology Dashboard',
        description: 'Manage laboratory tests and medical technology operations',
        analytics: [
            { label: 'Total Tests', value: '156', change: '+8%', icon: FlaskConical },
            { label: 'Pending Results', value: '23', change: '-5%', icon: BarChart3 },
            { label: 'Completed Today', value: '45', change: '+12%', icon: TrendingUp },
            { label: 'Equipment Status', value: 'All OK', change: '0%', icon: Package2 },
        ],
        recentTests: [
            { id: 1, patient: 'John Doe', test: 'Blood Test', status: 'Completed', date: '2025-04-24' },
            { id: 2, patient: 'Jane Smith', test: 'Urinalysis', status: 'In Progress', date: '2025-04-24' },
            { id: 3, patient: 'Bob Johnson', test: 'CBC', status: 'Pending', date: '2025-04-23' },
        ],
    },
    cashier: {
        title: 'Cashier Dashboard',
        description: 'Manage billing, payments, and financial transactions',
        analytics: [
            { label: 'Total Revenue', value: '₱45,678', change: '+15%', icon: DollarSign },
            { label: 'Pending Payments', value: '12', change: '+3%', icon: CreditCard },
            { label: "Today's Transactions", value: '34', change: '+8%', icon: TrendingUp },
            { label: 'Overdue Amount', value: '₱8,900', change: '-2%', icon: BarChart3 },
        ],
        recentTransactions: [
            { id: 1, patient: 'John Doe', service: 'Consultation', amount: '₱500', status: 'Paid', date: '2025-04-24' },
            { id: 2, patient: 'Jane Smith', service: 'Lab Test', amount: '₱1,200', status: 'Pending', date: '2025-04-24' },
            { id: 3, patient: 'Bob Johnson', service: 'Medicine', amount: '₱350', status: 'Paid', date: '2025-04-23' },
        ],
    },
    doctor: {
        title: 'Doctor Dashboard',
        description: 'Manage patient appointments and medical records',
        analytics: [
            { label: "Today's Appointments", value: '8', change: '+2%', icon: Calendar },
            { label: 'Total Patients', value: '156', change: '+5%', icon: Users },
            { label: 'Pending Consultations', value: '3', change: '-1%', icon: UserCheck },
            { label: 'Completed Today', value: '5', change: '+1%', icon: TrendingUp },
        ],
        recentPatients: [
            { id: 1, name: 'John Doe', lastVisit: '2025-04-24', diagnosis: 'Hypertension', status: 'Under Treatment' },
            { id: 2, name: 'Jane Smith', lastVisit: '2025-04-23', diagnosis: 'Diabetes', status: 'Stable' },
            { id: 3, name: 'Bob Johnson', lastVisit: '2025-04-22', diagnosis: 'Check-up', status: 'Healthy' },
        ],
    },
};

const formatCurrency = (amount: string) => {
    return amount;
};

export default function Dashboard() {
    const { permissions, canAccessModule, isPatient } = useRoleAccess();
    const { auth, dashboard } = usePage().props as any;
    const role = auth?.user?.role || 'admin';
    const data = roleBasedData[role as keyof typeof roleBasedData] || roleBasedData.admin;

    // If user is a patient, redirect them to patient dashboard
    if (isPatient) {
        return null; // This should not happen due to middleware, but safety check
    }

    const renderAnalyticsCards = () => {
        return (
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                {[
                    { label: 'Total Patients', value: String(dashboard?.totals?.patients ?? 0), change: '+', icon: Users },
                    { label: 'Total Items', value: String(dashboard?.totals?.items ?? 0), change: '+', icon: Package2 },
                    { label: 'Low Stock Items', value: String(dashboard?.totals?.lowStockItems ?? 0), change: '+', icon: TrendingUp },
                    { label: 'Lab Orders', value: String(dashboard?.totals?.labOrders ?? 0), change: '+', icon: FlaskConical },
                ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <Card key={index} className="shadow-sm transition-shadow hover:shadow-md">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-gray-500">{item.label}</CardTitle>
                                    <div className="rounded-lg bg-blue-100 p-2">
                                        <Icon size={18} className="text-blue-600" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{item.value}</div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <span className={item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>{item.change}</span>
                                    <span className="ml-1">from last month</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500">Overview of clinic operations and management</p>
                </div>

                {/* Role-based Analytics Cards */}
                {renderAnalyticsCards()}

                {/* Role-based Module Cards - Completely hidden if no access */}
                {Object.keys(permissions).some((key) => permissions[key as keyof typeof permissions]) && (
                    <div className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">Quick Access Modules</h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {/* Laboratory Module - Lab Staff Only */}
                            {permissions.canAccessLaboratory && (
                                <Card className="shadow-sm transition-shadow hover:shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FlaskConical className="h-5 w-5 text-blue-500" />
                                            Laboratory
                                        </CardTitle>
                                        <CardDescription>Manage laboratory tests and results</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="text-sm text-gray-600">Recent tests: 23</div>
                                            <div className="text-sm text-gray-600">Pending results: 5</div>
                                        </div>
                                    </CardContent>
                                    <CardContent className="pt-0">
                                        <Button asChild className="w-full">
                                            <Link href="/admin/laboratory">Manage Laboratory</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Billing Module - Cashier Only */}
                            {permissions.canAccessBilling && (
                                <Card className="shadow-sm transition-shadow hover:shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-green-500" />
                                            Billing & Payments
                                        </CardTitle>
                                        <CardDescription>Manage patient billing and payments</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="text-sm text-gray-600">Pending payments: 12</div>
                                            <div className="text-sm text-gray-600">Today's revenue: ₱45,678</div>
                                        </div>
                                    </CardContent>
                                    <CardContent className="pt-0">
                                        <Button asChild className="w-full">
                                            <Link href="/admin/billing">Manage Billing</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Appointments Module - Doctor Only */}
                            {permissions.canAccessAppointments && (
                                <Card className="shadow-sm transition-shadow hover:shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-purple-500" />
                                            Appointments
                                        </CardTitle>
                                        <CardDescription>Manage patient appointments</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="text-sm text-gray-600">Today's appointments: 8</div>
                                            <div className="text-sm text-gray-600">Pending confirmations: 3</div>
                                        </div>
                                    </CardContent>
                                    <CardContent className="pt-0">
                                        <Button asChild className="w-full">
                                            <Link href="/admin/appointments">Manage Appointments</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Patients Module - All Staff */}
                            {permissions.canAccessPatients && (
                                <Card className="shadow-sm transition-shadow hover:shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-indigo-500" />
                                            Patient Management
                                        </CardTitle>
                                        <CardDescription>Manage patient records and information</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="text-sm text-gray-600">Total patients: {dashboard?.totals?.patients ?? 0}</div>
                                            <div className="text-sm text-gray-600">
                                                New this month: {dashboard?.totals?.newPatientsThisMonth ?? 0}
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardContent className="pt-0">
                                        <Button asChild className="w-full">
                                            <Link href="/admin/patient">Manage Patients</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Doctor Management Module - Admin Only */}
                            {permissions.canAccessInventory && (
                                <Card className="shadow-sm transition-shadow hover:shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <UserCheck className="h-5 w-5 text-blue-500" />
                                            Doctor Management
                                        </CardTitle>
                                        <CardDescription>Manage clinic doctors and their information</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="text-sm text-gray-600">Active doctors: 5</div>
                                            <div className="text-sm text-gray-600">Total doctors: 7</div>
                                        </div>
                                    </CardContent>
                                    <CardContent className="pt-0">
                                        <Button asChild className="w-full">
                                            <Link href="/admin/doctors">Manage Doctors</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Inventory Module - Admin Only */}
                            {permissions.canAccessInventory && (
                                <Card className="shadow-sm transition-shadow hover:shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Package2 className="h-5 w-5 text-orange-500" />
                                            Inventory Management
                                        </CardTitle>
                                        <CardDescription>Manage clinic inventory and supplies</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="text-sm text-gray-600">Total items: 156</div>
                                            <div className="text-sm text-gray-600">Low stock items: 8</div>
                                        </div>
                                    </CardContent>
                                    <CardContent className="pt-0">
                                        <Button asChild className="w-full">
                                            <Link href="/admin/inventory">Manage Inventory</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Reports Module - Admin Only */}
                            {permissions.canAccessReports && (
                                <Card className="shadow-sm transition-shadow hover:shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5 text-red-500" />
                                            Reports
                                        </CardTitle>
                                        <CardDescription>Generate comprehensive reports</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="text-sm text-gray-600">Monthly reports: 12</div>
                                            <div className="text-sm text-gray-600">Custom reports: 5</div>
                                        </div>
                                    </CardContent>
                                    <CardContent className="pt-0">
                                        <Button asChild className="w-full">
                                            <Link href="/admin/reports">View Reports</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Roles & Permissions Module - Admin Only */}
                            {permissions.canAccessSettings && (
                                <Card className="shadow-sm transition-shadow hover:shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-purple-500" />
                                            Roles & Permissions
                                        </CardTitle>
                                        <CardDescription>Manage user roles and system permissions</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="text-sm text-gray-600">Total roles: 5</div>
                                            <div className="text-sm text-gray-600">Active users: 23</div>
                                        </div>
                                    </CardContent>
                                    <CardContent className="pt-0">
                                        <Button asChild className="w-full">
                                            <Link href="/admin/roles">Manage Roles</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                )}

                {/* Role-based Content - Completely hidden if no access */}
                {permissions.canAccessLaboratory && (
                    <div className="mb-8">
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle>Recent Lab Tests</CardTitle>
                                    <div className="flex gap-2">
                                        <Button asChild>
                                            <Link href="/admin/laboratory">View All Tests</Link>
                                        </Button>
                                    </div>
                                </div>
                                <CardDescription>A list of recent laboratory test requests</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Patient</TableHead>
                                            <TableHead>Test</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(() => {
                                            const rows = (dashboard?.recent?.labOrders || []).map((o: any) => ({
                                                id: o.id,
                                                patient: o.patient ? `${o.patient.last_name}, ${o.patient.first_name}` : '—',
                                                tests: (o.lab_tests || []).map((t: any) => t.name).join(', '),
                                                date: new Date(o.created_at).toLocaleString(),
                                                status: 'Ordered',
                                            }));
                                            return rows.map((row: any) => (
                                                <TableRow key={row.id}>
                                                    <TableCell>
                                                        <div className="font-medium">{row.patient}</div>
                                                    </TableCell>
                                                    <TableCell>{row.tests}</TableCell>
                                                    <TableCell>
                                                        <Badge className={'bg-blue-100 text-blue-800 hover:bg-blue-100'}>{row.status}</Badge>
                                                    </TableCell>
                                                    <TableCell>{row.date}</TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/admin/laboratory/orders/${row.id}/results/view`}>View details</Link>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ));
                                        })()}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {permissions.canAccessBilling && (
                    <div className="mb-8">
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle>Recent Transactions</CardTitle>
                                    <div className="flex gap-2">
                                        <Button asChild>
                                            <Link href="/admin/billing">View All Transactions</Link>
                                        </Button>
                                    </div>
                                </div>
                                <CardDescription>A list of recent billing transactions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Patient</TableHead>
                                            <TableHead>Service</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(() => {
                                            const rows = [] as any[];
                                            return (
                                                rows.map((transaction) => (
                                                    <TableRow key={transaction.id}>
                                                        <TableCell>
                                                            <div className="font-medium">{transaction.patient}</div>
                                                        </TableCell>
                                                        <TableCell>{transaction.service}</TableCell>
                                                        <TableCell>{transaction.amount}</TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                className={
                                                                    transaction.status === 'Paid'
                                                                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                                                        : transaction.status === 'Pending'
                                                                          ? 'bg-yellow-100 text-yellow-800 hover:bg-green-100'
                                                                          : 'bg-red-100 text-red-800 hover:bg-green-100'
                                                                }
                                                            >
                                                                {transaction.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{transaction.date}</TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                    <DropdownMenuItem>View details</DropdownMenuItem>
                                                                    <DropdownMenuItem>Process payment</DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem className="text-red-600">Refund</DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                )) || []
                                            );
                                        })()}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {permissions.canAccessAppointments && (
                    <div className="mb-8">
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle>Recent Patients</CardTitle>
                                    <div className="flex gap-2">
                                        <Button asChild>
                                            <Link href="/admin/appointments">View All Appointments</Link>
                                        </Button>
                                    </div>
                                </div>
                                <CardDescription>A list of recent patients and their last visit details</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Patient Name</TableHead>
                                            <TableHead>Last Visit</TableHead>
                                            <TableHead>Diagnosis</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(() => {
                                            const rows = (dashboard?.recent?.patients || []).map((p: any) => ({
                                                id: p.id,
                                                name: `${p.last_name ?? ''}, ${p.first_name ?? ''}`,
                                                lastVisit: new Date(p.created_at).toLocaleDateString(),
                                                diagnosis: '—',
                                                status: '—',
                                            }));
                                            return (
                                                rows.map((patient) => (
                                                    <TableRow key={patient.id}>
                                                        <TableCell className="font-medium">{patient.name}</TableCell>
                                                        <TableCell>{patient.lastVisit}</TableCell>
                                                        <TableCell>{patient.diagnosis}</TableCell>
                                                        <TableCell>
                                                            <Badge className={'bg-gray-100 text-gray-800 hover:bg-gray-100'}>{patient.status}</Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                    <DropdownMenuItem>View record</DropdownMenuItem>
                                                                    <DropdownMenuItem>Schedule follow-up</DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem className="text-red-600">Archive</DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                )) || []
                                            );
                                        })()}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {permissions.canAccessInventory && (
                    <div className="mb-8">
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle>Recent Items</CardTitle>
                                    <div className="flex gap-2">
                                        <Button asChild>
                                            <Link href="/admin/inventory">View All Items</Link>
                                        </Button>
                                    </div>
                                </div>
                                <CardDescription>A list of recent inventory items</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product Name</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(() => {
                                            const rows = (dashboard?.recent?.items || []).map((p: any) => ({
                                                id: p.id,
                                                name: p.name,
                                                stock: Number(p.current_stock ?? 0),
                                                status: Number(p.current_stock ?? 0) > 0 ? 'In Stock' : 'Out of Stock',
                                            }));
                                            return (
                                                rows.map((product) => (
                                                    <TableRow key={product.id}>
                                                        <TableCell className="font-medium">{product.name}</TableCell>
                                                        <TableCell>{product.stock}</TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                className={
                                                                    product.status === 'In Stock'
                                                                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                                                        : 'bg-yellow-100 text-yellow-800 hover:bg-green-100'
                                                                }
                                                            >
                                                                {product.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                    <DropdownMenuItem>View details</DropdownMenuItem>
                                                                    <DropdownMenuItem>Edit product</DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                )) || []
                                            );
                                        })()}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {permissions.canAccessReports && (
                    <div className="mb-8">
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle>Recent Sales</CardTitle>
                                    <div className="flex gap-2">
                                        <Button asChild>
                                            <Link href="/admin/reports">View All Reports</Link>
                                        </Button>
                                    </div>
                                </div>
                                <CardDescription>A list of recent sales transactions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Revenue</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(() => {
                                            const adminData = roleBasedData.admin;
                                            return (
                                                adminData.recentSales?.map((sale) => (
                                                    <TableRow key={sale.id}>
                                                        <TableCell className="font-medium">{sale.product}</TableCell>
                                                        <TableCell>{sale.quantity}</TableCell>
                                                        <TableCell>{formatCurrency(sale.revenue)}</TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                    <DropdownMenuItem>View details</DropdownMenuItem>
                                                                    <DropdownMenuItem>Generate invoice</DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem className="text-red-600">Void</DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                )) || []
                                            );
                                        })()}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

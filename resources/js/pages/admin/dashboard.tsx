import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    ChevronDown,
    CreditCard,
    DollarSign,
    FlaskConical,
    MoreHorizontal,
    Package2,
    Search,
    Stethoscope,
    UserCheck,
    Users,
} from 'lucide-react';

// Role-based data
const roleBasedData = {
    laboratory_technologist: {
        title: 'Laboratory Dashboard',
        description: 'Manage lab tests, patient results, and laboratory operations',
        analytics: {
            totalTests: 156,
            pendingResults: 23,
            completedTests: 133,
            totalPatients: 89,
        },
        recentTests: [
            { id: 1, patient: 'John Doe', test: 'Blood Test', status: 'Completed', date: '2025-04-24' },
            { id: 2, patient: 'Jane Smith', test: 'Urinalysis', status: 'Pending', date: '2025-04-24' },
            { id: 3, patient: 'Bob Johnson', test: 'CBC', status: 'Completed', date: '2025-04-23' },
        ],
    },
    medtech: {
        title: 'Medical Technology Dashboard',
        description: 'Manage lab tests, patient results, and medical technology operations',
        analytics: {
            totalTests: 156,
            pendingResults: 23,
            completedTests: 133,
            totalPatients: 89,
        },
        recentTests: [
            { id: 1, patient: 'John Doe', test: 'Blood Test', status: 'Completed', date: '2025-04-24' },
            { id: 2, patient: 'Jane Smith', test: 'Urinalysis', status: 'Pending', date: '2025-04-24' },
            { id: 3, patient: 'Bob Johnson', test: 'CBC', status: 'Completed', date: '2025-04-23' },
        ],
    },
    cashier: {
        title: 'Cashier Dashboard',
        description: 'Manage billing, payments, and patient accounts',
        analytics: {
            totalTransactions: 245,
            totalRevenue: 45678.9,
            pendingPayments: 12,
            totalPatients: 156,
        },
        recentTransactions: [
            { id: 1, patient: 'John Doe', service: 'Consultation', amount: 500.0, status: 'Paid', date: '2025-04-24' },
            { id: 2, patient: 'Jane Smith', service: 'Laboratory Test', amount: 1200.0, status: 'Pending', date: '2025-04-24' },
            { id: 3, patient: 'Bob Johnson', service: 'Medicine', amount: 350.0, status: 'Paid', date: '2025-04-23' },
        ],
    },
    doctor: {
        title: 'Doctor Dashboard',
        description: 'Manage patient records, medical history, and prescriptions',
        analytics: {
            totalPatients: 89,
            appointmentsToday: 12,
            pendingReports: 5,
            totalConsultations: 234,
        },
        recentPatients: [
            { id: 1, name: 'John Doe', lastVisit: '2025-04-24', diagnosis: 'Hypertension', status: 'Under Treatment' },
            { id: 2, name: 'Jane Smith', lastVisit: '2025-04-23', diagnosis: 'Diabetes', status: 'Under Treatment' },
            { id: 3, name: 'Bob Johnson', lastVisit: '2025-04-22', diagnosis: 'Check-up', status: 'Healthy' },
        ],
    },
    admin: {
        title: 'Admin Dashboard',
        description: 'Complete system overview and management',
        analytics: {
            totalProducts: 254,
            totalUsers: 1823,
            totalCategories: 32,
            totalInventoryValue: 543920,
        },
        recentProducts: [
            { id: 1, name: 'Ergonomic Chair', category: 'Furniture', price: 199.99, stock: 24, status: 'In Stock' },
            { id: 2, name: 'MacBook Pro M3', category: 'Electronics', price: 1999.99, stock: 12, status: 'Low Stock' },
            { id: 3, name: 'Wireless Earbuds', category: 'Audio', price: 129.99, stock: 45, status: 'In Stock' },
        ],
        recentSales: [
            {
                id: 1,
                customer: 'John Doe',
                email: 'john@example.com',
                product: 'Ergonomic Chair',
                date: '2025-04-24',
                amount: 199.99,
                status: 'Completed',
            },
            {
                id: 2,
                customer: 'Jane Smith',
                email: 'jane@example.com',
                product: 'MacBook Pro M3',
                date: '2025-04-23',
                amount: 1999.99,
                status: 'Processing',
            },
            {
                id: 3,
                customer: 'Robert Johnson',
                email: 'robert@example.com',
                product: 'Wireless Earbuds',
                date: '2025-04-22',
                amount: 129.99,
                status: 'Completed',
            },
        ],
    },
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(value);
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { user } = usePage().props as { user?: { role: string } };
    const role = user?.role || 'admin';
    const data = roleBasedData[role as keyof typeof roleBasedData] || roleBasedData.admin;

    // Render role-specific analytics cards
    const renderAnalyticsCards = () => {
        if (role === 'laboratory_technologist' || role === 'medtech') {
            const labData = data as typeof roleBasedData.laboratory_technologist;
            return (
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-500">Total Tests</CardTitle>
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <FlaskConical size={18} className="text-blue-600" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{labData.analytics.totalTests}</div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button variant="link" className="flex h-auto items-center p-0 text-blue-600">
                                View details <ArrowRight size={16} className="ml-1" />
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-500">Pending Results</CardTitle>
                                <div className="rounded-lg bg-yellow-100 p-2">
                                    <FlaskConical size={18} className="text-yellow-600" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{labData.analytics.pendingResults}</div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button variant="link" className="flex h-auto items-center p-0 text-yellow-600">
                                View details <ArrowRight size={16} className="ml-1" />
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-500">Completed Tests</CardTitle>
                                <div className="rounded-lg bg-green-100 p-2">
                                    <FlaskConical size={18} className="text-green-600" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{labData.analytics.completedTests}</div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button variant="link" className="flex h-auto items-center p-0 text-green-600">
                                View details <ArrowRight size={16} className="ml-1" />
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-500">Total Patients</CardTitle>
                                <div className="rounded-lg bg-purple-100 p-2">
                                    <Users size={18} className="text-purple-600" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{labData.analytics.totalPatients}</div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button variant="link" className="flex h-auto items-center p-0 text-purple-600">
                                View details <ArrowRight size={16} className="ml-1" />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            );
        }

        if (role === 'cashier') {
            const cashierData = data as typeof roleBasedData.cashier;
            return (
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-500">Total Transactions</CardTitle>
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <CreditCard size={18} className="text-blue-600" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{cashierData.analytics.totalTransactions}</div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button variant="link" className="flex h-auto items-center p-0 text-blue-600">
                                View details <ArrowRight size={16} className="ml-1" />
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
                                <div className="rounded-lg bg-green-100 p-2">
                                    <DollarSign size={18} className="text-green-600" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(cashierData.analytics.totalRevenue)}</div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button variant="link" className="flex h-auto items-center p-0 text-green-600">
                                View details <ArrowRight size={16} className="ml-1" />
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-500">Pending Payments</CardTitle>
                                <div className="rounded-lg bg-yellow-100 p-2">
                                    <CreditCard size={18} className="text-yellow-600" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{cashierData.analytics.pendingPayments}</div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button variant="link" className="flex h-auto items-center p-0 text-yellow-600">
                                View details <ArrowRight size={16} className="ml-1" />
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-500">Total Patients</CardTitle>
                                <div className="rounded-lg bg-purple-100 p-2">
                                    <Users size={18} className="text-purple-600" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{cashierData.analytics.totalPatients}</div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button variant="link" className="flex h-auto items-center p-0 text-purple-600">
                                View details <ArrowRight size={16} className="ml-1" />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            );
        }

        if (role === 'doctor') {
            const doctorData = data as typeof roleBasedData.doctor;
            return (
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-500">Total Patients</CardTitle>
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <Users size={18} className="text-blue-600" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{doctorData.analytics.totalPatients}</div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button variant="link" className="flex h-auto items-center p-0 text-blue-600">
                                View details <ArrowRight size={16} className="ml-1" />
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-500">Appointments Today</CardTitle>
                                <div className="rounded-lg bg-green-100 p-2">
                                    <UserCheck size={18} className="text-green-600" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{doctorData.analytics.appointmentsToday}</div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button variant="link" className="flex h-auto items-center p-0 text-green-600">
                                View details <ArrowRight size={16} className="ml-1" />
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-500">Pending Reports</CardTitle>
                                <div className="rounded-lg bg-yellow-100 p-2">
                                    <Stethoscope size={18} className="text-yellow-600" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{doctorData.analytics.pendingReports}</div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button variant="link" className="flex h-auto items-center p-0 text-yellow-600">
                                View details <ArrowRight size={16} className="ml-1" />
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-500">Total Consultations</CardTitle>
                                <div className="rounded-lg bg-purple-100 p-2">
                                    <Stethoscope size={18} className="text-purple-600" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{doctorData.analytics.totalConsultations}</div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button variant="link" className="flex h-auto items-center p-0 text-purple-600">
                                View details <ArrowRight size={16} className="ml-1" />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            );
        }

        // Default admin analytics cards
        const adminData = data as typeof roleBasedData.admin;
        return (
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Products</CardTitle>
                            <div className="rounded-lg bg-blue-100 p-2">
                                <Package2 size={18} className="text-blue-600" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{adminData.analytics.totalProducts}</div>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Button variant="link" className="flex h-auto items-center p-0 text-blue-600">
                            View details <ArrowRight size={16} className="ml-1" />
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="shadow-sm transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
                            <div className="rounded-lg bg-green-100 p-2">
                                <Users size={18} className="text-green-600" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{adminData.analytics.totalUsers}</div>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Button variant="link" className="flex h-auto items-center p-0 text-green-600">
                            View details <ArrowRight size={16} className="ml-1" />
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="shadow-sm transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Categories</CardTitle>
                            <div className="rounded-lg bg-purple-100 p-2">
                                <BarChart3 size={18} className="text-purple-600" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{adminData.analytics.totalCategories}</div>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Button variant="link" className="flex h-auto items-center p-0 text-purple-600">
                            View details <ArrowRight size={16} className="ml-1" />
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="shadow-sm transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Inventory Value</CardTitle>
                            <div className="rounded-lg bg-amber-100 p-2">
                                <DollarSign size={18} className="text-amber-600" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(adminData.analytics.totalInventoryValue)}</div>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Button variant="link" className="flex h-auto items-center p-0 text-amber-600">
                            View details <ArrowRight size={16} className="ml-1" />
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={data.title} />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">{data.title}</h1>
                    <p className="text-gray-500">{data.description}</p>
                </div>

                {/* Role-based Analytics Cards */}
                {renderAnalyticsCards()}

                {/* Role-based Content */}
                {(role === 'laboratory_technologist' || role === 'medtech') && (
                    <div className="mb-8">
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle>Recent Lab Tests</CardTitle>
                                    <div className="flex gap-2">
                                        <div className="relative">
                                            <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                            <Input placeholder="Search tests..." className="w-64 pl-8" />
                                        </div>
                                        <Button>Add Test</Button>
                                    </div>
                                </div>
                                <CardDescription>A list of recent laboratory tests</CardDescription>
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
                                        {(data as typeof roleBasedData.laboratory_technologist).recentTests.map((test) => (
                                            <TableRow key={test.id}>
                                                <TableCell className="font-medium">{test.patient}</TableCell>
                                                <TableCell>{test.test}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            test.status === 'Completed'
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                                                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                                        }
                                                    >
                                                        {test.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{test.date}</TableCell>
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
                                                            <DropdownMenuItem>Update status</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {role === 'cashier' && (
                    <div className="mb-8">
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle>Recent Transactions</CardTitle>
                                    <div className="flex gap-2">
                                        <div className="relative">
                                            <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                            <Input placeholder="Search transactions..." className="w-64 pl-8" />
                                        </div>
                                        <Button>New Transaction</Button>
                                    </div>
                                </div>
                                <CardDescription>A list of recent financial transactions</CardDescription>
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
                                        {(data as typeof roleBasedData.cashier).recentTransactions.map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell className="font-medium">{transaction.patient}</TableCell>
                                                <TableCell>{transaction.service}</TableCell>
                                                <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            transaction.status === 'Paid'
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                                                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
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
                                                            <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {role === 'doctor' && (
                    <div className="mb-8">
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle>Recent Patients</CardTitle>
                                    <div className="flex gap-2">
                                        <div className="relative">
                                            <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                            <Input placeholder="Search patients..." className="w-64 pl-8" />
                                        </div>
                                        <Button>Add Patient</Button>
                                    </div>
                                </div>
                                <CardDescription>A list of recent patient consultations</CardDescription>
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
                                        {(data as typeof roleBasedData.doctor).recentPatients.map((patient) => (
                                            <TableRow key={patient.id}>
                                                <TableCell className="font-medium">{patient.name}</TableCell>
                                                <TableCell>{patient.lastVisit}</TableCell>
                                                <TableCell>{patient.diagnosis}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            patient.status === 'Healthy'
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                                                : 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                                                        }
                                                    >
                                                        {patient.status}
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
                                                            <DropdownMenuItem>View medical record</DropdownMenuItem>
                                                            <DropdownMenuItem>Schedule follow-up</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-red-600">Archive</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Admin-specific content */}
                {role === 'admin' && (
                    <>
                        <div className="mb-8">
                            <Card>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Recent Products</CardTitle>
                                        <div className="flex gap-2">
                                            <div className="relative">
                                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                                <Input placeholder="Search products..." className="w-64 pl-8" />
                                            </div>
                                            <Button>Add Product</Button>
                                        </div>
                                    </div>
                                    <CardDescription>A list of your recent products</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Stock</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(data as typeof roleBasedData.admin).recentProducts.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-200">
                                                                <Package2 className="h-5 w-5 text-gray-500" />
                                                            </div>
                                                            <span className="font-medium">{product.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{product.category}</TableCell>
                                                    <TableCell>{formatCurrency(product.price)}</TableCell>
                                                    <TableCell>{product.stock}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={
                                                                product.status === 'In Stock'
                                                                    ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                                                    : product.status === 'Low Stock'
                                                                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                                                      : 'bg-red-100 text-red-800 hover:bg-red-100'
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
                                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                                <DropdownMenuItem>View details</DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <div className="text-sm text-gray-500">
                                        Showing 3 of {(data as typeof roleBasedData.admin).analytics.totalProducts} products
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" disabled>
                                            Previous
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            Next
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        </div>

                        <div>
                            <Card>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Recent Sales</CardTitle>
                                        <div className="flex gap-2">
                                            <div className="relative">
                                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                                <Input placeholder="Search sales..." className="w-64 pl-8" />
                                            </div>
                                            <Button variant="outline">
                                                Filter
                                                <ChevronDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardDescription>A list of your recent sales</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(data as typeof roleBasedData.admin).recentSales.map((sale) => (
                                                <TableRow key={sale.id}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{sale.customer}</div>
                                                            <div className="text-sm text-gray-500">{sale.email}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{sale.product}</TableCell>
                                                    <TableCell>{sale.date}</TableCell>
                                                    <TableCell>{formatCurrency(sale.amount)}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={
                                                                sale.status === 'Completed'
                                                                    ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                                                    : sale.status === 'Processing'
                                                                      ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                                                                      : 'bg-red-100 text-red-800 hover:bg-red-100'
                                                            }
                                                        >
                                                            {sale.status}
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
                                                                <DropdownMenuItem>Send invoice</DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-red-600">Cancel order</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <div className="text-sm text-gray-500">Showing 3 recent sales</div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" disabled>
                                            Previous
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            Next
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

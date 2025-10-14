import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
    Users, 
    UserCheck, 
    Calendar, 
    TestTube, 
    Package, 
    DollarSign, 
    TrendingUp,
    Clock,
    AlertTriangle,
    Activity,
    Stethoscope,
    FileText,
    Heart
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    dashboard: {
        totals: {
            doctors: number;
            patients: number;
            newPatientsThisMonth: number;
            todayAppointments: number;
            pendingLabTests: number;
            lowStockSupplies: number;
            unpaidBills: number;
            items: number;
            labOrders: number;
            todayRevenue: number;
        };
        recent: {
            patients: Array<{
                id: number;
                first_name: string;
                last_name: string;
                created_at: string;
            }>;
            items: Array<{
                id: number;
                name: string;
                code: string;
                current_stock: number;
            }>;
            labOrders: Array<{
                id: number;
                patient_id: number;
                created_at: string;
                patient?: {
                    first_name: string;
                    last_name: string;
                };
                labTests?: Array<{
                    name: string;
                }>;
            }>;
        };
    };
}

export default function Dashboard({ dashboard }: DashboardProps) {
    const { totals, recent } = dashboard;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600">Welcome to St. James Clinic Management System</p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totals.patients}</div>
                                <p className="text-xs text-muted-foreground">
                                    +{totals.newPatientsThisMonth} new this month
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totals.todayAppointments}</div>
                                <p className="text-xs text-muted-foreground">
                                    Scheduled for today
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Lab Tests</CardTitle>
                                <TestTube className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totals.pendingLabTests}</div>
                                <p className="text-xs text-muted-foreground">
                                    Awaiting results
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₱{totals.todayRevenue.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    From today's transactions
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Additional Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
                                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totals.doctors}</div>
                                <p className="text-xs text-muted-foreground">
                                    Available for appointments
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Lab Orders</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totals.labOrders}</div>
                                <p className="text-xs text-muted-foreground">
                                    Total lab orders
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">{totals.lowStockSupplies}</div>
                                <p className="text-xs text-muted-foreground">
                                    Need restocking
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Unpaid Bills</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{totals.unpaidBills}</div>
                                <p className="text-xs text-muted-foreground">
                                    Pending payment
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Patients */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Recent Patients
                                </CardTitle>
                                <CardDescription>Latest patient registrations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recent.patients.length > 0 ? (
                                        recent.patients.map((patient) => (
                                            <div key={patient.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <UserCheck className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(patient.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline">New</Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No recent patients</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Lab Orders */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TestTube className="h-5 w-5" />
                                    Recent Lab Orders
                                </CardTitle>
                                <CardDescription>Latest laboratory test orders</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recent.labOrders.length > 0 ? (
                                        recent.labOrders.map((order) => (
                                            <div key={order.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                        <TestTube className="h-4 w-4 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {order.patient?.first_name} {order.patient?.last_name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {order.labTests?.length || 0} test(s) • {new Date(order.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline">Order #{order.id}</Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No recent lab orders</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Quick Actions
                            </CardTitle>
                            <CardDescription>Common tasks and shortcuts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Link href="/admin/patient/create">
                                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                                        <Users className="h-6 w-6" />
                                        <span>Add Patient</span>
                                    </Button>
                                </Link>
                                <Link href="/admin/appointments/create">
                                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                                        <Calendar className="h-6 w-6" />
                                        <span>Book Appointment</span>
                                    </Button>
                                </Link>
                                <Link href="/admin/lab-orders/create">
                                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                                        <TestTube className="h-6 w-6" />
                                        <span>Lab Order</span>
                                    </Button>
                                </Link>
                                <Link href="/admin/reports">
                                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                                        <FileText className="h-6 w-6" />
                                        <span>Reports</span>
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

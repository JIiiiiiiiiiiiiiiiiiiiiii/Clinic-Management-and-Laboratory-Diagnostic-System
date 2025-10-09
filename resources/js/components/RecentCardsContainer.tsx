import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { Link, usePage } from '@inertiajs/react';
import { BarChart3, CreditCard, FlaskConical, MoreHorizontal, Package2, Users } from 'lucide-react';

export default function RecentCardsContainer() {
    const { permissions } = useRoleAccess();
    const { dashboard } = usePage().props as any;

    const formatCurrency = (amount: string) => {
        return amount;
    };

    return (
        <div className="space-y-8">
            {/* Recent Lab Tests */}
            {permissions.canAccessLaboratory && (
                <div className="mb-8 bg-white border border-gray-200 shadow-sm rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Recent Lab Tests</h2>
                            <p className="text-gray-600 mt-1">Latest laboratory test requests and results</p>
                        </div>
                        <Button asChild className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                            <Link href="/admin/laboratory">View All Tests</Link>
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {(() => {
                            const rows = (dashboard?.recent?.labOrders || []).map((o: any) => ({
                                id: o.id,
                                patient: o.patient ? `${o.patient.last_name}, ${o.patient.first_name}` : '—',
                                tests: (o.lab_tests || []).map((t: any) => t.name).join(', '),
                                date: new Date(o.created_at).toLocaleString(),
                                status: 'Ordered',
                            }));
                            return rows.map((row: any) => (
                                <div key={row.id} className="holographic-card shadow-sm transition-shadow hover:shadow-md flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                            <FlaskConical className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{row.patient}</h3>
                                            <p className="text-sm text-gray-600">{row.tests}</p>
                                            <p className="text-xs text-gray-500 mt-1">{row.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 px-3 py-1 rounded-full">
                                            {row.status}
                                        </Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
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
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            )}

            {/* Recent Transactions */}
            {permissions.canAccessBilling && (
                <div className="mb-8 bg-white border border-gray-200 shadow-sm rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Recent Transactions</h2>
                            <p className="text-gray-600 mt-1">Latest billing and payment activities</p>
                        </div>
                        <Button asChild className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                            <Link href="/admin/billing">View All Transactions</Link>
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {(() => {
                            const sampleTransactions = [
                                { id: 1, patient: 'John Doe', service: 'Consultation', amount: '₱1,500', status: 'Paid', date: '2024-01-15' },
                                { id: 2, patient: 'Jane Smith', service: 'Lab Test', amount: '₱800', status: 'Pending', date: '2024-01-14' },
                                { id: 3, patient: 'Mike Johnson', service: 'X-Ray', amount: '₱2,200', status: 'Paid', date: '2024-01-13' },
                            ];
                            return sampleTransactions.map((transaction) => (
                                <div key={transaction.id} className="holographic-card shadow-sm transition-shadow hover:shadow-md flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                                            <CreditCard className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{transaction.patient}</h3>
                                            <p className="text-sm text-gray-600">{transaction.service}</p>
                                            <p className="text-xs text-gray-500 mt-1">{transaction.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">{transaction.amount}</p>
                                        </div>
                                        <Badge className={`px-3 py-1 rounded-full ${
                                            transaction.status === 'Paid'
                                                ? 'bg-green-100 text-green-800'
                                                : transaction.status === 'Pending'
                                                  ? 'bg-yellow-100 text-yellow-800'
                                                  : 'bg-red-100 text-red-800'
                                        }`}>
                                            {transaction.status}
                                        </Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
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
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            )}

            {/* Recent Patients */}
            {permissions.canAccessAppointments && (
                <div className="mb-8 bg-white border border-gray-200 shadow-sm rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Recent Patients</h2>
                            <p className="text-gray-600 mt-1">Latest patient registrations and visits</p>
                        </div>
                        <Button asChild className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                            <Link href="/admin/appointments">View All Appointments</Link>
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {(() => {
                            const rows = (dashboard?.recent?.patients || []).map((p: any) => ({
                                id: p.id,
                                name: `${p.last_name ?? ''}, ${p.first_name ?? ''}`,
                                lastVisit: new Date(p.created_at).toLocaleDateString(),
                                diagnosis: 'General Check-up',
                                status: 'Active',
                            }));
                            return (
                                rows.map((patient: { id: number; name: string; lastVisit: string; diagnosis: string; status: string }) => (
                                    <div key={patient.id} className="holographic-card shadow-sm transition-shadow hover:shadow-md flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                                                <Users className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                                                <p className="text-sm text-gray-600">{patient.diagnosis}</p>
                                                <p className="text-xs text-gray-500 mt-1">Last visit: {patient.lastVisit}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Badge className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                                                {patient.status}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="hover:bg-gray-100">
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
                                        </div>
                                    </div>
                                )) || []
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Recent Items */}
            {permissions.canAccessInventory && (
                <div className="mb-8 bg-white border border-gray-200 shadow-sm rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Recent Items</h2>
                            <p className="text-gray-600 mt-1">Latest inventory additions and updates</p>
                        </div>
                        <Button asChild className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                            <Link href="/admin/inventory">View All Items</Link>
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {(() => {
                            const rows = (dashboard?.recent?.items || []).map((p: any) => ({
                                id: p.id,
                                name: p.name,
                                stock: Number(p.current_stock ?? 0),
                                status: Number(p.current_stock ?? 0) > 0 ? 'In Stock' : 'Out of Stock',
                            }));
                            return (
                                rows.map((product: { id: number; name: string; stock: number; status: string }) => (
                                    <div key={product.id} className="holographic-card shadow-sm transition-shadow hover:shadow-md flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                                <Package2 className="h-6 w-6 text-black" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                                <p className="text-sm text-gray-600">Stock: {product.stock} units</p>
                                                <div className="flex items-center mt-1">
                                                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                        <div className={`h-2 rounded-full ${product.stock > 10 ? 'bg-gray-400' : product.stock > 5 ? 'bg-gray-300' : 'bg-gray-200'}`} style={{width: `${Math.min((product.stock / 20) * 100, 100)}%`}}></div>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{product.stock > 10 ? 'High' : product.stock > 5 ? 'Medium' : 'Low'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Badge className={`px-3 py-1 rounded-full ${
                                                product.status === 'In Stock'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {product.status}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="hover:bg-gray-100">
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
                                        </div>
                                    </div>
                                )) || []
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Recent Sales */}
            {permissions.canAccessReports && (
                <div className="mb-8 bg-white border border-gray-200 shadow-sm rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Recent Sales</h2>
                            <p className="text-gray-600 mt-1">Latest sales transactions and revenue</p>
                        </div>
                        <Button asChild className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700">
                            <Link href="/admin/reports">View All Reports</Link>
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {(() => {
                            const roleBasedData = {
                                admin: {
                                    recentSales: [
                                        { id: 1, product: 'Paracetamol 500mg', quantity: 50, revenue: '₱2,500' },
                                        { id: 2, product: 'Amoxicillin 250mg', quantity: 30, revenue: '₱4,500' },
                                        { id: 3, product: 'Ibuprofen 400mg', quantity: 25, revenue: '₱1,875' },
                                    ],
                                },
                            };
                            const adminData = roleBasedData.admin;
                            return (
                                adminData.recentSales?.map((sale) => (
                                    <div key={sale.id} className="holographic-card shadow-sm transition-shadow hover:shadow-md flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                                                <BarChart3 className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{sale.product}</h3>
                                                <p className="text-sm text-gray-600">Quantity: {sale.quantity} units</p>
                                                <p className="text-xs text-gray-500 mt-1">Today</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">{formatCurrency(sale.revenue)}</p>
                                                <p className="text-xs text-green-600">+12% from yesterday</p>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="hover:bg-gray-100">
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
                                        </div>
                                    </div>
                                )) || []
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
}

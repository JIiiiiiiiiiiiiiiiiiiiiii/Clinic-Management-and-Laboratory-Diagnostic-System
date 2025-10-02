import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BarChart3, Calendar, CreditCard, DollarSign, FlaskConical, Package2, TrendingUp, UserCheck, Users, Stethoscope, FileText } from 'lucide-react';
import Heading from '@/components/heading';
import QuickAccessModule from '@/components/dashboard/QuickAccessModule';
import RecentActivities from '@/components/dashboard/RecentActivities';
import CalendarWidget from '@/components/dashboard/CalendarWidget';
import AdminNotes from '@/components/dashboard/AdminNotes';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];


export default function Dashboard() {
    const { permissions, canAccessModule, isPatient } = useRoleAccess();
    const { auth, dashboard } = usePage().props as any;

    // If user is a patient, redirect them to patient dashboard
    if (isPatient) {
        return null; // This should not happen due to middleware, but safety check
    }

    const renderAnalyticsCards = () => {
        return (
            <div className="mb-8 flex flex-wrap items-start gap-2 sm:gap-3 md:gap-4">
                {/* Card 1: Total Doctors - Small Footer */}
                <Link href="/admin/doctors" className="block flex-1 min-w-[140px] sm:min-w-[160px] md:min-w-[180px] lg:min-w-[192px]">
                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all cursor-pointer w-full">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white h-24 flex items-center">
                            <div className="flex items-center justify-between p-4 w-full">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                        <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">Total Doctors</h3>
                                        <p className="text-emerald-100 text-xs leading-tight">Active staff</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 sm:px-6 py-3">
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">{String(dashboard?.totals?.doctors ?? 0)}</div>
                        </div>
                    </div>
                </Link>

                {/* Card 2: Total Patients - Medium Footer */}
                <Link href="/admin/patient" className="block flex-1 min-w-[140px] sm:min-w-[160px] md:min-w-[180px] lg:min-w-[192px]">
                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all cursor-pointer w-full">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white h-24 flex items-center">
                            <div className="flex items-center justify-between p-4 w-full">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                        <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">Total Patients</h3>
                                        <p className="text-indigo-100 text-xs leading-tight">All time</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 sm:px-6 py-4">
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">{String(dashboard?.totals?.patients ?? 0)}</div>
                        </div>
                    </div>
                </Link>

                {/* Card 3: Today's Appointments - Large Footer */}
                <Link href="/admin/appointments" className="block flex-1 min-w-[140px] sm:min-w-[160px] md:min-w-[180px] lg:min-w-[192px]">
                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all cursor-pointer w-full">
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white h-24 flex items-center">
                            <div className="flex items-center justify-between p-4 w-full">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">Today's Appointments</h3>
                                        <p className="text-blue-100 text-xs leading-tight">Scheduled visits</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 sm:px-6 py-6">
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">{String(dashboard?.totals?.todayAppointments ?? 0)}</div>
                        </div>
                    </div>
                </Link>

                {/* Card 4: Pending Lab Tests - Large Footer */}
                <Link href="/admin/laboratory" className="block flex-1 min-w-[140px] sm:min-w-[160px] md:min-w-[180px] lg:min-w-[192px]">
                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all cursor-pointer w-full">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white h-24 flex items-center">
                            <div className="flex items-center justify-between p-4 w-full">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                        <FlaskConical className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">Pending Lab Tests</h3>
                                        <p className="text-orange-100 text-xs leading-tight">Awaiting results</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 sm:px-6 py-6">
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">{String(dashboard?.totals?.pendingLabTests ?? 0)}</div>
                        </div>
                    </div>
                </Link>

                {/* Card 5: Low Stock Supplies - Medium Footer */}
                <Link href="/admin/inventory" className="block flex-1 min-w-[140px] sm:min-w-[160px] md:min-w-[180px] lg:min-w-[192px]">
                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all cursor-pointer w-full">
                        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white h-24 flex items-center">
                            <div className="flex items-center justify-between p-4 w-full">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                        <Package2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">Low Stock Supplies</h3>
                                        <p className="text-yellow-100 text-xs leading-tight">Needs restock</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 sm:px-6 py-4">
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">{String(dashboard?.totals?.lowStockSupplies ?? 0)}</div>
                        </div>
                    </div>
                </Link>

                {/* Card 6: Unpaid Bills - Small Footer */}
                <Link href="/admin/billing" className="block flex-1 min-w-[140px] sm:min-w-[160px] md:min-w-[180px] lg:min-w-[192px]">
                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all cursor-pointer w-full">
                        <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white h-24 flex items-center">
                            <div className="flex items-center justify-between p-4 w-full">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">Unpaid Bills</h3>
                                        <p className="text-red-100 text-xs leading-tight">Pending payments</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 sm:px-6 py-3">
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">{String(dashboard?.totals?.unpaidBills ?? 0)}</div>
                        </div>
                    </div>
                </Link>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mb-8">
                    <Heading title="Admin Dashboard" description="Overview of clinic operations and management" icon={BarChart3} />
                </div>

                {/* Role-based Analytics Cards */}
                {renderAnalyticsCards()}

                {/* 2-Column Main Body Layout - Left side wider for main content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                    {/* Column 1: Quick Access + Recent Activities (Wider - 8/12 columns) */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* Quick Access Module */}
                        <div>
                            <QuickAccessModule />
                        </div>

                        {/* Recent Activities */}
                        <div>
                            <RecentActivities />
                        </div>
                    </div>

                    {/* Column 2: Calendar + Admin Notes (Narrower - 4/12 columns) */}
                    <div className="lg:col-span-4 flex flex-col gap-8">
                        {/* Calendar Widget */}
                        <div>
                            <CalendarWidget />
                        </div>

                        {/* Admin Notes */}
                        <div>
                            <AdminNotes />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

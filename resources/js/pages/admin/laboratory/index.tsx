import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { FileText, Settings, TestTube, Users, FlaskConical, BarChart3, CheckCircle } from 'lucide-react';
import Heading from '@/components/heading';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Laboratory Diagnostics',
        href: '/admin/laboratory',
    },
];

export default function LaboratoryIndex() {
    const { isAdmin } = useRoleAccess();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laboratory Diagnostics" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Heading title="Laboratory Diagnostics" description="Manage lab tests, orders, and results" icon={FlaskConical} />
                        <div className="flex items-center gap-4">
                            <div className="counter-card text-white rounded-xl shadow-lg border-0 px-6 py-4 w-52 h-20 flex items-center">
                                <div className="flex items-center gap-3">
                                    <div className="counter-icon p-2 rounded-lg border border-white/60">
                                        <FlaskConical className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold">0</div>
                                        <div className="text-blue-100 text-sm font-medium">Active Tests</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {isAdmin && (
                        <Link href="/admin/laboratory/tests" className="block">
                            <div className="holographic-card bg-white shadow-sm cursor-pointer rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                                <div className="flex h-32">
                                    {/* Icon Section - Colored background fills top to bottom */}
                                    <div className="w-28 h-full bg-purple-500 flex items-center justify-center rounded-l-xl">
                                        <TestTube className="h-10 w-10 text-white" />
                                    </div>
                                    {/* Text Section - All content on the right */}
                                    <div className="flex-1 p-4">
                                        <div className="text-2xl font-bold text-gray-900">Test Templates</div>
                                        <div className="text-sm text-gray-600 mb-2">Manage Lab Tests</div>
                                        <div className="space-y-1">
                                            <div className="text-xs text-gray-500">Create and configure</div>
                                            <div className="text-xs text-gray-500">lab test templates</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )}

                    <Link href="/admin/patient" className="block">
                        <div className="holographic-card bg-white shadow-sm cursor-pointer rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                            <div className="flex h-32">
                                {/* Icon Section - Colored background fills top to bottom */}
                                <div className="w-28 h-full bg-indigo-500 flex items-center justify-center rounded-l-xl">
                                    <Users className="h-10 w-10 text-white" />
                                </div>
                                {/* Text Section - All content on the right */}
                                <div className="flex-1 p-4">
                                    <div className="text-2xl font-bold text-gray-900">Patient Records</div>
                                    <div className="text-sm text-gray-600 mb-2">Access Patients</div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-gray-500">View patient records</div>
                                        <div className="text-xs text-gray-500">to create lab orders</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/laboratory/orders" className="block">
                        <div className="holographic-card bg-white shadow-sm cursor-pointer rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                            <div className="flex h-32">
                                {/* Icon Section - Colored background fills top to bottom */}
                                <div className="w-28 h-full bg-green-500 flex items-center justify-center rounded-l-xl">
                                    <FileText className="h-10 w-10 text-white" />
                                </div>
                                {/* Text Section - All content on the right */}
                                <div className="flex-1 p-4">
                                    <div className="text-2xl font-bold text-gray-900">Lab Orders</div>
                                    <div className="text-sm text-gray-600 mb-2">Manage Orders</div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-gray-500">View and manage</div>
                                        <div className="text-xs text-gray-500">all lab orders</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/laboratory/reports" className="block">
                        <div className="holographic-card bg-white shadow-sm cursor-pointer rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                            <div className="flex h-32">
                                {/* Icon Section - Colored background fills top to bottom */}
                                <div className="w-28 h-full bg-orange-500 flex items-center justify-center rounded-l-xl">
                                    <BarChart3 className="h-10 w-10 text-white" />
                                </div>
                                {/* Text Section - All content on the right */}
                                <div className="flex-1 p-4">
                                    <div className="text-2xl font-bold text-gray-900">Reports</div>
                                    <div className="text-sm text-gray-600 mb-2">Generate Reports</div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-gray-500">Print and export</div>
                                        <div className="text-xs text-gray-500">lab reports</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Recent Activity */}
                <div className="mt-8">
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        {/* Header Section - No gaps */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Recent Activity</h3>
                                    <p className="text-green-100 mt-1">System status and updates</p>
                                </div>
                            </div>
                        </div>
                        {/* Content Section - Seamlessly connected */}
                        <div className="px-6 py-6 bg-gradient-to-br from-green-50 to-green-100">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-green-200">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    <div className="text-sm">
                                        <div className="font-semibold text-gray-700">System Ready</div>
                                        <div className="text-gray-500">Laboratory module initialized</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-green-200">
                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                    <div className="text-sm">
                                        <div className="font-semibold text-gray-700">Test Templates</div>
                                        <div className="text-gray-500">Default tests loaded (CBC, Urinalysis, Fecalysis)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

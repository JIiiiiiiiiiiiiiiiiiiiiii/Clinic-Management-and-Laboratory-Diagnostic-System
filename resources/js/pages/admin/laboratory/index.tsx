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
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Heading title="Laboratory Diagnostics" description="Manage lab tests, orders, and results" icon={FlaskConical} />
                        <div className="flex items-center gap-4">
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4 w-52 h-20 flex items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <FlaskConical className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900">0</div>
                                        <div className="text-gray-600 text-sm font-medium">Active Tests</div>
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
                            <div className="bg-white shadow-sm cursor-pointer rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                                <div className="flex h-32">
                                    {/* Icon Section - Simple background */}
                                    <div className="w-28 h-full bg-gray-100 flex items-center justify-center rounded-l-xl">
                                        <TestTube className="h-10 w-10 text-gray-600" />
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
                        <div className="bg-white shadow-sm cursor-pointer rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                            <div className="flex h-32">
                                {/* Icon Section - Simple background */}
                                <div className="w-28 h-full bg-gray-100 flex items-center justify-center rounded-l-xl">
                                    <Users className="h-10 w-10 text-gray-600" />
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
                        <div className="bg-white shadow-sm cursor-pointer rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                            <div className="flex h-32">
                                {/* Icon Section - Simple background */}
                                <div className="w-28 h-full bg-gray-100 flex items-center justify-center rounded-l-xl">
                                    <FileText className="h-10 w-10 text-gray-600" />
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
                        <div className="bg-white shadow-sm cursor-pointer rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                            <div className="flex h-32">
                                {/* Icon Section - Simple background */}
                                <div className="w-28 h-full bg-gray-100 flex items-center justify-center rounded-l-xl">
                                    <BarChart3 className="h-10 w-10 text-gray-600" />
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
                    <Card className="shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">System status and updates</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                <div className="text-sm">
                                    <div className="font-semibold text-gray-700">System Ready</div>
                                    <div className="text-gray-500">Laboratory module initialized</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                <div className="text-sm">
                                    <div className="font-semibold text-gray-700">Test Templates</div>
                                    <div className="text-gray-500">Default tests loaded (CBC, Urinalysis, Fecalysis)</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

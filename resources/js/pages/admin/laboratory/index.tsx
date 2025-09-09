import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FileText, Settings, TestTube, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Laboratory', href: '/admin/laboratory' }];

export default function LaboratoryIndex() {
    const { isAdmin } = useRoleAccess();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laboratory Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div>
                    <h1 className="text-3xl font-bold">Laboratory Dashboard</h1>
                    <p className="text-muted-foreground">Manage lab tests, orders, and results</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {isAdmin && (
                        <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => router.visit('/admin/laboratory/tests')}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Test Templates</CardTitle>
                                <TestTube className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Manage</div>
                                <p className="text-xs text-muted-foreground">Create and configure lab test templates</p>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => router.visit('/admin/patient')}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Patient Records</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">View</div>
                            <p className="text-xs text-muted-foreground">Access patient records to create lab orders</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => router.visit('/admin/laboratory/orders')}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Lab Orders</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Manage</div>
                            <p className="text-xs text-muted-foreground">View and manage all lab orders</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => router.visit('/admin/laboratory/reports')}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Reports</CardTitle>
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Generate</div>
                            <p className="text-xs text-muted-foreground">Print and export lab reports</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isAdmin && (
                                <Button className="w-full justify-start" variant="outline" onClick={() => router.visit('/admin/laboratory/tests')}>
                                    <TestTube className="mr-2 h-4 w-4" />
                                    Manage Test Templates
                                </Button>
                            )}
                            <Button className="w-full justify-start" variant="outline" onClick={() => router.visit('/admin/laboratory/orders')}>
                                <FileText className="mr-2 h-4 w-4" />
                                View Lab Orders
                            </Button>
                            <Button className="w-full justify-start" variant="outline" onClick={() => router.visit('/admin/patient')}>
                                <Users className="mr-2 h-4 w-4" />
                                View Patient Records
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    <div className="text-sm">
                                        <div className="font-medium">System Ready</div>
                                        <div className="text-muted-foreground">Laboratory module initialized</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                    <div className="text-sm">
                                        <div className="font-medium">Test Templates</div>
                                        <div className="text-muted-foreground">Default tests loaded (CBC, Urinalysis, Fecalysis)</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

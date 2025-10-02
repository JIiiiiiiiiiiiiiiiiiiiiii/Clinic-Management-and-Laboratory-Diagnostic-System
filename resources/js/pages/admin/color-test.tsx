import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { 
    Save, 
    X, 
    Trash2, 
    Check, 
    AlertTriangle, 
    Info, 
    Download,
    Plus,
    Edit,
    Eye
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Color Test',
        href: '/admin/color-test',
    },
];

export default function ColorTest() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Color Test - St. James Hospital" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Header */}
                <div>
                    <h1>Color System Test</h1>
                    <p className="text-muted-foreground">
                        Testing the new semantic color system
                    </p>
                </div>

                {/* Button Test */}
                <Card>
                    <CardHeader>
                        <CardTitle>Button Colors</CardTitle>
                        <CardDescription>
                            Testing semantic button variants
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3>Primary Actions</h3>
                            <div className="flex flex-wrap gap-3">
                                <Button>
                                    <Save className="h-4 w-4" />
                                    Save
                                </Button>
                                <Button>
                                    <Plus className="h-4 w-4" />
                                    Create
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h3>Secondary Actions</h3>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="secondary">
                                    <X className="h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button variant="outline">
                                    <Edit className="h-4 w-4" />
                                    Edit
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h3>Status Actions</h3>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="success">
                                    <Check className="h-4 w-4" />
                                    Approve
                                </Button>
                                <Button variant="warning">
                                    <AlertTriangle className="h-4 w-4" />
                                    Pending
                                </Button>
                                <Button variant="info">
                                    <Info className="h-4 w-4" />
                                    Info
                                </Button>
                                <Button variant="destructive">
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Badge Test */}
                <Card>
                    <CardHeader>
                        <CardTitle>Badge Colors</CardTitle>
                        <CardDescription>
                            Testing semantic badge variants
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            <Badge variant="success">Complete</Badge>
                            <Badge variant="success">Active</Badge>
                            <Badge variant="success">Approved</Badge>
                            <Badge variant="warning">Pending</Badge>
                            <Badge variant="warning">Awaiting Approval</Badge>
                            <Badge variant="info">New</Badge>
                            <Badge variant="info">In Progress</Badge>
                            <Badge variant="active">Current</Badge>
                            <Badge variant="destructive">Urgent</Badge>
                            <Badge variant="destructive">Error</Badge>
                            <Badge variant="destructive">Failed</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Color Swatches */}
                <Card>
                    <CardHeader>
                        <CardTitle>Color Swatches</CardTitle>
                        <CardDescription>
                            Direct color testing
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <div className="h-16 w-full bg-success rounded-md flex items-center justify-center text-success-foreground font-medium">
                                    Success
                                </div>
                                <p className="text-sm text-muted-foreground">Complete, Active, Approved</p>
                            </div>
                            <div className="space-y-2">
                                <div className="h-16 w-full bg-warning rounded-md flex items-center justify-center text-warning-foreground font-medium">
                                    Warning
                                </div>
                                <p className="text-sm text-muted-foreground">Pending, Awaiting Approval</p>
                            </div>
                            <div className="space-y-2">
                                <div className="h-16 w-full bg-info rounded-md flex items-center justify-center text-info-foreground font-medium">
                                    Info
                                </div>
                                <p className="text-sm text-muted-foreground">New, In Progress</p>
                            </div>
                            <div className="space-y-2">
                                <div className="h-16 w-full bg-active rounded-md flex items-center justify-center text-active-foreground font-medium">
                                    Active
                                </div>
                                <p className="text-sm text-muted-foreground">Current State</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}


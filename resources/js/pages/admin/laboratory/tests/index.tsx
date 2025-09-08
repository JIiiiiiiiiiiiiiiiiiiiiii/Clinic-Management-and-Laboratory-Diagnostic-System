import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Plus, TestTube, Trash2 } from 'lucide-react';

type TestRow = {
    id: number;
    name: string;
    code: string;
    fields_schema?: any;
    is_active: boolean;
    version: number;
    created_at: string;
    updated_at: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Laboratory', href: '/admin/laboratory' },
    { title: 'Test Templates', href: '/admin/laboratory/tests' },
];

export default function LabTestsIndex({ tests }: { tests: TestRow[] }) {
    const handleDelete = (testId: number, testName: string) => {
        if (confirm(`Are you sure you want to delete "${testName}"? This action cannot be undone.`)) {
            router.delete(`/admin/laboratory/tests/${testId}`);
        }
    };

    const getFieldCount = (test: TestRow) => {
        if (!test.fields_schema?.sections) return 0;
        return Object.values(test.fields_schema.sections).reduce((total: number, section: any) => {
            return total + Object.keys(section.fields || {}).length;
        }, 0);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lab Test Templates" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.visit('/admin/laboratory')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Lab Test Templates</h1>
                            <p className="text-muted-foreground">Manage laboratory diagnostic test templates</p>
                        </div>
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={() => router.visit('/admin/laboratory/tests/create')}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>New Test Template</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {tests.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <TestTube className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold">No Test Templates Yet</h3>
                            <p className="mb-6 text-center text-muted-foreground">
                                Create your first laboratory test template to get started. You can design custom forms for any type of lab test.
                            </p>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" onClick={() => router.visit('/admin/laboratory/tests/create')}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Create Your First Test</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {tests.map((test) => (
                            <Card key={test.id} className="transition-shadow hover:shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="mb-2 flex items-center gap-3">
                                                <h3 className="text-lg font-semibold">{test.name}</h3>
                                                <Badge variant={test.is_active ? 'default' : 'secondary'}>
                                                    {test.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                                <Badge variant="outline">v{test.version}</Badge>
                                            </div>
                                            <p className="mb-3 text-sm text-muted-foreground">
                                                Code: <span className="font-mono">{test.code}</span> •{getFieldCount(test)} fields • Created:{' '}
                                                {new Date(test.created_at).toLocaleDateString()}
                                            </p>
                                            {test.fields_schema?.sections && (
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.keys(test.fields_schema.sections).map((sectionKey) => (
                                                        <Badge key={sectionKey} variant="outline" className="text-xs">
                                                            {test.fields_schema.sections[sectionKey].title || sectionKey}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4 flex items-center gap-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => router.visit(`/admin/laboratory/tests/${test.id}/edit`)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Edit</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="destructive" size="icon" onClick={() => handleDelete(test.id, test.name)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Delete</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {tests.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Tips</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <div>
                                • <strong>Active tests</strong> can be ordered for patients
                            </div>
                            <div>
                                • <strong>Inactive tests</strong> are hidden from ordering but can be edited
                            </div>
                            <div>
                                • <strong>Version numbers</strong> help track changes to test templates
                            </div>
                            <div>
                                • <strong>Test codes</strong> should be short and unique (e.g., CBC, UA)
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

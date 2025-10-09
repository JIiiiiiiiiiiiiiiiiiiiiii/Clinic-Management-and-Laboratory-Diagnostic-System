import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Plus, TestTube, Trash2, Search, FlaskConical } from 'lucide-react';
import { useState } from 'react';

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
    {
        title: 'Test Templates',
        href: '/admin/laboratory/tests',
    },
];

export default function LabTestsIndex({ tests }: { tests: TestRow[] }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTests = tests.filter((test) => {
        const search = searchTerm.toLowerCase();
        return (
            test.name.toLowerCase().includes(search) ||
            test.code.toLowerCase().includes(search)
        );
    });

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
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Lab Test Templates</h1>
                                <p className="text-sm text-black mt-1">Manage laboratory diagnostic test templates and configurations</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <TestTube className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900">{tests.length}</div>
                                        <div className="text-gray-600 text-sm font-medium">Total Tests</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Two-column layout: left table, right quick tips */}
                <div className="grid gap-6 md:grid-cols-3 items-start">
                    <Card className="md:col-span-2 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <TestTube className="h-6 w-6 text-black" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-900">Test Templates</CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">Search and manage laboratory test templates</p>
                                </div>
                            </div>
                            <Button asChild>
                                <Link href="/admin/laboratory/tests/create">
                                    <Plus className="mr-3 h-6 w-6" />
                                    Add New Test
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                        <div className="mb-6">
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search tests by name or code..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="hover:bg-gray-50">
                                        <TableHead className="font-semibold text-gray-700">
                                            <div className="flex items-center gap-2">
                                                <TestTube className="h-4 w-4" />
                                                Test Name
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700">Code</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Fields</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Version</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Created</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTests.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                <div className="flex flex-col items-center">
                                                    <TestTube className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                    <h3 className="mb-2 text-lg font-semibold text-gray-600">{searchTerm ? 'No tests found' : 'No test templates yet'}</h3>
                                                    <p className="text-gray-500">
                                                        {searchTerm ? 'Try adjusting your search terms' : 'Create your first laboratory test template to get started'}
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredTests.map((test) => (
                                            <TableRow key={test.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1 bg-gray-100 rounded-full">
                                                            <TestTube className="h-4 w-4 text-black" />
                                                        </div>
                                                        {test.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600 font-mono">{test.code}</TableCell>
                                                <TableCell className="text-sm text-gray-600">{getFieldCount(test)} fields</TableCell>
                                                <TableCell className="text-sm text-gray-600">v{test.version}</TableCell>
                                                <TableCell>
                                                    <Badge variant={test.is_active ? 'default' : 'secondary'}>
                                                        {test.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">{new Date(test.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-3">
                                                        <Button asChild>
                                                            <Link href={`/admin/laboratory/tests/${test.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                        <Button variant="destructive" onClick={() => handleDelete(test.id, test.name)}>
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-lg sticky top-0 self-start">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <FlaskConical className="h-6 w-6 text-black" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-900">Quick Tips</CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">Best practices for test templates</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    <div className="p-3 bg-gray-50 rounded-lg border">
                                        <div className="font-semibold text-gray-800 mb-1">Active Tests</div>
                                        <div className="text-sm text-gray-600">Active tests can be ordered for patients</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg border">
                                        <div className="font-semibold text-gray-800 mb-1">Inactive Tests</div>
                                        <div className="text-sm text-gray-600">Hidden from ordering but can be edited</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg border">
                                        <div className="font-semibold text-gray-800 mb-1">Version Control</div>
                                        <div className="text-sm text-gray-600">Version numbers help track changes to test templates</div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="p-3 bg-gray-50 rounded-lg border">
                                        <div className="font-semibold text-gray-800 mb-1">Test Codes</div>
                                        <div className="text-sm text-gray-600">Short and unique codes like "CBC" or "UA"</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg border">
                                        <div className="font-semibold text-gray-800 mb-1">Field Organization</div>
                                        <div className="text-sm text-gray-600">Group related fields in logical sections</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg border">
                                        <div className="font-semibold text-gray-800 mb-1">Required Fields</div>
                                        <div className="text-sm text-gray-600">Mark essential fields as required for data completeness</div>
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

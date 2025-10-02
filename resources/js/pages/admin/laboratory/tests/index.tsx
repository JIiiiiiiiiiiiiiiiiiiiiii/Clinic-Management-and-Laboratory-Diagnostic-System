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
        title: 'Laboratory Diagnostics',
        href: '/admin/laboratory',
    },
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Heading title="Lab Test Templates" description="Manage laboratory diagnostic test templates" icon={TestTube} />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="counter-card text-white rounded-xl shadow-lg border-0 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="counter-icon p-2 rounded-lg border border-white/60 bg-gradient-to-r from-[#063970] to-[#052b54]">
                                        <TestTube className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold">{tests.length}</div>
                                        <div className="text-blue-100 text-sm font-medium">Total Tests</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Two-column layout: left table, right quick tips */}
                <div className="grid gap-6 md:grid-cols-3 items-start">
                    <div className="md:col-span-2 holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                    {/* Header Section - No gaps */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                    <TestTube className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Test Templates</h3>
                                    <p className="text-blue-100 mt-1">Search and manage laboratory test templates</p>
                                </div>
                            </div>
                            <Button asChild className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl">
                                <Link href="/admin/laboratory/tests/create">
                                    <Plus className="mr-3 h-6 w-6" />
                                    Add New Test
                                </Link>
                            </Button>
                        </div>
                    </div>
                    {/* Content Section - Seamlessly connected */}
                    <div className="px-6 py-6 bg-gradient-to-br from-blue-50 to-blue-100">
                        <div className="mb-6">
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search tests by name or code..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
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
                                                        <div className="p-1 bg-blue-100 rounded-full">
                                                            <TestTube className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        {test.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600 font-mono">{test.code}</TableCell>
                                                <TableCell className="text-sm text-gray-600">{getFieldCount(test)} fields</TableCell>
                                                <TableCell className="text-sm text-gray-600">v{test.version}</TableCell>
                                                <TableCell>
                                                    <Badge variant={test.is_active ? 'success' : 'secondary'}>
                                                        {test.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">{new Date(test.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-3">
                                                        <Button asChild className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                                            <Link href={`/admin/laboratory/tests/${test.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                        <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl" onClick={() => handleDelete(test.id, test.name)}>
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
                    </div>
                    {/* Close Test Templates card container */}
                    </div>
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white sticky top-0 self-start">
                        {/* Header Section - No gaps */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                    <FlaskConical className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Quick Tips</h3>
                                    <p className="text-green-100 mt-1">Best practices for test templates</p>
                                </div>
                            </div>
                        </div>
                        {/* Content Section - Seamlessly connected */}
                        <div className="px-6 py-6 bg-gradient-to-br from-emerald-50 to-green-100">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    <div className="p-3 bg-white rounded-lg border border-emerald-200">
                                        <div className="font-semibold text-gray-800 mb-1">Active Tests</div>
                                        <div className="text-sm text-gray-600">Active tests can be ordered for patients</div>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg border border-emerald-200">
                                        <div className="font-semibold text-gray-800 mb-1">Inactive Tests</div>
                                        <div className="text-sm text-gray-600">Hidden from ordering but can be edited</div>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg border border-emerald-200">
                                        <div className="font-semibold text-gray-800 mb-1">Version Control</div>
                                        <div className="text-sm text-gray-600">Version numbers help track changes to test templates</div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="p-3 bg-white rounded-lg border border-emerald-200">
                                        <div className="font-semibold text-gray-800 mb-1">Test Codes</div>
                                        <div className="text-sm text-gray-600">Short and unique codes like "CBC" or "UA"</div>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg border border-emerald-200">
                                        <div className="font-semibold text-gray-800 mb-1">Field Organization</div>
                                        <div className="text-sm text-gray-600">Group related fields in logical sections</div>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg border border-emerald-200">
                                        <div className="font-semibold text-gray-800 mb-1">Required Fields</div>
                                        <div className="text-sm text-gray-600">Mark essential fields as required for data completeness</div>
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

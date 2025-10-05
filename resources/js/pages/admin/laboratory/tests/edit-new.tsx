import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ArrowLeft, Edit, Plus, TestTube, Trash2, Save, Eye } from 'lucide-react';

type Test = {
    id: number;
    name: string;
    code: string;
    description?: string;
    is_active: boolean;
    fields_schema: any;
};

type TestEditProps = {
    test: Test;
};

export default function TestEdit({ test }: TestEditProps): React.ReactElement {
    const [data, setData] = useState({
        name: test.name,
        code: test.code,
        description: test.description || '',
        is_active: test.is_active,
    });
    
    const [schema, setSchema] = useState(test.fields_schema || { sections: {} });
    const [previewMode, setPreviewMode] = useState(false);
    const [processing, setProcessing] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Laboratory', href: '/admin/laboratory' },
        { title: 'Test Templates', href: '/admin/laboratory/tests' },
        { title: `Edit ${test.name}`, href: `/admin/laboratory/tests/${test.id}/edit` },
    ];

    const setDataAny = (key: string, value: any) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    const addSection = () => {
        const sectionKey = `section_${Date.now()}`;
        setSchema(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                [sectionKey]: {
                    title: 'New Section',
                    fields: {}
                }
            }
        }));
    };

    const deleteSection = (sectionKey: string) => {
        setSchema(prev => {
            const newSections = { ...prev.sections };
            delete newSections[sectionKey];
            return { ...prev, sections: newSections };
        });
    };

    const addField = (sectionKey: string) => {
        const fieldKey = `field_${Date.now()}`;
        setSchema(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                [sectionKey]: {
                    ...prev.sections[sectionKey],
                    fields: {
                        ...prev.sections[sectionKey].fields,
                        [fieldKey]: {
                            label: 'New Field',
                            type: 'text',
                            placeholder: 'Enter value'
                        }
                    }
                }
            }
        }));
    };

    const deleteField = (sectionKey: string, fieldKey: string) => {
        setSchema(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                [sectionKey]: {
                    ...prev.sections[sectionKey],
                    fields: Object.fromEntries(
                        Object.entries(prev.sections[sectionKey].fields).filter(([key]) => key !== fieldKey)
                    )
                }
            }
        }));
    };

    const submit = () => {
        setProcessing(true);
        // Handle form submission
        setTimeout(() => setProcessing(false), 1000);
    };

    const renderPreview = () => (
        <div className="space-y-8">
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Eye className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">Test Preview</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">How this test will look to users when ordering</p>
                        </div>
                    </div>
                    <Button variant="secondary" onClick={() => setPreviewMode(false)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Test
                    </Button>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-6">
                        {Object.entries(schema.sections || {}).map(([sectionKey, section]: [string, any]) => (
                            <div key={sectionKey} className="bg-white rounded-xl border border-gray-200 shadow-sm">
                                <div className="bg-gray-50 p-4 rounded-t-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <TestTube className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900">{section.title}</h4>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {Object.entries(section.fields || {}).map(([fieldKey, field]: [string, any]) => (
                                            <div key={fieldKey} className="space-y-2">
                                                <Label className="text-sm font-semibold text-gray-700">
                                                    {field.label || fieldKey}
                                                </Label>
                                                <Input 
                                                    placeholder={field.placeholder || `Enter ${field.label || fieldKey}`}
                                                    disabled
                                                    className="h-12 border-gray-300 rounded-xl shadow-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {Object.keys(schema.sections || {}).length === 0 && (
                            <div className="py-12 text-center bg-white rounded-xl border-2 border-dashed border-indigo-300">
                                <div className="text-indigo-400 mb-4">
                                    <TestTube className="h-12 w-12 mx-auto" />
                                </div>
                                <p className="text-lg font-semibold text-gray-700 mb-2">No sections to preview</p>
                                <p className="text-gray-500">Add sections and fields to see how your test will look</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Test Template - ${test.name}`} />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-gray-300 hover:bg-gray-50">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Test Template</h1>
                                <p className="text-lg text-gray-600">{test.name}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {previewMode ? (
                    renderPreview()
                ) : (
                    <div className="space-y-8">
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <TestTube className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Basic Information</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">Update test name, code, and availability settings</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="secondary" onClick={() => setPreviewMode(true)}>
                                        <Eye className="mr-3 h-6 w-6" />
                                        Preview
                                    </Button>
                                    <Button onClick={submit} disabled={processing}>
                                        <Save className="mr-3 h-6 w-6" />
                                        Save Changes
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-2 block">Test Name *</Label>
                                            <Input
                                                id="name" 
                                                value={data.name}
                                                onChange={(e) => setDataAny('name', e.target.value)}
                                                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="code" className="text-sm font-semibold text-gray-700 mb-2 block">Test Code *</Label>
                                            <Input
                                                id="code" 
                                                value={data.code}
                                                onChange={(e) => setDataAny('code', e.target.value)}
                                                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="description" className="text-sm font-semibold text-gray-700 mb-2 block">Description</Label>
                                        <Textarea
                                            id="description" 
                                            value={data.description}
                                            onChange={(e) => setDataAny('description', e.target.value)}
                                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setDataAny('is_active', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <Label htmlFor="is_active" className="text-sm font-semibold text-gray-700">Active (available for ordering)</Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}


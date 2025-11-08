import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Save, TestTube, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

export default function TestCreate(): React.ReactElement {
    const [data, setData] = useState({
        name: '',
        code: '',
        is_active: true,
    });

    const [schema, setSchema] = useState({ sections: {} });
    const [previewMode, setPreviewMode] = useState(false);
    const [processing, setProcessing] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Laboratory', href: '/admin/laboratory' },
        { title: 'Test Templates', href: '/admin/laboratory/tests' },
        { title: 'Create New Test', href: '/admin/laboratory/tests/create' },
    ];

    const setDataAny = (key: string, value: any) => {
        setData((prev) => ({ ...prev, [key]: value }));
    };

    const addSection = () => {
        const sectionKey = `section_${Date.now()}`;
        setSchema((prev) => ({
            ...prev,
            sections: {
                ...prev.sections,
                [sectionKey]: {
                    title: 'New Section',
                    fields: {},
                },
            },
        }));
    };

    const deleteSection = (sectionKey: string) => {
        setSchema((prev) => {
            const newSections = { ...prev.sections };
            delete newSections[sectionKey];
            return { ...prev, sections: newSections };
        });
    };

    const addField = (sectionKey: string) => {
        const fieldKey = `field_${Date.now()}`;
        setSchema((prev) => ({
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
                            placeholder: 'Enter value',
                        },
                    },
                },
            },
        }));
    };

    const deleteField = (sectionKey: string, fieldKey: string) => {
        setSchema((prev) => ({
            ...prev,
            sections: {
                ...prev.sections,
                [sectionKey]: {
                    ...prev.sections[sectionKey],
                    fields: Object.fromEntries(Object.entries(prev.sections[sectionKey].fields).filter(([key]) => key !== fieldKey)),
                },
            },
        }));
    };

    const submit = () => {
        setProcessing(true);
        router.post(
            '/admin/laboratory/tests',
            {
                name: data.name,
                code: data.code,
                is_active: data.is_active,
                fields_schema: schema,
            },
            {
                onSuccess: () => {
                    setProcessing(false);
                },
                onError: () => {
                    setProcessing(false);
                },
            },
        );
    };

    const renderPreview = () => (
        <div className="space-y-8">
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-gray-100 p-2">
                            <Eye className="h-6 w-6 text-black" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">Test Preview</CardTitle>
                            <p className="mt-1 text-sm text-gray-500">How this test will look to users when ordering</p>
                        </div>
                    </div>
                    <Button variant="secondary" onClick={() => setPreviewMode(false)} className="bg-green-600 text-white hover:bg-green-700">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Test
                    </Button>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-6">
                        {Object.entries(schema.sections || {}).map(([sectionKey, section]: [string, any]) => (
                            <div key={sectionKey} className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                <div className="rounded-t-xl bg-gray-50 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-gray-100 p-2">
                                            <TestTube className="h-5 w-5 text-black" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900">{section.title}</h4>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {Object.entries(section.fields || {}).map(([fieldKey, field]: [string, any]) => (
                                            <div key={fieldKey} className="space-y-2">
                                                <Label className="text-sm font-semibold text-gray-700">{field.label || fieldKey}</Label>
                                                <Input
                                                    placeholder={field.placeholder || `Enter ${field.label || fieldKey}`}
                                                    disabled
                                                    className="h-12 rounded-xl border-gray-300 shadow-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {Object.keys(schema.sections || {}).length === 0 && (
                            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white py-12 text-center">
                                <div className="mb-4 text-gray-400">
                                    <TestTube className="mx-auto h-12 w-12" />
                                </div>
                                <p className="mb-2 text-lg font-semibold text-gray-700">No sections to preview</p>
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
            <Head title="Create New Lab Test" />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="mb-2 text-4xl font-bold text-black">Create New Lab Test</h1>
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
                                    <div className="rounded-lg bg-gray-100 p-2">
                                        <TestTube className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Basic Information</CardTitle>
                                        <p className="mt-1 text-sm text-gray-500">Enter test name, code, and availability settings</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setPreviewMode(true)}
                                        className="bg-green-600 text-white hover:bg-green-700"
                                    >
                                        <Eye className="mr-3 h-6 w-6" />
                                        Preview
                                    </Button>
                                    <Button onClick={submit} disabled={processing} className="bg-green-600 text-white hover:bg-green-700">
                                        <Save className="mr-3 h-6 w-6" />
                                        Create Test
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-700">
                                                Test Name *
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setDataAny('name', e.target.value)}
                                                className="h-12 rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="code" className="mb-2 block text-sm font-semibold text-gray-700">
                                                Test Code *
                                            </Label>
                                            <Input
                                                id="code"
                                                value={data.code}
                                                onChange={(e) => setDataAny('code', e.target.value)}
                                                className="h-12 rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setDataAny('is_active', checked === true)}
                                            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-gray-500"
                                        />
                                        <Label htmlFor="is_active" className="text-sm font-semibold text-gray-700">
                                            Active (available for ordering)
                                        </Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gray-100 p-2">
                                        <Plus className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Test Sections</CardTitle>
                                        <p className="mt-1 text-sm text-gray-500">Define test sections and fields for data collection</p>
                                    </div>
                                </div>
                                <Button onClick={addSection} className="bg-green-600 text-white hover:bg-green-700">
                                    <Plus className="mr-3 h-6 w-6" />
                                    Add Section
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    {Object.entries(schema.sections || {}).map(([sectionKey, section]: [string, any]) => (
                                        <div key={sectionKey} className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                            <div className="bg-gray-50 p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-lg font-semibold text-gray-900">Section</h4>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => addField(sectionKey)}
                                                            className="bg-green-600 text-white hover:bg-green-700"
                                                        >
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Add Field
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => deleteSection(sectionKey)}
                                                            className="bg-green-600 text-white hover:bg-green-700"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <div className="mb-4">
                                                    <Label htmlFor={`section-${sectionKey}-title`} className="text-sm font-semibold text-gray-700">
                                                        Section Name
                                                    </Label>
                                                    <Input
                                                        id={`section-${sectionKey}-title`}
                                                        type="text"
                                                        value={section.title}
                                                        onChange={(e) => {
                                                            setSchema((prev) => ({
                                                                ...prev,
                                                                sections: {
                                                                    ...prev.sections,
                                                                    [sectionKey]: {
                                                                        ...prev.sections[sectionKey],
                                                                        title: e.target.value,
                                                                    },
                                                                },
                                                            }));
                                                        }}
                                                        placeholder="Section name (e.g., Hematology)"
                                                        className="mt-2 h-12 rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                                                    />
                                                </div>
                                                {Object.entries(section.fields || {}).map(([fieldKey, field]: [string, any]) => (
                                                    <div key={fieldKey} className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                                                        <div className="mb-2 flex items-center justify-between">
                                                            <h5 className="text-sm font-semibold text-gray-700">Field: {field.label}</h5>
                                                            <Button variant="ghost" size="sm" onClick={() => deleteField(sectionKey, fieldKey)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        <div className="grid gap-4 md:grid-cols-2">
                                                            <div>
                                                                <Label className="mb-2 block text-sm font-semibold text-gray-700">Label</Label>
                                                                <Input
                                                                    value={field.label}
                                                                    onChange={(e) => {
                                                                        setSchema((prev) => ({
                                                                            ...prev,
                                                                            sections: {
                                                                                ...prev.sections,
                                                                                [sectionKey]: {
                                                                                    ...prev.sections[sectionKey],
                                                                                    fields: {
                                                                                        ...prev.sections[sectionKey].fields,
                                                                                        [fieldKey]: {
                                                                                            ...prev.sections[sectionKey].fields[fieldKey],
                                                                                            label: e.target.value,
                                                                                        },
                                                                                    },
                                                                                },
                                                                            },
                                                                        }));
                                                                    }}
                                                                    className="h-12 rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="mb-2 block text-sm font-semibold text-gray-700">Placeholder</Label>
                                                                <Input
                                                                    value={field.placeholder || ''}
                                                                    onChange={(e) => {
                                                                        setSchema((prev) => ({
                                                                            ...prev,
                                                                            sections: {
                                                                                ...prev.sections,
                                                                                [sectionKey]: {
                                                                                    ...prev.sections[sectionKey],
                                                                                    fields: {
                                                                                        ...prev.sections[sectionKey].fields,
                                                                                        [fieldKey]: {
                                                                                            ...prev.sections[sectionKey].fields[fieldKey],
                                                                                            placeholder: e.target.value,
                                                                                        },
                                                                                    },
                                                                                },
                                                                            },
                                                                        }));
                                                                    }}
                                                                    placeholder="Enter placeholder text"
                                                                    className="h-12 rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {Object.keys(section.fields || {}).length === 0 && (
                                                    <div className="py-8 text-center">
                                                        <div className="mb-2 text-gray-400">
                                                            <Plus className="mx-auto h-8 w-8" />
                                                        </div>
                                                        <p className="font-medium text-gray-500">No fields in this section</p>
                                                        <p className="text-sm text-gray-400">Click "Add Field" to get started</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {Object.keys(schema.sections || {}).length === 0 && (
                                        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white py-12 text-center">
                                            <div className="mb-4 text-gray-400">
                                                <Plus className="mx-auto h-12 w-12" />
                                            </div>
                                            <p className="mb-2 text-lg font-semibold text-gray-700">No sections defined yet</p>
                                            <p className="mb-6 text-gray-500">Create your first section to start building your test template</p>
                                            <Button onClick={addSection} className="bg-green-600 text-white hover:bg-green-700">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Your First Section
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

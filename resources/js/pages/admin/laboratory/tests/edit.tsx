import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Eye, Plus, Save, Trash2, Edit, FileText, TestTube } from 'lucide-react';
import * as React from 'react';

type Test = {
    id: number;
    name: string;
    code: string;
    fields_schema: any;
    is_active: boolean;
    version: number;
    created_at: string;
    updated_at: string;
};

interface TestEditProps {
    test: Test;
}

const breadcrumbs = (test: Test): BreadcrumbItem[] => [
    { title: 'Laboratory', href: '/admin/laboratory' },
    { title: 'Test Templates', href: '/admin/laboratory/tests' },
    { title: `Edit ${test.name}`, href: `/admin/laboratory/tests/${test.id}/edit` },
];

export default function TestEdit({ test }: TestEditProps): React.ReactElement {
    const [schema, setSchema] = React.useState<any>(test.fields_schema || { sections: {} });
    const [activeSection, setActiveSection] = React.useState<string>('');
    const [previewMode, setPreviewMode] = React.useState(false);

    const formData = {
        name: test.name,
        code: test.code,
        is_active: test.is_active,
        fields_schema: schema,
    };

    const { data, setData, processing, errors } = useForm(formData as any);
    const setDataAny = React.useCallback((key: string, value: any) => {
        (setData as unknown as (key: string, value: any) => void)(key, value);
    }, [setData]);
    // @ts-ignore: Narrow deep type from useForm for checkbox binding
    const isActiveFlag = Boolean((data as any).is_active);

    const addSection = () => {
        const sectionKey = `section_${Date.now()}`;
        const newSchema = {
            ...schema,
            sections: {
                ...schema.sections,
                [sectionKey]: {
                    title: 'New Section',
                    fields: {},
                },
            },
        };
        setSchema(newSchema);
        setActiveSection(sectionKey);
        setDataAny('fields_schema', newSchema as any);
    };

    const updateSection = (sectionKey: string, updates: any) => {
        const newSchema = {
            ...schema,
            sections: {
                ...schema.sections,
                [sectionKey]: {
                    ...schema.sections[sectionKey],
                    ...updates,
                },
            },
        };
        setSchema(newSchema);
        setDataAny('fields_schema', newSchema as any);
    };

    const deleteSection = (sectionKey: string) => {
        const newSections = { ...schema.sections };
        delete newSections[sectionKey];
        const newSchema = { ...schema, sections: newSections };
        setSchema(newSchema);
        setDataAny('fields_schema', newSchema as any);
        if (activeSection === sectionKey) {
            setActiveSection('');
        }
    };

    const addField = (sectionKey: string) => {
        const fieldKey = `field_${Date.now()}`;
        const newSchema = {
            ...schema,
            sections: {
                ...schema.sections,
                [sectionKey]: {
                    ...schema.sections[sectionKey],
                    fields: {
                        ...schema.sections[sectionKey].fields,
                        [fieldKey]: {
                            label: 'New Field',
                            type: 'text',
                            required: false,
                            unit: '',
                            placeholder: '',
                            reference_range: '',
                        },
                    },
                },
            },
        };
        setSchema(newSchema);
        setDataAny('fields_schema', newSchema as any);
    };

    const updateField = (sectionKey: string, fieldKey: string, updates: any) => {
        const newSchema = {
            ...schema,
            sections: {
                ...schema.sections,
                [sectionKey]: {
                    ...schema.sections[sectionKey],
                    fields: {
                        ...schema.sections[sectionKey].fields,
                        [fieldKey]: {
                            ...schema.sections[sectionKey].fields[fieldKey],
                            ...updates,
                        },
                    },
                },
            },
        };
        setSchema(newSchema);
        setDataAny('fields_schema', newSchema as any);
    };

    const deleteField = (sectionKey: string, fieldKey: string) => {
        const newFields = { ...schema.sections[sectionKey].fields };
        delete newFields[fieldKey];
        const newSchema = {
            ...schema,
            sections: {
                ...schema.sections,
                [sectionKey]: {
                    ...schema.sections[sectionKey],
                    fields: newFields,
                },
            },
        };
        setSchema(newSchema);
        setDataAny('fields_schema', newSchema as any);
    };

    const submit: React.FormEventHandler = (e) => {
        e.preventDefault();
        router.put(`/admin/laboratory/tests/${test.id}`, data, {
            onSuccess: () => {
                // Success handled by global modal
            },
            onError: (errors) => {
                console.error('Test update failed:', errors);
            },
        });
    };

    const renderFieldEditor = (sectionKey: string, fieldKey: string, field: any) => (
        <div key={fieldKey} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden mb-4">
            <div className="bg-gradient-to-r from-[#283890] to-[#3a4db3] text-white p-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-white">Field: {field.label}</h4>
                    <Button variant="ghost" size="sm" onClick={() => deleteField(sectionKey, fieldKey)} className="text-white hover:text-red-200 hover:bg-red-500/20 px-3 py-2 rounded-xl">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="p-4">
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor={`${fieldKey}-label`} className="text-sm font-semibold text-gray-700 mb-2 block">Label</Label>
                            <Input
                                id={`${fieldKey}-label`}
                                value={field.label}
                                onChange={(e) => updateField(sectionKey, fieldKey, { label: e.target.value })}
                                className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm"
                            />
                        </div>
                        <div>
                            <Label htmlFor={`${fieldKey}-type`} className="text-sm font-semibold text-gray-700 mb-2 block">Type</Label>
                            <Select value={field.type} onValueChange={(value) => updateField(sectionKey, fieldKey, { type: value })}>
                                <SelectTrigger className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="number">Number</SelectItem>
                                    <SelectItem value="select">Select</SelectItem>
                                    <SelectItem value="textarea">Textarea</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor={`${fieldKey}-unit`} className="text-sm font-semibold text-gray-700 mb-2 block">Unit</Label>
                            <Input
                                id={`${fieldKey}-unit`}
                                value={field.unit || ''}
                                onChange={(e) => updateField(sectionKey, fieldKey, { unit: e.target.value })}
                                placeholder="e.g., mg/dL, %"
                                className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm"
                            />
                        </div>
                        <div>
                            <Label htmlFor={`${fieldKey}-reference`} className="text-sm font-semibold text-gray-700 mb-2 block">Reference Range</Label>
                            <Input
                                id={`${fieldKey}-reference`}
                                value={field.reference_range || ''}
                                onChange={(e) => updateField(sectionKey, fieldKey, { reference_range: e.target.value })}
                                placeholder="e.g., 3.5-5.0"
                                className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor={`${fieldKey}-placeholder`} className="text-sm font-semibold text-gray-700 mb-2 block">Placeholder</Label>
                        <Input
                            id={`${fieldKey}-placeholder`}
                            value={field.placeholder || ''}
                            onChange={(e) => updateField(sectionKey, fieldKey, { placeholder: e.target.value })}
                            className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm"
                        />
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                        <input
                            type="checkbox"
                            id={`${fieldKey}-required`}
                            checked={field.required || false}
                            onChange={(e) => updateField(sectionKey, fieldKey, { required: e.target.checked })}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <Label htmlFor={`${fieldKey}-required`} className="text-sm font-semibold text-gray-700">Required field</Label>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPreview = () => (
        <div className="space-y-8">
            {/* Preview Header */}
            <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                <div className="bg-gradient-to-r from-[#283890] to-[#3a4db3] text-white">
                    <div className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Eye className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Test Preview</h3>
                                <p className="text-indigo-100 mt-1">How this test will look to users when ordering</p>
                            </div>
                        </div>
                        <Button variant="secondary" onClick={() => setPreviewMode(false)} className="bg-white text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Test
                        </Button>
                    </div>
                </div>
                <div className="px-6 py-6 bg-gradient-to-br from-indigo-50 to-purple-50">
                    <div className="space-y-6">
                        {Object.entries(schema.sections || {}).map(([sectionKey, section]: [string, any]) => (
                            <div key={sectionKey} className="bg-white rounded-xl border border-indigo-200 shadow-sm">
                                <div className="bg-gradient-to-r from-[#283890] to-[#3a4db3] text-white p-4 rounded-t-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <TestTube className="h-5 w-5 text-white" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-white">{section.title}</h4>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {Object.entries(section.fields || {}).map(([fieldKey, field]: [string, any]) => (
                                            <div key={fieldKey} className="space-y-2">
                                                <Label className="text-sm font-semibold text-gray-700">
                                                    {field.label}
                                                    {field.required && <span className="ml-1 text-red-500">*</span>}
                                                </Label>
                                                <Input 
                                                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`} 
                                                    disabled 
                                                    className="h-12 border-gray-300 rounded-xl"
                                                />
                                                {field.unit && <span className="text-xs text-gray-500 font-medium">{field.unit}</span>}
                                                {field.reference_range && (
                                                    <div className="text-xs text-blue-600 font-medium">
                                                        Normal: {field.reference_range}
                                                    </div>
                                                )}
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
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs(test)}>
            <Head title={`Edit Test Template - ${test.name}`} />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Heading title="Edit Test Template" description={`${test.name} (v${test.version}) • Last updated: ${new Date(test.updated_at).toLocaleDateString()}`} icon={TestTube} />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="counter-card text-white rounded-xl shadow-lg border-0 px-6 py-4 w-52 h-20 flex items-center">
                                <div className="flex items-center gap-3">
                                    <div className="counter-icon p-2 rounded-lg border border-white/60">
                                        <TestTube className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold">v{test.version}</div>
                                        <div className="text-blue-100 text-sm font-medium">Version</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {!previewMode ? (
                    <div className="space-y-6">
                        {/* Top Row - Basic Information and Schema JSON */}
                        <div className="grid gap-8 md:gap-10 md:grid-cols-3 items-start">
                            {/* Basic Information Card */}
                            <div className="md:col-span-2 space-y-8">
                                <div className="holographic-card lift-horizontal shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all transform transition-transform">
                                    {/* Header Section - No gaps */}
                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                        <div className="flex items-center justify-between p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                                    <TestTube className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white">Basic Information</h3>
                                                    <p className="text-blue-100 mt-1">Update test name, code, and availability settings</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="secondary" onClick={() => setPreviewMode(!previewMode)} className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl">
                                                    <Eye className="mr-3 h-6 w-6" />
                                                    {previewMode ? 'Edit' : 'Preview'}
                                                </Button>
                                                <Button onClick={submit} disabled={processing} className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl">
                                                    <Save className="mr-3 h-6 w-6" />
                                                    Save Changes
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Content Section - Seamlessly connected */}
                                    <div className="px-6 py-6 transition-colors">
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
                                                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                                                </div>
                                                <div>
                                                    <Label htmlFor="code" className="text-sm font-semibold text-gray-700 mb-2 block">Test Code *</Label>
                                                    <Input
                                                        id="code" 
                                                        value={data.code}
                                                        onChange={(e) => setDataAny('code', e.target.value)}
                                                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                                                    />
                                                    {errors.code && <p className="text-sm text-red-500 mt-1">{errors.code}</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-blue-200">
                                                <input
                                                    type="checkbox"
                                                    id="is_active"
                                                    checked={isActiveFlag}
                                                    onChange={(e) => setDataAny('is_active', e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <Label htmlFor="is_active" className="text-sm font-semibold text-gray-700">Active (available for ordering)</Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            {/* Test Sections Card (inside left column) */}
                            <div className="group holographic-card lift-horizontal shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all transform transition-transform">
                                {/* Header Section - No gaps */}
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                    <div className="flex items-center justify-between p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                                <Plus className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white">Test Sections</h3>
                                                <p className="text-blue-100 mt-1">Modify test sections and fields for data collection</p>
                                            </div>
                                        </div>
                                        <Button onClick={addSection} className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl">
                                            <Plus className="mr-3 h-6 w-6" />
                                            Add Section
                                        </Button>
                                    </div>
                                </div>
                                {/* Content Section - Seamlessly connected */}
                                <div className="px-6 py-6 transition-colors group-hover:bg-white/70">
                                    <div className="space-y-6">
                                        {Object.entries(schema.sections || {}).map(([sectionKey, section]: [string, any]) => (
                                            <div key={sectionKey} className="bg-white/90 rounded-xl border border-gray-200 shadow-sm transition-colors group-hover:bg-white/80 overflow-hidden">
                                                <div className="bg-gradient-to-r from-[#283890] to-[#3a4db3] text-white p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="text-lg font-semibold text-white">Section</h4>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="secondary" size="sm" onClick={() => addField(sectionKey)} className="bg-white text-[#283890] hover:bg-white/90 border-white/30 hover:border-white/50 shadow-sm transition-all duration-300 px-4 py-2 rounded-xl">
                                                                <Plus className="mr-2 h-4 w-4" />
                                                                Add Field
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => deleteSection(sectionKey)} className="text-white hover:text-red-200 hover:bg-red-500/20 px-3 py-2 rounded-xl">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-6">
                                                    <div className="mb-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <Label htmlFor={`section-${sectionKey}-title`} className="text-sm font-semibold text-gray-700">Section Name</Label>
                                                            <div className="bg-gray-100 rounded-full px-2 py-1">
                                                                <span className="text-[#283890] font-medium text-xs">
                                                                    {Object.keys(section.fields || {}).length} fields
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <Input
                                                            id={`section-${sectionKey}-title`}
                                                            type="text"
                                                            value={section.title}
                                                            onChange={(e) => updateSection(sectionKey, { title: e.target.value })}
                                                            placeholder="Section name (e.g., Hematology)"
                                                            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                                                        />
                                                    </div>
                                                    {Object.entries(section.fields || {}).map(([fieldKey, field]: [string, any]) =>
                                                        renderFieldEditor(sectionKey, fieldKey, field),
                                                    )}
                                                    {Object.keys(section.fields || {}).length === 0 && (
                                                        <div className="py-8 text-center">
                                                            <div className="text-gray-400 mb-2">
                                                                <Plus className="h-8 w-8 mx-auto" />
                                                            </div>
                                                            <p className="text-gray-500 font-medium">No fields in this section</p>
                                                            <p className="text-sm text-gray-400">Click "Add Field" to get started</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {Object.keys(schema.sections || {}).length === 0 && (
                                            <div className="py-12 text-center bg-white rounded-xl border-2 border-dashed border-blue-300">
                                                <div className="text-blue-400 mb-4">
                                                    <Plus className="h-12 w-12 mx-auto" />
                                                </div>
                                                <p className="text-lg font-semibold text-gray-700 mb-2">No sections defined yet</p>
                                                <p className="text-gray-500 mb-6">Create your first section to start building your test template</p>
                                                <Button onClick={addSection} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg transition-all duration-300 px-8 py-3 text-base font-semibold rounded-xl">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add Your First Section
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            </div>

                            {/* Schema JSON Card (match Quick Tips design/hover) */}
                            <div className="md:col-span-1">
                                <div className="group holographic-card lift-horizontal shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all transform transition-transform sticky top-0 self-start">
                                    {/* Header Section - No gaps */}
                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                        <div className="flex items-center gap-3 p-6">
                                            <div className="p-2 bg-white/20 rounded-lg">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white">Schema JSON</h3>
                                                <p className="text-emerald-100 mt-1">Raw JSON structure of the test template</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Content Section - Seamlessly connected */}
                                    <div className="px-6 py-6 transition-colors group-hover:bg-white/70">
                                        <Textarea 
                                            value={JSON.stringify(schema, null, 2)} 
                                            readOnly 
                                            rows={20} 
                                            className="font-mono text-xs border-emerald-300 rounded-xl shadow-sm w-full" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                            {/* Removed duplicate Test Sections card to avoid overlap and keep layout consistent */}
                    </div>
                ) : (
                    renderPreview()
                )}
            </div>
        </AppLayout>
    );
}

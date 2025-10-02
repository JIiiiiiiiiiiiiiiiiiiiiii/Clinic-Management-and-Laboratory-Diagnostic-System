import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, Plus, Save, Trash2, TestTube, Edit, FileText } from 'lucide-react';
import * as React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Laboratory Diagnostics',
        href: '/admin/laboratory',
    },
    {
        title: 'Test Templates',
        href: '/admin/laboratory/tests',
    },
    {
        title: 'Create Test',
        href: '/admin/laboratory/tests/create',
    },
];

export default function TestCreate() {
    const [schema, setSchema] = React.useState<any>({ sections: {} });
    const [previewMode, setPreviewMode] = React.useState(false);

    // @ts-ignore: Type instantiation is excessively deep
    const { data, setData, processing, errors, reset } = useForm({
        name: '',
        code: '',
        is_active: true,
        fields_schema: { sections: {} },
    });

    // Sync schema with form data
    React.useEffect(() => {
        setData('fields_schema', schema);
    }, [schema, setData]);

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
        setData('fields_schema', newSchema);
    };

    const updateSection = (sectionKey: string, updates: any) => {
        const newSchema = {
            ...schema,
            sections: {
                ...schema.sections,
                [sectionKey]: {
                    ...(schema.sections[sectionKey] || {}),
                    ...updates,
                },
            },
        };
        setSchema(newSchema);
        setData('fields_schema', newSchema);
    };

    const deleteSection = (sectionKey: string) => {
        const newSections = { ...schema.sections };
        delete newSections[sectionKey];
        const newSchema = { ...schema, sections: newSections };
        setSchema(newSchema);
        setData('fields_schema', newSchema);
    };

    const addField = (sectionKey: string) => {
        const fieldKey = `field_${Date.now()}`;
        const newSchema = {
            ...schema,
            sections: {
                ...schema.sections,
                [sectionKey]: {
                    ...(schema.sections[sectionKey] || {}),
                    fields: {
                        ...(schema.sections[sectionKey]?.fields || {}),
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
        setData('fields_schema', newSchema);
    };

    const updateField = (sectionKey: string, fieldKey: string, updates: any) => {
        const newSchema = {
            ...schema,
            sections: {
                ...schema.sections,
                [sectionKey]: {
                    ...(schema.sections[sectionKey] || {}),
                    fields: {
                        ...(schema.sections[sectionKey]?.fields || {}),
                        [fieldKey]: {
                            ...(schema.sections[sectionKey]?.fields?.[fieldKey] || {}),
                            ...updates,
                        },
                    },
                },
            },
        };
        setSchema(newSchema);
        setData('fields_schema', newSchema);
    };

    const deleteField = (sectionKey: string, fieldKey: string) => {
        const newFields = { ...(schema.sections[sectionKey]?.fields || {}) };
        delete newFields[fieldKey];
        const newSchema = {
            ...schema,
            sections: {
                ...schema.sections,
                [sectionKey]: {
                    ...(schema.sections[sectionKey] || {}),
                    fields: newFields,
                },
            },
        };
        setSchema(newSchema);
        setData('fields_schema', newSchema);
    };

    const submit: React.FormEventHandler = (e) => {
        e.preventDefault();
        
        // Basic client-side validation
        if (!data.name.trim()) {
            alert('Please enter a test name');
            return;
        }
        if (!data.code.trim()) {
            alert('Please enter a test code');
            return;
        }
        
        // Debug: Log the data being sent
        console.log('Submitting lab test data:', data);
        
        router.post('/admin/laboratory/tests', data, {
            onSuccess: () => {
                console.log('Lab test created successfully');
                router.visit('/admin/laboratory/tests');
            },
            onError: (errors) => {
                console.error('Test creation failed:', errors);
                // Display validation errors to user
                const errorMessages = Object.values(errors).flat();
                if (errorMessages.length > 0) {
                    alert('Validation errors:\n' + errorMessages.join('\n'));
                } else {
                    alert('An error occurred while creating the test. Please try again.');
                }
            },
            onFinish: () => {
                console.log('Form submission completed');
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
                            <Label htmlFor={`${fieldKey}-label`} className="text-sm font-semibold text-gray-700 mb-2 block">Field Name *</Label>
                            <Input
                                id={`${fieldKey}-label`}
                                value={field.label}
                                onChange={(e) => updateField(sectionKey, fieldKey, { label: e.target.value })}
                                placeholder="e.g., White Blood Cell Count"
                                className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm"
                            />
                        </div>
                        <div>
                            <Label htmlFor={`${fieldKey}-type`} className="text-sm font-semibold text-gray-700 mb-2 block">Field Type *</Label>
                            <Select value={field.type} onValueChange={(value) => updateField(sectionKey, fieldKey, { type: value })}>
                                <SelectTrigger className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="text">Text Input</SelectItem>
                                    <SelectItem value="number">Number Input</SelectItem>
                                    <SelectItem value="select">Dropdown Selection</SelectItem>
                                    <SelectItem value="textarea">Text Area</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor={`${fieldKey}-unit`} className="text-sm font-semibold text-gray-700 mb-2 block">Unit of Measurement</Label>
                            <Input
                                id={`${fieldKey}-unit`}
                                value={field.unit || ''}
                                onChange={(e) => updateField(sectionKey, fieldKey, { unit: e.target.value })}
                                placeholder="e.g., mg/dL, %, x10³/μL"
                                className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm"
                            />
                        </div>
                        <div>
                            <Label htmlFor={`${fieldKey}-reference`} className="text-sm font-semibold text-gray-700 mb-2 block">Normal Range</Label>
                            <Input
                                id={`${fieldKey}-reference`}
                                value={field.reference_range || ''}
                                onChange={(e) => updateField(sectionKey, fieldKey, { reference_range: e.target.value })}
                                placeholder="e.g., 3.5-5.0, 4.5-11.0"
                                className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor={`${fieldKey}-placeholder`} className="text-sm font-semibold text-gray-700 mb-2 block">Help Text (Optional)</Label>
                        <Input
                            id={`${fieldKey}-placeholder`}
                            value={field.placeholder || ''}
                            onChange={(e) => updateField(sectionKey, fieldKey, { placeholder: e.target.value })}
                            placeholder="e.g., Enter the patient's blood pressure"
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
                        <Label htmlFor={`${fieldKey}-required`} className="text-sm font-semibold text-gray-700">This field is required</Label>
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Lab Test" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Heading title="Create New Lab Test" description="Design a new laboratory diagnostic test template" icon={TestTube} />
                        </div>
                    </div>
                </div>

                {!previewMode ? (
                    <div className="grid gap-x-8 gap-y-2 md:grid-cols-3 items-start">
                        {/* Left Column: Stack Basic Information and Test Sections */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Basic Information Card */}
                            <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                            {/* Header Section - No gaps */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <div className="flex items-center justify-between p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <TestTube className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">Basic Information</h3>
                                            <p className="text-blue-100 mt-1">Enter test name, code, and availability settings</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="secondary" onClick={() => setPreviewMode(!previewMode)} className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                            <Eye className="mr-2 h-4 w-4" />
                                            {previewMode ? 'Edit' : 'Preview'}
                                        </Button>
                                        <Button onClick={submit} disabled={processing} className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                            <Save className="mr-2 h-4 w-4" />
                                            Create Test
                                        </Button>
                                    </div>
                                </div>
                            </div>
                                {/* Content Section - Seamlessly connected */}
                                <div className="px-6 py-6 bg-gradient-to-br from-blue-50 to-blue-100">
                                    <div className="space-y-6">
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-2 block">Test Name *</Label>
                                                <Input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    placeholder="e.g., Complete Blood Count"
                                                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                                                />
                                                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="code" className="text-sm font-semibold text-gray-700 mb-2 block">Test Code *</Label>
                                                <Input
                                                    id="code"
                                                    value={data.code}
                                                    onChange={(e) => setData('code', e.target.value)}
                                                    placeholder="e.g., CBC"
                                                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                                                />
                                                {errors.code && <p className="text-sm text-red-500 mt-1">{errors.code}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-blue-200">
                                            <input
                                                type="checkbox"
                                                id="is_active"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <Label htmlFor="is_active" className="text-sm font-semibold text-gray-700">Make this test available for ordering</Label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Test Sections Card */}
                            <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                                {/* Header Section - No gaps */}
                                <div className="bg-gradient-to-r from-[#283890] to-[#3a4db3] text-white">
                                    <div className="flex items-center justify-between p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/20 rounded-lg">
                                                <Plus className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white">Test Sections</h3>
                                                <p className="text-purple-100 mt-1">Define test sections and fields for data collection</p>
                                            </div>
                                        </div>
                                        <Button onClick={addSection} className="bg-white text-purple-600 hover:bg-purple-50 hover:text-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Section
                                        </Button>
                                    </div>
                                </div>
                                {/* Content Section - Seamlessly connected */}
                                <div className="px-6 py-6 bg-gradient-to-br from-purple-50 to-purple-100">
                                    <div className="space-y-6">
                                        {Object.entries(schema.sections || {}).map(([sectionKey, section]: [string, any]) => (
                                            <div key={sectionKey} className="bg-white rounded-xl border-2 border-purple-200 shadow-sm overflow-hidden">
                                                <div className="bg-gradient-to-r from-[#283890] to-[#3a4db3] text-white p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="text-lg font-semibold text-white">Section</h4>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="secondary" size="sm" onClick={() => addField(sectionKey)} className="bg-white text-[#283890] hover:bg-white/90 border-white/30 hover:border-white/50 shadow-sm hover:shadow-md transition-all duration-300 px-4 py-2 rounded-xl">
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
                                            <div className="py-12 text-center bg-white rounded-xl border-2 border-dashed border-purple-300">
                                                <div className="text-purple-400 mb-4">
                                                    <Plus className="h-12 w-12 mx-auto" />
                                                </div>
                                                <p className="text-lg font-semibold text-gray-700 mb-2">No sections defined yet</p>
                                                <p className="text-gray-500 mb-6">Create your first section to start building your test template</p>
                                                <Button onClick={addSection} className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-base font-semibold rounded-xl">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add Your First Section
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Tips Card */}
                        <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white sticky top-0 self-start">
                            {/* Header Section - No gaps */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <div className="flex items-center gap-3 p-6">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <TestTube className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Quick Tips</h3>
                                        <p className="text-emerald-100 mt-1">Best practices for creating test templates</p>
                                    </div>
                                </div>
                            </div>
                            {/* Content Section - Seamlessly connected */}
                            <div className="px-6 py-6 bg-gradient-to-br from-emerald-50 to-green-100">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <div className="p-3 bg-white rounded-lg border border-emerald-200">
                                            <div className="font-semibold text-gray-800 mb-1">Test Name</div>
                                            <div className="text-sm text-gray-600">Use clear, descriptive names like "Complete Blood Count" or "Urinalysis"</div>
                                        </div>
                                        <div className="p-3 bg-white rounded-lg border border-emerald-200">
                                            <div className="font-semibold text-gray-800 mb-1">Test Code</div>
                                            <div className="text-sm text-gray-600">Short codes like "CBC" or "UA" for easy reference</div>
                                        </div>
                                        <div className="p-3 bg-white rounded-lg border border-emerald-200">
                                            <div className="font-semibold text-gray-800 mb-1">Sections</div>
                                            <div className="text-sm text-gray-600">Group related fields together (e.g., "Hematology", "Chemistry")</div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-white rounded-lg border border-emerald-200">
                                            <div className="font-semibold text-gray-800 mb-1">Units</div>
                                            <div className="text-sm text-gray-600">Include measurement units like "mg/dL", "%", or "x10³/μL"</div>
                                        </div>
                                        <div className="p-3 bg-white rounded-lg border border-emerald-200">
                                            <div className="font-semibold text-gray-800 mb-1">Normal Ranges</div>
                                            <div className="text-sm text-gray-600">Help staff identify abnormal values</div>
                                        </div>
                                        <div className="p-3 bg-white rounded-lg border border-emerald-200">
                                            <div className="font-semibold text-gray-800 mb-1">Required Fields</div>
                                            <div className="text-sm text-gray-600">Mark essential fields as required to ensure data completeness</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        

                        
                    </div>
                ) : (
                    renderPreview()
                )}
            </div>
        </AppLayout>
    );
}

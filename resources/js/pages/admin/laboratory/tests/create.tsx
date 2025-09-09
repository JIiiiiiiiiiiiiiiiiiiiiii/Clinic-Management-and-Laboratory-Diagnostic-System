import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, Plus, Save, Trash2 } from 'lucide-react';
import * as React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Laboratory', href: '/admin/laboratory' },
    { title: 'Test Templates', href: '/admin/laboratory/tests' },
    { title: 'Create New Test', href: '/admin/laboratory/tests/create' },
];

export default function TestCreate() {
    const [schema, setSchema] = React.useState<any>({ sections: {} });
    const [previewMode, setPreviewMode] = React.useState(false);

    // @ts-ignore: Type instantiation is excessively deep
    const { data, setData, processing, errors, reset } = useForm({
        name: '',
        code: '',
        is_active: true,
        fields_schema: schema,
    });

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
        router.post('/admin/laboratory/tests', data, {
            onSuccess: () => {
                router.visit('/admin/laboratory/tests');
            },
            onError: (errors) => {
                console.error('Test creation failed:', errors);
            },
        });
    };

    const renderFieldEditor = (sectionKey: string, fieldKey: string, field: any) => (
        <Card key={fieldKey} className="mb-4">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Field: {field.label}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => deleteField(sectionKey, fieldKey)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                    <div>
                        <Label htmlFor={`${fieldKey}-label`}>Field Name *</Label>
                        <Input
                            id={`${fieldKey}-label`}
                            value={field.label}
                            onChange={(e) => updateField(sectionKey, fieldKey, { label: e.target.value })}
                            placeholder="e.g., White Blood Cell Count"
                        />
                    </div>
                    <div>
                        <Label htmlFor={`${fieldKey}-type`}>Field Type *</Label>
                        <Select value={field.type} onValueChange={(value) => updateField(sectionKey, fieldKey, { type: value })}>
                            <SelectTrigger>
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
                        <Label htmlFor={`${fieldKey}-unit`}>Unit of Measurement</Label>
                        <Input
                            id={`${fieldKey}-unit`}
                            value={field.unit || ''}
                            onChange={(e) => updateField(sectionKey, fieldKey, { unit: e.target.value })}
                            placeholder="e.g., mg/dL, %, x10³/μL"
                        />
                    </div>
                    <div>
                        <Label htmlFor={`${fieldKey}-reference`}>Normal Range</Label>
                        <Input
                            id={`${fieldKey}-reference`}
                            value={field.reference_range || ''}
                            onChange={(e) => updateField(sectionKey, fieldKey, { reference_range: e.target.value })}
                            placeholder="e.g., 3.5-5.0, 4.5-11.0"
                        />
                    </div>
                </div>
                <div>
                    <Label htmlFor={`${fieldKey}-placeholder`}>Help Text (Optional)</Label>
                    <Input
                        id={`${fieldKey}-placeholder`}
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(sectionKey, fieldKey, { placeholder: e.target.value })}
                        placeholder="e.g., Enter the patient's blood pressure"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id={`${fieldKey}-required`}
                        checked={field.required || false}
                        onChange={(e) => updateField(sectionKey, fieldKey, { required: e.target.checked })}
                    />
                    <Label htmlFor={`${fieldKey}-required`}>This field is required</Label>
                </div>
            </CardContent>
        </Card>
    );

    const renderPreview = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preview - How this test will look to users</h3>
            {Object.entries(schema.sections || {}).map(([sectionKey, section]: [string, any]) => (
                <Card key={sectionKey}>
                    <CardHeader>
                        <CardTitle className="text-base">{section.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2">
                            {Object.entries(section.fields || {}).map(([fieldKey, field]: [string, any]) => (
                                <div key={fieldKey} className="space-y-1">
                                    <Label>
                                        {field.label}
                                        {field.required && <span className="ml-1 text-red-500">*</span>}
                                    </Label>
                                    <Input placeholder={field.placeholder} disabled />
                                    {field.unit && <span className="text-xs text-muted-foreground">{field.unit}</span>}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Lab Test" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => router.visit('/admin/laboratory/tests')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Create New Lab Test</h1>
                            <p className="text-muted-foreground">Design a new laboratory diagnostic test template</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {previewMode ? 'Edit' : 'Preview'}
                        </Button>
                        <Button onClick={submit} disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            Create Test
                        </Button>
                    </div>
                </div>

                {!previewMode ? (
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="name">Test Name *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="e.g., Complete Blood Count"
                                            />
                                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="code">Test Code *</Label>
                                            <Input
                                                id="code"
                                                value={data.code}
                                                onChange={(e) => setData('code', e.target.value)}
                                                placeholder="e.g., CBC"
                                            />
                                            {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                        />
                                        <Label htmlFor="is_active">Make this test available for ordering</Label>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Test Sections</CardTitle>
                                        <Button onClick={addSection} size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Section
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {Object.entries(schema.sections || {}).map(([sectionKey, section]: [string, any]) => (
                                        <Card key={sectionKey} className="border-2">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            value={section.title}
                                                            onChange={(e) => updateSection(sectionKey, { title: e.target.value })}
                                                            className="font-semibold"
                                                            placeholder="Section name (e.g., Hematology)"
                                                        />
                                                        <Badge variant="secondary">{Object.keys(section.fields || {}).length} fields</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => addField(sectionKey)}>
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Add Field
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => deleteSection(sectionKey)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {Object.entries(section.fields || {}).map(([fieldKey, field]: [string, any]) =>
                                                    renderFieldEditor(sectionKey, fieldKey, field),
                                                )}
                                                {Object.keys(section.fields || {}).length === 0 && (
                                                    <p className="py-4 text-center text-muted-foreground">
                                                        No fields in this section. Click "Add Field" to get started.
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {Object.keys(schema.sections || {}).length === 0 && (
                                        <div className="py-8 text-center">
                                            <p className="mb-4 text-muted-foreground">No sections defined yet.</p>
                                            <Button onClick={addSection}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Your First Section
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Tips</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div>
                                        <strong>Test Name:</strong> Use clear, descriptive names like "Complete Blood Count" or "Urinalysis"
                                    </div>
                                    <div>
                                        <strong>Test Code:</strong> Short codes like "CBC" or "UA" for easy reference
                                    </div>
                                    <div>
                                        <strong>Sections:</strong> Group related fields together (e.g., "Hematology", "Chemistry")
                                    </div>
                                    <div>
                                        <strong>Units:</strong> Include measurement units like "mg/dL", "%", or "x10³/μL"
                                    </div>
                                    <div>
                                        <strong>Normal Ranges:</strong> Help staff identify abnormal values
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    renderPreview()
                )}
            </div>
        </AppLayout>
    );
}

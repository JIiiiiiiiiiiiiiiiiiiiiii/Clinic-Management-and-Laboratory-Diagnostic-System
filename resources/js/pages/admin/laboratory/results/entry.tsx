import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import * as React from 'react';

type Test = { id: number; name: string; code: string; fields_schema: any };
type Order = { id: number; status: string; created_at: string };
type Patient = { id: number; first_name: string; last_name: string; age: number; sex: string };

interface ResultsEntryProps {
    patient: Patient;
    order: Order;
    tests: Test[];
    existingResults?: { [testId: number]: any };
}

const breadcrumbs = (patient: Patient, order: Order): BreadcrumbItem[] => [
    { title: 'Laboratory', href: '/admin/laboratory' },
    { title: `${patient.last_name}, ${patient.first_name}`, href: `/admin/laboratory/patients/${patient.id}/orders` },
    { title: `Order #${order.id}`, href: `/admin/laboratory/orders/${order.id}/results` },
];

export default function ResultsEntry({ patient, order, tests, existingResults = {} }: ResultsEntryProps) {
    const [results, setResults] = React.useState<{ [testId: number]: any }>(existingResults);
    const [processing, setProcessing] = React.useState(false);
    const formRef = React.useRef<HTMLFormElement>(null);

    React.useEffect(() => {
        setResults(existingResults || {});
    }, [existingResults]);

    const updateResult = (testId: number, fieldPath: string, value: any) => {
        setResults((prev) => {
            const newResults = { ...prev };
            if (!newResults[testId]) newResults[testId] = {};

            // Handle nested field paths like "sections.hematology.wbc"
            const keys = fieldPath.split('.');
            let current = newResults[testId];

            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;
            return newResults;
        });
    };

    const getResultValue = (testId: number, fieldPath: string): any => {
        const keys = fieldPath.split('.');
        let current = results[testId] || {};

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return '';
            }
        }

        return current || '';
    };

    const renderField = (testId: number, field: any, sectionKey: string, fieldKey: string) => {
        const fieldPath = `${sectionKey}.${fieldKey}`;
        const value = getResultValue(testId, fieldPath);
        const fieldId = `test-${testId}-${sectionKey}-${fieldKey}`;

        const commonProps = {
            id: fieldId,
            name: fieldId,
            value: value,
            onChange: (e: any) => updateResult(testId, fieldPath, e?.target !== undefined ? e.target.value : e),
        } as any;

        switch (field.type) {
            case 'text':
                return (
                    <div key={fieldKey} className="space-y-2">
                        <Label htmlFor={fieldId}>
                            {field.label}
                            {field.required && <span className="ml-1 text-red-500">*</span>}
                        </Label>
                        <Input {...commonProps} placeholder={field.placeholder} />
                        {field.unit && <span className="ml-2 text-sm text-muted-foreground">{field.unit}</span>}
                    </div>
                );

            case 'number':
                return (
                    <div key={fieldKey} className="space-y-2">
                        <Label htmlFor={fieldId}>
                            {field.label}
                            {field.required && <span className="ml-1 text-red-500">*</span>}
                        </Label>
                        <Input
                            {...commonProps}
                            type="number"
                            step={field.step || '0.01'}
                            min={field.min}
                            max={field.max}
                            placeholder={field.placeholder}
                        />
                        {field.unit && <span className="ml-2 text-sm text-muted-foreground">{field.unit}</span>}
                    </div>
                );

            case 'select':
                return (
                    <div key={fieldKey} className="space-y-2">
                        <Label htmlFor={fieldId}>
                            {field.label}
                            {field.required && <span className="ml-1 text-red-500">*</span>}
                        </Label>
                        <Select value={value} onValueChange={(val) => updateResult(testId, fieldPath, val)}>
                            <SelectTrigger>
                                <SelectValue placeholder={field.placeholder || 'Select...'} />
                            </SelectTrigger>
                            <SelectContent>
                                {field.options?.map((option: string) => (
                                    <SelectItem key={option} value={option} id={`test-${testId}-${sectionKey}-${fieldKey}`}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                );

            case 'textarea':
                return (
                    <div key={fieldKey} className="space-y-2">
                        <Label htmlFor={fieldId}>
                            {field.label}
                            {field.required && <span className="ml-1 text-red-500">*</span>}
                        </Label>
                        <Textarea {...commonProps} placeholder={field.placeholder} rows={field.rows || 3} />
                    </div>
                );

            default:
                return (
                    <div key={fieldKey} className="space-y-2">
                        <Label htmlFor={fieldId}>{field.label}</Label>
                        <Input {...commonProps} placeholder={field.placeholder} />
                    </div>
                );
        }
    };

    const renderTest = (test: Test) => {
        const schema = test.fields_schema;
        if (!schema || !schema.sections) return null;

        return (
            <Card key={test.id} className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        {test.name} ({test.code})
                        <span className="text-sm font-normal text-muted-foreground">
                            Patient: {patient.last_name}, {patient.first_name} ({patient.sex}, {patient.age}y)
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {Object.entries(schema.sections).map(([sectionKey, section]: [string, any]) => (
                        <div key={sectionKey} className="space-y-4">
                            <h4 className="border-b pb-2 text-lg font-medium">{section.title || sectionKey}</h4>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {Object.entries(section.fields || {}).map(([fieldKey, field]: [string, any]) =>
                                    renderField(test.id, field, sectionKey, fieldKey),
                                )}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    };

    const collectResultsFromDom = (): { [testId: number]: any } => {
        const aggregated: { [testId: number]: any } = {};
        for (const test of tests) {
            const testId = test.id;
            const schema = test.fields_schema;
            const testBucket: any = {};
            if (schema?.sections) {
                Object.entries(schema.sections).forEach(([sectionKey, section]: [string, any]) => {
                    const sectionBucket: any = {};
                    Object.keys(section.fields || {}).forEach((fieldKey) => {
                        const elId = `test-${testId}-${sectionKey}-${fieldKey}`;
                        const input = document.getElementById(elId) as HTMLInputElement | HTMLTextAreaElement | null;
                        // shadcn Select renders hidden input with data-state? Fall back to value prop on element if present
                        const value = input?.value ?? (document.querySelector(`[aria-controls='${elId}']`) as any)?.value ?? '';
                        if (value !== '') {
                            sectionBucket[fieldKey] = value;
                        }
                    });
                    if (Object.keys(sectionBucket).length > 0) {
                        testBucket[sectionKey] = sectionBucket;
                    }
                });
            }
            aggregated[testId] = testBucket;
        }
        return aggregated;
    };

    const handleSave = async () => {
        setProcessing(true);
        try {
            // Prefer structured form serialization with nested names
            if (formRef.current) {
                const fd = new FormData(formRef.current);
                await router.post(`/admin/laboratory/orders/${order.id}/results`, fd, {
                    onSuccess: () => {},
                    onError: () => setProcessing(false),
                });
            } else {
                const payload = JSON.stringify(Object.keys(results).length ? results : collectResultsFromDom());
                await router.post(
                    `/admin/laboratory/orders/${order.id}/results`,
                    { results: payload },
                    {
                        onSuccess: () => {},
                        onError: () => setProcessing(false),
                    },
                );
            }
        } catch (error) {
            setProcessing(false);
        }
    };

    const handleVerify = async () => {
        setProcessing(true);
        try {
            await router.put(
                `/admin/laboratory/orders/${order.id}/verify`,
                {},
                {
                    onSuccess: () => {},
                    onError: () => {
                        setProcessing(false);
                    },
                },
            );
        } catch (error) {
            setProcessing(false);
        }
    };

    const isVerified = order.status === 'completed';

    return (
        <AppLayout breadcrumbs={breadcrumbs(patient, order)}>
            <Head title={`Lab Results - Order #${order.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.visit('/admin/laboratory/orders')}>
                            ← Back to Orders
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Lab Results Entry</h1>
                            <p className="text-muted-foreground">
                                Order #{order.id} • {new Date(order.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleSave} disabled={processing}>
                            Save Draft
                        </Button>
                        {!isVerified && (
                            <Button onClick={handleVerify} disabled={processing}>
                                Verify & Complete
                            </Button>
                        )}
                        {isVerified && (
                            <Button variant="secondary" disabled>
                                ✓ Verified
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => window.open(`/admin/laboratory/orders/${order.id}/report`, '_blank')}>
                            📄 Generate Report
                        </Button>
                    </div>
                </div>

                <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
                    {tests.map((test) => {
                        const schema = test.fields_schema;
                        return (
                            <React.Fragment key={test.id}>
                                {renderTest(test)}
                                {/* Hidden inputs to mirror state for reliable serialization */}
                                {schema?.sections &&
                                    Object.entries(schema.sections).map(([sectionKey, section]: [string, any]) => (
                                        <React.Fragment key={`${test.id}-${sectionKey}`}>
                                            {Object.keys(section.fields || {}).map((fieldKey) => {
                                                const v = getResultValue(test.id, `${sectionKey}.${fieldKey}`);
                                                return (
                                                    <input
                                                        key={`${test.id}-${sectionKey}-${fieldKey}-hidden`}
                                                        type="hidden"
                                                        name={`results[${test.id}][${sectionKey}][${fieldKey}]`}
                                                        value={v}
                                                    />
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                            </React.Fragment>
                        );
                    })}
                </form>

                {tests.length === 0 && (
                    <Card>
                        <CardContent className="py-8 text-center">
                            <p className="text-muted-foreground">No tests found for this order.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

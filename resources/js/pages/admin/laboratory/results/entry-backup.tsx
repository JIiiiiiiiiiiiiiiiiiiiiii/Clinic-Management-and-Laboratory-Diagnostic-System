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
import { CheckCircle, FileText, Save } from 'lucide-react';

type Test = { id: number; name: string; code: string; fields_schema: any };
type Order = { id: number; status: string; created_at: string };
type Patient = { id: number; first_name: string; last_name: string; age: number; sex: string };

interface ResultsEntryProps {
    patient: Patient;
    order: Order;
    tests: Test[];
    existingResults?: { [testId: number]: any };
}

const breadcrumbs = (_patient: Patient, order: Order): BreadcrumbItem[] => [
    { title: 'Laboratory', href: '/admin/laboratory' },
    { title: 'Lab Orders', href: '/admin/laboratory/orders' },
    { title: `Order #${order.id}`, href: `/admin/laboratory/orders/${order.id}/results/view` },
    { title: 'Edit Result', href: `/admin/laboratory/orders/${order.id}/results` },
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
                        <Label htmlFor={fieldId} className="text-sm font-semibold text-gray-700">
                            {field.label}
                            {field.required && <span className="ml-1 text-red-500">*</span>}
                        </Label>
                        <Input 
                            {...commonProps} 
                            placeholder={field.placeholder}
                            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                        />
                        {field.unit && <span className="ml-2 text-sm text-gray-500">{field.unit}</span>}
                    </div>
                );

            case 'number':
                return (
                    <div key={fieldKey} className="space-y-2">
                        <Label htmlFor={fieldId} className="text-sm font-semibold text-gray-700">
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
                            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                        />
                        {field.unit && <span className="ml-2 text-sm text-gray-500">{field.unit}</span>}
                    </div>
                );

            case 'select':
                return (
                    <div key={fieldKey} className="space-y-2">
                        <Label htmlFor={fieldId} className="text-sm font-semibold text-gray-700">
                            {field.label}
                            {field.required && <span className="ml-1 text-red-500">*</span>}
                        </Label>
                        <Select value={value} onValueChange={(val) => updateResult(testId, fieldPath, val)}>
                            <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm">
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
                        <Label htmlFor={fieldId} className="text-sm font-semibold text-gray-700">
                            {field.label}
                            {field.required && <span className="ml-1 text-red-500">*</span>}
                        </Label>
                        <Textarea 
                            {...commonProps} 
                            placeholder={field.placeholder} 
                            rows={field.rows || 3}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                        />
                    </div>
                );

            default:
                return (
                    <div key={fieldKey} className="space-y-2">
                        <Label htmlFor={fieldId} className="text-sm font-semibold text-gray-700">{field.label}</Label>
                        <Input 
                            {...commonProps} 
                            placeholder={field.placeholder}
                            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                        />
                    </div>
                );
        }
    };

    const renderTest = (test: Test) => {
        const schema = test.fields_schema;
        if (!schema || !schema.sections) return null;

        return (
            <Card key={test.id} className="shadow-lg mb-8">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">{test.name}</CardTitle>
                            <p className="text-sm text-gray-500">Test ID: {test.code}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h5 className="text-sm font-semibold text-gray-700">Test Parameters</h5>
                        <div className="bg-gray-100 rounded-full border border-gray-300 shadow-sm px-3 py-1">
                            <span className="text-gray-700 font-semibold text-sm">
                                {Object.values(schema.sections).reduce((total: number, section: any) => 
                                    total + Object.keys(section.fields || {}).length, 0
                                )} fields
                            </span>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {Object.entries(schema.sections).map(([sectionKey, section]: [string, any]) => (
                            <div key={sectionKey} className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h6 className="text-base font-semibold text-gray-800">{section.title || sectionKey}</h6>
                                    <div className="bg-gray-100 rounded-full border border-gray-300 shadow-sm px-2 py-1">
                                        <span className="text-gray-700 font-medium text-xs">
                                            {Object.keys(section.fields || {}).length} fields
                                        </span>
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {Object.entries(section.fields || {}).map(([fieldKey, field]: [string, any]) =>
                                        renderField(test.id, field, sectionKey, fieldKey),
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
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
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button variant="outline" size="icon" onClick={() => router.visit('/admin/laboratory/orders')} className="h-12 w-12 rounded-xl border-gray-300 hover:bg-gray-50">
                                <span aria-hidden>←</span>
                            </Button>
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">Lab Results Entry</h1>
                                <p className="text-lg text-gray-600">
                                    Order #{order.id} • {new Date(order.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="counter-card text-white rounded-xl shadow-lg border-0 px-6 py-4 w-52 h-20 flex items-center overflow-hidden">
                                <div className="flex items-center gap-3">
                                    <div className="counter-icon p-2 rounded-lg border border-white/60">
                                        <FileText className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold whitespace-nowrap leading-tight">{order.status}</div>
                                        <div className="text-blue-100 text-xs font-medium whitespace-nowrap">Status</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <Card className="shadow-lg mb-8">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold text-gray-900">Results Actions</CardTitle>
                                <p className="text-sm text-gray-500 mt-1">Save, verify, and generate reports for this order</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                            <div className="flex flex-wrap gap-3">
                                <Button variant="outline" onClick={handleSave} disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Draft
                                </Button>
                                {!isVerified && (
                                    <Button onClick={handleVerify} disabled={processing}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
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
                    </CardContent>
                </Card>

                <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-8">
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
                    </div>
                </form>

                {tests.length === 0 && (
                    <Card className="shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-900">No Tests Available</CardTitle>
                                    <p className="text-sm text-gray-500">No tests found for this order</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="text-center text-gray-500 py-8">No tests found for this order.</div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

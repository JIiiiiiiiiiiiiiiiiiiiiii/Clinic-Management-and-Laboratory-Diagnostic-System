import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { 
    ArrowLeft, 
    CheckCircle, 
    FileText, 
    Save, 
    User, 
    TestTube, 
    Calendar, 
    Clock, 
    Hash,
    Activity,
    AlertCircle,
    CheckCircle2,
    PlayCircle,
    PauseCircle,
    XCircle,
    UserCheck,
    Phone,
    Mail,
    MapPin
} from 'lucide-react';

type Test = { 
    id: number; 
    name: string; 
    code: string; 
    fields_schema: any 
};

type Order = { 
    id: number; 
    status: string; 
    created_at: string;
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        middle_name?: string;
        birthdate: string;
        gender: string;
        telephone_no?: string;
        mobile_no?: string;
        email?: string;
        present_address?: string;
    };
};

type Patient = { 
    id: number; 
    first_name: string; 
    last_name: string; 
    age: number; 
    sex: string 
};

interface ResultsEntryProps {
    patient: Patient;
    order: Order;
    tests: Test[];
    existingResults?: { [testId: number]: any };
}

export default function ResultsEntry({ patient, order, tests, existingResults = {} }: ResultsEntryProps): React.ReactElement {
    const [results, setResults] = useState<{ [testId: number]: any }>(existingResults);
    const [processing, setProcessing] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Laboratory', href: '/admin/laboratory' },
        { title: 'Lab Orders', href: '/admin/laboratory/orders' },
        { title: `Order #${order.id}`, href: `/admin/laboratory/orders/${order.id}` },
        { title: 'Enter Results', href: `/admin/laboratory/orders/${order.id}/results` },
    ];

    useEffect(() => {
        setResults(existingResults || {});
    }, [existingResults]);

    const updateResult = (testId: number, fieldPath: string, value: any) => {
        setResults((prev) => {
            const newResults = { ...prev };
            if (!newResults[testId]) newResults[testId] = {};

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

    const getResultValue = (testId: number, fieldPath: string): string => {
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ordered':
                return <AlertCircle className="h-4 w-4" />;
            case 'processing':
                return <PlayCircle className="h-4 w-4" />;
            case 'completed':
                return <CheckCircle2 className="h-4 w-4" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4" />;
            default:
                return <PauseCircle className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ordered':
                return 'bg-gray-100 text-black border-gray-200';
            case 'processing':
                return 'bg-gray-100 text-black border-gray-200';
            case 'completed':
                return 'bg-gray-100 text-black border-gray-200';
            case 'cancelled':
                return 'bg-gray-100 text-black border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatAge = (birthdate: string) => {
        const today = new Date();
        const birth = new Date(birthdate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    };

    const renderField = (testId: number, field: any, sectionKey: string, fieldKey: string) => {
        const fieldId = `test-${testId}-${sectionKey}-${fieldKey}`;
        const fieldPath = `${sectionKey}.${fieldKey}`;
        const value = getResultValue(testId, fieldPath);

        const commonProps = {
            id: fieldId,
            value: value,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
                updateResult(testId, fieldPath, e.target.value),
        };

        switch (field.type) {
            case 'text':
                return (
                    <div key={fieldKey} className="space-y-2">
                        <Label htmlFor={fieldId} className="text-sm font-semibold text-gray-700">
                            {field.label}
                            {field.required && <span className="ml-1 text-black">*</span>}
                        </Label>
                        <Input
                            {...commonProps}
                            type="text"
                            placeholder={field.placeholder}
                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                        />
                        {field.unit && <span className="ml-2 text-sm text-gray-500">{field.unit}</span>}
                    </div>
                );

            case 'number':
                return (
                    <div key={fieldKey} className="space-y-2">
                        <Label htmlFor={fieldId} className="text-sm font-semibold text-gray-700">
                            {field.label}
                            {field.required && <span className="ml-1 text-black">*</span>}
                        </Label>
                        <Input
                            {...commonProps}
                            type="number"
                            step={field.step || '0.01'}
                            min={field.min}
                            max={field.max}
                            placeholder={field.placeholder}
                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                        />
                        {field.unit && <span className="ml-2 text-sm text-gray-500">{field.unit}</span>}
                    </div>
                );

            case 'select':
                return (
                    <div key={fieldKey} className="space-y-2">
                        <Label htmlFor={fieldId} className="text-sm font-semibold text-gray-700">
                            {field.label}
                            {field.required && <span className="ml-1 text-black">*</span>}
                        </Label>
                        <Select value={value} onValueChange={(val) => updateResult(testId, fieldPath, val)}>
                            <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm">
                                <SelectValue placeholder={field.placeholder || 'Select...'} />
                            </SelectTrigger>
                            <SelectContent>
                                {field.options?.map((option: string) => (
                                    <SelectItem key={option} value={option}>
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
                            {field.required && <span className="ml-1 text-black">*</span>}
                        </Label>
                        <Textarea
                            {...commonProps}
                            placeholder={field.placeholder}
                            className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                            rows={3}
                        />
                    </div>
                );

            default:
                return (
                    <div key={fieldKey} className="space-y-2">
                        <Label htmlFor={fieldId} className="text-sm font-semibold text-gray-700">
                            {field.label}
                            {field.required && <span className="ml-1 text-black">*</span>}
                        </Label>
                        <Input
                            {...commonProps}
                            type="text"
                            placeholder={field.placeholder}
                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                        />
                    </div>
                );
        }
    };

    const renderTest = (test: Test) => {
        const schema = test.fields_schema;
        if (!schema?.sections) return null;

        return (
            <Card key={test.id} className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <TestTube className="h-6 w-6 text-black" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">{test.name}</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">Code: {test.code}</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-black border-gray-200">
                        {Object.keys(schema.sections).length} section{Object.keys(schema.sections).length !== 1 ? 's' : ''}
                    </Badge>
                </CardHeader>
                <CardContent className="p-6">
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Lab Results - Order #${order.id}`} />
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-12 w-12 rounded-xl border-gray-300 hover:bg-gray-50"
                                onClick={() => router.visit(`/admin/laboratory/orders/${order.id}`)}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-4xl font-bold text-black mb-2">Lab Results Entry</h1>
                                <div className="flex items-center gap-4">
                                    <Badge className={`${getStatusColor(order.status)} border`}>
                                        {getStatusIcon(order.status)}
                                        <span className="ml-2 capitalize">{order.status}</span>
                                    </Badge>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="h-4 w-4" />
                                        {formatDate(order.created_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={() => router.visit(`/admin/laboratory/orders/${order.id}`)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                View Order
                            </Button>
                            <Button variant="outline" onClick={() => window.open(`/admin/laboratory/orders/${order.id}/report`, '_blank')}>
                                <FileText className="mr-2 h-4 w-4" />
                                Generate Report
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-4">
                    {/* Left Column - Patient & Order Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Patient Information */}
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <User className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Patient</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">Patient information</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <UserCheck className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {order.patient.first_name} {order.patient.middle_name} {order.patient.last_name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {order.patient.gender} • {formatAge(order.patient.birthdate)} years old
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <Separator />
                                    
                                    {order.patient.telephone_no && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-700">{order.patient.telephone_no}</span>
                                        </div>
                                    )}
                                    
                                    {order.patient.mobile_no && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-700">{order.patient.mobile_no}</span>
                                        </div>
                                    )}
                                    
                                    {order.patient.email && (
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-700">{order.patient.email}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Details */}
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Hash className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Order Details</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">Order information</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Hash className="h-4 w-4 text-gray-500" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Order ID</p>
                                            <p className="text-sm text-gray-600">#{order.id}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Ordered Date</p>
                                            <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Last Updated</p>
                                            <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Activity className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Actions</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">Save and verify results</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <Button 
                                        variant="outline" 
                                        onClick={handleSave} 
                                        disabled={processing}
                                        className="w-full"
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Draft
                                    </Button>
                                    
                                    {!isVerified && (
                                        <Button 
                                            onClick={handleVerify} 
                                            disabled={processing}
                                            className="w-full"
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Verify & Complete
                                        </Button>
                                    )}
                                    
                                    {isVerified && (
                                        <Button variant="secondary" disabled className="w-full">
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            ✓ Verified
                                        </Button>
                                    )}
                                    
                                    <Button 
                                        variant="outline" 
                                        onClick={() => window.open(`/admin/laboratory/orders/${order.id}/report`, '_blank')}
                                        className="w-full"
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        Generate Report
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Test Results */}
                    <div className="lg:col-span-3 space-y-6">
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <TestTube className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Test Results</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">Enter laboratory test results for this order</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-black border-gray-200">
                                    {tests.length} test{tests.length !== 1 ? 's' : ''}
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
                                    <div className="space-y-8">
                                        {tests.map((test) => {
                                            const schema = test.fields_schema;
                                            return (
                                                <React.Fragment key={test.id}>
                                                    {renderTest(test)}
                                                    {/* Hidden inputs for form serialization */}
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
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}



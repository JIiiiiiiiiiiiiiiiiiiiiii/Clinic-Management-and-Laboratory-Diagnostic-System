import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, FileText, Plus, TestTube } from 'lucide-react';
import { useState } from 'react';

type Patient = {
    id: number;
    first_name: string;
    last_name: string;
    age: number;
    sex: string;
    attending_physician: string;
};

type LabTest = {
    id: number;
    name: string;
    code: string;
    is_active: boolean;
};

type LabOrder = {
    id: number;
    status: string;
    created_at: string;
    notes?: string;
    labTests: LabTest[];
};

const breadcrumbs = (patient: Patient): BreadcrumbItem[] => [
    { title: 'Laboratory', href: '/admin/laboratory' },
    { title: 'Lab Orders', href: '/admin/laboratory/orders' },
    { title: `${patient.last_name}, ${patient.first_name}`, href: `/admin/laboratory/patients/${patient.id}/orders` },
];

export default function PatientLabOrders({
    patient,
    labTests,
    orders = [],
    patient_visit_id = null,
}: {
    patient: Patient;
    labTests: LabTest[];
    orders?: LabOrder[];
    patient_visit_id?: number | null;
}) {
    const [selectedTests, setSelectedTests] = useState<number[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const { data, setData, processing, errors, reset } = useForm({
        notes: '',
        lab_test_ids: [] as number[],
        patient_visit_id: patient_visit_id as number | null,
    });

    const handleTestToggle = (testId: number) => {
        const newSelectedTests = selectedTests.includes(testId) ? selectedTests.filter((id) => id !== testId) : [...selectedTests, testId];

        setSelectedTests(newSelectedTests);
        setData('lab_test_ids', newSelectedTests);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedTests.length === 0) {
            alert('Please select at least one test');
            return;
        }

        router.post(`/admin/laboratory/patients/${patient.id}/orders`, data, {
            onSuccess: () => {
                setShowCreateForm(false);
                setSelectedTests([]);
                reset();
            },
            onError: (errors) => {
                console.error('Lab order creation failed:', errors);
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            ordered: { label: 'Ordered', color: 'bg-blue-500' },
            processing: { label: 'Processing', color: 'bg-yellow-500' },
            completed: { label: 'Completed', color: 'bg-green-500' },
            cancelled: { label: 'Cancelled', color: 'bg-red-500' },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-500' };
        return (
            <Badge variant="secondary" className={`${config.color} text-white`}>
                {config.label}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(patient)}>
            <Head title={`Lab Orders - ${patient.last_name}, ${patient.first_name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.visit('/admin/laboratory/orders')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Lab Orders
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Lab Orders</h1>
                            <p className="text-muted-foreground">
                                {patient.last_name}, {patient.first_name} ({patient.age} years, {patient.sex})
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                        <Plus className="mr-2 h-4 w-4" />
                        {showCreateForm ? 'Cancel' : 'Create New Order'}
                    </Button>
                </div>

                {/* Create New Order Form */}
                {showCreateForm && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Lab Order</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label className="text-base font-medium">Select Tests</Label>
                                    <p className="mb-4 text-sm text-muted-foreground">Choose the laboratory tests to order for this patient</p>
                                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                        {labTests
                                            .filter((test) => test.is_active)
                                            .map((test) => (
                                                <div key={test.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`test-${test.id}`}
                                                        checked={selectedTests.includes(test.id)}
                                                        onCheckedChange={() => handleTestToggle(test.id)}
                                                    />
                                                    <Label htmlFor={`test-${test.id}`} className="flex-1 cursor-pointer">
                                                        <div className="font-medium">{test.name}</div>
                                                        <div className="text-sm text-muted-foreground">{test.code}</div>
                                                    </Label>
                                                </div>
                                            ))}
                                    </div>
                                    {errors.lab_test_ids && <p className="mt-2 text-sm text-red-500">{errors.lab_test_ids}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Add any special instructions or notes for this order..."
                                        rows={3}
                                    />
                                    {errors.notes && <p className="mt-2 text-sm text-red-500">{errors.notes}</p>}
                                </div>

                                <div className="flex justify-between gap-3">
                                    <div className="text-sm text-muted-foreground">
                                        {data.patient_visit_id ? (
                                            <span>Linked to Visit ID: {data.patient_visit_id}</span>
                                        ) : (
                                            <span>Not linked to a specific visit</span>
                                        )}
                                    </div>
                                    <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing || selectedTests.length === 0}>
                                        <TestTube className="mr-2 h-4 w-4" />
                                        Create Order
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Existing Orders */}
                <Card>
                    <CardHeader>
                        <CardTitle>Existing Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {orders.length === 0 ? (
                            <div className="py-8 text-center">
                                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold">No orders yet</h3>
                                <p className="text-muted-foreground">Create a new lab order for this patient to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <Card key={order.id} className="transition-shadow hover:shadow-md">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-center gap-3">
                                                        <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                                                        {getStatusBadge(order.status)}
                                                    </div>

                                                    <div className="mb-3">
                                                        <span className="text-sm text-muted-foreground">Tests Ordered:</span>
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            {(order.labTests || []).map((test) => (
                                                                <Badge key={test.id} variant="outline" className="text-xs">
                                                                    {test.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="text-sm text-muted-foreground">
                                                        <strong>Ordered:</strong> {new Date(order.created_at).toLocaleString()}
                                                    </div>

                                                    {order.notes && (
                                                        <div className="mt-2 text-sm text-muted-foreground">
                                                            <strong>Notes:</strong> {order.notes}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="ml-4 flex flex-col gap-2">
                                                    <Button
                                                        onClick={() => router.visit(`/admin/laboratory/orders/${order.id}/results`)}
                                                        disabled={order.status === 'cancelled'}
                                                    >
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        Enter Results
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

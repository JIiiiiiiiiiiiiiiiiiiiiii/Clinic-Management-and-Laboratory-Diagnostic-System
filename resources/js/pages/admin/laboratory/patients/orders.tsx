import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PatientInfoCard } from '@/components/patient/PatientPageLayout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, FileText, Plus, TestTube, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useState } from 'react';

type Patient = {
    id: number;
    patient_id?: string;
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

type LabResultValue = {
    id: number;
    parameter: string;
    value: string | number;
    unit?: string;
    reference_range?: string;
    status?: string;
};

type LabResult = {
    id: number;
    lab_test_id: number;
    test?: LabTest;
    results?: any;
    values?: LabResultValue[];
    verified_at?: string;
};

type LabOrder = {
    id: number;
    status: string;
    created_at: string;
    notes?: string;
    lab_tests: LabTest[];
    results?: LabResult[];
    visit?: {
        id: number;
        notes?: string;
        appointment?: {
            id: number;
            appointment_date: string;
            appointment_time: string;
            appointment_type: string;
            specialist?: {
                name: string;
            };
        };
        attending_staff?: {
            id: number;
            name: string;
        } | null;
    } | null;
    appointments?: Array<{
        id: number;
        appointment_date: string;
        appointment_time: string;
        appointment_type: string;
        specialist?: {
            name: string;
        };
    }>;
    ordered_by?: {
        id: number;
        name: string;
    } | null;
};

type Appointment = {
    id: number;
    appointment_code: string;
    appointment_date: string;
    appointment_time: string;
    appointment_type: string;
    status: string;
    specialist?: {
        name: string;
        specialization?: string;
    };
    visit?: {
        id: number;
        notes?: string;
        visit_date_time_time?: string;
        attending_staff?: {
            id: number;
            name: string;
        };
        lab_orders?: LabOrder[];
    };
    lab_orders?: LabOrder[];
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
    appointments = [],
    patient_visit_id = null,
}: {
    patient: Patient;
    labTests: LabTest[];
    orders?: LabOrder[];
    appointments?: Appointment[];
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
            ordered: { label: 'Ordered', color: 'bg-green-100 text-green-800 border-green-200' },
            processing: { label: 'Processing', color: 'bg-green-100 text-green-800 border-green-200' },
            completed: { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200' },
            cancelled: { label: 'Cancelled', color: 'bg-green-100 text-green-800 border-green-200' },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-green-100 text-green-800 border-green-200' };
        return (
            <Badge variant="secondary" className={`${config.color}`}>
                {config.label}
            </Badge>
        );
    };

    // Build timeline of appointments and lab orders
    const buildTimeline = () => {
        const timelineItems: Array<{
            date: Date;
            type: 'appointment' | 'lab_order';
            data: Appointment | LabOrder;
        }> = [];

        // Add appointments to timeline
        appointments.forEach((apt) => {
            const date = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
            timelineItems.push({
                date,
                type: 'appointment',
                data: apt,
            });
        });

        // Add lab orders to timeline
        orders.forEach((order) => {
            const date = new Date(order.created_at);
            timelineItems.push({
                date,
                type: 'lab_order',
                data: order,
            });
        });

        // Sort by date (newest first)
        return timelineItems.sort((a, b) => b.date.getTime() - a.date.getTime());
    };

    // Get lab results history for a specific test
    const getTestHistory = (testName: string) => {
        const history: Array<{
            date: Date;
            orderId: number;
            appointment?: Appointment;
            values: LabResultValue[];
        }> = [];

        orders.forEach((order) => {
            const testResults = order.results?.filter((r) => r.test?.name === testName || r.test?.code === testName);
            if (testResults && testResults.length > 0) {
                testResults.forEach((result) => {
                    if (result.values && result.values.length > 0) {
                        const date = new Date(order.created_at);
                        // Find associated appointment
                        const appointment = appointments.find((apt) => 
                            apt.visit?.lab_orders?.some((lo) => lo.id === order.id) ||
                            apt.lab_orders?.some((lo) => lo.id === order.id) ||
                            order.visit?.appointment?.id === apt.id
                        );
                        history.push({
                            date,
                            orderId: order.id,
                            appointment,
                            values: result.values,
                        });
                    }
                });
            }
        });

        return history.sort((a, b) => a.date.getTime() - b.date.getTime());
    };

    const timeline = buildTimeline();

    return (
        <AppLayout breadcrumbs={breadcrumbs(patient)}>
            <Head title={`Lab Orders - ${patient.last_name}, ${patient.first_name}`} />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button variant="secondary" onClick={() => router.visit('/admin/laboratory/orders')} className="h-12 w-12 rounded-xl border-gray-300 hover:bg-gray-50">
                                <span aria-hidden>←</span>
                            </Button>
                            <div>
                                <h1 className="text-4xl font-bold text-black mb-2">Lab Orders</h1>
                                <p className="text-lg text-gray-600">
                                    {patient.last_name}, {patient.first_name} ({patient.age} years, {patient.sex})
                                </p>
                            </div>
                        </div>
                        <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-green-600 hover:bg-green-700 text-white">
                            <Plus className="mr-2 h-4 w-4" />
                            {showCreateForm ? 'Cancel' : 'Create New Order'}
                        </Button>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-3 items-start">
                    <div className="md:col-span-2 space-y-8">
                        {showCreateForm && (
                            <PatientInfoCard
                                title="Create New Lab Order"
                                icon={<TestTube className="h-5 w-5 text-black" />}
                            >
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <Label className="text-base font-medium">Select Tests</Label>
                                        <p className="mb-4 text-sm text-muted-foreground">Choose the laboratory tests to order for this patient</p>
                                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                            {labTests
                                                .filter((test) => test.is_active)
                                                .map((test) => (
                                                    <div key={test.id} className="flex items-center space-x-2 bg-white rounded-lg border p-3">
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
                                        {errors.lab_test_ids && <p className="mt-2 text-sm text-black">{errors.lab_test_ids}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 mb-2 block">Notes (Optional)</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Add any special instructions or notes for this order..."
                                            rows={3}
                                            className="border-gray-300 rounded-xl shadow-sm"
                                        />
                                        {errors.notes && <p className="mt-2 text-sm text-black">{errors.notes}</p>}
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <div className="text-sm text-muted-foreground">
                                            {data.patient_visit_id ? (
                                                <span>Linked to Visit ID: {data.patient_visit_id}</span>
                                            ) : (
                                                <span>Not linked to a specific visit</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="button" variant="secondary" onClick={() => setShowCreateForm(false)} className="bg-green-600 hover:bg-green-700 text-white">
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={processing || selectedTests.length === 0} className="bg-green-600 hover:bg-green-700 text-white">
                                                <TestTube className="mr-2 h-4 w-4" />
                                                Create Order
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </PatientInfoCard>
                        )}

                        {/* Patient History Timeline */}
                        {timeline.length > 0 && (
                            <PatientInfoCard
                                title="Patient History - Appointments & Lab Results"
                                icon={<Calendar className="h-5 w-5 text-black" />}
                            >
                                <div className="space-y-6">
                                    {timeline.map((item, index) => {
                                        const isAppointment = item.type === 'appointment';
                                        const appointment = isAppointment ? (item.data as Appointment) : null;
                                        const order = !isAppointment ? (item.data as LabOrder) : null;
                                        
                                        return (
                                            <div key={`${item.type}-${item.data.id}-${index}`} className="relative pl-8 pb-6 border-l-2 border-green-300 last:border-l-0 last:pb-0">
                                                <div className="absolute -left-2 top-0 w-4 h-4 bg-green-600 rounded-full border-2 border-white"></div>
                                                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                                                    {isAppointment && appointment ? (
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="h-4 w-4 text-blue-600" />
                                                                    <h4 className="font-semibold text-gray-900">Appointment</h4>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {appointment.appointment_code}
                                                                    </Badge>
                                                                </div>
                                                                <span className="text-sm text-gray-500">
                                                                    {item.date.toLocaleDateString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    })}
                                                                </span>
                                                            </div>
                                                            <div className="space-y-1 text-sm">
                                                                <p><strong>Type:</strong> {appointment.appointment_type}</p>
                                                                {appointment.specialist && (
                                                                    <p><strong>Doctor:</strong> {appointment.specialist.name}</p>
                                                                )}
                                                                {appointment.visit?.notes && (
                                                                    <p className="mt-2 text-gray-700"><strong>Notes:</strong> {appointment.visit.notes}</p>
                                                                )}
                                                            </div>
                                                            {/* Show lab orders from this appointment */}
                                                            {((appointment.visit?.lab_orders && appointment.visit.lab_orders.length > 0) ||
                                                              (appointment.lab_orders && appointment.lab_orders.length > 0)) && (
                                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                                    <p className="text-sm font-semibold text-gray-700 mb-2">Lab Tests:</p>
                                                                    <div className="space-y-2">
                                                                        {(appointment.visit?.lab_orders || appointment.lab_orders || []).map((lo) => (
                                                                            <div key={lo.id} className="bg-gray-50 rounded p-2">
                                                                                <div className="flex items-center justify-between mb-1">
                                                                                    <span className="text-sm font-medium">Order #{lo.id}</span>
                                                                                    {getStatusBadge(lo.status)}
                                                                                </div>
                                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                                    {(lo.lab_tests || []).map((test) => (
                                                                                        <Badge key={test.id} variant="outline" className="text-xs">
                                                                                            {test.name}
                                                                                        </Badge>
                                                                                    ))}
                                                                                </div>
                                                                                {/* Show results if available */}
                                                                                {lo.results && lo.results.length > 0 && (
                                                                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                                                                        {lo.results.map((result) => (
                                                                                            <div key={result.id} className="mb-2 last:mb-0">
                                                                                                <p className="text-xs font-semibold text-gray-700">{result.test?.name || 'Unknown Test'}</p>
                                                                                                {result.values && result.values.length > 0 ? (
                                                                                                    <div className="mt-1 space-y-1">
                                                                                                        {result.values.map((val, idx) => (
                                                                                                            <div key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                                                                                                                <span className="font-medium">{val.parameter}:</span>
                                                                                                                <span>{val.value}</span>
                                                                                                                {val.unit && <span className="text-gray-500">{val.unit}</span>}
                                                                                                                {val.reference_range && (
                                                                                                                    <span className="text-gray-500">({val.reference_range})</span>
                                                                                                                )}
                                                                                                                {val.status && (
                                                                                                                    <Badge 
                                                                                                                        variant="outline" 
                                                                                                                        className={`text-xs ${
                                                                                                                            val.status.toLowerCase().includes('high') || val.status.toLowerCase().includes('abnormal') 
                                                                                                                                ? 'bg-red-100 text-red-800 border-red-200' 
                                                                                                                                : val.status.toLowerCase().includes('low') 
                                                                                                                                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                                                                                                : 'bg-green-100 text-green-800 border-green-200'
                                                                                                                        }`}
                                                                                                                    >
                                                                                                                        {val.status}
                                                                                                                    </Badge>
                                                                                                                )}
                                                                                                            </div>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                ) : (
                                                                                                    <p className="text-xs text-gray-500 italic">Results pending</p>
                                                                                                )}
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        order && (
                                                            <div>
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <TestTube className="h-4 w-4 text-green-600" />
                                                                        <h4 className="font-semibold text-gray-900">Lab Order #{order.id}</h4>
                                                                        {getStatusBadge(order.status)}
                                                                    </div>
                                                                    <span className="text-sm text-gray-500">
                                                                        {item.date.toLocaleDateString('en-US', {
                                                                            year: 'numeric',
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                        })}
                                                                    </span>
                                                                </div>
                                                                <div className="space-y-1 text-sm mb-2">
                                                                    {order.visit?.appointment && (
                                                                        <p><strong>From Appointment:</strong> {order.visit.appointment.appointment_code} - {order.visit.appointment.appointment_type}</p>
                                                                    )}
                                                                    {(order.appointments && order.appointments.length > 0) && (
                                                                        <p>
                                                                            <strong>Linked Appointments:</strong>{' '}
                                                                            {order.appointments.map((apt) => apt.appointment_code).join(', ')}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-wrap gap-1 mb-2">
                                                                    {(order.lab_tests || []).map((test) => (
                                                                        <Badge key={test.id} variant="outline" className="text-xs">
                                                                            {test.name}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                                {/* Show results if available */}
                                                                {order.results && order.results.length > 0 && (
                                                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                                                        <p className="text-xs font-semibold text-gray-700 mb-2">Results:</p>
                                                                        {order.results.map((result) => (
                                                                            <div key={result.id} className="mb-2 last:mb-0 bg-gray-50 rounded p-2">
                                                                                <p className="text-xs font-semibold text-gray-700">{result.test?.name || 'Unknown Test'}</p>
                                                                                {result.values && result.values.length > 0 ? (
                                                                                    <div className="mt-1 space-y-1">
                                                                                        {result.values.map((val, idx) => (
                                                                                            <div key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                                                                                                <span className="font-medium">{val.parameter}:</span>
                                                                                                <span>{val.value}</span>
                                                                                                {val.unit && <span className="text-gray-500">{val.unit}</span>}
                                                                                                {val.reference_range && (
                                                                                                    <span className="text-gray-500">({val.reference_range})</span>
                                                                                                )}
                                                                                                {val.status && (
                                                                                                    <Badge 
                                                                                                        variant="outline" 
                                                                                                        className={`text-xs ${
                                                                                                            val.status.toLowerCase().includes('high') || val.status.toLowerCase().includes('abnormal') 
                                                                                                                ? 'bg-red-100 text-red-800 border-red-200' 
                                                                                                                : val.status.toLowerCase().includes('low') 
                                                                                                                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                                                                                : 'bg-green-100 text-green-800 border-green-200'
                                                                                                        }`}
                                                                                                    >
                                                                                                        {val.status}
                                                                                                    </Badge>
                                                                                                )}
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                ) : (
                                                                                    <p className="text-xs text-gray-500 italic">Results pending</p>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </PatientInfoCard>
                        )}

                        {/* Existing Orders */}
                        <PatientInfoCard
                            title="Existing Orders"
                            icon={<FileText className="h-5 w-5 text-black" />}
                        >
                            {orders.length === 0 ? (
                                <div className="py-8 text-center bg-white rounded-xl border-2 border-dashed border-gray-300">
                                    <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                    <h3 className="mb-2 text-lg font-semibold text-gray-700">No orders yet</h3>
                                    <p className="text-gray-500">Create a new lab order for this patient to get started</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-center gap-3">
                                                        <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                                                        {getStatusBadge(order.status)}
                                                    </div>
                                                    <div className="mb-3">
                                                        <span className="text-sm text-muted-foreground">Tests Ordered:</span>
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            {(order.lab_tests || []).map((test) => (
                                                                <Badge key={test.id} variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
                                                                    {test.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        <strong>Ordered:</strong> {new Date(order.created_at).toLocaleString()}
                                                    </div>
                                                    {order.ordered_by && (
                                                        <div className="mt-2 text-sm text-muted-foreground">
                                                            <strong>Requested By:</strong> {order.ordered_by.name}
                                                        </div>
                                                    )}
                                                    {order.visit?.notes && (
                                                        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                            <div className="text-sm font-semibold text-blue-900 mb-1">
                                                                Doctor's Remarks:
                                                                {order.visit.attending_staff && (
                                                                    <span className="ml-2 text-xs font-normal text-blue-700">
                                                                        (Dr. {order.visit.attending_staff.name})
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-blue-800">{order.visit.notes}</p>
                                                        </div>
                                                    )}
                                                    {order.notes && (
                                                        <div className="mt-2 text-sm text-muted-foreground">
                                                            <strong>Order Notes:</strong> {order.notes}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4 flex flex-col gap-2">
                                                    <Button
                                                        onClick={() => router.visit(`/admin/laboratory/orders/${order.id}/results`)}
                                                        disabled={order.status === 'cancelled'}
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        Enter Results
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </PatientInfoCard>
                    </div>

                    {/* Quick Tips */}
                    <PatientInfoCard
                        title="Quick Tips"
                        icon={<TestTube className="h-5 w-5 text-black" />}
                        className="sticky top-0 self-start"
                    >
                        <div className="space-y-3">
                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                                <div className="font-semibold text-gray-800 mb-1">Select Relevant Tests</div>
                                <div className="text-sm text-gray-600">Choose only tests that are clinically indicated</div>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                                <div className="font-semibold text-gray-800 mb-1">Add Clear Notes</div>
                                <div className="text-sm text-gray-600">Provide instructions that help lab staff process correctly</div>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                                <div className="font-semibold text-gray-800 mb-1">Link to Visit</div>
                                <div className="text-sm text-gray-600">When possible, link to a clinical visit for context</div>
                            </div>
                        </div>
                    </PatientInfoCard>
                </div>
            </div>
        </AppLayout>
    );
}

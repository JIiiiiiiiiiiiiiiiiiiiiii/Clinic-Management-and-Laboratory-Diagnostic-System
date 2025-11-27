import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Calculator, CheckCircle, Stethoscope, TestTube } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Visits', href: '/admin/visits' },
    { title: 'Add Lab Tests', href: '#' },
];

interface LabTest {
    id: number;
    name: string;
    code: string;
    price: number;
}

interface LabOrder {
    id: number;
    status: string;
    notes?: string;
    ordered_by?: {
        name: string;
    };
    labTests?: LabTest[];
    results?: Array<{
        lab_test: LabTest;
    }>;
}

interface Props {
    visit: {
        id: number;
        visit_code?: string;
        visit_date_time_time?: string;
        purpose?: string;
        status: string;
        attending_staff?: {
            name: string;
        };
    };
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        patient_no: string;
    };
    availableLabTests: LabTest[];
    existingLabOrders: LabOrder[];
}

export default function AddLabTests({ visit, patient, availableLabTests, existingLabOrders }: Props) {
    const [selectedTests, setSelectedTests] = useState<number[]>([]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleTestToggle = (testId: number) => {
        setSelectedTests(prev => 
            prev.includes(testId) 
                ? prev.filter(id => id !== testId)
                : [...prev, testId]
        );
    };

    const calculateTotal = () => {
        return availableLabTests
            .filter(test => selectedTests.includes(test.id))
            .reduce((sum, test) => sum + test.price, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        router.post(route('admin.visits.add-lab-tests.store', visit.id), {
            lab_test_ids: selectedTests,
            notes: notes
        }, {
            onSuccess: () => {
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            }
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'ordered': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const patientName = `${patient.first_name} ${patient.last_name}`;
    const visitDate = visit.visit_date_time_time 
        ? new Date(visit.visit_date_time_time).toLocaleDateString() 
        : 'N/A';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Lab Tests" />
            <div className="min-h-screen bg-white p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="mb-4">
                        <Button
                            variant="outline"
                            onClick={() => router.visit(route('admin.visits.edit', visit.id))}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Visit
                        </Button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-semibold text-black mb-2">Add Lab Tests</h1>
                            <p className="text-sm text-gray-600">Request laboratory tests for this patient visit</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Stethoscope className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Visit Info */}
                    <div className="lg:col-span-1">
                        <Card className="shadow-lg border-0 rounded-xl">
                            <CardHeader className="bg-blue-50 border-b border-blue-200">
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-blue-900">
                                    <TestTube className="h-5 w-5" />
                                    Visit Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Patient</Label>
                                        <p className="font-semibold text-black">{patientName}</p>
                                        <p className="text-xs text-gray-500">Patient No: {patient.patient_no}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Visit Code</Label>
                                        <p className="font-semibold text-black">{visit.visit_code || `#${visit.id}`}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Purpose</Label>
                                        <p className="font-semibold text-black">{visit.purpose || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Attending Physician</Label>
                                        <p className="font-semibold text-black">{visit.attending_staff?.name || 'Not Assigned'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Visit Date</Label>
                                        <p className="font-semibold text-black">{visitDate}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Status</Label>
                                        <Badge className="bg-green-100 text-green-800">
                                            {visit.status}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Existing Lab Orders */}
                        {existingLabOrders.length > 0 && (
                            <Card className="shadow-lg border-0 rounded-xl mt-6">
                                <CardHeader className="bg-green-50 border-b border-green-200">
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-green-900">
                                        <CheckCircle className="h-5 w-5" />
                                        Existing Lab Orders
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        {existingLabOrders.map((order) => (
                                            <div key={order.id} className="p-3 bg-gray-50 rounded-lg">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="font-medium text-black">Order #{order.id}</p>
                                                        {order.ordered_by && (
                                                            <p className="text-sm text-gray-500">Ordered by {order.ordered_by.name}</p>
                                                        )}
                                                    </div>
                                                    <Badge className={getStatusColor(order.status)}>
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                                {order.results && order.results.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        {order.results.map((result, idx) => (
                                                            <p key={idx} className="text-sm text-gray-600">
                                                                • {result.lab_test?.name || 'Unknown Test'}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Lab Test Selection */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-lg border-0 rounded-xl">
                            <CardHeader className="bg-white border-b border-gray-200">
                                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-black">
                                    <Stethoscope className="h-5 w-5" />
                                    Select Lab Tests
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Available Lab Tests */}
                                    <div>
                                        <Label className="text-lg font-semibold text-black mb-4 block">
                                            Available Lab Tests
                                        </Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {availableLabTests.map(test => (
                                                <div key={test.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                                                    <Checkbox
                                                        id={`test-${test.id}`}
                                                        checked={selectedTests.includes(test.id)}
                                                        onCheckedChange={() => handleTestToggle(test.id)}
                                                    />
                                                    <label htmlFor={`test-${test.id}`} className="flex-1 cursor-pointer">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <span className="font-medium text-black">{test.name}</span>
                                                                <p className="text-sm text-gray-500">{test.code}</p>
                                                            </div>
                                                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                                                ₱{test.price.toFixed(2)}
                                                            </Badge>
                                                        </div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <Label htmlFor="notes" className="text-lg font-semibold text-black mb-2 block">
                                            Notes (Optional)
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Add any notes about the lab tests..."
                                            className="w-full"
                                            rows={3}
                                        />
                                    </div>

                                    {/* Order Summary */}
                                    {selectedTests.length > 0 && (
                                        <div className="bg-blue-50 p-6 rounded-lg">
                                            <h4 className="font-semibold text-lg text-blue-900 mb-4">Order Summary</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Selected Tests:</span>
                                                    <span className="font-semibold">{selectedTests.length}</span>
                                                </div>
                                                <div className="border-t pt-2">
                                                    <div className="flex justify-between text-lg font-bold">
                                                        <span>Total:</span>
                                                        <span className="text-blue-600">₱{calculateTotal().toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-3 pt-6">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit(route('admin.visits.edit', visit.id))}
                                            className="px-6 py-2"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={selectedTests.length === 0 || isSubmitting}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 flex items-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Creating Lab Order...
                                                </>
                                            ) : (
                                                <>
                                                    <Stethoscope className="h-4 w-4" />
                                                    Create Lab Order
                                                </>
                                            )}
                                        </Button>
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


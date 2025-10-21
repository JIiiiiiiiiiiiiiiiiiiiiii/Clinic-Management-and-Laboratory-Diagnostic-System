import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Calculator, CheckCircle, Stethoscope, TestTube, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Appointments', href: '/admin/appointments' },
    { title: 'Add Lab Tests', href: '#' },
];

interface LabTest {
    id: number;
    name: string;
    code: string;
    price: number;
}

interface ExistingLabTest {
    id: number;
    lab_test: LabTest;
    total_price: number;
    status: string;
    added_by: {
        name: string;
    };
}

interface Props {
    appointment: {
        id: number;
        patient_name: string;
        appointment_type: string;
        price: number;
        total_lab_amount: number;
        final_total_amount: number;
        appointment_date: string;
        appointment_time: string;
        specialist_name: string;
        status: string;
    };
    availableLabTests: LabTest[];
    existingLabTests: ExistingLabTest[];
}

export default function AddLabTests({ appointment, availableLabTests, existingLabTests }: Props) {
    const [selectedTests, setSelectedTests] = useState<number[]>([]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Removed useForm since we're using router.post directly

    const handleTestToggle = (testId: number) => {
        setSelectedTests(prev => 
            prev.includes(testId) 
                ? prev.filter(id => id !== testId)
                : [...prev, testId]
        );
    };

    const calculateTotal = () => {
        const selectedTestPrices = availableLabTests
            .filter(test => selectedTests.includes(test.id))
            .reduce((sum, test) => sum + test.price, 0);
        
        return appointment.price + selectedTestPrices;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        console.log('Form submitting with data:', {
            lab_test_ids: selectedTests,
            notes: notes,
            appointment_id: appointment.id
        });
        
        // Use router.post directly instead of useForm
        router.post(route('admin.appointments.add-lab-tests', appointment.id), {
            lab_test_ids: selectedTests,
            notes: notes
        }, {
            onSuccess: (page) => {
                console.log('Success:', page);
                setIsSubmitting(false);
            },
            onError: (errors) => {
                console.log('Errors:', errors);
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Lab Tests" />
            <div className="min-h-screen bg-white p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="mb-4">
                        <Button
                            variant="outline"
                            onClick={() => router.visit(route('admin.appointments.index'))}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Appointments
                        </Button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-semibold text-black mb-2">Add Lab Tests</h1>
                            <p className="text-sm text-gray-600">Add laboratory tests to patient appointment</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Stethoscope className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Appointment Info */}
                    <div className="lg:col-span-1">
                        <Card className="shadow-lg border-0 rounded-xl">
                            <CardHeader className="bg-blue-50 border-b border-blue-200">
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-blue-900">
                                    <TestTube className="h-5 w-5" />
                                    Appointment Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Patient</Label>
                                        <p className="font-semibold text-black">{appointment.patient_name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Appointment Type</Label>
                                        <p className="font-semibold text-black">{appointment.appointment_type}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Doctor</Label>
                                        <p className="font-semibold text-black">{appointment.specialist_name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Date & Time</Label>
                                        <p className="font-semibold text-black">
                                            {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Status</Label>
                                        <Badge className="bg-green-100 text-green-800">
                                            {appointment.status}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Current Billing */}
                        <Card className="shadow-lg border-0 rounded-xl mt-6">
                            <CardHeader className="bg-gray-50 border-b border-gray-200">
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                    <Calculator className="h-5 w-5" />
                                    Current Billing
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Base Appointment:</span>
                                        <span className="font-semibold">₱{appointment.price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Lab Tests:</span>
                                        <span className="font-semibold">₱{appointment.total_lab_amount.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total:</span>
                                            <span className="text-blue-600">₱{appointment.final_total_amount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Existing Lab Tests */}
                        {existingLabTests.length > 0 && (
                            <Card className="shadow-lg border-0 rounded-xl mt-6">
                                <CardHeader className="bg-green-50 border-b border-green-200">
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-green-900">
                                        <CheckCircle className="h-5 w-5" />
                                        Existing Lab Tests
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        {existingLabTests.map((labTest, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-black">{labTest.lab_test.name}</p>
                                                    <p className="text-sm text-gray-500">Added by {labTest.added_by.name}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-black">₱{labTest.total_price.toFixed(2)}</p>
                                                    <Badge className={getStatusColor(labTest.status)}>
                                                        {labTest.status}
                                                    </Badge>
                                                </div>
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
                                                <div className="flex justify-between">
                                                    <span>Lab Tests Total:</span>
                                                    <span className="font-semibold">
                                                        ₱{availableLabTests
                                                            .filter(test => selectedTests.includes(test.id))
                                                            .reduce((sum, test) => sum + test.price, 0)
                                                            .toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Base Appointment:</span>
                                                    <span className="font-semibold">₱{appointment.price.toFixed(2)}</span>
                                                </div>
                                                <div className="border-t pt-2">
                                                    <div className="flex justify-between text-lg font-bold">
                                                        <span>New Total:</span>
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
                                            onClick={() => router.visit(route('admin.appointments.index'))}
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
                                                    Adding Lab Tests...
                                                </>
                                            ) : (
                                                <>
                                                    <Stethoscope className="h-4 w-4" />
                                                    Add Lab Tests
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

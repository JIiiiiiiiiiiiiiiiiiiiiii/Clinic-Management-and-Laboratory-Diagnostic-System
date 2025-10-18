import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { 
    ArrowLeft, 
    Calendar,
    Clock,
    CreditCard,
    DollarSign,
    Plus,
    Receipt,
    User,
    CheckCircle
} from 'lucide-react';
import { useState } from 'react';

type PendingAppointment = {
    id: number;
    patient_name: string;
    patient_id: string;
    appointment_type: string;
    price: number;
    appointment_date: string;
    appointment_time: string;
    specialist_name: string;
    billing_status: string;
};

type Doctor = {
    id: number;
    name: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Billing',
        href: '/admin/billing',
    },
    {
        title: 'Create Transaction from Appointments',
        href: '/admin/billing/create-from-appointments',
    },
];

export default function CreateFromAppointments({ 
    pendingAppointments,
    doctors,
    selectedAppointmentId 
}: { 
    pendingAppointments: PendingAppointment[];
    doctors: Doctor[];
    selectedAppointmentId?: string;
}) {
    const [selectedAppointments, setSelectedAppointments] = useState<number[]>(
        selectedAppointmentId ? [parseInt(selectedAppointmentId)] : []
    );
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentReference, setPaymentReference] = useState('');
    const [notes, setNotes] = useState('');

    const selectedAppointmentsData = pendingAppointments.filter(apt => 
        selectedAppointments.includes(apt.id)
    );

    const totalAmount = selectedAppointmentsData.reduce((sum, apt) => sum + apt.price, 0);

    const handleAppointmentToggle = (appointmentId: number) => {
        setSelectedAppointments(prev => 
            prev.includes(appointmentId) 
                ? prev.filter(id => id !== appointmentId)
                : [...prev, appointmentId]
        );
    };

    const handleSelectAll = () => {
        if (selectedAppointments.length === pendingAppointments.length) {
            setSelectedAppointments([]);
        } else {
            setSelectedAppointments(pendingAppointments.map(apt => apt.id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        console.log('=== FORM SUBMISSION STARTED ===');
        console.log('Selected appointments:', selectedAppointments);
        console.log('Payment method:', paymentMethod);
        console.log('Payment reference:', paymentReference);
        console.log('Notes:', notes);
        
        if (selectedAppointments.length === 0) {
            alert('Please select at least one appointment.');
            return;
        }

        console.log('Submitting to: /admin/billing/create-from-appointments');
        router.post('/admin/billing/create-from-appointments', {
            appointment_ids: selectedAppointments,
            payment_method: paymentMethod,
            payment_reference: paymentReference,
            notes: notes,
        }, {
            onStart: () => console.log('Form submission started'),
            onSuccess: (page) => {
                console.log('Form submission successful:', page);
                // Check if we got redirected to billing index
                if (page.url.includes('/admin/billing') && !page.url.includes('create-from-appointments')) {
                    console.log('Redirected to billing index successfully');
                } else {
                    console.log('Still on create-from-appointments page');
                }
            },
            onError: (errors) => {
                console.error('Form submission failed:', errors);
                if (errors.error) {
                    alert('Error: ' + errors.error);
                } else {
                    alert('Error: Unknown error occurred');
                }
            },
            onFinish: () => console.log('Form submission finished')
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Transaction from Appointments" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-6">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/admin/billing">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Billing
                            </Link>
                        </Button>
                        <Heading 
                            title="Create Transaction from Appointments" 
                            description="Select appointments to create a billing transaction"
                            icon={CreditCard} 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Selected Appointments Summary */}
                    <div className="lg:col-span-1">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>
                                    Transaction Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Selected Appointments:</span>
                                    <span className="font-semibold">{selectedAppointments.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Total Amount:</span>
                                    <span className="text-lg font-bold text-green-600">₱{Number(totalAmount || 0).toFixed(2)}</span>
                                </div>
                                
                                {selectedAppointmentsData.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Selected Appointments:</Label>
                                        <div className="space-y-1 max-h-40 overflow-y-auto">
                                            {selectedAppointmentsData.map((appointment) => (
                                                <div key={appointment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium">{appointment.patient_name}</div>
                                                        <div className="text-xs text-gray-500">{appointment.appointment_type}</div>
                                                    </div>
                                                    <div className="text-sm font-semibold">₱{Number(appointment.price || 0).toFixed(2)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Payment Details Form */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Payment Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="payment_method">Payment Method</Label>
                                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select payment method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cash">Cash</SelectItem>
                                                    <SelectItem value="hmo">HMO</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="payment_reference">Payment Reference</Label>
                                            <Input
                                                id="payment_reference"
                                                value={paymentReference}
                                                onChange={(e) => setPaymentReference(e.target.value)}
                                                placeholder="Reference number (optional)"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Additional notes (optional)"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <Button 
                                            type="submit" 
                                            disabled={selectedAppointments.length === 0}
                                            onClick={() => console.log('Button clicked! Selected appointments:', selectedAppointments)}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Create Transaction
                                        </Button>
                                        <Button 
                                            type="button"
                                            variant="secondary"
                                            onClick={() => {
                                                console.log('TEST BUTTON CLICKED');
                                                console.log('Selected appointments:', selectedAppointments);
                                                router.post('/admin/billing/create-from-appointments', {
                                                    appointment_ids: selectedAppointments,
                                                    payment_method: paymentMethod,
                                                    payment_reference: paymentReference,
                                                    notes: notes,
                                                });
                                            }}
                                        >
                                            Test Submit
                                        </Button>
                                        <Button asChild variant="outline">
                                            <Link href="/admin/billing">Cancel</Link>
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Available Appointments */}
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Available Appointments
                                </CardTitle>
                                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                                    {selectedAppointments.length === pendingAppointments.length ? 'Deselect All' : 'Select All'}
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {pendingAppointments.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                        <h3 className="mb-2 text-lg font-semibold text-gray-600">No pending appointments</h3>
                                        <p className="text-gray-500">All appointments have been processed for billing</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {pendingAppointments.map((appointment) => (
                                            <div key={appointment.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                                <Checkbox
                                                    id={`appointment-${appointment.id}`}
                                                    checked={selectedAppointments.includes(appointment.id)}
                                                    onCheckedChange={() => handleAppointmentToggle(appointment.id)}
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium">{appointment.patient_name}</div>
                                                            <div className="text-sm text-gray-500">{appointment.patient_id}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-semibold">₱{Number(appointment.price || 0).toFixed(2)}</div>
                                                            <div className="text-sm text-gray-500">{appointment.appointment_type}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(appointment.appointment_date).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            {appointment.appointment_time}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <User className="h-4 w-4" />
                                                            {appointment.specialist_name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

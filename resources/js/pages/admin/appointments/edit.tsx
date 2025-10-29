import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import { 
    ArrowLeft, 
    Save,
    Calendar,
    User,
    Clock,
    Phone,
    CreditCard,
    FileText
} from 'lucide-react';

type Appointment = {
    id: number;
    patient_name: string;
    patient_id: string;
    contact_number: string;
    appointment_type: string;
    price: number;
    specialist_type: string;
    specialist_name: string;
    specialist_id: string;
    appointment_date: string;
    appointment_time: string;
    duration: string;
    status: string;
    billing_status: string;
    notes: string | null;
    special_requirements: string | null;
    created_at: string;
    updated_at: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Appointments', href: '/admin/appointments' },
    { title: 'All Appointments', href: '/admin/appointments' },
    { title: 'Edit Appointment', href: '/admin/appointments/edit' },
];

export default function AppointmentEdit({ 
    appointment 
}: { 
    appointment: Appointment;
}) {
    const { data, setData, put, processing, errors } = useForm({
        patient_name: appointment.patient_name,
        patient_id: appointment.patient_id,
        contact_number: appointment.contact_number,
        appointment_type: appointment.appointment_type,
        price: appointment.price,
        specialist_type: appointment.specialist_type,
        specialist_name: appointment.specialist_name,
        specialist_id: appointment.specialist_id,
        appointment_date: appointment.appointment_date ? 
            (appointment.appointment_date.includes('T') ? 
                appointment.appointment_date.split('T')[0] : 
                appointment.appointment_date) : '',
        appointment_time: appointment.appointment_time ? 
            (appointment.appointment_time.includes('T') ? 
                appointment.appointment_time.split('T')[1]?.substring(0, 5) : 
                appointment.appointment_time.substring(0, 5)) : '',
        duration: appointment.duration,
        status: appointment.status,
        notes: appointment.notes || '',
        special_requirements: appointment.special_requirements || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/appointments/${appointment.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Appointment ${appointment.id}`} />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button asChild variant="outline" className="h-12 w-12">
                                <Link href={`/admin/appointments/${appointment.id}`}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <Heading title={`Edit Appointment ${appointment.id}`} description="Update appointment details" icon={Calendar} />
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Patient Information */}
                            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                        <User className="h-5 w-5 text-black" />
                                        Patient Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="patient_name" className="text-sm font-medium text-gray-700">
                                                Patient Name *
                                            </Label>
                                            <Input
                                                id="patient_name"
                                                value={data.patient_name}
                                                onChange={(e) => setData('patient_name', e.target.value)}
                                                className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                                placeholder="Enter patient name"
                                            />
                                            {errors.patient_name && <p className="text-sm text-red-600">{errors.patient_name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="patient_id" className="text-sm font-medium text-gray-700">
                                                Patient ID *
                                            </Label>
                                            <Input
                                                id="patient_id"
                                                value={data.patient_id}
                                                onChange={(e) => setData('patient_id', e.target.value)}
                                                className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                                placeholder="Enter patient ID"
                                            />
                                            {errors.patient_id && <p className="text-sm text-red-600">{errors.patient_id}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact_number" className="text-sm font-medium text-gray-700">
                                            Contact Number
                                        </Label>
                                        <Input
                                            id="contact_number"
                                            value={data.contact_number}
                                            onChange={(e) => setData('contact_number', e.target.value)}
                                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                            placeholder="Enter contact number"
                                        />
                                        {errors.contact_number && <p className="text-sm text-red-600">{errors.contact_number}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Appointment Details */}
                            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                        <Calendar className="h-5 w-5 text-black" />
                                        Appointment Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="appointment_type" className="text-sm font-medium text-gray-700">
                                                Appointment Type *
                                            </Label>
                                            <Select
                                                value={data.appointment_type}
                                                onValueChange={(value) => setData('appointment_type', value)}
                                            >
                                                <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="consultation">Consultation</SelectItem>
                                                    <SelectItem value="checkup">Checkup</SelectItem>
                                                    <SelectItem value="fecalysis">Fecalysis</SelectItem>
                                                    <SelectItem value="cbc">CBC</SelectItem>
                                                    <SelectItem value="urinalysis">Urinalysis</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.appointment_type && <p className="text-sm text-red-600">{errors.appointment_type}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                                                Price *
                                            </Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.price}
                                                onChange={(e) => setData('price', parseFloat(e.target.value) || 0)}
                                                className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                                placeholder="Enter price"
                                            />
                                            {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="appointment_date" className="text-sm font-medium text-gray-700">
                                                Appointment Date *
                                            </Label>
                                            <Input
                                                id="appointment_date"
                                                type="date"
                                                value={data.appointment_date}
                                                onChange={(e) => setData('appointment_date', e.target.value)}
                                                className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                            />
                                            {errors.appointment_date && <p className="text-sm text-red-600">{errors.appointment_date}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="appointment_time" className="text-sm font-medium text-gray-700">
                                                Appointment Time *
                                            </Label>
                                            <Input
                                                id="appointment_time"
                                                type="time"
                                                value={data.appointment_time}
                                                onChange={(e) => setData('appointment_time', e.target.value)}
                                                className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                            />
                                            {errors.appointment_time && <p className="text-sm text-red-600">{errors.appointment_time}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                                                Duration
                                            </Label>
                                            <Input
                                                id="duration"
                                                value={data.duration}
                                                onChange={(e) => setData('duration', e.target.value)}
                                                className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                                placeholder="e.g., 30 min"
                                            />
                                            {errors.duration && <p className="text-sm text-red-600">{errors.duration}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                                                Status *
                                            </Label>
                                            <Select
                                                value={data.status}
                                                onValueChange={(value) => setData('status', value)}
                                            >
                                                <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Pending">Pending</SelectItem>
                                                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                                                    <SelectItem value="Completed">Completed</SelectItem>
                                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Specialist Information */}
                            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                        <User className="h-5 w-5 text-black" />
                                        Specialist Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="specialist_type" className="text-sm font-medium text-gray-700">
                                                Specialist Type *
                                            </Label>
                                            <Select
                                                value={data.specialist_type}
                                                onValueChange={(value) => setData('specialist_type', value)}
                                            >
                                                <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="doctor">Doctor</SelectItem>
                                                    <SelectItem value="medtech">Med Tech</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.specialist_type && <p className="text-sm text-red-600">{errors.specialist_type}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="specialist_id" className="text-sm font-medium text-gray-700">
                                                Specialist ID *
                                            </Label>
                                            <Input
                                                id="specialist_id"
                                                value={data.specialist_id}
                                                onChange={(e) => setData('specialist_id', e.target.value)}
                                                className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                                placeholder="Enter specialist ID"
                                            />
                                            {errors.specialist_id && <p className="text-sm text-red-600">{errors.specialist_id}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="specialist_name" className="text-sm font-medium text-gray-700">
                                            Specialist Name *
                                        </Label>
                                        <Input
                                            id="specialist_name"
                                            value={data.specialist_name}
                                            onChange={(e) => setData('specialist_name', e.target.value)}
                                            className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                            placeholder="Enter specialist name"
                                        />
                                        {errors.specialist_name && <p className="text-sm text-red-600">{errors.specialist_name}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Notes and Requirements */}
                            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                        <FileText className="h-5 w-5 text-black" />
                                        Additional Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                                            Notes
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                            placeholder="Enter any additional notes"
                                            rows={3}
                                        />
                                        {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="special_requirements" className="text-sm font-medium text-gray-700">
                                            Special Requirements
                                        </Label>
                                        <Textarea
                                            id="special_requirements"
                                            value={data.special_requirements}
                                            onChange={(e) => setData('special_requirements', e.target.value)}
                                            className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                            placeholder="Enter any special requirements"
                                            rows={3}
                                        />
                                        {errors.special_requirements && <p className="text-sm text-red-600">{errors.special_requirements}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Action Sidebar */}
                        <div className="space-y-6">
                            {/* Save Actions */}
                            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                        <Save className="h-5 w-5 text-black" />
                                        Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <Button 
                                        type="submit" 
                                        disabled={processing}
                                        className="w-full h-12"
                                    >
                                        <Save className="mr-2 h-5 w-5" />
                                        {processing ? 'Updating...' : 'Update Appointment'}
                                    </Button>
                                    
                                    <Button asChild variant="outline" className="w-full h-12">
                                        <Link href={`/admin/appointments/${appointment.id}`}>
                                            Cancel
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                        <Clock className="h-5 w-5 text-black" />
                                        Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {appointment.billing_status === 'pending' && (
                                        <Button asChild variant="outline" className="w-full h-12">
                                            <Link href={`/admin/billing/create-from-appointments?appointment_id=${appointment.id}`}>
                                                <CreditCard className="mr-2 h-5 w-5" />
                                                Process Payment
                                            </Link>
                                        </Button>
                                    )}
                                    
                                    <Button asChild variant="outline" className="w-full h-12">
                                        <Link href="/admin/appointments">
                                            <ArrowLeft className="mr-2 h-5 w-5" />
                                            Back to Appointments
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}



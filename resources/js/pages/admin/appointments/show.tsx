import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { safeFormatDate, safeFormatTime } from '@/utils/dateTime';
import { SafeAppointmentDisplay } from '@/components/SafeDateDisplay';
import { 
    ArrowLeft, 
    Edit,
    Calendar,
    User,
    Clock,
    Phone,
    CreditCard,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle
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
    { title: 'Appointment Details', href: '/admin/appointments/show' },
];

const statusConfig = {
    Pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
    Confirmed: { label: 'Confirmed', color: 'bg-green-500', icon: CheckCircle },
    Completed: { label: 'Completed', color: 'bg-blue-500', icon: CheckCircle },
    Cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
};

const billingStatusConfig = {
    pending: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800' },
    paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export default function AppointmentShow({ 
    appointment 
}: { 
    appointment: Appointment;
}) {
    console.log('Appointment data:', appointment);
    console.log('Billing status:', appointment.billing_status);
    console.log('Should show Process Payment button:', appointment.billing_status === 'pending');
    const getStatusBadge = (status: keyof typeof statusConfig) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        
        const variantMap = {
            Pending: 'warning',
            Confirmed: 'success',
            Completed: 'default',
            Cancelled: 'destructive'
        };
        
        return (
            <Badge variant={variantMap[status] as any}>
                <Icon className="mr-1 h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getBillingStatusBadge = (status: keyof typeof billingStatusConfig) => {
        const config = billingStatusConfig[status];
        return (
            <Badge className={config.color}>
                {config.label}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Appointment ${appointment.id}`} />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button asChild variant="outline" className="h-12 w-12">
                                <Link href="/admin/appointments">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <Heading title={`Appointment ${appointment.id}`} description="View appointment details" icon={Calendar} />
                        </div>
                        <div className="flex items-center gap-4">
                            <Button asChild variant="outline">
                                <Link href={`/admin/appointments/${appointment.id}/edit`}>
                                    <Edit className="mr-2 h-5 w-5" />
                                    Edit
                                </Link>
                            </Button>
                            {appointment.billing_status === 'pending' && (
                                <Button asChild>
                                    <Link href={`/admin/billing/create-from-appointments?appointment_id=${appointment.id}`}>
                                        <CreditCard className="mr-2 h-5 w-5" />
                                        Process Payment
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Appointment Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Patient Information */}
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                    <User className="h-5 w-5 text-black" />
                                    Patient Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Patient Name</label>
                                            <p className="text-lg font-semibold text-gray-900">{appointment.patient_name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Patient ID</label>
                                            <p className="text-lg font-semibold text-gray-900">{appointment.patient_id}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Contact Number</label>
                                        <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            {appointment.contact_number}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Appointment Information */}
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                    <Calendar className="h-5 w-5 text-black" />
                                    Appointment Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Appointment Type</label>
                                            <p className="text-lg font-semibold text-gray-900">{appointment.appointment_type}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Price</label>
                                            <p className="text-lg font-semibold text-gray-900">
                                                ₱{(appointment.final_total_amount || appointment.price || 0).toLocaleString()}
                                                {appointment.total_lab_amount > 0 && (
                                                    <span className="text-sm text-green-600 ml-2">
                                                        (+₱{appointment.total_lab_amount.toLocaleString()} lab)
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Date</label>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {safeFormatDate(appointment.appointment_date)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Time</label>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {safeFormatTime(appointment.appointment_time)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Duration</label>
                                            <p className="text-lg font-semibold text-gray-900">{appointment.duration}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Status</label>
                                            <div className="mt-1">
                                                {getStatusBadge(appointment.status as keyof typeof statusConfig)}
                                            </div>
                                        </div>
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
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Specialist Type</label>
                                            <p className="text-lg font-semibold text-gray-900 capitalize">{appointment.specialist_type}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Specialist ID</label>
                                            <p className="text-lg font-semibold text-gray-900">{appointment.specialist_id}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Specialist Name</label>
                                        <p className="text-lg font-semibold text-gray-900">{appointment.specialist_name}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes and Requirements */}
                        {(appointment.notes || appointment.special_requirements) && (
                            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                        <FileText className="h-5 w-5 text-black" />
                                        Additional Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {appointment.notes && (
                                        <div className="mb-4">
                                            <label className="text-sm font-medium text-gray-500">Notes</label>
                                            <p className="text-gray-900 mt-1">{appointment.notes}</p>
                                        </div>
                                    )}
                                    {appointment.special_requirements && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Special Requirements</label>
                                            <p className="text-gray-900 mt-1">{appointment.special_requirements}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Status and Actions */}
                    <div className="space-y-6">
                        {/* Appointment Status */}
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                    <Clock className="h-5 w-5 text-black" />
                                    Appointment Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Status:</span>
                                        {getStatusBadge(appointment.status as keyof typeof statusConfig)}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Billing Status:</span>
                                        {getBillingStatusBadge(appointment.billing_status as keyof typeof billingStatusConfig)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Appointment Dates */}
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                    <Calendar className="h-5 w-5 text-black" />
                                    Important Dates
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <SafeAppointmentDisplay 
                                    appointment={appointment}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

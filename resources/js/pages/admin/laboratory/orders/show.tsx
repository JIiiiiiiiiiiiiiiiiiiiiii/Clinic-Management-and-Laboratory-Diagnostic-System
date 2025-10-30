import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Calendar, 
    Clock, 
    User, 
    TestTube, 
    FileText, 
    Download, 
    Edit, 
    CheckCircle, 
    AlertCircle, 
    PlayCircle,
    PauseCircle,
    XCircle,
    UserCheck,
    Phone,
    Mail,
    MapPin,
    Hash,
    Activity
} from 'lucide-react';

type LabOrder = {
    id: number;
    status: string;
    notes?: string;
    created_at: string;
    updated_at: string;
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
    lab_tests: Array<{
        id: number;
        name: string;
        code: string;
    }>;
    results: Array<{
        id: number;
        test: {
            id: number;
            name: string;
            code: string;
        };
        values: Array<{
            id: number;
            field_name: string;
            value: string;
            unit?: string;
        }>;
        status: string;
        created_at: string;
        updated_at: string;
    }>;
    ordered_by?: {
        id: number;
        name: string;
    };
};

type LabOrderShowProps = {
    order: LabOrder;
};

export default function LabOrderShow({ order }: LabOrderShowProps): React.ReactElement {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Laboratory', href: '/admin/laboratory' },
        { title: 'Lab Orders', href: '/admin/laboratory/orders' },
        { title: `Order #${order.id}`, href: `/admin/laboratory/orders/${order.id}` },
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ordered':
                return <AlertCircle className="h-4 w-4" />;
            case 'processing':
                return <PlayCircle className="h-4 w-4" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4" />;
            default:
                return <PauseCircle className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        return 'bg-green-100 text-green-800 border-green-200';
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Lab Order #${order.id}`} />
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-12 w-12 rounded-xl border-gray-300 hover:bg-gray-50"
                                onClick={() => router.visit('/admin/laboratory/orders')}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-4xl font-bold text-black mb-2">Lab Order #{order.id}</h1>
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
                            <Button variant="outline" onClick={() => router.visit(`/admin/laboratory/orders/${order.id}/results`)} className="bg-green-600 hover:bg-green-700 text-white">
                                <Edit className="mr-2 h-4 w-4" />
                                Enter Results
                            </Button>
                            <Button variant="outline" onClick={() => window.open(`/admin/laboratory/orders/${order.id}/report`, '_blank')} className="bg-green-600 hover:bg-green-700 text-white">
                                <FileText className="mr-2 h-4 w-4" />
                                Generate Report
                            </Button>
                            <Button variant="outline" onClick={() => window.open(`/admin/laboratory/orders/${order.id}/export.xlsx`, '_blank')} className="bg-green-600 hover:bg-green-700 text-white">
                                <Download className="mr-2 h-4 w-4" />
                                Export Excel
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column - Patient Information */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <User className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Patient Information</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">Patient details and contact information</p>
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
                                    
                                    {order.patient.present_address && (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                            <span className="text-sm text-gray-700">{order.patient.present_address}</span>
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
                                        <p className="text-sm text-gray-500 mt-1">Order information and timeline</p>
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
                                    
                                    {order.ordered_by && (
                                        <div className="flex items-center gap-3">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Ordered By</p>
                                                <p className="text-sm text-gray-600">{order.ordered_by.name}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Last Updated</p>
                                            <p className="text-sm text-gray-600">{formatDate(order.updated_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Tests and Results */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Requested Tests */}
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <TestTube className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Requested Tests</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">Laboratory tests ordered for this patient</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-black border-gray-200">
                                    {order.lab_tests.length} test{order.lab_tests.length !== 1 ? 's' : ''}
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {order.lab_tests.map((test) => (
                                        <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                            <div className="flex items-center gap-3">
                                                <TestTube className="h-5 w-5 text-black" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{test.name}</p>
                                                    <p className="text-sm text-gray-600">Code: {test.code}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-gray-600 border-gray-200">
                                                Requested
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Test Results */}
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Activity className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Test Results</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">Laboratory test results and values</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-black border-gray-200">
                                    {order.results.length} result{order.results.length !== 1 ? 's' : ''}
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-6">
                                {order.results.length > 0 ? (
                                    <div className="space-y-6">
                                        {order.results.map((result) => (
                                            <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <TestTube className="h-5 w-5 text-black" />
                                                        <div>
                                                            <p className="font-medium text-gray-900">{result.test.name}</p>
                                                            <p className="text-sm text-gray-600">Code: {result.test.code}</p>
                                                        </div>
                                                    </div>
                                                    <Badge className={`${getStatusColor(result.status)} border`}>
                                                        {getStatusIcon(result.status)}
                                                        <span className="ml-2 capitalize">{result.status}</span>
                                                    </Badge>
                                                </div>
                                                
                                                {result.values.length > 0 ? (
                                                    <div className="grid gap-3 md:grid-cols-2">
                                                        {result.values.map((value) => (
                                                            <div key={value.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                <div>
                                                                    <p className="font-medium text-gray-900">{value.field_name}</p>
                                                                    <p className="text-sm text-gray-600">
                                                                        {value.value} {value.unit && `(${value.unit})`}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                        <p className="text-gray-500">No results entered yet</p>
                                                        <p className="text-sm text-gray-400">Results will appear here once entered</p>
                                                    </div>
                                                )}
                                                
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                                        <span>Last updated: {formatDate(result.updated_at)}</span>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => router.visit(`/admin/laboratory/orders/${order.id}/results`)}
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit Results
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <TestTube className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-lg font-medium text-gray-900 mb-2">No results available</p>
                                        <p className="text-gray-500 mb-6">Test results will appear here once they are entered</p>
                                        <Button onClick={() => router.visit(`/admin/laboratory/orders/${order.id}/results`)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Enter Results
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Notes Section */}
                        {order.notes && (
                            <Card className="shadow-lg">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <FileText className="h-6 w-6 text-black" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-gray-900">Order Notes</CardTitle>
                                            <p className="text-sm text-gray-500 mt-1">Additional information for this order</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-700">{order.notes}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}



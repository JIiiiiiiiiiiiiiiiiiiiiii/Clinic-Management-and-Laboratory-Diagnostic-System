import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Calendar, Edit, Mail, MapPin, Phone, User, Save, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Patient Dashboard', href: '/patient/dashboard' },
    { title: 'Profile', href: '/patient/profile' },
];

interface PatientProfileProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        phone?: string;
        created_at: string;
    };
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        middle_name?: string;
        patient_no: string;
        birthdate: string;
        age: number;
        sex: string;
        occupation?: string;
        religion?: string;
        civil_status?: string;
        nationality?: string;
        present_address?: string;
        telephone_no?: string;
        mobile_no?: string;
        informant_name?: string;
        relationship?: string;
        company_name?: string;
        hmo_name?: string;
        hmo_company_id_no?: string;
        drug_allergies?: string;
        food_allergies?: string;
        past_medical_history?: string;
        family_history?: string;
        social_personal_history?: string;
        obstetrics_gynecology_history?: string;
    };
}

export default function PatientProfile({ user, patient }: PatientProfileProps) {
    const [isEditing, setIsEditing] = useState(false);
    
    const { data, setData, put, processing, errors, reset } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('patient.profile.update'), {
            onSuccess: () => {
                setIsEditing(false);
            },
        });
    };

    const handleCancel = () => {
        reset();
        setIsEditing(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile" />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-black">My Profile</h1>
                    <p className="text-gray-500">Manage your personal information and account settings</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Account Information */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5 text-blue-600" />
                                            Account Information
                                        </CardTitle>
                                        <CardDescription>
                                            Update your account details and contact information
                                        </CardDescription>
                                    </div>
                                    {!isEditing && (
                                        <Button
                                            onClick={() => setIsEditing(true)}
                                            variant="outline"
                                            className="flex items-center gap-2"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Edit Profile
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isEditing ? (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    className={errors.name ? 'border-red-500' : ''}
                                                />
                                                {errors.name && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="email">Email Address</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    className={errors.email ? 'border-red-500' : ''}
                                                />
                                                {errors.email && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className={errors.phone ? 'border-red-500' : ''}
                                            />
                                            {errors.phone && (
                                                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="flex items-center gap-2"
                                            >
                                                <Save className="h-4 w-4" />
                                                Save Changes
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCancel}
                                                className="flex items-center gap-2"
                                            >
                                                <X className="h-4 w-4" />
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3">
                                                <User className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Full Name</p>
                                                    <p className="font-semibold">{user.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Mail className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Email</p>
                                                    <p className="font-semibold">{user.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-600">Phone</p>
                                                <p className="font-semibold">{user.phone || 'Not provided'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-600">Member Since</p>
                                                <p className="font-semibold">
                                                    {new Date(user.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Patient Information */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-green-600" />
                                    Patient Information
                                </CardTitle>
                                <CardDescription>
                                    Your medical record details
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {patient ? (
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Patient Number</p>
                                            <p className="font-semibold text-lg">{patient.patient_no}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Full Name</p>
                                            <p className="font-semibold">
                                                {patient.first_name} {patient.middle_name} {patient.last_name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Date of Birth</p>
                                            <p className="font-semibold">
                                                {new Date(patient.birthdate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Age</p>
                                            <p className="font-semibold">{patient.age} years old</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Sex</p>
                                            <p className="font-semibold">{patient.sex}</p>
                                        </div>
                                        {patient.mobile_no && (
                                            <div>
                                                <p className="text-sm text-gray-600">Mobile Number</p>
                                                <p className="font-semibold">{patient.mobile_no}</p>
                                            </div>
                                        )}
                                        {patient.present_address && (
                                            <div>
                                                <p className="text-sm text-gray-600">Address</p>
                                                <p className="font-semibold">{patient.present_address}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            No Patient Record Found
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Your user account is not linked to a patient record yet.
                                        </p>
                                        <Button variant="outline" className="w-full">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            Contact Clinic
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Medical Information */}
                        {patient && (
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-red-600" />
                                        Medical Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {patient.drug_allergies && (
                                            <div>
                                                <p className="text-sm text-gray-600">Drug Allergies</p>
                                                <p className="font-semibold text-red-600">{patient.drug_allergies}</p>
                                            </div>
                                        )}
                                        {patient.food_allergies && (
                                            <div>
                                                <p className="text-sm text-gray-600">Food Allergies</p>
                                                <p className="font-semibold text-red-600">{patient.food_allergies}</p>
                                            </div>
                                        )}
                                        {patient.past_medical_history && (
                                            <div>
                                                <p className="text-sm text-gray-600">Medical History</p>
                                                <p className="font-semibold">{patient.past_medical_history}</p>
                                            </div>
                                        )}
                                        {patient.family_history && (
                                            <div>
                                                <p className="text-sm text-gray-600">Family History</p>
                                                <p className="font-semibold">{patient.family_history}</p>
                                            </div>
                                        )}
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

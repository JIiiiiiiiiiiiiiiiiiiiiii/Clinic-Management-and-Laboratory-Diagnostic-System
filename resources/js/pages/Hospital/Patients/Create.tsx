import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, User } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { title: 'Patients', href: route('hospital.patients.index') },
    { title: 'Add Patient', href: route('hospital.patients.create') },
];

export default function CreatePatient() {
    const { data, setData, post, processing, errors } = useForm({
        // Basic Information
        first_name: '',
        last_name: '',
        middle_name: '',
        date_of_birth: '',
        gender: 'male',

        // Contact Information
        contact_number: '',
        email: '',
        address: '',

        // Emergency Contact
        emergency_contact_name: '',
        emergency_contact_number: '',

        // Medical Information
        medical_history: '',
        allergies: '',
        current_medications: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('hospital.patients.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Patient - Hospital" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Add New Patient</h1>
                        <p className="text-muted-foreground">Register a new patient in the hospital system</p>
                    </div>
                    <Button variant="outline" asChild>
                        <a href={route('hospital.patients.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Patients
                        </a>
                    </Button>
                </div>

                {/* Patient Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                            <TabsTrigger value="contact">Contact</TabsTrigger>
                            <TabsTrigger value="emergency">Emergency</TabsTrigger>
                            <TabsTrigger value="medical">Medical</TabsTrigger>
                        </TabsList>

                        {/* Basic Information Tab */}
                        <TabsContent value="basic" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <User className="h-5 w-5" />
                                        <span>Basic Information</span>
                                    </CardTitle>
                                    <CardDescription>Enter the patient's basic personal information</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name">First Name *</Label>
                                            <Input
                                                id="first_name"
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value)}
                                                className={errors.first_name ? 'border-red-500' : ''}
                                            />
                                            {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="last_name">Last Name *</Label>
                                            <Input
                                                id="last_name"
                                                value={data.last_name}
                                                onChange={(e) => setData('last_name', e.target.value)}
                                                className={errors.last_name ? 'border-red-500' : ''}
                                            />
                                            {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="middle_name">Middle Name</Label>
                                            <Input
                                                id="middle_name"
                                                value={data.middle_name}
                                                onChange={(e) => setData('middle_name', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="date_of_birth">Date of Birth *</Label>
                                            <Input
                                                id="date_of_birth"
                                                type="date"
                                                value={data.date_of_birth}
                                                onChange={(e) => setData('date_of_birth', e.target.value)}
                                                className={errors.date_of_birth ? 'border-red-500' : ''}
                                            />
                                            {errors.date_of_birth && <p className="text-sm text-red-500">{errors.date_of_birth}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gender">Gender *</Label>
                                            <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                                                <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Contact Information Tab */}
                        <TabsContent value="contact" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                    <CardDescription>Patient's contact details and address</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="contact_number">Contact Number</Label>
                                            <Input
                                                id="contact_number"
                                                value={data.contact_number}
                                                onChange={(e) => setData('contact_number', e.target.value)}
                                                className={errors.contact_number ? 'border-red-500' : ''}
                                            />
                                            {errors.contact_number && <p className="text-sm text-red-500">{errors.contact_number}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className={errors.email ? 'border-red-500' : ''}
                                            />
                                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Textarea
                                            id="address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            className={errors.address ? 'border-red-500' : ''}
                                            rows={3}
                                        />
                                        {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Emergency Contact Tab */}
                        <TabsContent value="emergency" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Emergency Contact</CardTitle>
                                    <CardDescription>Information for emergency contact person</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                                            <Input
                                                id="emergency_contact_name"
                                                value={data.emergency_contact_name}
                                                onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                                className={errors.emergency_contact_name ? 'border-red-500' : ''}
                                            />
                                            {errors.emergency_contact_name && <p className="text-sm text-red-500">{errors.emergency_contact_name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="emergency_contact_number">Emergency Contact Number</Label>
                                            <Input
                                                id="emergency_contact_number"
                                                value={data.emergency_contact_number}
                                                onChange={(e) => setData('emergency_contact_number', e.target.value)}
                                                className={errors.emergency_contact_number ? 'border-red-500' : ''}
                                            />
                                            {errors.emergency_contact_number && (
                                                <p className="text-sm text-red-500">{errors.emergency_contact_number}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Medical Information Tab */}
                        <TabsContent value="medical" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Medical Information</CardTitle>
                                    <CardDescription>Patient's medical history and current conditions</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="medical_history">Medical History</Label>
                                        <Textarea
                                            id="medical_history"
                                            value={data.medical_history}
                                            onChange={(e) => setData('medical_history', e.target.value)}
                                            className={errors.medical_history ? 'border-red-500' : ''}
                                            rows={4}
                                            placeholder="Enter any relevant medical history..."
                                        />
                                        {errors.medical_history && <p className="text-sm text-red-500">{errors.medical_history}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="allergies">Allergies</Label>
                                        <Textarea
                                            id="allergies"
                                            value={data.allergies}
                                            onChange={(e) => setData('allergies', e.target.value)}
                                            className={errors.allergies ? 'border-red-500' : ''}
                                            rows={3}
                                            placeholder="List any known allergies..."
                                        />
                                        {errors.allergies && <p className="text-sm text-red-500">{errors.allergies}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="current_medications">Current Medications</Label>
                                        <Textarea
                                            id="current_medications"
                                            value={data.current_medications}
                                            onChange={(e) => setData('current_medications', e.target.value)}
                                            className={errors.current_medications ? 'border-red-500' : ''}
                                            rows={3}
                                            placeholder="List current medications..."
                                        />
                                        {errors.current_medications && <p className="text-sm text-red-500">{errors.current_medications}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" asChild>
                            <a href={route('hospital.patients.index')}>Cancel</a>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Creating...' : 'Create Patient'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

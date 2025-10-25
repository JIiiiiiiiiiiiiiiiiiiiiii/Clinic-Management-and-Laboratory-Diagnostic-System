import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    ArrowLeft, Save, ArrowRight, User, MapPin, Phone, Heart, 
    Shield, FileText, Activity, Stethoscope, Plus, CheckCircle, 
    AlertCircle, Building, CreditCard, History, Users, Clock, 
    Mail, GraduationCap, Home, Briefcase, Globe, UserCheck, 
    Zap, ChevronRight, ChevronLeft, UserPlus, ClipboardList, 
    FileText as FileTextIcon, TrendingUp, BarChart3, PieChart, 
    LineChart, Calendar, CalendarDays, ChevronDown
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patient Management',
        href: '/admin/patient',
    },
    {
        title: 'Patient Transfer',
        href: '/admin/patient-transfers',
    },
    {
        title: 'Add Patient',
        href: '/admin/patient-transfers/create',
    },
];

interface Props {
    registrationType: 'admin' | 'hospital';
    userRole: string;
}

export default function CreatePatientTransfer({ registrationType, userRole }: Props) {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 6;

    const { data, setData, processing, errors, post } = useForm({
        // Patient Identification
        last_name: '',
        first_name: '',
        middle_name: '',
        birthdate: '',
        age: 0,
        sex: 'male',

        // Demographics
        occupation: '',
        religion: '',
        civil_status: 'single',
        nationality: 'Filipino',

        // Contact Information
        present_address: '',
        telephone_no: '',
        mobile_no: '',

        // Emergency Contact
        informant_name: '',
        relationship: '',

        // Financial/Insurance
        company_name: '',
        hmo_name: '',
        hmo_company_id_no: '',
        validation_approval_code: '',
        validity: '',

        // Medical History & Allergies
        drug_allergies: 'NONE',
        food_allergies: 'NONE',
        past_medical_history: '',
        family_history: '',
        social_personal_history: '',
        obstetrics_gynecology_history: '',

        // Transfer Information
        reason_for_transfer: '',
    });

    const steps = [
        { id: 1, title: 'Patient Information', description: 'Basic patient details' },
        { id: 2, title: 'Contact Details', description: 'Address and contact information' },
        { id: 3, title: 'Emergency Contact', description: 'Emergency contact information' },
        { id: 4, title: 'Insurance & Financial', description: 'Insurance and financial details' },
        { id: 5, title: 'Medical History', description: 'Medical history and allergies' },
        { id: 6, title: 'Transfer Details', description: 'Reason for transfer' },
    ];

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.patient.transfer.registrations.store'));
    };

    const renderStep = (step: number) => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="last_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Last Name *
                                </Label>
                                <Input
                                    id="last_name"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    className="mt-1"
                                    required
                                />
                                {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
                            </div>
                            <div>
                                <Label htmlFor="first_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    First Name *
                                </Label>
                                <Input
                                    id="first_name"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    className="mt-1"
                                    required
                                />
                                {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="middle_name" className="text-sm font-semibold text-gray-700">Middle Name</Label>
                                <Input
                                    id="middle_name"
                                    value={data.middle_name}
                                    onChange={(e) => setData('middle_name', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="birthdate" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Date of Birth *
                                </Label>
                                <Input
                                    id="birthdate"
                                    type="date"
                                    value={data.birthdate}
                                    onChange={(e) => setData('birthdate', e.target.value)}
                                    className="mt-1"
                                    required
                                />
                                {errors.birthdate && <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="age" className="text-sm font-semibold text-gray-700">Age *</Label>
                                <Input
                                    id="age"
                                    type="number"
                                    value={data.age}
                                    onChange={(e) => setData('age', parseInt(e.target.value) || 0)}
                                    className="mt-1"
                                    required
                                />
                                {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                            </div>
                            <div>
                                <Label htmlFor="sex" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Heart className="h-4 w-4" />
                                    Sex *
                                </Label>
                                <Select value={data.sex} onValueChange={(value: 'male' | 'female') => setData('sex', value)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.sex && <p className="text-red-500 text-sm mt-1">{errors.sex}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="civil_status" className="text-sm font-semibold text-gray-700">Civil Status *</Label>
                                <Select value={data.civil_status} onValueChange={(value: 'single' | 'married' | 'widowed' | 'divorced' | 'separated') => setData('civil_status', value)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="single">Single</SelectItem>
                                        <SelectItem value="married">Married</SelectItem>
                                        <SelectItem value="widowed">Widowed</SelectItem>
                                        <SelectItem value="divorced">Divorced</SelectItem>
                                        <SelectItem value="separated">Separated</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.civil_status && <p className="text-red-500 text-sm mt-1">{errors.civil_status}</p>}
                            </div>
                            <div>
                                <Label htmlFor="nationality" className="text-sm font-semibold text-gray-700">Nationality</Label>
                                <Input
                                    id="nationality"
                                    value={data.nationality}
                                    onChange={(e) => setData('nationality', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="present_address" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Present Address *
                            </Label>
                            <Textarea
                                id="present_address"
                                value={data.present_address}
                                onChange={(e) => setData('present_address', e.target.value)}
                                className="mt-1"
                                rows={3}
                                required
                            />
                            {errors.present_address && <p className="text-red-500 text-sm mt-1">{errors.present_address}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="telephone_no" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Telephone Number
                                </Label>
                                <Input
                                    id="telephone_no"
                                    value={data.telephone_no}
                                    onChange={(e) => setData('telephone_no', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="mobile_no" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Mobile Number *
                                </Label>
                                <Input
                                    id="mobile_no"
                                    value={data.mobile_no}
                                    onChange={(e) => setData('mobile_no', e.target.value)}
                                    className="mt-1"
                                    required
                                />
                                {errors.mobile_no && <p className="text-red-500 text-sm mt-1">{errors.mobile_no}</p>}
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="informant_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Emergency Contact Name
                                </Label>
                                <Input
                                    id="informant_name"
                                    value={data.informant_name}
                                    onChange={(e) => setData('informant_name', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="relationship" className="text-sm font-semibold text-gray-700">Relationship</Label>
                                <Input
                                    id="relationship"
                                    value={data.relationship}
                                    onChange={(e) => setData('relationship', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="company_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Building className="h-4 w-4" />
                                    Company Name
                                </Label>
                                <Input
                                    id="company_name"
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="hmo_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    HMO Name
                                </Label>
                                <Input
                                    id="hmo_name"
                                    value={data.hmo_name}
                                    onChange={(e) => setData('hmo_name', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="hmo_company_id_no" className="text-sm font-semibold text-gray-700">HMO ID Number</Label>
                                <Input
                                    id="hmo_company_id_no"
                                    value={data.hmo_company_id_no}
                                    onChange={(e) => setData('hmo_company_id_no', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="validation_approval_code" className="text-sm font-semibold text-gray-700">Approval Code</Label>
                                <Input
                                    id="validation_approval_code"
                                    value={data.validation_approval_code}
                                    onChange={(e) => setData('validation_approval_code', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="drug_allergies" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    Drug Allergies
                                </Label>
                                <Input
                                    id="drug_allergies"
                                    value={data.drug_allergies}
                                    onChange={(e) => setData('drug_allergies', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="food_allergies" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    Food Allergies
                                </Label>
                                <Input
                                    id="food_allergies"
                                    value={data.food_allergies}
                                    onChange={(e) => setData('food_allergies', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="past_medical_history" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Past Medical History
                            </Label>
                            <Textarea
                                id="past_medical_history"
                                value={data.past_medical_history}
                                onChange={(e) => setData('past_medical_history', e.target.value)}
                                className="mt-1"
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label htmlFor="family_history" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Family History
                            </Label>
                            <Textarea
                                id="family_history"
                                value={data.family_history}
                                onChange={(e) => setData('family_history', e.target.value)}
                                className="mt-1"
                                rows={3}
                            />
                        </div>
                    </div>
                );

            case 6:
                return (
                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="reason_for_transfer" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Reason for Transfer *
                            </Label>
                            <Textarea
                                id="reason_for_transfer"
                                value={data.reason_for_transfer}
                                onChange={(e) => setData('reason_for_transfer', e.target.value)}
                                className="mt-1"
                                rows={4}
                                placeholder="Please provide a detailed reason for this patient transfer..."
                                required
                            />
                            {errors.reason_for_transfer && <p className="text-red-500 text-sm mt-1">{errors.reason_for_transfer}</p>}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register New Patient" />
            <div className="min-h-screen bg-gray-50">

                <div className="p-6">
                    {/* Progress Stepper */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                {steps.map((step, index) => (
                                    <div key={step.id} className="flex items-center">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                            currentStep >= step.id 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {currentStep > step.id ? (
                                                <CheckCircle className="h-5 w-5" />
                                            ) : (
                                                <span className="text-sm font-medium">{step.id}</span>
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <p className={`text-sm font-medium ${
                                                currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                                            }`}>
                                                {step.title}
                                            </p>
                                            <p className="text-xs text-gray-500">{step.description}</p>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className={`w-16 h-0.5 mx-4 ${
                                                currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                                            }`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                {steps[currentStep - 1].title}
                            </CardTitle>
                            <CardDescription>
                                {steps[currentStep - 1].description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit}>
                                {renderStep(currentStep)}
                                
                                <Separator className="my-6" />
                                
                                <div className="flex justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={prevStep}
                                        disabled={currentStep === 1}
                                    >
                                        <ChevronLeft className="mr-2 h-4 w-4" />
                                        Previous
                                    </Button>
                                    
                                    {currentStep < totalSteps ? (
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                        >
                                            Next
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {processing ? (
                                                <>
                                                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Submit Registration
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
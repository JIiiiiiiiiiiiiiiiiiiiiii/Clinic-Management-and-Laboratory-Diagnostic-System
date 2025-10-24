import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, ArrowRight } from 'lucide-react';

interface Props {
    registrationType: 'admin' | 'hospital';
    userRole: string;
}

export default function CreatePatientTransfer({ registrationType, userRole }: Props) {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5;

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
    });

    // Compute age from birthdate
    const onBirthdateChange = (value: string) => {
        setData('birthdate', value);
        if (value) {
            const today = new Date();
            const birthDate = new Date(value);
            const age = today.getFullYear() - birthDate.getFullYear();
            setData('age', age);
        }
    };

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

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold">Patient Identification</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="last_name">Last Name *</Label>
                                <Input
                                    id="last_name"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    className={errors.last_name ? 'border-red-500' : ''}
                                />
                                {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name}</p>}
                            </div>
                            <div>
                                <Label htmlFor="first_name">First Name *</Label>
                                <Input
                                    id="first_name"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    className={errors.first_name ? 'border-red-500' : ''}
                                />
                                {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name}</p>}
                            </div>
                            <div>
                                <Label htmlFor="middle_name">Middle Name</Label>
                                <Input
                                    id="middle_name"
                                    value={data.middle_name}
                                    onChange={(e) => setData('middle_name', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="birthdate">Birthdate *</Label>
                                <Input
                                    id="birthdate"
                                    type="date"
                                    value={data.birthdate}
                                    onChange={(e) => onBirthdateChange(e.target.value)}
                                    className={errors.birthdate ? 'border-red-500' : ''}
                                />
                                {errors.birthdate && <p className="text-red-500 text-sm">{errors.birthdate}</p>}
                            </div>
                            <div>
                                <Label htmlFor="age">Age *</Label>
                                <Input
                                    id="age"
                                    type="number"
                                    value={data.age}
                                    onChange={(e) => setData('age', parseInt(e.target.value))}
                                    className={errors.age ? 'border-red-500' : ''}
                                />
                                {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
                            </div>
                            <div>
                                <Label htmlFor="sex">Sex *</Label>
                                <Select value={data.sex} onValueChange={(value) => setData('sex', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.sex && <p className="text-red-500 text-sm">{errors.sex}</p>}
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold">Demographics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="occupation">Occupation</Label>
                                <Input
                                    id="occupation"
                                    value={data.occupation}
                                    onChange={(e) => setData('occupation', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="religion">Religion</Label>
                                <Input
                                    id="religion"
                                    value={data.religion}
                                    onChange={(e) => setData('religion', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="civil_status">Civil Status *</Label>
                                <Select value={data.civil_status} onValueChange={(value) => setData('civil_status', value)}>
                                    <SelectTrigger>
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
                                {errors.civil_status && <p className="text-red-500 text-sm">{errors.civil_status}</p>}
                            </div>
                            <div>
                                <Label htmlFor="nationality">Nationality</Label>
                                <Input
                                    id="nationality"
                                    value={data.nationality}
                                    onChange={(e) => setData('nationality', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label htmlFor="present_address">Present Address *</Label>
                                <Textarea
                                    id="present_address"
                                    value={data.present_address}
                                    onChange={(e) => setData('present_address', e.target.value)}
                                    className={errors.present_address ? 'border-red-500' : ''}
                                />
                                {errors.present_address && <p className="text-red-500 text-sm">{errors.present_address}</p>}
                            </div>
                            <div>
                                <Label htmlFor="telephone_no">Telephone Number</Label>
                                <Input
                                    id="telephone_no"
                                    value={data.telephone_no}
                                    onChange={(e) => setData('telephone_no', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="mobile_no">Mobile Number *</Label>
                                <Input
                                    id="mobile_no"
                                    value={data.mobile_no}
                                    onChange={(e) => setData('mobile_no', e.target.value)}
                                    className={errors.mobile_no ? 'border-red-500' : ''}
                                />
                                {errors.mobile_no && <p className="text-red-500 text-sm">{errors.mobile_no}</p>}
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold">Emergency Contact & Insurance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="informant_name">Emergency Contact Name</Label>
                                <Input
                                    id="informant_name"
                                    value={data.informant_name}
                                    onChange={(e) => setData('informant_name', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="relationship">Relationship</Label>
                                <Input
                                    id="relationship"
                                    value={data.relationship}
                                    onChange={(e) => setData('relationship', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="company_name">Company Name</Label>
                                <Input
                                    id="company_name"
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="hmo_name">HMO Name</Label>
                                <Input
                                    id="hmo_name"
                                    value={data.hmo_name}
                                    onChange={(e) => setData('hmo_name', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="hmo_company_id_no">HMO Company ID No.</Label>
                                <Input
                                    id="hmo_company_id_no"
                                    value={data.hmo_company_id_no}
                                    onChange={(e) => setData('hmo_company_id_no', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="validation_approval_code">Validation/Approval Code</Label>
                                <Input
                                    id="validation_approval_code"
                                    value={data.validation_approval_code}
                                    onChange={(e) => setData('validation_approval_code', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold">Medical History & Allergies</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label htmlFor="drug_allergies">Drug Allergies</Label>
                                <Textarea
                                    id="drug_allergies"
                                    value={data.drug_allergies}
                                    onChange={(e) => setData('drug_allergies', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="food_allergies">Food Allergies</Label>
                                <Textarea
                                    id="food_allergies"
                                    value={data.food_allergies}
                                    onChange={(e) => setData('food_allergies', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="past_medical_history">Past Medical History</Label>
                                <Textarea
                                    id="past_medical_history"
                                    value={data.past_medical_history}
                                    onChange={(e) => setData('past_medical_history', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="family_history">Family History</Label>
                                <Textarea
                                    id="family_history"
                                    value={data.family_history}
                                    onChange={(e) => setData('family_history', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="social_personal_history">Social/Personal History</Label>
                                <Textarea
                                    id="social_personal_history"
                                    value={data.social_personal_history}
                                    onChange={(e) => setData('social_personal_history', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="obstetrics_gynecology_history">Obstetrics/Gynecology History</Label>
                                <Textarea
                                    id="obstetrics_gynecology_history"
                                    value={data.obstetrics_gynecology_history}
                                    onChange={(e) => setData('obstetrics_gynecology_history', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <AppLayout
            title="Register New Patient"
            renderHeader={() => (
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Register New Patient</h2>
                        <p className="text-sm text-gray-600">
                            {registrationType === 'admin' 
                                ? 'Register patient for admin approval' 
                                : 'Register patient for hospital approval'
                            }
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                </div>
            )}
        >
            <Head title="Register New Patient" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Patient Registration Form</CardTitle>
                            <CardDescription>
                                Step {currentStep} of {totalSteps} - Complete all required fields
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit}>
                                {renderStep()}
                                
                                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                                    <div className="flex items-center gap-3">
                                        {currentStep > 1 && (
                                            <Button
                                                type="button"
                                                onClick={prevStep}
                                                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 h-12 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-lg font-semibold"
                                            >
                                                <ArrowLeft className="mr-2 h-5 w-5" />
                                                Previous Step
                                            </Button>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {currentStep < totalSteps ? (
                                            <Button
                                                type="button"
                                                onClick={nextStep}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 h-12 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-lg font-semibold"
                                            >
                                                Next Step
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        ) : (
                                            <Button 
                                                disabled={processing} 
                                                type="submit"
                                                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 h-12 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-lg font-semibold"
                                            >
                                                <Save className="mr-3 h-6 w-6" />
                                                {processing ? 'Submitting Registration...' : 'Submit Registration Request'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

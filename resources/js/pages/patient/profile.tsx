import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SharedNavigation from '@/components/SharedNavigation';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    Heart, 
    Shield, 
    Save, 
    Edit, 
    Eye, 
    EyeOff,
    CheckCircle,
    AlertCircle,
    FileText,
    Activity,
    Clock,
    Award
} from 'lucide-react';
import React, { useState } from 'react';

interface PatientProfileProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        created_at: string;
    };
    patient?: {
        id: number;
        user_id: number;
        patient_code: string;
        sequence_number: number;
        patient_no: string;
        arrival_date: string;
        arrival_time: string;
        last_name: string;
        first_name: string;
        middle_name: string;
        birthdate: string;
        age: number;
        is_senior_citizen: boolean;
        senior_citizen_id: string;
        sex: string;
        occupation: string;
        religion: string;
        attending_physician: string;
        civil_status: string;
        nationality: string;
        present_address: string;
        address: string;
        telephone_no: string;
        mobile_no: string;
        emergency_name: string;
        emergency_relation: string;
        informant_name: string;
        relationship: string;
        insurance_company: string;
        hmo_name: string;
        hmo_id_no: string;
        approval_code: string;
        validity: string;
        mode_of_arrival: string;
        drug_allergies: string;
        food_allergies: string;
        blood_pressure: string;
        heart_rate: string;
        respiratory_rate: string;
        temperature: string;
        weight_kg: number;
        height_cm: number;
        pain_assessment_scale: string;
        oxygen_saturation: string;
        reason_for_consult: string;
        time_seen: string;
        history_of_present_illness: string;
        pertinent_physical_findings: string;
        plan_management: string;
        past_medical_history: string;
        family_history: string;
        social_history: string;
        obgyn_history: string;
        lmp: string;
        assessment_diagnosis: string;
        status: string;
        created_at: string;
        updated_at: string;
    };
    notifications: Array<{
        id: number;
        type: string;
        title: string;
        message: string;
        read: boolean;
        created_at: string;
        data: any;
    }>;
    unreadCount: number;
}

export default function PatientProfile({ 
    user, 
    patient, 
    notifications,
    unreadCount
}: PatientProfileProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
        phone: patient?.telephone_no || '',
        address: patient?.present_address || '',
        emergency_contact: patient?.emergency_name || '',
        emergency_relation: patient?.emergency_relation || '',
        allergies: patient?.drug_allergies || '',
        medical_conditions: patient?.past_medical_history || ''
    });

    // Update form data when patient data changes
    React.useEffect(() => {
        if (patient) {
            console.log('Patient data loaded:', patient);
            setData({
                name: user.name || '',
                email: user.email || '',
                phone: patient.telephone_no || '',
                address: patient.present_address || patient.address || '',
                emergency_contact: patient.emergency_name || '',
                emergency_relation: patient.emergency_relation || '',
                allergies: patient.drug_allergies || '',
                medical_conditions: patient.past_medical_history || ''
            });
        }
    }, [patient, user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting profile data:', data);
        put('/patient/profile', {
            onSuccess: () => {
                setIsEditing(false);
                setSuccessMessage('Profile updated successfully!');
                console.log('Profile updated successfully');
                // Clear success message after 3 seconds
                setTimeout(() => setSuccessMessage(''), 3000);
            },
            onError: (errors) => {
                console.error('Profile update errors:', errors);
            }
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'inactive':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Head title="My Profile - SJHI Industrial Clinic" />
            
            {/* Shared Navigation */}
            <SharedNavigation user={user} currentPath="/patient/profile" notifications={notifications} unreadCount={unreadCount} />
            
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="flex items-center space-x-6">
                        <div className="p-4 bg-white/20 rounded-full">
                            <User className="h-12 w-12" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                {patient ? `${patient.first_name} ${patient.last_name}` : user.name}
                            </h1>
                            <p className="text-xl text-green-100">
                                {patient ? `Patient #${patient.patient_no}` : 'User Profile'}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                                <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Active Patient
                                </Badge>
                                <span className="text-sm text-green-200">
                                    Member since {new Date(user.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Tabs defaultValue="personal" className="space-y-8">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="personal">Personal Info</TabsTrigger>
                        <TabsTrigger value="medical">Medical Info</TabsTrigger>
                        <TabsTrigger value="account">Account</TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                    </TabsList>

                    {/* Personal Information Tab */}
                    <TabsContent value="personal" className="space-y-6">
                        <Card className="bg-white shadow-lg border-0 rounded-xl">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                                    <User className="h-5 w-5 text-green-600" />
                                    Personal Information
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="border-green-200 text-green-700 hover:bg-green-50"
                                >
                                    {isEditing ? (
                                        <>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Only
                                        </>
                                    ) : (
                                        <>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Profile
                                        </>
                                    )}
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {successMessage && (
                                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                                        <div className="flex items-center">
                                            <CheckCircle className="h-5 w-5 mr-2" />
                                            {successMessage}
                                        </div>
                                    </div>
                                )}
                                {isEditing ? (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                                                    Full Name *
                                                </Label>
                                                <Input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    className="mt-1"
                                                    required
                                                />
                                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                                    Email Address *
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    className="mt-1"
                                                    required
                                                />
                                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                                                    Phone Number
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                    className="mt-1"
                                                />
                                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                                                    Address
                                                </Label>
                                                <Textarea
                                                    id="address"
                                                    value={data.address}
                                                    onChange={(e) => setData('address', e.target.value)}
                                                    className="mt-1"
                                                    rows={3}
                                                />
                                                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                                            </div>
                                        </div>

                                        {/* Emergency Contact */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="emergency_contact" className="text-sm font-semibold text-gray-700">
                                                    Emergency Contact Name
                                                </Label>
                                                <Input
                                                    id="emergency_contact"
                                                    value={data.emergency_contact}
                                                    onChange={(e) => setData('emergency_contact', e.target.value)}
                                                    className="mt-1"
                                                />
                                                {errors.emergency_contact && <p className="text-red-500 text-sm mt-1">{errors.emergency_contact}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="emergency_relation" className="text-sm font-semibold text-gray-700">
                                                    Relationship
                                                </Label>
                                                <Input
                                                    id="emergency_relation"
                                                    value={data.emergency_relation}
                                                    onChange={(e) => setData('emergency_relation', e.target.value)}
                                                    className="mt-1"
                                                />
                                                {errors.emergency_relation && <p className="text-red-500 text-sm mt-1">{errors.emergency_relation}</p>}
                                            </div>
                                        </div>

                                        {/* Medical Information */}
                                        <div className="grid grid-cols-1 gap-6">
                                            <div>
                                                <Label htmlFor="allergies" className="text-sm font-semibold text-gray-700">
                                                    Drug Allergies
                                                </Label>
                                                <Textarea
                                                    id="allergies"
                                                    value={data.allergies}
                                                    onChange={(e) => setData('allergies', e.target.value)}
                                                    className="mt-1"
                                                    rows={2}
                                                    placeholder="List any drug allergies (e.g., Penicillin, Aspirin)"
                                                />
                                                {errors.allergies && <p className="text-red-500 text-sm mt-1">{errors.allergies}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="medical_conditions" className="text-sm font-semibold text-gray-700">
                                                    Medical Conditions
                                                </Label>
                                                <Textarea
                                                    id="medical_conditions"
                                                    value={data.medical_conditions}
                                                    onChange={(e) => setData('medical_conditions', e.target.value)}
                                                    className="mt-1"
                                                    rows={3}
                                                    placeholder="List any current medical conditions or past medical history"
                                                />
                                                {errors.medical_conditions && <p className="text-red-500 text-sm mt-1">{errors.medical_conditions}</p>}
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsEditing(false)}
                                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                {processing ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                                                <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Email Address</Label>
                                                <p className="text-lg text-gray-900">{user.email}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
                                                <p className="text-lg text-gray-900">{patient?.telephone_no || 'Not provided'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Address</Label>
                                                <p className="text-lg text-gray-900">{patient?.present_address || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Emergency Contact</Label>
                                                <p className="text-lg text-gray-900">{patient?.emergency_name || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Relationship</Label>
                                                <p className="text-lg text-gray-900">{patient?.emergency_relation || 'Not provided'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Patient Number</Label>
                                                <p className="text-lg font-semibold text-green-600">{patient?.patient_no || 'Not assigned'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Member Since</Label>
                                                <p className="text-lg text-gray-900">{new Date(user.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Medical Information Tab */}
                    <TabsContent value="medical" className="space-y-6">
                        <Card className="bg-white shadow-lg border-0 rounded-xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                                    <Heart className="h-5 w-5 text-green-600" />
                                    Medical Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                                            <p className="text-lg text-gray-900">
                                                {patient?.birthdate ? new Date(patient.birthdate).toLocaleDateString() : 'Not provided'}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Age</Label>
                                            <p className="text-lg text-gray-900">{patient?.age || 'Not provided'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Sex</Label>
                                            <p className="text-lg text-gray-900 capitalize">{patient?.sex || 'Not provided'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Civil Status</Label>
                                            <p className="text-lg text-gray-900 capitalize">{patient?.civil_status || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Nationality</Label>
                                            <p className="text-lg text-gray-900">{patient?.nationality || 'Not provided'}</p>
                                        </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Emergency Contact</Label>
                                                <p className="text-lg text-gray-900">{patient?.emergency_name || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Relationship</Label>
                                                <p className="text-lg text-gray-900">{patient?.emergency_relation || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">HMO/Insurance</Label>
                                                <p className="text-lg text-gray-900">{patient?.hmo_name || 'Not provided'}</p>
                                            </div>
                                    </div>
                                </div>

                                {/* Medical History */}
                                <div className="mt-8 space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Medical History</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Drug Allergies</Label>
                                            <p className="text-lg text-gray-900">{patient?.drug_allergies || 'None reported'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Food Allergies</Label>
                                            <p className="text-lg text-gray-900">{patient?.food_allergies || 'None reported'}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Past Medical History</Label>
                                        <p className="text-lg text-gray-900 mt-1">
                                            {patient?.past_medical_history || 'No significant medical history reported'}
                                        </p>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Family History</Label>
                                        <p className="text-lg text-gray-900 mt-1">
                                            {patient?.family_history || 'No significant family history reported'}
                                        </p>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Social History</Label>
                                        <p className="text-lg text-gray-900 mt-1">
                                            {patient?.social_history || 'No significant social history reported'}
                                        </p>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">OB-GYN History</Label>
                                        <p className="text-lg text-gray-900 mt-1">
                                            {patient?.obgyn_history || 'No significant OB-GYN history reported'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Account Settings Tab */}
                    <TabsContent value="account" className="space-y-6">
                        <Card className="bg-white shadow-lg border-0 rounded-xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                                    <Shield className="h-5 w-5 text-green-600" />
                                    Account Security
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="current_password" className="text-sm font-semibold text-gray-700">
                                                Current Password
                                            </Label>
                                            <div className="relative mt-1">
                                                <Input
                                                    id="current_password"
                                                    type={showPassword ? "text" : "password"}
                                                    value={data.current_password}
                                                    onChange={(e) => setData('current_password', e.target.value)}
                                                    className="pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.current_password && <p className="text-red-500 text-sm mt-1">{errors.current_password}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="new_password" className="text-sm font-semibold text-gray-700">
                                                New Password
                                            </Label>
                                            <Input
                                                id="new_password"
                                                type="password"
                                                value={data.new_password}
                                                onChange={(e) => setData('new_password', e.target.value)}
                                                className="mt-1"
                                            />
                                            {errors.new_password && <p className="text-red-500 text-sm mt-1">{errors.new_password}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="new_password_confirmation" className="text-sm font-semibold text-gray-700">
                                            Confirm New Password
                                        </Label>
                                        <Input
                                            id="new_password_confirmation"
                                            type="password"
                                            value={data.new_password_confirmation}
                                            onChange={(e) => setData('new_password_confirmation', e.target.value)}
                                            className="mt-1"
                                        />
                                        {errors.new_password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.new_password_confirmation}</p>}
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                                            <div className="text-blue-800 text-sm">
                                                <p className="font-medium mb-1">Password Requirements:</p>
                                                <ul className="list-disc pl-4 space-y-1">
                                                    <li>At least 8 characters long</li>
                                                    <li>Contains uppercase and lowercase letters</li>
                                                    <li>Contains at least one number</li>
                                                    <li>Contains at least one special character</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Update Password
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Activity Tab */}
                    <TabsContent value="activity" className="space-y-6">
                        <Card className="bg-white shadow-lg border-0 rounded-xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                                    <Activity className="h-5 w-5 text-green-600" />
                                    Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                                        <div className="p-2 bg-green-100 rounded-full">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">Profile Updated</p>
                                            <p className="text-sm text-gray-600">Your profile information was updated</p>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Clock className="h-4 w-4 mr-1" />
                                            {new Date().toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                                        <div className="p-2 bg-blue-100 rounded-full">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">Account Created</p>
                                            <p className="text-sm text-gray-600">Your patient account was created</p>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Clock className="h-4 w-4 mr-1" />
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
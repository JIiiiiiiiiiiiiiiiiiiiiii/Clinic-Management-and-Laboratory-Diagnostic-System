import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, Save, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';

type Specialist = {
    id: number;
    specialist_id?: number;
    name: string;
    role: string;
    specialization?: string;
    schedule_data?: {
        monday?: string[];
        tuesday?: string[];
        wednesday?: string[];
        thursday?: string[];
        friday?: string[];
        saturday?: string[];
        sunday?: string[];
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Specialist Management',
        href: '/admin/specialists',
    },
    {
        title: 'Schedule Management',
        href: '#',
    },
];

const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
];

const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
];

export default function SpecialistSchedule({ specialist, scheduleData }: { 
    specialist: Specialist; 
    scheduleData: any;
}) {
    const { data, setData, put, processing, errors } = useForm({
        schedule_data: scheduleData || {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: [],
        }
    });

    const [selectedDay, setSelectedDay] = useState<string>('monday');
    const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState<string>('');

    const handleDayToggle = (day: string, checked: boolean) => {
        const newSchedule = { ...data.schedule_data };
        if (checked) {
            // When day is checked, initialize with empty array (user can then select times)
            newSchedule[day] = [];
        } else {
            // When day is unchecked, remove the day from schedule
            delete newSchedule[day];
        }
        setData('schedule_data', newSchedule);
    };

    const handleTimeToggle = (day: string, time: string, checked: boolean) => {
        const newSchedule = { ...data.schedule_data };
        if (checked) {
            newSchedule[day] = [...(newSchedule[day] || []), time];
        } else {
            newSchedule[day] = (newSchedule[day] || []).filter(t => t !== time);
        }
        setData('schedule_data', newSchedule);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaveStatus('saving');
        setSaveMessage('Saving schedule...');
        
        // Determine the correct route based on specialist role
        const role = specialist.role?.toLowerCase();
        const specialistId = specialist.specialist_id || specialist.id;
        let updateRoute;
        
        if (role === 'doctor') {
            updateRoute = `/admin/specialists/doctors/${specialistId}/schedule`;
        } else if (role === 'nurse') {
            updateRoute = `/admin/specialists/nurses/${specialistId}/schedule`;
        } else if (role === 'medtech') {
            updateRoute = `/admin/specialists/medtechs/${specialistId}/schedule`;
        } else {
            updateRoute = `/admin/specialists/${specialistId}/schedule`;
        }
        
        put(updateRoute, {
            onSuccess: () => {
                setSaveStatus('success');
                setSaveMessage('Schedule saved successfully!');
                setTimeout(() => {
                    setSaveStatus('idle');
                    setSaveMessage('');
                }, 3000);
            },
            onError: (errors) => {
                setSaveStatus('error');
                setSaveMessage('Failed to save schedule. Please try again.');
                console.error('Save errors:', errors);
            }
        });
    };

    const isDayActive = (day: string) => {
        // A day is active if it has been selected (even if no time slots are chosen yet)
        return data.schedule_data[day] !== undefined;
    };

    const getDayTimes = (day: string) => {
        return data.schedule_data[day] || [];
    };

    const getScheduleSummary = () => {
        const summary = [];
        days.forEach(day => {
            const times = getDayTimes(day.key);
            if (times.length > 0) {
                summary.push(`${day.label}: ${times.join(', ')}`);
            }
        });
        return summary.length > 0 ? summary.join(' | ') : 'No schedule set';
    };

    const getSaveStatusIcon = () => {
        switch (saveStatus) {
            case 'saving':
                return <Clock className="h-4 w-4 animate-spin text-blue-600" />;
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'error':
                return <AlertCircle className="h-4 w-4 text-red-600" />;
            default:
                return null;
        }
    };

    const getSaveStatusColor = () => {
        switch (saveStatus) {
            case 'saving':
                return 'text-blue-600';
            case 'success':
                return 'text-green-600';
            case 'error':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Schedule Management - ${specialist.name}`} />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                asChild
                                className="hover:bg-gray-50"
                            >
                                <a href="/admin/specialists">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Specialists
                                </a>
                            </Button>
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-2">Schedule Management</h1>
                                <p className="text-sm text-gray-600">
                                    Manage availability schedule for <strong>{specialist.name}</strong> ({specialist.role})
                                </p>
                                {/* Save Status Indicator */}
                                {saveStatus !== 'idle' && (
                                    <div className={`flex items-center gap-2 mt-2 ${getSaveStatusColor()}`}>
                                        {getSaveStatusIcon()}
                                        <span className="text-sm font-medium">{saveMessage}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Schedule Management Form */}
                <Card className="shadow-lg border-0 rounded-xl bg-white">
                    <CardHeader className="bg-white border-b border-gray-200">
                        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                            <Calendar className="h-5 w-5 text-black" />
                            Weekly Schedule
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Days Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {days.map((day) => (
                                    <Card key={day.key} className={`border-2 transition-all duration-200 ${
                                        isDayActive(day.key) 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-200 bg-white'
                                    }`}>
                                        <CardContent className="p-4">
                                            <div className="space-y-4">
                                                {/* Day Header */}
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-lg font-semibold text-gray-800">
                                                        {day.label}
                                                    </Label>
                                                    <Checkbox
                                                        checked={isDayActive(day.key)}
                                                        onCheckedChange={(checked) => 
                                                            handleDayToggle(day.key, checked as boolean)
                                                        }
                                                    />
                                                </div>

                                                {/* Time Slots */}
                                                {isDayActive(day.key) && (
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-gray-600">
                                                            Available Times:
                                                        </Label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {timeSlots.map((time) => (
                                                                <div key={time} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`${day.key}-${time}`}
                                                                        checked={getDayTimes(day.key).includes(time)}
                                                                        onCheckedChange={(checked) => 
                                                            handleTimeToggle(day.key, time, checked as boolean)
                                                        }
                                                                    />
                                                                    <Label 
                                                                        htmlFor={`${day.key}-${time}`}
                                                                        className="text-sm text-gray-700"
                                                                    >
                                                                        {time}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Schedule Summary */}
                            <Card className="bg-gray-50 border-gray-200">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-gray-800">Schedule Summary</h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowDebugInfo(!showDebugInfo)}
                                            className="text-gray-600 border-gray-300 hover:bg-gray-50"
                                        >
                                            {showDebugInfo ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                                            {showDebugInfo ? 'Hide' : 'Show'} Debug Info
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {days.map((day) => {
                                            const times = getDayTimes(day.key);
                                            return (
                                                <div key={day.key} className="text-sm">
                                                    <span className="font-medium text-gray-700">{day.label}:</span>
                                                    <span className="ml-2 text-gray-600">
                                                        {times.length > 0 ? times.join(', ') : 'Off'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    {/* Debug Information */}
                                    {showDebugInfo && (
                                        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                                            <h4 className="font-medium text-gray-800 mb-2">Debug Information</h4>
                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-700">Specialist ID:</span>
                                                    <span className="ml-2 text-gray-600">{specialist.specialist_id || specialist.id}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Role:</span>
                                                    <span className="ml-2 text-gray-600">{specialist.role}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Current Schedule Data:</span>
                                                    <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                                                        {JSON.stringify(data.schedule_data, null, 2)}
                                                    </pre>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Schedule Summary:</span>
                                                    <span className="ml-2 text-gray-600">{getScheduleSummary()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={processing || saveStatus === 'saving'}
                                    className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
                                        saveStatus === 'success' 
                                            ? 'bg-green-600 hover:bg-green-700' 
                                            : saveStatus === 'error'
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    } text-white`}
                                >
                                    {getSaveStatusIcon() || <Save className="h-4 w-4" />}
                                    {saveStatus === 'saving' ? 'Saving...' : 
                                     saveStatus === 'success' ? 'Saved!' :
                                     saveStatus === 'error' ? 'Retry Save' :
                                     'Save Schedule'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

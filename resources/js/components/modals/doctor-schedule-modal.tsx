import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useForm, router } from '@inertiajs/react';
import { Save, Calendar, Clock, CheckCircle, AlertCircle, X, Stethoscope } from 'lucide-react';

interface Doctor {
    id: number;
    name: string;
    email: string;
    contact?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    schedule_data?: {
        monday?: string[];
        tuesday?: string[];
        wednesday?: string[];
        thursday?: string[];
        friday?: string[];
        saturday?: string[];
        sunday?: string[];
    };
}

interface DoctorScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctor: Doctor | null;
    onSuccess?: () => void;
}

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

export default function DoctorScheduleModal({
    isOpen,
    onClose,
    doctor,
    onSuccess
}: DoctorScheduleModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState<string>('');

    const { data, setData, errors, reset } = useForm({
        schedule_data: {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: [],
        }
    });

    useEffect(() => {
        if (isOpen && doctor) {
            setData('schedule_data', doctor.schedule_data || {
                monday: [],
                tuesday: [],
                wednesday: [],
                thursday: [],
                friday: [],
                saturday: [],
                sunday: [],
            });
        } else {
            setSaveStatus('idle');
            setSaveMessage('');
        }
    }, [isOpen, doctor]);

    const handleDayToggle = (day: string, checked: boolean) => {
        const newSchedule = { ...data.schedule_data };
        if (checked) {
            newSchedule[day] = [];
        } else {
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
        setIsSubmitting(true);
        setSaveStatus('saving');
        setSaveMessage('Saving schedule...');

        router.put(`/admin/specialists/doctors/${doctor?.id}/schedule`, data, {
            onSuccess: () => {
                setSaveStatus('success');
                setSaveMessage('Schedule saved successfully!');
                setTimeout(() => {
                    setSaveStatus('idle');
                    setSaveMessage('');
                    onClose();
                    onSuccess?.();
                }, 2000);
            },
            onError: (errors) => {
                setSaveStatus('error');
                setSaveMessage('Failed to save schedule. Please try again.');
                console.error('Save errors:', errors);
                setTimeout(() => {
                    setSaveStatus('idle');
                    setSaveMessage('');
                }, 3000);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const handleClose = () => {
        if (!isSubmitting) {
            reset();
            onClose();
        }
    };

    const isDayActive = (day: string) => {
        return data.schedule_data[day] !== undefined;
    };

    const getDayTimes = (day: string) => {
        return data.schedule_data[day] || [];
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

    if (!doctor) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Calendar className="h-5 w-5 text-green-600" />
                        Manage Schedule - {doctor.name}
                    </DialogTitle>
                    <DialogDescription>
                        Set the weekly availability schedule for Dr. {doctor.name}
                    </DialogDescription>
                </DialogHeader>

                {/* Save Status Indicator */}
                {saveStatus !== 'idle' && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg border ${getSaveStatusColor()}`}>
                        {getSaveStatusIcon()}
                        <span className="text-sm font-medium">{saveMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Days Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {days.map((day) => (
                            <Card key={day.key} className={`border-2 transition-all duration-200 ${
                                isDayActive(day.key) 
                                    ? 'border-green-500 bg-green-50' 
                                    : 'border-gray-200 bg-white'
                            }`}>
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        {/* Day Header */}
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-semibold text-gray-800">
                                                {day.label}
                                            </Label>
                                            <Checkbox
                                                checked={isDayActive(day.key)}
                                                onCheckedChange={(checked) => 
                                                    handleDayToggle(day.key, checked as boolean)
                                                }
                                                disabled={isSubmitting}
                                            />
                                        </div>

                                        {/* Time Slots */}
                                        {isDayActive(day.key) && (
                                            <div className="space-y-2">
                                                <Label className="text-xs font-medium text-gray-600">
                                                    Available Times:
                                                </Label>
                                                <div className="grid grid-cols-2 gap-1">
                                                    {timeSlots.map((time) => (
                                                        <div key={time} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`${day.key}-${time}`}
                                                                checked={getDayTimes(day.key).includes(time)}
                                                                onCheckedChange={(checked) => 
                                                                    handleTimeToggle(day.key, time, checked as boolean)
                                                                }
                                                                disabled={isSubmitting}
                                                                className="h-3 w-3"
                                                            />
                                                            <Label 
                                                                htmlFor={`${day.key}-${time}`}
                                                                className="text-xs text-gray-700"
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
                            <h3 className="font-semibold text-gray-800 mb-3">Schedule Summary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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
                        </CardContent>
                    </Card>

                    <DialogFooter className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className={`${
                                saveStatus === 'success' 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : saveStatus === 'error'
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-green-600 hover:bg-green-700'
                            } text-white`}
                        >
                            {getSaveStatusIcon() || <Save className="h-4 w-4 mr-2" />}
                            {saveStatus === 'saving' ? 'Saving...' : 
                             saveStatus === 'success' ? 'Saved!' :
                             saveStatus === 'error' ? 'Retry Save' :
                             'Save Schedule'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

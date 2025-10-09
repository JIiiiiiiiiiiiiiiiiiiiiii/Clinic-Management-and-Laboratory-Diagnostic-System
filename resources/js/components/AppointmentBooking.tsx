import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar, CheckCircle, Clock, User, CalendarDays, MapPin, Phone, Mail } from 'lucide-react';
import { useAppointmentNotifications } from './AppointmentNotification';

interface Doctor {
    id: string;
    name: string;
    specialization: string;
    rating: number;
    experience: string;
    availability: string;
    nextAvailable: string;
    image?: string;
}

interface TimeSlot {
    time: string;
    available: boolean;
    bookedBy?: string;
}

interface BookingData {
    doctorId: string;
    date: string;
    time: string;
    type: string;
    notes?: string;
    patientInfo: {
        name: string;
        email: string;
        phone: string;
    };
}

interface AppointmentBookingProps {
    doctors: Doctor[];
    onBookingComplete?: (bookingData: BookingData) => void;
    isOpen?: boolean;
    onClose?: () => void;
}

export default function AppointmentBooking({ 
    doctors, 
    onBookingComplete, 
    isOpen = false, 
    onClose 
}: AppointmentBookingProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [appointmentType, setAppointmentType] = useState('');
    const [notes, setNotes] = useState('');
    const [patientInfo, setPatientInfo] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { showBookingConfirmation } = useAppointmentNotifications();

    // Generate available time slots for selected date
    useEffect(() => {
        if (selectedDate && selectedDoctor) {
            generateTimeSlots();
        }
    }, [selectedDate, selectedDoctor]);

    const generateTimeSlots = () => {
        const slots: TimeSlot[] = [];
        const startHour = 9;
        const endHour = 17;
        
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
                
                // Simulate some slots being booked
                const isBooked = Math.random() < 0.3;
                
                slots.push({
                    time: displayTime,
                    available: !isBooked,
                    bookedBy: isBooked ? 'Patient' : undefined
                });
            }
        }
        
        setAvailableSlots(slots);
    };

    const handleNextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleBookingSubmit = async () => {
        if (!selectedDoctor || !selectedDate || !selectedTime || !appointmentType) return;

        setIsLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const bookingData: BookingData = {
            doctorId: selectedDoctor.id,
            date: selectedDate,
            time: selectedTime,
            type: appointmentType,
            notes,
            patientInfo
        };

        // Show confirmation notification
        showBookingConfirmation(selectedDoctor.name, selectedDate, selectedTime);
        
        // Call completion callback
        onBookingComplete?.(bookingData);
        
        setIsLoading(false);
        
        // Reset form
        setCurrentStep(1);
        setSelectedDoctor(null);
        setSelectedDate('');
        setSelectedTime('');
        setAppointmentType('');
        setNotes('');
        setPatientInfo({ name: '', email: '', phone: '' });
        
        onClose?.();
    };

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        return maxDate.toISOString().split('T')[0];
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <Card className="border-0">
                    <CardHeader className="bg-white border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                <CalendarDays className="h-5 w-5 text-black" />
                                Book New Appointment
                            </CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {/* Step Indicator */}
                        <div className="flex items-center justify-center mb-8">
                            <div className="flex items-center space-x-4">
                                {[1, 2, 3, 4].map((step) => (
                                    <div key={step} className="flex items-center">
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                            currentStep >= step ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                                        }`}>
                                            {step}
                                        </div>
                                        {step < 4 && (
                                            <div className={`w-16 h-1 ${currentStep >= step + 1 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Step 1: Select Doctor */}
                        {currentStep === 1 && (
                            <div>
                                <h3 className="text-lg font-semibold text-black mb-4">Step 1: Choose Your Doctor</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {doctors.map(doctor => (
                                        <div 
                                            key={doctor.id} 
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                selectedDoctor?.id === doctor.id 
                                                    ? 'border-green-500 bg-green-50' 
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            onClick={() => setSelectedDoctor(doctor)}
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <User className="h-6 w-6 text-gray-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-black">{doctor.name}</div>
                                                    <div className="text-sm text-gray-600">{doctor.specialization}</div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-yellow-500">★</span>
                                                    <span className="text-sm text-gray-600">{doctor.rating}</span>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500 mb-2">{doctor.experience} experience</div>
                                            <div className="text-sm text-gray-500 mb-2">Available: {doctor.availability}</div>
                                            <div className="text-sm text-green-600 font-medium">Next available: {doctor.nextAvailable}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end mt-6">
                                    <Button 
                                        onClick={handleNextStep}
                                        disabled={!selectedDoctor}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                                    >
                                        Next Step
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Select Date & Time */}
                        {currentStep === 2 && (
                            <div>
                                <h3 className="text-lg font-semibold text-black mb-4">Step 2: Choose Date & Time</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-2">Select Date</label>
                                        <input 
                                            type="date" 
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            min={getMinDate()}
                                            max={getMaxDate()}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-2">Available Time Slots</label>
                                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                            {availableSlots.map((slot, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedTime(slot.time)}
                                                    disabled={!slot.available}
                                                    className={`p-2 text-sm rounded-lg border transition-all ${
                                                        selectedTime === slot.time
                                                            ? 'bg-green-600 text-white border-green-600'
                                                            : slot.available
                                                                ? 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                                                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                    }`}
                                                >
                                                    {slot.time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between mt-6">
                                    <Button 
                                        onClick={handlePrevStep}
                                        variant="outline"
                                        className="px-6 py-2"
                                    >
                                        Previous
                                    </Button>
                                    <Button 
                                        onClick={handleNextStep}
                                        disabled={!selectedDate || !selectedTime}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                                    >
                                        Next Step
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Appointment Details */}
                        {currentStep === 3 && (
                            <div>
                                <h3 className="text-lg font-semibold text-black mb-4">Step 3: Appointment Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-2">Appointment Type</label>
                                        <select 
                                            value={appointmentType}
                                            onChange={(e) => setAppointmentType(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        >
                                            <option value="">Select type...</option>
                                            <option value="New Consultation">New Consultation</option>
                                            <option value="Follow-up">Follow-up</option>
                                            <option value="Emergency">Emergency</option>
                                            <option value="Routine Checkup">Routine Checkup</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-2">Additional Notes (Optional)</label>
                                        <textarea 
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Any specific concerns or information you'd like to share..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between mt-6">
                                    <Button 
                                        onClick={handlePrevStep}
                                        variant="outline"
                                        className="px-6 py-2"
                                    >
                                        Previous
                                    </Button>
                                    <Button 
                                        onClick={handleNextStep}
                                        disabled={!appointmentType}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                                    >
                                        Next Step
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Patient Information & Confirmation */}
                        {currentStep === 4 && (
                            <div>
                                <h3 className="text-lg font-semibold text-black mb-4">Step 4: Patient Information & Confirmation</h3>
                                
                                {/* Patient Information Form */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-2">Full Name</label>
                                        <Input
                                            value={patientInfo.name}
                                            onChange={(e) => setPatientInfo(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-2">Email Address</label>
                                        <Input
                                            type="email"
                                            value={patientInfo.email}
                                            onChange={(e) => setPatientInfo(prev => ({ ...prev, email: e.target.value }))}
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-black mb-2">Phone Number</label>
                                        <Input
                                            value={patientInfo.phone}
                                            onChange={(e) => setPatientInfo(prev => ({ ...prev, phone: e.target.value }))}
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                </div>

                                {/* Appointment Summary */}
                                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                                    <h4 className="font-semibold text-black mb-4">Appointment Summary</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Doctor:</span>
                                            <span className="font-medium text-black">{selectedDoctor?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Specialization:</span>
                                            <span className="font-medium text-black">{selectedDoctor?.specialization}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Date:</span>
                                            <span className="font-medium text-black">{selectedDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Time:</span>
                                            <span className="font-medium text-black">{selectedTime}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Type:</span>
                                            <span className="font-medium text-black">{appointmentType}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Duration:</span>
                                            <span className="font-medium text-black">30 minutes</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between mt-6">
                                    <Button 
                                        onClick={handlePrevStep}
                                        variant="outline"
                                        className="px-6 py-2"
                                    >
                                        Previous
                                    </Button>
                                    <Button 
                                        onClick={handleBookingSubmit}
                                        disabled={!patientInfo.name || !patientInfo.email || !patientInfo.phone || isLoading}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 flex items-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Clock className="h-4 w-4 animate-spin" />
                                                Booking...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="h-4 w-4" />
                                                Confirm Booking
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useState } from 'react';

interface CalendarEvent {
    id: number;
    title: string;
    date: string;
    time: string;
    type: 'appointment' | 'meeting' | 'reminder' | 'holiday';
}

// Mock data - in real app this would come from props
const mockEvents: CalendarEvent[] = [
    {
        id: 1,
        title: 'Dr. Smith - Patient Consultation',
        date: '2025-01-15',
        time: '09:00',
        type: 'appointment'
    },
    {
        id: 2,
        title: 'Team Meeting',
        date: '2025-01-15',
        time: '14:00',
        type: 'meeting'
    },
    {
        id: 3,
        title: 'Lab Results Review',
        date: '2025-01-16',
        time: '10:30',
        type: 'reminder'
    },
    {
        id: 4,
        title: 'Dr. Johnson - Follow-up',
        date: '2025-01-17',
        time: '11:00',
        type: 'appointment'
    },
    {
        id: 5,
        title: 'Inventory Check',
        date: '2025-01-18',
        time: '15:00',
        type: 'reminder'
    }
];

const getEventColor = (type: CalendarEvent['type']) => {
    const colorConfig = {
        appointment: 'bg-blue-100 text-blue-800 border-blue-200',
        meeting: 'bg-purple-100 text-purple-800 border-purple-200',
        reminder: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        holiday: 'bg-red-100 text-red-800 border-red-200'
    };
    return colorConfig[type] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export default function CalendarWidget() {
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };
    
    const getEventsForDate = (date: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        return mockEvents.filter(event => event.date === dateStr);
    };
    
    const isToday = (date: number) => {
        const todayDate = today.getDate();
        const todayMonth = today.getMonth();
        const todayYear = today.getFullYear();
        return date === todayDate && month === todayMonth && year === todayYear;
    };
    
    const renderCalendarDays = () => {
        const days = [];
        
        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(
                <div key={`empty-${i}`} className="h-12 border-b border-r border-gray-200"></div>
            );
        }
        
        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const events = getEventsForDate(day);
            const isCurrentDay = isToday(day);
            
            days.push(
                <div 
                    key={day} 
                    className={`h-12 border-b border-r border-gray-200 p-1 ${
                        isCurrentDay ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                >
                    <div className={`text-sm font-medium ${isCurrentDay ? 'text-blue-600' : 'text-gray-900'}`}>
                        {day}
                    </div>
                    <div className="space-y-1 mt-1">
                        {events.slice(0, 2).map(event => (
                            <div 
                                key={event.id}
                                className={`text-xs px-1 py-0.5 rounded border ${getEventColor(event.type)} truncate`}
                                title={`${event.title} at ${event.time}`}
                            >
                                {event.title}
                            </div>
                        ))}
                        {events.length > 2 && (
                            <div className="text-xs text-gray-500">
                                +{events.length - 2} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        
        return days;
    };
    
    return (
        <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
                <div className="flex items-center gap-3 p-6">
                    <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                        <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">Calendar</h3>
                        <p className="text-green-100 mt-1">Upcoming events & appointments</p>
                    </div>
                </div>
            </div>
            <CardContent className="p-0">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                            {monthNames[month]} {year}
                        </h4>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigateMonth('prev')}
                                className="text-gray-600 hover:bg-gray-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigateMonth('next')}
                                className="text-gray-600 hover:bg-gray-50"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 border border-gray-200 rounded-lg overflow-hidden">
                        {/* Day headers */}
                        {dayNames.map(day => (
                            <div key={day} className="bg-gray-100 p-2 text-center text-sm font-medium text-gray-700 border-b border-r border-gray-200">
                                {day}
                            </div>
                        ))}
                        
                        {/* Calendar days */}
                        {renderCalendarDays()}
                    </div>
                    
                    {/* Today's Events */}
                    <div className="mt-4">
                        <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Today's Events
                        </h5>
                        <div className="space-y-2">
                            {getEventsForDate(today.getDate()).map(event => (
                                <div 
                                    key={event.id}
                                    className={`text-xs px-2 py-1 rounded border ${getEventColor(event.type)}`}
                                >
                                    <span className="font-medium">{event.time}</span> - {event.title}
                                </div>
                            ))}
                            {getEventsForDate(today.getDate()).length === 0 && (
                                <p className="text-sm text-gray-500">No events scheduled for today</p>
                            )}
                        </div>
                    </div>
                </div>
                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center">
                        Calendar events and appointments • 
                        <span className="text-green-600 hover:text-green-800 cursor-pointer ml-1">
                            View full calendar
                        </span>
                    </p>
                </div>
            </CardContent>
        </div>
    );
}

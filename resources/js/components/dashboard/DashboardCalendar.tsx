import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { CustomCalendar } from './CustomCalendar';

interface CalendarEvent {
    id: string;
    title: string;
    time: string;
    type: 'appointment' | 'lab' | 'meeting';
    date: Date;
}

const mockEvents: CalendarEvent[] = [
    {
        id: '1',
        title: 'Patient Consultation',
        time: '09:00 AM',
        type: 'appointment',
        date: new Date(2025, 0, 15)
    },
    {
        id: '2',
        title: 'Lab Results Review',
        time: '10:30 AM',
        type: 'lab',
        date: new Date(2025, 0, 15)
    },
    {
        id: '3',
        title: 'Team Meeting',
        time: '02:00 PM',
        type: 'meeting',
        date: new Date(2025, 0, 16)
    },
    {
        id: '4',
        title: 'Follow-up Appointment',
        time: '11:00 AM',
        type: 'appointment',
        date: new Date(2025, 0, 17)
    }
];

const getEventTypeColor = (type: string) => {
    switch (type) {
        case 'appointment':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'lab':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'meeting':
            return 'bg-purple-100 text-purple-800 border-purple-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export function DashboardCalendar() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    const getEventsForDate = (date: Date) => {
        return mockEvents.filter(event => 
            event.date.toDateString() === date.toDateString()
        );
    };

    const getTodaysEvents = () => {
        const today = new Date();
        return getEventsForDate(today);
    };

    const upcomingEvents = mockEvents
        .filter(event => event.date >= new Date())
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 4);

    return (
        <div className="space-y-4">
            {/* Calendar Card */}
            <Card className="holographic-card shadow-lg overflow-hidden rounded-xl bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white/80 transition-all duration-300">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                            Calendar
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <CustomCalendar
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                    />
                </CardContent>
            </Card>

            {/* Today's Events */}
            <Card className="holographic-card shadow-lg overflow-hidden rounded-xl bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white/80 transition-all duration-300">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Today's Schedule
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {getTodaysEvents().length > 0 ? (
                        getTodaysEvents().map((event) => (
                            <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/80 hover:bg-gray-100/80 transition-colors border border-gray-100">
                                <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type).split(' ')[0]} flex-shrink-0`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {event.title}
                                    </p>
                                    <p className="text-xs text-gray-600 font-medium">
                                        {event.time}
                                    </p>
                                </div>
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs font-medium px-2 py-1 ${getEventTypeColor(event.type)}`}
                                >
                                    {event.type}
                                </Badge>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CalendarIcon className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">
                                No events scheduled for today
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="holographic-card shadow-lg overflow-hidden rounded-xl bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white/80 transition-all duration-300">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Upcoming Events
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {upcomingEvents.map((event) => (
                        <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/80 hover:bg-gray-100/80 transition-colors border border-gray-100">
                            <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type).split(' ')[0]} flex-shrink-0`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {event.title}
                                </p>
                                <p className="text-xs text-gray-600 font-medium">
                                    {event.date.toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric' 
                                    })} at {event.time}
                                </p>
                            </div>
                            <Badge 
                                variant="outline" 
                                className={`text-xs font-medium px-2 py-1 ${getEventTypeColor(event.type)}`}
                            >
                                {event.type}
                            </Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}


import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomCalendarProps {
    selectedDate?: Date;
    onDateSelect?: (date: Date) => void;
}

export function CustomCalendar({ selectedDate, onDateSelect }: CustomCalendarProps) {
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
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
        days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
    }
    
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
    
    const handleDateClick = (day: number) => {
        const clickedDate = new Date(year, month, day);
        onDateSelect?.(clickedDate);
    };
    
    const isToday = (day: number) => {
        const date = new Date(year, month, day);
        return date.toDateString() === today.toDateString();
    };
    
    const isSelected = (day: number) => {
        if (!selectedDate) return false;
        const date = new Date(year, month, day);
        return date.toDateString() === selectedDate.toDateString();
    };
    
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-sm font-semibold text-gray-900">
                    {monthNames[month]} {year}
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            
            {/* Day names header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                        {day}
                    </div>
                ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => (
                    <div key={index} className="aspect-square">
                        {day ? (
                            <button
                                onClick={() => handleDateClick(day)}
                                className={`
                                    w-full h-full flex items-center justify-center text-sm font-medium rounded-md transition-colors
                                    ${isSelected(day) 
                                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                        : isToday(day)
                                        ? 'bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100'
                                        : 'text-gray-900 hover:bg-gray-100'
                                    }
                                `}
                            >
                                {day}
                            </button>
                        ) : (
                            <div className="w-full h-full" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Filter, X } from 'lucide-react';
import { router } from '@inertiajs/react';

interface DateRangeFilterProps {
  currentPeriod: string;
  currentStartDate?: string;
  currentEndDate?: string;
  onPeriodChange: (period: string, startDate?: string, endDate?: string) => void;
  className?: string;
}

export default function DateRangeFilter({ 
  currentPeriod, 
  currentStartDate, 
  currentEndDate, 
  onPeriodChange,
  className = ""
}: DateRangeFilterProps) {
  const [period, setPeriod] = useState(currentPeriod);
  const [startDate, setStartDate] = useState(currentStartDate || '');
  const [endDate, setEndDate] = useState(currentEndDate || '');
  const [isCustomRange, setIsCustomRange] = useState(currentPeriod === 'custom');

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    setIsCustomRange(newPeriod === 'custom');
    
    if (newPeriod !== 'custom') {
      const now = new Date();
      let start: Date;
      let end: Date;
      
      switch (newPeriod) {
        case 'daily':
          start = new Date(now);
          end = new Date(now);
          break;
        case 'monthly':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'yearly':
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date(now.getFullYear(), 11, 31);
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }
      
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];
      
      setStartDate(startStr);
      setEndDate(endStr);
      onPeriodChange(newPeriod, startStr, endStr);
    }
  };

  const handleCustomDateChange = () => {
    if (startDate && endDate) {
      onPeriodChange('custom', startDate, endDate);
    }
  };

  const handleClear = () => {
    setPeriod('monthly');
    setStartDate('');
    setEndDate('');
    setIsCustomRange(false);
    onPeriodChange('monthly');
  };

  const formatDateRange = () => {
    if (isCustomRange && startDate && endDate) {
      return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
    }
    
    switch (period) {
      case 'daily':
        return 'Today';
      case 'monthly':
        return 'This Month';
      case 'yearly':
        return 'This Year';
      default:
        return 'This Month';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Date Range Filter</span>
        </CardTitle>
        <CardDescription>
          Select a time period for your reports
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Period Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Time Period</label>
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily (Today)</SelectItem>
                <SelectItem value="monthly">Monthly (This Month)</SelectItem>
                <SelectItem value="yearly">Yearly (This Year)</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {isCustomRange && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Start date"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="End date"
                  />
                </div>
              </div>
              <Button 
                onClick={handleCustomDateChange}
                disabled={!startDate || !endDate}
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Apply Custom Range
              </Button>
            </div>
          )}

          {/* Current Selection Display */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Current Selection</div>
                <div className="text-sm text-muted-foreground">
                  {formatDateRange()}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClear}
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handlePeriodChange('daily')}
              className={period === 'daily' ? 'bg-blue-50 text-blue-700' : ''}
            >
              Today
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handlePeriodChange('monthly')}
              className={period === 'monthly' ? 'bg-blue-50 text-blue-700' : ''}
            >
              This Month
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handlePeriodChange('yearly')}
              className={period === 'yearly' ? 'bg-blue-50 text-blue-700' : ''}
            >
              This Year
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}




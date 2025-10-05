import * as React from 'react';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: Date | string;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  variant?: 'desktop' | 'mobile' | 'responsive';
  disabled?: boolean;
  label?: string;
}

export function CustomDatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  variant = 'responsive',
  disabled = false,
  label
}: DatePickerProps) {
  const [dateValue, setDateValue] = React.useState<dayjs.Dayjs | null>(
    value ? dayjs(value) : null
  );

  const handleChange = (newValue: dayjs.Dayjs | null) => {
    setDateValue(newValue);
    onChange?.(newValue ? newValue.toDate() : null);
  };

  const renderDatePicker = () => {
    const commonProps = {
      value: dateValue,
      onChange: handleChange,
      disabled,
      slotProps: {
        textField: {
          placeholder,
          size: 'small' as const,
          sx: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              '& fieldset': {
                borderColor: '#d1d5db',
              },
              '&:hover fieldset': {
                borderColor: '#3b82f6',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#3b82f6',
                borderWidth: 2,
              },
            },
          },
        },
      },
    };

    switch (variant) {
      case 'desktop':
        return <DesktopDatePicker {...commonProps} />;
      case 'mobile':
        return <MobileDatePicker {...commonProps} />;
      case 'responsive':
      default:
        return <DatePicker {...commonProps} />;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className={cn("w-full", className)}>
        {label && (
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        {renderDatePicker()}
      </div>
    </LocalizationProvider>
  );
}

export default CustomDatePicker;

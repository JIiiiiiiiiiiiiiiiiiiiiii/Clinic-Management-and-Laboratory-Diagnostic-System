/**
 * Comprehensive tests for date validation and formatting
 * Ensures "Invalid Date" issues never occur again
 */

import { safeFormatDate, safeFormatTime } from '../dateTime';

describe('Date Validation and Formatting Tests', () => {
    describe('safeFormatDate', () => {
        it('should handle valid date strings', () => {
            expect(safeFormatDate('2024-01-15')).toBe('1/15/2024');
            expect(safeFormatDate('2024-12-25')).toBe('12/25/2024');
            expect(safeFormatDate('2025-10-22')).toBe('10/22/2025');
        });

        it('should handle null and undefined', () => {
            expect(safeFormatDate(null)).toBe('No date set');
            expect(safeFormatDate(undefined)).toBe('No date set');
        });

        it('should handle empty strings', () => {
            expect(safeFormatDate('')).toBe('No date set');
            expect(safeFormatDate('   ')).toBe('No date set');
        });

        it('should handle invalid date strings', () => {
            expect(safeFormatDate('invalid-date')).toBe('Invalid date');
            expect(safeFormatDate('2024-13-45')).toBe('Invalid date');
            expect(safeFormatDate('not-a-date')).toBe('Invalid date');
        });

        it('should handle database null values', () => {
            expect(safeFormatDate('0000-00-00')).toBe('No date set');
            expect(safeFormatDate('0000-00-00 00:00:00')).toBe('No date set');
        });

        it('should handle out-of-range dates', () => {
            expect(safeFormatDate('1800-01-01')).toBe('Invalid date');
            expect(safeFormatDate('2200-01-01')).toBe('Invalid date');
        });
    });

    describe('safeFormatTime', () => {
        it('should handle valid time strings', () => {
            expect(safeFormatTime('14:30:00')).toBe('2:30 PM');
            expect(safeFormatTime('09:15:00')).toBe('9:15 AM');
            expect(safeFormatTime('23:59:59')).toBe('11:59 PM');
        });

        it('should handle time strings without seconds', () => {
            expect(safeFormatTime('14:30')).toBe('2:30 PM');
            expect(safeFormatTime('09:15')).toBe('9:15 AM');
        });

        it('should handle datetime strings', () => {
            expect(safeFormatTime('2024-01-15T14:30:00')).toBe('2:30 PM');
            expect(safeFormatTime('2024-01-15T09:15:00')).toBe('9:15 AM');
        });

        it('should handle null and undefined', () => {
            expect(safeFormatTime(null)).toBe('No time set');
            expect(safeFormatTime(undefined)).toBe('No time set');
        });

        it('should handle empty strings', () => {
            expect(safeFormatTime('')).toBe('No time set');
            expect(safeFormatTime('   ')).toBe('No time set');
        });

        it('should handle invalid time strings', () => {
            expect(safeFormatTime('invalid-time')).toBe('Invalid time');
            expect(safeFormatTime('25:70:00')).toBe('Invalid time');
            expect(safeFormatTime('not-a-time')).toBe('Invalid time');
        });

        it('should handle out-of-range times', () => {
            expect(safeFormatTime('25:00:00')).toBe('Invalid time');
            expect(safeFormatTime('12:70:00')).toBe('Invalid time');
        });

        it('should handle database null values', () => {
            expect(safeFormatTime('00:00:00')).toBe('No time set');
            expect(safeFormatTime('00:00')).toBe('No time set');
        });
    });

    describe('Edge Cases and Real-World Scenarios', () => {
        it('should handle appointment data from database', () => {
            const appointmentData = {
                appointment_date: '2025-10-22',
                appointment_time: '14:30:00',
                created_at: '2025-10-21T10:00:00Z',
                updated_at: '2025-10-21T15:30:00Z'
            };

            expect(safeFormatDate(appointmentData.appointment_date)).toBe('10/22/2025');
            expect(safeFormatTime(appointmentData.appointment_time)).toBe('2:30 PM');
            expect(safeFormatDate(appointmentData.created_at)).toBe('10/21/2025');
            expect(safeFormatDate(appointmentData.updated_at)).toBe('10/21/2025');
        });

        it('should handle corrupted data gracefully', () => {
            const corruptedData = {
                appointment_date: 'corrupted-date',
                appointment_time: 'corrupted-time',
                created_at: null,
                updated_at: undefined
            };

            expect(safeFormatDate(corruptedData.appointment_date)).toBe('Invalid date');
            expect(safeFormatTime(corruptedData.appointment_time)).toBe('Invalid time');
            expect(safeFormatDate(corruptedData.created_at)).toBe('No date set');
            expect(safeFormatDate(corruptedData.updated_at)).toBe('No date set');
        });

        it('should handle various date formats', () => {
            expect(safeFormatDate('2024-01-15T10:30:00Z')).toBe('1/15/2024');
            expect(safeFormatDate('2024-01-15 10:30:00')).toBe('1/15/2024');
            expect(safeFormatDate('01/15/2024')).toBe('1/15/2024');
        });

        it('should handle various time formats', () => {
            expect(safeFormatTime('10:30:00')).toBe('10:30 AM');
            expect(safeFormatTime('22:30:00')).toBe('10:30 PM');
            expect(safeFormatTime('00:00:00')).toBe('No time set');
        });
    });
});


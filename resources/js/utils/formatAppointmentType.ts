/**
 * Standardizes and normalizes appointment type names for display across the project
 * Converts formats like "general_consultation" to "General Consultation"
 */
export function formatAppointmentType(type: string | null | undefined): string {
    if (!type) return 'N/A';
    
    // Convert to lowercase for consistent matching
    const normalized = type.toLowerCase().trim();
    
    // Direct mapping for common types
    const typeMap: Record<string, string> = {
        'general_consultation': 'General Consultation',
        'consultation': 'General Consultation',
        'cbc': 'CBC (Complete Blood Count)',
        'fecalysis': 'Fecalysis',
        'fecalysis_test': 'Fecalysis',
        'urinalysis': 'Urinalysis',
        'urinarysis_test': 'Urinalysis',
        'urinalysis_test': 'Urinalysis',
        'x-ray': 'X-Ray',
        'xray': 'X-Ray',
        'ultrasound': 'Ultrasound',
        'follow-up': 'Follow-up',
        'followup': 'Follow-up',
        'check-up': 'Check-up',
        'checkup': 'Check-up',
        'manual_transaction': 'Manual Transaction',
    };
    
    // Check direct mapping first
    if (typeMap[normalized]) {
        return typeMap[normalized];
    }
    
    // If not in map, format the string: replace underscores/hyphens with spaces and capitalize
    return type
        .split(/[_\s-]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}


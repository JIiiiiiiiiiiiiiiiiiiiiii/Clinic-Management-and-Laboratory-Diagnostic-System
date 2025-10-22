// Shared BillingTransaction type definition
// This ensures consistency across all billing components

export type BillingTransaction = {
    id: number;
    transaction_id: string;
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        patient_no: string;
        present_address?: string;
        mobile_no?: string;
    };
    doctor: {
        id: number;
        name: string;
        role?: string;
        employee_id?: string;
    } | null;
    payment_type: 'cash' | 'health_card' | 'discount';
    total_amount: number; // Original amount before discounts
    amount: number; // Final amount after discounts
    discount_amount: number; // Regular discount amount
    discount_percentage: number | null; // Regular discount percentage
    is_senior_citizen: boolean; // Whether senior citizen discount applies
    senior_discount_amount: number; // Senior citizen discount amount
    senior_discount_percentage: number; // Senior citizen discount percentage (usually 20%)
    hmo_provider: string | null; // HMO provider name
    hmo_reference: string | null; // Legacy HMO reference field
    hmo_reference_number: string | null; // HMO reference number
    payment_method: 'cash' | 'card' | 'bank_transfer' | 'check' | 'hmo';
    payment_reference: string | null; // Payment reference number
    status: 'draft' | 'pending' | 'paid' | 'cancelled' | 'refunded';
    description: string | null; // Transaction description
    notes: string | null; // Additional notes
    transaction_date: string; // Transaction date
    due_date: string | null; // Due date for payment
    created_at: string; // Creation timestamp
    updated_at?: string; // Last update timestamp
    items: Array<{
        id: number;
        item_type: string;
        item_name: string;
        item_description?: string;
        quantity: number;
        unit_price: number;
        total_price: number;
    }>;
    createdBy: {
        id: number;
        name: string;
    };
    updatedBy?: {
        id: number;
        name: string;
    };
};

// Helper functions for consistent calculations
export const calculateSubtotal = (transaction: BillingTransaction): number => {
    return transaction.items.reduce((sum, item) => {
        const price = typeof item.total_price === 'string' ? parseFloat(item.total_price) : item.total_price;
        return sum + (isNaN(price) ? 0 : price);
    }, 0);
};

export const calculateSeniorDiscount = (transaction: BillingTransaction): number => {
    const seniorDiscountAmount = typeof transaction.senior_discount_amount === 'string' 
        ? parseFloat(transaction.senior_discount_amount) 
        : transaction.senior_discount_amount;
    return isNaN(seniorDiscountAmount) ? 0 : seniorDiscountAmount;
};

export const calculateRegularDiscount = (transaction: BillingTransaction): number => {
    if (transaction.discount_percentage && transaction.discount_percentage > 0) {
        return (calculateSubtotal(transaction) * transaction.discount_percentage) / 100;
    }
    const discountAmount = typeof transaction.discount_amount === 'string' 
        ? parseFloat(transaction.discount_amount) 
        : transaction.discount_amount;
    return isNaN(discountAmount) ? 0 : discountAmount;
};

export const calculateTotalDiscount = (transaction: BillingTransaction): number => {
    return calculateRegularDiscount(transaction) + calculateSeniorDiscount(transaction);
};

export const calculateNetAmount = (transaction: BillingTransaction): number => {
    return calculateSubtotal(transaction) - calculateTotalDiscount(transaction);
};

// Validation function to ensure transaction has all required fields
export const validateBillingTransaction = (transaction: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!transaction.id) errors.push('Missing transaction ID');
    if (!transaction.transaction_id) errors.push('Missing transaction ID string');
    if (!transaction.patient) errors.push('Missing patient information');
    if (typeof transaction.total_amount !== 'number') errors.push('Invalid total_amount');
    if (typeof transaction.amount !== 'number') errors.push('Invalid amount');
    if (typeof transaction.is_senior_citizen !== 'boolean') errors.push('Invalid is_senior_citizen field');
    if (typeof transaction.senior_discount_amount !== 'number') errors.push('Invalid senior_discount_amount');
    if (!Array.isArray(transaction.items)) errors.push('Invalid items array');
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

// Helper to get display amount (should always use 'amount' field for final amount)
export const getDisplayAmount = (transaction: BillingTransaction): number => {
    return transaction.amount || 0;
};

// Helper to check if senior citizen discount applies
export const hasSeniorDiscount = (transaction: BillingTransaction): boolean => {
    return transaction.is_senior_citizen && calculateSeniorDiscount(transaction) > 0;
};

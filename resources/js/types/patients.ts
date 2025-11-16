export interface PatientItem {
    id: number;
    // Arrival Information
    arrival_date?: string;
    arrival_time?: string;

    // Patient Identification
    last_name: string;
    first_name: string;
    middle_name: string;
    birthdate: string;
    age: number;
    sex: 'male' | 'female';
    patient_no: string;

    // Demographics
    occupation: string;
    religion: string;
    attending_physician: string;
    civil_status: 'single' | 'married' | 'widowed' | 'divorced' | 'separated';
    nationality: string;

    // Contact Information
    present_address: string;
    address?: string; // Legacy address field
    display_address?: string; // Computed field for display
    telephone_no: string;
    mobile_no: string;
    email?: string;

    // Emergency Contact
    informant_name: string;
    relationship: string;

    // Financial/Insurance
    company_name: string;
    hmo_name: string;
    hmo_company_id_no: string;
    validation_approval_code: string;
    validity: string;

    // Emergency Staff Nurse Section
    mode_of_arrival: string;
    drug_allergies: string;
    food_allergies: string;

    // Vital Signs
    blood_pressure: string;
    heart_rate: string;
    respiratory_rate: string;
    temperature: string;
    weight_kg: number;
    height_cm: number;
    pain_assessment_scale: string;
    oxygen_saturation: string;

    // Medical Assessment
    reason_for_consult: string;
    time_seen: string;
    history_of_present_illness: string;
    pertinent_physical_findings: string;
    plan_management: string;
    past_medical_history: string;
    family_history: string;
    social_personal_history: string;
    obstetrics_gynecology_history: string;
    lmp: string; // required
    assessment_diagnosis: string;

    // System Fields
    created_at: string;
    updated_at: string;
}

export interface CreatePatientItem {
    // Patient Identification (master record only)
    last_name: string;
    first_name: string;
    middle_name: string;
    birthdate: string;
    age: number;
    sex: 'male' | 'female';
    patient_no?: string; // Optional - backend generates this

    // Demographics
    occupation: string;
    religion: string;
    civil_status: 'single' | 'married' | 'widowed' | 'divorced' | 'separated';
    nationality: string;

    // Contact Information
    present_address: string;
    address?: string; // Legacy address field
    display_address?: string; // Computed field for display
    telephone_no: string;
    mobile_no: string;
    email?: string;

    // Emergency Contact
    informant_name: string;
    relationship: string;

    // Financial/Insurance
    company_name: string;
    hmo_name: string;
    hmo_company_id_no: string;
    validation_approval_code: string;
    validity: string;

    // Medical History & Allergies
    drug_allergies: string;
    food_allergies: string;
    past_medical_history: string;
    family_history: string;
    social_personal_history: string;
    obstetrics_gynecology_history: string;
}

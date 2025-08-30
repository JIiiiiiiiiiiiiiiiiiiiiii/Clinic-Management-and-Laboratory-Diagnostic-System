-- Clinic Management System Database Setup
-- This script creates the database and all necessary tables

-- Drop and recreate the database (USE WITH EXTREME CAUTION IN PRODUCTION!)
DROP DATABASE IF EXISTS clinic_management_system;
CREATE DATABASE clinic_management_system;
USE clinic_management_system;

-- Users table (Roles: Admin, Staff, Doctor, LaboratoryTech, Patient)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    role ENUM('Admin', 'Staff', 'Doctor', 'LaboratoryTech', 'Patient') NOT NULL,
    gender ENUM('Male', 'Female', 'Other'),
    contact_number VARCHAR(20),
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    birth_date DATE,
    email_verified_at DATETIME NULL,
    remember_token VARCHAR(100) NULL
);

-- Patients table (1-to-1 with Users)
CREATE TABLE patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    gender ENUM('Male', 'Female', 'Other'),
    birth_date DATE,
    contact_info VARCHAR(100),
    address TEXT,
    user_id INT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Appointment slots table
CREATE TABLE appointment_slots (
    slot_id INT AUTO_INCREMENT PRIMARY KEY,
    start_time DATETIME,
    end_time DATETIME,
    is_available TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    scheduled_by_user_id INT,
    scheduled_by_role ENUM('Patient', 'Staff', 'Doctor', 'System') NOT NULL,
    appointment_date_time DATETIME,
    status ENUM('Requested', 'Scheduled', 'Confirmed', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    reason TEXT,
    checked_in_at DATETIME NULL,
    completed_at DATETIME NULL,
    slot_id INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (scheduled_by_user_id) REFERENCES users(user_id),
    FOREIGN KEY (slot_id) REFERENCES appointment_slots(slot_id)
);

-- Consultations table
CREATE TABLE consultations (
    consultation_id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT UNIQUE,
    doctor_id INT,
    consultation_date_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    diagnosis TEXT,
    prescription TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
    FOREIGN KEY (doctor_id) REFERENCES users(user_id)
);

-- Laboratory Tests catalog
CREATE TABLE laboratory_tests (
    test_id INT AUTO_INCREMENT PRIMARY KEY,
    test_name VARCHAR(100),
    description TEXT,
    price DECIMAL(10, 2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Laboratory Requests table
CREATE TABLE laboratory_requests (
    laboratory_request_id INT AUTO_INCREMENT PRIMARY KEY,
    consultation_id INT,
    test_id INT,
    requested_by_user_id INT,
    request_date DATE DEFAULT CURRENT_DATE,
    sample_collected_date DATE NULL,
    result_date DATE DEFAULT NULL,
    status ENUM(
        'Requested',
        'Sample Collected',
        'Processing',
        'Completed',
        'Released',
        'Billed',
        'Cancelled'
    ) DEFAULT 'Requested',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consultation_id) REFERENCES consultations(consultation_id),
    FOREIGN KEY (test_id) REFERENCES laboratory_tests(test_id),
    FOREIGN KEY (requested_by_user_id) REFERENCES users(user_id)
);

-- CBC Results
CREATE TABLE cbc_results (
    cbc_result_id INT AUTO_INCREMENT PRIMARY KEY,
    laboratory_request_id INT UNIQUE,
    hemoglobin DECIMAL(10, 2),
    hematocrit DECIMAL(10, 2),
    white_blood_cell DECIMAL(10, 2),
    red_blood_cell DECIMAL(10, 2),
    platelet_count INT,
    segmenters DECIMAL(5, 2),
    lymphocytes DECIMAL(5, 2),
    mixed DECIMAL(5, 2),
    mcv DECIMAL(10, 2),
    mch DECIMAL(10, 2),
    mchc DECIMAL(10, 2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (laboratory_request_id) REFERENCES laboratory_requests(laboratory_request_id)
);

-- Urinalysis Results
CREATE TABLE urinalysis_results (
    urinalysis_result_id INT AUTO_INCREMENT PRIMARY KEY,
    laboratory_request_id INT UNIQUE,
    color VARCHAR(50),
    transparency VARCHAR(50),
    specific_gravity DECIMAL(10, 3),
    ph DECIMAL(10, 1),
    albumin VARCHAR(50),
    glucose VARCHAR(50),
    ketone VARCHAR(50),
    bile VARCHAR(50),
    urobilinogen VARCHAR(50),
    blood VARCHAR(50),
    white_blood_cell INT,
    red_blood_cell INT,
    casts VARCHAR(50),
    crystals VARCHAR(50),
    epithelial_cells VARCHAR(50),
    bacteria VARCHAR(50),
    mucus_threads VARCHAR(50),
    others VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (laboratory_request_id) REFERENCES laboratory_requests(laboratory_request_id)
);

-- Fecalysis Results
CREATE TABLE fecalysis_results (
    fecalysis_result_id INT AUTO_INCREMENT PRIMARY KEY,
    laboratory_request_id INT UNIQUE,
    color VARCHAR(50),
    consistency VARCHAR(50),
    parasites VARCHAR(255),
    ova VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (laboratory_request_id) REFERENCES laboratory_requests(laboratory_request_id)
);

-- Inventory table
CREATE TABLE inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(100),
    description TEXT,
    category VARCHAR(50),
    quantity INT DEFAULT 0,
    unit VARCHAR(20),
    added_date DATE DEFAULT CURRENT_DATE,
    expiration_date DATE NULL,
    storage_instructions TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Logs
CREATE TABLE inventory_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    inventory_id INT,
    user_id INT,
    quantity_changed INT,
    change_type ENUM('Add', 'Remove'),
    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Billing table
CREATE TABLE billing (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    billing_date DATE,
    total_amount DECIMAL(10, 2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);

-- Billing Items
CREATE TABLE billing_items (
    billing_item_id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT,
    consultation_id INT NULL,
    laboratory_request_id INT NULL,
    description VARCHAR(255),
    amount DECIMAL(10, 2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES billing(bill_id),
    FOREIGN KEY (consultation_id) REFERENCES consultations(consultation_id),
    FOREIGN KEY (laboratory_request_id) REFERENCES laboratory_requests(laboratory_request_id)
);

-- Payments table
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT,
    payment_date DATE,
    amount DECIMAL(10, 2),
    payment_method VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES billing(bill_id)
);

-- Custom Clinical Records
CREATE TABLE custom_clinical_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    record_name VARCHAR(100),
    description TEXT,
    fields JSON,
    created_by_user_id INT,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user_id) REFERENCES users(user_id)
);

-- Custom Clinical Record Values
CREATE TABLE custom_clinical_record_values (
    value_id INT AUTO_INCREMENT PRIMARY KEY,
    custom_clinical_record_id INT,
    patient_id INT,
    consultation_id INT NULL,
    field_values JSON,
    recorded_by_user_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (custom_clinical_record_id) REFERENCES custom_clinical_records(record_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (consultation_id) REFERENCES consultations(consultation_id),
    FOREIGN KEY (recorded_by_user_id) REFERENCES users(user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointment_slots_date ON appointment_slots(start_time);
CREATE INDEX idx_appointment_slots_available ON appointment_slots(is_available);
CREATE INDEX idx_consultations_appointment_id ON consultations(appointment_id);
CREATE INDEX idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX idx_laboratory_requests_consultation_id ON laboratory_requests(consultation_id);
CREATE INDEX idx_laboratory_requests_status ON laboratory_requests(status);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_expiration ON inventory(expiration_date);
CREATE INDEX idx_billing_patient_id ON billing(patient_id);
CREATE INDEX idx_billing_date ON billing(billing_date);

-- Insert sample data
INSERT INTO users (username, password, full_name, email, role, gender, contact_number, address) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin@clinic.com', 'Admin', 'Other', '1234567890', '123 Admin Street'),
('staff', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Clinic Staff', 'staff@clinic.com', 'Staff', 'Female', '1234567891', '123 Staff Street'),
('doctor', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. John Smith', 'doctor@clinic.com', 'Doctor', 'Male', '1234567892', '123 Doctor Street'),
('labtech', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lab Technician', 'labtech@clinic.com', 'LaboratoryTech', 'Female', '1234567893', '123 Lab Street'),
('patient', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe', 'patient@clinic.com', 'Patient', 'Male', '1234567894', '123 Patient Street');

-- Insert sample patient
INSERT INTO patients (first_name, last_name, gender, birth_date, contact_info, address, user_id) VALUES
('John', 'Doe', 'Male', '1990-01-01', '1234567894', '123 Patient Street', 5);

-- Insert sample laboratory tests
INSERT INTO laboratory_tests (test_name, description, price) VALUES
('Complete Blood Count (CBC)', 'Complete blood count including hemoglobin, hematocrit, white blood cells, red blood cells, and platelets', 500.00),
('Urinalysis', 'Urine analysis including physical, chemical, and microscopic examination', 300.00),
('Fecalysis', 'Stool examination for parasites and other abnormalities', 250.00),
('Blood Sugar (FBS)', 'Fasting blood sugar test for diabetes screening', 200.00),
('Cholesterol Panel', 'Complete cholesterol profile including HDL, LDL, and triglycerides', 400.00);

-- Insert sample inventory items
INSERT INTO inventory (item_name, description, category, quantity, unit, expiration_date, storage_instructions) VALUES
('Paracetamol 500mg', 'Pain reliever and fever reducer', 'Medication', 1000, 'tablets', DATE_ADD(CURDATE(), INTERVAL 2 YEAR), 'Store in a cool, dry place'),
('Syringes 5ml', 'Disposable syringes for injections', 'Medical Supplies', 500, 'pieces', DATE_ADD(CURDATE(), INTERVAL 3 YEAR), 'Store in sterile packaging'),
('Gauze Bandages', 'Sterile gauze bandages for wound care', 'Medical Supplies', 200, 'rolls', DATE_ADD(CURDATE(), INTERVAL 5 YEAR), 'Keep dry and clean'),
('Blood Collection Tubes', 'Vacutainer tubes for blood collection', 'Laboratory Supply', 300, 'pieces', DATE_ADD(CURDATE(), INTERVAL 2 YEAR), 'Store at room temperature');

-- Create appointment slots for the next 7 days
INSERT INTO appointment_slots (start_time, end_time, is_available)
SELECT
    DATE_ADD(CURDATE(), INTERVAL n DAY) + INTERVAL h HOUR,
    DATE_ADD(CURDATE(), INTERVAL n DAY) + INTERVAL h HOUR + INTERVAL 30 MINUTE,
    1
FROM (
    SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
) days
CROSS JOIN (
    SELECT 9 as h UNION SELECT 10 UNION SELECT 11 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16
) hours
UNION ALL
SELECT
    DATE_ADD(CURDATE(), INTERVAL n DAY) + INTERVAL h HOUR + INTERVAL 30 MINUTE,
    DATE_ADD(CURDATE(), INTERVAL n DAY) + INTERVAL h HOUR + INTERVAL 1 HOUR,
    1
FROM (
    SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
) days
CROSS JOIN (
    SELECT 9 as h UNION SELECT 10 UNION SELECT 11 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16
) hours;

-- Display success message
SELECT 'Clinic Management System database setup completed successfully!' as message;
SELECT 'Default users created with password: password' as note;
SELECT 'Admin: admin, Staff: staff, Doctor: doctor, Lab Tech: labtech, Patient: patient' as users;

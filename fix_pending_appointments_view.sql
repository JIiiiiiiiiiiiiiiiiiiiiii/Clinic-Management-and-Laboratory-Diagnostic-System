-- Fix the pending_appointments view to use correct column names
DROP VIEW IF EXISTS pending_appointments;

CREATE VIEW pending_appointments AS 
SELECT 
    a.id AS id,
    a.id AS appointment_id,
    CONCAT('A', LPAD(a.id, 4, '0')) AS appointment_code,
    a.patient_id,
    a.specialist_id,
    a.appointment_type,
    a.specialist_type,
    a.appointment_date,
    a.appointment_time,
    a.duration,
    a.price,
    a.status,
    a.status AS status_approval,
    a.notes AS admin_notes,
    a.created_at,
    a.updated_at,
    p.patient_no AS patient_code,
    CONCAT(p.last_name, ', ', p.first_name, ' ', COALESCE(p.middle_name, '')) AS patient_name,
    p.mobile_no AS patient_mobile,
    p.telephone_no AS patient_email,
    s.name AS specialist_name,
    s.specialist_id AS specialist_code
FROM appointments a 
LEFT JOIN patients p ON a.patient_id = p.id 
LEFT JOIN specialists s ON a.specialist_id = s.specialist_id 
WHERE a.status = 'Pending';
